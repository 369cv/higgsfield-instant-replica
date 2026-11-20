import { CHARACTER_PRESETS, presetCut } from './catalog';

/**
 * Wardrobe catalog.
 *
 * - OUTFITS: the looks (shared by every character).
 * - LOOK_RENDERS: per-character renders of each look. Every render of a character must use the
 *   SAME pose, framing and background so looks can be swapped with the wipe effect.
 *   Renders must be background-removed cut-outs on the same 680×1020 canvas as the
 *   characters' signature cut-outs (presetCut), so they line up for the wipe swap.
 *   Put files in /public/influencer/looks/{characterId}/{lookId}.webp and list them here.
 *   Only looks that have a render are shown in the Wardrobe.
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
  /** Vault generation the outfit comes from (Higgsfield job id) — used as the outfit reference. */
  sourceJobId: string;
  /** Outfit description used to render it on a character. */
  description: string;
  pieces: Partial<Record<PieceGroup, Piece[]>>;
}

export const OUTFIT_CATEGORIES = ['All', 'Modest', 'Everyday', 'Formal', 'Party', 'Athletic', 'Street'] as const;
export type OutfitCategory = Exclude<(typeof OUTFIT_CATEGORIES)[number], 'All'>;

/** Outfits taken from Prompt Vault generations (brand names removed). */
export const OUTFITS: Outfit[] = [
  {
    id: 'pinstripe-hijab-blazer',
    name: 'Pinstripe Blazer',
    category: 'Modest',
    sourceJobId: '4caf3803-98f1-44b8-bb9c-b6c271435ce8',
    description:
      'a warm beige matte hijab wrapped around the head and over the shoulder, a structured charcoal grey pinstripe blazer over a sleek black fitted floor-length dress, a structured brown leather crossbody bag and two thin chain necklaces',
    pieces: {
      tops: [{ name: 'Pinstripe blazer', color: 'Charcoal' }],
      full: [{ name: 'Fitted maxi dress', color: 'Black' }],
      acc: [
        { name: 'Matte hijab', color: 'Warm beige' },
        { name: 'Leather crossbody bag', color: 'Brown' },
        { name: 'Chain necklaces', color: 'Gold' },
      ],
    },
  },
  {
    id: 'butterfly-abaya',
    name: 'Butterfly Abaya',
    category: 'Modest',
    sourceJobId: 'e6fab610-ddc4-44be-8801-ba0faf2f9212',
    description: 'a modest hijab and a glossy pale blue abaya with a butterfly brooch pinned at the waist, pointed flats and dark sunglasses',
    pieces: {
      full: [{ name: 'Glossy abaya', color: 'Pale blue' }],
      shoes: [{ name: 'Pointed flats', color: 'Black' }],
      acc: [
        { name: 'Hijab', color: 'Pale blue' },
        { name: 'Butterfly brooch', color: 'Silver' },
        { name: 'Sunglasses', color: 'Black' },
      ],
    },
  },
  {
    id: 'dusty-pink-tunic',
    name: 'Dusty Pink Tunic',
    category: 'Modest',
    sourceJobId: 'f6726025-1d50-485b-a38b-8aae71d294cd',
    description:
      'a loose long-sleeved dusty pink tunic with matching wide-leg pants, white open-toe sandals and a taupe-beige hijab draped around the head and shoulders',
    pieces: {
      tops: [{ name: 'Long-sleeve tunic', color: 'Dusty pink' }],
      bottoms: [{ name: 'Wide-leg pants', color: 'Dusty pink' }],
      shoes: [{ name: 'Open-toe sandals', color: 'White' }],
      acc: [{ name: 'Draped hijab', color: 'Taupe' }],
    },
  },
  {
    id: 'satin-hijab-shirt',
    name: 'Satin & Shirting',
    category: 'Everyday',
    sourceJobId: 'c5d98bcb-58d4-4a2a-87eb-22f88882d459',
    description:
      'a shiny taupe satin hijab, a loose white cotton button-up shirt tucked into wide-leg textured grey trousers, glossy dark brown shoes and a large tan leather folded clutch',
    pieces: {
      tops: [{ name: 'Cotton button-up shirt', color: 'White' }],
      bottoms: [{ name: 'Wide-leg trousers', color: 'Grey' }],
      shoes: [{ name: 'Glossy loafers', color: 'Dark brown' }],
      acc: [
        { name: 'Satin hijab', color: 'Taupe' },
        { name: 'Folded clutch', color: 'Tan' },
      ],
    },
  },
  {
    id: 'denim-hijab-set',
    name: 'Belted Denim Set',
    category: 'Everyday',
    sourceJobId: 'cbc414dc-4388-4c0e-9f04-d6798a73b542',
    description:
      'a taupe-brown hijab, a white shirt with exaggerated collar points, a belted indigo denim set with slightly oversized trousers and a layered jacket, black open-toe heeled sandals and a structured handbag',
    pieces: {
      tops: [
        { name: 'Denim jacket', color: 'Indigo' },
        { name: 'Pointed-collar shirt', color: 'White' },
      ],
      bottoms: [{ name: 'Oversized denim trousers', color: 'Indigo' }],
      shoes: [{ name: 'Heeled sandals', color: 'Black' }],
      acc: [
        { name: 'Hijab', color: 'Taupe brown' },
        { name: 'Structured handbag', color: 'Brown' },
      ],
    },
  },
  {
    id: 'brown-wrap-dress',
    name: 'Brown Wrap Dress',
    category: 'Everyday',
    sourceJobId: '0a35b859-4faf-4f0c-932a-23e294bfe5fa',
    description: 'a long warm brown wrap dress with a self-tie belt, full-length sleeves and subtle pleating at the shoulders, in a flowing textured fabric',
    pieces: { full: [{ name: 'Long wrap dress', color: 'Warm brown' }] },
  },
  {
    id: 'white-ruffle-suit',
    name: 'White Ruffle Suit',
    category: 'Formal',
    sourceJobId: '586ccc69-347d-4c5d-a700-55c581859fbd',
    description:
      'a glossy white monochrome look: a modern headscarf draped over a structured white suit jacket with layered ruffles and an asymmetric front tied with a long sash, and crisp wide-leg tailored trousers',
    pieces: {
      tops: [{ name: 'Ruffled suit jacket', color: 'White' }],
      bottoms: [{ name: 'Wide-leg trousers', color: 'White' }],
      acc: [{ name: 'Headscarf', color: 'White' }],
    },
  },
  {
    id: 'ivory-sculpt-set',
    name: 'Ivory Sculpt Set',
    category: 'Formal',
    sourceJobId: '1dd9239f-18a2-4a8a-8ff9-04f4b8c981a0',
    description:
      'an ultra-modern ivory sculptural set: a pleated textural jacket with an architectural cut-out at the chest, pleated wide-leg pants, a matching bucket hat over a fitted headscarf',
    pieces: {
      tops: [{ name: 'Pleated sculptural jacket', color: 'Ivory' }],
      bottoms: [{ name: 'Pleated wide-leg pants', color: 'Ivory' }],
      acc: [
        { name: 'Bucket hat', color: 'Ivory' },
        { name: 'Fitted headscarf', color: 'Ivory' },
      ],
    },
  },
  {
    id: 'embellished-beige-suit',
    name: 'Embellished Suit',
    category: 'Formal',
    sourceJobId: 'd1ebbf22-13c9-4ba5-8f25-892d5060aad2',
    description:
      'a luxe pale beige suit: a tailored longline blazer with metallic floral embellishments on the shoulders and sleeves, slim trousers with feathered trim at the ankles, metallic heeled ankle boots and lightly tinted oversized sunglasses',
    pieces: {
      tops: [{ name: 'Embellished longline blazer', color: 'Pale beige' }],
      bottoms: [{ name: 'Feather-trim trousers', color: 'Pale beige' }],
      shoes: [{ name: 'Heeled ankle boots', color: 'Metallic' }],
      acc: [{ name: 'Oversized sunglasses', color: 'Tinted' }],
    },
  },
  {
    id: 'canary-ruffle-maxi',
    name: 'Canary Ruffle Maxi',
    category: 'Party',
    sourceJobId: 'd6887a12-9cde-4892-9620-1baf4696aaf1',
    description:
      'a bold canary yellow long-sleeved flowing maxi dress with dramatic ruffles at the hem and sleeves, a metallic gold medallion belt, a beige hijab, gold hoop earrings and a brown woven shoulder bag',
    pieces: {
      full: [{ name: 'Ruffled maxi dress', color: 'Canary yellow' }],
      acc: [
        { name: 'Medallion belt', color: 'Gold' },
        { name: 'Hijab', color: 'Beige' },
        { name: 'Woven shoulder bag', color: 'Brown' },
      ],
    },
  },
  {
    id: 'copper-gown',
    name: 'Copper Gown',
    category: 'Party',
    sourceJobId: '577a0adc-1813-4725-a054-950bd5b38089',
    description:
      'a glossy copper-brown floor-length gown with a structured bodice, fitted sleeves and an asymmetric draped collar flowing into a full skirt, a matching matte copper hijab and a small crescent silver bag',
    pieces: {
      full: [{ name: 'Floor-length gown', color: 'Copper' }],
      acc: [
        { name: 'Matte hijab', color: 'Copper' },
        { name: 'Crescent bag', color: 'Silver' },
      ],
    },
  },
  {
    id: 'pink-feather-halter',
    name: 'Pink Feather Halter',
    category: 'Party',
    sourceJobId: '9271be3f-9133-4616-80ad-78f86ba445f9',
    description:
      'a pastel pink halter dress with a feathery textured skirt, rhinestone open-toe heeled sandals, a small clutch and circular statement earrings',
    pieces: {
      full: [{ name: 'Feather halter dress', color: 'Pastel pink' }],
      shoes: [{ name: 'Rhinestone sandals', color: 'Silver' }],
      acc: [
        { name: 'Small clutch', color: 'Silver' },
        { name: 'Statement earrings', color: 'Gold' },
      ],
    },
  },
  {
    id: 'hot-pink-athletic',
    name: 'Hot Pink Set',
    category: 'Athletic',
    sourceJobId: 'dfb63d8a-6f13-45b1-a582-dd4e1be30105',
    description: 'a hot pink two-piece athletic set in glossy seamless stretch fabric: a halter crop top and high-waist fitted shorts, white trainers',
    pieces: {
      tops: [{ name: 'Halter crop top', color: 'Hot pink' }],
      bottoms: [{ name: 'High-waist shorts', color: 'Hot pink' }],
      shoes: [{ name: 'Trainers', color: 'White' }],
    },
  },
  {
    id: 'black-leather-street',
    name: 'All-Black Leather',
    category: 'Street',
    sourceJobId: 'e2885134-b63b-47bf-9a40-cfa5efa9c82a',
    description:
      'all black: a fitted rib-knit jumpsuit, a glossy cropped faux-leather jacket with dropped shoulders and over-the-knee slouchy black leather boots',
    pieces: {
      tops: [{ name: 'Cropped faux-leather jacket', color: 'Black' }],
      full: [{ name: 'Rib-knit jumpsuit', color: 'Black' }],
      shoes: [{ name: 'Over-the-knee boots', color: 'Black' }],
    },
  },
];

