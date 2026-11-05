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
    author: {
      username: 'Halal Fans',
      role: 'Author',
      avatarUrl: '/icons/icon128.png'
    },
    likes: 0,
    isLiked: false
  };
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const token = process.env.HIGGSFIELD_TOKEN || 'oat_O778R6AQT3M8835QV4QAGAETAK7NZBQY';
  const workspaceId = process.env.HIGGSFIELD_WORKSPACE_ID || '2aaba1d1-1494-48db-b962-bcb047481c9a';

  try {
    let allFetched = [];
    let cursor = null;

    // Fetch up to 4 pages (400 jobs) to cover all generations down to cutoff
    for (let page = 0; page < 4; page++) {
      let url = `https://fnf-api-gw.higgsfield.ai/fnf/developer/v2alpha/jobs?size=100`;
      if (cursor) url += `&cursor=${cursor}`;

      const apiRes = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'hf-workspace-id': workspaceId
        }
      });

      if (!apiRes.ok) break;

      const data = await apiRes.json();
      const items = data.items || [];
      if (!items.length) break;

      allFetched = allFetched.concat(items);
      cursor = data.cursor;

      if (items.some(j => j.id === CUTOFF_JOB_ID) || !data.cursor) {
        break;
      }
    }

    if (allFetched.length > 0) {
      // Find active queued or in_progress jobs
      const inProgress = allFetched.filter(
        j => j.job_type === 'text2image_soul_v2' && (j.status === 'queued' || j.status === 'in_progress')
      );

      // Filter soul jobs down to cutoff
      const soulJobs = allFetched.filter(j => j.job_type === 'text2image_soul_v2');
      const cutoffIdx = soulJobs.findIndex(j => j.id === CUTOFF_JOB_ID);
      const relevant = cutoffIdx !== -1 ? soulJobs.slice(0, cutoffIdx + 1) : soulJobs;

      const completed = relevant
        .filter(j => j.status === 'completed' && (j.result_url || j.min_result_url))
        .map(formatSoulItem);

      if (completed.length > 0) {
        return res.status(200).json({
          success: true,
          total: completed.length,
          inProgressCount: inProgress.length,
          items: completed,
          source: 'live-higgsfield-cloud'
        });
      }
    }
  } catch (err) {
    console.error('Live API fetch error in /api/vault:', err);
  }

  // Resilient fallback to static data
  try {
    const dataFilePath = path.join(process.cwd(), 'public/data/soul-generations.json');
    if (fs.existsSync(dataFilePath)) {
      const fileData = JSON.parse(fs.readFileSync(dataFilePath, 'utf8'));
      return res.status(200).json({
        success: true,
        items: fileData.items || [],
        total: fileData.total || (fileData.items || []).length,
        inProgressCount: 0,
        source: 'cached-fallback'
      });
    }
  } catch (e) {
    console.error('Cached fallback read error:', e);
  }

  return res.status(200).json({
    success: false,
    items: [],
    total: 0,
    inProgressCount: 0
  });
}
