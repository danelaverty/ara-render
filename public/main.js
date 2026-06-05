// main.js — stripped-down render-only version (no Simple/Carousel/MP4/download)

const THEMES = [
  { name: "Dried Rose",        bg: "#f0e6e2", accent: "#a85848", text: "#2a1410", textBG: "rgba(255,255,255,0.5)" },
  { name: "Mocha Mousse",      bg: "#ede0d4", accent: "#8B5E52", text: "#2c1f1a", textBG: "rgba(255,255,255,0.5)" },
  { name: "Warm Sand",         bg: "#f5efe8", accent: "#9b7b6e", text: "#3a2e28", textBG: "rgba(255,255,255,0.5)" },
  { name: "Apricot & Indigo",  bg: "#f5ede4", accent: "#5a5888", text: "#181620", textBG: "rgba(255,255,255,0.5)" },
  { name: "Sepia Manuscript",  bg: "#f2e8d9", accent: "#a0784a", text: "#2e1e0e", textBG: "rgba(255,255,255,0.5)" },
  { name: "Golden Hour",       bg: "#f5eedf", accent: "#b8722a", text: "#2a1a0e", textBG: "rgba(255,255,255,0.5)" },
  { name: "Petal & Stone",     bg: "#ede8e6", accent: "#b87080", text: "#281820", textBG: "rgba(255,255,255,0.5)" },
  { name: "Chalk & Ochre",     bg: "#f5f0e8", accent: "#b8843a", text: "#28200e", textBG: "rgba(255,255,255,0.5)" },
  { name: "Linen & Verdigris", bg: "#f0ece4", accent: "#5a8070", text: "#141e1a", textBG: "rgba(255,255,255,0.5)" },
  { name: "Parchment & Plum",  bg: "#f2ede4", accent: "#806880", text: "#201428", textBG: "rgba(255,255,255,0.5)" },
  { name: "Moss & Bone",       bg: "#f0ece4", accent: "#688060", text: "#1c2418", textBG: "rgba(255,255,255,0.5)" },
  { name: "Saffron & Slate",   bg: "#f0ede4", accent: "#4a6880", text: "#181e28", textBG: "rgba(255,255,255,0.5)" },
  { name: "Cloud Dancer",      bg: "#f2efec", accent: "#8e8fa1", text: "#2e2d35", textBG: "rgba(255,255,255,0.5)" },
  { name: "Wabi-Sabi",         bg: "#e8e0d5", accent: "#7d6b55", text: "#2a2018", textBG: "rgba(255,255,255,0.45)" },
  { name: "Driftwood",         bg: "#ede8e0", accent: "#527a6a", text: "#1a2420", textBG: "rgba(255,255,255,0.5)" },
  { name: "Coastal Stillness", bg: "#e8e4de", accent: "#4e6e72", text: "#1f2e30", textBG: "rgba(255,255,255,0.5)" },
  { name: "Vetiver",           bg: "#dfe3d8", accent: "#5e6b50", text: "#1e2418", textBG: "rgba(255,255,255,0.45)" },
  { name: "Sage & Stone",      bg: "#eceae4", accent: "#7a9180", text: "#1e2820", textBG: "rgba(255,255,255,0.5)" },
  { name: "Sage & Terracotta", bg: "#e8ede6", accent: "#b86040", text: "#201410", textBG: "rgba(255,255,255,0.5)" },
  { name: "Sage Green",        bg: "#eef3ee", accent: "#6a9473", text: "#22302a", textBG: "rgba(255,255,255,0.5)" },
  { name: "Celadon Temple",    bg: "#e4eeeb", accent: "#4a7e70", text: "#152420", textBG: "rgba(255,255,255,0.5)" },
  { name: "Seafoam & Coral",   bg: "#e6f0ee", accent: "#c06858", text: "#201410", textBG: "rgba(255,255,255,0.5)" },
  { name: "Nordic Fog",        bg: "#dfe5e8", accent: "#4e7080", text: "#151e22", textBG: "rgba(255,255,255,0.5)" },
  { name: "Still Harbour",     bg: "#d8e4e8", accent: "#3a6070", text: "#0e1e24", textBG: "rgba(255,255,255,0.5)" },
  { name: "Powder & Rust",     bg: "#e8eef5", accent: "#a84e30", text: "#1e1008", textBG: "rgba(255,255,255,0.5)" },
  { name: "Chalk & Steel",     bg: "#edeef2", accent: "#7a6848", text: "#1e1808", textBG: "rgba(255,255,255,0.5)" },
  { name: "Dusk Mineral",      bg: "#e8e2ec", accent: "#7070a8", text: "#1a1828", textBG: "rgba(255,255,255,0.5)" },
  { name: "Soft Lilac",        bg: "#f0ecf5", accent: "#8a72a8", text: "#2e2840", textBG: "rgba(255,255,255,0.5)" },
  { name: "Lavender & Amber",  bg: "#eeebf5", accent: "#b87820", text: "#1e1808", textBG: "rgba(255,255,255,0.5)" },
  { name: "Peony & Chalk",     bg: "#ede8ec", accent: "#b85888", text: "#221020", textBG: "rgba(255,255,255,0.5)" },
  { name: "Orchid Haze",       bg: "#f2e8f0", accent: "#a84888", text: "#281428", textBG: "rgba(255,255,255,0.5)" },
  { name: "Fuchsia Mist",      bg: "#f7ecf2", accent: "#c03878", text: "#2a0e1e", textBG: "rgba(255,255,255,0.5)" },
  { name: "Cherry Blossom",    bg: "#f7edf0", accent: "#c4607a", text: "#2e1520", textBG: "rgba(255,255,255,0.5)" },
  { name: "Rose Dusk",         bg: "#f7eef0", accent: "#c07f8a", text: "#3a2830", textBG: "rgba(255,255,255,0.5)" },
  { name: "Lacquer (Dusk)",           bg: "#481610", accent: "#e05040", text: "#f5e8e4", textBG: "rgba(0,0,0,0.45)" },
  { name: "Sacred Earth (Dusk)",      bg: "#462818", accent: "#c9a87c", text: "#f0e8dc", textBG: "rgba(0,0,0,0.45)" },
  { name: "Obsidian & Copper (Dusk)", bg: "#301e18", accent: "#b87848", text: "#f5e8dc", textBG: "rgba(0,0,0,0.45)" },
  { name: "Ember (Dusk)",             bg: "#361a0c", accent: "#c87941", text: "#f5e8d8", textBG: "rgba(0,0,0,0.45)" },
  { name: "Bronze Meridian (Dusk)",   bg: "#2e220e", accent: "#b89a5a", text: "#f0e8d8", textBG: "rgba(0,0,0,0.45)" },
  { name: "Iron & Saffron (Dusk)",    bg: "#322e10", accent: "#c89840", text: "#f5ead8", textBG: "rgba(0,0,0,0.45)" },
  { name: "Abyss & Ember (Dusk)",     bg: "#162038", accent: "#c87840", text: "#f5eadc", textBG: "rgba(0,0,0,0.45)" },
  { name: "Deep Sea (Dusk)",          bg: "#0e2c40", accent: "#c09858", text: "#f5ead8", textBG: "rgba(0,0,0,0.45)" },
  { name: "Tempest (Dusk)",           bg: "#182438", accent: "#c08848", text: "#f5ead8", textBG: "rgba(0,0,0,0.45)" },
  { name: "Modern Mystic (Dusk)",     bg: "#221840", accent: "#b8976a", text: "#ede8df", textBG: "rgba(0,0,0,0.45)" },
  { name: "Candlelit Fern (Dusk)",    bg: "#2a3818", accent: "#c8a85a", text: "#f0ead8", textBG: "rgba(0,0,0,0.45)" },
  { name: "Old Growth (Dusk)",        bg: "#2e3e18", accent: "#a8b870", text: "#eaf0d8", textBG: "rgba(0,0,0,0.45)" },
  { name: "Forest Floor (Dusk)",      bg: "#1e3c18", accent: "#7aab6a", text: "#dff0d8", textBG: "rgba(0,0,0,0.45)" },
  { name: "Healer's Grove (Dusk)",    bg: "#183c2c", accent: "#8fc49a", text: "#e4f0e8", textBG: "rgba(0,0,0,0.45)" },
  { name: "Nightshade (Dusk)",        bg: "#200e38", accent: "#5a9870", text: "#e0f0e8", textBG: "rgba(0,0,0,0.45)" },
  { name: "Smoked Plum (Dusk)",       bg: "#301840", accent: "#7aaa80", text: "#dff0e4", textBG: "rgba(0,0,0,0.45)" },
  { name: "Deep Water (Dusk)",        bg: "#0c3c3e", accent: "#6aada4", text: "#e8eeec", textBG: "rgba(0,0,0,0.45)" },
  { name: "Deep Teal (Dusk)",         bg: "#083c4a", accent: "#7ecfc0", text: "#e8f5f2", textBG: "rgba(0,0,0,0.45)" },
  { name: "Indigo Rain (Dusk)",       bg: "#0e1838", accent: "#6a9abf", text: "#ddeaf5", textBG: "rgba(0,0,0,0.45)" },
  { name: "Dark Amber (Dusk)",        bg: "#341e08", accent: "#7888b0", text: "#dce4f5", textBG: "rgba(0,0,0,0.45)" },
  { name: "Verdigris Night (Dusk)",   bg: "#101e38", accent: "#c87898", text: "#f5e4ec", textBG: "rgba(0,0,0,0.45)" },
  { name: "Ironwood (Dusk)",          bg: "#222818", accent: "#9870c0", text: "#ece8f5", textBG: "rgba(0,0,0,0.45)" },
  { name: "Midnight (Dusk)",          bg: "#181840", accent: "#a89fc8", text: "#e8e4f0", textBG: "rgba(0,0,0,0.45)" },
  { name: "Heliotrope (Dusk)",        bg: "#1e1038", accent: "#b48ec4", text: "#ede8f5", textBG: "rgba(0,0,0,0.45)" },
  { name: "Graphite Bloom (Dusk)",    bg: "#302438", accent: "#c8a8c0", text: "#f0ecf4", textBG: "rgba(0,0,0,0.45)" },
  { name: "Twilight (Dusk)",          bg: "#321438", accent: "#c49aaa", text: "#ede4ee", textBG: "rgba(0,0,0,0.45)" },
  { name: "Flint & Bloom (Dusk)",     bg: "#301e38", accent: "#d4a0b0", text: "#f2ecf0", textBG: "rgba(0,0,0,0.45)" },
  { name: "Midnight Rose (Dusk)",     bg: "#280e34", accent: "#d4809a", text: "#f5e8f0", textBG: "rgba(0,0,0,0.45)" },
  { name: "Garnet (Dusk)",            bg: "#400e18", accent: "#c87080", text: "#f5e8ec", textBG: "rgba(0,0,0,0.45)" },
  { name: "Lacquer",           bg: "#2a1010", accent: "#e05040", text: "#f5e8e4", textBG: "rgba(0,0,0,0.5)" },
  { name: "Sacred Earth",      bg: "#2e1e14", accent: "#c9a87c", text: "#f0e8dc", textBG: "rgba(0,0,0,0.5)" },
  { name: "Obsidian & Copper", bg: "#181414", accent: "#b87848", text: "#f5e8dc", textBG: "rgba(0,0,0,0.5)" },
  { name: "Ember",             bg: "#1e1208", accent: "#c87941", text: "#f5e8d8", textBG: "rgba(0,0,0,0.5)" },
  { name: "Bronze Meridian",   bg: "#1a1610", accent: "#b89a5a", text: "#f0e8d8", textBG: "rgba(0,0,0,0.5)" },
  { name: "Iron & Saffron",    bg: "#202018", accent: "#c89840", text: "#f5ead8", textBG: "rgba(0,0,0,0.5)" },
  { name: "Abyss & Ember",     bg: "#101828", accent: "#c87840", text: "#f5eadc", textBG: "rgba(0,0,0,0.5)" },
  { name: "Deep Sea",          bg: "#0e2030", accent: "#c09858", text: "#f5ead8", textBG: "rgba(0,0,0,0.5)" },
  { name: "Tempest",           bg: "#141c28", accent: "#c08848", text: "#f5ead8", textBG: "rgba(0,0,0,0.5)" },
  { name: "Modern Mystic",     bg: "#1c1a2e", accent: "#b8976a", text: "#ede8df", textBG: "rgba(0,0,0,0.5)" },
  { name: "Candlelit Fern",    bg: "#222a1c", accent: "#c8a85a", text: "#f0ead8", textBG: "rgba(0,0,0,0.5)" },
  { name: "Old Growth",        bg: "#252e20", accent: "#a8b870", text: "#eaf0d8", textBG: "rgba(0,0,0,0.5)" },
  { name: "Forest Floor",      bg: "#1e2e1c", accent: "#7aab6a", text: "#dff0d8", textBG: "rgba(0,0,0,0.5)" },
  { name: "Healer's Grove",    bg: "#203026", accent: "#8fc49a", text: "#e4f0e8", textBG: "rgba(0,0,0,0.5)" },
  { name: "Nightshade",        bg: "#1e1428", accent: "#5a9870", text: "#e0f0e8", textBG: "rgba(0,0,0,0.5)" },
  { name: "Smoked Plum",       bg: "#281e2e", accent: "#7aaa80", text: "#dff0e4", textBG: "rgba(0,0,0,0.5)" },
  { name: "Deep Water",        bg: "#0f2e30", accent: "#6aada4", text: "#e8eeec", textBG: "rgba(0,0,0,0.5)" },
  { name: "Deep Teal",         bg: "#0d3340", accent: "#7ecfc0", text: "#e8f5f2", textBG: "rgba(0,0,0,0.5)" },
  { name: "Indigo Rain",       bg: "#0e1828", accent: "#6a9abf", text: "#ddeaf5", textBG: "rgba(0,0,0,0.5)" },
  { name: "Dark Amber",        bg: "#201808", accent: "#7888b0", text: "#dce4f5", textBG: "rgba(0,0,0,0.5)" },
  { name: "Verdigris Night",   bg: "#102028", accent: "#c87898", text: "#f5e4ec", textBG: "rgba(0,0,0,0.5)" },
  { name: "Ironwood",          bg: "#1a1e14", accent: "#9870c0", text: "#ece8f5", textBG: "rgba(0,0,0,0.5)" },
  { name: "Midnight",          bg: "#1a1a2e", accent: "#a89fc8", text: "#e8e4f0", textBG: "rgba(0,0,0,0.5)" },
  { name: "Heliotrope",        bg: "#1e1728", accent: "#b48ec4", text: "#ede8f5", textBG: "rgba(0,0,0,0.45)" },
  { name: "Graphite Bloom",    bg: "#282830", accent: "#c8a8c0", text: "#f0ecf4", textBG: "rgba(0,0,0,0.5)" },
  { name: "Twilight",          bg: "#251d2a", accent: "#c49aaa", text: "#ede4ee", textBG: "rgba(0,0,0,0.5)" },
  { name: "Flint & Bloom",     bg: "#2c2830", accent: "#d4a0b0", text: "#f2ecf0", textBG: "rgba(0,0,0,0.5)" },
  { name: "Midnight Rose",     bg: "#201828", accent: "#d4809a", text: "#f5e8f0", textBG: "rgba(0,0,0,0.5)" },
  { name: "Garnet",            bg: "#281418", accent: "#c87080", text: "#f5e8ec", textBG: "rgba(0,0,0,0.5)" },
];

