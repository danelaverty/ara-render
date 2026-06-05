// botanical.js — canvas-based botanical illustration
// Depends on: state.accentRgba() from main.js

function bez(p0,p1,p2,p3,t) {
  const m=1-t;
  return m*m*m*p0 + 3*m*m*t*p1 + 3*m*t*t*p2 + t*t*t*p3;
}
function bezPt(ax,ay,bx,by,cx,cy,dx,dy,t) {
  return [bez(ax,bx,cx,dx,t), bez(ay,by,cy,dy,t)];
}
function bezAngle(ax,ay,bx,by,cx,cy,dx,dy,t) {
  const m=1-t;
  return Math.atan2(
    3*(m*m*(by-ay) + 2*m*t*(cy-by) + t*t*(dy-cy)),
    3*(m*m*(bx-ax) + 2*m*t*(cx-bx) + t*t*(dx-cx))
  );
}

function drawLeaf(ctx,x,y,angle,len,wf,alpha,vein) {
  const w=len*0.38*wf, cos=Math.cos(angle), sin=Math.sin(angle);
  const perp=angle+Math.PI/2, cp=Math.cos(perp), sp=Math.sin(perp);
  const tx=x+cos*len, ty=y+sin*len;
  ctx.save();
  ctx.globalAlpha=alpha;
  ctx.fillStyle=state.accentRgba(1);
  ctx.beginPath();
  ctx.moveTo(x,y);
  ctx.quadraticCurveTo(x+cos*len*0.45-cp*w, y+sin*len*0.45-sp*w, tx,ty);
  ctx.quadraticCurveTo(x+cos*len*0.45+cp*w, y+sin*len*0.45+sp*w, x,y);
  ctx.fill();
  if (vein) {
    ctx.strokeStyle=state.accentRgba(0.18); ctx.lineWidth=0.6;
    ctx.beginPath(); ctx.moveTo(x,y); ctx.lineTo(tx,ty); ctx.stroke();
    for (const s of [-1,1]) {
      for (const f of [0.35,0.62]) {
        const mx=x+cos*len*f, my=y+sin*len*f;
        ctx.beginPath(); ctx.moveTo(mx,my);
        ctx.lineTo(mx+Math.cos(angle+s*0.9)*len*0.28, my+Math.sin(angle+s*0.9)*len*0.28);
        ctx.stroke();
      }
    }
  }
  ctx.restore();
}

function drawFlower(ctx,x,y,r,alpha) {
  ctx.save();
  for (let i=0;i<5;i++) {
    const a=(i/5)*Math.PI*2-Math.PI/2;
    ctx.beginPath();
    ctx.ellipse(x+Math.cos(a)*r*0.6, y+Math.sin(a)*r*0.6, r*0.38, r*0.55, a, 0, Math.PI*2);
    ctx.fillStyle=state.accentRgba(alpha*0.6); ctx.fill();
  }
  ctx.beginPath(); ctx.arc(x,y,r*0.28,0,Math.PI*2);
  ctx.fillStyle=state.accentRgba(alpha*0.9); ctx.fill();
  for (let i=0;i<8;i++) {
    const a=(i/8)*Math.PI*2;
    ctx.strokeStyle=state.accentRgba(alpha*0.4); ctx.lineWidth=0.7;
    ctx.beginPath();
    ctx.moveTo(x+Math.cos(a)*r*0.2, y+Math.sin(a)*r*0.2);
    ctx.lineTo(x+Math.cos(a)*r*0.35, y+Math.sin(a)*r*0.35);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(x+Math.cos(a)*r*0.35, y+Math.sin(a)*r*0.35, 1.2, 0, Math.PI*2);
    ctx.fillStyle=state.accentRgba(alpha*0.5); ctx.fill();
  }
  ctx.restore();
}

