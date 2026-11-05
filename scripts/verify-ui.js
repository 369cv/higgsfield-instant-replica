import puppeteer from 'puppeteer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const OUTPUT_DIR = '/Users/savage/.gemini/antigravity/brain/fa3f07d0-8348-4329-aa05-cb61e4efb02f/screenshots';
fs.mkdirSync(OUTPUT_DIR, { recursive: true });

async function clickByText(page, tag, text) {
  return await page.evaluate((tag, text) => {
    const elements = Array.from(document.querySelectorAll(tag));
    const target = elements.find(el => el.textContent && el.textContent.includes(text));
    if (target) {
      target.click();
      return true;
    }
    return false;
  }, tag, text);
}

async function run() {
  console.log('Launching Puppeteer browser...');
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 2 });

  // 1. Dashboard View
  console.log('1. Capturing Dashboard with Clean Cards...');
  await page.goto('http://localhost:5174/', { waitUntil: 'networkidle0' });
  await page.waitForSelector('header');
  await new Promise((r) => setTimeout(r, 1000));
  await page.screenshot({ path: path.join(OUTPUT_DIR, '01-vault-dashboard-clean-cards.png') });

  // 2. View Popover
  console.log('2. Capturing View Popover...');
  await clickByText(page, 'button', 'View');
  await new Promise((r) => setTimeout(r, 600));
  await page.screenshot({ path: path.join(OUTPUT_DIR, '02-view-popover-open.png') });

  // Close popover
  await page.keyboard.press('Escape');
  await new Promise((r) => setTimeout(r, 400));

  // 3. Open Inspector Modal by clicking first card
  console.log('3. Capturing Inspector Modal (Ferrari Selfie)...');
  await page.evaluate(() => {
    const card = document.querySelector('.cursor-pointer');
    if (card) card.click();
  });
  await new Promise((r) => setTimeout(r, 1000));
  await page.screenshot({ path: path.join(OUTPUT_DIR, '03-inspector-ferrari-savage-mode.png') });

  // Close Inspector by clicking the X button
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const xBtn = btns.find(b => b.querySelector('svg.lucide-x'));
    if (xBtn) xBtn.click();
  });
  await new Promise((r) => setTimeout(r, 500));

  // 4. In-page Floating Recreate Widget
  console.log('4. Capturing In-Page Floating Recreate Widget...');
  await clickByText(page, 'button', 'Recreate');
  await new Promise((r) => setTimeout(r, 800));
  await page.screenshot({ path: path.join(OUTPUT_DIR, '04-in-page-recreate-floating-modal.png') });

  // 5. Submit generation to capture 4-tile generating row
  console.log('5. Capturing 4-Tile Generating Queue...');
  await clickByText(page, 'button', 'Generate 4 Variations');
  await new Promise((r) => setTimeout(r, 700));
  await page.screenshot({ path: path.join(OUTPUT_DIR, '05-generating-queue-4-tiles.png') });

  // 6. Capture Chrome Sidepanel Mode View
  console.log('6. Capturing Chrome Sidepanel Mode...');
  const sidepanelPage = await browser.newPage();
  await sidepanelPage.setViewport({ width: 440, height: 800, deviceScaleFactor: 2 });
  await sidepanelPage.goto('http://localhost:5174/sidepanel.html', { waitUntil: 'networkidle0' });
  await new Promise((r) => setTimeout(r, 1000));
  await sidepanelPage.screenshot({ path: path.join(OUTPUT_DIR, '06-chrome-sidepanel-view.png') });

  await browser.close();
  console.log('All screenshots captured successfully in:', OUTPUT_DIR);
}

run().catch((err) => {
  console.error('Error running verification:', err);
  process.exit(1);
});
