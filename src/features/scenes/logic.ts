/**
 * Scene Remix — pure domain logic shared by the UI and the /api/scenes routes.
 * No React, no DOM, no storage: safe to import from serverless functions.
 */

export type ClipSource = 'preset' | 'user_upload';
export type Visibility = 'private' | 'pending' | 'public' | 'removed';
export type Quality = '480p' | '720p' | '1080p';

export interface PersonPoint {
  index: number; // 1-based, matches the chip number
  x: number; // 0..1 across the poster frame
  y: number; // 0..1 down the poster frame
}

export interface Clip {
  id: string;
  title: string;
  source: ClipSource;
  owner_id: string;
  storage_url: string | null;
  poster_url: string | null;
  duration_s: number;
  aspect: string;
  genre: string[];
  mood: string[];
  setting: string[];
  people_count: number;
  people: PersonPoint[];
  transcript?: string | null;
  tags: string[];
  license_note: string | null;
  content_sha256?: string | null;
  rights_attested_at?: string | null;
  rights_attestation?: string | null;
  visibility: Visibility;
  remix_count: number;
  like_count: number;
  created_at: string;
}

export interface Collection {
  id: string;
  owner_id: string;
  name: string;
  description: string;
  cover_clip_id: string | null;
  clip_ids: string[];
  visibility: 'private' | 'public';
  position: number;
  share_token?: string | null;
  created_at: string;
}

export interface CastEntry {
  person_index: number;
  influencer_id: string | null; // null = keep the original person
  keep: boolean;
}

export interface Provenance {
  generator: string;
  model: string;
  clip_id: string;
  clip_source: ClipSource;
  influencer_ids: string[];
  synthetic: true;
  watermark: string;
  created_at: string;
}

export interface Remix {
  id: string;
  user_id: string;
  clip_id: string;
  character_map: CastEntry[];
  object_refs: string[];
  style: string | null;
  prompt: string;
  model: string;
  quality: Quality;
  status: 'queued' | 'running' | 'done' | 'failed';
  progress: number;
  output_url: string | null;
  watermarked: boolean;
  provenance: Provenance;
  credits: number;
  parent_remix_id: string | null;
  failure_reason?: string | null;
  created_at: string;
}

/* ---------------- vocab ---------------- */

export const GENRES = ['Business', 'Real estate', 'Legal drama', 'Pitch', 'Comedy', 'Lifestyle', 'Sports'] as const;
export const MOODS = ['confident', 'tense', 'dramatic', 'energetic', 'playful', 'calm', 'aspirational', 'triumphant', 'chaotic'] as const;
export const DURATIONS = [
  { id: 'short', label: '≤ 8s', test: (s: number) => s <= 8 },
  { id: 'mid', label: '9–15s', test: (s: number) => s > 8 && s <= 15 },
  { id: 'long', label: '16–30s', test: (s: number) => s > 15 },
] as const;
export type SortKey = 'trending' | 'latest' | 'most_remixed';

export const LIMITS = { minSeconds: 4, maxSeconds: 30, maxObjectRefs: 30, maxPeople: 12, uploadTypes: ['video/mp4', 'video/quicktime'] };
export const RIGHTS_STATEMENT = 'I own this clip or have the rights to use it.';
export const WATERMARK = 'AI-generated · Halal Fans';

/* ---------------- search ---------------- */

export interface ClipQuery {
  q?: string;
  genre?: string[];
  mood?: string[];
  setting?: string[];
  people?: number[]; // exact counts; 4 means 4+
  duration?: string[]; // DURATIONS ids
  sort?: SortKey;
}

const norm = (s: string) => s.toLowerCase().normalize('NFKD').replace(/[^\p{L}\p{N}\s]/gu, ' ');

/** Weighted full-text score: title > transcript ("search by a line") > tags/setting/genre. Mirrors the tsvector weights. */
export function scoreClip(c: Clip, q: string): number {
  const terms = norm(q).split(/\s+/).filter(Boolean);
  if (!terms.length) return 1;
  const title = norm(c.title);
  const line = norm(c.transcript || '');
  const meta = norm([...c.tags, ...c.setting, ...c.genre, ...c.mood].join(' '));
  let score = 0;
  for (const t of terms) {
    const hit = (title.includes(t) ? 3 : 0) + (line.includes(t) ? 2 : 0) + (meta.includes(t) ? 1 : 0);
    if (!hit) return 0; // every term must match somewhere (AND semantics)
    score += hit;
  }
  if (line.includes(norm(q).trim())) score += 4; // exact line phrase
  return score;
}

const anyOf = (have: string[], want?: string[]) => !want?.length || want.some((w) => have.map((h) => h.toLowerCase()).includes(w.toLowerCase()));

export function trendingScore(c: Clip, now = Date.now()) {
  const ageDays = Math.max(0.5, (now - Date.parse(c.created_at)) / 864e5);
  return (c.remix_count * 2 + c.like_count) / Math.pow(ageDays + 2, 0.8);
}

export function searchClips(clips: Clip[], query: ClipQuery): Clip[] {
  const q = query.q?.trim() || '';
  const scored = clips
    .filter((c) => c.visibility !== 'removed')
    .filter((c) => anyOf(c.genre, query.genre) && anyOf(c.mood, query.mood) && anyOf(c.setting, query.setting))
    .filter((c) => !query.people?.length || query.people.some((p) => (p >= 4 ? c.people_count >= 4 : c.people_count === p)))
    .filter((c) => !query.duration?.length || query.duration.some((d) => DURATIONS.find((x) => x.id === d)?.test(c.duration_s)))
    .map((c) => ({ c, s: scoreClip(c, q) }))
    .filter((x) => x.s > 0);
  const sort = query.sort || 'trending';
  scored.sort((a, b) => {
    if (q && b.s !== a.s) return b.s - a.s;
    if (sort === 'latest') return Date.parse(b.c.created_at) - Date.parse(a.c.created_at);
    if (sort === 'most_remixed') return b.c.remix_count - a.c.remix_count;
    return trendingScore(b.c) - trendingScore(a.c);
  });
  return scored.map((x) => x.c);
}

