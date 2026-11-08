const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox', '--disable-setuid-sandbox'] });
  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 1024, deviceScaleFactor: 2 });

  await page.goto('http://localhost:5173', { waitUntil: 'networkidle0', timeout: 15000 });
  await new Promise(r => setTimeout(r, 2000));

  const artifactDir = '/Users/savage/.gemini/antigravity/brain/fa3f07d0-8348-4329-aa05-cb61e4efb02f/screenshots';

  // Click the plus button to open full-page Create New
  const plusBtn = await page.$('button[title="Create New (Full Page)"]');
  if (plusBtn) {
    await plusBtn.click();
    await new Promise(r => setTimeout(r, 1000));
    await page.screenshot({ path: artifactDir + '/49-live-create-new-full-page.png' });
    console.log('Saved 49-live-create-new-full-page.png');
  } else {
    console.log('Plus button not found');
  }

  await browser.close();
  console.log('Local test complete!');
})();
