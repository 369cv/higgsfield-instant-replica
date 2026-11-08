const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const https = require('https');
const { execSync } = require('child_process');

const app = express();
const PORT = 9876;

app.use(cors());
app.use(express.json());

const DATA_FILE = path.join(__dirname, '../public/data/soul-generations.json');
const MASTER_FILE = path.join(__dirname, 'master-vault.json');
const CONFIG_FILE = path.expandHomeDir ? path.expandHomeDir('~/.config/higgsfield/config.json') : path.join(process.env.HOME || '/Users/savage', '.config/higgsfield/config.json');

let inMemoryItems = [];
let inProgressJobs = [];
let lastSyncTime = Date.now();
let lastKnownLatestId = null;
let isDeploying = false;

// Load existing master archive on start
try {
  if (fs.existsSync(MASTER_FILE)) {
    const raw = JSON.parse(fs.readFileSync(MASTER_FILE, 'utf8'));
    inMemoryItems = raw.items || [];
    if (inMemoryItems.length > 0) {
      lastKnownLatestId = inMemoryItems[0].id;
    }
    console.log(`📦 Loaded ${inMemoryItems.length} Soul items from master-vault.json archive.`);
  }
} catch (e) {
  console.error('Error loading master archive:', e.message);
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
    return 'November 7, 2026';
  }
}

function categorize(prompt) {
  const p = (prompt || '').toLowerCase();
  if (p.includes('hijab') || p.includes('abaya') || p.includes('modest')) return 'Modest & Hijab';
  if (p.includes('podcast') || p.includes('microphone') || p.includes('interview') || p.includes('studio')) return 'Podcast & Studio';
  if (p.includes('gym') || p.includes('workout') || p.includes('fitness') || p.includes('weights') || p.includes('athletic')) return 'Gym & Fitness';
  if (p.includes('night') || p.includes('flash') || p.includes('club') || p.includes('evening') || p.includes('car')) return 'Nightlife & Flash';
  if (p.includes('bikini') || p.includes('swim') || p.includes('resort') || p.includes('beach') || p.includes('pool')) return 'Resort & Swimwear';
  if (p.includes('street') || p.includes('urban') || p.includes('walking') || p.includes('sidewalk')) return 'Streetstyle';
  return 'Editorial & Luxury';
}

function formatSoulItem(job) {
  const p = job.params || {};
  const prompt = p.prompt || '';
  return {
    id: job.id,
    prompt: prompt,
    category: categorize(prompt),
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
    author: {
      username: 'Halal Fans',
      role: 'Author',
      avatarUrl: '/icons/icon128.png'
    },
    likes: 0,
    isLiked: false
  };
}

function getCredentials() {
  try {
    if (fs.existsSync(CONFIG_FILE)) {
      const config = JSON.parse(fs.readFileSync(CONFIG_FILE, 'utf8'));
      if (config.auth && config.auth.token) {
        if (config.auth.expires_at) {
          const expiresAt = new Date(config.auth.expires_at).getTime();
          const now = Date.now();
          if (expiresAt - now < 300000) {
            console.log('🔄 Token expiring soon, refreshing via higgsfield auth token...');
            try {
              execSync('higgsfield auth token', { stdio: 'pipe' });
              const freshConfig = JSON.parse(fs.readFileSync(CONFIG_FILE, 'utf8'));
              return {
                token: freshConfig.auth.token,
                workspaceId: freshConfig.auth.workspace_id || '2aaba1d1-1494-48db-b962-bcb047481c9a'
              };
            } catch (reErr) {
              console.warn('Auto-refresh token failed, using existing token:', reErr.message);
            }
          }
        }
        return {
          token: config.auth.token,
          workspaceId: config.auth.workspace_id || '2aaba1d1-1494-48db-b962-bcb047481c9a'
        };
      }
    }
  } catch (err) {
    console.error('Error reading Higgsfield config:', err.message);
  }
  return {
    token: process.env.HIGGSFIELD_TOKEN || 'oat_O7KY63444YM6W8EM25GE4G2FJXDRPHMB',
    workspaceId: process.env.HIGGSFIELD_WORKSPACE_ID || '2aaba1d1-1494-48db-b962-bcb047481c9a'
  };
}

