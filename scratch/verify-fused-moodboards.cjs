const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 1100, deviceScaleFactor: 2 });

  console.log('Navigating to https://halalfans.me ...');
  await page.goto('https://halalfans.me', { waitUntil: 'networkidle2', timeout: 30000 });

  // Wait a second then click Moodboard in top nav
  await new Promise(r => setTimeout(r, 1000));
  await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll('button'));
    const mbBtn = buttons.find(b => b.textContent && b.textContent.includes('Moodboard'));
    if (mbBtn) mbBtn.click();
  });

  // Wait for moodboard screen and images to render
  await new Promise(r => setTimeout(r, 3000));

  const artifactDir = '/Users/savage/.gemini/antigravity/brain/fa3f07d0-8348-4329-aa05-cb61e4efb02f';
  await page.screenshot({ path: artifactDir + '/moodboard-fused-production-full.png' });
  console.log('Saved moodboard-fused-production-full.png');

  // Check the 4 fanout cards
  const fanoutData = await page.evaluate(() => {
    const fanoutImgs = Array.from(document.querySelectorAll('img[alt*="Burj"], img[alt*="Gym"], img[alt*="Yacht"], img[alt*="Tokyo"]'));
    return fanoutImgs.map(img => ({ alt: img.alt, src: img.src }));
  });
  console.log('Detected Fanout Images:', fanoutData);

  // Check the moodboard grid cards
  const gridCards = await page.evaluate(() => {
    const cards = Array.from(document.querySelectorAll('.grid > div'));
    return cards.map(c => ({
      title: c.querySelector('span')?.textContent?.trim(),
      src: c.querySelector('img')?.src
    })).filter(c => c.title);
  });
  console.log('Detected Grid Moodboard Cards (' + gridCards.length + '):');
  gridCards.forEach(c => console.log('  -', c.title, '-->', c.src?.slice(-45)));

  await browser.close();
  console.log('Verification completed successfully!');
})();
