// fp.js — Featured Practice post type: layout, inputs, photo, caption
// Depends on: state, escapeHtml(), setHtmlFP() from main.js

let mainTextTopAdjust  = 120;
let bodyTextTopAdjust  = 0;
let bodyTextLeftAdjust = 0;
let mainTextWidth      = 210;

// ── Layout sync ───────────────────────────────────────────────────────────
function syncOffsets() {
  if (state.postType !== 'fp') return;
  const titleWrap    = document.getElementById('post-title-wrap');
  const mainTextWrap = document.getElementById('main-text-wrap');
  const textFlow     = document.getElementById('text-flow-wrap');
  const symbolFP     = document.getElementById('c-symbol-fp');
  const postInnerFP  = document.getElementById('post-inner-fp');

  const titleH = titleWrap.offsetHeight;
  textFlow.style.paddingTop = titleH > 0 ? (titleH+8)+'px' : '0px';

  requestAnimationFrame(()=>{
    const innerRect    = postInnerFP.getBoundingClientRect();
    const symbolRect   = symbolFP.getBoundingClientRect();
    const symbolBottom = symbolRect.bottom - innerRect.top;

    mainTextWrap.style.position = 'absolute';
    mainTextWrap.style.zIndex   = '10';
    mainTextWrap.style.left     = '20px';
    mainTextWrap.style.top      = (symbolBottom + mainTextTopAdjust) + 'px';

    requestAnimationFrame(()=>{
      const mainH    = mainTextWrap.offsetHeight;
      const totalPad = (mainH>0 ? mainH+8 : 0) + mainTextTopAdjust + bodyTextTopAdjust;
      document.getElementById('c-text-fp').style.paddingTop = totalPad + 'px';
      document.getElementById('c-text-fp').style.marginLeft  =  bodyTextLeftAdjust + 'px';
      document.getElementById('c-text-fp').style.marginRight =  bodyTextLeftAdjust + 'px';

      const detailsList  = document.getElementById('c-details-list');
      const symbolChar   = document.getElementById('c-symbol-char');
      if (detailsList && symbolChar && mainTextWrap) {
        const detailsRect  = detailsList.getBoundingClientRect();
        const mainTextRect = mainTextWrap.getBoundingClientRect();
        const symbolElRect = symbolFP.getBoundingClientRect();
        const midY = (detailsRect.bottom + mainTextRect.top) / 2;
        symbolChar.style.position = 'absolute';
        symbolChar.style.top  = (midY - symbolElRect.top - symbolChar.offsetHeight/2) + 'px';
        symbolChar.style.left = '70px';
      }
    });
  });
}

function initFPResizeObservers() {
  new ResizeObserver(syncOffsets).observe(document.getElementById('post-title-wrap'));
  new ResizeObserver(syncOffsets).observe(document.getElementById('main-text-wrap'));
  requestAnimationFrame(()=>requestAnimationFrame(syncOffsets));
}

