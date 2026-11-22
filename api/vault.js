import fs from 'fs';
import path from 'path';

const CUTOFF_JOB_ID = '0053510b-b56a-455f-a6e4-b230eebbe09e';

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
    isVideo: false,
    author: {
      username: 'Halal Fans',
      role: 'Author',
      avatarUrl: '/icons/icon128.png'
    },
    likes: 0,
    isLiked: false
  };
}

// ---------- Live sync from Higgsfield (no local bridge, no redeploys) ----------
// Env (Vercel): HIGGSFIELD_TOKEN, HIGGSFIELD_WORKSPACE_ID. Without them the archive is served as-is.
const HF_API = 'https://fnf-api-gw.higgsfield.ai/fnf/developer/v2alpha/jobs';
const SOUL = 'text2image_soul_v2';
const MAX_PAGES = 5;

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

async function fetchLive(knownIds) {
  const token = process.env.HIGGSFIELD_TOKEN;
  const workspace = process.env.HIGGSFIELD_WORKSPACE_ID;
  if (!token || !workspace) return { items: [], status: 'not_configured' };
  const out = [];
  let cursor = null;
  for (let page = 0; page < MAX_PAGES; page++) {
    const url = `${HF_API}?size=100${cursor ? `&cursor=${encodeURIComponent(cursor)}` : ''}`;
    const r = await fetch(url, {
      headers: { Authorization: `Bearer ${token}`, 'hf-workspace-id': workspace, Accept: 'application/json' },
      signal: AbortSignal.timeout(8000),
    });
    if (!r.ok) return { items: out, status: `http_${r.status}` };
    const data = await r.json();
    const jobs = data.items || [];
    let reachedArchive = false;
    for (const job of jobs) {
      if (knownIds.has(job.id)) reachedArchive = true;
      if (job.job_type === SOUL && job.status === 'completed' && (job.result_url || job.min_result_url) && !knownIds.has(job.id)) {
        const item = formatSoulItem(job);
        item.category = categorize(item.prompt);
        out.push(item);
      }
    }
    cursor = data.next_cursor || data.cursor || null;
    if (reachedArchive || !cursor || !jobs.length) break; // everything older is already in the archive
  }
  return { items: out, status: 'ok' };
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  let archive = [];
  try {
    const dataFilePath = path.join(process.cwd(), 'public/data/soul-generations.json');
    if (fs.existsSync(dataFilePath)) archive = (JSON.parse(fs.readFileSync(dataFilePath, 'utf8')).items || []).filter((i) => !i.isVideo);
  } catch (e) {
    console.error('Archive read error in /api/vault:', e);
  }

  let live = { items: [], status: 'skipped' };
  try {
    live = await fetchLive(new Set(archive.map((i) => i.id)));
  } catch (e) {
    live = { items: [], status: 'error' };
    console.error('Live Higgsfield sync failed; serving archive:', e && e.message);
  }

  const items = [...live.items, ...archive].sort((a, b) => String(b.createdAtRaw || '').localeCompare(String(a.createdAtRaw || '')));
  // CDN caches for a minute, then refreshes in the background: new Soul generations show up within ~1–2 minutes.
  res.setHeader('Cache-Control', 'public, s-maxage=60, stale-while-revalidate=600');
  res.setHeader('X-Vault-Live', live.status);
  return res.status(200).json({
    success: items.length > 0,
    total: items.length,
    inProgressCount: 0,
    items,
    live: { status: live.status, added: live.items.length },
    source: 'soul-vault',
  });
}