function paintBotanical() {
    const botCanvas = document.getElementById('bot-canvas');
    const bctx = botCanvas.getContext('2d');

  bctx.clearRect(0,0,540,675);

  // ── Stem 1: top-left flowering branch ──
  {
    const sp=[-12,340,38,210,100,100,195,28];
    bctx.save();
    bctx.strokeStyle=state.accentRgba(0.20); bctx.lineWidth=1.6; bctx.lineCap='round';
    bctx.beginPath();
    bctx.moveTo(sp[0],sp[1]);
    bctx.bezierCurveTo(sp[2],sp[3],sp[4],sp[5],sp[6],sp[7]);
    bctx.stroke(); bctx.restore();

    const ld=[
      {t:0.10,s: 1,l:28,w:0.55},{t:0.20,s:-1,l:42,w:0.70},{t:0.30,s: 1,l:50,w:0.72},
      {t:0.40,s:-1,l:54,w:0.75},{t:0.50,s: 1,l:52,w:0.68},{t:0.60,s:-1,l:46,w:0.65},
      {t:0.70,s: 1,l:38,w:0.60},{t:0.82,s:-1,l:30,w:0.55},{t:0.92,s: 1,l:22,w:0.50},
    ];
    for (const {t,s,l,w} of ld) {
      const [lx,ly]=bezPt(...sp,t), tang=bezAngle(...sp,t);
      drawLeaf(bctx,lx,ly,tang+s*0.5,l,w,0.19,true);
    }
    const [tx,ty]=bezPt(...sp,1);
    drawFlower(bctx,tx,ty,22,0.21);

    // sub-branch
    const [bx0,by0]=bezPt(...sp,0.45), bt=bezAngle(...sp,0.45), ba=bt-0.7, bl=70;
    const bex=bx0+Math.cos(ba)*bl, bey=by0+Math.sin(ba)*bl;
    bctx.save();
    bctx.strokeStyle=state.accentRgba(0.16); bctx.lineWidth=1.0; bctx.lineCap='round';
    bctx.beginPath(); bctx.moveTo(bx0,by0);
    bctx.quadraticCurveTo(
      bx0+Math.cos(ba)*bl*0.5+Math.cos(bt)*8,
      by0+Math.sin(ba)*bl*0.5+Math.sin(bt)*8,
      bex,bey
    );
    bctx.stroke(); bctx.restore();
    drawLeaf(bctx,bx0+Math.cos(ba)*22,by0+Math.sin(ba)*22,ba+1.1,28,0.62,0.16,true);
    drawLeaf(bctx,bx0+Math.cos(ba)*44,by0+Math.sin(ba)*44,ba-1.0,24,0.58,0.15,true);
    drawFlower(bctx,bex,bey,14,0.17);
  }

  // ── Stem 2: bottom-right fern ──
  {
    const sp=[555,700,360,640,560,460,490,310];
    bctx.save();
    bctx.strokeStyle=state.accentRgba(0.20); bctx.lineWidth=1.6; bctx.lineCap='round';
    bctx.beginPath();
    bctx.moveTo(sp[0],sp[1]);
    bctx.bezierCurveTo(sp[2],sp[3],sp[4],sp[5],sp[6],sp[7]);
    bctx.stroke(); bctx.restore();

    for (let i=1;i<13;i++) {
      const t=i/13, [px,py]=bezPt(...sp,t), tang=bezAngle(...sp,t);
      const pl=(22+16*Math.sin(t*Math.PI))*(1-t*0.3);
      for (const side of [-1,1]) {
        const pa=tang+side*(Math.PI/2+0.15);
        const prx=px+Math.cos(pa)*pl, pry=py+Math.sin(pa)*pl;
        bctx.save();
        bctx.strokeStyle=state.accentRgba(0.18); bctx.lineWidth=0.8; bctx.lineCap='round';
        bctx.beginPath(); bctx.moveTo(px,py);
        bctx.quadraticCurveTo(
          px+Math.cos(pa)*pl*0.5+Math.cos(tang)*6,
          py+Math.sin(pa)*pl*0.5+Math.sin(tang)*6,
          prx,pry
        );
        bctx.stroke(); bctx.restore();
        for (let j=1;j<=4;j++) {
          const f=j/4;
          drawLeaf(bctx,px+(prx-px)*f,py+(pry-py)*f,pa+side*0.5,pl*0.32*(1-f*0.45),0.65,0.18,false);
        }
      }
    }
    const [ftx,fty]=bezPt(...sp,1), ft=bezAngle(...sp,0.98);
    const c1x=ftx+Math.cos(ft)*22+Math.cos(ft-Math.PI/2)*10, c1y=fty+Math.sin(ft)*22+Math.sin(ft-Math.PI/2)*10;
    const c2x=ftx+Math.cos(ft)*30+Math.cos(ft-Math.PI/2)*28, c2y=fty+Math.sin(ft)*30+Math.sin(ft-Math.PI/2)*28;
    const ex =ftx+Math.cos(ft)*18+Math.cos(ft-Math.PI/2)*36, ey =fty+Math.sin(ft)*18+Math.sin(ft-Math.PI/2)*36;
    const c3x=ex+Math.cos(ft+Math.PI)*14+Math.cos(ft-Math.PI/2)*10, c3y=ey+Math.sin(ft+Math.PI)*14+Math.sin(ft-Math.PI/2)*10;
    bctx.save();
    bctx.strokeStyle=state.accentRgba(0.20); bctx.lineWidth=1.2; bctx.lineCap='round';
    bctx.beginPath(); bctx.moveTo(ftx,fty);
    bctx.bezierCurveTo(c1x,c1y,c2x,c2y,ex,ey);
    bctx.quadraticCurveTo(c3x,c3y,ex+Math.cos(ft+Math.PI)*20,ey+Math.sin(ft+Math.PI)*20);
    bctx.stroke(); bctx.restore();
  }
}


