/**
 * AI Influencer trait taxonomy + prompt compiler.
 *
 * Realistic, model-grade characters only (matches the 40 preset sheets and the Prompt Vault).
 * The compiled prompt follows the Prompt Vault order:
 *   heritage + age → face → hair / hijab → makeup → build → outfit → accessories → brand profile.
 *
 * To add artwork to a tile, set `image` on an option (e.g. '/influencer/traits/build-slim.webp').
 */

export type TraitControl = 'tiles' | 'swatches' | 'chips';
export type TraitSection = 'identity' | 'look' | 'brand';

export const TRAIT_SECTIONS: { id: TraitSection; label: string; hint: string }[] = [
  { id: 'identity', label: 'Identity', hint: 'Who she is' },
  { id: 'look', label: 'Look', hint: 'Face, hair and body' },
  { id: 'brand', label: 'Brand', hint: 'Style and world' },
];

export interface TraitOption {
  value: string;
  image?: string;
  hex?: string;
  /** Prompt wording when it differs from the label. */
  prompt?: string;
}

export interface TraitDef {
  id: string;
  label: string;
  section: TraitSection;
  control: TraitControl;
  multi?: boolean;
  /** Max picks for multi-select traits. */
  max?: number;
  /** Phrase used when compiling the prompt; `{v}` is replaced by the value(s). */
  phrase: string;
  options: TraitOption[];
  /** Only shown (and compiled) when this returns true. */
  showIf?: (sel: TraitSelection) => boolean;
}

/** Selected values per trait id. Single-select traits hold one value, multi-select hold several. */
export type TraitSelection = Record<string, string[]>;

const opts = (...values: string[]): TraitOption[] => values.map((value) => ({ value }));
const isMale = (s: TraitSelection) => s.gender?.[0] === 'Male';
const hairVisible = (s: TraitSelection) => !COVERED.has(s.coverage?.[0] || 'None');
const COVERED = new Set(['Wrapped hijab', 'Turban style', 'Sporty hijab', 'Hijab + abaya']);

