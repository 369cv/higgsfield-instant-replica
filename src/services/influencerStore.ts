import { StoredInfluencer, StudioHeadshot, VaultItem } from '../types';

const MANAGED_INFLUENCERS_KEY = 'halalfans_managed_influencers_v5';
const ACTIVE_INFLUENCER_ID_KEY = 'halalfans_active_influencer_id_v5';
const ACTIVE_HEADSHOT_KEY = 'halalfans_active_headshot_v5';
const CUSTOM_HEADSHOTS_KEY = 'halalfans_custom_headshots_v5';

export const BAHA_SAVAGE: StoredInfluencer = {
  id: 'baha-savage-official',
  name: 'Baha Savage',
  instagramHandle: '@bahasavage',
  referenceImage: '/images/baha/baha-headshot-openhair-gray.png',
  sampleImageUrl: '/images/baha/baha-headshot-openhair-gray.png',
  headshotImage: '/images/baha/baha-headshot-openhair-gray.png',
  category: 'Quiet Luxury & Sovereign Strategy',
  ethnicity: 'Mediterranean / Levantine',
  hair: 'Long Dark Chocolate Brown',
  age: 28,
  dropsCount: 1604,
  signaturePrompt:
    'A refined high-contrast studio portrait of Baha Savage (@bahasavage) on a neutral studio gray background, softbox lighting, 85mm prime lens, natural skin texture with visible fine pores, elegant quiet luxury poise.',
  createdAt: 'Official Character',
  isVaultPreset: true,
};

// Backwards-compatibility alias
export const GABRIELA_SANCHEZ = BAHA_SAVAGE;

export const INITIAL_STUDIO_HEADSHOTS: StudioHeadshot[] = [
  {
    id: 'hs-1',
    title: 'Neutral Studio Master (Open Hair)',
    imageUrl: '/images/baha/baha-headshot-openhair-gray.png',
    lighting: 'Master Softbox',
    angle: 'Frontal Eye-Level',
    background: '18% Neutral Gray',
    createdAt: 'Default',
  },
  {
    id: 'hs-2',
    title: 'Executive Taupe Blazer (Editorial Updo)',
    imageUrl: '/images/baha/baha-headshot-blazer-gray.png',
    lighting: 'Keyed Octabox',
    angle: 'Frontal Eye-Level',
    background: 'Studio Neutral Gray',
    createdAt: 'Studio Pass',
  },
  {
    id: 'hs-3',
    title: 'Silk Shirt & High Ponytail',
    imageUrl: '/images/baha/baha-headshot-ponytail-gray.png',
    lighting: 'High-Key Beauty',
    angle: 'Frontal Direct',
    background: 'Matte Gray',
    createdAt: 'Studio Pass',
  },
  {
    id: 'hs-4',
    title: 'Executive Advisory Broadcast',
    imageUrl: '/images/baha/baha-editorial-portrait.jpg',
    lighting: 'Warm Environmental Studio Fill',
    angle: 'Relaxed 3/4 Perspective',
    background: 'Modern Architectural Studio',
    createdAt: 'Studio Pass',
  },
];