// ── Content inputs ────────────────────────────────────────────────────────
function initFPInputs() {
  const bind = (id, fn) => {
    const el = document.getElementById(id);
    if (el) el.addEventListener('input', fn);
  };

  bind('f-header', function() {
    document.getElementById('c-header').textContent = this.value;
  });
  bind('f-post-supersupertitle', function() {
    document.getElementById('c-post-supersupertitle').innerHTML = `<span>${this.value}</span>`;
  });
  bind('f-post-supertitle', function() {
    document.getElementById('c-post-supertitle').innerHTML = `<span>${this.value}</span>`;
  });
  bind('f-post-title', function() {
    document.getElementById('c-post-title').innerHTML = `<span>${this.value}</span>`;
  });
  bind('f-post-subtitle',  updateSubtitle);
  bind('f-post-subtitle2', updateSubtitle);
  bind('f-subtitle-separate', updateSubtitle);
  document.getElementById('f-subtitle-separate')?.addEventListener('change', function() {
    updateSubtitle();
    queueSheetWrite('subtitle separate', this.checked ? 'true' : 'false');
    state.save();
  });
  bind('f-post-subsubtitle', function() {
    document.getElementById('c-post-subsubtitle').innerHTML = `<span>${this.value}</span>`;
  });
  ['f-detail-1','f-detail-2','f-detail-3','f-detail-4'].forEach(id=>{
    bind(id, updateDetailsList);
  });
bind('f-title-fp', function() {
    const v = this.value;
    document.getElementById('c-text-main').textContent = v ? '\u201C' + v + '\u201D' : '';
  });
  bind('f-body-fp', function() {
    const v = this.value;
    setHtmlFP(document.getElementById('c-body-fp'), v ? '\u201C' + v + '\u201D' : v);
  });
  bind('f-fontsize-title', function() {
    document.getElementById('c-post-title').style.fontSize = this.value + 'rem';
    document.getElementById('title-font-size-label').textContent = this.value;
    state.save();
    queueSheetWrite('title font size', this.value);
  });
  bind('f-fontsize-fp', function() {
    document.getElementById('c-text-fp').style.fontSize = this.value+'rem';
    document.getElementById('font-size-label-fp').textContent = this.value;
    state.save();
    queueSheetWrite('font size', this.value);
  });
  bind('f-main-text-width', function() {
    mainTextWidth = parseInt(this.value);
    document.getElementById('main-text-width-label').textContent = this.value;
    document.getElementById('main-text-wrap').style.maxWidth = mainTextWidth + 'px';
    syncOffsets();
    queueSheetWrite('main text width', this.value);
  });
  bind('f-main-text-top', function() {
    mainTextTopAdjust = parseInt(this.value);
    document.getElementById('main-text-top-label').textContent = this.value;
    syncOffsets();
    queueSheetWrite('main text top', this.value);
  });
  bind('f-body-text-top', function() {
    bodyTextTopAdjust = parseInt(this.value);
    document.getElementById('body-text-top-label').textContent = this.value;
    syncOffsets();
    queueSheetWrite('body text top', this.value);
  });
  bind('f-body-text-left', function() {
    bodyTextLeftAdjust = parseInt(this.value);
    document.getElementById('body-text-left-label').textContent = this.value;
    syncOffsets();
    queueSheetWrite('body text left', this.value);
  });
}

function updateSubtitle() {
  const s1 = document.getElementById('f-post-subtitle').value;
  const s2 = document.getElementById('f-post-subtitle2').value;
  const separate = document.getElementById('f-subtitle-separate')?.checked;
  let inner;
  if (separate && s1 && s2) {
    inner = `<span>${escapeHtml(s1)}</span><br><span>${escapeHtml(s2)}</span>`;
  } else {
    const combined = s1 && s2 ? `${s1} \u2013 ${s2}` : (s1 || s2);
    inner = `<span>${escapeHtml(combined)}</span>`;
  }
  document.getElementById('c-post-subtitle').innerHTML = inner;
}

function updateDetailsList() {
  const listEl = document.getElementById('c-details-list');
  if (!listEl) return;
  const items = ['f-detail-1','f-detail-2','f-detail-3','f-detail-4']
    .map(id=>document.getElementById(id).value.trim())
    .filter(v=>v.length>0);
  listEl.innerHTML = items.map(v=>`<li>${escapeHtml(v)}</li>`).join('');
}

// ── Caption ───────────────────────────────────────────────────────────────
function updateCaption() {
  const subtitle1 = document.getElementById('f-post-subtitle').value.trim();
  const title     = document.getElementById('f-post-title').value.trim();
  const subtitle2 = document.getElementById('f-post-subtitle2').value.trim();
  const mainText  = document.getElementById('f-title-fp').value.trim();
  const bodyText  = document.getElementById('f-body-fp').value.trim();
  const detail1   = document.getElementById('f-detail-1').value.trim();
  const tags = '#Reiki #ReikiHealing #ReikiMaster #EnergyHealing #ReikiPractitioner';

  const lines = [
    `American Reiki Association "Featured Practice" — ${subtitle1} of ${title} in ${subtitle2}`,
    '',
    mainText ? `Q: ${mainText}` : null,
    bodyText ? `A: ${bodyText}` : null,
    detail1  ? ''               : null,
    detail1  || null,
    '',
    tags,
  ].filter(l=>l!==null);

  document.getElementById('caption-output').value = lines.join('\n');
}

