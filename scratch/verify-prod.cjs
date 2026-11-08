const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox', '--disable-setuid-sandbox'] });
  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 1024, deviceScaleFactor: 2 });

  await page.goto('https://halalfans.me', { waitUntil: 'networkidle0', timeout: 25000 });
  await new Promise(r => setTimeout(r, 2000));

  const artifactDir = '/Users/savage/.gemini/antigravity/brain/fa3f07d0-8348-4329-aa05-cb61e4efb02f/screenshots';
  await page.screenshot({ path: artifactDir + '/47-production-halalfans-new-navigation.png' });

  // Click Plus button
  const plusBtn = await page.$('button[title="Create New"]');
  if (plusBtn) {
    await plusBtn.click();
    await new Promise(r => setTimeout(r, 600));
    await page.screenshot({ path: artifactDir + '/48-production-halalfans-plus-dropdown.png' });
  }

  console.log('Production screenshots captured successfully!');
  await browser.close();
})();
