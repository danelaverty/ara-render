// mandala.js — three canvas mandala painters
// Depends on: state.accentRgba() from main.js

let mctx = null;
const MW=540, MH=675;

function getMctx() {
  if (!mctx) {
    const c = document.getElementById('mandala-canvas');
    if (c) mctx = c.getContext('2d');
  }
  return mctx;
}

// ── Sacred Geometry ───────────────────────────────────────────────────────
function paintSacred() {
  const mctx = getMctx(); if (!mctx) return;
  mctx.clearRect(0,0,MW,MH);
  const cx=MW/2, cy=MH/2, R=230, col=state.accentRgba;

  function s(a,w,fn) { mctx.save(); mctx.strokeStyle=col(a); mctx.lineWidth=w; mctx.beginPath(); fn(); mctx.stroke(); mctx.restore(); }
  function f(a,fn)   { mctx.save(); mctx.fillStyle=col(a);   mctx.beginPath(); fn(); mctx.fill();  mctx.restore(); }

  // Flower of Life seed (7 circles)
  const flR=R*0.18;
  s(0.14,1.0,()=>mctx.arc(cx,cy,flR,0,Math.PI*2));
  for (let i=0;i<6;i++) {
    const a=(i/6)*Math.PI*2;
    s(0.14,1.0,()=>mctx.arc(cx+Math.cos(a)*flR,cy+Math.sin(a)*flR,flR,0,Math.PI*2));
  }

  // Metatron's Cube lines
  const centres=[[cx,cy]];
  for (let i=0;i<6;i++) { const a=(i/6)*Math.PI*2; centres.push([cx+Math.cos(a)*flR,   cy+Math.sin(a)*flR]);   }
  for (let i=0;i<6;i++) { const a=(i/6)*Math.PI*2; centres.push([cx+Math.cos(a)*flR*2, cy+Math.sin(a)*flR*2]); }
  s(0.10,0.7,()=>{
    for (let i=0;i<centres.length;i++)
      for (let j=i+1;j<centres.length;j++) {
        mctx.moveTo(centres[i][0],centres[i][1]);
        mctx.lineTo(centres[j][0],centres[j][1]);
      }
  });

  // Sri Yantra–style nested triangles (5 pairs)
  for (let k=0;k<5;k++) {
    const r=R*(0.28+k*0.14), alpha=0.15-k*0.01;
    s(alpha,1.0,()=>{ for(let i=0;i<3;i++){const a=(i/3)*Math.PI*2-Math.PI/2; i===0?mctx.moveTo(cx+Math.cos(a)*r,cy+Math.sin(a)*r):mctx.lineTo(cx+Math.cos(a)*r,cy+Math.sin(a)*r);} mctx.closePath(); });
    s(alpha,1.0,()=>{ for(let i=0;i<3;i++){const a=(i/3)*Math.PI*2+Math.PI/2; i===0?mctx.moveTo(cx+Math.cos(a)*r,cy+Math.sin(a)*r):mctx.lineTo(cx+Math.cos(a)*r,cy+Math.sin(a)*r);} mctx.closePath(); });
  }

  // Vesica Piscis
  const vpR=R*0.55;
  s(0.12,0.9,()=>mctx.arc(cx-vpR*0.5,cy,vpR,0,Math.PI*2));
  s(0.12,0.9,()=>mctx.arc(cx+vpR*0.5,cy,vpR,0,Math.PI*2));

  // Golden-ratio concentric circles
  const phi=1.618; let cr=R*0.1;
  while (cr<R) { s(0.10,0.8,()=>mctx.arc(cx,cy,cr,0,Math.PI*2)); cr*=phi; }

  // 12-fold spoke grid
  s(0.09,0.7,()=>{ for(let i=0;i<12;i++){const a=(i/12)*Math.PI*2; mctx.moveTo(cx,cy); mctx.lineTo(cx+Math.cos(a)*R,cy+Math.sin(a)*R);} });

  // Outer pentagon + pentagram (2 passes)
  for (let pass=0;pass<2;pass++) {
    const pr=R*(0.82+pass*0.1);
    s(0.13,0.9,()=>{ for(let i=0;i<5;i++){const a=(i/5)*Math.PI*2-Math.PI/2; i===0?mctx.moveTo(cx+Math.cos(a)*pr,cy+Math.sin(a)*pr):mctx.lineTo(cx+Math.cos(a)*pr,cy+Math.sin(a)*pr);} mctx.closePath(); });
    s(0.09,0.7,()=>{
      const pts=Array.from({length:5},(_,i)=>{const a=(i/5)*Math.PI*2-Math.PI/2; return[cx+Math.cos(a)*pr,cy+Math.sin(a)*pr];});
      [[0,2],[1,3],[2,4],[3,0],[4,1]].forEach(([a,b])=>{ mctx.moveTo(pts[a][0],pts[a][1]); mctx.lineTo(pts[b][0],pts[b][1]); });
    });
  }

  // Dot ring at outer boundary
  f(0.22,()=>{ for(let i=0;i<24;i++){const a=(i/24)*Math.PI*2; mctx.moveTo(cx+Math.cos(a)*(R+6),cy+Math.sin(a)*(R+6)); mctx.arc(cx+Math.cos(a)*(R+6),cy+Math.sin(a)*(R+6),2.2,0,Math.PI*2);} });

  // Centre gem
  f(0.24,()=>{ for(let i=0;i<6;i++){const a=(i/6)*Math.PI*2; i===0?mctx.moveTo(cx+Math.cos(a)*8,cy+Math.sin(a)*8):mctx.lineTo(cx+Math.cos(a)*8,cy+Math.sin(a)*8);} mctx.closePath(); });
}

