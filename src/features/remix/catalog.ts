/** Video Remix Studio — static knowledge: modes, models, qualities, categories, edit tools, cost. */

export type RemixMode = 'transfer' | 'swap';
export const MODES: { id: RemixMode; label: string; hint: string }[] = [
  { id: 'transfer', label: 'Motion transfer', hint: 'Same moves, new performer' },
  { id: 'swap', label: 'Objects swap', hint: 'Replace people, products or clothes' },
];

export interface RemixModel {
  id: string;
  name: string;
  tagline: string;
  provider: 'Studio' | 'Partner';
  tier: 'standard' | 'lite';
  badges: string[];
  /** credits per output second at 720p */
  rate: number;
}

export const REMIX_MODELS: RemixModel[] = [
  { id: 'remix-pro', name: 'Remix Pro', tagline: 'Full-body motion, identity lock', provider: 'Studio', tier: 'standard', badges: ['1080p', '4–30s'], rate: 10 },
  { id: 'remix-lite', name: 'Remix Lite', tagline: 'Faster drafts, lower cost', provider: 'Studio', tier: 'lite', badges: ['720p', '4–30s'], rate: 4 },
  { id: 'kinetic-2', name: 'Kinetic 2', tagline: 'Dance & sports specialist', provider: 'Partner', tier: 'standard', badges: ['1080p', '4–15s'], rate: 12 },
  { id: 'swapper', name: 'Swapper', tagline: 'Object & wardrobe replacement', provider: 'Partner', tier: 'standard', badges: ['1080p', '4–20s'], rate: 9 },
];

export const QUALITIES = ['480p', '720p', '1080p'] as const;
export type Quality = (typeof QUALITIES)[number];
const Q_MULT: Record<Quality, number> = { '480p': 0.6, '720p': 1, '1080p': 1.7 };

/** POST /estimate equivalent: duration × quality × model tier (+ small per-reference fee). */
export function estimateCredits(p: { model: string; quality: Quality; seconds: number; refs: number; styled: boolean }) {
  const m = REMIX_MODELS.find((x) => x.id === p.model) || REMIX_MODELS[0];
  const base = m.rate * Math.max(4, p.seconds) * Q_MULT[p.quality];
  return Math.round((base + p.refs * 4 + (p.styled ? 20 : 0)) / 5) * 5;
}

export const CATEGORIES = ['All', 'Lifestyle', 'Fun', 'Pets', 'Music videos', 'With friends', 'Sports'] as const;
export type Category = (typeof CATEGORIES)[number];

/** Render looks ("take the look, not the subject"). Own names. */
export const RENDER_STYLES: { id: string; name: string }[] = [
  { id: 'none', name: 'No style' },
  { id: 'cel', name: 'Cel shade' },
  { id: 'yarn', name: 'Knit world' },
  { id: 'toy', name: 'Vinyl toy' },
  { id: 'felt', name: 'Felt stop-motion' },
  { id: 'painterly', name: 'Oil painterly' },
  { id: 'lowpoly', name: 'Low-poly' },
  { id: 'anime', name: 'Anime CG' },
  { id: 'clay', name: 'Clay' },
  { id: 'paper', name: 'Paper cut' },
  { id: 'watercolor', name: 'Watercolor' },
  { id: 'comic', name: 'Comic ink' },
  { id: 'pixel', name: '16-bit' },
  { id: 'noir', name: 'Noir' },
  { id: 'chrome', name: 'Liquid chrome' },
  { id: 'vapor', name: 'Vapor dusk' },
];

export type EditToolId = 'edit' | 'extend' | 'reframe' | 'upscale' | 'bg' | 'hdr' | 'fps' | 'depth';
export const EDIT_TOOLS: { id: EditToolId; name: string; desc: string; isNew?: boolean }[] = [
  { id: 'edit', name: 'Edit Video', desc: 'Targeted changes by prompt or by drawing' },
  { id: 'extend', name: 'Extend Video', desc: 'Generate a continuation' },
  { id: 'reframe', name: 'Reframe', desc: 'Resize and reposition for any format' },
  { id: 'upscale', name: 'Upscale', desc: 'Increase resolution' },
  { id: 'bg', name: 'Remove Background', desc: 'Cut out the subject', isNew: true },
  { id: 'hdr', name: 'SDR to HDR', desc: 'Convert footage to HDR', isNew: true },
  { id: 'fps', name: 'FPS Boost', desc: 'Raise frame rate', isNew: true },
  { id: 'depth', name: 'Depth Map', desc: 'Depth maps from media', isNew: true },
];

export const BITRATES = ['Standard', 'High'] as const;
export const ASPECTS = ['9:16', '1:1', '16:9', '4:5'] as const;

/** Limits from the spec. */
export const LIMITS = { videoMin: 4, videoMax: 30, refsMax: 30, editRefsMax: 50 };

/** Deterministic pseudo-stats so the library feels alive without a backend. */
export function seededStats(id: string) {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) | 0;
  const a = Math.abs(h);
  return { remixes: 200 + (a % 9800), likes: 40 + ((a >> 5) % 2400), category: CATEGORIES[1 + (a % (CATEGORIES.length - 1))] };
}

export const fmtCount = (n: number) => (n >= 1000 ? `${(n / 1000).toFixed(n >= 10000 ? 0 : 1)}K` : String(n));

/** Guided swap-prompt builder: one sentence per swap + constraints. */
export function buildSwapPrompt(rows: { subject: string; ref: number }[], constraints: string) {
  const s = rows
    .filter((r) => r.subject.trim())
    .map((r) => `Replace ${r.subject.trim()} with the person in @image${r.ref}.`)
    .join(' ');
  return [s, constraints.trim()].filter(Boolean).join(' ');
}
