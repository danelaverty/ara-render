const VERSION = '4.3.0';
const express = require('express');
const app = express();
app.use(express.json({ limit: '20mb' }));

// ── Canvas ─────────────────────────────────────────────────────────────────
let createCanvas, GlobalFonts, loadImage;
try {
  const c = require('@napi-rs/canvas');
  createCanvas = c.createCanvas;
  GlobalFonts  = c.GlobalFonts;
  loadImage    = c.loadImage;
  console.log('[canvas] loaded ok');
} catch(e) { console.error('[canvas] FAILED:', e.message); }

const fs    = require('fs');
const path  = require('path');
const https = require('https');
const http  = require('http');

// ── Fonts ──────────────────────────────────────────────────────────────────
const PHOTOS_DIR = '/home/u903000087/domains/mediumpurple-butterfly-714997.hostingersite.com/photos';
const FONTS = [
  { url: 'https://fonts.gstatic.com/s/firasans/v17/va9E4kDNxMZdWfMOD5VvkrjFYTM.woff2',   file: 'FiraSans-Regular.woff2', family: 'Fira Sans' },
  { url: 'https://fonts.gstatic.com/s/firasans/v17/va9B4kDNxMZdWfMOD5VnZKveRhf6.woff2',   file: 'FiraSans-Bold.woff2',    family: 'Fira Sans' },
  { url: 'https://fonts.gstatic.com/s/playfairdisplay/v37/nuFvD-vYSZviVYUb_rj3ij__anPXJzDwcbmjWBN2PKdFvXDXbtY.woff2', file: 'Playfair-Regular.woff2', family: 'Playfair Display' },
];

function dlFont(font) {
  return new Promise((res, rej) => {
    const dest = path.join(FONT_DIR, font.file);
    if (fs.existsSync(dest)) { console.log('[font] cached:', font.file); return res(dest); }
    console.log('[font] downloading:', font.file);
    const f = fs.createWriteStream(dest);
    https.get(font.url, r => { r.pipe(f); f.on('finish', () => { f.close(); res(dest); }); }).on('error', rej);
  });
}

let fontsReady = false;
async function initFonts() {
  fs.mkdirSync(FONT_DIR, { recursive: true });
  for (const f of FONTS) {
    const p = await dlFont(f);
    if (GlobalFonts) GlobalFonts.registerFromPath(p, f.family);
  }
  fontsReady = true;
  console.log('[fonts] all ready');
}

// ── Colour helpers ─────────────────────────────────────────────────────────
function hexToRgb(hex) {
  const h = hex.replace('#','');
  return { r: parseInt(h.slice(0,2),16), g: parseInt(h.slice(2,4),16), b: parseInt(h.slice(4,6),16) };
}
function rgba(hex, a) {
  const {r,g,b} = hexToRgb(hex);
  return `rgba(${r},${g},${b},${a})`;
}

// ── Fetch image from URL ───────────────────────────────────────────────────
function fetchBuffer(url) {
  return new Promise((res, rej) => {
    const mod = url.startsWith('https') ? https : http;
    mod.get(url, r => {
      const chunks = [];
      r.on('data', c => chunks.push(c));
      r.on('end', () => res(Buffer.concat(chunks)));
      r.on('error', rej);
    }).on('error', rej);
  });
}

// ── Text helpers ───────────────────────────────────────────────────────────
function wrapText(ctx, text, maxWidth) {
  if (!text) return [];
  const words = text.split(' ');
  const lines = [];
  let cur = '';
  for (const w of words) {
    const test = cur ? cur + ' ' + w : w;
    if (ctx.measureText(test).width > maxWidth && cur) { lines.push(cur); cur = w; }
    else cur = test;
  }
  if (cur) lines.push(cur);
  return lines;
}

