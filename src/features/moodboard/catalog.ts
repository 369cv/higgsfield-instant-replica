/** Moodboard Studio — curated presets, palettes, generator options. Names are our own. */

export type PresetGroup = 'Camera' | 'Film' | 'Light' | 'Era' | 'Effect';

export interface CuratedPreset {
  id: string;
  name: string;
  group: PresetGroup;
  /** style description injected into the generation prompt */
  look: string;
}

export const CURATED_PRESETS: CuratedPreset[] = [
  { id: 'golden-lounge', name: 'Golden lounge', group: 'Light', look: 'warm tungsten ambient light, soft falloff, honeyed shadows' },
  { id: 'chrome-pop', name: 'Chrome pop studio', group: 'Era', look: 'glossy late-90s studio, saturated cyan backdrop, chrome accents' },
  { id: 'beach-tape', name: 'Beach tape', group: 'Era', look: 'sun-bleached mid-2000s candid, low-rise denim, warm haze' },
  { id: 'stage-cut', name: 'Stage cut', group: 'Light', look: 'hard theatrical spotlight, deep blacks, painted backdrop' },
  { id: 'corner-shop', name: 'Corner shop', group: 'Era', look: 'urban street portrait, overcast daylight, storefront signage' },
  { id: 'flash-zine', name: 'Flash zine', group: 'Camera', look: 'on-camera direct flash, editorial poses, hard shadow halo' },
  { id: 'pocket-phone', name: 'Pocket phone', group: 'Camera', look: 'early camera-phone sensor, smeared highlights, low dynamic range' },
  { id: 'sidewalk', name: 'Sidewalk', group: 'Camera', look: '35mm street photography, candid motion, available light' },
  { id: 'silver-print', name: 'Silver print', group: 'Film', look: 'retro black-and-white silver gelatin, rich grain, deep contrast' },
  { id: 'night-market', name: 'Night market', group: 'Era', look: 'nostalgic East-Asian night scene, neon signage, humid glow' },
  { id: 'solar-dream', name: 'Solar dream', group: 'Effect', look: 'surreal solarization, inverted midtones, metallic tones' },
  { id: 'soft-flash', name: 'Soft flash', group: 'Camera', look: 'diffused fill flash, gentle shadow, clean skin' },
  { id: 'point-shoot', name: 'Point & shoot', group: 'Camera', look: 'compact digital camera, date-stamp energy, cool white balance' },
  { id: 'sea-siren', name: 'Sea siren', group: 'Effect', look: 'wet-look glamour, teal shadows, pearlescent highlights' },
  { id: 'fog-city', name: 'Fog city', group: 'Light', look: 'mysterious city fog, sodium streetlights, silhouettes' },
  { id: 'sugar-rush', name: 'Sugar rush', group: 'Effect', look: 'candy pastel palette, high-key light, glossy surfaces' },
  { id: 'two-souls', name: 'Two souls', group: 'Effect', look: 'double exposure, layered silhouettes, soft blend' },
  { id: 'garage-band', name: 'Garage band', group: 'Era', look: '2000s indie band promo, harsh flash, cluttered practice room' },
  { id: 'aqua-gloss', name: 'Aqua gloss', group: 'Era', look: 'glossy aqua-and-green optimism, bubbles, sky gradients' },
  { id: 'gutter-glow', name: 'Gutter glow', group: 'Era', look: 'dark underground club look, pink-purple haze, grime textures' },
  { id: 'off-world', name: 'Off-world', group: 'Effect', look: 'otherworldly landscape, alien light, desaturated sky' },
  { id: 'runway-street', name: 'Runway street', group: 'Camera', look: 'editorial street-style, telephoto compression, crisp detail' },
  { id: 'meadow-light', name: 'Meadow light', group: 'Light', look: 'natural window and meadow light, airy, soft greens' },
  { id: 'bedroom-indie', name: 'Bedroom indie', group: 'Era', look: 'new-wave indie, fairy lights, lo-fi bedroom set' },
  { id: 'deep-blue', name: 'Deep blue', group: 'Effect', look: 'underwater caustics, floating fabric, blue absorption' },
  { id: 'vhs-fright', name: 'VHS fright', group: 'Era', look: '80s horror VHS, red practicals, chroma noise' },
  { id: 'throwaway', name: 'Throwaway cam', group: 'Film', look: 'disposable camera, light leaks, overexposed flash' },
  { id: 'pastel-stock', name: 'Pastel stock', group: 'Film', look: 'neutral pastel color film, low contrast, creamy highlights' },
  { id: 'vivid-stock', name: 'Vivid stock', group: 'Film', look: 'warm vivid color negative, punchy reds, fine grain' },
  { id: 'mono-stock', name: 'Mono stock', group: 'Film', look: 'black-and-white film, classic grain, balanced tones' },
  { id: 'heat-contrast', name: 'Heat contrast', group: 'Film', look: 'warm contrast film, crushed blacks, amber skin' },
  { id: 'cool-mute', name: 'Cool mute', group: 'Film', look: 'muted cool film, teal shadows, restrained saturation' },
];

