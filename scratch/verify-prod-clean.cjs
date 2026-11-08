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

  // 1. Verify Prompt Vault Subheader
  const subheaderText = await page.evaluate(() => document.body.innerText);

  const hasLiveDrops = subheaderText.includes('Live Drops');
  const hasClassificationFilter = subheaderText.includes('Classification Filter');
  console.log('1. Subheader check:');
  console.log('   - "Live Drops" present:', hasLiveDrops ? 'FAIL' : 'PASS (Removed)');
  console.log('   - "Classification Filter" present:', hasClassificationFilter ? 'FAIL' : 'PASS (Removed)');

  // 2. Navigate to AI Influencer tab
  console.log('2. Testing AI Influencer tab...');
  const buttons = await page.$$('button');
  for (const btn of buttons) {
    const text = await page.evaluate(el => el.innerText, btn);
    if (text.includes('AI Influencer')) {
      await btn.click();
      break;
    }
  }
  await new Promise(r => setTimeout(r, 2000));

  const influencerText = await page.evaluate(() => document.body.innerText);
  const hasEarn3500 = influencerText.includes('EARN UP TO $3,500');
  const hasAudienceTriggerBanner = influencerText.includes('Audience Trigger Profile');
  const hasViralitySlop = influencerText.includes('A fully customizable AI influencer designed for virality');
  const hasGabriela = influencerText.includes('Gabriela Sanchez');
  const hasBaha = influencerText.includes('Baha Savage');

  console.log('   - "EARN UP TO $3,500" present:', hasEarn3500 ? 'FAIL' : 'PASS (Removed)');
  console.log('   - "Audience Trigger Profile" banner present:', hasAudienceTriggerBanner ? 'FAIL' : 'PASS (Removed)');
  console.log('   - "A fully customizable AI influencer..." present:', hasViralitySlop ? 'FAIL' : 'PASS (Removed)');
  console.log('   - "Gabriela Sanchez" present:', hasGabriela ? 'FAIL' : 'PASS (Removed)');
  console.log('   - "Baha Savage" present:', hasBaha ? 'PASS (Active)' : 'FAIL');

  await page.screenshot({ path: '/tmp/ai-influencer-clean.png' });
  console.log('   - Screenshot saved to /tmp/ai-influencer-clean.png');

  // 3. Navigate to Moodboard tab
  console.log('3. Testing Moodboard tab...');
  const allBtns = await page.$$('button');
  for (const btn of allBtns) {
    const text = await page.evaluate(el => el.innerText, btn);
    if (text.includes('Moodboard')) {
      await btn.click();
      break;
    }
  }
  await new Promise(r => setTimeout(r, 2000));

  await page.screenshot({ path: '/tmp/moodboard-clean.png' });
  console.log('   - Screenshot saved to /tmp/moodboard-clean.png');

  await browser.close();
  console.log('All automated checks completed!');
})();
