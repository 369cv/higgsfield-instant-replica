const puppeteer = require('puppeteer');
const path = require('path');

async function run() {
  const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox'] });
  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });

  await page.goto('http://localhost:5174/', { waitUntil: 'networkidle2' });
  await page.waitForSelector('img[src^="http"]', { timeout: 10000 });
  await new Promise(r => setTimeout(r, 1000));

  const outDir = '/Users/savage/.gemini/antigravity/brain/fa3f07d0-8348-4329-aa05-cb61e4efb02f/screenshots';

  // Hover over the first card
  const cards = await page.$$('div.group.relative.cursor-pointer');
  if (cards.length > 0) {
    await cards[0].hover();
    await new Promise(r => setTimeout(r, 600));
    await page.screenshot({ path: path.join(outDir, '01-glassmorphic-hover-card.png') });
    console.log('Saved 01-glassmorphic-hover-card.png');

    // Click the card to open InspectorModal
    await cards[0].click();
    await new Promise(r => setTimeout(r, 800));
    await page.screenshot({ path: path.join(outDir, '02-inspector-clean-hero-no-text.png') });
    console.log('Saved 02-inspector-clean-hero-no-text.png');
  }

  await browser.close();
  console.log('Done verify-hover-inspector');
}

run().catch(e => {
  console.error(e);
  process.exit(1);
});
