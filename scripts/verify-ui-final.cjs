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
  await page.goto('http://localhost:5174/', { waitUntil: 'domcontentloaded' });

  await new Promise(r => setTimeout(r, 2000));

  const outDir = '/Users/savage/.gemini/antigravity/brain/fa3f07d0-8348-4329-aa05-cb61e4efb02f/screenshots';
  if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, { recursive: true });
  }

  // 1. Capture clean tight feed
  await page.screenshot({ path: path.join(outDir, '01-clean-minimal-feed.png') });
  console.log('Saved 01-clean-minimal-feed.png');

  // 2. Click an image to test inspector and verify "Last viewed" only shows after viewing
  const cards = await page.$$('div.group.relative.cursor-pointer');
  if (cards.length > 0) {
    await cards[0].click();
    await new Promise(r => setTimeout(r, 1000));
    await page.screenshot({ path: path.join(outDir, '02-inspector-clean.png') });
    console.log('Saved 02-inspector-clean.png');

    // Close inspector
    const closeBtn = await page.$('button[title="Close"]');
    if (closeBtn) {
      await closeBtn.click();
      await new Promise(r => setTimeout(r, 800));
      await page.screenshot({ path: path.join(outDir, '03-feed-with-actual-last-viewed.png') });
      console.log('Saved 03-feed-with-actual-last-viewed.png');
    }
  }

  await browser.close();
  console.log('Verification done.');
}

run().catch(err => {
  console.error(err);
  process.exit(1);
});
