const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox', '--disable-setuid-sandbox'] });
  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 1024, deviceScaleFactor: 2 });

  await page.goto('http://localhost:5173', { waitUntil: 'networkidle0', timeout: 15000 });
  await new Promise(r => setTimeout(r, 2000));

  const artifactDir = '/Users/savage/.gemini/antigravity/brain/fa3f07d0-8348-4329-aa05-cb61e4efb02f/screenshots';

  // 1. Initial Screen with New Header
  await page.screenshot({ path: artifactDir + '/45-live-new-header.png' });
  console.log('Saved 45-live-new-header.png');

  // 2. Click the Plus button
  const plusBtn = await page.$('button[title="Create New"]');
  if (plusBtn) {
    await plusBtn.click();
    await new Promise(r => setTimeout(r, 600));
    await page.screenshot({ path: artifactDir + '/46-live-plus-dropdown-open.png' });
    console.log('Saved 46-live-plus-dropdown-open.png');
  } else {
    console.log('Plus button not found');
  }

  await browser.close();
  console.log('Verification finished!');
})();