function initCaption() {
  ['f-post-subtitle','f-post-title','f-post-subtitle2','f-title-fp','f-body-fp','f-detail-1'].forEach(id=>{
    const el = document.getElementById(id);
    if (el) { el.addEventListener('input', updateCaption); el.addEventListener('change', updateCaption); }
  });
  document.getElementById('copy-caption-btn').addEventListener('click', function() {
    const ta = document.getElementById('caption-output');
    ta.select(); ta.setSelectionRange(0,99999);
    try { navigator.clipboard.writeText(ta.value).catch(()=>document.execCommand('copy')); }
    catch(e) { document.execCommand('copy'); }
    this.textContent='✓ Copied!'; this.classList.add('copied');
    setTimeout(()=>{ this.textContent='Copy Caption'; this.classList.remove('copied'); }, 2000);
  });
}

// ── Photo ─────────────────────────────────────────────────────────────────
let photoCanvas=null, photoCtx=null;
const pan = {x:50, y:50};
let drag = {active:false, startX:0, startY:0, startPanX:0, startPanY:0};
let loadedImage = null;

function ensurePhotoCanvas() {
  const photoWrap = document.getElementById('photo-wrap');
  if (!photoCanvas) {
    photoCanvas = document.createElement('canvas');
    photoCanvas.style.cssText='position:absolute;top:0;left:0;width:100%;height:100%;display:block;';
    photoWrap.appendChild(photoCanvas);
    photoCtx = photoCanvas.getContext('2d');
  }
}

function getCoverParams(imgW,imgH,frameW,frameH,panX,panY) {
  const imgAR=imgW/imgH, frameAR=frameW/frameH;
  let drawW, drawH;
  if (imgAR>frameAR) { drawH=frameH; drawW=frameH*imgAR; }
  else               { drawW=frameW; drawH=frameW/imgAR; }
  return { drawX:-(panX/100)*(drawW-frameW), drawY:-(panY/100)*(drawH-frameH), drawW, drawH };
}

function getCoverSize(imgW,imgH,frameW,frameH) {
  const r=imgW/imgH, fr=frameW/frameH;
  return r>fr ? {cw:frameH*r,ch:frameH} : {cw:frameW,ch:frameW/r};
}

function deltaToPanPct(dPx,frameSize,coverSize) {
  return (dPx/Math.max(coverSize-frameSize,1))*100;
}

function redrawPhoto() {
  const photoWrap = document.getElementById('photo-wrap');
  if (!loadedImage||!photoCanvas) return;
  const dpr=window.devicePixelRatio||1;
  const fw=photoWrap.offsetWidth ||parseInt(document.getElementById('f-photo-size').value);
  const fh=photoWrap.offsetHeight||parseInt(document.getElementById('f-photo-size').value);
  const shape=document.getElementById('f-photo-shape').value;

  photoCanvas.width=fw*dpr; photoCanvas.height=fh*dpr;
  photoCtx.setTransform(dpr,0,0,dpr,0,0);
  photoCtx.save(); photoCtx.beginPath();
  if (shape==='circle') {
    const r=Math.min(fw,fh)/2; photoCtx.arc(fw/2,fh/2,r,0,Math.PI*2);
  } else if (shape==='rounded') {
    const r=14;
    photoCtx.moveTo(r,0); photoCtx.lineTo(fw-r,0); photoCtx.quadraticCurveTo(fw,0,fw,r);
    photoCtx.lineTo(fw,fh-r); photoCtx.quadraticCurveTo(fw,fh,fw-r,fh);
    photoCtx.lineTo(r,fh); photoCtx.quadraticCurveTo(0,fh,0,fh-r);
    photoCtx.lineTo(0,r); photoCtx.quadraticCurveTo(0,0,r,0);
  } else { photoCtx.rect(0,0,fw,fh); }
  photoCtx.clip();
  const {drawX,drawY,drawW,drawH}=getCoverParams(loadedImage.naturalWidth,loadedImage.naturalHeight,fw,fh,pan.x,pan.y);
  photoCtx.drawImage(loadedImage,drawX,drawY,drawW,drawH);
  photoCtx.restore();
}

