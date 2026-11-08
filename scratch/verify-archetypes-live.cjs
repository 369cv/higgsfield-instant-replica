const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });

  console.log('Navigating to production: https://halalfans.me ...');
  await page.goto('https://halalfans.me', { waitUntil: 'networkidle2', timeout: 35000 });

  // Navigate to AI Influencer
  const allBtns = await page.$$('button');
  for (const btn of allBtns) {
    const text = await page.evaluate(el => el.innerText, btn);
    if (text.includes('AI Influencer')) {
      await btn.click();
      break;
    }
  }
  await new Promise(r => setTimeout(r, 2000));

  // Check Business Mode
  console.log('1. Checking Business Mode Archetype Images...');
  const businessImages = await page.evaluate(() => {
    const imgs = Array.from(document.querySelectorAll('aside img'));
    return imgs.map(img => img.src);
  });
  console.log('   Business images found in sidebar:', businessImages);

  const hasStagnant = businessImages.some(src => 
    src.includes('baha-headshot-blazer-gray.png') || 
    src.includes('baha-headshot-openhair-gray.png')
  );
  console.log('   - Stagnant headshot in Business:', hasStagnant ? 'FAIL (Found)' : 'PASS (Completely Removed)');

  await page.screenshot({ path: '/tmp/business-archetypes-live.png' });

  // Switch to AI Creator
  console.log('2. Switching to AI Creator Mode...');
  const creatorBtn = await page.evaluateHandle(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    return btns.find(b => b.innerText.includes('AI Creator'));
  });
  if (creatorBtn) {
    await creatorBtn.click();
    await new Promise(r => setTimeout(r, 1500));
  }
  await page.screenshot({ path: '/tmp/creator-archetypes-live.png' });

  // Switch to Actor / Twin
  console.log('3. Switching to Actor / Twin Mode...');
  const actorBtn = await page.evaluateHandle(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    return btns.find(b => b.innerText.includes('Actor') || b.innerText.includes('Twin'));
  });
  if (actorBtn) {
    await actorBtn.click();
    await new Promise(r => setTimeout(r, 1500));
  }
  await page.screenshot({ path: '/tmp/actor-archetypes-live.png' });

  await browser.close();
  console.log('Verification finished successfully!');
})();