const SYMBOLS = { none:'✦', quote:'"', tip:'✦', fact:'🌿', prompt:'🌸', affirm:'☀️' };

const state = {
  themeIndex: 0,
  decor:      'orbs',
  postType:   'fp',
  aspectRatio: '4:5',

  accentRgba: (a) => {
    const t = THEMES[state.themeIndex];
    const hex = t.accent.replace('#','');
    const n = parseInt(hex, 16);
    return `rgba(${(n>>16)&255},${(n>>8)&255},${n&255},${a})`;
  },

  canvasHeight() { return 675; },
  save() {},  // no-op in render mode
};

function escapeHtml(s) {
  return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}
function setHtmlFP(el, val) {
  el.innerHTML = escapeHtml(val).replace(/\n/g,'<br>');
}
function setHtmlSimple(el, val) {
  el.innerHTML = val.replace(/\n/g, '<br>');
}

function applyTheme(i, skipSave) {
  state.themeIndex = i;
  const t = THEMES[i];
  const canvas = document.getElementById('post-canvas');
  canvas.style.setProperty('--bg',     t.bg);
  canvas.style.setProperty('--accent', t.accent);
  canvas.style.setProperty('--text',   t.text);
  canvas.style.setProperty('--textBG', t.textBG);
  canvas.style.background = t.bg;
  if (state.decor === 'botanical')         paintBotanical();
  if (state.decor.startsWith('mandala'))   paintMandala(state.decor);
  if (state.decor === 'celestial')         paintCelestial();
  if (state.decor === 'brush-strokes')     paintBrushStrokes();
  if (state.decor === 'ember-wisps')       paintEmberWisps();
  if (state.decor === 'celestial-clouds')  paintCelestialClouds();
  if (state.decor === 'cloud-drift')       paintCloudDrift();
}