// ── Floral / Organic ──────────────────────────────────────────────────────
function paintFloral() {
  const mctx = getMctx(); if (!mctx) return;
  mctx.clearRect(0,0,MW,MH);
  const cx=MW/2, cy=MH/2, col=state.accentRgba;

  function rosePetal(ctx,r,w,a) {
    ctx.save(); ctx.strokeStyle=col(a); ctx.lineWidth=w;
    ctx.beginPath(); ctx.moveTo(0,0);
    ctx.bezierCurveTo(r*0.5,-r*0.42,r*1.05,-r*0.18,r,0);
    ctx.bezierCurveTo(r*1.05,r*0.18,r*0.5,r*0.42,0,0);
    ctx.stroke(); ctx.restore();
  }
  function filledPetal(ctx,r,a) {
    ctx.save(); ctx.fillStyle=col(a);
    ctx.beginPath(); ctx.moveTo(0,0);
    ctx.bezierCurveTo(r*0.5,-r*0.38,r*1.02,-r*0.16,r,0);
    ctx.bezierCurveTo(r*1.02,r*0.16,r*0.5,r*0.38,0,0);
    ctx.closePath(); ctx.fill(); ctx.restore();
  }

  // [count, radius, filled, stroke-alpha, fill-alpha, lineW, rotOffset]
  const layers=[
    [6,  52, true,  0.00,0.11,0,   0],
    [6,  52, false, 0.12,0,   1.1, Math.PI/6],
    [9,  88, true,  0.00,0.09,0,   0],
    [9,  88, false, 0.10,0,   1.0, Math.PI/18],
    [12,128, true,  0.00,0.07,0,   0],
    [12,128, false, 0.09,0,   0.9, Math.PI/24],
    [16,170, false, 0.08,0,   0.8, 0],
    [16,170, false, 0.07,0,   0.7, Math.PI/16],
    [20,210, false, 0.065,0,  0.7, 0],
  ];
  layers.forEach(([n,r,filled,sa,fa,lw,rot])=>{
    for (let i=0;i<n;i++) {
      const a=(i/n)*Math.PI*2+rot;
      mctx.save(); mctx.translate(cx,cy); mctx.rotate(a);
      if (filled) filledPetal(mctx,r,fa); else rosePetal(mctx,r,lw,sa);
      mctx.restore();
    }
  });

  // Concentric soft rings
  [40,90,140,185,220].forEach((r,i)=>{
    mctx.save(); mctx.strokeStyle=col(0.07-i*0.005); mctx.lineWidth=0.8;
    mctx.beginPath(); mctx.arc(cx,cy,r,0,Math.PI*2); mctx.stroke(); mctx.restore();
  });

  // Dewdrop dots at petal tips
  [[16,173,Math.PI/16],[20,213,0]].forEach(([n,r,rot])=>{
    for (let i=0;i<n;i++) {
      const a=(i/n)*Math.PI*2+rot;
      mctx.save(); mctx.fillStyle=col(0.14);
      mctx.beginPath(); mctx.arc(cx+Math.cos(a)*r,cy+Math.sin(a)*r,2.5,0,Math.PI*2);
      mctx.fill(); mctx.restore();
    }
  });

  // Lotus seed — 8-petal centre
  for (let i=0;i<8;i++) {
    const a=(i/8)*Math.PI*2;
    mctx.save(); mctx.translate(cx,cy); mctx.rotate(a);
    mctx.fillStyle=col(0.18); mctx.beginPath();
    mctx.ellipse(14,0,5,10,0,0,Math.PI*2); mctx.fill(); mctx.restore();
  }
  mctx.save(); mctx.fillStyle=col(0.22);
  mctx.beginPath(); mctx.arc(cx,cy,5,0,Math.PI*2); mctx.fill(); mctx.restore();
}

