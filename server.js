const express = require('express');
const puppeteer = require('puppeteer-core');
const chromium = require('@sparticuz/chromium');
const app = express();

app.use(express.json());

app.get('/', (req, res) => {
  res.json({ status: 'ok', message: 'ARA Render Service is running.' });
});

app.get('/test-puppeteer', async (req, res) => {
  let browser;
  try {
    browser = await puppeteer.launch({
      args: chromium.args,
      defaultViewport: chromium.defaultViewport,
      executablePath: await chromium.executablePath(),
      headless: chromium.headless,
    });
    const page = await browser.newPage();
    await page.setContent('<h1>Puppeteer is working!</h1>');
    await browser.close();
    res.json({ status: 'ok', message: 'Puppeteer launched successfully.' });
  } catch (err) {
    if (browser) await browser.close().catch(() => {});
    res.status(500).json({ status: 'error', message: err.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`ARA Render Service listening on port ${PORT}`);
});
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
