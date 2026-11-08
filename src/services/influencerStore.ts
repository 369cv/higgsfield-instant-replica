import { StoredInfluencer, StudioHeadshot, VaultItem } from '../types';

const MANAGED_INFLUENCERS_KEY = 'halalfans_managed_influencers_v7';
const ACTIVE_INFLUENCER_ID_KEY = 'halalfans_active_influencer_id_v7';
const ACTIVE_HEADSHOT_KEY = 'halalfans_active_headshot_v7';
const CUSTOM_HEADSHOTS_KEY = 'halalfans_custom_headshots_v7';

export const BAHA_SAVAGE: StoredInfluencer = {
  id: 'baha-savage-official',
  name: 'Baha Savage',
  instagramHandle: '@bahasavage',
  referenceImage: '/images/archetypes/business-founder.png',
  sampleImageUrl: '/images/archetypes/business-founder.png',
  headshotImage: '/images/archetypes/business-founder.png',
  category: 'Quiet Luxury & Sovereign Strategy',
  ethnicity: 'Mediterranean / Levantine',
  hair: 'Long Dark Chocolate Brown',
  age: 28,
  dropsCount: 1604,
  signaturePrompt:
    'A refined high-contrast editorial portrait of Baha Savage (@bahasavage) in an oversized tailored suit blazer, resting on polished black and gold marble counter in modern luxury interior.',
  createdAt: 'Official Character',
  isVaultPreset: true,
};

export const INITIAL_STUDIO_HEADSHOTS: StudioHeadshot[] = [
  {
    id: 'hs-1',
    title: 'Executive Oversized Suit (Marble Interior)',
    imageUrl: '/images/archetypes/business-founder.png',
    lighting: 'Diffuse Ambient Luxury',
    angle: 'Frontal 3/4',
    background: 'Modern Black Marble',
    createdAt: 'Default',
  },
  {
    id: 'hs-2',
    title: 'Urban Penthouse & Black Blazer',
    imageUrl: '/images/archetypes/business-penthouse.png',
    lighting: 'Soft Daylight',
    angle: 'Frontal Medium',
    background: 'Luxury Penthouse Suite',
    createdAt: 'Studio Pass',
  },
  {
    id: 'hs-3',
    title: 'Avant-Garde Architectural Power Blazer',
    imageUrl: '/images/archetypes/business-power.png',
    lighting: 'Overcast Architectural Key',
    angle: 'Frontal 3/4',
    background: 'Modernist Stone Columns',
    createdAt: 'Studio Pass',
  },
  {
    id: 'hs-4',
    title: 'Dark Green Tailored Blazer & Jacquemus',
    imageUrl: '/images/archetypes/business-advisory.png',
    lighting: 'Warm Backlit Ambient',
    angle: 'Seated Mid-Length',
    background: 'Minimalist Architecture',
    createdAt: 'Studio Pass',
  },
];

export const InfluencerStore = {
  /**
   * Purges old legacy caches and retrieves active influencers.
   */
  getAll(): StoredInfluencer[] {
    try {
      // Purge legacy storage keys from previous iterations
      const legacyKeys = [
        'halalfans_managed_influencers_v1',
        'halalfans_managed_influencers_v2',
        'halalfans_managed_influencers_v3',
        'halalfans_managed_influencers_v4',
        'halalfans_managed_influencers_v5',
        'halalfans_managed_influencers_v6',
        'halalfans_active_influencer_id_v6',
        'halalfans_active_headshot_v6',
        'managed_influencers',
        'active_influencer_id',
      ];
      legacyKeys.forEach((k) => {
        try {
          localStorage.removeItem(k);
        } catch {
          // ignore
        }
      });

      const stored = localStorage.getItem(MANAGED_INFLUENCERS_KEY);
      if (stored) {
        const parsed: StoredInfluencer[] = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const activeHeadshot = this.getActiveHeadshot();
          // Filter out any stale/fake personas
          const cleanList = parsed.filter(
            (inf) =>
              inf.name !== 'Gabriela Sanchez' &&
              inf.instagramHandle !== '@gabrielasanchezs' &&
              inf.id !== 'inf-gabriela' &&
              inf.id !== 'gabriela-sanchez'
          );

          const hasBaha = cleanList.some((inf) => inf.id === BAHA_SAVAGE.id);
          const sanitized = cleanList.map((inf) => {
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
            sanitized.unshift({
              ...BAHA_SAVAGE,
              headshotImage: activeHeadshot,
              referenceImage: activeHeadshot,
              sampleImageUrl: activeHeadshot,
            });
          }
          this.saveAll(sanitized);
          return sanitized;
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
      if (id && id !== 'inf-gabriela' && id !== 'gabriela-sanchez') return id;
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
      instagramHandle:
        influencer.instagramHandle ||
        `@${(influencer.name || 'influencer').toLowerCase().replace(/\s+/g, '')}`,
      referenceImage: influencer.referenceImage || '/images/archetypes/business-founder.png',
      sampleImageUrl:
        influencer.sampleImageUrl ||
        influencer.referenceImage ||
        '/images/archetypes/business-founder.png',
      headshotImage:
        influencer.headshotImage ||
        influencer.referenceImage ||
        '/images/archetypes/business-founder.png',
      category: influencer.category || 'Fashion & Editorial',
      ethnicity: influencer.ethnicity || 'Mediterranean / Levantine',
      hair: influencer.hair || 'Long Dark Chocolate Brown',
      age: influencer.age || 28,
      dropsCount: influencer.dropsCount || 1,
      associatedDropIds: influencer.associatedDropIds || [],
      signaturePrompt:
        influencer.signaturePrompt ||
        `A high-fashion studio portrait of ${influencer.name || 'an influencer'} on neutral studio background...`,
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
      if (
        saved &&
        !saved.includes('baha-headshot-openhair-gray.png') &&
        !saved.includes('baha-headshot-blazer-gray.png') &&
        !saved.includes('baha-headshot-ponytail-gray.png') &&
        !saved.includes('baha-headshot') &&
        !saved.includes('da580608') &&
        !saved.includes('beige_suit_model')
      ) {
        return saved;
      }
    } catch {
      // fallback
    }
    return '/images/archetypes/business-founder.png';
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
    try {
      const custom = localStorage.getItem(CUSTOM_HEADSHOTS_KEY);
      if (custom) {
        const parsed = JSON.parse(custom);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return [...parsed, ...INITIAL_STUDIO_HEADSHOTS];
        }
      }
    } catch (e) {
      console.error('Failed to read custom headshots', e);
    }
    return INITIAL_STUDIO_HEADSHOTS;
  },

  addStudioHeadshot(headshot: StudioHeadshot): void {
    try {
      const custom = localStorage.getItem(CUSTOM_HEADSHOTS_KEY);
      const existing: StudioHeadshot[] = custom ? JSON.parse(custom) : [];
      const updated = [headshot, ...existing];
      localStorage.setItem(CUSTOM_HEADSHOTS_KEY, JSON.stringify(updated));
      this.setActiveHeadshot(headshot.imageUrl);
    } catch (e) {
      console.error('Failed to add studio headshot', e);
    }
  },
};
