const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox', '--disable-setuid-sandbox'] });
  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 1024, deviceScaleFactor: 2 });

  await page.goto('http://localhost:5173', { waitUntil: 'networkidle0', timeout: 15000 });
  await new Promise(r => setTimeout(r, 2000));

  const artifactDir = '/Users/savage/.gemini/antigravity/brain/fa3f07d0-8348-4329-aa05-cb61e4efb02f/screenshots';
  await page.screenshot({ path: artifactDir + '/51-live-search-and-assets-right-cluster.png' });
  console.log('Saved 51-live-search-and-assets-right-cluster.png');

  // Click Search icon button to test search overlay
  const searchBtn = await page.$('button[title="Search"]');
  if (searchBtn) {
    await searchBtn.click();
    await new Promise(r => setTimeout(r, 600));
    await page.screenshot({ path: artifactDir + '/52-live-search-popover-open.png' });
    console.log('Saved 52-live-search-popover-open.png');
  }

  await browser.close();
  console.log('Verification finished!');
})();
