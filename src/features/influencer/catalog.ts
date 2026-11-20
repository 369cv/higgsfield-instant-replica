import { TraitSelection } from './traits';

/**
 * Content for the AI Influencer page. Drop image/video files in /public/influencer/
 * and list them here — the UI picks them up automatically.
 */

export interface GalleryCharacter {
  id: string;
  image: string; // character sheet or portrait
  traits?: TraitSelection; // enables "Recreate"
}

export interface MotionPreset {
  id: string;
  title: string;
  video?: string;
  poster?: string;
}

export interface TrendItem {
  id: string;
  title: string;
  mode: 'Motion transfer' | 'Objects swap';
  video?: string;
  poster?: string;
  remixes?: number;
  likes?: number;
}

/**
 * Preset characters (two-panel sheets: face close-up + full body).
 * Files live in /public/influencer/characters/{id}.webp, {id}-face.webp, {id}-body.webp.
 */
export interface CharacterPreset {
  id: string;
  name: string;
}

export const CHARACTER_PRESETS: CharacterPreset[] = [
  { id: 'baja-savage', name: "Baja Savage" },
  { id: 'chloe-tan', name: "Chloe Tan" },
  { id: 'layla-al-mansoor', name: "Layla Al Mansoor" },
  { id: 'sienna-o-connor', name: "Sienna O'Connor" },
  { id: 'ananya-kapoor', name: "Ananya Kapoor" },
  { id: 'nadia-petrova', name: "Nadia Petrova" },
  { id: 'salma-benali', name: "Salma Benali" },
  { id: 'rhea-malhotra', name: "Rhea Malhotra" },
  { id: 'camila-santos', name: "Camila Santos" },
  { id: 'sofia-bellini', name: "Sofia Bellini" },
  { id: 'amira-al-qasimi', name: "Amira Al Qasimi" },
  { id: 'maya-hassan', name: "Maya Hassan" },
  { id: 'freya-lindqvist', name: "Freya Lindqvist" },
  { id: 'valeria-mendoza', name: "Valeria Mendoza" },
  { id: 'kavya-nair', name: "Kavya Nair" },
  { id: 'soraya-darwish', name: "Soraya Darwish" },
  { id: 'tara-singhania', name: "Tara Singhania" },
  { id: 'valentina-cruz', name: "Valentina Cruz" },
  { id: 'yasmina-khoury', name: "Yasmina Khoury" },
  { id: 'amina-nurzhanova', name: "Amina Nurzhanova" },
  { id: 'noura-al-sayegh', name: "Noura Al Sayegh" },
  { id: 'viktoria-novak', name: "Viktoria Novak" },
  { id: 'claire-beaumont-lin', name: "Claire Beaumont Lin" },
  { id: 'bianca-reyes', name: "Bianca Reyes" },
  { id: 'yara-al-harbi', name: "Yara Al Harbi" },
  { id: 'giulia-moretti', name: "Giulia Moretti" },
  { id: 'zoe-mansour', name: "Zoe Mansour" },
  { id: 'katarina-volkov', name: "Katarina Volkov" },
  { id: 'farah-al-khatib', name: "Farah Al Khatib" },
  { id: 'adriana-silva', name: "Adriana Silva" },
  { id: 'samira-jaffer', name: "Samira Jaffer" },
  { id: 'monica-castellanos', name: "Monica Castellanos" },
  { id: 'astrid-van-der-berg', name: "Astrid van der Berg" },
  { id: 'elena-popescu', name: "Elena Popescu" },
  { id: 'rania-al-nasser', name: "Rania Al Nasser" },
  { id: 'tatiana-morales', name: "Tatiana Morales" },
  { id: 'kyla-wijaya', name: "Kyla Wijaya" },
  { id: 'shirin-farhadi', name: "Shirin Farhadi" },
  { id: 'gabriela-costa', name: "Gabriela Costa" },
  { id: 'celine-choueiri', name: "Celine Choueiri" },
];

export const presetSheet = (id: string) => `/influencer/characters/${id}.webp`;
export const presetFace = (id: string) => `/influencer/characters/${id}-face.webp`;
export const presetBody = (id: string) => `/influencer/characters/${id}-body.webp`;
/** Background-removed full body, registered on a 680×1020 canvas (same scale + floor line for every character). */
export const presetCut = (id: string) => `/influencer/characters/${id}-cut.webp`;

/** Hero carousel media (up to 5). Empty → falls back to preset characters. */
export const HERO_MEDIA: { video?: string; image?: string }[] = [];

/** Gallery: every preset sheet, plus any extra entries you add. */
export const INFLUENCER_GALLERY: GalleryCharacter[] = CHARACTER_PRESETS.map((p) => ({ id: p.id, image: presetSheet(p.id) }));
export const MOTION_PRESETS: MotionPreset[] = [];
export const COMMUNITY_TRENDS: TrendItem[] = [];

/** Render styles for Motion. Add `image` for a thumbnail. */
export const STYLE_PRESETS: { id: string; name: string; image?: string }[] = [
  { id: 'none', name: 'No style' },
  { id: 'cel', name: 'Cel animation' },
  { id: 'yarn', name: 'Knitted yarn' },
  { id: 'toy', name: 'Toy CGI' },
  { id: 'felt', name: 'Felt stop-motion' },
  { id: 'painterly', name: 'Painterly 3D' },
  { id: 'lowpoly', name: 'Low-poly' },
  { id: 'anime', name: 'Anime CG' },
  { id: 'clay', name: 'Claymation' },
  { id: 'paper', name: 'Paper cut-out' },
  { id: 'watercolor', name: 'Watercolor' },
  { id: 'comic', name: 'Comic ink' },
  { id: 'pixel', name: 'Pixel art' },
  { id: 'noir', name: 'Film noir' },
  { id: 'chrome', name: 'Liquid chrome' },
  { id: 'vapor', name: 'Vaporwave' },
];

export interface MotionModel {
  id: string;
  name: string;
  description: string;
  maxRes: string;
  duration: string;
}

export const MOTION_MODELS: MotionModel[] = [
  { id: 'motion-pro', name: 'Motion Pro', description: 'Best quality, faithful motion', maxRes: '1080p', duration: '4–30s' },
  { id: 'motion-lite', name: 'Motion Lite', description: 'Faster drafts', maxRes: '720p', duration: '4–15s' },
];

export const QUALITIES = ['480p', '720p', '1080p'] as const;
export type Quality = (typeof QUALITIES)[number];
