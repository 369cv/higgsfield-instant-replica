export interface Author {
  username: string;
  role: string;
  avatarUrl: string;
}

export interface VaultItem {
  id: string;
  author: Author;
  title: string;
  prompt: string;
  category?: string;
  referenceImage: string;
  imageUrl: string;
  fullImageUrl?: string;
  videoUrl?: string;
  isVideo?: boolean;
  model: string;
  jobType: string;
  moodboard: string;
  quality: string;
  size: string;
  aspectRatio: string;
  createdAt: string;
  timestamp: number;
  likes: number;
  isLiked: boolean;
}

export interface SoulCharacter {
  id: string;
  name: string;
  type: string;
  avatarUrl: string;
}

export interface AccountInfo {
  email: string;
  plan: string;
  credits: number;
  workspace: string;
}

export type LayoutMode = 'square' | 'masonry';

export interface ViewSettings {
  layout: LayoutMode;
  splitByDate: boolean;
  cardSize: number; // 1 to 4
}

export interface StudioHeadshot {
  id: string;
  title: string;
  imageUrl: string;
  lighting: string;
  angle: string;
  background: string;
  createdAt: string;
}

export interface StoredInfluencer {
  id: string;
  name: string;
  instagramHandle?: string;
  referenceImage: string;
  sampleImageUrl: string;
  headshotImage?: string;
  category: string;
  ethnicity: string;
  hair: string;
  age?: number;
  dropsCount: number;
  associatedDropIds?: string[];
  signaturePrompt: string;
  fullPrompt?: string;
  createdAt: string;
  isVaultPreset: boolean;
}
