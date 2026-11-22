import { useSyncExternalStore } from 'react';
import { RemixMode, Quality } from './catalog';

/** Generation record (mirrors the spec's Generation entity, stored locally). */
export interface RemixGeneration {
  id: string;
  kind: 'remix' | 'edit';
  mode?: RemixMode;
  tool?: string; // edit tool id
  model: string;
  quality: Quality;
  aspect: string;
  seconds: number;
  inputs: { video?: string; videoName?: string; refs: string[]; prompt: string; style: string };
  output?: { url: string; poster?: string };
  parentId?: string; // remix lineage (library source)
  status: 'queued' | 'running' | 'done' | 'failed';
  progress?: number; // 0..100 while running
  /** Scene Remix job: which clip, who was cast, and the provenance manifest stored with the output. */
  scene?: {
    clipId: string;
    clipTitle: string;
    cast: { person_index: number; influencerId: string | null; name: string }[];
    provenance: Record<string, unknown>;
    watermark: string;
    parentRemixId?: string;
  };
  /** Real job on the remix engine (Railway). Without it the record uses the simulated runner. */
  engine?: {
    base: string;
    jobId: string;
    stage?: string;
    hd?: { state: 'idle' | 'running' | 'done' | 'error'; stage?: string; url?: string; error?: string };
  };
  error?: string;
  credits: number;
  liked?: boolean;
  downloaded?: boolean;
  createdAt: string;
}

const KEY = 'remix_history_v1';
const load = (): RemixGeneration[] => {
  try {
    return JSON.parse(localStorage.getItem(KEY) || '[]');
  } catch {
    return [];
  }
};

let items = load();
const listeners = new Set<() => void>();
const save = () => {
  try {
    // blob: URLs die with the tab, so only persist http(s)/relative media
    localStorage.setItem(KEY, JSON.stringify(items.slice(0, 200)));
  } catch {
    /* storage full */
  }
  listeners.forEach((l) => l());
};

export function addGeneration(g: Omit<RemixGeneration, 'id' | 'createdAt' | 'status'>): RemixGeneration {
  const full: RemixGeneration = {
    ...g,
    id: `rmx_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`,
    createdAt: new Date().toISOString(),
    status: 'queued',
  };
  items = [full, ...items];
  save();
  if (full.engine) {
    pollEngine(full.id);
    return full;
  }
  // Simulated job runner (GET /jobs/:id). Replace with the real queue when the backend lands.
  const total = full.scene ? 8000 : 2500;
  const started = Date.now();
  const tick = setInterval(() => {
    const p = Math.min(100, Math.round(((Date.now() - started) / total) * 100));
    if (p >= 100) {
      clearInterval(tick);
      updateGeneration(full.id, { status: 'done', progress: 100 });
    } else updateGeneration(full.id, { status: 'running', progress: p });
  }, 400);
  return full;
}

export function updateGeneration(id: string, patch: Partial<RemixGeneration>) {
  items = items.map((g) => (g.id === id ? { ...g, ...patch } : g));
  save();
}

export function deleteGeneration(id: string) {
  items = items.filter((g) => g.id !== id);
  save();
}

export function useGenerations() {
  return useSyncExternalStore(
    (cb) => {
      listeners.add(cb);
      return () => listeners.delete(cb);
    },
    () => items
  );
}

/** Library likes (per source id) — local social layer. */
const LIKE_KEY = 'remix_library_likes_v1';
let likes = new Set<string>(
  (() => {
    try {
      return JSON.parse(localStorage.getItem(LIKE_KEY) || '[]');
    } catch {
      return [];
    }
  })()
);
const likeListeners = new Set<() => void>();
export function toggleLibraryLike(id: string) {
  likes = new Set(likes);
  likes.has(id) ? likes.delete(id) : likes.add(id);
  try {
    localStorage.setItem(LIKE_KEY, JSON.stringify([...likes]));
  } catch {}
  likeListeners.forEach((l) => l());
}
export function useLibraryLikes() {
  return useSyncExternalStore(
    (cb) => {
      likeListeners.add(cb);
      return () => likeListeners.delete(cb);
    },
    () => likes
  );
}

/* ---------- Remix engine (real jobs) ---------- */

interface EngineStatus {
  state: 'queued' | 'preparing' | 'rendering' | 'done' | 'error';
  stage?: string;
  progress?: number;
  error?: string | null;
  draft_url?: string | null;
  hd?: { state: 'idle' | 'running' | 'done' | 'error'; stage?: string; error?: string | null; url?: string | null };
}

const polling = new Set<string>();

function applyStatus(id: string, d: EngineStatus) {
  const g = items.find((x) => x.id === id);
  if (!g?.engine) return;
  const hd = d.hd ? { state: d.hd.state, stage: d.hd.stage || undefined, url: d.hd.url || undefined, error: d.hd.error || undefined } : g.engine.hd;
  const engine = { ...g.engine, stage: d.stage, hd };
  if (d.state === 'done' && d.draft_url) {
    updateGeneration(id, { status: 'done', progress: 100, engine, output: { url: hd?.url || d.draft_url, poster: g.output?.poster } });
  } else if (d.state === 'error') {
    updateGeneration(id, { status: 'failed', engine, error: d.error || 'Generation failed' });
  } else {
    updateGeneration(id, { status: d.state === 'queued' ? 'queued' : 'running', progress: d.progress, engine });
  }
}

function pollEngine(id: string) {
  if (polling.has(id)) return;
  polling.add(id);
  let delay = 4000;
  const tick = async () => {
    const g = items.find((x) => x.id === id);
    if (!g?.engine) return polling.delete(id);
    try {
      const r = await fetch(`${g.engine.base}/v1/jobs/${g.engine.jobId}`);
      if (r.status === 404) {
        updateGeneration(id, { status: 'failed', error: 'This job no longer exists on the engine.' });
        return polling.delete(id);
      }
      const d: EngineStatus = await r.json();
      applyStatus(id, d);
      const hdBusy = d.hd?.state === 'running';
      if ((d.state === 'done' || d.state === 'error') && !hdBusy) return polling.delete(id);
      delay = 5000;
    } catch {
      delay = Math.min(delay * 2, 60000); // engine restarting or offline: keep the job, back off
    }
    setTimeout(tick, delay);
  };
  setTimeout(tick, delay);
}

/** Upgrade a finished draft to 1080p. */
export async function upgradeToHd(id: string): Promise<string | null> {
  const g = items.find((x) => x.id === id);
  if (!g?.engine) return 'Not an engine job';
  try {
    const r = await fetch(`${g.engine.base}/v1/jobs/${g.engine.jobId}/hd`, { method: 'POST' });
    const d = await r.json().catch(() => ({}));
    if (!r.ok) return d.detail || 'Could not start 1080p';
    applyStatus(id, d);
    pollEngine(id);
    return null;
  } catch {
    return 'Couldn’t reach the remix engine';
  }
}

// Resume polling after a reload.
items
  .filter((g) => g.engine && (g.status === 'queued' || g.status === 'running' || g.engine.hd?.state === 'running'))
  .forEach((g) => pollEngine(g.id));
