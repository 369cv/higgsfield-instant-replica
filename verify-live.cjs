const puppeteer = require('puppeteer');
const delay = (ms) => new Promise(r => setTimeout(r, ms));

(async () => {
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 390, height: 844, isMobile: true, hasTouch: true });

  console.log('Navigating to live production https://halalfans.me on mobile viewport...');
  await page.goto('https://halalfans.me', { waitUntil: 'networkidle2' });
  await delay(3000);

  // Take mobile screenshot of live production gallery
  await page.screenshot({
    path: '/Users/savage/.gemini/antigravity/brain/fa3f07d0-8348-4329-aa05-cb61e4efb02f/screenshots/live-mobile-01-gallery.png'
  });
  console.log('Saved live-mobile-01-gallery.png');

  // Click first card to inspect modal on mobile
  const imgCards = await page.$$('main .group:has(img)');
  console.log(`Found ${imgCards.length} image cards on live production`);
  if (imgCards.length > 0) {
    await imgCards[0].click();
    await delay(1500);

    await page.screenshot({
      path: '/Users/savage/.gemini/antigravity/brain/fa3f07d0-8348-4329-aa05-cb61e4efb02f/screenshots/live-mobile-02-modal.png'
    });
    console.log('Saved live-mobile-02-modal.png');
  }

  await browser.close();
})();
