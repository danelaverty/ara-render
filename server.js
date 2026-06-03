const express = require('express');
const puppeteer = require('puppeteer');
const { execSync } = require('child_process');
const path = require('path');
const app = express();

app.use(express.json());

// Ensure Chrome is installed before handling any requests
const cacheDir = process.env.PUPPETEER_CACHE_DIR || path.join(__dirname, '.cache', 'puppeteer');
process.env.PUPPETEER_CACHE_DIR = cacheDir;

try {
  console.log('[startup] Installing Chrome if needed...');
  execSync(`npx puppeteer browsers install chrome`, {
    env: { ...process.env, PUPPETEER_CACHE_DIR: cacheDir },
    stdio: 'inherit',
  });
  console.log('[startup] Chrome ready.');
} catch (e) {
  console.error('[startup] Chrome install failed:', e.message);
}

app.get('/', (req, res) => {
  res.json({ status: 'ok', message: 'ARA Render Service is running.' });
});

app.get('/test-puppeteer', async (req, res) => {
  let browser;
  try {
    browser = await puppeteer.launch({
      headless: 'new',
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });
    const page = await browser.newPage();
    await page.setContent('<h1>Puppeteer is working!</h1>');
    const title = await page.title();
    await browser.close();
    res.json({ status: 'ok', message: 'Puppeteer launched successfully.', title });
  } catch (err) {
    if (browser) await browser.close().catch(() => {});
    res.status(500).json({ status: 'error', message: err.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`ARA Render Service listening on port ${PORT}`);
});
