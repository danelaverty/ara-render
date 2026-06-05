const VERSION = '2.0.2';
const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { spawn } = require('child_process');

const puppeteerCacheDir = path.join(__dirname, '.cache', 'puppeteer');
process.env.PUPPETEER_CACHE_DIR = process.env.PUPPETEER_CACHE_DIR || puppeteerCacheDir;
fs.mkdirSync(process.env.PUPPETEER_CACHE_DIR, { recursive: true });

const puppeteer = require('puppeteer');

const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// ── Photo upload (ephemeral — survives long enough to render) ─────────────
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = path.join(__dirname, 'public', 'images');
    fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname);
  },
});
const upload = multer({ storage });

app.post('/upload', upload.single('photo'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file received' });
  res.json({ ok: true, filename: req.file.filename });
});

// ── Inject ara-key.js from environment variables ──────────────────────────
// This runs once at startup and writes a real ara-key.js into public/
function writeAraKey() {
  const key = process.env.SHEETS_API_KEY || '';
  const url = process.env.SHEETS_WRITE_URL || '';
  const content = `const SHEETS_API_KEY = ${JSON.stringify(key)};\nconst SHEETS_WRITE_URL = ${JSON.stringify(url)};\n`;
  fs.writeFileSync(path.join(__dirname, 'public', 'ara-key.js'), content);
  console.log('[ara-key] written');
}

async function ensureChromiumInstalled() {
  try {
    const execPath = puppeteer.executablePath && puppeteer.executablePath();
    if (execPath && fs.existsSync(execPath)) {
      console.log('[puppeteer] already installed at', execPath);
      return;
    }
  } catch (err) {
    console.log('[puppeteer] execPath check failed:', err.message || err);
  }

  console.log('[puppeteer] installing Chrome into cache:', process.env.PUPPETEER_CACHE_DIR);
  await new Promise((resolve, reject) => {
    const installScript = path.join(__dirname, 'node_modules', 'puppeteer', 'install.mjs');
    const child = spawn(process.execPath, [installScript], { stdio: 'inherit' });
    child.on('close', code => {
      if (code === 0) return resolve();
      reject(new Error(`puppeteer install failed with exit code ${code}`));
    });
    child.on('error', reject);
  });
}