function showHint() {
  const photoWrap = document.getElementById('photo-wrap');
  photoWrap.classList.add('show-hint');
  setTimeout(()=>photoWrap.classList.remove('show-hint'),1800);
}

function updatePhoto() {
  const photoWrap = document.getElementById('photo-wrap');
  const flowWrap  = document.getElementById('text-flow-wrap');
  const size      = parseInt(document.getElementById('f-photo-size').value);
  const placement = document.getElementById('f-photo-placement').value;
  const shape     = document.getElementById('f-photo-shape').value;
  const border    = document.getElementById('f-photo-border').checked;

  photoWrap.className=['shape-'+shape, border?'with-border':'', 'draggable'].filter(Boolean).join(' ');
  photoWrap.style.width    = size+'px';
  photoWrap.style.height   = size+'px';
  photoWrap.style.position = 'relative';
  photoWrap.style.cssFloat = placement==='top-left' ? 'left' : 'right';
  photoWrap.style.margin   = placement==='top-left' ? '0 14px 10px 0' : '-149px -78px 9px 14px';
  photoWrap.style.display  = 'block';
  flowWrap.style.display   = 'block';

  if      (shape==='circle')  { photoWrap.style.shapeOutside='circle(43%)';        photoWrap.style.borderRadius='50%'; }
  else if (shape==='rounded') { photoWrap.style.shapeOutside='inset(0 round 14px)'; photoWrap.style.borderRadius='14px'; }
  else                        { photoWrap.style.shapeOutside='inset(0)';            photoWrap.style.borderRadius='0'; }

  photoWrap.style.shapeMargin = '0px';

  requestAnimationFrame(redrawPhoto);
}

function initPhoto() {
  const photoWrap = document.getElementById('photo-wrap');

  photoWrap.addEventListener('mousedown', e=>{
    if (!loadedImage) return; e.preventDefault();
    drag={active:true,startX:e.clientX,startY:e.clientY,startPanX:pan.x,startPanY:pan.y};
    photoWrap.classList.add('dragging');
  });
  document.addEventListener('mousemove', e=>{
    if (!drag.active||!loadedImage) return;
    const fw=photoWrap.offsetWidth, fh=photoWrap.offsetHeight;
    const {cw,ch}=getCoverSize(loadedImage.naturalWidth,loadedImage.naturalHeight,fw,fh);
    pan.x=Math.max(0,Math.min(100,drag.startPanX-deltaToPanPct(e.clientX-drag.startX,fw,cw)));
    pan.y=Math.max(0,Math.min(100,drag.startPanY-deltaToPanPct(e.clientY-drag.startY,fh,ch)));
    redrawPhoto();
  });
  document.addEventListener('mouseup', ()=>{ if(drag.active){drag.active=false;photoWrap.classList.remove('dragging');state.save();queueSheetWrite('image pan x', String(pan.x));queueSheetWrite('image pan y', String(pan.y));} });
  photoWrap.addEventListener('touchstart', e=>{
    if (!loadedImage) return;
    const t=e.touches[0];
    drag={active:true,startX:t.clientX,startY:t.clientY,startPanX:pan.x,startPanY:pan.y};
  },{passive:true});
  document.addEventListener('touchmove', e=>{
    if (!drag.active||!loadedImage) return; e.preventDefault();
    const t=e.touches[0];
    const fw=photoWrap.offsetWidth, fh=photoWrap.offsetHeight;
    const {cw,ch}=getCoverSize(loadedImage.naturalWidth,loadedImage.naturalHeight,fw,fh);
    pan.x=Math.max(0,Math.min(100,drag.startPanX-deltaToPanPct(t.clientX-drag.startX,fw,cw)));
    pan.y=Math.max(0,Math.min(100,drag.startPanY-deltaToPanPct(t.clientY-drag.startY,fh,ch)));
    redrawPhoto();
  },{passive:false});
  document.addEventListener('touchend', ()=>{ if(drag.active){drag.active=false;state.save();queueSheetWrite('image pan x', String(pan.x));queueSheetWrite('image pan y', String(pan.y));} });

  document.getElementById('f-photo').addEventListener('change', function() {
    const file=this.files[0]; if (!file) return;
    const img=new Image();
    img.onload=()=>{
      loadedImage=img; pan.x=50; pan.y=50;
      document.getElementById('photo-controls').style.display='block';
      const photoWrap=document.getElementById('photo-wrap');
      photoWrap.style.display='block';
      document.getElementById('text-flow-wrap').style.display='block';
      updatePhoto();
      requestAnimationFrame(()=>requestAnimationFrame(()=>{ ensurePhotoCanvas(); redrawPhoto(); showHint(); }));
    };
    img.src=URL.createObjectURL(file);
    queueSheetWrite('image file', file.name);
  });


  document.getElementById('f-photo-placement').addEventListener('change', updatePhoto);
  document.getElementById('f-photo-shape').addEventListener('change', updatePhoto);
  document.getElementById('f-photo-size').addEventListener('input', function() {
    document.getElementById('photo-size-label').textContent=this.value; updatePhoto();
  });
  document.getElementById('f-photo-border').addEventListener('change', updatePhoto);
  document.getElementById('reset-pan-btn').addEventListener('click', ()=>{ pan.x=50; pan.y=50; redrawPhoto(); showHint(); state.save(); queueSheetWrite('image pan x', '50'); queueSheetWrite('image pan y', '50'); });
  document.getElementById('remove-photo-btn').addEventListener('click', function() {
    const photoWrap=document.getElementById('photo-wrap');
    photoWrap.style.cssFloat=''; photoWrap.style.display='none';
    photoWrap.style.margin=''; photoWrap.className='';
    loadedImage=null;
    if (photoCanvas) { photoCanvas.remove(); photoCanvas=null; photoCtx=null; }
    document.getElementById('f-photo').value='';
    document.getElementById('photo-controls').style.display='none';
  });
}