export const TRAITS: TraitDef[] = [
  /* ---------- Identity ---------- */
  {
    id: 'niche',
    label: 'Niche',
    section: 'identity',
    control: 'tiles',
    phrase: '{v}',
    options: opts(
      'Modest fashion', 'Luxury lifestyle', 'Beauty & skincare', 'Fitness', 'Streetwear', 'Business & finance', 'Travel',
      'Bridal & events'
    ),
  },
  {
    id: 'gender',
    label: 'Gender',
    section: 'identity',
    control: 'chips',
    phrase: '{v}',
    options: opts('Female', 'Male'),
  },
  {
    id: 'age',
    label: 'Age',
    section: 'identity',
    control: 'chips',
    phrase: '{v}',
    options: [
      { value: 'Early 20s', prompt: 'in her early 20s' },
      { value: 'Mid 20s', prompt: 'in her mid 20s' },
      { value: 'Late 20s', prompt: 'in her late 20s' },
      { value: '30s', prompt: 'in her 30s' },
      { value: '40s+', prompt: 'in her 40s' },
    ],
  },
  {
    id: 'heritage',
    label: 'Heritage',
    section: 'identity',
    control: 'tiles',
    phrase: '{v}',
    options: opts(
      'Gulf Arab', 'Levantine', 'North African', 'Persian', 'South Asian', 'Central Asian', 'East Asian', 'Southeast Asian',
      'Latina', 'European', 'Eastern European', 'African', 'Mixed'
    ),
  },

  /* ---------- Look ---------- */
  {
    id: 'faceShape',
    label: 'Face shape',
    section: 'look',
    control: 'chips',
    phrase: '{v} face',
    options: opts('Oval', 'Heart', 'Round', 'Square', 'Diamond'),
  },
  {
    id: 'skinColor',
    label: 'Skin tone',
    section: 'look',
    control: 'swatches',
    phrase: '{v} skin',
    options: [
      { value: 'Porcelain', hex: '#f3dccb' },
      { value: 'Fair', hex: '#ecc8ad' },
      { value: 'Light', hex: '#dcae8a' },
      { value: 'Olive', hex: '#c09466', prompt: 'medium-olive' },
      { value: 'Tan', hex: '#a8774c', prompt: 'warm tan' },
      { value: 'Brown', hex: '#7e5232', prompt: 'rich brown' },
      { value: 'Deep brown', hex: '#5a3822' },
      { value: 'Ebony', hex: '#3a2416', prompt: 'deep ebony' },
    ],
  },
  {
    id: 'skinFinish',
    label: 'Skin finish',
    section: 'look',
    control: 'chips',
    phrase: 'with a {v} finish',
    options: [
      { value: 'Glowy', prompt: 'luminous, dewy' },
      { value: 'Natural', prompt: 'natural, lightly textured' },
      { value: 'Matte', prompt: 'smooth matte' },
    ],
  },
  {
    id: 'eyeShape',
    label: 'Eye shape',
    section: 'look',
    control: 'chips',
    phrase: '{v}',
    options: opts('Almond', 'Round', 'Hooded', 'Upturned', 'Monolid', 'Deep-set'),
  },
  {
    id: 'eyeColor',
    label: 'Eye colour',
    section: 'look',
    control: 'swatches',
    phrase: '{v} eyes',
    options: [
      { value: 'Dark brown', hex: '#2a1a10' },
      { value: 'Brown', hex: '#5b3a1f' },
      { value: 'Hazel', hex: '#8a6a32' },
      { value: 'Amber', hex: '#c68a2a' },
      { value: 'Green', hex: '#4c7a3a' },
      { value: 'Grey', hex: '#8d9399' },
      { value: 'Blue', hex: '#3d6fb6' },
    ],
  },
  {
    id: 'features',
    label: 'Features',
    section: 'look',
    control: 'chips',
    multi: true,
    max: 3,
    phrase: '{v}',
    options: opts(
      'High cheekbones', 'Full lips', 'Defined jawline', 'Long lashes', 'Thick brows', 'Dimples', 'Freckles', 'Beauty mark'
    ),
  },
  {
    id: 'coverage',
    label: 'Hijab & coverage',
    section: 'look',
    control: 'tiles',
    phrase: '{v}',
    showIf: (s) => !isMale(s),
    options: [
      { value: 'None' },
      { value: 'Loose shayla', prompt: 'a loosely draped matte shayla over the head, framing the face, a little hair visible at the front' },
      { value: 'Wrapped hijab', prompt: 'a neatly wrapped matte hijab covering the hair, falling over the shoulder' },
      { value: 'Turban style', prompt: 'a sculpted turban-style head wrap covering the hair' },
      { value: 'Sporty hijab', prompt: 'a fitted sporty hijab covering the hair and neck' },
      { value: 'Hijab + abaya', prompt: 'a wrapped hijab with a flowing open abaya' },
    ],
  },
  {
    id: 'hairstyle',
    label: 'Hairstyle',
    section: 'look',
    control: 'tiles',
    phrase: '{v}',
    showIf: hairVisible,
    options: [
      { value: 'Long straight', prompt: 'long, glossy straight hair' },
      { value: 'Sleek middle part', prompt: 'sleek straight hair parted in the middle' },
      { value: 'Long waves', prompt: 'long, soft voluminous waves' },
      { value: 'Voluminous curls', prompt: 'voluminous defined curls' },
      { value: 'Hollywood waves', prompt: 'polished old-Hollywood waves' },
      { value: 'Shoulder-length layers', prompt: 'shoulder-length layered hair' },
      { value: 'Bob', prompt: 'a sleek chin-length bob' },
      { value: 'Sleek bun', prompt: 'hair pulled back into a sleek bun' },
      { value: 'Slicked-back', prompt: 'wet-look slicked-back hair' },
      { value: 'High ponytail', prompt: 'a sleek high ponytail' },
      { value: 'Box braids', prompt: 'long box braids' },
      { value: 'Afro', prompt: 'a full natural afro' },
      { value: 'Pixie', prompt: 'a cropped pixie cut' },
      { value: 'Short crop', prompt: 'a short textured crop' },
      { value: 'Fade', prompt: 'a clean skin fade' },
    ],
  },
  {
    id: 'hairColor',
    label: 'Hair colour',
    section: 'look',
    control: 'swatches',
    phrase: '{v}',
    showIf: hairVisible,
    options: [
      { value: 'Jet black', hex: '#0b0b0d' },
      { value: 'Dark brown', hex: '#3b2414' },
      { value: 'Chestnut', hex: '#6b3a1e' },
      { value: 'Caramel balayage', hex: '#a8713c' },
      { value: 'Honey blonde', hex: '#c9a061' },
      { value: 'Blonde', hex: '#e2c27a' },
      { value: 'Platinum', hex: '#ece6d6' },
      { value: 'Copper red', hex: '#b5542a' },
      { value: 'Auburn', hex: '#7e2e1c' },
    ],
  },
  {
    id: 'makeup',
    label: 'Signature makeup',
    section: 'look',
    control: 'chips',
    phrase: '{v}',
    options: [
      { value: 'Clean girl', prompt: 'fresh "clean girl" makeup: groomed brows, dewy skin, glossy nude lip' },
      { value: 'Soft glam', prompt: 'soft glam makeup: groomed brows, long lashes, soft contour, glossy rose-nude lip' },
      { value: 'Full glam', prompt: 'full glam makeup: sculpted contour, winged liner, dramatic lashes, lined matte lip' },
      { value: 'Bold red lip', prompt: 'polished makeup with a bold matte red lip' },
      { value: 'Bronzed', prompt: 'bronzed, sun-kissed makeup with warm highlighter' },
      { value: 'Editorial', prompt: 'minimal editorial makeup with a graphic, high-fashion edge' },
    ],
  },
  {
    id: 'facialHair',
    label: 'Facial hair',
    section: 'look',
    control: 'chips',
    phrase: '{v}',
    showIf: isMale,
    options: [
      { value: 'Clean-shaven' },
      { value: 'Stubble', prompt: 'light designer stubble' },
      { value: 'Short beard', prompt: 'a short, neatly groomed beard' },
      { value: 'Full beard', prompt: 'a full, sculpted beard' },
    ],
  },
  {
    id: 'build',
    label: 'Build',
    section: 'look',
    control: 'chips',
    phrase: '{v} build',
    options: opts('Petite', 'Slim', 'Athletic', 'Curvy', 'Hourglass'),
  },
  {
    id: 'height',
    label: 'Height',
    section: 'look',
    control: 'chips',
    phrase: '{v}',
    options: [
      { value: 'Average', prompt: 'average height' },
      { value: 'Tall', prompt: 'tall' },
      { value: 'Very tall', prompt: 'very tall, runway-model height' },
    ],
  },

  /* ---------- Brand ---------- */
  {
    id: 'style',
    label: 'Signature style',
    section: 'brand',
    control: 'tiles',
    phrase: '{v}',
    // Same categories as the Wardrobe, so the first outfits match her style.
    options: [
      { value: 'Modest', prompt: 'a modest, elegant long-sleeved ivory outfit' },
      { value: 'Everyday', prompt: 'a chic everyday ivory outfit' },
      { value: 'Formal', prompt: 'a sharply tailored ivory suit' },
      { value: 'Party', prompt: 'a sleek ivory evening dress' },
      { value: 'Athletic', prompt: 'a matching ivory athleisure set' },
      { value: 'Street', prompt: 'an oversized ivory streetwear look' },
    ],
  },
  {
    id: 'accessories',
    label: 'Accessories',
    section: 'brand',
    control: 'chips',
    multi: true,
    max: 3,
    phrase: '{v}',
    options: [
      { value: 'Gold jewellery', prompt: 'fine gold jewellery' },
      { value: 'Pearls', prompt: 'pearl earrings' },
      { value: 'Diamonds', prompt: 'diamond studs' },
      { value: 'Designer bag', prompt: 'a structured leather handbag' },
      { value: 'Sunglasses', prompt: 'sculptural sunglasses' },
      { value: 'Watch', prompt: 'a gold wristwatch' },
      { value: 'Glasses', prompt: 'black rectangular glasses' },
    ],
  },
  {
    id: 'homeBase',
    label: 'Home base',
    section: 'brand',
    control: 'chips',
    phrase: '{v}',
    options: opts('Downtown Dubai', 'Dubai Marina', 'Desert', 'Paris', 'London', 'Studio'),
  },
  {
    id: 'photoStyle',
    label: 'Photo style',
    section: 'brand',
    control: 'chips',
    phrase: '{v}',
    options: [
      { value: 'Editorial flash', prompt: 'hard frontal flash, crisp editorial' },
      { value: 'Soft daylight', prompt: 'soft natural daylight' },
      { value: 'Golden hour', prompt: 'warm golden-hour light' },
      { value: 'Mirror selfie', prompt: 'casual mirror selfie' },
      { value: 'Film', prompt: 'grainy 35mm film look' },
    ],
  },
  {
    id: 'palette',
    label: 'Brand palette',
    section: 'brand',
    control: 'swatches',
    multi: true,
    max: 5,
    phrase: '{v}',
    options: [
      { value: 'Ivory', hex: '#f3eee4' },
      { value: 'Sand', hex: '#d8c3a5' },
      { value: 'Champagne', hex: '#e8d5b0' },
      { value: 'Blush', hex: '#f1c6c9' },
      { value: 'Dusty rose', hex: '#c98c93' },
      { value: 'Hot pink', hex: '#e52f80' },
      { value: 'Gold', hex: '#c9a24a' },
      { value: 'Emerald', hex: '#1f6b4f' },
      { value: 'Sage', hex: '#a7b59a' },
      { value: 'Cobalt', hex: '#2f56c9' },
      { value: 'Chocolate', hex: '#4a2c21' },
      { value: 'Black', hex: '#111111' },
    ],
  },
];

