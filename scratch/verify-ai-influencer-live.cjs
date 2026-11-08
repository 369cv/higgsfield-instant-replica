const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 1000, deviceScaleFactor: 2 });

  console.log('Navigating to https://halalfans.me ...');
  await page.goto('https://halalfans.me', { waitUntil: 'networkidle2', timeout: 30000 });

  // Clear any old local storage to test fresh user load
  await page.evaluate(() => {
    localStorage.removeItem('halalfans_managed_influencers_v3');
    localStorage.removeItem('halalfans_managed_influencers_v4');
    localStorage.removeItem('halalfans_active_headshot');
  });
  await page.reload({ waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 1500));

  // Click AI Influencer in navigation
  console.log('Clicking AI Influencer nav...');
  await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll('button'));
    const infBtn = buttons.find(b => b.textContent && b.textContent.includes('AI Influencer'));
    if (infBtn) infBtn.click();
  });

  await new Promise(r => setTimeout(r, 2000));

  const artifactDir = '/Users/savage/.gemini/antigravity/brain/fa3f07d0-8348-4329-aa05-cb61e4efb02f';

  // 1. Screenshot of the AI Influencer Studio
  await page.screenshot({ path: artifactDir + '/ai-influencer-studio-baha-live.png' });
  console.log('Saved ai-influencer-studio-baha-live.png');

  // 2. Open Character Details Modal
  console.log('Opening Character Details modal...');
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button[title="Character Details"]'));
    if (btns.length > 0) btns[0].click();
  });
  await new Promise(r => setTimeout(r, 1500));

  // Screenshot Character Details Modal
  await page.screenshot({ path: artifactDir + '/character-details-baha-live.png' });
  console.log('Saved character-details-baha-live.png');

  // Verify DOM content
  const info = await page.evaluate(() => {
    const nameEl = document.querySelector('h4');
    const headerImgs = Array.from(document.querySelectorAll('img')).map(i => i.src);
    return {
      firstH4: nameEl?.textContent,
      totalImgs: headerImgs.length,
      sampleUrls: headerImgs.slice(0, 5)
    };
  });
  console.log('Verified live page data:', info);

  await browser.close();
  console.log('Verification finished successfully!');
})();