// ── 6. Celestial ──────────────────────────────────────────────────────────
function paintCelestial() {
  const c   = document.getElementById('celestial-canvas');
  const ctx = c.getContext('2d');
  const W = 540, H = 675;
  ctx.clearRect(0, 0, W, H);

  const col = state.accentRgba;

  // Helper: 5-point star
  function star(x, y, r, a) {
    ctx.save();
    ctx.translate(x, y);
    ctx.beginPath();
    for (let i = 0; i < 10; i++) {
      const ang  = (i / 10) * Math.PI * 2 - Math.PI / 2;
      const dist = i % 2 === 0 ? r : r * 0.42;
      i === 0
        ? ctx.moveTo(Math.cos(ang) * dist, Math.sin(ang) * dist)
        : ctx.lineTo(Math.cos(ang) * dist, Math.sin(ang) * dist);
    }
    ctx.closePath();
    ctx.fillStyle = col(a);
    ctx.fill();
    ctx.restore();
  }

  // Helper: crescent moon
  function crescent(x, y, r, a) {
    ctx.save();
    ctx.translate(x, y);
    ctx.beginPath();
    ctx.arc(0, 0, r, 0, Math.PI * 2);
    ctx.fillStyle = col(a);
    ctx.fill();
    // cut-out circle to form crescent
    ctx.globalCompositeOperation = 'destination-out';
    ctx.beginPath();
    ctx.arc(r * 0.38, -r * 0.08, r * 0.78, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(0,0,0,1)';
    ctx.fill();
    ctx.globalCompositeOperation = 'source-over';
    ctx.restore();
  }

  // Helper: 4-point sparkle
  function sparkle(x, y, r, a) {
    ctx.save();
    ctx.strokeStyle = col(a);
    ctx.lineWidth = r * 0.3;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(x - r, y);       ctx.lineTo(x + r, y);
    ctx.moveTo(x, y - r);       ctx.lineTo(x, y + r);
    ctx.moveTo(x - r*.6, y - r*.6); ctx.lineTo(x + r*.6, y + r*.6);
    ctx.moveTo(x + r*.6, y - r*.6); ctx.lineTo(x - r*.6, y + r*.6);
    ctx.stroke();
    ctx.restore();
  }

  // ── TOP BAND (0–160px) ──
  // Stars scattered across top
  const topStars = [
    [50, 30, 7, 0.22], [120, 18, 5, 0.18], [200, 40, 4, 0.15],
    [310, 22, 6, 0.20], [480, 110, 4, 0.14], [38, 90, 3.5, 0.16],
    [155, 80, 3, 0.13], [370, 70, 5, 0.19], [500, 40, 3.5, 0.15],
  ];
  topStars.forEach(([x, y, r, a]) => star(x, y, r, a));

  // Sparkles
  sparkle(255, 28, 5, 0.18);
  sparkle(82,  55, 4, 0.14);
  sparkle(460, 30, 4, 0.16);

  // Dot scatter (tiny stars / nebula dust)
  const topDots = [
    [170, 55, 1.5, 0.16], [290, 45, 1.8, 0.18], [340, 30, 1.4, 0.14],
    [410, 90, 1.6, 0.15], [240, 70, 1.3, 0.13], [80, 120, 1.5, 0.12],
    [520, 80, 1.8, 0.16], [18, 140, 1.4, 0.13],
  ];
  topDots.forEach(([x, y, r, a]) => {
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fillStyle = col(a);
    ctx.fill();
  });

  // Fine arc — partial orbit ring at top
  ctx.save();
  ctx.strokeStyle = col(0.10);
  ctx.lineWidth = 0.7;
  ctx.beginPath();
  ctx.arc(270, -40, 220, 0.2, Math.PI - 0.2);
  ctx.stroke();
  ctx.restore();

  // ── BOTTOM BAND (515–675px) ──
  // Large crescent, bottom-left — tucked into corner
  //crescent(58, 618, 30, 0.18);

  const botStars = [
    [40,  650, 6,   0.21], [180, 620, 4.5, 0.17], [290, 655, 5,   0.20],
    [400, 635, 4,   0.16], [500, 658, 6,   0.22], [70,  600, 3.5, 0.14],
    [230, 590, 3,   0.13], [460, 600, 4,   0.17], [520, 620, 3,   0.14],
  ];
  botStars.forEach(([x, y, r, a]) => star(x, y, r, a));

  sparkle(340, 660, 5, 0.18);
  sparkle(155, 650, 4, 0.15);
  sparkle(490, 640, 4, 0.16);

  const botDots = [
    [30,  610, 1.5, 0.14], [130, 670, 1.8, 0.17], [270, 620, 1.4, 0.15],
    [380, 658, 1.6, 0.14], [440, 675, 1.3, 0.13], [330, 600, 1.5, 0.12],
    [200, 640, 1.8, 0.16], [510, 590, 1.4, 0.13],
  ];
  botDots.forEach(([x, y, r, a]) => {
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fillStyle = col(a);
    ctx.fill();
  });

  // Fine arc — partial orbit ring at bottom
  ctx.save();
  ctx.strokeStyle = col(0.10);
  ctx.lineWidth = 0.7;
  ctx.beginPath();
  ctx.arc(270, 715, 220, Math.PI + 0.2, Math.PI * 2 - 0.2);
  ctx.stroke();
  ctx.restore();
}



// ── 9. Brush Strokes ──────────────────────────────────────────────────────
function paintBrushStrokes() {
  const c   = document.getElementById('brush-canvas');
  const ctx = c.getContext('2d');
  const W = 540, H = 675;
  ctx.clearRect(0, 0, W, H);

  const col = state.accentRgba;

  // Rough brush stroke: series of slightly offset ellipses along a path
  function brushStroke(x1, y1, x2, y2, thickness, alpha, roughness) {
    const dx = x2 - x1, dy = y2 - y1;
    const len = Math.sqrt(dx * dx + dy * dy);
    const nx  = -dy / len, ny = dx / len; // normal
    const steps = Math.ceil(len / 3);

    ctx.save();
    for (let i = 0; i <= steps; i++) {
      const t   = i / steps;
      const cx  = x1 + dx * t + (Math.random() - 0.5) * roughness;
      const cy  = y1 + dy * t + (Math.random() - 0.5) * roughness;
      const w   = thickness * (0.6 + 0.7 * Math.sin(t * Math.PI));
      const a   = alpha * (0.5 + 0.6 * Math.sin(t * Math.PI));
      ctx.beginPath();
      ctx.ellipse(cx, cy, w * 0.5, w * 0.18, Math.atan2(dy, dx), 0, Math.PI * 2);
      ctx.fillStyle = col(a);
      ctx.fill();
    }
    ctx.restore();
  }

  // ── TOP edge strokes (sweeping left-to-right at angles) ──
  brushStroke(-10,  8,  300, 38,  60, 0.10, 2.5);
  brushStroke(220, 12,  560, 28,  50, 0.09, 2.0);
  brushStroke(-10, 28,  180, 58,  30, 0.07, 1.5);
  brushStroke(360, 18,  560, 52,  28, 0.07, 1.5);
  // thin accent stroke
  brushStroke(60,  55, 480, 42,   8, 0.12, 1.0);

  // ── BOTTOM edge strokes ──
  brushStroke(-10, 667, 300, 637, 60, 0.10, 2.5);
  brushStroke(220, 663, 560, 647, 50, 0.09, 2.0);
  brushStroke(-10, 647, 180, 617, 30, 0.07, 1.5);
  brushStroke(360, 657, 560, 623, 28, 0.07, 1.5);
  brushStroke(60,  620, 480, 633,  8, 0.12, 1.0);
}

// ── Fire 1 · Ember Wisps ──────────────────────────────────────────────────
function paintEmberWisps() {
  const c   = document.getElementById('ember-canvas');
  const ctx = c.getContext('2d');
  const W = 540, H = c.height;
  ctx.clearRect(0, 0, W, H);
  const col = state.accentRgba;

  // Draw one flame tongue using cubic bezier silhouette
  function flamePath(cx, baseY, w, h, lean) {
    ctx.beginPath();
    // left side up
    ctx.moveTo(cx - w/2, baseY);
    ctx.bezierCurveTo(
      cx - w/2 - lean*0.3, baseY - h*0.35,
      cx - w*0.28 + lean,  baseY - h*0.7,
      cx + lean,           baseY - h
    );
    // right side down
    ctx.bezierCurveTo(
      cx + w*0.28 + lean,  baseY - h*0.7,
      cx + w/2 - lean*0.3, baseY - h*0.35,
      cx + w/2,            baseY
    );
    ctx.closePath();
  }

  // ── BOTTOM band: rising flames ──
  const bottomFlames = [
    { cx:  55, w:38, h:90,  lean: -4, a:0.18 },
    { cx: 110, w:28, h:65,  lean:  3, a:0.14 },
    { cx: 160, w:46, h:110, lean: -6, a:0.20 },
    { cx: 215, w:22, h:50,  lean:  4, a:0.13 },
    { cx: 255, w:50, h:130, lean: -5, a:0.22 },
    { cx: 310, w:34, h:80,  lean:  5, a:0.17 },
    { cx: 360, w:50, h:118, lean: -4, a:0.20 },
    { cx: 415, w:26, h:60,  lean:  3, a:0.13 },
    { cx: 460, w:44, h:100, lean:  6, a:0.19 },
    { cx: 510, w:30, h:72,  lean: -3, a:0.15 },
  ];
  for (const f of bottomFlames) {
    // outer flame
    flamePath(f.cx, H, f.w, f.h, f.lean);
    ctx.fillStyle = col(f.a);
    ctx.fill();
    // inner brighter core
    flamePath(f.cx + f.lean*0.5, H, f.w*0.46, f.h*0.62, f.lean*0.4);
    ctx.fillStyle = col(f.a * 0.8);
    ctx.fill();
  }

  // ── TOP band: downward dripping flames (mirrored) ──
  ctx.save();
  ctx.translate(0, H);
  ctx.scale(1, -1);
  const topFlames = [
    { cx:  80, w:34, h:75,  lean:  5, a:0.15 },
    { cx: 140, w:48, h:105, lean: -5, a:0.19 },
    { cx: 200, w:26, h:58,  lean:  4, a:0.13 },
    { cx: 245, w:44, h:95,  lean: -4, a:0.18 },
    { cx: 295, w:28, h:65,  lean:  6, a:0.14 },
    { cx: 340, w:50, h:120, lean: -6, a:0.21 },
    { cx: 395, w:30, h:70,  lean:  4, a:0.15 },
    { cx: 440, w:46, h:100, lean: -4, a:0.19 },
    { cx: 490, w:24, h:55,  lean:  3, a:0.12 },
  ];
  for (const f of topFlames) {
    flamePath(f.cx, H, f.w, f.h, f.lean);
    ctx.fillStyle = col(f.a);
    ctx.fill();
    flamePath(f.cx + f.lean*0.5, H, f.w*0.46, f.h*0.62, f.lean*0.4);
    ctx.fillStyle = col(f.a * 0.75);
    ctx.fill();
  }
  ctx.restore();

  // ── Ember particles: rising dots in bottom 40% ──
  const embers = [
    [48, H-130, 2.0, 0.24], [82, H-180, 1.4, 0.19], [130, H-110, 1.8, 0.21],
    [175, H-200, 1.2, 0.17], [210, H-155, 2.2, 0.26], [250, H-240, 1.6, 0.20],
    [290, H-160, 1.0, 0.16], [330, H-210, 2.0, 0.23], [370, H-140, 1.4, 0.18],
    [410, H-185, 1.8, 0.22], [450, H-120, 1.2, 0.17], [492, H-165, 2.0, 0.20],
    [65,  H-260, 1.0, 0.14], [145, H-285, 1.4, 0.16], [235, H-300, 1.6, 0.18],
    [315, H-270, 1.2, 0.15], [395, H-290, 1.8, 0.17], [475, H-255, 1.0, 0.14],
  ];
  for (const [x, y, r, a] of embers) {
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fillStyle = col(a);
    ctx.fill();
  }

  // mirrored embers top
  for (const [x, y, r, a] of embers) {
    ctx.beginPath();
    ctx.arc(x, H - (H - y), r, 0, Math.PI * 2);
    ctx.fillStyle = col(a * 0.85);
    ctx.fill();
  }

  // ── Thin heat-shimmer lines floating above bottom flames ──
  ctx.save();
  ctx.strokeStyle = col(0.10);
  ctx.lineWidth = 0.6;
  ctx.lineCap = 'round';
  for (let i = 0; i < 12; i++) {
    const x = 30 + i * 44;
    const yBase = H - 80 - (i % 3) * 20;
    ctx.beginPath();
    ctx.moveTo(x, yBase);
    ctx.bezierCurveTo(x-6, yBase-20, x+8, yBase-40, x-4, yBase-60);
    ctx.stroke();
  }
  // mirrored top
  ctx.save();
  ctx.translate(0, H); ctx.scale(1, -1);
  for (let i = 0; i < 12; i++) {
    const x = 30 + i * 44;
    const yBase = H - 80 - (i % 3) * 20;
    ctx.beginPath();
    ctx.moveTo(x, yBase);
    ctx.bezierCurveTo(x-6, yBase-20, x+8, yBase-40, x-4, yBase-60);
    ctx.stroke();
  }
  ctx.restore();
  ctx.restore();
}


// ── Cloud 1 · Cloud Drift ─────────────────────────────────────────────────
function paintCloudDrift() {
  // Injects SVG into the two .cd-top / .cd-bottom divs
  const top    = document.querySelector('#post-canvas .cd-top');
  const bottom = document.querySelector('#post-canvas .cd-bottom');
  if (!top || !bottom) return;

  // Build accent colour from current theme
  const acc = THEMES[state.themeIndex].accent;

  function cloudSVG(flip) {
    const sc = flip ? 'transform="scale(1,-1) translate(0,-120)"' : '';
    return `<svg viewBox="0 0 540 120" xmlns="http://www.w3.org/2000/svg"
              preserveAspectRatio="none" style="width:100%;height:120px;">
      <g ${sc}>
        <!-- back layer: faint wide clouds -->
        <path d="M-20,120 L-20,78 Q20,52 70,68 Q90,42 130,55 Q155,30 200,48
                 Q230,18 280,38 Q310,10 360,30 Q390,8 440,25 Q480,4 530,20
                 Q560,10 580,18 L580,120 Z"
              fill="${acc}" opacity="0.07"/>

        <!-- mid layer -->
        <path d="M-20,120 L-20,88 Q15,65 55,80 Q75,55 110,68
                 Q140,42 185,58 Q215,30 258,48 Q290,18 335,36
                 Q365,12 410,28 Q445,6 490,20 Q520,8 560,16 L560,120 Z"
              fill="${acc}" opacity="0.10"/>

        <!-- individual puff cloud shapes -->
        <!-- cloud A: left -->
        <ellipse cx="75"  cy="72" rx="42" ry="22" fill="${acc}" opacity="0.11"/>
        <ellipse cx="55"  cy="80" rx="30" ry="18" fill="${acc}" opacity="0.09"/>
        <ellipse cx="98"  cy="78" rx="28" ry="16" fill="${acc}" opacity="0.09"/>

        <!-- cloud B: centre-left -->
        <ellipse cx="210" cy="52" rx="55" ry="26" fill="${acc}" opacity="0.12"/>
        <ellipse cx="185" cy="62" rx="38" ry="20" fill="${acc}" opacity="0.09"/>
        <ellipse cx="240" cy="60" rx="36" ry="18" fill="${acc}" opacity="0.09"/>

        <!-- cloud C: centre -->
        <ellipse cx="355" cy="40" rx="60" ry="28" fill="${acc}" opacity="0.13"/>
        <ellipse cx="325" cy="52" rx="42" ry="22" fill="${acc}" opacity="0.10"/>
        <ellipse cx="385" cy="50" rx="40" ry="20" fill="${acc}" opacity="0.10"/>
        <!-- inner highlight lobe -->
        <ellipse cx="355" cy="36" rx="28" ry="14" fill="${acc}" opacity="0.07"/>

        <!-- cloud D: right -->
        <ellipse cx="478" cy="55" rx="50" ry="24" fill="${acc}" opacity="0.12"/>
        <ellipse cx="455" cy="65" rx="34" ry="18" fill="${acc}" opacity="0.09"/>
        <ellipse cx="505" cy="62" rx="30" ry="16" fill="${acc}" opacity="0.08"/>

        <!-- front layer: crisp bottom edge overlap -->
        <path d="M-20,120 L-20,98 Q30,82 80,95 Q120,78 165,90
                 Q205,72 255,86 Q295,68 345,82 Q385,65 435,80
                 Q475,66 520,78 Q548,68 570,74 L570,120 Z"
              fill="${acc}" opacity="0.13"/>

        <!-- subtle edge highlight line -->
        <path d="M-20,95 Q30,79 80,92 Q120,75 165,87
                 Q205,69 255,83 Q295,65 345,79 Q385,62 435,77
                 Q475,63 520,75 Q548,65 570,71"
              fill="none" stroke="${acc}" stroke-width="0.7" opacity="0.18"/>
      </g>
    </svg>`;
  }

  top.innerHTML    = cloudSVG(false);
  bottom.innerHTML = cloudSVG(true);
}


// ── Cloud 2 · Celestial Clouds ────────────────────────────────────────────
function paintCelestialClouds() {
  const c   = document.getElementById('cloudcel-canvas');
  const ctx = c.getContext('2d');
  const W = 540, H = c.height;
  ctx.clearRect(0, 0, W, H);
  const col = state.accentRgba;

  // Draw a puff cloud from overlapping circles
  function puff(cx, cy, lobes, alpha) {
    for (const [ox, oy, r] of lobes) {
      ctx.beginPath();
      ctx.arc(cx + ox, cy + oy, r, 0, Math.PI * 2);
      ctx.fillStyle = col(alpha);
      ctx.fill();
    }
  }

  // Fine stipple pass (fills entire band with tiny dots that fade out)
  function stippleBand(yStart, bandH, density, baseAlpha) {
    for (let i = 0; i < density; i++) {
      const x = Math.random() * W;
      const y = yStart + Math.random() * bandH;
      // fade based on distance from band centre
      const dist = Math.abs(y - (yStart + bandH/2)) / (bandH/2);
      const a = baseAlpha * (1 - dist * 0.7);
      ctx.beginPath();
      ctx.arc(x, y, 0.8 + Math.random() * 0.8, 0, Math.PI * 2);
      ctx.fillStyle = col(a);
      ctx.fill();
    }
  }

  // ── TOP BAND ──
  stippleBand(0, 130, 350, 0.10);

  // large anchor cloud, top-centre
  puff(270, 55, [
    [0,   0,  40], [-32, 10, 30], [32, 10, 30],
    [-55, 22, 22], [55,  22, 22], [0,  30, 28],
    [-20, 18, 20], [20,  18, 20],
  ], 0.13);

  // smaller cloud, top-left
  puff(85, 38, [
    [0, 0, 26], [-20, 10, 20], [20, 10, 20],
    [-8, 18, 16], [8, 18, 16],
  ], 0.10);

  // smaller cloud, top-right
  puff(450, 45, [
    [0, 0, 30], [-22, 12, 22], [22, 12, 22],
    [-10, 22, 18], [10, 22, 18],
  ], 0.11);

  // wispy thin arcs suggesting high-altitude cirrus
  ctx.save();
  ctx.strokeStyle = col(0.09);
  ctx.lineWidth   = 0.7;
  ctx.lineCap     = 'round';
  const cirrusTop = [
    [30, 18, 100, 20, -5, 12],
    [140, 10, 120, 12, 8, 10],
    [310, 22, 90, 24, -6, 8],
    [420, 14, 110, 16, 5, 10],
  ];
  for (const [x1, y1, x2, y2, cpOx, cpOy] of cirrusTop) {
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.quadraticCurveTo((x1+x2)/2 + cpOx, (y1+y2)/2 + cpOy, x2, y2);
    ctx.stroke();
  }
  ctx.restore();

  // ── BOTTOM BAND ──
  stippleBand(H - 130, 130, 350, 0.10);

  // large anchor cloud, bottom-centre
  puff(270, H - 55, [
    [0,   0,  40], [-32,-10, 30], [32,-10, 30],
    [-55,-22, 22], [55, -22, 22], [0, -30, 28],
    [-20,-18, 20], [20, -18, 20],
  ], 0.13);

  // smaller cloud, bottom-left
  puff(95, H - 42, [
    [0, 0, 28], [-22,-10, 22], [22,-10, 22],
    [-10,-20, 17], [10,-20, 17],
  ], 0.11);

  // smaller cloud, bottom-right
  puff(445, H - 48, [
    [0, 0, 32], [-24,-12, 24], [24,-12, 24],
    [-12,-24, 19], [12,-24, 19],
  ], 0.12);

  // cirrus bottom
  ctx.save();
  ctx.strokeStyle = col(0.09);
  ctx.lineWidth   = 0.7;
  ctx.lineCap     = 'round';
  const cirrusBot = [
    [25, H-20, 115, H-22, 6, -10],
    [145, H-12, 130, H-14, -8, -10],
    [305, H-24, 95, H-26, 5, -8],
    [415, H-16, 115, H-18, -5, -10],
  ];
  for (const [x1, y1, x2, y2, cpOx, cpOy] of cirrusBot) {
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.quadraticCurveTo((x1+x2)/2 + cpOx, (y1+y2)/2 + cpOy, x2, y2);
    ctx.stroke();
  }
  ctx.restore();
}
