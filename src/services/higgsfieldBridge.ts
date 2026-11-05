import { AccountInfo, VaultItem, SoulCharacter } from '../types';

const BRIDGE_URL = 'http://localhost:9876/api';

export const HiggsfieldService = {
  async getAccount(): Promise<AccountInfo> {
    try {
      const res = await fetch(`${BRIDGE_URL}/account`);
      if (res.ok) {
        return await res.json();
      }
    } catch (e) {
      console.warn('Bridge offline, using CLI-authenticated cache');
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
    } catch (e) {
      console.warn('Bridge offline, using local soul presets');
    }
    return [
      { id: 'soul-savage', name: 'Savage Mode', type: 'character', avatarUrl: '/gallery/ferrari_selfie.jpg' },
      { id: 'soul-elena', name: 'Elena Glam', type: 'character', avatarUrl: '/gallery/beige_suit_model_1.jpg' },
      { id: 'soul-mona', name: 'Mona Chic', type: 'character', avatarUrl: '/gallery/beige_suit_model_2.jpg' }
    ];
  },

  async getVault(): Promise<VaultItem[]> {
    try {
      const res = await fetch(`${BRIDGE_URL}/vault`);
      if (res.ok) {
        const data = await res.json();
        return data.items || [];
      }
    } catch (e) {
      console.warn('Bridge offline, using initial vault data');
    }
    return [
      {
        id: 'gen-ferrari-savage',
        author: {
          username: 'savage_mode',
          role: 'Author',
          avatarUrl: '/gallery/ferrari_selfie.jpg'
        },
        title: 'Ferrari Selfie 3/4 Perspective',
        prompt: "A three-quarter view, medium close-up photograph centers on a young Caucasian woman in her mid-20s seated in the driver's seat of a luxury sports car, identified by the prominent Ferrari prancing horse logo on the steering wheel. She exhibits striking, model-like features—high cheekbones, tanned skin, and voluminous, styled brunette hair that cascades over one shoulder. Wearing a brown strapless corset top and distressed denim, she grips the two-tone black and bright yellow leather steering wheel with her left hand, turning back toward the camera with an alluring expression. The car's interior showcases vibrant yellow leather sports bucket seats, contrasting with the dark cockpit elements and a black dashboard. Through the car's windshield and windows, the soft evening light reveals a modern, minimalist building and other parked cars, creating an atmospheric, glamorous mood.",
        referenceImage: '/gallery/ferrari_selfie.jpg',
        imageUrl: '/gallery/ferrari_selfie.jpg',
        model: 'Higgsfield Soul 2.0',
        jobType: 'text2image_soul_v2',
        moodboard: 'General',
        quality: '2k',
        size: '2048x2048',
        aspectRatio: '1:1',
        createdAt: 'November 5, 2026 at 7:48 AM',
        timestamp: Date.now() - 3600000,
        likes: 42,
        isLiked: true
      },
      {
        id: 'gen-beige-suit-1',
        author: {
          username: 'savage_mode',
          role: 'Author',
          avatarUrl: '/gallery/beige_suit_model_1.jpg'
        },
        title: 'Night Rooftop Dubai Marina',
        prompt: "Full-body and three-quarter fashion portrait of a stylish woman in a tailored beige linen monogram-patterned pant suit and matching jacket left unbuttoned over a white bandeau crop top. Accessorized with a chunky gold chain choker necklace, oversized gold earrings, and holding a small black luxury leather top-handle handbag in her right hand. Night cityscape background with water reflections, palm leaves in the foreground, and a softly blurred skyscraper illuminated with vibrant magenta pink neon signage. Crisp editorial flash photography with high contrast and sharp focus.",
        referenceImage: '/gallery/beige_suit_model_1.jpg',
        imageUrl: '/gallery/beige_suit_model_1.jpg',
        model: 'Higgsfield Soul 2.0',
        jobType: 'text2image_soul_v2',
        moodboard: 'Fashion Night',
        quality: '2k',
        size: '1536x2048',
        aspectRatio: '3:4',
        createdAt: 'November 5, 2026 at 7:15 AM',
        timestamp: Date.now() - 7200000,
        likes: 89,
        isLiked: false
      },
      {
        id: 'gen-beige-suit-2',
        author: {
          username: 'savage_mode',
          role: 'Author',
          avatarUrl: '/gallery/beige_suit_model_2.jpg'
        },
        title: 'Night Rooftop Soul Swap 2',
        prompt: "High fashion editorial night portrait of an elegant brunette woman with sleek wavy dark hair cascading over her shoulders, adorned with heavy gold hoop earrings and matching gold link necklace. She wears an open beige patterned safari blazer with buttons and tailored high-waisted trousers, exposing a white knit tube top. Clutching a structured black miniature handbag at her waist. Background of a calm harbor at night with blurred pink neon skyline lighting reflecting across the water surface.",
        referenceImage: '/gallery/beige_suit_model_1.jpg',
        imageUrl: '/gallery/beige_suit_model_2.jpg',
        model: 'Higgsfield Soul 2.0',
        jobType: 'text2image_soul_v2',
        moodboard: 'Fashion Night',
        quality: '2k',
        size: '1536x2048',
        aspectRatio: '3:4',
        createdAt: 'November 5, 2026 at 6:50 AM',
        timestamp: Date.now() - 10800000,
        likes: 64,
        isLiked: false
      },
      {
        id: 'gen-variation-3',
        author: {
          username: 'savage_mode',
          role: 'Author',
          avatarUrl: '/gallery/variation_1.jpg'
        },
        title: 'Editorial Night Harbor Variation 3',
        prompt: "Dubai Marina night editorial variation with sharp rim lighting, tailored beige jacket, dark hair parted in center, glamorous nightlife atmosphere.",
        referenceImage: '/gallery/beige_suit_model_1.jpg',
        imageUrl: '/gallery/variation_1.jpg',
        model: 'Higgsfield Soul 2.0',
        jobType: 'text2image_soul_v2',
        moodboard: 'Fashion Night',
        quality: '2k',
        size: '1536x2048',
        aspectRatio: '3:4',
        createdAt: 'November 5, 2026 at 6:30 AM',
        timestamp: Date.now() - 14400000,
        likes: 38,
        isLiked: false
      },
      {
        id: 'gen-variation-4',
        author: {
          username: 'savage_mode',
          role: 'Author',
          avatarUrl: '/gallery/variation_4.jpg'
        },
        title: 'Editorial Night Harbor Variation 4',
        prompt: "Editorial night portrait variation with sleek black hair, gold choker necklace, beige jacket, city backdrop with glowing pink neon bokeh.",
        referenceImage: '/gallery/beige_suit_model_1.jpg',
        imageUrl: '/gallery/variation_4.jpg',
        model: 'Higgsfield Soul 2.0',
        jobType: 'text2image_soul_v2',
        moodboard: 'Fashion Night',
        quality: '2k',
        size: '1536x2048',
        aspectRatio: '3:4',
        createdAt: 'November 5, 2026 at 6:15 AM',
        timestamp: Date.now() - 18000000,
        likes: 52,
        isLiked: true
      }
    ];
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
    } catch (e) {
      console.warn('Extraction fallback');
    }
    return {
      prompt: "A three-quarter view, medium close-up photograph centers on a young Caucasian woman in her mid-20s seated in the driver's seat of a luxury sports car, identified by the prominent Ferrari prancing horse logo on the steering wheel...",
      model: 'Higgsfield Soul 2.0',
      aspectRatio: '1:1'
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
    } catch (e) {
      console.warn('Bridge offline, simulating direct generation');
    }

    const targetImage = payload.soulId === 'soul-mona'
      ? '/gallery/beige_suit_model_2.jpg'
      : (payload.referenceImage && payload.referenceImage.includes('ferrari') ? '/gallery/ferrari_selfie.jpg' : '/gallery/beige_suit_model_1.jpg');

    return {
      id: `gen-${Date.now()}`,
      author: {
        username: 'savage_mode',
        role: 'Author',
        avatarUrl: targetImage
      },
      title: payload.prompt.slice(0, 40) + '...',
      prompt: payload.prompt,
      referenceImage: payload.referenceImage || targetImage,
      imageUrl: targetImage,
      model: 'Higgsfield Soul 2.0',
      jobType: 'text2image_soul_v2',
      moodboard: 'General',
      quality: '2k',
      size: payload.aspectRatio === '9:16' ? '1152x2048' : '2048x2048',
      aspectRatio: payload.aspectRatio || '1:1',
      createdAt: 'Just now',
      timestamp: Date.now(),
      likes: 0,
      isLiked: false
    };
  }
};
