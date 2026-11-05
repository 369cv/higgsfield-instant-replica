const puppeteer = require('puppeteer');
const path = require('path');

async function run() {
  const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox'] });
  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });
  await page.goto('http://localhost:5174/', { waitUntil: 'networkidle2' });
  await page.waitForSelector('img[src^="http"]', { timeout: 10000 });
  await new Promise(r => setTimeout(r, 1500));
  await page.screenshot({ path: '/Users/savage/.gemini/antigravity/brain/fa3f07d0-8348-4329-aa05-cb61e4efb02f/screenshots/01-clean-minimal-feed.png' });
  console.log('Done 01');
  await browser.close();
}
run();