export const InfluencerStore = {
  /**
   * Retrieves all managed influencers from localStorage, ensuring Baha Savage is primary.
   */
  getAll(): StoredInfluencer[] {
    try {
      const stored = localStorage.getItem(MANAGED_INFLUENCERS_KEY);
      if (stored) {
        const parsed: StoredInfluencer[] = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const activeHeadshot = this.getActiveHeadshot();
          const hasBaha = parsed.some((inf) => inf.id === BAHA_SAVAGE.id);
          const list = parsed.map((inf) => {
            if (inf.id === BAHA_SAVAGE.id) {
              return {
                ...inf,
                name: 'Baha Savage',
                instagramHandle: '@bahasavage',
                headshotImage: activeHeadshot,
                referenceImage: activeHeadshot,
                sampleImageUrl: activeHeadshot,
                dropsCount: 1604,
              };
            }
            return inf;
          });

          if (!hasBaha) {
            list.unshift({
              ...BAHA_SAVAGE,
              headshotImage: activeHeadshot,
              referenceImage: activeHeadshot,
              sampleImageUrl: activeHeadshot,
            });
          }
          return list;
        }
      }
    } catch (e) {
      console.error('Error reading managed influencers', e);
    }

    // Default initialization with Baha Savage
    const initialList = [
      {
        ...BAHA_SAVAGE,
        headshotImage: this.getActiveHeadshot(),
        referenceImage: this.getActiveHeadshot(),
        sampleImageUrl: this.getActiveHeadshot(),
      },
    ];
    this.saveAll(initialList);
    return initialList;
  },

  saveAll(list: StoredInfluencer[]): void {
    try {
      localStorage.setItem(MANAGED_INFLUENCERS_KEY, JSON.stringify(list));
    } catch (e) {
      console.error('Failed to save influencers to storage', e);
    }
  },

  getActiveInfluencerId(): string {
    try {
      const id = localStorage.getItem(ACTIVE_INFLUENCER_ID_KEY);
      if (id) return id;
    } catch {
      // fallback
    }
    return BAHA_SAVAGE.id;
  },

  setActiveInfluencerId(id: string): void {
    try {
      localStorage.setItem(ACTIVE_INFLUENCER_ID_KEY, id);
      window.dispatchEvent(new CustomEvent('halalfans_influencer_changed', { detail: id }));
    } catch (e) {
      console.error('Failed to set active influencer ID', e);
    }
  },

  getActiveInfluencer(): StoredInfluencer {
    const all = this.getAll();
    const activeId = this.getActiveInfluencerId();
    const found = all.find((inf) => inf.id === activeId);
    return found || all[0] || BAHA_SAVAGE;
  },

  save(influencer: Partial<StoredInfluencer>): StoredInfluencer {
    const existing = this.getAll();
    const id = influencer.id || `inf-${Date.now()}`;
    const newRecord: StoredInfluencer = {
      id,
      name: influencer.name || 'New Influencer',
      instagramHandle: influencer.instagramHandle || `@${(influencer.name || 'influencer').toLowerCase().replace(/\s+/g, '')}`,
      referenceImage: influencer.referenceImage || '/images/baha/baha-headshot-openhair-gray.png',
      sampleImageUrl: influencer.sampleImageUrl || influencer.referenceImage || '/images/baha/baha-headshot-openhair-gray.png',
      headshotImage: influencer.headshotImage || influencer.referenceImage || '/images/baha/baha-headshot-openhair-gray.png',
      category: influencer.category || 'Fashion & Editorial',
      ethnicity: influencer.ethnicity || 'Mediterranean / Levantine',
      hair: influencer.hair || 'Long Brunette',
      age: influencer.age || 28,
      dropsCount: influencer.dropsCount || 1,
      associatedDropIds: influencer.associatedDropIds || [],
      signaturePrompt:
        influencer.signaturePrompt ||
        `A high-fashion studio portrait of ${influencer.name || 'an influencer'} on neutral studio gray background...`,
      fullPrompt: influencer.fullPrompt || influencer.signaturePrompt,
      createdAt: new Date().toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      }),
      isVaultPreset: false,
    };

    const updated = [newRecord, ...existing.filter((item) => item.id !== id)];
    this.saveAll(updated);
    this.setActiveInfluencerId(id);
    return newRecord;
  },

  delete(id: string): void {
    if (id === BAHA_SAVAGE.id) return; // Protected
    const existing = this.getAll();
    const updated = existing.filter((item) => item.id !== id);
    this.saveAll(updated);
    if (this.getActiveInfluencerId() === id) {
      this.setActiveInfluencerId(BAHA_SAVAGE.id);
    }
  },

  autoTraceFromVault(items: VaultItem[]): { added: number; updated: number } {
    const all = this.getAll();
    let updatedCount = 0;
    const baha = all.find((i) => i.id === BAHA_SAVAGE.id);
    if (baha && baha.dropsCount !== items.length && items.length > 0) {
      baha.dropsCount = items.length;
      updatedCount++;
      this.saveAll(all);
    }
    return { added: 0, updated: updatedCount };
  },

  getActiveHeadshot(): string {
    try {
      const saved = localStorage.getItem(ACTIVE_HEADSHOT_KEY);
      if (saved) return saved;
    } catch {
      // fallback
    }
    return '/images/baha/baha-headshot-openhair-gray.png';
  },

  setActiveHeadshot(imageUrl: string): void {
    try {
      localStorage.setItem(ACTIVE_HEADSHOT_KEY, imageUrl);
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
    } catch {
      // fallback
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
};