function drawLinesWithBG(ctx, lines, x, y, lineH, textColor, bgColor) {
  for (const line of lines) {
    const w = ctx.measureText(line).width;
    ctx.fillStyle = bgColor;
    ctx.fillRect(x - 6, y - lineH * 0.82, w + 12, lineH * 1.08);
    ctx.fillStyle = textColor;
    ctx.fillText(line, x, y);
    y += lineH;
  }
  return y;
}

function drawLines(ctx, lines, x, y, lineH, textColor) {
  ctx.fillStyle = textColor;
  for (const line of lines) { ctx.fillText(line, x, y); y += lineH; }
  return y;
}

// ── Cover-fit image ────────────────────────────────────────────────────────
function coverParams(imgW, imgH, frameW, frameH, panX, panY) {
  const scale = Math.max(frameW / imgW, frameH / imgH);
  const dW = imgW * scale, dH = imgH * scale;
  return { dx: -(panX/100)*(dW-frameW), dy: -(panY/100)*(dH-frameH), dW, dH };
}

// ── Clip helpers ───────────────────────────────────────────────────────────
function clipCircle(ctx, cx, cy, r) {
  ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI*2); ctx.clip();
}
function clipRounded(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x+r,y); ctx.lineTo(x+w-r,y); ctx.quadraticCurveTo(x+w,y,x+w,y+r);
  ctx.lineTo(x+w,y+h-r); ctx.quadraticCurveTo(x+w,y+h,x+w-r,y+h);
  ctx.lineTo(x+r,y+h); ctx.quadraticCurveTo(x,y+h,x,y+h-r);
  ctx.lineTo(x,y+r); ctx.quadraticCurveTo(x,y,x+r,y); ctx.closePath(); ctx.clip();
}