function fetchApiPage(token, workspaceId, cursor = null, size = 100) {
  return new Promise((resolve, reject) => {
    let url = `/fnf/developer/v2alpha/jobs?size=${size}`;
    if (cursor) url += `&cursor=${cursor}`;

    const options = {
      hostname: 'fnf-api-gw.higgsfield.ai',
      port: 443,
      path: url,
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'hf-workspace-id': workspaceId,
        'Accept': 'application/json'
      }
    };

    https.get(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          resolve(parsed);
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
    // 1. Fetch newest jobs (size 50) to catch in-flight or brand new drops
    const data = await fetchApiPage(creds.token, creds.workspaceId, null, 50);
    const items = data.items || [];
    if (!items.length) return;

    // Identify active queued or in-progress soul jobs
    const active = items.filter(
      j => j.job_type === 'text2image_soul_v2' && (j.status === 'queued' || j.status === 'in_progress')
    );
    inProgressJobs = active;

    // Format new completed soul jobs
    const recentCompleted = items
      .filter(j => j.job_type === 'text2image_soul_v2' && j.status === 'completed' && (j.result_url || j.min_result_url))
      .map(formatSoulItem);

    if (recentCompleted.length > 0) {
      const currentLatestId = recentCompleted[0].id;
      const isNewGeneration = lastKnownLatestId && currentLatestId !== lastKnownLatestId;

      // Merge new items into existing inMemoryItems (avoid duplicates)
      const existingIds = new Set(inMemoryItems.map(i => i.id));
      const newlyAdded = [];
      for (const item of recentCompleted) {
        if (!existingIds.has(item.id)) {
          newlyAdded.push(item);
        }
      }

      if (newlyAdded.length > 0) {
        console.log(`✨ Prepended ${newlyAdded.length} new live generation(s) to master vault!`);
        inMemoryItems = [...newlyAdded, ...inMemoryItems];
        lastKnownLatestId = inMemoryItems[0].id;

        const dataPayload = JSON.stringify({
          success: true,
          total: inMemoryItems.length,
          items: inMemoryItems
        }, null, 2);

        // Persist to master archive & public data
        fs.writeFileSync(MASTER_FILE, dataPayload);
        fs.writeFileSync(DATA_FILE, dataPayload);
        const distFile = path.join(__dirname, '../dist/data/soul-generations.json');
        if (fs.existsSync(path.dirname(distFile))) {
          fs.writeFileSync(distFile, dataPayload);
        }
      }

      lastSyncTime = Date.now();

      // Automated Cloud Sync to halalfans.me whenever a new generation arrives
      if (isNewGeneration && !isDeploying) {
        isDeploying = true;
        console.log(`🚀 [Auto-Sync] Detected new generation: ${currentLatestId} (${inMemoryItems.length} total). Syncing to live cloud...`);
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
  res.json({
    status: 'ok',
    bridge: 'higgsfield-cli',
    totalItems: inMemoryItems.length,
    inProgressCount: inProgressJobs.length,
    lastSync: new Date(lastSyncTime).toISOString()
  });
});

app.get('/api/audit', (req, res) => {
  const categories = {};
  let hijabCount = 0;
  inMemoryItems.forEach(item => {
    categories[item.category] = (categories[item.category] || 0) + 1;
    if (item.category === 'Modest & Hijab') hijabCount++;
  });

  res.json({
    totalGenerations: inMemoryItems.length,
    inProgressCount: inProgressJobs.length,
    categories,
    hijabGenerationsCount: hijabCount,
    earliestGeneration: inMemoryItems[inMemoryItems.length - 1]?.createdAtRaw || null,
    latestGeneration: inMemoryItems[0]?.createdAtRaw || null
  });
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
  res.json({
    success: true,
    total: inMemoryItems.length,
    inProgressCount: inProgressJobs.length,
    inProgressJobs: inProgressJobs.map(j => ({ id: j.id, status: j.status, created_at: j.created_at })),
    items: inMemoryItems
  });
});

app.listen(PORT, () => {
  console.log(`⚡ Comprehensive Higgsfield Bridge running on http://localhost:${PORT}`);
  console.log(`Serving all ${inMemoryItems.length} Soul generations with zero truncation.`);
});
