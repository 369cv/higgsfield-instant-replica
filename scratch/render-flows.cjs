const fs = require('fs');
const puppeteer = require('puppeteer');
const path = require('path');

(async () => {
  const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox', '--disable-setuid-sandbox'] });
  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 1024, deviceScaleFactor: 2 });
  
  const filePath = 'file://' + path.resolve('/Users/savage/.gemini/antigravity/scratch/higgsfield-instant-replica/scratch/user-flows-mockup.html');
  await page.goto(filePath, { waitUntil: 'networkidle0' });

  const artifactDir = '/Users/savage/.gemini/antigravity/brain/fa3f07d0-8348-4329-aa05-cb61e4efb02f/screenshots';
  if (!fs.existsSync(artifactDir)) fs.mkdirSync(artifactDir, { recursive: true });

  // Full page overview
  await page.screenshot({ path: path.join(artifactDir, 'user-flows-overview.png'), fullPage: true });

  // Flow 1: Create Mood Board
  const el1 = await page.$('#flow-1');
  if (el1) await el1.screenshot({ path: path.join(artifactDir, 'flow-1-create-moodboard.png') });

  // Flow 2: Edit Mood Board
  const el2 = await page.$('#flow-2');
  if (el2) await el2.screenshot({ path: path.join(artifactDir, 'flow-2-edit-moodboard.png') });

  // Flow 3: Create AI Influencer
  const el3 = await page.$('#flow-3');
  if (el3) await el3.screenshot({ path: path.join(artifactDir, 'flow-3-create-ai-influencer.png') });

  console.log('User flow screenshots rendered successfully!');
  await browser.close();
})();
