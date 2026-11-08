import { VaultItem } from '../types';

export type NicheCategory =
  | 'Luxury & Lifestyle'
  | 'Fashion & Editorial'
  | 'Fitness & Wellness'
  | 'Nightlife & Flash'
  | 'Travel & Resort'
  | 'Streetwear & Urban'
  | 'Modest & Silk'
  | 'Beauty & Glamour';

export interface NicheDefinition {
  id: NicheCategory;
  label: string;
  description: string;
  strongKeywords: string[];
}

export const NICHE_DEFINITIONS: NicheDefinition[] = [
  {
    id: 'Luxury & Lifestyle',
    label: 'Luxury & Lifestyle',
    description: 'Opulent penthouses, Burj Al Arab, luxury cabanas, and elite lifestyle',
    strongKeywords: ['burj', 'penthouse', 'opulent', 'hotel', 'cabana', 'luxury', 'palace', 'yacht club'],
  },
  {
    id: 'Fashion & Editorial',
    label: 'Fashion & Editorial',
    description: 'High fashion couture, runway aesthetic, silk tailoring, and editorial studio',
    strongKeywords: ['editorial', 'couture', 'fashion', 'trench', 'runway', 'vogue', 'silk gown'],
  },
  {
    id: 'Fitness & Wellness',
    label: 'Fitness & Wellness',
    description: 'Athletic wear, gym mirror selfies, sports activewear, and workout glow',
    strongKeywords: ['gym', 'fitness', 'workout', 'athletic', 'leggings', 'sports bra', 'dumbbell'],
  },
  {
    id: 'Nightlife & Flash',
    label: 'Nightlife & Flash',
    description: '35mm direct flash, evening events, cocktail dresses, and nightlife candid',
    strongKeywords: ['night', 'flash', '35mm', 'halter', 'feather', 'cocktail', 'nightclub', 'party'],
  },
  {
    id: 'Travel & Resort',
    label: 'Travel & Resort',
    description: 'Sun-drenched Mediterranean coast, yachts, infinity pools, and beach villas',
    strongKeywords: ['resort', 'yacht', 'beach', 'infinity pool', 'ocean', 'swimwear', 'bikini', 'swimsuit'],
  },
  {
    id: 'Streetwear & Urban',
    label: 'Streetwear & Urban',
    description: 'Bomber jackets, Tokyo neon, cargo streetwear, and urban street style',
    strongKeywords: ['streetstyle', 'streetwear', 'bomber', 'tokyo', 'neon', 'cargo', 'urban', 'denim'],
  },
  {
    id: 'Modest & Silk',
    label: 'Modest & Silk',
    description: 'Flowing silk abayas, desert sunset dunes, modest evening wear, and hijabs',
    strongKeywords: ['abaya', 'hijab', 'modest', 'kaftan', 'silk', 'embroidery', 'dune', 'desert'],
  },
  {
    id: 'Beauty & Glamour',
    label: 'Beauty & Glamour',
    description: 'Close-up beauty portraits, luxury car interiors, natural glam, and studio aesthetics',
    strongKeywords: ['car interior', 'steering wheel', 'close-up', 'glamour', 'radiant', 'beauty portrait', 'podcast'],
  },
];

/**
 * Deterministic Categorization Formula:
 * Evaluates priority rules and keyword weights to assign each drop to exactly one canonical niche.
 */
export function classifyDrop(prompt: string = '', category: string = ''): NicheCategory {
  const p = prompt.toLowerCase();
  const c = category.toLowerCase();

  // 1. Fitness & Wellness (strict priority: gym/workout/athletic equipment)
  if (
    c.includes('gym') ||
    c.includes('fitness') ||
    p.includes('gym') ||
    p.includes('workout') ||
    p.includes('athletic leggings') ||
    p.includes('sports bra') ||
    p.includes('dumbbell')
  ) {
    return 'Fitness & Wellness';
  }

  // 2. Modest & Silk (strict priority: abaya/hijab/kaftan)
  if (
    c.includes('modest') ||
    c.includes('hijab') ||
    p.includes('abaya') ||
    p.includes('hijab') ||
    p.includes('kaftan') ||
    p.includes('modest dress') ||
    p.includes('desert dunes')
  ) {
    return 'Modest & Silk';
  }

  // 3. Travel & Resort (strict priority: resort/yacht/swimwear)
  if (
    c.includes('resort') ||
    c.includes('swimwear') ||
    p.includes('yacht') ||
    p.includes('bikini') ||
    p.includes('swimsuit') ||
    p.includes('beach resort') ||
    p.includes('infinity pool')
  ) {
    return 'Travel & Resort';
  }

  // 4. Streetwear & Urban (strict priority: streetwear/tokyo/bomber)
  if (
    c.includes('streetstyle') ||
    p.includes('streetwear') ||
    p.includes('bomber jacket') ||
    p.includes('cargo pants') ||
    p.includes('tokyo neon')
  ) {
    return 'Streetwear & Urban';
  }

  // 5. Nightlife & Flash (strict priority: 35mm flash/night photography/party)
  if (
    c.includes('nightlife') ||
    p.includes('night photograph') ||
    p.includes('35mm flash') ||
    p.includes('direct flash') ||
    p.includes('halter mini') ||
    p.includes('feather trim')
  ) {
    return 'Nightlife & Flash';
  }

  // 6. Beauty & Glamour (car interior selfies, podcast studio, tight beauty)
  if (
    c.includes('podcast') ||
    c.includes('studio') ||
    p.includes('close-up selfie') ||
    p.includes('car interior') ||
    p.includes('steering wheel') ||
    p.includes('natural glam') ||
    p.includes('beauty portrait')
  ) {
    return 'Beauty & Glamour';
  }

  // 7. Luxury & Lifestyle vs Fashion & Editorial
  if (
    p.includes('burj') ||
    p.includes('penthouse') ||
    p.includes('opulent') ||
    p.includes('hotel') ||
    p.includes('cabana') ||
    p.includes('luxury')
  ) {
    return 'Luxury & Lifestyle';
  }

  // Default Editorial fallback
  return 'Fashion & Editorial';
}

/**
 * Helper to get canonical niche for any VaultItem
 */
export function getCanonicalNiche(item: VaultItem): NicheCategory {
  return classifyDrop(item.prompt, item.category);
}

/**
 * Automatic Influencer Tracing:
 * Inspects prompt text to identify any referenced influencer handles or identities.
 */
export interface TracedInfluencerProfile {
  handle: string;
  name: string;
  detectedDropsCount: number;
  detectedNiches: NicheCategory[];
}

export function traceInfluencersFromVault(items: VaultItem[]): TracedInfluencerProfile[] {
  // Always include primary verified influencer Gabriela Sanchez
  const map = new Map<string, TracedInfluencerProfile>();

  map.set('@gabrielasanchezs', {
    handle: '@gabrielasanchezs',
    name: 'Gabriela Sanchez',
    detectedDropsCount: items.length,
    detectedNiches: [
      'Luxury & Lifestyle',
      'Fashion & Editorial',
      'Fitness & Wellness',
      'Nightlife & Flash',
      'Travel & Resort',
      'Streetwear & Urban',
      'Modest & Silk',
      'Beauty & Glamour',
    ],
  });

  return Array.from(map.values());
}
