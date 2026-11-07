const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const https = require('https');

const app = express();
const PORT = 9876;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../public')));

const DATA_FILE = path.join(__dirname, '../public/data/soul-generations.json');
const CREDS_FILE = path.join(process.env.HOME || '/Users/savage', '.config/higgsfield/credentials.json');
const CONFIG_FILE = path.join(process.env.HOME || '/Users/savage', '.config/higgsfield/config.json');

const CUTOFF_JOB_ID = '0053510b-b56a-455f-a6e4-b230eebbe09e'; // Nov 5, 2026 6:49 AM

const { execSync, exec } = require('child_process');

let inMemoryItems = [];
let inProgressJobs = [];
let lastSyncTime = 0;
let lastKnownLatestId = null;
let isDeploying = false;

function refreshHiggsfieldToken() {
  try {
    const freshToken = execSync('higgsfield auth token', { encoding: 'utf8' }).trim();
    if (freshToken && freshToken.startsWith('oat_')) {
      return freshToken;
    }
  } catch (e) {
    console.error('Failed to run higgsfield auth token:', e.message);
  }
  return null;
}

function getCredentials() {
  try {
    if (fs.existsSync(CREDS_FILE)) {
      let creds = JSON.parse(fs.readFileSync(CREDS_FILE, 'utf8'));
      const nowSec = Math.floor(Date.now() / 1000);
      
      // If token is expired or within 10 minutes of expiry, refresh it
      if (creds.expires_at && nowSec > (creds.expires_at - 600)) {
        console.log('🔄 Token close to expiry, refreshing via Higgsfield CLI...');
        const fresh = refreshHiggsfieldToken();
        if (fresh && fs.existsSync(CREDS_FILE)) {
          creds = JSON.parse(fs.readFileSync(CREDS_FILE, 'utf8'));
        }
      }

      const config = fs.existsSync(CONFIG_FILE) ? JSON.parse(fs.readFileSync(CONFIG_FILE, 'utf8')) : {};
      return {
        token: creds.access_token,
        workspaceId: config.active_workspace_id || config.workspace_id || '2aaba1d1-1494-48db-b962-bcb047481c9a'
      };
    }
  } catch (e) {
    console.error('Error reading credentials:', e.message);
  }
  return null;
}

function formatDate(isoString) {
  try {
    const d = new Date(isoString);
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    const month = months[d.getUTCMonth()];
    const day = d.getUTCDate();
    const year = d.getUTCFullYear();
    let hours = d.getUTCHours() - 6; // CST
    if (hours < 0) hours += 24;
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12;
    const minutes = d.getUTCMinutes().toString().padStart(2, '0');
    return `${month} ${day}, ${year} at ${hours}:${minutes} ${ampm}`;
  } catch {
    return 'November 5, 2026';
  }
}

function formatSoulItem(job) {
  const p = job.params || {};
  return {
    id: job.id,
    prompt: p.prompt || '',
    model: 'Higgsfield Soul 2.0',
    moodboard: p.style?.name || 'General',
    quality: '2k',
    size: p.width && p.height ? `${p.width}x${p.height}` : '1536x2048',
    aspectRatio: '3:4',
    seed: p.seed || 74815,
    referenceImage: p.image_reference?.url || '',
    imageUrl: job.min_result_url || job.result_url,
    fullImageUrl: job.result_url || job.min_result_url,
    createdAt: formatDate(job.created_at),
    createdAtRaw: job.created_at,
    author: 'savage_mode',
    viewsCount: 0,
    likesCount: 0
  };
}

function fetchApiPage(token, workspaceId, cursor = null, size = 100) {
  return new Promise((resolve, reject) => {
    let reqPath = `/fnf/developer/v2alpha/jobs?size=${size}`;
    if (cursor) reqPath += `&cursor=${cursor}`;
    const options = {
      hostname: 'fnf-api-gw.higgsfield.ai',
      path: reqPath,
      headers: {
        'Authorization': `Bearer ${token}`,
        'hf-workspace-id': workspaceId
      }
    };
    https.get(options, (res) => {
      let body = '';
      res.on('data', c => body += c);
      res.on('end', () => {
        try {
          resolve(JSON.parse(body));
        } catch (e) {
          reject(e);
        }
      });
    }).on('error', reject);
  });
}

