const express = require('express');
const app = express();
app.use(express.json({ limit: '20mb' }));

const status = {
  canvas:  { ok: false, error: null },
  fonts:   { ok: false, error: null },
  startup: new Date().toISOString(),
};

// ── Try loading canvas ─────────────────────────────────────────────────────
let createCanvas, GlobalFonts, loadImage;
try {
  const c = require('@napi-rs/canvas');
  createCanvas = c.createCanvas;
  GlobalFonts  = c.GlobalFonts;
  loadImage    = c.loadImage;
  status.canvas.ok = true;
} catch(e) {
  status.canvas.error = e.message;
}

// ── Try loading fonts ──────────────────────────────────────────────────────
const fs   = require('fs');
const path = require('path');
const https = require('https');

const FONT_DIR = '/tmp/ara-fonts';
const FONTS = [
  {
    url: 'https://fonts.gstatic.com/s/firasans/v17/va9E4kDNxMZdWfMOD5VvkrjFYTM.woff2',
    file: 'FiraSans-Regular.woff2',
    family: 'Fira Sans', weight: '400',
  },
  {
    url: 'https://fonts.gstatic.com/s/firasans/v17/va9B4kDNxMZdWfMOD5VnZKveRhf6.woff2',
    file: 'FiraSans-Bold.woff2',
    family: 'Fira Sans', weight: '700',
  },
];

function dlFont(font) {
  return new Promise((res, rej) => {
    const dest = path.join(FONT_DIR, font.file);
    if (fs.existsSync(dest)) return res(dest);
    const f = fs.createWriteStream(dest);
    https.get(font.url, r => {
      r.pipe(f);
      f.on('finish', () => { f.close(); res(dest); });
    }).on('error', rej);
  });
}

async function initFonts() {
  fs.mkdirSync(FONT_DIR, { recursive: true });
  for (const f of FONTS) {
    const p = await dlFont(f);
    if (GlobalFonts) GlobalFonts.registerFromPath(p, f.family);
  }
  status.fonts.ok = true;
}

// ── Routes ─────────────────────────────────────────────────────────────────
app.get('/', (req, res) => {
  res.json({ status: 'ok', message: 'ARA Render Service is running.' });
});

app.get('/health', (req, res) => {
  const nodeModulesPath = path.join(__dirname, 'node_modules');
  let installedModules = [];
  try {
    installedModules = fs.readdirSync(nodeModulesPath);
  } catch(e) {
    installedModules = ['ERROR: ' + e.message];
  }
  res.json({
    uptime:    process.uptime(),
    node:      process.version,
    platform:  process.platform,
    arch:      process.arch,
    dirname:   __dirname,
    status,
    installedModules,
  });
});

// ── Startup ────────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 3000;

initFonts()
  .then(() => console.log('[startup] fonts ok'))
  .catch(e => { status.fonts.error = e.message; console.error('[startup] fonts failed:', e.message); });

app.listen(PORT, () => {
  console.log(`ARA Render Service listening on port ${PORT}`);
});