function applyDecor(name, skipSave) {
  state.decor = name;
  const canvas = document.getElementById('post-canvas');
  canvas.classList.remove(
    'decor-orbs','decor-corners',
    'decor-geo-lattice','decor-geo-arc','decor-geo-crystal',
    'decor-botanical','decor-waves',
    'decor-mandala-sacred','decor-mandala-floral','decor-mandala-astro',
    'decor-arch-panels','decor-ink-border','decor-sunburst',
    'decor-vine-corners','decor-papercut','decor-celestial',
    'decor-halftone-veil','decor-ribbon-ends',
    'decor-brush-strokes','decor-pillar-rule',
    'decor-ember-wisps','decor-sacred-flame',
    'decor-cloud-drift','decor-celestial-clouds'
  );
  canvas.classList.add('decor-' + name);
  if (name === 'botanical')         paintBotanical();
  if (name.startsWith('mandala'))   paintMandala(name);
  if (name === 'celestial')         paintCelestial();
  if (name === 'brush-strokes')     paintBrushStrokes();
  if (name === 'ember-wisps')       paintEmberWisps();
  if (name === 'celestial-clouds')  paintCelestialClouds();
  if (name === 'cloud-drift')       paintCloudDrift();
}

function applyPostType(type) {
  state.postType = type;
  const canvas = document.getElementById('post-canvas');
  canvas.classList.remove('post-type-fp','post-type-simple');
  canvas.classList.add('post-type-' + type);
}

