import { useSyncExternalStore } from 'react';
import presetClips from '../../../db/seed/preset-clips.json';
import { Clip, Collection, uid, RIGHTS_STATEMENT } from './logic';
import { CHARACTER_PRESETS, presetSheet, presetFace } from '../influencer/catalog';

/**
 * Client-side Scene Remix state, shaped like the /api/scenes contract. Local-first until media storage
 * exists: presets come from the seed file; uploads, collections and likes persist in this browser.
 * Detection, remix jobs and reports are also sent to the API when it is reachable.
 */

interface State {
  uploads: Clip[];
  collections: Collection[];
  likes: string[];
  recentInfluencers: string[];
  reports: { id: string; target: string; reason: string; at: string }[];
}

const KEY = 'scene_remix_v1';
const OWNER = 'me';
const load = (): State => {
  const empty: State = { uploads: [], collections: [], likes: [], recentInfluencers: [], reports: [] };
  try {
    return { ...empty, ...JSON.parse(localStorage.getItem(KEY) || '{}') };
  } catch {
    return empty;
  }
};

let state = load();
const listeners = new Set<() => void>();
const commit = (next: Partial<State>) => {
  state = { ...state, ...next };
  try {
    // blob: video URLs only live for this tab; metadata and attestation persist
    localStorage.setItem(KEY, JSON.stringify(state));
  } catch {
    /* quota */
  }
  listeners.forEach((l) => l());
};

export function useSceneStore() {
  return useSyncExternalStore(
    (cb) => {
      listeners.add(cb);
      return () => listeners.delete(cb);
    },
    () => state
  );
}

export const PRESETS = presetClips as unknown as Clip[];

/** Everything the viewer can see: public presets + their own uploads (any visibility). */
export function visibleClips(s: State): Clip[] {
  const likeBump = (c: Clip) => (s.likes.includes(c.id) ? { ...c, like_count: c.like_count + 1 } : c);
  return [...s.uploads.filter((u) => u.visibility !== 'removed'), ...PRESETS].map(likeBump);
}

/* ---------- uploads ---------- */

export function addUpload(p: { title: string; url: string; poster: string | null; duration: number; aspect: string; sha256: string; people: number; genre: string[]; transcript: string }) {
  const clip: Clip = {
    id: uid('clip'),
    title: p.title || 'Untitled clip',
    source: 'user_upload',
    owner_id: OWNER,
    storage_url: p.url,
    poster_url: p.poster,
    duration_s: p.duration,
    aspect: p.aspect,
    genre: p.genre,
    mood: [],
    setting: [],
    people_count: p.people,
    people: [],
    transcript: p.transcript || null,
    tags: [],
    license_note: 'User attested ownership or rights.',
    content_sha256: p.sha256,
    rights_attested_at: new Date().toISOString(),
    rights_attestation: RIGHTS_STATEMENT,
    visibility: 'private',
    remix_count: 0,
    like_count: 0,
    created_at: new Date().toISOString(),
  };
  commit({ uploads: [clip, ...state.uploads] });
  return clip;
}

export const requestPublish = (id: string) => commit({ uploads: state.uploads.map((u) => (u.id === id ? { ...u, visibility: 'pending' } : u)) });
export const makePrivate = (id: string) => commit({ uploads: state.uploads.map((u) => (u.id === id ? { ...u, visibility: 'private' } : u)) });
export const deleteUpload = (id: string) => commit({ uploads: state.uploads.filter((u) => u.id !== id) });

/* ---------- likes ---------- */

export const toggleLike = (id: string) => commit({ likes: state.likes.includes(id) ? state.likes.filter((x) => x !== id) : [...state.likes, id] });

/* ---------- collections ---------- */

export function createCollection(name: string, clipId?: string) {
  const c: Collection = {
    id: uid('col'),
    owner_id: OWNER,
    name: name.trim() || 'New collection',
    description: '',
    cover_clip_id: clipId || null,
    clip_ids: clipId ? [clipId] : [],
    visibility: 'private',
    position: state.collections.length,
    share_token: null,
    created_at: new Date().toISOString(),
  };
  commit({ collections: [...state.collections, c] });
  return c;
}

