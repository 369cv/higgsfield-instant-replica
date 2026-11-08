import { StoredInfluencer, StudioHeadshot } from '../types';

const ACTIVE_HEADSHOT_KEY = 'halalfans_active_headshot';
const CUSTOM_HEADSHOTS_KEY = 'halalfans_custom_headshots';

export const GABRIELA_SANCHEZ: StoredInfluencer = {
  id: 'gabriela-sanchez-official',
  name: 'Gabriela Sanchez',
  instagramHandle: '@gabrielasanchezs',
  referenceImage: '/images/influencer-avatar.png',
  sampleImageUrl: '/images/influencer-avatar.png',
  headshotImage: '/images/studio/headshot-1-master.png',
  category: 'Fashion & Editorial',
  ethnicity: 'Latina',
  hair: 'Long Brunette',
  age: 23,
  dropsCount: 1604,
  signaturePrompt:
    'A high-fashion portrait of Gabriela Sanchez (@gabrielasanchezs) on a neutral studio gray background, softbox lighting, 85mm f/1.4 lens, natural skin texture, editorial elegance.',
  createdAt: 'Official Influencer',
  isVaultPreset: true,
};

export const INITIAL_STUDIO_HEADSHOTS: StudioHeadshot[] = [
  {
    id: 'hs-1',
    title: 'Neutral Master Studio',
    imageUrl: '/images/studio/headshot-1-master.png',
    lighting: 'Master Softbox',
    angle: 'Frontal Eye-Level',
    background: '18% Neutral Gray',
    createdAt: 'Default',
  },
  {
    id: 'hs-2',
    title: 'Softbox Diffused Glow',
    imageUrl: '/images/studio/headshot-2-softbox.png',
    lighting: 'Softbox Diffused',
    angle: 'Slight Tilt',
    background: 'Soft Studio Gray',
    createdAt: 'Studio Pass',
  },
  {
    id: 'hs-3',
    title: 'Rembrandt High-Contrast',
    imageUrl: '/images/studio/headshot-3-rembrandt.png',
    lighting: 'Rembrandt Dramatic',
    angle: '3/4 Editorial Angle',
    background: 'Deep Charcoal Gray',
    createdAt: 'Studio Pass',
  },
  {
    id: 'hs-4',
    title: 'Editorial Slate Tone',
    imageUrl: '/images/studio/headshot-4-slate.png',
    lighting: 'Cool Slate Fill',
    angle: 'Direct Eye-Level',
    background: 'Cool Slate Gray',
    createdAt: 'Studio Pass',
  },
  {
    id: 'hs-5',
    title: 'High-Key Luminous',
    imageUrl: '/images/studio/headshot-5-highkey.png',
    lighting: 'High-Key Beauty',
    angle: 'Frontal',
    background: 'Light Gray',
    createdAt: 'Studio Pass',
  },
  {
    id: 'hs-6',
    title: 'Beauty Close-Up Crop',
    imageUrl: '/images/studio/headshot-6-closecrop.png',
    lighting: 'Macro Ring Light',
    angle: 'Tight Portrait',
    background: 'Studio Gray',
    createdAt: 'Studio Pass',
  },
  {
    id: 'hs-7',
    title: 'Cinematic 35mm Rim',
    imageUrl: '/images/studio/headshot-7-cinematic.png',
    lighting: 'Warm Rim Light',
    angle: '3/4 Angle',
    background: 'Neutral Gray',
    createdAt: 'Studio Pass',
  },
  {
    id: 'hs-8',
    title: 'Monochrome Editorial',
    imageUrl: '/images/studio/headshot-8-monochrome.png',
    lighting: 'High-Contrast B&W',
    angle: 'Frontal Direct',
    background: 'Matte Gray',
    createdAt: 'Studio Pass',
  },
];

export const InfluencerStore = {
  getInfluencer(): StoredInfluencer {
    const activeHeadshot = this.getActiveHeadshot();
    return {
      ...GABRIELA_SANCHEZ,
      headshotImage: activeHeadshot,
      referenceImage: activeHeadshot,
      sampleImageUrl: activeHeadshot,
    };
  },

  getActiveHeadshot(): string {
    try {
      const saved = localStorage.getItem(ACTIVE_HEADSHOT_KEY);
      if (saved) return saved;
    } catch (e) {
      console.warn('localStorage error', e);
    }
    return '/images/studio/headshot-1-master.png';
  },

  setActiveHeadshot(imageUrl: string): void {
    try {
      localStorage.setItem(ACTIVE_HEADSHOT_KEY, imageUrl);
      // Dispatch a storage event so other components (like header) can update reactively
      window.dispatchEvent(new CustomEvent('halalfans_headshot_changed', { detail: imageUrl }));
    } catch (e) {
      console.error('Failed to set active headshot', e);
    }
  },

  getStudioHeadshots(): StudioHeadshot[] {
    let custom: StudioHeadshot[] = [];
    try {
      const stored = localStorage.getItem(CUSTOM_HEADSHOTS_KEY);
      if (stored) {
        custom = JSON.parse(stored);
      }
    } catch (e) {
      console.warn('Failed to parse custom headshots', e);
    }
    return [...custom, ...INITIAL_STUDIO_HEADSHOTS];
  },

  addStudioHeadshot(headshot: StudioHeadshot): void {
    try {
      const existing = this.getStudioHeadshots().filter(
        (h) => !INITIAL_STUDIO_HEADSHOTS.some((init) => init.id === h.id)
      );
      const updated = [headshot, ...existing];
      localStorage.setItem(CUSTOM_HEADSHOTS_KEY, JSON.stringify(updated));
      this.setActiveHeadshot(headshot.imageUrl);
    } catch (e) {
      console.error('Failed to add studio headshot', e);
    }
  },

  async getAll(): Promise<StoredInfluencer[]> {
    // Only one single real influencer: Gabriela Sanchez
    return [this.getInfluencer()];
  },
};