// ── Load FP photo from URL (used by sheet-loader and initFP default) ──────
function loadFPPhotoFromUrl(src) {
  const img = new Image();
  img.onload = () => {
    loadedImage = img;
    document.getElementById('photo-controls').style.display = 'block';
    const photoWrap = document.getElementById('photo-wrap');
    photoWrap.style.display = 'block';
    document.getElementById('text-flow-wrap').style.display = 'block';
    updatePhoto();
    requestAnimationFrame(() => requestAnimationFrame(() => {
      ensurePhotoCanvas();
      redrawPhoto();
    }));
  };
  img.onerror = () => console.warn('[fp] Could not load image:', src);
  img.src = src;
}

// ── Download helper (called by main.js) ───────────────────────────────────
function getPhotoExportCloneHandler(exportScale) {
  return function(clonedDoc) {
      const inner = clonedDoc.getElementById('post-inner-fp');
          if (inner) inner.style.background = 'transparent';
    if (!loadedImage) return;
    const photoWrap   = document.getElementById('photo-wrap');
    const clonedWrap  = clonedDoc.getElementById('photo-wrap');
    if (!clonedWrap) return;
    Array.from(clonedWrap.querySelectorAll('canvas')).forEach(c=>c.remove());
    const fw=photoWrap.offsetWidth, fh=photoWrap.offsetHeight;
    const shape=document.getElementById('f-photo-shape').value;
    const hiCanvas=clonedDoc.createElement('canvas');
    hiCanvas.width=fw*exportScale; hiCanvas.height=fh*exportScale;
    hiCanvas.style.cssText=`position:absolute;top:0;left:0;width:${fw}px;height:${fh}px;display:block;`;
    const ctx=hiCanvas.getContext('2d'); ctx.scale(exportScale,exportScale);
    ctx.beginPath();
    if (shape==='circle') { ctx.arc(fw/2,fh/2,Math.min(fw,fh)/2,0,Math.PI*2); }
    else if (shape==='rounded') {
      const r=14; ctx.moveTo(r,0); ctx.lineTo(fw-r,0); ctx.quadraticCurveTo(fw,0,fw,r);
      ctx.lineTo(fw,fh-r); ctx.quadraticCurveTo(fw,fh,fw-r,fh);
      ctx.lineTo(r,fh); ctx.quadraticCurveTo(0,fh,0,fh-r);
      ctx.lineTo(0,r); ctx.quadraticCurveTo(0,0,r,0);
    } else { ctx.rect(0,0,fw,fh); }
    ctx.clip();
    const {drawX,drawY,drawW,drawH}=getCoverParams(loadedImage.naturalWidth,loadedImage.naturalHeight,fw,fh,pan.x,pan.y);
    ctx.drawImage(loadedImage,drawX,drawY,drawW,drawH);
    clonedWrap.appendChild(hiCanvas);
  };
}

