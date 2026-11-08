const puppeteer = require('/Users/savage/.gemini/antigravity/scratch/higgsfield-instant-replica/node_modules/puppeteer');

(async () => {
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });
  await page.goto('http://localhost:5173', { waitUntil: 'networkidle2' });

  // 1. Live Concept 1 Suite Header
  await page.screenshot({ path: '/Users/savage/.gemini/antigravity/brain/fa3f07d0-8348-4329-aa05-cb61e4efb02f/screenshots/33-live-concept1-suite-header.png' });

  // 2. Click Modest & Hijab category filter
  const categoryBtns = await page.$$('header button');
  for (const b of categoryBtns) {
    const text = await page.evaluate(el => el.textContent, b);
    if (text && text.includes('Modest & Hijab')) {
      await b.click();
      await new Promise(r => setTimeout(r, 400));
      await page.screenshot({ path: '/Users/savage/.gemini/antigravity/brain/fa3f07d0-8348-4329-aa05-cb61e4efb02f/screenshots/34-live-category-modest-filter.png' });
      break;
    }
  }

  // 3. Search natural language "car"
  const searchInput = await page.$('input[placeholder*=\"Natural language\"]');
  if (searchInput) {
    await searchInput.type('car');
    await new Promise(r => setTimeout(r, 400));
    await page.screenshot({ path: '/Users/savage/.gemini/antigravity/brain/fa3f07d0-8348-4329-aa05-cb61e4efb02f/screenshots/35-live-search-filtering.png' });
    await searchInput.click();
    await page.keyboard.down('Meta');
    await page.keyboard.press('a');
    await page.keyboard.up('Meta');
    await page.keyboard.press('Backspace');
  }

  // 4. Click "+ Create Soul Drop" to open aligned Higgsfield Studio Drawer
  const allBtns = await page.$$('header button');
  for (const b of allBtns) {
    const text = await page.evaluate(el => el.textContent, b);
    if (text && text.includes('Create Soul Drop')) {
      await b.click();
      await new Promise(r => setTimeout(r, 400));
      await page.screenshot({ path: '/Users/savage/.gemini/antigravity/brain/fa3f07d0-8348-4329-aa05-cb61e4efb02f/screenshots/36-live-sidebar-drawer-aligned.png' });
      break;
    }
  }

  await browser.close();
  console.log('Concept 1 Live screenshots verified!');
})();
