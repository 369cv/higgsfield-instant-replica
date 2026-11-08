const puppeteer = require('puppeteer');
const delay = (ms) => new Promise(r => setTimeout(r, ms));

(async () => {
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });

  console.log('Navigating to http://localhost:5173...');
  await page.goto('http://localhost:5173', { waitUntil: 'networkidle2' });
  await delay(2000);

  // Click first card to open inspector
  const imgCards = await page.$$('main .group:has(img)');
  if (imgCards.length > 0) {
    await imgCards[0].click();
    await delay(1000);

    // Take screenshot of Info tab with model pills
    await page.screenshot({
      path: '/Users/savage/.gemini/antigravity/brain/fa3f07d0-8348-4329-aa05-cb61e4efb02f/screenshots/prompt-vault-01-info.png'
    });
    console.log('Saved prompt-vault-01-info.png');

    // Click Midjourney pill
    const mjBtn = await page.$('button ::-p-text(Midjourney)');
    if (mjBtn) {
      await mjBtn.click();
      await delay(500);
      await page.screenshot({
        path: '/Users/savage/.gemini/antigravity/brain/fa3f07d0-8348-4329-aa05-cb61e4efb02f/screenshots/prompt-vault-02-midjourney.png'
      });
      console.log('Saved prompt-vault-02-midjourney.png');
    }

    // Switch to Edit tab
    const editTab = await page.$('button ::-p-text(Edit)');
    if (editTab) {
      await editTab.click();
      await delay(500);
      await page.screenshot({
        path: '/Users/savage/.gemini/antigravity/brain/fa3f07d0-8348-4329-aa05-cb61e4efb02f/screenshots/prompt-vault-03-edit.png'
      });
      console.log('Saved prompt-vault-03-edit.png');
    }

    // Switch to Comments tab
    const commentsTab = await page.$('button ::-p-text(Comments)');
    if (commentsTab) {
      await commentsTab.click();
      await delay(500);
      await page.screenshot({
        path: '/Users/savage/.gemini/antigravity/brain/fa3f07d0-8348-4329-aa05-cb61e4efb02f/screenshots/prompt-vault-04-comments.png'
      });
      console.log('Saved prompt-vault-04-comments.png');
    }
  }

  await browser.close();
})();
