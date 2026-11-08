const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox', '--disable-setuid-sandbox'] });
  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 1024, deviceScaleFactor: 2 });

  await page.goto('https://halalfans.me', { waitUntil: 'networkidle0', timeout: 25000 });
  await new Promise(r => setTimeout(r, 2000));

  const artifactDir = '/Users/savage/.gemini/antigravity/brain/fa3f07d0-8348-4329-aa05-cb61e4efb02f/screenshots';

  // Click the plus button to open full-page Create New on production
  const plusBtn = await page.$('button[title="Create New (Full Page)"]');
  if (plusBtn) {
    await plusBtn.click();
    await new Promise(r => setTimeout(r, 1200));
    await page.screenshot({ path: artifactDir + '/50-production-create-new-full-page.png' });
    console.log('Saved 50-production-create-new-full-page.png');
  }

  await browser.close();
  console.log('Production test complete!');
})();
