import { useSyncExternalStore } from 'react';

/**
 * App settings + lightweight local stats, persisted in localStorage.
 * One small external store so every component reads the same values.
 */

export type ThemePref = 'system' | 'light' | 'dark';
export type GridDensity = 'comfortable' | 'compact';

export interface Settings {
  theme: ThemePref;
  reduceMotion: boolean;
  gridDensity: GridDensity;
  displayName: string;
  avatarHue: number; // 0-359, tints the initials avatar
}

export interface Stats {
  copies: number;
  streak: number;
  lastActiveDay: string; // YYYY-MM-DD
  memberSince: string; // YYYY-MM-DD
}

const KEYS = {
  theme: 'app_theme_v1',
  reduceMotion: 'app_reduce_motion_v1',
  gridDensity: 'app_grid_density_v1',
  displayName: 'app_display_name_v1',
  avatarHue: 'app_avatar_hue_v1',
  stats: 'app_stats_v1',
};

const today = () => new Date().toISOString().slice(0, 10);

function read(key: string): string | null {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}
function write(key: string, value: string) {
  try {
    localStorage.setItem(key, value);
  } catch {
    // storage unavailable (private mode)
  }
}

function loadSettings(): Settings {
  const theme = read(KEYS.theme);
  const density = read(KEYS.gridDensity);
  const hue = Number(read(KEYS.avatarHue));
  return {
    theme: theme === 'light' || theme === 'dark' ? theme : 'system',
    reduceMotion: read(KEYS.reduceMotion) === 'true',
    gridDensity: density === 'compact' ? 'compact' : 'comfortable',
    displayName: read(KEYS.displayName) || '',
    avatarHue: Number.isFinite(hue) && read(KEYS.avatarHue) !== null ? hue : 275,
  };
}

function loadStats(): Stats {
  let s: Stats = { copies: 0, streak: 1, lastActiveDay: today(), memberSince: today() };
  try {
    const raw = read(KEYS.stats);
    if (raw) s = { ...s, ...JSON.parse(raw) };
  } catch {
    // ignore
  }
  // Daily streak: consecutive days the app was opened.
  const t = today();
  if (s.lastActiveDay !== t) {
    const diff = Math.round((Date.parse(t) - Date.parse(s.lastActiveDay)) / 86400000);
    s = { ...s, streak: diff === 1 ? s.streak + 1 : 1, lastActiveDay: t };
    write(KEYS.stats, JSON.stringify(s));
  } else if (!read(KEYS.stats)) {
    write(KEYS.stats, JSON.stringify(s));
  }
  return s;
}

let settings = loadSettings();
let stats = loadStats();
const listeners = new Set<() => void>();
const emit = () => listeners.forEach((l) => l());
const subscribe = (l: () => void) => {
  listeners.add(l);
  return () => listeners.delete(l);
};

/* ---------- Theme application ---------- */

const darkQuery = typeof window !== 'undefined' ? window.matchMedia('(prefers-color-scheme: dark)') : null;

export function resolveTheme(pref: ThemePref): 'light' | 'dark' {
  if (pref === 'system') return darkQuery?.matches ? 'dark' : 'light';
  return pref;
}

function applyTheme() {
  if (typeof document === 'undefined') return;
  const resolved = resolveTheme(settings.theme);
  const root = document.documentElement;
  root.setAttribute('data-theme', resolved);
  root.setAttribute('data-reduce-motion', String(settings.reduceMotion));
  const meta = document.querySelector('meta[name="theme-color"]');
  meta?.setAttribute('content', resolved === 'dark' ? '#070709' : '#ffffff');
  const status = document.querySelector('meta[name="apple-mobile-web-app-status-bar-style"]');
  status?.setAttribute('content', resolved === 'dark' ? 'black-translucent' : 'default');
}

darkQuery?.addEventListener?.('change', () => {
  if (settings.theme === 'system') {
    applyTheme();
    emit();
  }
});
applyTheme();

/* ---------- Public API ---------- */

export function updateSettings(patch: Partial<Settings>) {
  settings = { ...settings, ...patch };
  if (patch.theme !== undefined) write(KEYS.theme, settings.theme);
  if (patch.reduceMotion !== undefined) write(KEYS.reduceMotion, String(settings.reduceMotion));
  if (patch.gridDensity !== undefined) write(KEYS.gridDensity, settings.gridDensity);
  if (patch.displayName !== undefined) write(KEYS.displayName, settings.displayName);
  if (patch.avatarHue !== undefined) write(KEYS.avatarHue, String(settings.avatarHue));
  applyTheme();
  emit();
}

export function recordCopy() {
  stats = { ...stats, copies: stats.copies + 1 };
  write(KEYS.stats, JSON.stringify(stats));
  emit();
}

export function useSettings(): Settings {
  return useSyncExternalStore(subscribe, () => settings);
}

export function useStats(): Stats {
  return useSyncExternalStore(subscribe, () => stats);
}

/** Re-renders when the OS appearance changes while on "system". */
export function useResolvedTheme(): 'light' | 'dark' {
  const s = useSettings();
  return useSyncExternalStore(subscribe, () => resolveTheme(s.theme));
}

/** Wipe all locally stored app data (settings, saved prompts, history) and reload. */
export function resetAllLocalData() {
  try {
    localStorage.clear();
  } catch {
    // ignore
  }
  window.location.reload();
}
