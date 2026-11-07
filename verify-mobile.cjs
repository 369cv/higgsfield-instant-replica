const puppeteer = require('puppeteer');
const delay = (ms) => new Promise(r => setTimeout(r, ms));

(async () => {
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 390, height: 844, isMobile: true, hasTouch: true });

  console.log('Navigating to http://localhost:5173 on mobile viewport...');
  await page.goto('http://localhost:5173', { waitUntil: 'networkidle2' });
  await delay(2000);

  // Take mobile screenshot of gallery with spacing
  await page.screenshot({
    path: '/Users/savage/.gemini/antigravity/brain/fa3f07d0-8348-4329-aa05-cb61e4efb02f/screenshots/mobile-gallery-spaced.png'
  });
  console.log('Saved mobile-gallery-spaced.png');

  await browser.close();
})();