// ── Diamond symbol (font-independent) ─────────────────────────────────────
function drawDiamond(ctx, cx, cy, size, color) {
  ctx.save();
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(cx,        cy - size);
  ctx.lineTo(cx + size, cy);
  ctx.lineTo(cx,        cy + size);
  ctx.lineTo(cx - size, cy);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

// ── Main render ────────────────────────────────────────────────────────────
async function renderFP(data) {
  console.log('[render] start, practice:', data.practice || data.name || 'unknown');

  const {
    name          = '',
    practice      = '',
    instagram     = '',
    city          = '',
    state         = '',
    epithet       = '',
    question      = '',
    answer        = '',
    bgColor       = '#f5efe8',
    accentColor   = '#9b7b6e',
    textColor     = '#3a2e28',
    textBGAlpha   = 0.5,
    mainTextWidth = 210,
    mainTextTop   = 20,
    bodyTextTop   = 0,
    bodyTextLeft  = 0,
    fontSize      = 1.45,
    titleFontSize = 2.85,
    imagePanX     = 50,
    imagePanY     = 50,
    photoPath     = null,
    photoUrl      = null,
    photoData     = null,
    photoShape    = 'circle',
  } = data;

  const W = 540, H = 675, PAD = 54;
  const textBG = rgba(bgColor, textBGAlpha);
  const canvas = createCanvas(W, H);
  const ctx    = canvas.getContext('2d');

  // ── 1. Background ──────────────────────────────────────────────────────
  ctx.fillStyle = bgColor;
  ctx.fillRect(0, 0, W, H);

  // ── 2. Soft Orbs ───────────────────────────────────────────────────────
  const drawOrb = (cx, cy, r) => {
    const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, r);
    g.addColorStop(0,   rgba(accentColor, 0.22));
    g.addColorStop(0.5, rgba(accentColor, 0.14));
    g.addColorStop(1,   rgba(accentColor, 0));
    ctx.fillStyle = g;
    ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI*2); ctx.fill();
  };
  drawOrb(W + 80 - 160, -80 + 160, 160);
  drawOrb(-60 + 100, H + 60 - 100, 100);

  // ── 3. Photo (drawn before text so text renders on top) ────────────────
  // Photo circle: radius 220, right edge flush with canvas, top edge ~20px from top
  // Center: (540-220, 20+220) = (320, 240)
  const PS = 440, PX = W - PS + 20, PY = 40;
  let photoSrc = photoData || null;

  if (!photoSrc && photoPath) {
    console.log('[photo] reading:', photoPath);
    try { photoSrc = fs.readFileSync(photoPath); console.log('[photo] read ok, bytes:', photoSrc.length); }
    catch(e) { console.warn('[photo] read failed:', e.message); }
  }
  if (!photoSrc && photoUrl) {
    console.log('[photo] fetching:', photoUrl);
    try { photoSrc = await fetchBuffer(photoUrl); console.log('[photo] fetch ok, bytes:', photoSrc.length); }
    catch(e) { console.warn('[photo] fetch failed:', e.message); }
  }
  if (!photoSrc) console.warn('[photo] no photo source');

  if (photoSrc) {
    try {
      const img = await loadImage(photoSrc);
      console.log('[photo] loaded:', img.width, 'x', img.height);
      ctx.save();
      if      (photoShape === 'circle')  clipCircle(ctx, PX+PS/2, PY+PS/2, PS/2);
      else if (photoShape === 'rounded') clipRounded(ctx, PX, PY, PS, PS, 14);
      else { ctx.beginPath(); ctx.rect(PX, PY, PS, PS); ctx.clip(); }
      const { dx, dy, dW, dH } = coverParams(img.width, img.height, PS, PS, Number(imagePanX), Number(imagePanY));
      ctx.drawImage(img, PX+dx, PY+dy, dW, dH);
      ctx.restore();
      console.log('[photo] drawn ok');
    } catch(e) { console.warn('[photo] draw failed:', e.message); }
  }

  // ── 4. Title block (renders over photo) ───────────────────────────────
  const TX = 22;
  let TY = 15;

  // Supersupertitle — with BG so legible over photo
  ctx.font = '400 16px sans-serif';
  const sstText = 'American Reiki Association Featured Practice';
  const sstW    = ctx.measureText(sstText).width;
  ctx.fillStyle = textBG;
  ctx.fillRect(TX - 6, TY, sstW + 12, 20);
  ctx.fillStyle = rgba(accentColor, 0.9);
  ctx.fillText(sstText, TX, TY + 15);
  TY += 28;

  // Practice name
  const titlePx = Math.round(Number(titleFontSize) * 16);
  ctx.font = `700 ${titlePx}px "Fira Sans"`;
  const titleLines = wrapText(ctx, practice || name, W - TX * 2);
  for (const line of titleLines) {
    const lw = ctx.measureText(line).width;
    ctx.fillStyle = textBG;
    ctx.fillRect(TX - 6, TY - titlePx*0.82, lw+12, titlePx*1.1);
    ctx.fillStyle = textColor;
    ctx.fillText(line, TX, TY);
    TY += titlePx * 1.25;
  }
  TY += 4;

  // Subtitle (name — city, state)
  ctx.font = `700 29px "Fira Sans"`;
  const subText  = practice ? `${name} \u2013 ${city}, ${state}` : `${city}, ${state}`;
  const subLines = wrapText(ctx, subText, 340);
  for (const line of subLines) {
    const lw = ctx.measureText(line).width;
    ctx.fillStyle = textBG;
    ctx.fillRect(TX - 6, TY - 23.8, lw+12, 31.9);
    ctx.fillStyle = rgba(textColor, 0.9);
    ctx.fillText(line, TX, TY);
    TY += 35;
  }
  TY += 8;

  // ── 5. Details list ────────────────────────────────────────────────────
  const DX = TX + 37;
  let DY = TY + 8;
  ctx.font = `400 16px "Fira Sans"`;
  const details = [
    instagram ? '@' + instagram.replace(/^@/,'') : null,
    epithet || null,
  ].filter(Boolean);
  for (const d of details) {
    const lw = ctx.measureText(d).width;
    ctx.fillStyle = textBG;
    ctx.fillRect(DX-6, DY-13, lw+12, 18);
    ctx.fillStyle = textColor;
    ctx.fillText(d, DX, DY);
    DY += 22;
  }

  // Diamond symbol
  const symCY = DY + 18;
  drawDiamond(ctx, TX + 70, symCY, 9, rgba(accentColor, 0.7));
  const symY = symCY;

  // ── 6. Main text (question) ────────────────────────────────────────────
  const mainFontPx = 24;
  ctx.font = `700 ${mainFontPx}px "Fira Sans"`;
  const mainX     = PAD + 20;
  const mainY     = symY + Number(mainTextTop);
  const qText     = question ? '\u201C' + question + '\u201D' : '';
  const mainLines = wrapText(ctx, qText, Number(mainTextWidth));
  let curY = mainY;
  for (const line of mainLines) {
    const lw = ctx.measureText(line).width;
    ctx.fillStyle = textBG;
    ctx.fillRect(mainX-6, curY-mainFontPx*0.82, lw+12, mainFontPx*1.1);
    ctx.fillStyle = textColor;
    ctx.fillText(line, mainX, curY);
    curY += mainFontPx * 1.3;
  }

  // ── 7. Body text (answer) ──────────────────────────────────────────────
  const bodyFontPx = Math.round(Number(fontSize) * 16);
  ctx.font = `400 ${bodyFontPx}px "Fira Sans"`;
  const bodyX     = PAD + 20 + Number(bodyTextLeft);
  const bodyMaxW  = W - bodyX - 20;
  const aText     = answer ? '\u201C' + answer + '\u201D' : '';
  const bodyLines = wrapText(ctx, aText, bodyMaxW);
  let bodyY = curY + 12 + Number(bodyTextTop);
  drawLines(ctx, bodyLines, bodyX, bodyY, bodyFontPx * 1.4, textColor);

  // ── 8. Footer ──────────────────────────────────────────────────────────
  ctx.font      = `700 13px sans-serif`;
  ctx.fillStyle = rgba(accentColor, 0.85);
  ctx.textAlign = 'center';
  ctx.fillText('@americanreikiassociation', W/2, H-15);
  ctx.textAlign = 'left';

  console.log('[render] complete');
  return canvas.encode('png');
}

