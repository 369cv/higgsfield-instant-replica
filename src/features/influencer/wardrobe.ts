import { CHARACTER_PRESETS, presetBody } from './catalog';

/**
 * Wardrobe catalog.
 *
 * - OUTFITS: the looks (shared by every character).
 * - LOOK_RENDERS: per-character renders of each look. Every render of a character must use the
 *   SAME pose, framing and background so looks can be swapped with the wipe effect.
 *   Put files in /public/influencer/looks/{characterId}/{lookId}.webp and list them here.
 *   Until a render exists, the character's base image is shown with "Render pending".
 */

export type PieceGroup = 'tops' | 'bottoms' | 'full' | 'shoes' | 'acc';

export const PIECE_GROUPS: { id: PieceGroup; label: string }[] = [
  { id: 'tops', label: 'Tops' },
  { id: 'bottoms', label: 'Bottoms' },
  { id: 'full', label: 'Full body' },
  { id: 'shoes', label: 'Shoes' },
  { id: 'acc', label: 'Accessories' },
];

export interface Piece {
  name: string;
  color: string;
}

export interface Outfit {
  id: string;
  name: string;
  category: OutfitCategory;
  pieces: Partial<Record<PieceGroup, Piece[]>>;
}

export const OUTFIT_CATEGORIES = ['All', 'Everyday', 'Athletic', 'Formal', 'Party', 'Modest', 'Street', 'Resort'] as const;
export type OutfitCategory = Exclude<(typeof OUTFIT_CATEGORIES)[number], 'All'>;

export const OUTFITS: Outfit[] = [
  {
    id: 'linen-weekend',
    name: 'Linen Weekend',
    category: 'Everyday',
    pieces: {
      tops: [{ name: 'Oversized linen shirt', color: 'Ivory' }],
      bottoms: [{ name: 'Wide linen trousers', color: 'Sand' }],
      shoes: [{ name: 'Leather slides', color: 'Tan' }],
      acc: [{ name: 'Gold hoops', color: '18k' }],
    },
  },
  {
    id: 'denim-day',
    name: 'Denim Day',
    category: 'Everyday',
    pieces: {
      tops: [{ name: 'Ribbed knit top', color: 'Black' }],
      bottoms: [{ name: 'Straight-leg jeans', color: 'Mid wash' }],
      shoes: [{ name: 'Leather sneakers', color: 'White' }],
      acc: [{ name: 'Shoulder bag', color: 'Black' }],
    },
  },
  {
    id: 'studio-set',
    name: 'Studio Set',
    category: 'Athletic',
    pieces: {
      tops: [
        { name: 'Zip track jacket', color: 'Sage' },
        { name: 'Sports top', color: 'Sage' },
      ],
      bottoms: [{ name: 'Flared leggings', color: 'Sage' }],
      shoes: [{ name: 'Trainers', color: 'White' }],
    },
  },
  {
    id: 'ivory-suit',
    name: 'Ivory Suit',
    category: 'Formal',
    pieces: {
      tops: [
        { name: 'Tailored blazer', color: 'Ivory' },
        { name: 'Silk camisole', color: 'Ivory' },
      ],
      bottoms: [{ name: 'Wide suit trousers', color: 'Ivory' }],
      shoes: [{ name: 'Pointed heels', color: 'Nude' }],
    },
  },
  {
    id: 'satin-evening',
    name: 'Satin Evening',
    category: 'Party',
    pieces: {
      full: [{ name: 'Satin slip dress', color: 'Champagne' }],
      shoes: [{ name: 'Strappy heels', color: 'Gold' }],
      acc: [{ name: 'Drop earrings', color: 'Gold' }],
    },
  },
  {
    id: 'silk-abaya',
    name: 'Silk Abaya',
    category: 'Modest',
    pieces: {
      full: [{ name: 'Silk abaya', color: 'Black' }],
      shoes: [{ name: 'Block heels', color: 'Black' }],
      acc: [
        { name: 'Satin headscarf', color: 'Sand' },
        { name: 'Gold cuff', color: '18k' },
      ],
    },
  },
  {
    id: 'leather-street',
    name: 'Leather Street',
    category: 'Street',
    pieces: {
      tops: [
        { name: 'Leather jacket', color: 'Black' },
        { name: 'Crop tee', color: 'White' },
      ],
      bottoms: [{ name: 'Cargo pants', color: 'Khaki' }],
      shoes: [{ name: 'Platform sneakers', color: 'Black' }],
    },
  },
  {
    id: 'resort-kaftan',
    name: 'Resort Kaftan',
    category: 'Resort',
    pieces: {
      full: [{ name: 'Embroidered kaftan', color: 'White' }],
      shoes: [{ name: 'Flat sandals', color: 'Gold' }],
      acc: [{ name: 'Straw tote', color: 'Natural' }],
    },
  },
];