/** characterId -> lookId -> render URL. Add entries as renders are produced. */
export const LOOK_RENDERS: Record<string, Record<string, string>> = {};

export const BASE_LOOK = 'base';

export function lookImage(characterId: string, lookId: string): string {
  return LOOK_RENDERS[characterId]?.[lookId] || presetCut(characterId);
}

/** Outfits that have a render for this character (the only ones the Wardrobe shows). */
export function availableOutfits(characterId: string): Outfit[] {
  const r = LOOK_RENDERS[characterId] || {};
  return OUTFITS.filter((o) => !!r[o.id]);
}

/** Room behind the stage. */
export const STAGE_BACKGROUND = '/influencer/wardrobe/loft.webp';

export const characterName = (id: string) => CHARACTER_PRESETS.find((c) => c.id === id)?.name || id;

export function outfitPieceList(o: Outfit): string {
  return PIECE_GROUPS.flatMap((g) => (o.pieces[g.id] || []).map((p) => `${p.color.toLowerCase()} ${p.name.toLowerCase()}`)).join(', ');
}

/** Prompt to render this look on this character with identical pose/framing (for Higgsfield Soul). */
export function renderPrompt(characterId: string, o: Outfit): string {
  const name = characterName(characterId);
  return [
    `Image 1 is ${name}'s character sheet; image 2 shows an outfit. Dress ${name} in exactly the outfit from image 2: ${o.description}.`,
    `Keep ${name}'s exact face, skin tone, hair, body shape and height from image 1.`,
    'Full-body, front-facing studio photo: standing straight, facing camera, arms relaxed at the sides, feet together, centered, head-to-toe in frame with a small margin above the head.',
    'Same pose, scale and camera height as the character sheet. Plain seamless light grey background, soft even daylight, photorealistic fabric and skin detail. No logos or text.',
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
