const fs = require('fs');
const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox', '--disable-setuid-sandbox'] });
  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 1100, deviceScaleFactor: 2 });
  
  await page.goto('file:///Users/savage/.gemini/antigravity/scratch/higgsfield-instant-replica/scratch/redesigned-pure-icon-navigation.html', { waitUntil: 'networkidle0' });

  const artifactDir = '/Users/savage/.gemini/antigravity/brain/fa3f07d0-8348-4329-aa05-cb61e4efb02f/screenshots';

  // 1. Header Bar only
  const elHeader = await page.$('#header-bar-preview');
  if (elHeader) await elHeader.screenshot({ path: artifactDir + '/redesign-1-pure-icon-header.png' });

  // 2. Moodboard Screen
  const elMoodboard = await page.$('#screen-moodboard');
  if (elMoodboard) await elMoodboard.screenshot({ path: artifactDir + '/redesign-2-screen-moodboard.png' });

  // 3. AI Influencer Screen
  const elInfluencer = await page.$('#screen-influencer');
  if (elInfluencer) await elInfluencer.screenshot({ path: artifactDir + '/redesign-3-screen-influencer.png' });

  // 4. Video Screen
  const elVideo = await page.$('#screen-video');
  if (elVideo) await elVideo.screenshot({ path: artifactDir + '/redesign-4-screen-video.png' });

  console.log('All pure-icon redesigned screens successfully captured to disk!');
  await browser.close();
})();