const TRAIT_BY_ID = Object.fromEntries(TRAITS.map((t) => [t.id, t]));

export const isTraitVisible = (t: TraitDef, sel: TraitSelection) => !t.showIf || t.showIf(sel);

/** Drop unknown traits/values (e.g. selections saved by an older version of the builder). */
export function sanitizeSelection(sel: unknown): TraitSelection {
  const out: TraitSelection = {};
  if (!sel || typeof sel !== 'object') return out;
  for (const [id, vals] of Object.entries(sel as Record<string, unknown>)) {
    const t = TRAIT_BY_ID[id];
    if (!t || !Array.isArray(vals)) continue;
    const ok = vals.filter((v): v is string => typeof v === 'string' && t.options.some((o) => o.value === v));
    if (ok.length) out[id] = t.multi ? ok.slice(0, t.max || ok.length) : ok.slice(0, 1);
  }
  return out;
}

export function randomSelection(): TraitSelection {
  const pick = <T,>(a: T[]) => a[Math.floor(Math.random() * a.length)];
  const some = (t: TraitDef, lo: number, hi: number) =>
    [...t.options].sort(() => Math.random() - 0.5).slice(0, lo + Math.floor(Math.random() * (hi - lo + 1))).map((o) => o.value);
  const sel: TraitSelection = { gender: ['Female'] };
  for (const t of TRAITS) {
    if (t.id === 'gender') continue;
    if (t.id === 'coverage') sel.coverage = [Math.random() < 0.7 ? 'None' : pick(t.options.slice(1)).value];
    else if (t.id === 'palette') sel.palette = some(t, 3, 4);
    else if (t.multi) sel[t.id] = some(t, 1, 2);
    else sel[t.id] = [pick(t.options).value];
  }
  // Keep the random result consistent with the rules.
  if (!hairVisible(sel)) {
    delete sel.hairstyle;
    delete sel.hairColor;
  }
  delete sel.facialHair;
  if (['Short crop', 'Fade'].includes(sel.hairstyle?.[0] || '')) sel.hairstyle = ['Long waves'];
  return sel;
}

