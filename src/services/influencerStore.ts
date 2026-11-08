import { StoredInfluencer, StudioHeadshot, VaultItem } from '../types';

const MANAGED_INFLUENCERS_KEY = 'halalfans_managed_influencers_v3';
const ACTIVE_INFLUENCER_ID_KEY = 'halalfans_active_influencer_id';
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
  /**
   * Retrieves all managed influencers from localStorage, ensuring Gabriela Sanchez is primary.
   */
  getAll(): StoredInfluencer[] {
    try {
      const stored = localStorage.getItem(MANAGED_INFLUENCERS_KEY);
      if (stored) {
        const parsed: StoredInfluencer[] = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          // Ensure Gabriela Sanchez is present with live active headshot
          const activeHeadshot = this.getActiveHeadshot();
          const hasGabriela = parsed.some((inf) => inf.id === GABRIELA_SANCHEZ.id);
          const list = parsed.map((inf) => {
            if (inf.id === GABRIELA_SANCHEZ.id) {
              return {
                ...inf,
                headshotImage: activeHeadshot,
                referenceImage: activeHeadshot,
                sampleImageUrl: activeHeadshot,
                dropsCount: 1604,
              };
            }
            return inf;
          });

          if (!hasGabriela) {
            list.unshift({
              ...GABRIELA_SANCHEZ,
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

    // Default initialization
    const initialList = [
      {
        ...GABRIELA_SANCHEZ,
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
    return GABRIELA_SANCHEZ.id;
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
    return found || all[0] || GABRIELA_SANCHEZ;
  },

  save(influencer: Partial<StoredInfluencer>): StoredInfluencer {
    const existing = this.getAll();
    const id = influencer.id || `inf-${Date.now()}`;
    const newRecord: StoredInfluencer = {
      id,
      name: influencer.name || 'New Influencer',
      instagramHandle: influencer.instagramHandle || `@${(influencer.name || 'influencer').toLowerCase().replace(/\s+/g, '')}`,
      referenceImage: influencer.referenceImage || '/images/studio/headshot-1-master.png',
      sampleImageUrl: influencer.sampleImageUrl || influencer.referenceImage || '/images/studio/headshot-1-master.png',
      headshotImage: influencer.headshotImage || influencer.referenceImage || '/images/studio/headshot-1-master.png',
      category: influencer.category || 'Fashion & Editorial',
      ethnicity: influencer.ethnicity || 'Latina',
      hair: influencer.hair || 'Long Brunette',
      age: influencer.age || 22,
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
    if (id === GABRIELA_SANCHEZ.id) return; // Protected
    const existing = this.getAll();
    const updated = existing.filter((item) => item.id !== id);
    this.saveAll(updated);
    if (this.getActiveInfluencerId() === id) {
      this.setActiveInfluencerId(GABRIELA_SANCHEZ.id);
    }
  },

  /**
   * Auto-trace influencers from newly added prompts/items in Prompt Vault.
   * If a prompt mentions a handle or specific identity, it automatically registers/updates their profile!
   */
  autoTraceFromVault(items: VaultItem[]): { added: number; updated: number } {
    const all = this.getAll();
    let updatedCount = 0;
    let addedCount = 0;

    // Check if Gabriela's count needs updating
    const gabriela = all.find((i) => i.id === GABRIELA_SANCHEZ.id);
    if (gabriela && gabriela.dropsCount !== items.length && items.length > 0) {
      gabriela.dropsCount = items.length;
      updatedCount++;
    }

    // Inspect prompts for other tagged influencers (e.g., @handles or named models)
    const handleRegex = /@([a-zA-Z0-9_.]+)/g;
    const detectedHandles = new Map<string, { count: number; sampleImage: string; samplePrompt: string }>();

    items.forEach((item) => {
      const p = item.prompt || '';
      let match;
      while ((match = handleRegex.exec(p)) !== null) {
        const handle = `@${match[1]}`.toLowerCase();
        if (handle !== '@gabrielasanchezs') {
          const prev = detectedHandles.get(handle) || {
            count: 0,
            sampleImage: item.imageUrl,
            samplePrompt: item.prompt,
          };
          prev.count += 1;
          detectedHandles.set(handle, prev);
        }
      }
    });

    detectedHandles.forEach((info, handle) => {
      const existing = all.find((i) => i.instagramHandle?.toLowerCase() === handle);
      if (existing) {
        existing.dropsCount = info.count;
        updatedCount++;
      } else {
        const namePart = handle.replace('@', '');
        const formattedName = namePart.charAt(0).toUpperCase() + namePart.slice(1);
        all.push({
          id: `traced-${namePart}`,
          name: formattedName,
          instagramHandle: handle,
          referenceImage: info.sampleImage,
          sampleImageUrl: info.sampleImage,
          headshotImage: info.sampleImage,
          category: 'Fashion & Editorial',
          ethnicity: 'International',
          hair: 'Brunette',
          age: 23,
          dropsCount: info.count,
          signaturePrompt: info.samplePrompt,
          createdAt: 'Auto-Traced from Vault',
          isVaultPreset: false,
        });
        addedCount++;
      }
    });

    if (updatedCount > 0 || addedCount > 0) {
      this.saveAll(all);
    }

    return { added: addedCount, updated: updatedCount };
  },

  getActiveHeadshot(): string {
    try {
      const saved = localStorage.getItem(ACTIVE_HEADSHOT_KEY);
      if (saved) return saved;
    } catch {
      // fallback
    }
    return '/images/studio/headshot-1-master.png';
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