/** characterId -> lookId -> render URL. Add entries as renders are produced. */
export const LOOK_RENDERS: Record<string, Record<string, string>> = {};

export const BASE_LOOK = 'base';

export function lookImage(characterId: string, lookId: string): { src: string; rendered: boolean } {
  const r = LOOK_RENDERS[characterId]?.[lookId];
  return r ? { src: r, rendered: true } : { src: presetBody(characterId), rendered: lookId === BASE_LOOK };
}

export const characterName = (id: string) => CHARACTER_PRESETS.find((c) => c.id === id)?.name || id;

export function outfitPieceList(o: Outfit): string {
  return PIECE_GROUPS.flatMap((g) => (o.pieces[g.id] || []).map((p) => `${p.color.toLowerCase()} ${p.name.toLowerCase()}`)).join(', ');
}

/** Prompt to render this look on this character with identical pose/framing (for Higgsfield Soul). */
export function renderPrompt(characterId: string, o: Outfit): string {
  const name = characterName(characterId);
  return [
    `Full-body, front-facing studio photo of ${name}; use the attached ${name} character sheet as the exact face, hair and body identity.`,
    `Wearing: ${outfitPieceList(o)}.`,
    'Pose: standing straight, facing camera, arms relaxed at the sides, feet together, centered, head-to-toe in frame with a small margin above the head.',
    'Keep the exact same pose, scale, camera height and framing for every look of this character.',
    'Plain seamless light grey background, soft even daylight, photorealistic fabric and skin detail, vertical 2:3.',
  ].join(' ');
}

/* ---------- Stage filters ---------- */

export const STAGE_FILTERS = [
  { id: 'daylight', name: 'Daylight', filter: 'none', tint: 'transparent' },
  { id: 'soft-film', name: 'Soft Film', filter: 'contrast(.92) saturate(.85) brightness(1.06)', tint: 'linear-gradient(180deg, rgba(255,226,214,.35), rgba(180,200,220,.35))' },
  { id: 'cool-studio', name: 'Cool Studio', filter: 'saturate(.9) brightness(1.06) contrast(1.04)', tint: 'linear-gradient(180deg, rgba(150,190,255,.45), rgba(200,220,255,.25))' },
  { id: 'golden-hour', name: 'Golden Hour', filter: 'saturate(1.1) brightness(1.02)', tint: 'linear-gradient(180deg, rgba(255,180,90,.5), rgba(255,140,80,.35))' },
  { id: 'mono', name: 'Mono', filter: 'grayscale(1) contrast(1.12) brightness(1.03)', tint: 'transparent' },
] as const;
export type StageFilterId = (typeof STAGE_FILTERS)[number]['id'];

export type Framing = 'full' | 'mid' | 'portrait';
export const FRAMINGS: { id: Framing; label: string }[] = [
  { id: 'full', label: 'Full' },
  { id: 'mid', label: 'Mid' },
  { id: 'portrait', label: 'Portrait' },
];