// ── Fetch practitioner list from Google Sheets ────────────────────────────
async function fetchPractitioners() {
  const id  = '1o2Gdnux3pBPYBOQqbPttFHHHavsz5MkLr59QgwHYFLE';
  const key = process.env.SHEETS_API_KEY;
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${id}/values/Sheet1?key=${key}`;
  const res  = await fetch(url);
  const data = await res.json();
  if (data.error) throw new Error(data.error.message);

  const rows    = data.values;
  const headers = rows[0].map(h => h.trim().toLowerCase());
  const col     = k => headers.indexOf(k.toLowerCase());

  const cols = ['araid','name','practice','instagram','city','state','epithet',
    'spotlight question','spotlight answer','color theme','image file',
    'decorative style','main text width','main text top','body text top',
    'body text left','font size','title font size','image pan x','image pan y',
    'subtitle separate'].map(col);

  return rows.slice(1).map(r => ({
    araid:           r[cols[0]]  || '',
    name:            r[cols[1]]  || '',
    practice:        r[cols[2]]  || '',
    instagram:       r[cols[3]]  || '',
    city:            r[cols[4]]  || '',
    state:           r[cols[5]]  || '',
    epithet:         r[cols[6]]  || '',
    question:        r[cols[7]]  || '',
    answer:          r[cols[8]]  || '',
    theme:           r[cols[9]]  || '',
    imageFile:       r[cols[10]] || '',
    decor:           r[cols[11]] || '',
    mainTextWidth:   r[cols[12]] || '',
    mainTextTop:     r[cols[13]] || '',
    bodyTextTop:     r[cols[14]] || '',
    bodyTextLeft:    r[cols[15]] || '',
    fontSize:        r[cols[16]] || '',
    titleFontSize:   r[cols[17]] || '',
    imagePanX:       r[cols[18]] || '',
    imagePanY:       r[cols[19]] || '',
    subtitleSeparate:r[cols[20]] || '',
  })).filter(p => p.araid);
}

// ── Render a practitioner to PNG via Puppeteer ────────────────────────────
async function renderPractitioner(p) {
  let browser;
  const launchOpts = {
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
  };

  try {
    console.log('[puppeteer] launching with options:', JSON.stringify(launchOpts));
    if (typeof puppeteer.executablePath === 'function') {
      try { console.log('[puppeteer] exec path hint:', puppeteer.executablePath()); } catch (e) {}
    }

    browser = await puppeteer.launch(launchOpts);
    console.log('[puppeteer] launched');

    const page = await browser.newPage();
    await page.setViewport({ width: 540, height: 675 });

    // Load the editor
    const editorUrl = `http://localhost:${PORT}/`;
    await page.goto(editorUrl, { waitUntil: 'networkidle0', timeout: 30000 });

    // Inject the practitioner data
    await page.evaluate((practitioner) => {
      applyPractitionerToFP(practitioner);
    }, p);

    // Wait for fonts and photo to load
    await page.waitForFunction(() => {
      const img = document.querySelector('#photo-wrap img, #photo-wrap canvas');
      return document.fonts.ready.then(() => true);
    }, { timeout: 10000 });

    // Extra settle time for canvas redraws
    await new Promise(r => setTimeout(r, 1500));

    // Screenshot just the post canvas
    const el = await page.$('#post-canvas');
    const png = await el.screenshot({ type: 'png' });
    return png;

  } catch (err) {
    console.error('[puppeteer] launch/render error:', err && err.stack ? err.stack : err);
    throw err;
  } finally {
    if (browser) {
      try {
        await browser.close();
      } catch (closeErr) {
        console.error('[puppeteer] error closing browser:', closeErr && closeErr.stack ? closeErr.stack : closeErr);
      }
    }
  }
}

// ── Routes ────────────────────────────────────────────────────────────────
app.get('/', (req, res) => {
  // If the request wants JSON (API call), return status
  if (req.accepts('json') && !req.accepts('html')) {
    return res.json({ status: 'ok', version: VERSION });
  }
  // Otherwise serve the editor (handled by static middleware above)
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/health', (req, res) => {
  res.json({ version: VERSION, uptime: process.uptime() });
});

// List all practitioners (for the mobile picker UI)
app.get('/practitioners', async (req, res) => {
  try {
    const list = await fetchPractitioners();
    res.json(list.map(p => ({
      araid:    p.araid,
      name:     p.name,
      practice: p.practice,
      city:     p.city,
      state:    p.state,
    })));
  } catch(e) {
    res.status(500).json({ error: e.message });
  }
});

// Render a single practitioner by ARAID (GET for browser testing, POST for API)
async function renderRoute(req, res) {
  try {
    const list = await fetchPractitioners();
    const p    = list.find(x => String(x.araid) === String(req.params.araid));
    if (!p) return res.status(404).json({ error: 'Practitioner not found' });

    console.log(`[render] starting: #${p.araid} — ${p.practice || p.name}`);
    const png = await renderPractitioner(p);
    console.log(`[render] done: ${png.length} bytes`);

    res.set('Content-Type', 'image/png');
    res.send(png);
  } catch(e) {
    console.error('[render] error:', e.message);
    res.status(500).json({ error: e.message });
  }
}
app.get('/render/:araid',  renderRoute);
app.post('/render/:araid', renderRoute);

// ── Startup ───────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 3000;

async function start() {
  writeAraKey();
  await ensureChromiumInstalled();
  app.listen(PORT, () => console.log(`ARA Render Service v${VERSION} on port ${PORT}`));
}

start().catch(err => {
  console.error('[startup] fatal error:', err && err.stack ? err.stack : err);
  process.exit(1);
});
