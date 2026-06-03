const express  = require('express');
const { createCanvas, registerFont, loadImage } = require('canvas');
const axios    = require('axios');
const fs       = require('fs');
const path     = require('path');
const https    = require('https');

const app = express();
app.use(express.json({ limit: '20mb' }));

// ── Fonts ──────────────────────────────────────────────────────────────────
// Downloaded once to /tmp at startup; registerFont called after download.
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
  {
    url: 'https://fonts.gstatic.com/s/playfairdisplay/v37/nuFvD-vYSZviVYUb_rj3ij__anPXJzDwcbmjWBN2PKdFvXDXbtY.woff2',
    file: 'PlayfairDisplay-Regular.woff2',
    family: 'Playfair Display', weight: '400',
  },
];

function dlFont(font) {
  return new Promise((res, rej) => {
    const dest = path.join(FONT_DIR, font.file);
    if (fs.existsSync(dest)) return res(dest);
    const f = fs.createWriteStream(dest);
    https.get(font.url, r => { r.pipe(f); f.on('finish', () => { f.close(); res(dest); }); }).on('error', rej);
  });
}

async function initFonts() {
  fs.mkdirSync(FONT_DIR, { recursive: true });
  for (const f of FONTS) {
    const p = await dlFont(f);
    registerFont(p, { family: f.family, weight: f.weight });
    console.log('[fonts] registered', f.family, f.weight);
  }
}

// ── Colour helpers ─────────────────────────────────────────────────────────
function hexToRgb(hex) {
  const h = hex.replace('#', '');
  return {
    r: parseInt(h.slice(0,2),16),
    g: parseInt(h.slice(2,4),16),
    b: parseInt(h.slice(4,6),16),
  };
}
function rgba(hex, a) {
  const { r, g, b } = hexToRgb(hex);
  return `rgba(${r},${g},${b},${a})`;
}

// ── Text helpers ───────────────────────────────────────────────────────────
// Wrap text to maxWidth, return array of lines.
function wrapText(ctx, text, maxWidth) {
  const words = text.split(' ');
  const lines = [];
  let cur = '';
  for (const w of words) {
    const test = cur ? cur + ' ' + w : w;
    if (ctx.measureText(test).width > maxWidth && cur) {
      lines.push(cur); cur = w;
    } else { cur = test; }
  }
  if (cur) lines.push(cur);
  return lines;
}

// Draw text with a semi-transparent background pill behind each line.
function drawTextWithBG(ctx, lines, x, y, lineH, bgColor) {
  for (const line of lines) {
    const w = ctx.measureText(line).width;
    const pad = 6;
    ctx.fillStyle = bgColor;
    ctx.fillRect(x - pad, y - lineH * 0.82, w + pad * 2, lineH * 1.05);
    ctx.fillStyle = ctx.strokeStyle || '#000'; // reuse text color set by caller
    const savedFill = ctx.fillStyle;
    ctx.fillStyle = ctx._textColor || '#000';
    ctx.fillText(line, x, y);
    y += lineH;
  }
  return y;
}

