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

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Load the pre-indexed clean library of Soul images from car cutoff onward
  try {
    const dataFilePath = path.join(process.cwd(), 'public/data/soul-generations.json');
    if (fs.existsSync(dataFilePath)) {
      const fileData = JSON.parse(fs.readFileSync(dataFilePath, 'utf8'));
      const items = (fileData.items || []).filter(i => !i.isVideo);
      return res.status(200).json({
        success: true,
        total: items.length,
        inProgressCount: 0,
        items: items,
        source: 'clean-soul-vault'
      });
    }
  } catch (e) {
    console.error('File read error in /api/vault:', e);
  }

  return res.status(200).json({
    success: false,
    items: [],
    total: 0,
    inProgressCount: 0
  });
}