/** Ordered list of chosen values, used for parameter chips. */
export function selectionChips(sel: TraitSelection): string[] {
  return TRAITS.filter((t) => isTraitVisible(t, sel)).flatMap((t) => (sel[t.id] || []).filter((v) => v !== 'None'));
}

export function selectionCount(sel: TraitSelection): number {
  return TRAITS.reduce((n, t) => n + (isTraitVisible(t, sel) && (sel[t.id] || []).length > 0 ? 1 : 0), 0);
}

const words = (id: string, sel: TraitSelection): string[] => {
  const t = TRAIT_BY_ID[id];
  if (!t || !isTraitVisible(t, sel)) return [];
  return (sel[id] || []).map((v) => {
    const o = t.options.find((x) => x.value === v);
    return o?.prompt || v.toLowerCase();
  });
};

function phrase(id: string, sel: TraitSelection): string | null {
  const v = words(id, sel);
  if (!v.length) return null;
  const list = v.length > 1 ? `${v.slice(0, -1).join(', ')} and ${v[v.length - 1]}` : v[0];
  return TRAIT_BY_ID[id].phrase.replace('{v}', list);
}

/**
 * Compile a character-sheet prompt in the Prompt Vault style. Output is always the same
 * two-panel sheet as the presets (face close-up + full body, white background), so a new
 * influencer drops straight into the Wardrobe.
 */
