import { StoredInfluencer } from '../types';

const STORAGE_KEY = 'halalfans_influencers';

let cachedInfluencers: StoredInfluencer[] | null = null;

export const InfluencerStore = {
  async getAll(): Promise<StoredInfluencer[]> {
    if (cachedInfluencers && cachedInfluencers.length > 0) {
      return cachedInfluencers;
    }

    let presets: StoredInfluencer[] = [];

    // 1. Fetch from consolidated curated dataset
    try {
      const res = await fetch('/data/consolidated-influencers.json');
      if (res.ok) {
        const data = await res.json();
        if (data.influencers && Array.isArray(data.influencers)) {
          presets = data.influencers;
        }
      }
    } catch (e) {
      console.warn('Could not load /data/consolidated-influencers.json', e);
    }

    // 2. Read user-created influencers from localStorage
    let userCreated: StoredInfluencer[] = [];
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        userCreated = JSON.parse(stored);
      }
    } catch (e) {
      console.error('Error reading localStorage for influencers', e);
    }

    // 3. Merge: user creations first, then vault presets
    const combined = [...userCreated, ...presets];
    cachedInfluencers = combined;
    return combined;
  },

  getUserCreated(): StoredInfluencer[] {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  },

  save(influencer: Partial<StoredInfluencer>): StoredInfluencer {
    const existing = this.getUserCreated();
    const id = influencer.id || `custom-inf-${Date.now()}`;
    const newRecord: StoredInfluencer = {
      id,
      name: influencer.name || 'Custom Influencer',
      referenceImage:
        influencer.referenceImage ||
        'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=500&auto=format&fit=crop&q=80',
      sampleImageUrl:
        influencer.sampleImageUrl ||
        influencer.referenceImage ||
        'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=800&auto=format&fit=crop&q=80',
      category: influencer.category || 'Editorial & Luxury',
      ethnicity: influencer.ethnicity || 'International',
      hair: influencer.hair || 'Brunette',
      age: influencer.age || 22,
      dropsCount: influencer.dropsCount || 1,
      associatedDropIds: influencer.associatedDropIds || [],
      signaturePrompt:
        influencer.signaturePrompt ||
        'A portrait photograph of a beautiful fashion model with elegant features...',
      fullPrompt: influencer.fullPrompt || influencer.signaturePrompt,
      createdAt: new Date().toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      }),
      isVaultPreset: false,
    };

    const updated = [newRecord, ...existing.filter((item) => item.id !== id)];
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch (e) {
      console.error('Failed to save influencer to localStorage', e);
    }

    // Invalidate cache
    cachedInfluencers = null;
    return newRecord;
  },

  delete(id: string): void {
    const existing = this.getUserCreated();
    const updated = existing.filter((item) => item.id !== id);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch (e) {
      console.error('Failed to delete influencer from localStorage', e);
    }
    cachedInfluencers = null;
  },
};