// ── State serialisation helpers (called by main.js persistence) ───────────
function getFPState() {
  return {
    header:          document.getElementById('f-header').value,
    supersupertitle: document.getElementById('f-post-supersupertitle').value,
    supertitle:      document.getElementById('f-post-supertitle').value,
    title:           document.getElementById('f-post-title').value,
    subtitle:        document.getElementById('f-post-subtitle').value,
    subtitle2:       document.getElementById('f-post-subtitle2').value,
    subsubtitle:     document.getElementById('f-post-subsubtitle').value,
    detail1:         document.getElementById('f-detail-1').value,
    detail2:         document.getElementById('f-detail-2').value,
    detail3:         document.getElementById('f-detail-3').value,
    detail4:         document.getElementById('f-detail-4').value,
    panX:            pan.x,
    panY:            pan.y,
    fontSizeTitle:   document.getElementById('f-fontsize-title').value,
    mainTextFP:      document.getElementById('f-title-fp').value,
    mainTextTop:     document.getElementById('f-main-text-top').value,
    mainTextWidth:   document.getElementById('f-main-text-width').value,
    bodyTextTop:     document.getElementById('f-body-text-top').value,
    bodyTextLeft:    document.getElementById('f-body-text-left').value,
    bodyTextFP:      document.getElementById('f-body-fp').value,
    fontSizeFP:      document.getElementById('f-fontsize-fp').value,
    tipNumFP:        document.getElementById('f-tipnum-fp').value,
    photoPlacement:   document.getElementById('f-photo-placement').value,
    photoShape:       document.getElementById('f-photo-shape').value,
    photoSize:        document.getElementById('f-photo-size').value,
    photoBorder:      document.getElementById('f-photo-border').checked,
    subtitleSeparate: document.getElementById('f-subtitle-separate').checked,
  };
}

