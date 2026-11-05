const puppeteer = require('puppeteer');

const delay = (ms) => new Promise(r => setTimeout(r, ms));

(async () => {
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });

  console.log('Navigating to http://localhost:5174...');
  await page.goto('http://localhost:5174', { waitUntil: 'networkidle2' });
  await delay(2500);

  // Find all cards containing an image
  const imgCards = await page.$$('main .group:has(img)');
  console.log(`Found ${imgCards.length} image cards`);

  if (imgCards.length > 0) {
    const targetCard = imgCards[0];

    // Scroll card into view
    await targetCard.evaluate(el => el.scrollIntoView({ behavior: 'instant', block: 'center' }));
    await delay(500);

    // Hover over the target card
    console.log('Hovering over first image card...');
    await targetCard.hover();
    await delay(600);

    await page.screenshot({
      path: '/Users/savage/.gemini/antigravity/brain/fa3f07d0-8348-4329-aa05-cb61e4efb02f/screenshots/02-card-hover-only-heart.png'
    });
    console.log('Saved 02-card-hover-only-heart.png');

    // Click the heart button on the target card
    const heartBtn = await targetCard.$('button[title*="favorite" i], button[title*="Favorite" i]');
    if (heartBtn) {
      console.log('Clicking favorite heart button on card...');
      await heartBtn.click();
      await delay(600);
      await page.screenshot({
        path: '/Users/savage/.gemini/antigravity/brain/fa3f07d0-8348-4329-aa05-cb61e4efb02f/screenshots/03-card-favorited-heart.png'
      });
      console.log('Saved 03-card-favorited-heart.png');
    } else {
      console.log('Heart button not found on card');
    }

    // Now click the card image to open Inspector Modal
    console.log('Clicking card to open Inspector Modal...');
    await targetCard.click();
    await delay(1200);

    await page.screenshot({
      path: '/Users/savage/.gemini/antigravity/brain/fa3f07d0-8348-4329-aa05-cb61e4efb02f/screenshots/04-inspector-modal-verified.png'
    });
    console.log('Saved 04-inspector-modal-verified.png');
  }

  await browser.close();
})();