export function compileCharacterPrompt(sel: TraitSelection, hasPhoto: boolean, presetName?: string): string {
  const p = (id: string) => phrase(id, sel);
  const male = isMale(sel);
  const her = male ? 'his' : 'her';
  const parts: string[] = [];

  parts.push(
    'Character sheet with two panels side by side on a seamless pure white background: ' +
      'left panel a tight face close-up portrait, right panel a full-body standing pose facing the camera, head to toe.'
  );

  const heritage = words('heritage', sel)[0];
  const age = (words('age', sel)[0] || '').replace('her', her);
  const person = male ? 'man' : 'woman';
  parts.push(
    `Subject: a ${['young', heritage && sel.heritage?.[0]].filter(Boolean).join(' ')} ${person}${age ? ` ${age}` : ''} with striking, model-like features.`
      .replace('young Mixed', 'young mixed-heritage')
      .replace(/\s+/g, ' ')
  );

  const eyeShape = words('eyeShape', sel)[0];
  const eyeColor = words('eyeColor', sel)[0];
  const eyes = eyeShape || eyeColor ? [eyeShape, eyeColor, 'eyes'].filter(Boolean).join(' ') : null;
  const skin = [p('skinColor'), p('skinFinish')].filter(Boolean).join(' ');
  const face = [p('faceShape'), skin || null, eyes, p('features')].filter(Boolean);
  if (face.length) parts.push(`Face: ${face.join('; ')}.`);

  const coverage = sel.coverage?.[0];
  if (coverage && coverage !== 'None' && !male) parts.push(`Wearing ${p('coverage')}.`);
  const hair = [p('hairColor'), p('hairstyle')].filter(Boolean);
  if (hair.length) parts.push(`Hair: ${hair.join(', ')}.`);
  if (p('facialHair')) parts.push(`Facial hair: ${p('facialHair')}.`);
  if (p('makeup')) parts.push(`Makeup: ${p('makeup')}.`);

  const body = [p('build'), p('height')].filter(Boolean);
  if (body.length) parts.push(`Body: ${body.join(', ')}.`);

  const outfit = [p('style') || 'a simple, elegant ivory outfit', p('accessories')].filter(Boolean);
  parts.push(`Outfit: ${outfit.join(', with ')}; identical in both panels.`);

  if (presetName)
    parts.push(
      `Base character: ${presetName}. Use the attached ${presetName} character sheet as the exact face and body identity; apply the traits above only where they differ.`
    );
  if (hasPhoto) parts.push('Use the uploaded reference photo as the exact face identity.');

  parts.push(
    'Soft even studio lighting, sharp focus, photorealistic skin and fabric texture, natural proportions, identical identity, hair and outfit in both panels. No text, logos or watermark.'
  );

  // Brand profile: carried with the character for later scenes; not drawn on the sheet.
  const palette = (sel.palette || [])
    .map((v) => TRAIT_BY_ID.palette.options.find((o) => o.value === v)?.hex)
    .filter(Boolean);
  const brand = [
    sel.niche?.[0] && `niche: ${sel.niche[0].toLowerCase()}`,
    sel.homeBase?.[0] && `home base: ${sel.homeBase[0]}`,
    p('photoStyle') && `photo style: ${p('photoStyle')}`,
    palette.length && `palette HEX: ${JSON.stringify(palette)}`,
  ].filter(Boolean);
  if (brand.length) parts.push(`Brand profile (for later scenes, not shown on this sheet): ${brand.join('; ')}.`);

  return parts.join(' ');
}