/** Facet values present in a clip set (for filter chips). */
export function facets(clips: Clip[]) {
  const uniq = (xs: string[]) => [...new Set(xs)].sort();
  return {
    mood: uniq(clips.flatMap((c) => c.mood)),
    setting: uniq(clips.flatMap((c) => c.setting)),
  };
}

/* ---------------- rules ---------------- */

/** Only presets, or user uploads with a stored attestation, may be remixed. */
export function canRemix(c: Clip): { ok: true } | { ok: false; reason: string } {
  if (c.visibility === 'removed') return { ok: false, reason: 'This clip was removed.' };
  if (c.source === 'preset') return { ok: true };
  if (c.source === 'user_upload' && c.rights_attested_at) return { ok: true };
  return { ok: false, reason: 'Uploads need a rights attestation before they can be remixed.' };
}

export function validateUpload(p: { type: string; size: number; duration_s: number; attested: boolean; sha256?: string; blocked?: Set<string> }) {
  const errors: string[] = [];
  if (!p.attested) errors.push('Tick the rights statement to upload.');
  if (!LIMITS.uploadTypes.includes(p.type)) errors.push('Use an MP4 or MOV file.');
  if (p.duration_s < LIMITS.minSeconds || p.duration_s > LIMITS.maxSeconds) errors.push(`Clip must be ${LIMITS.minSeconds}–${LIMITS.maxSeconds}s (this one is ${Math.round(p.duration_s)}s).`);
  if (p.size > 200 * 1024 * 1024) errors.push('Max file size is 200 MB.');
  if (p.sha256 && p.blocked?.has(p.sha256)) errors.push('This clip matches known copyrighted content and can’t be uploaded.');
  return errors;
}

/** Every detected person must be cast with an influencer or explicitly kept. */
export function castComplete(peopleCount: number, cast: CastEntry[]) {
  for (let i = 1; i <= peopleCount; i++) {
    const e = cast.find((x) => x.person_index === i);
    if (!e || (!e.keep && !e.influencer_id)) return false;
  }
  return peopleCount > 0 ? cast.some((e) => !!e.influencer_id) : true;
}

/* ---------------- detection ---------------- */

/**
 * Person detection contract. Presets ship with annotated points; for uploads the server runs a detector
 * (see the detect route in api/scenes.ts) and, without one configured, returns evenly spaced placeholders the user can adjust.
 */
export function placeholderPeople(count: number): PersonPoint[] {
  const n = Math.max(1, Math.min(LIMITS.maxPeople, count));
  return Array.from({ length: n }, (_, k) => ({ index: k + 1, x: +((k + 0.5) / n).toFixed(3), y: 0.42 }));
}

/* ---------------- cost ---------------- */

export const SCENE_MODELS = [
  { id: 'remix-pro', name: 'Remix Pro', rate: 10, badges: ['1080p', '4–30s'], tagline: 'Full-body motion, identity lock' },
  { id: 'remix-lite', name: 'Remix Lite', rate: 4, badges: ['720p', '4–30s'], tagline: 'Faster drafts, lower cost' },
  { id: 'swapper', name: 'Swapper', rate: 9, badges: ['1080p', '4–20s'], tagline: 'Object & wardrobe replacement' },
] as const;
const Q_MULT: Record<Quality, number> = { '480p': 0.6, '720p': 1, '1080p': 1.7 };

export function estimateSceneCredits(p: { model: string; quality: Quality; duration_s: number; cast: number; objectRefs: number; styled: boolean }) {
  const m = SCENE_MODELS.find((x) => x.id === p.model) || SCENE_MODELS[0];
  const base = m.rate * Math.max(4, p.duration_s) * Q_MULT[p.quality];
  const total = base + p.cast * 15 + p.objectRefs * 4 + (p.styled ? 20 : 0);
  return Math.round(total / 5) * 5;
}

/* ---------------- prompt ---------------- */

export const slug = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '');

/** "Replace person 1 with @layla_al_mansoor." … plus object-swap and keep lines. */
export function castPrompt(cast: CastEntry[], nameOf: (id: string) => string, objectRefs: number) {
  const lines = [...cast]
    .sort((a, b) => a.person_index - b.person_index)
    .map((e) => (e.influencer_id ? `Replace person ${e.person_index} with @${slug(nameOf(e.influencer_id))}.` : `Keep person ${e.person_index} as is.`));
  if (objectRefs) lines.push(`Swap products and outfits using ${Array.from({ length: objectRefs }, (_, i) => `@object${i + 1}`).join(', ')}.`);
  lines.push('Keep the original camera, timing and motion.');
  return lines.join(' ');
}

export function buildProvenance(p: { model: string; clip: Clip; cast: CastEntry[] }): Provenance {
  return {
    generator: 'Halal Fans Scene Remix',
    model: p.model,
    clip_id: p.clip.id,
    clip_source: p.clip.source,
    influencer_ids: p.cast.filter((c) => c.influencer_id).map((c) => c.influencer_id!) ,
    synthetic: true,
    watermark: WATERMARK,
    created_at: new Date().toISOString(),
  };
}

export const uid = (prefix: string) => `${prefix}_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`;

/** Outbound "Find a scene" helper: only builds a link, never fetches. */
export const findSceneUrl = (q: string) => `https://clip.cafe/?q=${encodeURIComponent(q.trim())}`;