export function updateCollection(id: string, patch: Partial<Collection>) {
  commit({
    collections: state.collections.map((c) => {
      if (c.id !== id) return c;
      const next = { ...c, ...patch };
      if (!next.clip_ids.includes(next.cover_clip_id || '')) next.cover_clip_id = next.clip_ids[0] || null;
      return next;
    }),
  });
}

export function toggleInCollection(colId: string, clipId: string) {
  const c = state.collections.find((x) => x.id === colId);
  if (!c) return;
  updateCollection(colId, { clip_ids: c.clip_ids.includes(clipId) ? c.clip_ids.filter((x) => x !== clipId) : [...c.clip_ids, clipId] });
}

export function moveCollection(id: string, dir: -1 | 1) {
  const list = [...state.collections].sort((a, b) => a.position - b.position);
  const i = list.findIndex((c) => c.id === id);
  const j = i + dir;
  if (i < 0 || j < 0 || j >= list.length) return;
  [list[i], list[j]] = [list[j], list[i]];
  commit({ collections: list.map((c, k) => ({ ...c, position: k })) });
}

export const deleteCollection = (id: string) => commit({ collections: state.collections.filter((c) => c.id !== id) });

export function shareCollection(id: string) {
  const c = state.collections.find((x) => x.id === id);
  if (!c) return '';
  const token = c.share_token || uid('share');
  updateCollection(id, { share_token: token, visibility: 'public' });
  return `${location.origin}/scenes/c/${token}`;
}

/* ---------- reports ---------- */

export const fileReport = (target: string, reason: string) =>
  commit({ reports: [...state.reports, { id: uid('rep'), target, reason, at: new Date().toISOString() }] });

/* ---------- influencers (the user's own AI characters only) ---------- */

export interface Influencer {
  id: string;
  name: string;
  sheet: string;
  face: string;
}

export const INFLUENCERS: Influencer[] = CHARACTER_PRESETS.map((c) => ({ id: c.id, name: c.name, sheet: presetSheet(c.id), face: presetFace(c.id) }));
export const influencerName = (id: string) => INFLUENCERS.find((i) => i.id === id)?.name || id;

export const markRecent = (id: string) => commit({ recentInfluencers: [id, ...state.recentInfluencers.filter((x) => x !== id)].slice(0, 8) });

/* ---------- media helpers ---------- */

export async function sha256(file: File) {
  const buf = await file.arrayBuffer();
  const hash = await crypto.subtle.digest('SHA-256', buf);
  return [...new Uint8Array(hash)].map((b) => b.toString(16).padStart(2, '0')).join('');
}

/** Reads duration, aspect and a poster frame (0.5s in) from a local video file. */
export function probeVideo(url: string) {
  return new Promise<{ duration: number; aspect: string; poster: string | null }>((resolve) => {
    const v = document.createElement('video');
    v.muted = true;
    v.preload = 'auto';
    v.src = url;
    v.onloadedmetadata = () => {
      v.currentTime = Math.min(0.5, v.duration / 2);
    };
    v.onseeked = () => {
      const w = v.videoWidth;
      const h = v.videoHeight;
      let poster: string | null = null;
      try {
        const c = document.createElement('canvas');
        const k = 480 / Math.max(w, h);
        c.width = Math.round(w * k);
        c.height = Math.round(h * k);
        c.getContext('2d')!.drawImage(v, 0, 0, c.width, c.height);
        poster = c.toDataURL('image/jpeg', 0.75);
      } catch {}
      const r = w / h;
      const aspect = r > 1.5 ? '16:9' : r > 1.1 ? '4:3' : r > 0.9 ? '1:1' : r > 0.7 ? '4:5' : '9:16';
      resolve({ duration: v.duration, aspect, poster });
    };
    v.onerror = () => resolve({ duration: 0, aspect: '9:16', poster: null });
  });
}

/** Known-copyrighted fingerprints. Populated from the server's blocked_content table when the API is enabled. */
export const BLOCKED_HASHES = new Set<string>();
