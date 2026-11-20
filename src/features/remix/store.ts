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
