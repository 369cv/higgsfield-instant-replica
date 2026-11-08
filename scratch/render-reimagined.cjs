const fs = require('fs');
const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox', '--disable-setuid-sandbox'] });
  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 1100, deviceScaleFactor: 2 });
  
  await page.goto('file:///Users/savage/.gemini/antigravity/scratch/higgsfield-instant-replica/scratch/reimagined-navigation-and-moodboard.html', { waitUntil: 'networkidle0' });

  const artifactDir = '/Users/savage/.gemini/antigravity/brain/fa3f07d0-8348-4329-aa05-cb61e4efb02f/screenshots';

  const elHeader = await page.$('#reimagined-header-preview');
  if (elHeader) await elHeader.screenshot({ path: artifactDir + '/reimagined-1-header-tooltip.png' });

  const elScreen = await page.$('#flow-moodboard-screen');
  if (elScreen) await elScreen.screenshot({ path: artifactDir + '/reimagined-2-moodboard-screen.png' });

  const elModal = await page.$('#flow-moodboard-modal');
  if (elModal) await elModal.screenshot({ path: artifactDir + '/reimagined-3-moodboard-modal.png' });

  console.log('All reimagined screenshots rendered successfully!');
  await browser.close();
})();
