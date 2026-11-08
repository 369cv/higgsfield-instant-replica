const puppeteer = require('/Users/savage/.gemini/antigravity/scratch/higgsfield-instant-replica/node_modules/puppeteer');

(async () => {
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });
  await page.goto('file:///Users/savage/.gemini/antigravity/scratch/higgsfield-instant-replica/scratch/mockups.html', { waitUntil: 'networkidle2' });

  // 1. Concept 1
  const c1 = await page.$('#concept-1');
  if (c1) {
    await c1.screenshot({ path: '/Users/savage/.gemini/antigravity/brain/fa3f07d0-8348-4329-aa05-cb61e4efb02f/screenshots/concept-1-streamlined-suite.png' });
  }

  // 2. Concept 2
  const c2 = await page.$('#concept-2');
  if (c2) {
    await c2.screenshot({ path: '/Users/savage/.gemini/antigravity/brain/fa3f07d0-8348-4329-aa05-cb61e4efb02f/screenshots/concept-2-floating-dock.png' });
  }

  // 3. Concept 3
  const c3 = await page.$('#concept-3');
  if (c3) {
    await c3.screenshot({ path: '/Users/savage/.gemini/antigravity/brain/fa3f07d0-8348-4329-aa05-cb61e4efb02f/screenshots/concept-3-studio-sidebar.png' });
  }

  await browser.close();
  console.log('Concept screenshots generated successfully!');
})();
