/**
 * AI Influencer trait taxonomy + prompt compiler.
 *
 * To add artwork to a tile, set `image` on an option (e.g. '/influencer/traits/build-slim.webp').
 * Tiles without an image render as text tiles; colour traits render as swatches.
 */

export type TraitControl = 'tiles' | 'swatches' | 'chips';

export interface TraitOption {
  value: string;
  image?: string; // optional tile artwork
  hex?: string; // swatch colour
}

export interface TraitDef {
  id: string;
  label: string;
  control: TraitControl;
  multi?: boolean;
  /** Phrase used when compiling the prompt; `{v}` is replaced by the value(s). */
  phrase: string;
  options: TraitOption[];
}

const opts = (...values: string[]): TraitOption[] => values.map((value) => ({ value }));

export const TRAITS: TraitDef[] = [
  {
    id: 'characterType',
    label: 'Character type',
    control: 'tiles',
    phrase: '{v} character',
    options: opts('Average', 'Bold', 'Extreme', 'Insect', 'Frog', 'Cat', 'Dog', 'Rodent', 'Bird'),
  },
  {
    id: 'gender',
    label: 'Gender',
    control: 'tiles',
    phrase: '{v}',
    options: opts('Female', 'Male', 'Trans man', 'Trans woman', 'Non-binary'),
  },
  {
    id: 'build',
    label: 'Build',
    control: 'tiles',
    phrase: '{v} build',
    options: opts('Slim', 'Athletic', 'Muscular', 'Curvy', 'Heavy', 'Ultra muscular', 'Centaur'),
  },
  {
    id: 'hairstyle',
    label: 'Hairstyle',
    control: 'tiles',
    phrase: '{v} hairstyle',
    options: opts(
      'Bob', 'Bald', 'Buzz cut', 'Bowl cut', 'Mullet', 'Braids', 'Pigtails', 'Afro', 'Mohawk', 'Volume waves',
      'Beehive', 'Perm', 'Long hair', 'Short hair', 'Hair horns', 'Soft-serve swirl', 'Curl sphere',
      'Mouse-ear puffs', 'Hair wings', 'Hedgehog spikes', 'Side tufts', 'Stair steps', 'Shelf bob', 'Corkscrews',
      'Side coil', 'Mushroom'
    ),
  },
  {
    id: 'hairColor',
    label: 'Hair color',
    control: 'swatches',
    phrase: '{v} hair',
    options: [
      { value: 'Jet black', hex: '#0b0b0d' },
      { value: 'Dark brown', hex: '#3b2414' },
      { value: 'Chestnut', hex: '#6b3a1e' },
      { value: 'Ginger', hex: '#c0612b' },
      { value: 'Red', hex: '#a3201f' },
      { value: 'Blonde', hex: '#e2c27a' },
      { value: 'Platinum', hex: '#ece6d6' },
      { value: 'Grey', hex: '#9a9a9e' },
      { value: 'White', hex: '#f6f6f4' },
      { value: 'Pastel pink', hex: '#f4b8cf' },
      { value: 'Lilac', hex: '#c6a8e6' },
      { value: 'Blue', hex: '#3b6fd8' },
      { value: 'Green', hex: '#3fae5a' },
    ],
  },
  {
    id: 'style',
    label: 'Style',
    control: 'tiles',
    phrase: 'wearing a {v} outfit',
    options: opts('Retro', 'Sporty', 'Y2K', 'Theatre', 'Goth', 'Suits', 'Streetstyle', 'Casual'),
  },
  {
    id: 'ethnicity',
    label: 'Ethnicity',
    control: 'tiles',
    phrase: '{v}',
    options: opts('African', 'Asian', 'European', 'Indian', 'Middle Eastern', 'Mixed'),
  },
  {
    id: 'age',
    label: 'Age',
    control: 'chips',
    phrase: '{v}',
    options: opts('Adult', 'Mature', 'Senior'),
  },
  {
    id: 'skinColor',
    label: 'Skin color',
    control: 'swatches',
    phrase: '{v} skin',
    options: [
      { value: 'Porcelain', hex: '#f3dccb' },
      { value: 'Fair', hex: '#ecc8ad' },
      { value: 'Light', hex: '#dcae8a' },
      { value: 'Olive', hex: '#c09466' },
      { value: 'Tan', hex: '#a8774c' },
      { value: 'Brown', hex: '#7e5232' },
      { value: 'Deep brown', hex: '#5a3822' },
      { value: 'Ebony', hex: '#3a2416' },
    ],
  },
  {
    id: 'height',
    label: 'Height',
    control: 'chips',
    phrase: '{v} height',
    options: opts('Average', 'Tall', 'Very tall'),
  },
  {
    id: 'proportions',
    label: 'Proportions',
    control: 'tiles',
    phrase: '{v}',
    options: opts('Long limbs', 'Short legs', 'Broad shoulders', 'Tiny waist', 'Egg body'),
  },
  {
    id: 'headShape',
    label: 'Head shape',
    control: 'tiles',
    phrase: '{v} head shape',
    options: opts('Standard', 'Long', 'Tiny', 'High forehead', 'Caveman', 'Chiseled', 'Mega jaw', 'Round', 'Square', 'Heart'),
  },
  {
    id: 'neck',
    label: 'Neck',
    control: 'chips',
    phrase: '{v} neck',
    options: opts('Standard', 'Column', 'Long', 'Short'),
  },
  {
    id: 'eyeShape',
    label: 'Eye shape',
    control: 'tiles',
    phrase: '{v} eyes',
    options: opts('Almond', 'Round', 'Monolid', 'Close-set', 'Wide-set', 'Uneven', 'Large', 'Huge', 'Hooded', 'Upturned', 'Downturned'),
  },
  {
    id: 'eyeColor',
    label: 'Eye color',
    control: 'swatches',
    phrase: '{v} eye color',
    options: [
      { value: 'Black', hex: '#141414' },
      { value: 'Brown', hex: '#5b3a1f' },
      { value: 'Hazel', hex: '#8a6a32' },
      { value: 'Green', hex: '#4c7a3a' },
      { value: 'Blue', hex: '#3d6fb6' },
      { value: 'Ice blue', hex: '#a9d3ec' },
      { value: 'Amber', hex: '#c68a2a' },
      { value: 'Grey', hex: '#8d9399' },
    ],
  },
  {
    id: 'features',
    label: 'Features',
    control: 'tiles',
    multi: true,
    phrase: '{v}',
    options: opts(
      'Freckles', 'Dimples', 'Heavy eye bags', 'Blush', 'High cheekbones', 'Full lips', 'Thick brows', 'Beauty mark',
      'Potato nose', 'Button nose', 'Pointy nose', 'Tiny nose', 'Pouty lips', 'Tiny pursed mouth', 'Wide mouth',
      'Unibrow', 'Thin high brows', 'Brush brows', 'Jug ears', 'Uneven ears', 'Gap teeth', 'Buck teeth', 'Pointy chin',
      'Weak chin', 'Big forehead'
    ),
  },
  {
    id: 'facialHair',
    label: 'Facial hair',
    control: 'tiles',
    phrase: '{v} facial hair',
    options: opts('Clean', 'Stubble', 'Full beard', 'Goatee', 'Moustache', 'Pencil', 'Push-broom', 'Braided'),
  },
  {
    id: 'distinctive',
    label: 'Distinctive features',
    control: 'tiles',
    multi: true,
    phrase: '{v}',
    options: opts(
      'Odd eyes', 'Face tattoo', 'Piercing', 'Ear piercing', 'Brow slits', 'Bleached', 'No brows', 'Gold grill',
      'Braces', 'Brow scar', 'Face gems', 'Elf ears', 'Big lashes', 'Nose tape'
    ),
  },
  {
    id: 'accessories',
    label: 'Accessories',
    control: 'tiles',
    phrase: 'accessories: {v}',
    options: opts('None', 'Glasses', 'Headphones', 'Jewelry', 'Hat', 'Bag'),
  },
];