function applyTemplate(tpl) {
  const canvas = document.getElementById('post-canvas');
  const keep = Array.from(canvas.classList).filter(c => !c.startsWith('tpl-'));
  canvas.className = keep.join(' ') + ' tpl-' + tpl;
}

// Stubs for functions called by sheet-loader / fp.js that aren't needed here
function updateCaption() {}
function getSimpleState() { return {}; }
function getCarouselState() { return {}; }
function applyCarouselState() {}
function applySimpleState() {}
function initSimple() {}
function initCarousel() {}
function initDownload() {}
function initMP4Debug() {}
function initSheetWriter() {}
function queueSheetWrite() {}

async function loadTemplates() {
  const inject = async (file, id) => {
    const html = await (await fetch(file)).text();
    document.getElementById(id).innerHTML = html;
  };
  await Promise.all([
    inject('decor.html',       'decor-layer'),
    inject('fp-template.html', 'post-inner-fp'),
  ]);
}

document.addEventListener('DOMContentLoaded', async () => {
  await loadTemplates();
  applyTheme(0, true);
  applyDecor('orbs', true);
  applyPostType('fp');
  applyTemplate('none');
  initFP();
  // sheet loader is not used in render mode — practitioner data
  // is injected directly by Puppeteer via applyPractitionerToFP()
});