export const PRESET_GROUPS: ('All' | PresetGroup)[] = ['All', 'Camera', 'Film', 'Light', 'Era', 'Effect'];

export const GEN_MODELS: { id: string; name: string; desc: string; badges: string[]; disabled?: boolean }[] = [
  { id: 'realism-fashion', name: 'Atelier', desc: 'Fashion-grade realism (default)', badges: [] },
  { id: 'fast-draft', name: 'Sketchpad', desc: 'Fast drafts', badges: ['Unlimited'] },
  { id: 'typo-pro', name: 'Typeset', desc: 'Strong text rendering', badges: ['New'] },
  { id: 'cinema-xl', name: 'Cinema XL', desc: 'Wide cinematic frames', badges: ['Coming soon'], disabled: true },
];

export const ASPECTS = ['9:16', '3:4', '2:3', '1:1', '4:3', '16:9', '3:2'] as const;
export const QUALITIES = [
  { id: '1.5k', label: '1.5k', desc: 'Fastest, cheapest', cost: 0.5 },
  { id: '2k', label: '2k', desc: 'Best fidelity', cost: 1 },
] as const;

export interface Palette {
  id: string;
  name: string;
  colors: string[];
}

export const CURATED_PALETTES: Palette[] = [
  { id: 'dune', name: 'Dune', colors: ['#3b2a1e', '#8a5a34', '#c98f55', '#e8c9a0', '#f5ead8'] },
  { id: 'harbor', name: 'Harbor', colors: ['#0f1c2e', '#1f3b57', '#4f7a99', '#a9c4d6', '#eef3f6'] },
  { id: 'citrus', name: 'Citrus', colors: ['#2d3a10', '#6b8f1a', '#d1fe17', '#f6d84a', '#fff6d6'] },
  { id: 'rosewater', name: 'Rosewater', colors: ['#3a1f26', '#8c3f55', '#d77a92', '#f2b8c6', '#fbe9ee'] },
  { id: 'graphite', name: 'Graphite', colors: ['#0d0d0d', '#2b2b2b', '#595959', '#a3a3a3', '#f2f2f2'] },
  { id: 'lagoon', name: 'Lagoon', colors: ['#06302f', '#0f6b66', '#22a59b', '#86dcc8', '#e2f7f1'] },
  { id: 'ember', name: 'Ember', colors: ['#1d0b05', '#6a1d0b', '#c2410c', '#f59e0b', '#fde7c2'] },
  { id: 'lilac', name: 'Lilac', colors: ['#1f1530', '#4b3577', '#8a6fc4', '#c9b8ee', '#f3eefc'] },
];

/** Quality gate (spec §Validation). */
export const BUILD_RULES = { min: 5, ideal: 20, max: 60, minSide: 512 };

export const estimateCost = (qualityId: string, n: number) => (QUALITIES.find((q) => q.id === qualityId)?.cost ?? 0.5) * n;