/** Selected values per trait id. Single-select traits hold one value, multi-select hold several. */
export type TraitSelection = Record<string, string[]>;

export function randomSelection(): TraitSelection {
  const pick = <T,>(a: T[]) => a[Math.floor(Math.random() * a.length)];
  const sel: TraitSelection = {};
  for (const t of TRAITS) {
    if (t.multi) {
      const n = Math.floor(Math.random() * 3); // 0–2 extras
      const shuffled = [...t.options].sort(() => Math.random() - 0.5).slice(0, n);
      sel[t.id] = shuffled.map((o) => o.value);
    } else {
      sel[t.id] = [pick(t.options).value];
    }
  }
  return sel;
}

/** Ordered list of chosen values, used for parameter chips. */
export function selectionChips(sel: TraitSelection): string[] {
  return TRAITS.flatMap((t) => sel[t.id] || []);
}

export function selectionCount(sel: TraitSelection): number {
  return TRAITS.reduce((n, t) => n + ((sel[t.id] || []).length > 0 ? 1 : 0), 0);
}

function phraseFor(id: string, sel: TraitSelection): string | null {
  const t = TRAITS.find((x) => x.id === id);
  const v = sel[id];
  if (!t || !v || v.length === 0) return null;
  if (id === 'accessories' && v[0] === 'None') return null;
  if (id === 'facialHair' && v[0] === 'Clean') return 'clean-shaven';
  return t.phrase.replace('{v}', v.join(', ').toLowerCase());
}

/**
 * Compile a character-sheet prompt: two panels (face close-up + full body) on white,
 * used later as the identity anchor for motion.
 */
export function compileCharacterPrompt(sel: TraitSelection, hasPhoto: boolean, presetName?: string): string {
  const p = (id: string) => phraseFor(id, sel);
  const subject = [p('age'), p('ethnicity'), p('gender')].filter(Boolean).join(' ');
  const parts: string[] = [];

  parts.push(
    'Character sheet with two panels side by side on a seamless pure white background: ' +
      'left panel a tight face close-up portrait, right panel a full-body standing pose facing camera.'
  );
  const who = [p('characterType'), subject || null].filter(Boolean).join(', ');
  if (who) parts.push(`Subject: ${who}.`);
  const body = [p('build'), p('height'), p('proportions')].filter(Boolean);
  if (body.length) parts.push(`Body: ${body.join(', ')}.`);
  const hair = [p('hairColor'), p('hairstyle')].filter(Boolean);
  if (hair.length) parts.push(`Hair: ${hair.join(', ')}.`);
  const face = [p('skinColor'), p('headShape'), p('neck'), p('eyeShape'), p('eyeColor'), p('facialHair')].filter(Boolean);
  if (face.length) parts.push(`Face: ${face.join(', ')}.`);
  const marks = [p('features'), p('distinctive')].filter(Boolean);
  if (marks.length) parts.push(`Details: ${marks.join(', ')}.`);
  const look = [p('style'), p('accessories')].filter(Boolean);
  if (look.length) parts.push(`Look: ${look.join(', ')}.`);
  if (presetName)
    parts.push(
      `Base character: ${presetName} — use the attached ${presetName} character sheet as the exact face and body identity; apply the traits above only where they differ.`
    );
  if (hasPhoto) parts.push('Use the uploaded reference photo as the exact face identity.');
  parts.push(
    'Soft even studio lighting, sharp focus, photorealistic skin texture, identical identity, outfit and hair in both panels.'
  );
  return parts.join(' ');
}
