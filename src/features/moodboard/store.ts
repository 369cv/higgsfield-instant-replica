import { useSyncExternalStore } from 'react';
import { Palette } from './catalog';

/** Locally persisted moodboards, palettes and image generations (spec §Backend, local-first). */

export interface UserMoodboard {
  id: string;
  name: string;
  cover: string;
  images: string[]; // small data-URL thumbnails, persisted
  look: string; // derived style description
  status: 'training' | 'ready';
  createdAt: string;
}

export interface ImageGeneration {
  id: string;
  prompt: string;
  fullPrompt: string;
  model: string;
  aspect: string;
  quality: string;
  moodboard?: { id: string; name: string };
  characterId?: string;
  palette?: Palette;
  images: string[];
  credits: number;
  createdAt: string;
}

interface State {
  boards: UserMoodboard[];
  palettes: Palette[];
  gens: ImageGeneration[];
}

const KEY = 'moodboard_studio_v1';
const load = (): State => {
  try {
    return { boards: [], palettes: [], gens: [], ...JSON.parse(localStorage.getItem(KEY) || '{}') };
  } catch {
    return { boards: [], palettes: [], gens: [] };
  }
};

let state = load();
const listeners = new Set<() => void>();
const commit = (next: State) => {
  state = next;
  try {
    localStorage.setItem(KEY, JSON.stringify({ ...state, gens: state.gens.slice(0, 150) }));
  } catch {
    /* quota — keep in memory */
  }
  listeners.forEach((l) => l());
};

const uid = (p: string) => `${p}_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;

export function addBoard(b: Omit<UserMoodboard, 'id' | 'createdAt' | 'status'>) {
  const board: UserMoodboard = { ...b, id: uid('mb'), status: 'training', createdAt: new Date().toISOString() };
  commit({ ...state, boards: [board, ...state.boards] });
  // Simulated training job (POST /moodboards -> job). Swap for the real trainer.
  setTimeout(() => commit({ ...state, boards: state.boards.map((x) => (x.id === board.id ? { ...x, status: 'ready' } : x)) }), 4000);
  return board;
}
export const deleteBoard = (id: string) => commit({ ...state, boards: state.boards.filter((b) => b.id !== id) });
export const addPalette = (p: Palette) => commit({ ...state, palettes: [p, ...state.palettes] });
export function addGen(g: Omit<ImageGeneration, 'id' | 'createdAt'>) {
  const full = { ...g, id: uid('img'), createdAt: new Date().toISOString() };
  commit({ ...state, gens: [full, ...state.gens] });
  return full;
}
export const deleteGen = (id: string) => commit({ ...state, gens: state.gens.filter((g) => g.id !== id) });

export function useMoodboardStore() {
  return useSyncExternalStore(
    (cb) => {
      listeners.add(cb);
      return () => listeners.delete(cb);
    },
    () => state
  );
}

/* ---------- image utilities ---------- */

function loadOnce(src: string, cors: boolean) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new Image();
    if (cors) img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

/** Try CORS first (so canvas reads work); fall back to a plain load for hosts without CORS. */
export function loadImage(src: string) {
  return loadOnce(src, !src.startsWith('blob:') && !src.startsWith('data:')).catch(() => loadOnce(src, false));
}

/** Resize to a persistable thumbnail and report the original resolution + a blur score. */
export async function inspectImage(src: string, max = 320) {
  const img = await loadImage(src);
  const scale = Math.min(1, max / Math.max(img.width, img.height));
  const c = document.createElement('canvas');
  c.width = Math.round(img.width * scale);
  c.height = Math.round(img.height * scale);
  const ctx = c.getContext('2d')!;
  ctx.drawImage(img, 0, 0, c.width, c.height);
  let blur = 0;
  let thumb = src;
  let mean: [number, number, number] = [0, 0, 0];
  try {
    const d = ctx.getImageData(0, 0, c.width, c.height).data;
    // Laplacian-ish variance on luminance: low = blurry
    const w = c.width;
    const lum = (i: number) => 0.299 * d[i] + 0.587 * d[i + 1] + 0.114 * d[i + 2];
    let sum = 0,
      sq = 0,
      n = 0;
    for (let y = 1; y < c.height - 1; y += 2)
      for (let x = 1; x < w - 1; x += 2) {
        const i = (y * w + x) * 4;
        const lap = 4 * lum(i) - lum(i - 4) - lum(i + 4) - lum(i - w * 4) - lum(i + w * 4);
        sum += lap;
        sq += lap * lap;
        n++;
      }
    blur = n ? sq / n - (sum / n) ** 2 : 0;
    let r = 0,
      g = 0,
      b = 0,
      k = 0;
    for (let i = 0; i < d.length; i += 16) {
      r += d[i];
      g += d[i + 1];
      b += d[i + 2];
      k++;
    }
    mean = [r / k, g / k, b / k];
    thumb = c.toDataURL('image/jpeg', 0.72);
  } catch {
    /* cross-origin canvas: keep original URL, skip scores */
  }
  return { thumb, width: img.width, height: img.height, blur, mean };
}

/** Palette extraction: coarse colour buckets, top-N by frequency, spread by distance. */
export async function extractPalette(src: string, n = 5): Promise<string[]> {
  const img = await loadImage(src);
  const c = document.createElement('canvas');
  c.width = 64;
  c.height = Math.max(1, Math.round((64 * img.height) / img.width));
  const ctx = c.getContext('2d')!;
  ctx.drawImage(img, 0, 0, c.width, c.height);
  const d = ctx.getImageData(0, 0, c.width, c.height).data;
  const buckets = new Map<number, { r: number; g: number; b: number; n: number }>();
  for (let i = 0; i < d.length; i += 4) {
    const key = ((d[i] >> 4) << 8) | ((d[i + 1] >> 4) << 4) | (d[i + 2] >> 4);
    const e = buckets.get(key) || { r: 0, g: 0, b: 0, n: 0 };
    e.r += d[i];
    e.g += d[i + 1];
    e.b += d[i + 2];
    e.n++;
    buckets.set(key, e);
  }
  const sorted = [...buckets.values()].sort((a, b) => b.n - a.n).map((e) => [e.r / e.n, e.g / e.n, e.b / e.n]);
  const picked: number[][] = [];
  for (const col of sorted) {
    if (picked.every((p) => Math.hypot(p[0] - col[0], p[1] - col[1], p[2] - col[2]) > 48)) picked.push(col);
    if (picked.length === n) break;
  }
  const lum = (c: number[]) => 0.299 * c[0] + 0.587 * c[1] + 0.114 * c[2];
  return picked.sort((a, b) => lum(a) - lum(b)).map((c) => '#' + c.map((v) => Math.round(v).toString(16).padStart(2, '0')).join(''));
}