function applyFPState(s) {
  const set=(id,val)=>{ if(val!=null) document.getElementById(id).value=val; };
  set('f-header',               s.header);
  set('f-post-supersupertitle', s.supersupertitle);
  set('f-post-supertitle',      s.supertitle);
  set('f-post-title',           s.title);
  set('f-post-subtitle',        s.subtitle);
  set('f-post-subtitle2',       s.subtitle2);
  set('f-post-subsubtitle',     s.subsubtitle);
  set('f-detail-1',             s.detail1);
  set('f-detail-2',             s.detail2);
  set('f-detail-3',             s.detail3);
  set('f-detail-4',             s.detail4);
  set('f-title-fp',             s.mainTextFP);
  set('f-body-fp',              s.bodyTextFP);
  set('f-tipnum-fp',            s.tipNumFP);
  set('f-photo-placement',      s.photoPlacement);
  set('f-photo-shape',          s.photoShape);
  set('f-photo-border',         s.photoBorder);
  if (s.subtitleSeparate != null) {
    document.getElementById('f-subtitle-separate').checked = s.subtitleSeparate;
  }

  if (s.mainTextTop!=null) {
    set('f-main-text-top', s.mainTextTop);
    document.getElementById('main-text-top-label').textContent=s.mainTextTop;
    mainTextTopAdjust=parseInt(s.mainTextTop);
  }
  if (s.mainTextWidth!=null) {
    set('f-main-text-width', s.mainTextWidth);
    document.getElementById('main-text-width-label').textContent=s.mainTextWidth;
    mainTextWidth=parseInt(s.mainTextWidth);
    document.getElementById('main-text-wrap').style.maxWidth=s.mainTextWidth+'px';
  }
  if (s.bodyTextTop!=null) {
    set('f-body-text-top', s.bodyTextTop);
    document.getElementById('body-text-top-label').textContent=s.bodyTextTop;
    bodyTextTopAdjust=parseInt(s.bodyTextTop);
  }
  if (s.bodyTextLeft!=null) {
    set('f-body-text-left', s.bodyTextLeft);
    document.getElementById('body-text-left-label').textContent=s.bodyTextLeft;
    bodyTextLeftAdjust=parseInt(s.bodyTextLeft);
  }
  if (s.panX != null) pan.x = parseFloat(s.panX);
  if (s.panY != null) pan.y = parseFloat(s.panY);
  if (s.fontSizeTitle != null) {
    set('f-fontsize-title', s.fontSizeTitle);
    document.getElementById('title-font-size-label').textContent = s.fontSizeTitle;
    document.getElementById('c-post-title').style.fontSize = s.fontSizeTitle + 'rem';
  }
  if (s.fontSizeFP!=null) {
    set('f-fontsize-fp', s.fontSizeFP);
    document.getElementById('font-size-label-fp').textContent=s.fontSizeFP;
    document.getElementById('c-text-fp').style.fontSize=s.fontSizeFP+'rem';
  }
  if (s.photoSize!=null) {
    set('f-photo-size', s.photoSize);
    document.getElementById('photo-size-label').textContent=s.photoSize;
  }

  document.getElementById('c-header').textContent=s.header||'';
  document.getElementById('c-post-supersupertitle').innerHTML=`<span>${s.supersupertitle||''}</span>`;
  document.getElementById('c-post-supertitle').innerHTML=`<span>${s.supertitle||''}</span>`;
  document.getElementById('c-post-title').innerHTML=`<span>${s.title||''}</span>`;
  const combined=(s.subtitle&&s.subtitle2)?`${s.subtitle} \u2013 ${s.subtitle2}`:(s.subtitle||s.subtitle2||'');
  document.getElementById('c-post-subtitle').innerHTML=`<span>${escapeHtml(combined)}</span>`;
  document.getElementById('c-post-subsubtitle').innerHTML=`<span>${s.subsubtitle||''}</span>`;
const mainVal = s.mainTextFP || '';
  document.getElementById('c-text-main').textContent = mainVal ? '\u201C' + mainVal + '\u201D' : '';

  if (s.bodyTextFP != null) {
    const bodyVal = s.bodyTextFP;
    setHtmlFP(document.getElementById('c-body-fp'), bodyVal ? '\u201C' + bodyVal + '\u201D' : bodyVal);
  }
  updateDetailsList();
  updateSubtitle();
}

// ── Enable / disable all FP sidebar controls ──────────────────────────────
const FP_CONTROL_IDS = [
  'f-header', 'f-post-supersupertitle', 'f-post-supertitle',
  'f-post-title', 'f-fontsize-title',
  'f-post-subtitle', 'f-post-subtitle2', 'f-subtitle-separate', 'f-post-subsubtitle',
  'f-detail-1', 'f-detail-2', 'f-detail-3', 'f-detail-4',
  'f-title-fp', 'f-main-text-width', 'f-main-text-top',
  'f-body-text-top', 'f-body-text-left',
  'f-body-fp', 'f-fontsize-fp', 'f-tipnum-fp',
  'f-photo', 'f-photo-placement', 'f-photo-shape',
  'f-photo-size', 'f-photo-border',
  'reset-pan-btn', 'remove-photo-btn',
];

function setFPControlsDisabled(disabled) {
  FP_CONTROL_IDS.forEach(id => {
    const el = document.getElementById(id);
    if (el) el.disabled = disabled;
  });
  // Dim only the fields below the sheet-loader section, not the loader itself
  const fpFields = document.getElementById('fp-fields');
  if (!fpFields) return;
  Array.from(fpFields.children).forEach(child => {
    if (child.id === 'sheet-practitioner-section') return;
    child.style.opacity = disabled ? '0.45' : '1';
  });
}

// ── Init ──────────────────────────────────────────────────────────────────
function initFP() {
  initFPInputs();
  initFPResizeObservers();
  initCaption();
  initPhoto();
  loadFPPhotoFromUrl('./images/GRAY.jpg');
  setFPControlsDisabled(true);
}
