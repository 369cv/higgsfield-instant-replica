import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Search, X, Lock, Clock, ArrowUpRight } from 'lucide-react';
import { VaultItem } from '../types';
import {
  SEARCH_CATEGORIES,
  SEARCH_STYLES,
  SEARCH_COMING_SOON,
  RECENT_SEARCHES_KEY,
} from '../config/search';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  onSelectCategory: (category: string) => void;
  onSelectItem: (item: VaultItem) => void;
  vaultItems: VaultItem[];
}

type Tab = 'All' | 'Categories' | 'Styles' | 'Coming soon';
const TABS: Tab[] = ['All', 'Categories', 'Styles', 'Coming soon'];

function loadRecents(): string[] {
  try {
    const raw = localStorage.getItem(RECENT_SEARCHES_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveRecent(q: string) {
  const clean = q.trim();
  if (!clean) return;
  try {
    const next = [clean, ...loadRecents().filter((r) => r.toLowerCase() !== clean.toLowerCase())].slice(0, 6);
    localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(next));
  } catch {
    // storage unavailable
  }
}

export const SearchModal: React.FC<SearchModalProps> = ({
  isOpen,
  onClose,
  searchQuery,
  onSearchChange,
  onSelectCategory,
  onSelectItem,
  vaultItems,
}) => {
  const [tab, setTab] = useState<Tab>('All');
  const [recents, setRecents] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    setRecents(loadRecents());
    setTimeout(() => inputRef.current?.focus(), 50);
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isOpen, onClose]);

  const matches = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return [];
    return vaultItems.filter((i) => (i.prompt || '').toLowerCase().includes(q));
  }, [searchQuery, vaultItems]);

  if (!isOpen) return null;

  const runSearch = (q: string) => {
    saveRecent(q);
    onSelectCategory('All');
    onSearchChange(q);
    onClose();
  };

  const pickCategory = (label: string) => {
    onSearchChange('');
    onSelectCategory(label);
    onClose();
  };

  const sectionTitle = 'text-[11px] font-bold text-neutral-500 tracking-wider uppercase block mb-2';
  const show = (t: Tab) => tab === 'All' || tab === t;
  const hasQuery = searchQuery.trim().length > 0;

  return (
    <div className="fixed inset-0 z-50 flex items-start sm:items-center justify-center sm:p-4 bg-black/75 backdrop-blur-md">
      <div className="absolute inset-0" onClick={onClose} />

      <div className="relative z-10 w-full sm:max-w-2xl h-[100dvh] sm:h-auto sm:max-h-[85vh] bg-base sm:bg-surface sm:border border-white/15 sm:rounded-3xl px-4 pb-4 pt-[calc(env(safe-area-inset-top)+8px)] sm:p-6 shadow-2xl flex flex-col gap-4 overflow-hidden">
        {/* Search input */}
        <div className="flex items-center gap-3 shrink-0">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            runSearch(searchQuery);
          }}
          className="flex-1 flex items-center bg-white/[0.08] sm:bg-white/5 sm:border border-white/10 rounded-[10px] sm:rounded-2xl px-2.5 sm:px-4 h-9 sm:h-auto sm:py-3 sm:focus-within:border-[#d1fe17] transition-colors"
        >
          <Search className="w-4 h-4 sm:w-5 sm:h-5 text-neutral-400 mr-2 sm:mr-3 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search prompts"
            className="w-full bg-transparent text-[17px] sm:text-sm text-white placeholder-neutral-500 focus:outline-none"
            enterKeyHint="search"
          />
          <button
            type="button"
            onClick={onClose}
            className="hidden sm:flex w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-neutral-300 items-center justify-center shrink-0 cursor-pointer"
            aria-label="Close search"
          >
            <X className="w-4 h-4" />
          </button>
          {searchQuery && (
            <button
              type="button"
              onClick={() => onSearchChange('')}
              className="sm:hidden w-5 h-5 rounded-full bg-white/30 text-black flex items-center justify-center shrink-0"
              aria-label="Clear"
            >
              <X className="w-3 h-3" strokeWidth={3} />
            </button>
          )}
        </form>
        <button
          type="button"
          onClick={onClose}
          className="sm:hidden text-[17px] text-accent-ink active:opacity-50 shrink-0"
        >
          Cancel
        </button>
        </div>

        {/* Live results */}
        {hasQuery && (
          <div className="shrink-0">
            <div className="flex items-center justify-between mb-2">
              <span className={sectionTitle + ' !mb-0'}>
                {matches.length} matching prompt{matches.length === 1 ? '' : 's'}
              </span>
              {matches.length > 0 && (
                <button
                  onClick={() => runSearch(searchQuery)}
                  className="text-[11px] text-accent-ink hover:underline flex items-center gap-1 cursor-pointer"
                >
                  View all <ArrowUpRight className="w-3 h-3" />
                </button>
              )}
            </div>
            <div className="flex gap-2 overflow-x-auto no-scrollbar">
              {matches.slice(0, 12).map((item) => (
                <button
                  key={item.id}
                  onClick={() => {
                    saveRecent(searchQuery);
                    onClose();
                    onSelectItem(item);
                  }}
                  className="w-20 h-28 shrink-0 rounded-xl overflow-hidden bg-white/5 border border-white/10 hover:border-[#d1fe17]/60 cursor-pointer"
                >
                  <img src={item.imageUrl} alt="" loading="lazy" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar text-xs shrink-0">
          {TABS.map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-3 py-1.5 rounded-xl font-medium whitespace-nowrap cursor-pointer border ${
                tab === t
                  ? 'bg-white/15 text-white border-white/20'
                  : 'bg-white/5 hover:bg-white/10 text-neutral-400 border-transparent'
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        <div className="flex-1 min-h-0 overflow-y-auto space-y-6 pr-1">
          {tab === 'All' && recents.length > 0 && (
            <div>
              <span className={sectionTitle}>Recent</span>
              <div className="flex flex-wrap gap-2">
                {recents.map((r) => (
                  <button
                    key={r}
                    onClick={() => runSearch(r)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-xs text-neutral-200 cursor-pointer"
                  >
                    <Clock className="w-3 h-3 text-neutral-500" />
                    {r}
                  </button>
                ))}
              </div>
            </div>
          )}

          {show('Categories') && (
            <div>
              <span className={sectionTitle}>Categories</span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-1">
                {SEARCH_CATEGORIES.map((c) => (
                  <button
                    key={c.label}
                    onClick={() => pickCategory(c.label)}
                    className="text-left p-2.5 rounded-xl hover:bg-white/5 group cursor-pointer"
                  >
                    <div className="text-[13px] font-semibold text-white group-hover:text-accent-ink">{c.label}</div>
                    <div className="text-[11px] text-neutral-400">{c.hint}</div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {show('Styles') && (
            <div>
              <span className={sectionTitle}>Styles</span>
              <div className="flex flex-wrap gap-2">
                {SEARCH_STYLES.map((s) => (
                  <button
                    key={s.label}
                    onClick={() => runSearch(s.query)}
                    className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-[#d1fe17] hover:text-black text-xs font-medium text-neutral-200 cursor-pointer transition-colors"
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {show('Coming soon') && (
            <div>
              <span className={sectionTitle}>Unlocking soon</span>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                {SEARCH_COMING_SOON.map((c) => (
                  <div
                    key={c.label}
                    className="p-3 rounded-2xl bg-white/[0.03] border border-white/10 flex items-start gap-2.5 opacity-80"
                  >
                    <Lock className="w-4 h-4 text-accent-ink mt-0.5 shrink-0" />
                    <div>
                      <div className="text-[13px] font-semibold text-white">{c.label}</div>
                      <div className="text-[11px] text-neutral-400">{c.hint}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