// ── Main render function ───────────────────────────────────────────────────
async function renderFP(data) {
  const {
    // Practitioner fields
    name        = '',
    practice    = '',
    instagram   = '',
    city        = '',
    state       = '',
    epithet     = '',
    question    = '',
    answer      = '',
    // Theme
    bgColor     = '#f5efe8',
    accentColor = '#9b7b6e',
    textColor   = '#3a2e28',
    textBGAlpha = 0.5,
    // Layout overrides (match sheet columns)
    mainTextWidth = 210,
    mainTextTop   = 20,
    bodyTextTop   = 0,
    bodyTextLeft  = 0,
    fontSize      = 1.45,
    titleFontSize = 2.85,
    imagePanX     = 50,
    imagePanY     = 50,
    // Photo — base64 data URI or URL
    photoData     = null,
    photoShape    = 'circle', // circle | rounded | rect
  } = data;

  const W = 540, H = 675;
  const canvas = createCanvas(W, H);
  const ctx    = canvas.getContext('2d');
  const DPR    = 2; // render at 2× for sharpness then scale down? 
  // Actually canvas lib renders at 1× but exports full res — keep at 1×.

  const textBG = rgba(bgColor, textBGAlpha);

  // ── 1. Background ────────────────────────────────────────────────────────
  ctx.fillStyle = bgColor;
  ctx.fillRect(0, 0, W, H);

  // ── 2. Soft Orbs ─────────────────────────────────────────────────────────
  // orb1: 320×320, top:-80 right:-80
  const drawOrb = (cx, cy, r, alpha) => {
    const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, r);
    grad.addColorStop(0,   rgba(accentColor, alpha));
    grad.addColorStop(0.7, rgba(accentColor, alpha * 0.6));
    grad.addColorStop(1,   rgba(accentColor, 0));
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.fill();
  };
  drawOrb(W - 80 + 160, -80 + 160, 160, 0.18); // top-right
  drawOrb(-60 + 100, H + 60 - 100, 100, 0.18); // bottom-left

  // ── 3. Photo ──────────────────────────────────────────────────────────────
  const photoSize = 440;
  const photoX    = W - photoSize + 78; // mirrors margin-right:-78px offset
  const photoY    = -149;               // mirrors margin-top:-149px offset
  const PAD       = 54; // post-inner padding

  if (photoData) {
    try {
      const img = await loadImage(photoData);
      ctx.save();
      ctx.beginPath();
      if (photoShape === 'circle') {
        ctx.arc(photoX + photoSize/2, photoY + photoSize/2, photoSize/2, 0, Math.PI*2);
      } else if (photoShape === 'rounded') {
        const r = 14;
        ctx.moveTo(photoX+r, photoY);
        ctx.lineTo(photoX+photoSize-r, photoY);
        ctx.quadraticCurveTo(photoX+photoSize, photoY, photoX+photoSize, photoY+r);
        ctx.lineTo(photoX+photoSize, photoY+photoSize-r);
        ctx.quadraticCurveTo(photoX+photoSize, photoY+photoSize, photoX+photoSize-r, photoY+photoSize);
        ctx.lineTo(photoX+r, photoY+photoSize);
        ctx.quadraticCurveTo(photoX, photoY+photoSize, photoX, photoY+photoSize-r);
        ctx.lineTo(photoX, photoY+r);
        ctx.quadraticCurveTo(photoX, photoY, photoX+r, photoY);
        ctx.closePath();
      } else {
        ctx.rect(photoX, photoY, photoSize, photoSize);
      }
      ctx.clip();
      // Cover-fit with pan
      const iW = img.width, iH = img.height;
      const scale = Math.max(photoSize/iW, photoSize/iH);
      const dW = iW*scale, dH = iH*scale;
      const dx = photoX - (imagePanX/100)*(dW-photoSize);
      const dy = photoY - (imagePanY/100)*(dH-photoSize);
      ctx.drawImage(img, dx, dy, dW, dH);
      ctx.restore();
    } catch(e) {
      console.warn('[render] photo load failed:', e.message);
    }
  }

  // ── 4. Title block ────────────────────────────────────────────────────────
  const titleX = PAD - 37; // left:17px + inner offset
  let   titleY = 10 + PAD;

  // Supersupertitle
  ctx.font         = '400 16px "Fira Sans", sans-serif';
  ctx.fillStyle    = rgba(accentColor, 0.9);
  ctx.fillText('American Reiki Association Featured Practice', titleX + 5, titleY + 16);
  titleY += 26;

  // Title (practice name)
  const titlePx = Math.round(titleFontSize * 16);
  ctx.font      = `700 ${titlePx}px "Fira Sans", sans-serif`;
  ctx.fillStyle = textColor;
  const titleLines = wrapText(ctx, practice || name, 320);
  for (const line of titleLines) {
    const lw = ctx.measureText(line).width;
    ctx.fillStyle = textBG;
    ctx.fillRect(titleX + 5 - 6, titleY - titlePx * 0.82, lw + 12, titlePx * 1.1);
    ctx.fillStyle = textColor;
    ctx.fillText(line, titleX + 5, titleY);
    titleY += titlePx * 1.25;
  }

  // Subtitle (name — city, state)
  ctx.font      = `700 ${Math.round(1.82*16)}px "Fira Sans", sans-serif`;
  const subtitleText = practice
    ? `${name} \u2013 ${city}, ${state}`
    : `${city}, ${state}`;
  const subLines = wrapText(ctx, subtitleText, 320);
  for (const line of subLines) {
    const lw = ctx.measureText(line).width;
    ctx.fillStyle = textBG;
    ctx.fillRect(titleX + 5 - 6, titleY - 29.1, lw + 12, 30.9);
    ctx.fillStyle = rgba(textColor, 0.9);
    ctx.fillText(line, titleX + 5, titleY);
    titleY += 29 * 1.2;
  }
  titleY += 8;

  // ── 5. Details list (instagram + epithet) ─────────────────────────────────
  const detailsX = titleX + 5 + 37;
  let   detailsY = titleY + 4;
  ctx.font      = `400 16px "Fira Sans", sans-serif`;
  const details = [
    instagram ? '@' + instagram.replace(/^@/,'') : null,
    epithet   || null,
  ].filter(Boolean);

  for (const d of details) {
    const lw = ctx.measureText(d).width;
    ctx.fillStyle = textBG;
    ctx.fillRect(detailsX - 6, detailsY - 13.1, lw + 12, 18);
    ctx.fillStyle = textColor;
    ctx.fillText(d, detailsX, detailsY);
    detailsY += 22;
  }

  // Symbol ✦ between details and main text
  const symbolY = detailsY + 10;
  ctx.font      = `400 30px "Fira Sans", sans-serif`;
  ctx.fillStyle = rgba(accentColor, 0.7);
  ctx.fillText('✦', titleX + 5 + 70, symbolY);

  // ── 6. Main text (spotlight question) ────────────────────────────────────
  const mainFontPx = Math.round(1.5 * 16);
  ctx.font         = `700 ${mainFontPx}px "Fira Sans", sans-serif`;
  const mainX      = PAD + 20;
  const mainY      = symbolY + mainTextTop;
  const questionText = question ? '\u201C' + question + '\u201D' : '';
  const mainLines  = wrapText(ctx, questionText, mainTextWidth);
  let   curY       = mainY;
  for (const line of mainLines) {
    const lw = ctx.measureText(line).width;
    ctx.fillStyle = textBG;
    ctx.fillRect(mainX - 6, curY - mainFontPx * 0.82, lw + 12, mainFontPx * 1.1);
    ctx.fillStyle = textColor;
    ctx.fillText(line, mainX, curY);
    curY += mainFontPx * 1.3;
  }

  // ── 7. Body text (spotlight answer) ──────────────────────────────────────
  const bodyFontPx = Math.round(fontSize * 16);
  ctx.font         = `400 ${bodyFontPx}px "Fira Sans", sans-serif`;
  const bodyX      = PAD + 20 + bodyTextLeft;
  const bodyMaxW   = W - bodyX - PAD - 20;
  const answerText = answer ? '\u201C' + answer + '\u201D' : '';
  const bodyLines  = wrapText(ctx, answerText, bodyMaxW);
  const bodyStartY = curY + 8 + bodyTextTop;
  let   bodyY      = bodyStartY;
  for (const line of bodyLines) {
    ctx.fillStyle = textColor;
    ctx.fillText(line, bodyX, bodyY);
    bodyY += bodyFontPx * 1.4;
  }

  // ── 8. Footer ─────────────────────────────────────────────────────────────
  ctx.font      = `700 13px sans-serif`;
  ctx.fillStyle = rgba(accentColor, 0.85);
  ctx.textAlign = 'center';
  ctx.fillText('@americanreikiassociation', W/2, H - 15);
  ctx.textAlign = 'left';

  return canvas.toBuffer('image/png');
}

// ── Routes ─────────────────────────────────────────────────────────────────
app.get('/', (req, res) => {
  res.json({ status: 'ok', message: 'ARA Render Service is running.' });
});

app.post('/render', async (req, res) => {
  try {
    const png = await renderFP(req.body);
    res.set('Content-Type', 'image/png');
    res.send(png);
  } catch (err) {
    console.error('[/render]', err);
    res.status(500).json({ status: 'error', message: err.message });
  }
});

// ── Startup ────────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 3000;
initFonts().then(() => {
  app.listen(PORT, () => console.log(`ARA Render Service listening on port ${PORT}`));
}).catch(err => {
  console.error('[startup] Font init failed:', err.message);
  app.listen(PORT, () => console.log(`ARA Render Service listening on port ${PORT} (no fonts)`));
});
