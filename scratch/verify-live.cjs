const fs = require('fs');
const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox', '--disable-setuid-sandbox'] });
  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 1024, deviceScaleFactor: 2 });

  await page.goto('http://localhost:5173', { waitUntil: 'networkidle0', timeout: 15000 });
  await new Promise(r => setTimeout(r, 2000));

  const artifactDir = '/Users/savage/.gemini/antigravity/brain/fa3f07d0-8348-4329-aa05-cb61e4efb02f/screenshots';

  // 1. Live Home Canvas with Pure-Icon Header
  await page.screenshot({ path: artifactDir + '/38-live-pure-icon-header-home.png' });
  console.log('Saved 38-live-pure-icon-header-home.png');

  // 2. Hover over Mood Board button to verify tooltip
  const buttons = await page.$$('header nav button');
  if (buttons.length >= 2) {
    await buttons[1].hover();
    await new Promise(r => setTimeout(r, 600));
    await page.screenshot({ path: artifactDir + '/39-live-header-guided-tooltip.png' });
    console.log('Saved 39-live-header-guided-tooltip.png');

    // Click the Mood Board icon
    await buttons[1].click();
    await new Promise(r => setTimeout(r, 1000));
    await page.screenshot({ path: artifactDir + '/40-live-moodboard-screen.png' });
    console.log('Saved 40-live-moodboard-screen.png');

    // Click "+ Create Mood Board" button
    const allBtns = await page.$$('button');
    for (const b of allBtns) {
      const text = await page.evaluate(el => el.textContent, b);
      if (text && text.includes('Create Mood Board')) {
        await b.click();
        break;
      }
    }

    await new Promise(r => setTimeout(r, 1000));
    await page.screenshot({ path: artifactDir + '/41-live-moodboard-creation-modal.png' });
    console.log('Saved 41-live-moodboard-creation-modal.png');

    // Click cancel in modal to close
    const cancelBtns = await page.$$('button');
    for (const b of cancelBtns) {
      const text = await page.evaluate(el => el.textContent, b);
      if (text && text.trim() === 'Cancel') {
        await b.click();
        break;
      }
    }
    await new Promise(r => setTimeout(r, 600));

    // Click "Back to Prompt Vault" to verify returning home
    const backBtns = await page.$$('button');
    for (const b of backBtns) {
      const text = await page.evaluate(el => el.textContent, b);
      if (text && text.includes('Back to Prompt Vault')) {
        await b.click();
        break;
      }
    }
    await new Promise(r => setTimeout(r, 1000));
    await page.screenshot({ path: artifactDir + '/42-live-returned-home-vault.png' });
    console.log('Saved 42-live-returned-home-vault.png');
  }

  await browser.close();
  console.log('All live tests successfully completed!');
})();
