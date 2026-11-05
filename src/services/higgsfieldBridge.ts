import { AccountInfo, VaultItem, SoulCharacter } from '../types';

const BRIDGE_URL = 'http://localhost:9876/api';

export const HiggsfieldService = {
  async getAccount(): Promise<AccountInfo> {
    try {
      const res = await fetch(`${BRIDGE_URL}/account`);
      if (res.ok) {
        return await res.json();
      }
    } catch {
      // Local bridge offline
    }
    return {
      email: 'baha@bahasavage.com',
      plan: 'starter',
      credits: 270,
      workspace: 'Private'
    };
  },

  async getSouls(): Promise<SoulCharacter[]> {
    try {
      const res = await fetch(`${BRIDGE_URL}/souls`);
      if (res.ok) {
        const data = await res.json();
        return data.souls || [];
      }
    } catch {
      // fallback
    }
    return [];
  },

  async getVaultDetails(): Promise<{ items: VaultItem[]; total: number; inProgressCount: number }> {
    // 1. Primary: Cloud serverless endpoint (works on mobile, web, halalfans.me)
    try {
      const res = await fetch('/api/vault');
      if (res.ok) {
        const data = await res.json();
        if (data.items && data.items.length > 0) {
          return {
            items: data.items,
            total: data.total || data.items.length,
            inProgressCount: data.inProgressCount || 0
          };
        }
      }
    } catch {
      // Cloud API not reachable or running in pure file context
    }

    // 2. Secondary: Local bridge daemon (when running locally)
    try {
      const res = await fetch(`${BRIDGE_URL}/vault`);
      if (res.ok) {
        const data = await res.json();
        if (data.items && data.items.length > 0) {
          return {
            items: data.items,
            total: data.total || data.items.length,
            inProgressCount: data.inProgressCount || 0
          };
        }
      }
    } catch {
      // Local bridge offline
    }

    // 3. Static fallback for production Vercel & offline extension
    try {
      const staticRes = await fetch('/data/soul-generations.json');
      if (staticRes.ok) {
        const staticData = await staticRes.json();
        return {
          items: staticData.items || [],
          total: staticData.total || (staticData.items || []).length,
          inProgressCount: 0
        };
      }
    } catch (e) {
      console.warn('Could not load static soul-generations.json', e);
    }

    return { items: [], total: 0, inProgressCount: 0 };
  },

  async getVault(): Promise<VaultItem[]> {
    const details = await this.getVaultDetails();
    return details.items;
  },

  async extractPrompt(imageUrl: string): Promise<{ prompt: string; model: string; aspectRatio: string }> {
    try {
      const res = await fetch(`${BRIDGE_URL}/extract-prompt`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageUrl })
      });
      if (res.ok) {
        return await res.json();
      }
    } catch {
      // Extraction offline
    }
    return {
      prompt: '',
      model: 'Higgsfield Soul 2.0',
      aspectRatio: '3:4'
    };
  },

  async generate(payload: {
    prompt: string;
    model?: string;
    soulId?: string;
    aspectRatio?: string;
    referenceImage?: string;
  }): Promise<VaultItem> {
    try {
      const res = await fetch(`${BRIDGE_URL}/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        const data = await res.json();
        return data.item;
      }
    } catch {
      // offline
    }

    return {
      id: `gen-${Date.now()}`,
      author: {
        username: 'baha@bahasavage.com',
        role: 'Creator',
        avatarUrl: payload.referenceImage || '/icons/icon128.png'
      },
      title: payload.prompt.slice(0, 40) + '...',
      prompt: payload.prompt,
      referenceImage: payload.referenceImage || '',
      imageUrl: payload.referenceImage || '',
      model: 'Higgsfield Soul 2.0',
      jobType: 'text2image_soul_v2',
      moodboard: 'General',
      quality: '1080p',
      size: '1536x2048',
      aspectRatio: payload.aspectRatio || '3:4',
      createdAt: 'Just now',
      timestamp: Date.now(),
      likes: 0,
      isLiked: false
    };
  }
};
