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
  referenceImage: string;
  imageUrl: string;
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
