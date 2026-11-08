const puppeteer = require('puppeteer');
const delay = (ms) => new Promise(r => setTimeout(r, ms));

(async () => {
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });

  console.log('Navigating to https://www.muzeboard.ai/vault...');
  try {
    await page.goto('https://www.muzeboard.ai/vault', { waitUntil: 'networkidle2', timeout: 30000 });
  } catch (e) {
    console.log('Navigation event:', e.message);
  }

  await delay(3000);

  // Take screenshot of landing / access code gate
  await page.screenshot({
    path: '/Users/savage/.gemini/antigravity/brain/fa3f07d0-8348-4329-aa05-cb61e4efb02f/screenshots/muzeboard-01-gate.png'
  });
  console.log('Saved muzeboard-01-gate.png');

  // Look for access code input field
  const inputs = await page.$$('input');
  console.log(`Found ${inputs.length} inputs`);

  // Try entering the access code: PV-7X9K2M
  for (const input of inputs) {
    try {
      await input.type('PV-7X9K2M');
      await page.keyboard.press('Enter');
      break;
    } catch {}
  }

  // Also look for buttons like "Submit", "Unlock", "Enter", "Access"
  const buttons = await page.$$('button');
  for (const btn of buttons) {
    const text = await (await btn.getProperty('innerText')).jsonValue();
    if (/unlock|access|enter|submit|continue/i.test(text)) {
      console.log(`Clicking button: ${text}`);
      await btn.click();
      break;
    }
  }

  await delay(5000);

  await page.screenshot({
    path: '/Users/savage/.gemini/antigravity/brain/fa3f07d0-8348-4329-aa05-cb61e4efb02f/screenshots/muzeboard-02-unlocked.png'
  });
  console.log('Saved muzeboard-02-unlocked.png');

  // Dump HTML text/structure for inspection
  const title = await page.title();
  console.log('Page Title:', title);

  const bodyText = await page.evaluate(() => document.body.innerText.slice(0, 1500));
  console.log('Body Text Preview:\n', bodyText);

  await browser.close();
})();