// ── Routes ─────────────────────────────────────────────────────────────────
app.get('/', (req, res) => {
  res.json({ status: 'ok', version: VERSION, message: 'ARA Render Service is running.' });
});

app.get('/health', (req, res) => {
  res.json({ version: VERSION, uptime: process.uptime(), node: process.version, fontsReady, canvas: !!createCanvas });
});

app.post('/render-test', async (req, res) => {
  try {
    if (!createCanvas) throw new Error('canvas not loaded');
    const canvas = createCanvas(540, 675);
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#f5efe8';
    ctx.fillRect(0, 0, 540, 675);
    ctx.fillStyle = '#9b7b6e';
    ctx.font = `bold 40px "Fira Sans"`;
    ctx.fillText(`ARA Render Test v${VERSION}`, 40, 100);
    ctx.font = `24px "Fira Sans"`;
    ctx.fillText('Canvas is working!', 40, 160);
    const png = await canvas.encode('png');
    res.set('Content-Type', 'image/png');
    res.send(png);
  } catch(e) { res.status(500).json({ error: e.message }); }
});

app.post('/render', async (req, res) => {
  try {
    if (!createCanvas) throw new Error('canvas not loaded');
    if (!fontsReady)   throw new Error('fonts not ready yet — try again in a moment');
    const png = await renderFP(req.body);
    res.set('Content-Type', 'image/png');
    res.send(png);
  } catch(e) {
    console.error('[/render] error:', e.message);
    res.status(500).json({ error: e.message });
  }
});

// ── Startup ────────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 3000;
initFonts().catch(e => console.error('[fonts] init failed:', e.message));
app.listen(PORT, () => console.log(`ARA Render Service v${VERSION} listening on port ${PORT}`));
