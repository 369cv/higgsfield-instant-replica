/**
 * Search popup content. Edit this file to decide what appears in the search popup.
 *
 * - `categories` set the vault's category filter (must match the niche labels
 *   in PromptsNicheSubheader / categorizationFramework).
 * - `styles` run a keyword search across every prompt.
 * - `comingSoon` render as locked rows (no action).
 */

export interface SearchCategory {
  label: string; // must match a niche label exactly
  hint: string;
}

export interface SearchStyle {
  label: string;
  query: string; // keyword(s) matched against prompt text
}

export interface ComingSoonItem {
  label: string;
  hint: string;
}

export const SEARCH_CATEGORIES: SearchCategory[] = [
  { label: 'Luxury & Lifestyle', hint: 'Penthouses, yachts, supercars' },
  { label: 'Fashion & Editorial', hint: 'Runway and magazine looks' },
  { label: 'Fitness & Wellness', hint: 'Gym, pilates, active wear' },
  { label: 'Nightlife & Flash', hint: '35mm flash, after dark' },
  { label: 'Travel & Resort', hint: 'Beaches, resorts, destinations' },
  { label: 'Streetwear & Urban', hint: 'City streets, sneakers' },
  { label: 'Modest & Silk', hint: 'Abayas, silk, modest fashion' },
  { label: 'Beauty & Glamour', hint: 'Close-up beauty and makeup' },
];

export const SEARCH_STYLES: SearchStyle[] = [
  { label: 'Golden hour', query: 'golden' },
  { label: 'Direct flash', query: 'flash' },
  { label: 'Mirror selfie', query: 'selfie' },
  { label: 'Full body', query: 'full-body' },
  { label: 'Close-up', query: 'close-up' },
  { label: 'Studio', query: 'studio' },
  { label: 'Night', query: 'night' },
  { label: 'Dubai', query: 'dubai' },
];

export const SEARCH_COMING_SOON: ComingSoonItem[] = [
  { label: 'Motion prompts', hint: 'Video prompts for every drop' },
  { label: 'Moodboards', hint: 'Curated style boards' },
  { label: 'Cinema Studio', hint: 'Shot-by-shot cinematic prompts' },
];

export const RECENT_SEARCHES_KEY = 'vault_recent_searches_v1';