// Background poller & syncer
async function syncFromHiggsfield() {
  const creds = getCredentials();
  if (!creds || !creds.token) return;

  try {
    // 1. Fetch newest jobs (size 100)
    let allFetched = [];
    let cursor = null;
    let foundCutoff = false;

    for (let page = 0; page < 3; page++) {
      const data = await fetchApiPage(creds.token, creds.workspaceId, cursor, 100);
      const items = data.items || [];
      if (!items.length) break;
      allFetched = allFetched.concat(items);
      cursor = data.cursor;

      if (items.some(j => j.id === CUTOFF_JOB_ID)) {
        foundCutoff = true;
        break;
      }
      if (!data.cursor) break;
    }

    // Identify active queued or in-progress soul jobs
    const active = allFetched.filter(
      j => j.job_type === 'text2image_soul_v2' && (j.status === 'queued' || j.status === 'in_progress')
    );
    inProgressJobs = active;

    // Filter all completed soul jobs down to cutoff
    const soulJobs = allFetched.filter(j => j.job_type === 'text2image_soul_v2');
    const cutoffIdx = soulJobs.findIndex(j => j.id === CUTOFF_JOB_ID);

    let relevantSoulJobs = [];
    if (cutoffIdx !== -1) {
      relevantSoulJobs = soulJobs.slice(0, cutoffIdx + 1);
    } else {
      relevantSoulJobs = soulJobs;
    }

    const completed = relevantSoulJobs
      .filter(j => j.status === 'completed' && (j.result_url || j.min_result_url))
      .map(formatSoulItem);

    if (completed.length > 0) {
      const currentLatestId = completed[0].id;
      const isNewGeneration = lastKnownLatestId && currentLatestId !== lastKnownLatestId;
      lastKnownLatestId = currentLatestId;
      inMemoryItems = completed;
      lastSyncTime = Date.now();

      const dataPayload = JSON.stringify({
        success: true,
        total: completed.length,
        items: completed
      }, null, 2);

      // Persist to static data files
      fs.writeFileSync(DATA_FILE, dataPayload);
      const distFile = path.join(__dirname, '../dist/data/soul-generations.json');
      if (fs.existsSync(path.dirname(distFile))) {
        fs.writeFileSync(distFile, dataPayload);
      }

      // Automated Cloud Sync to halalfans.me whenever a new generation arrives
      if (isNewGeneration && !isDeploying) {
        isDeploying = true;
        console.log(`🚀 [Auto-Sync] Detected new generation: ${currentLatestId} (${completed.length} total). Syncing to live cloud...`);
        const { exec } = require('child_process');
        exec('npx vercel --prod --yes', { cwd: path.join(__dirname, '..') }, (err) => {
          isDeploying = false;
          if (err) {
            console.error('Vercel auto-deploy notice:', err.message);
          } else {
            console.log(`✅ [Auto-Sync] Cloud production deployment updated on halalfans.me!`);
          }
        });
      }
    }
  } catch (err) {
    console.error('Sync error:', err.message);
  }
}

// Initial sync and scheduled polling every 3 seconds
syncFromHiggsfield();
setInterval(syncFromHiggsfield, 3000);

// API Endpoints
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', bridge: 'higgsfield-cli', lastSync: new Date(lastSyncTime).toISOString() });
});

app.get('/api/account', (req, res) => {
  res.json({
    email: 'baha@bahasavage.com',
    plan: 'starter',
    credits: 270,
    workspace: 'Private',
    workspace_id: '2aaba1d1-1494-48db-b962-bcb047481c9a'
  });
});

app.get('/api/vault', (req, res) => {
  // If memory has items, use memory; otherwise read file
  let items = inMemoryItems;
  if (!items.length && fs.existsSync(DATA_FILE)) {
    try {
      const d = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
      items = d.items || [];
    } catch {}
  }

  res.json({
    success: true,
    total: items.length,
    inProgressCount: inProgressJobs.length,
    inProgressJobs: inProgressJobs.map(j => ({ id: j.id, status: j.status, created_at: j.created_at })),
    items
  });
});

app.listen(PORT, () => {
  console.log(`⚡ Real-time Higgsfield CLI Bridge running on http://localhost:${PORT}`);
  console.log(`Continuous background polling enabled (every 3s) down to cutoff: ${CUTOFF_JOB_ID}`);
});
