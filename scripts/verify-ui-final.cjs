const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

async function run() {
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });

  console.log('Navigating to http://localhost:5174/ ...');
  await page.goto('http://localhost:5174/', { waitUntil: 'networkidle0', timeout: 30000 });

  await new Promise(r => setTimeout(r, 2000));

  const outDir = '/Users/savage/.gemini/antigravity/brain/fa3f07d0-8348-4329-aa05-cb61e4efb02f/screenshots';
  if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, { recursive: true });
  }

  // 1. Capture Dashboard View with PromoBanner, Grid, Last viewed, and FloatingPromptBar
  await page.screenshot({ path: path.join(outDir, '01-exact-feed-with-promo-and-bar.png') });
  console.log('Saved 01-exact-feed-with-promo-and-bar.png');

  // 2. Click the first image to open InspectorModal
  const cards = await page.$$('div.group.relative.cursor-pointer');
  if (cards.length > 0) {
    await cards[0].click();
    await new Promise(r => setTimeout(r, 1000));
    await page.screenshot({ path: path.join(outDir, '02-inspector-modal-with-prompt-thumb.png') });
    console.log('Saved 02-inspector-modal-with-prompt-thumb.png');

    // 3. Click the reference thumbnail in the prompt box
    const refThumb = await page.$('.group\\/thumb');
    if (refThumb) {
      await refThumb.click();
      await new Promise(r => setTimeout(r, 1000));
      await page.screenshot({ path: path.join(outDir, '03-inspector-modal-inspecting-reference.png') });
      console.log('Saved 03-inspector-modal-inspecting-reference.png');
    }
  }

  await browser.close();
  console.log('Verification finished successfully.');
}

run().catch(err => {
  console.error('Error running verification:', err);
  process.exit(1);
});