// ── Astrological ──────────────────────────────────────────────────────────

function paintAstro() {
  const mctx = getMctx(); if (!mctx) return;
  mctx.clearRect(0, 0, MW, MH);
  const cx = MW / 2, cy = MH / 2;
  const col = state.accentRgba;

  // ── Primitive helpers ──────────────────────────────────────────────────
  const s = (a, w, fn) => {
    mctx.save();
    mctx.strokeStyle = col(a); mctx.lineWidth = w;
    mctx.lineCap = 'round'; mctx.lineJoin = 'round';
    mctx.beginPath(); fn(); mctx.stroke(); mctx.restore();
  };
  const f = (a, fn) => {
    mctx.save(); mctx.fillStyle = col(a);
    mctx.beginPath(); fn(); mctx.fill(); mctx.restore();
  };

  function inkLine(x1, y1, x2, y2, alpha, wBase) {
    const steps = 6;
    const dx = (x2 - x1) / steps, dy = (y2 - y1) / steps;
    mctx.save(); mctx.strokeStyle = col(alpha); mctx.lineCap = 'round';
    for (let i = 0; i < steps; i++) {
      const t = i / steps;
      const w = wBase * (0.8 + 0.4 * Math.sin(t * Math.PI));
      mctx.lineWidth = w;
      mctx.beginPath();
      mctx.moveTo(x1 + dx * i,       y1 + dy * i);
      mctx.lineTo(x1 + dx * (i + 1), y1 + dy * (i + 1));
      mctx.stroke();
    }
    mctx.restore();
  }

  function hatch(hcx, hcy, r, angle, alpha, gap) {
    mctx.save();
    mctx.strokeStyle = col(alpha); mctx.lineWidth = 0.55; mctx.lineCap = 'butt';
    mctx.beginPath(); mctx.arc(hcx, hcy, r, 0, Math.PI * 2); mctx.clip();
    for (let d = -r; d <= r; d += gap) {
      const x0 = hcx + Math.cos(angle) * d - Math.sin(angle) * r * 1.1;
      const y0 = hcy + Math.sin(angle) * d + Math.cos(angle) * r * 1.1;
      const x1 = hcx + Math.cos(angle) * d + Math.sin(angle) * r * 1.1;
      const y1 = hcy + Math.sin(angle) * d - Math.cos(angle) * r * 1.1;
      mctx.moveTo(x0, y0); mctx.lineTo(x1, y1);
    }
    mctx.stroke(); mctx.restore();
  }

  function annotLine(x1, y1, x2, y2, alpha) {
    inkLine(x1, y1, x2, y2, alpha, 0.6);
    const ang = Math.atan2(y2 - y1, x2 - x1) + Math.PI / 2;
    const tw = 4;
    s(alpha, 0.6, () => {
      mctx.moveTo(x2 + Math.cos(ang) * tw, y2 + Math.sin(ang) * tw);
      mctx.lineTo(x2 - Math.cos(ang) * tw, y2 - Math.sin(ang) * tw);
    });
  }

  function sketchCircle(scx, scy, r, alpha, w) {
    const wobble = r * 0.012;
    mctx.save(); mctx.strokeStyle = col(alpha); mctx.lineWidth = w;
    mctx.lineCap = 'round';
    for (let seg = 0; seg < 4; seg++) {
      const a0 = (seg / 4) * Math.PI * 2;
      const a1 = ((seg + 1) / 4) * Math.PI * 2;
      const wx = (Math.random() - 0.5) * wobble;
      const wy = (Math.random() - 0.5) * wobble;
      mctx.beginPath();
      mctx.arc(scx + wx, scy + wy, r, a0, a1);
      mctx.stroke();
    }
    mctx.restore();
  }

  function sketchArc(scx, scy, r, a0, a1, alpha, w) {
    s(alpha, w, () => mctx.arc(scx, scy, r, a0, a1));
  }

  function sketchPoly(pts, alpha, w, close = true) {
    mctx.save(); mctx.strokeStyle = col(alpha); mctx.lineWidth = w;
    mctx.lineCap = 'round'; mctx.lineJoin = 'round';
    mctx.beginPath();
    pts.forEach(([px, py], i) => {
      const jx = px + (Math.random() - 0.5) * 0.8;
      const jy = py + (Math.random() - 0.5) * 0.8;
      i === 0 ? mctx.moveTo(jx, jy) : mctx.lineTo(jx, jy);
    });
    if (close) mctx.closePath();
    mctx.stroke(); mctx.restore();
  }

  const signs = [
    (x, y, sz, a) => {
      const r = sz * 0.42;
      s(a, 0.9, () => {
        mctx.moveTo(x, y + r * 0.4);
        mctx.bezierCurveTo(x - r * 1.1, y - r * 1.4, x - r * 2.0, y + r * 0.1, x - r * 1.0, y + r * 1.0);
        mctx.moveTo(x, y + r * 0.4);
        mctx.bezierCurveTo(x + r * 1.1, y - r * 1.4, x + r * 2.0, y + r * 0.1, x + r * 1.0, y + r * 1.0);
        mctx.moveTo(x - r * 0.55, y + r * 0.85);
        mctx.lineTo(x + r * 0.55, y + r * 0.85);
      });
    },
    (x, y, sz, a) => {
      const r = sz * 0.38;
      sketchCircle(x, y + r * 0.5, r * 0.78, a, 0.85);
      s(a, 0.85, () => {
        mctx.moveTo(x - r * 0.78, y - r * 0.28);
        mctx.bezierCurveTo(x - r * 0.78, y - r * 1.3, x + r * 0.78, y - r * 1.3, x + r * 0.78, y - r * 0.28);
      });
    },
    (x, y, sz, a) => {
      const h = sz * 0.8, w = sz * 0.5, bar = sz * 0.14;
      s(a, 0.85, () => {
        mctx.moveTo(x - w, y - h / 2); mctx.lineTo(x - w, y + h / 2);
        mctx.moveTo(x + w, y - h / 2); mctx.lineTo(x + w, y + h / 2);
        mctx.moveTo(x - w - bar, y - h / 2);
        mctx.bezierCurveTo(x - w, y - h / 2 - bar * 2, x + w, y - h / 2 - bar * 2, x + w + bar, y - h / 2);
        mctx.moveTo(x - w - bar, y + h / 2);
        mctx.bezierCurveTo(x - w, y + h / 2 + bar * 2, x + w, y + h / 2 + bar * 2, x + w + bar, y + h / 2);
        mctx.moveTo(x - w, y); mctx.lineTo(x + w, y);
      });
    },
    (x, y, sz, a) => {
      const r = sz * 0.35;
      s(a, 0.9, () => {
        mctx.moveTo(x + r * 1.0, y - r * 0.1);
        mctx.bezierCurveTo(x + r * 1.0, y - r * 1.4, x - r * 1.4, y - r * 1.4, x - r * 1.0, y - r * 0.5);
        mctx.bezierCurveTo(x - r * 0.6, y + r * 0.3,  x + r * 0.6,  y + r * 0.3,  x + r * 0.2, y - r * 0.1);
        mctx.moveTo(x - r * 1.0, y + r * 0.1);
        mctx.bezierCurveTo(x - r * 1.0, y + r * 1.4, x + r * 1.4, y + r * 1.4, x + r * 1.0, y + r * 0.5);
        mctx.bezierCurveTo(x + r * 0.6, y - r * 0.3,  x - r * 0.6,  y - r * 0.3,  x - r * 0.2, y + r * 0.1);
      });
    },
    (x, y, sz, a) => {
      const r = sz * 0.32;
      sketchCircle(x - r * 0.3, y + r * 0.2, r, a, 0.85);
      s(a, 0.85, () => {
        mctx.moveTo(x + r * 0.7, y + r * 0.2);
        mctx.bezierCurveTo(x + r * 1.6, y + r * 0.2, x + r * 1.8, y - r * 1.0,
                            x + r * 0.8, y - r * 1.1);
        mctx.bezierCurveTo(x + r * 0.1, y - r * 1.2, x - r * 0.1, y - r * 0.5, x, y - r * 0.7);
      });
    },
    (x, y, sz, a) => {
      const h = sz * 0.7;
      s(a, 0.85, () => {
        mctx.moveTo(x - sz * 0.55, y - h * 0.5);
        mctx.bezierCurveTo(x - sz * 0.55, y - h * 1.0, x - sz * 0.15, y - h * 1.0, x - sz * 0.15, y - h * 0.5);
        mctx.lineTo(x - sz * 0.15, y + h * 0.5);
        mctx.moveTo(x - sz * 0.15, y - h * 0.5);
        mctx.bezierCurveTo(x - sz * 0.15, y - h * 1.0, x + sz * 0.25, y - h * 1.0, x + sz * 0.25, y - h * 0.5);
        mctx.lineTo(x + sz * 0.25, y + h * 0.3);
        mctx.bezierCurveTo(x + sz * 0.25, y + h * 1.0, x + sz * 0.7, y + h * 1.1,
                            x + sz * 0.72, y + h * 0.5);
        mctx.bezierCurveTo(x + sz * 0.72, y + h * 0.1, x + sz * 0.35, y + h * 0.05,
                            x + sz * 0.25, y + h * 0.3);
      });
    },
    (x, y, sz, a) => {
      const w = sz * 0.7, r = sz * 0.32;
      inkLine(x - w, y + r * 0.1, x + w, y + r * 0.1, a, 0.9);
      inkLine(x - w, y + r * 0.7, x + w, y + r * 0.7, a, 0.7);
      s(a, 0.85, () => { mctx.arc(x, y + r * 0.1, r, Math.PI, 0, true); });
    },
    (x, y, sz, a) => {
      const h = sz * 0.65;
      s(a, 0.85, () => {
        mctx.moveTo(x - sz * 0.55, y - h * 0.5);
        mctx.bezierCurveTo(x - sz * 0.55, y - h * 1.0, x - sz * 0.15, y - h * 1.0, x - sz * 0.15, y - h * 0.5);
        mctx.lineTo(x - sz * 0.15, y + h * 0.5);
        mctx.moveTo(x - sz * 0.15, y - h * 0.5);
        mctx.bezierCurveTo(x - sz * 0.15, y - h * 1.0, x + sz * 0.25, y - h * 1.0, x + sz * 0.25, y - h * 0.5);
        mctx.lineTo(x + sz * 0.25, y + h * 0.3);
        mctx.bezierCurveTo(x + sz * 0.25, y + h * 0.8, x + sz * 0.65, y + h * 0.8,
                            x + sz * 0.65, y + h * 0.4);
        mctx.moveTo(x + sz * 0.46, y + h * 0.18);
        mctx.lineTo(x + sz * 0.65, y + h * 0.4);
        mctx.lineTo(x + sz * 0.84, y + h * 0.18);
      });
    },
    (x, y, sz, a) => {
      const d = sz * 0.62;
      inkLine(x - d, y + d, x + d, y - d, a, 0.95);
      s(a, 0.9, () => {
        mctx.moveTo(x, y - d); mctx.lineTo(x + d, y - d); mctx.lineTo(x + d, y);
      });
      inkLine(x - d * 0.3, y + d * 0.3, x + d * 0.3, y - d * 0.3, a, 0.5);
    },
    (x, y, sz, a) => {
      const r = sz * 0.4;
      s(a, 0.9, () => {
        mctx.moveTo(x - r * 1.1, y - r * 0.9);
        mctx.bezierCurveTo(x - r * 0.4, y + r * 0.5, x - r * 0.1, y + r * 0.7, x + r * 0.2, y + r * 0.5);
        mctx.bezierCurveTo(x + r * 0.7, y + r * 0.2, x + r * 1.2, y - r * 0.4,
                            x + r * 0.9, y - r * 0.9);
        mctx.bezierCurveTo(x + r * 0.6, y - r * 1.3, x + r * 0.0, y - r * 0.8, x + r * 0.3, y - r * 0.2);
        mctx.bezierCurveTo(x + r * 0.5, y + r * 0.1, x + r * 1.0, y + r * 0.3, x + r * 1.3, y + r * 0.1);
      });
    },
    (x, y, sz, a) => {
      const w = sz * 0.72, amp = sz * 0.18;
      for (const dy of [-amp, amp]) {
        s(a, 0.88, () => {
          mctx.moveTo(x - w, y + dy);
          mctx.bezierCurveTo(x - w * 0.5, y + dy - amp * 1.5, x - w * 0.1, y + dy + amp * 1.5, x, y + dy);
          mctx.bezierCurveTo(x + w * 0.1, y + dy - amp * 1.5, x + w * 0.5, y + dy + amp * 1.5, x + w, y + dy);
        });
      }
    },
    (x, y, sz, a) => {
      const r = sz * 0.48, gap = sz * 0.18;
      s(a, 0.85, () => {
        mctx.arc(x - gap, y, r, Math.PI * 0.5, Math.PI * 1.5, true);
        mctx.moveTo(x + gap + 0.1, y);
        mctx.arc(x + gap, y, r, Math.PI * 1.5, Math.PI * 0.5, true);
      });
      inkLine(x - gap - r * 0.2, y, x + gap + r * 0.2, y, a, 0.75);
    },
  ];

  const planets = [
    (x, y, sz, a) => {
      sketchCircle(x, y, sz * 0.42, a, 0.85);
      f(a * 0.9, () => mctx.arc(x, y, sz * 0.13, 0, Math.PI * 2));
      for (let i = 0; i < 8; i++) {
        const ang = (i / 8) * Math.PI * 2;
        const r1 = sz * 0.52, r2 = sz * 0.68;
        inkLine(x + Math.cos(ang) * r1, y + Math.sin(ang) * r1,
                x + Math.cos(ang) * r2, y + Math.sin(ang) * r2, a * 0.6, 0.7);
      }
    },
    (x, y, sz, a) => {
      s(a, 0.85, () => {
        mctx.moveTo(x + sz * 0.28, y - sz * 0.52);
        mctx.bezierCurveTo(x - sz * 0.7, y - sz * 0.52, x - sz * 0.7, y + sz * 0.52,
                            x + sz * 0.28, y + sz * 0.52);
        mctx.bezierCurveTo(x - sz * 0.1, y + sz * 0.25, x - sz * 0.1, y - sz * 0.25,
                            x + sz * 0.28, y - sz * 0.52);
      });
      hatch(x - sz * 0.15, y, sz * 0.45, Math.PI / 5, a * 0.12, 4);
    },
    (x, y, sz, a) => {
      sketchCircle(x, y, sz * 0.3, a, 0.8);
      inkLine(x, y + sz * 0.3, x, y + sz * 0.75, a, 0.8);
      inkLine(x - sz * 0.28, y + sz * 0.52, x + sz * 0.28, y + sz * 0.52, a, 0.75);
      s(a, 0.8, () => {
        mctx.moveTo(x - sz * 0.3, y - sz * 0.3);
        mctx.bezierCurveTo(x - sz * 0.3, y - sz * 0.75, x + sz * 0.3, y - sz * 0.75,
                            x + sz * 0.3, y - sz * 0.3);
      });
    },
    (x, y, sz, a) => {
      sketchCircle(x, y - sz * 0.22, sz * 0.38, a, 0.85);
      inkLine(x, y + sz * 0.16, x, y + sz * 0.72, a, 0.85);
      inkLine(x - sz * 0.26, y + sz * 0.44, x + sz * 0.26, y + sz * 0.44, a, 0.78);
    },
    (x, y, sz, a) => {
      sketchCircle(x - sz * 0.1, y + sz * 0.1, sz * 0.36, a, 0.85);
      inkLine(x + sz * 0.16, y - sz * 0.16, x + sz * 0.55, y - sz * 0.55, a, 0.85);
      s(a, 0.85, () => {
        mctx.moveTo(x + sz * 0.25, y - sz * 0.55);
        mctx.lineTo(x + sz * 0.55, y - sz * 0.55);
        mctx.lineTo(x + sz * 0.55, y - sz * 0.25);
      });
    },
    (x, y, sz, a) => {
      s(a, 0.85, () => {
        mctx.moveTo(x - sz * 0.2, y - sz * 0.6);
        mctx.bezierCurveTo(x - sz * 0.6, y - sz * 0.6, x - sz * 0.6, y + sz * 0.05,
                            x + sz * 0.5, y + sz * 0.05);
      });
      inkLine(x + sz * 0.2, y - sz * 0.7, x + sz * 0.2, y + sz * 0.65, a, 0.85);
      inkLine(x - sz * 0.45, y + sz * 0.3, x + sz * 0.5, y + sz * 0.3, a, 0.75);
    },
    (x, y, sz, a) => {
      inkLine(x + sz * 0.15, y - sz * 0.7, x + sz * 0.15, y + sz * 0.55, a, 0.85);
      s(a, 0.85, () => {
        mctx.moveTo(x - sz * 0.1, y - sz * 0.7);
        mctx.bezierCurveTo(x - sz * 0.55, y - sz * 0.7, x - sz * 0.55, y - sz * 0.1,
                            x + sz * 0.15, y - sz * 0.1);
      });
      inkLine(x - sz * 0.25, y + sz * 0.55, x + sz * 0.4, y + sz * 0.55, a, 0.78);
      inkLine(x + sz * 0.07, y + sz * 0.42, x + sz * 0.07, y + sz * 0.68, a, 0.78);
    },
    (x, y, sz, a) => {
      sketchCircle(x, y, sz * 0.3, a, 0.8);
      f(a * 0.9, () => mctx.arc(x, y, sz * 0.1, 0, Math.PI * 2));
      inkLine(x, y - sz * 0.3, x, y - sz * 0.7, a, 0.8);
      inkLine(x - sz * 0.3, y, x - sz * 0.6, y, a, 0.75);
      inkLine(x + sz * 0.3, y, x + sz * 0.6, y, a, 0.75);
    },
    (x, y, sz, a) => {
      inkLine(x, y - sz * 0.7, x, y + sz * 0.5, a, 0.85);
      inkLine(x - sz * 0.35, y + sz * 0.35, x + sz * 0.35, y + sz * 0.35, a, 0.78);
      s(a, 0.85, () => {
        mctx.moveTo(x - sz * 0.42, y - sz * 0.2);
        mctx.bezierCurveTo(x - sz * 0.42, y - sz * 0.7, x + sz * 0.42, y - sz * 0.7,
                            x + sz * 0.42, y - sz * 0.2);
        mctx.moveTo(x - sz * 0.42, y - sz * 0.1);
        mctx.lineTo(x - sz * 0.42, y - sz * 0.55);
        mctx.moveTo(x + sz * 0.42, y - sz * 0.1);
        mctx.lineTo(x + sz * 0.42, y - sz * 0.55);
      });
    },
    (x, y, sz, a) => {
      sketchCircle(x, y - sz * 0.5, sz * 0.22, a, 0.8);
      s(a, 0.82, () => {
        mctx.moveTo(x - sz * 0.32, y - sz * 0.2);
        mctx.bezierCurveTo(x - sz * 0.32, y - sz * 0.7, x + sz * 0.32, y - sz * 0.7,
                            x + sz * 0.32, y - sz * 0.2);
      });
      inkLine(x, y - sz * 0.2, x, y + sz * 0.5, a, 0.8);
      inkLine(x - sz * 0.28, y + sz * 0.2, x + sz * 0.28, y + sz * 0.2, a, 0.72);
    },
  ];

  for (let yy = cy - 220; yy <= cy + 220; yy += 18) {
    s(0.028, 0.4, () => { mctx.moveTo(cx - 240, yy); mctx.lineTo(cx + 240, yy); });
  }
  for (let i = 0; i < 12; i++) {
    const ang = (i / 12) * Math.PI * 2;
    s(0.035, 0.4, () => {
      mctx.moveTo(cx + Math.cos(ang) * 50, cy + Math.sin(ang) * 50);
      mctx.lineTo(cx + Math.cos(ang) * 230, cy + Math.sin(ang) * 230);
    });
  }

  const RING_OUT = 222, RING_IN = 188;
  sketchCircle(cx, cy, RING_OUT, 0.14, 1.0);
  sketchCircle(cx, cy, RING_IN,  0.10, 0.7);

  for (let i = 0; i < 72; i++) {
    const ang = (i / 72) * Math.PI * 2;
    const isSign = i % 6 === 0;
    const r0 = isSign ? RING_IN - 4 : RING_IN + 2;
    inkLine(
      cx + Math.cos(ang) * r0,      cy + Math.sin(ang) * r0,
      cx + Math.cos(ang) * RING_OUT, cy + Math.sin(ang) * RING_OUT,
      isSign ? 0.18 : 0.07, isSign ? 0.9 : 0.45
    );
  }

  const signR = (RING_IN + RING_OUT) / 2;
  for (let i = 0; i < 12; i++) {
    const ang  = (i / 12) * Math.PI * 2 - Math.PI / 2;
    const gx   = cx + Math.cos(ang) * signR;
    const gy   = cy + Math.sin(ang) * signR;
    mctx.save();
    mctx.translate(gx, gy);
    signs[i](0, 0, 9, 0.30);
    mctx.restore();
  }

  const PLANET_R = 152;
  sketchCircle(cx, cy, PLANET_R, 0.09, 0.6);

  for (let i = 0; i < 10; i++) {
    const ang = (i / 10) * Math.PI * 2 - Math.PI / 2;
    const px  = cx + Math.cos(ang) * PLANET_R;
    const py  = cy + Math.sin(ang) * PLANET_R;
    mctx.save();
    mctx.translate(px, py);
    planets[i](0, 0, 9, 0.28);
    mctx.restore();
    annotLine(
      px + Math.cos(ang) * 11, py + Math.sin(ang) * 11,
      cx + Math.cos(ang) * (PLANET_R + 20), cy + Math.sin(ang) * (PLANET_R + 20),
      0.07
    );
  }

  const ASPECT_R = 110;
  sketchCircle(cx, cy, ASPECT_R, 0.10, 0.7);

  const aspectPts = Array.from({ length: 12 }, (_, i) => {
    const ang = (i / 12) * Math.PI * 2 - Math.PI / 2;
    return [cx + Math.cos(ang) * ASPECT_R, cy + Math.sin(ang) * ASPECT_R];
  });

  sketchPoly([[...aspectPts[0]], [...aspectPts[4]], [...aspectPts[8]]], 0.09, 0.75);
  sketchPoly([[...aspectPts[1]], [...aspectPts[4]], [...aspectPts[7]], [...aspectPts[10]]], 0.08, 0.65);
  sketchPoly([[0,2,4,6,8,10].map(i => aspectPts[i])[0],
              [0,2,4,6,8,10].map(i => aspectPts[i])[1],
              [0,2,4,6,8,10].map(i => aspectPts[i])[2],
              [0,2,4,6,8,10].map(i => aspectPts[i])[3],
              [0,2,4,6,8,10].map(i => aspectPts[i])[4],
              [0,2,4,6,8,10].map(i => aspectPts[i])[5]], 0.07, 0.55);

  const INNER_R = 58;
  sketchCircle(cx, cy, INNER_R, 0.11, 0.7);

  inkLine(cx - INNER_R, cy, cx + INNER_R, cy, 0.12, 0.8);
  inkLine(cx, cy - INNER_R, cx, cy + INNER_R, 0.12, 0.8);
  inkLine(cx - INNER_R, cy + 1.2, cx + INNER_R, cy + 1.2, 0.04, 0.45);
  inkLine(cx + 1.2, cy - INNER_R, cx + 1.2, cy + INNER_R, 0.04, 0.45);

  const elemSz = 7;
  [[1, 0], [0, -1], [-1, 0], [0, 1]].forEach(([ex, ey], i) => {
    const ex0 = cx + ex * INNER_R * 0.62, ey0 = cy + ey * INNER_R * 0.62;
    const rot = [0, Math.PI, 0, Math.PI][i];
    const pts = [0, 1, 2].map(k => {
      const a = k * (Math.PI * 2 / 3) + Math.PI / 6 + rot;
      return [ex0 + Math.cos(a) * elemSz, ey0 + Math.sin(a) * elemSz];
    });
    sketchPoly(pts, 0.14, 0.7);
    if (i % 2 === 1) {
      const midX = (pts[0][0] + pts[1][0]) / 2;
      const midY = (pts[0][1] + pts[1][1]) / 2;
      inkLine(pts[0][0] * 0.35 + pts[2][0] * 0.65,
              pts[0][1] * 0.35 + pts[2][1] * 0.65,
              pts[1][0] * 0.35 + pts[2][0] * 0.65,
              pts[1][1] * 0.35 + pts[2][1] * 0.65, 0.13, 0.65);
    }
  });

  const CR = 20;
  sketchCircle(cx, cy, CR, 0.18, 1.0);
  hatch(cx, cy, CR, Math.PI / 4, 0.06, 5);

  s(0.07, 0.65, () => {
    mctx.arc(cx - CR * 0.5, cy, CR, -Math.PI * 0.8, Math.PI * 0.8);
    mctx.arc(cx + CR * 0.5, cy, CR, Math.PI * 0.2, Math.PI * 1.8);
  });

  for (let i = 0; i < 8; i++) {
    const ang = (i / 8) * Math.PI * 2;
    const r1 = CR + 3, r2 = i % 2 === 0 ? CR + 14 : CR + 9;
    inkLine(cx + Math.cos(ang) * r1, cy + Math.sin(ang) * r1,
            cx + Math.cos(ang) * r2, cy + Math.sin(ang) * r2,
            0.22, i % 2 === 0 ? 1.0 : 0.7);
  }

  f(0.28, () => mctx.arc(cx, cy, 3.5, 0, Math.PI * 2));
}

// ── Dispatcher ────────────────────────────────────────────────────────────
function paintMandala(style) {
  if      (style==='mandala-sacred') paintSacred();
  else if (style==='mandala-floral') paintFloral();
  else if (style==='mandala-astro')  paintAstro();
  else mctx.clearRect(0,0,MW,MH);
}
