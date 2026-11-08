import React, { useState } from 'react';
import { NicheCategory } from '../utils/categorizationFramework';

export interface ClassificationFilters {
  niche: string;
  searchChat: string;
  aspectRatio: string;
  lighting: string;
  shotType: string;
}

interface PromptsNicheSubheaderProps {
  selectedCategory: string;
  onSelectCategory: (category: string) => void;
  filters: ClassificationFilters;
  onUpdateFilters: (filters: Partial<ClassificationFilters>) => void;
  onResetFilters: () => void;
  totalFilteredCount?: number;
  totalCount?: number;
}

export const PromptsNicheSubheader: React.FC<PromptsNicheSubheaderProps> = ({
  selectedCategory,
  onSelectCategory,
  filters,
  onUpdateFilters,
  onResetFilters,
  totalFilteredCount = 1604,
  totalCount = 1604,
}) => {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const niches = [
    { id: 'All', label: 'All' },
    { id: 'Luxury & Lifestyle', label: 'Luxury & Lifestyle' },
    { id: 'Fashion & Editorial', label: 'Fashion & Editorial' },
    { id: 'Fitness & Wellness', label: 'Fitness & Wellness' },
    { id: 'Nightlife & Flash', label: 'Nightlife & Flash' },
    { id: 'Travel & Resort', label: 'Travel & Resort' },
    { id: 'Streetwear & Urban', label: 'Streetwear & Urban' },
    { id: 'Modest & Silk', label: 'Modest & Silk' },
    { id: 'Beauty & Glamour', label: 'Beauty & Glamour' },
  ];

  // Calculate active filter count
  const activeFiltersCount =
    (filters.searchChat ? 1 : 0) +
    (filters.aspectRatio !== 'All' ? 1 : 0) +
    (filters.lighting !== 'All' ? 1 : 0) +
    (filters.shotType !== 'All' ? 1 : 0);

  return (
    <div className="w-full bg-[#0a0a0d] border-b border-white/10 shrink-0 select-none z-30 transition-all flex flex-col">
      {/* Primary Subheader Bar */}
      <div className="px-4 sm:px-6 py-2.5 flex items-center justify-between gap-3">
        {/* Scrollable Niche Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar scroll-smooth py-0.5">
          {niches.map((niche) => {
            const isActive =
              (niche.id === 'All' &&
                (!selectedCategory ||
                  selectedCategory === 'All' ||
                  selectedCategory === 'All Drops')) ||
              selectedCategory.toLowerCase() === niche.label.toLowerCase();

            return (
              <button
                key={niche.id}
                onClick={() => onSelectCategory(niche.id === 'All' ? 'All' : niche.label)}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all cursor-pointer ${
                  isActive
                    ? 'bg-[#d1fe17] text-black font-bold shadow-[0_0_15px_rgba(209,254,23,0.25)]'
                    : 'bg-white/[0.04] text-neutral-400 hover:text-white hover:bg-white/[0.08] border border-white/5'
                }`}
              >
                {niche.label}
              </button>
            );
          })}
        </div>

        {/* Right Tools: Expandable Filter Drawer Button */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => setIsDrawerOpen(!isDrawerOpen)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              isDrawerOpen || activeFiltersCount > 0
                ? 'bg-white/15 text-white border border-white/20 shadow'
                : 'bg-white/[0.04] text-neutral-400 hover:text-white border border-white/5'
            }`}
          >
            <svg className="w-3.5 h-3.5 text-[#d1fe17]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="4" y1="21" x2="4" y2="14" />
              <line x1="4" y1="10" x2="4" y2="3" />
              <line x1="12" y1="21" x2="12" y2="12" />
              <line x1="12" y1="8" x2="12" y2="3" />
              <line x1="20" y1="21" x2="20" y2="16" />
              <line x1="20" y1="12" x2="20" y2="3" />
              <line x1="1" y1="14" x2="7" y2="14" />
              <line x1="9" y1="8" x2="15" y2="8" />
              <line x1="17" y1="16" x2="23" y2="16" />
            </svg>
            <span className="hidden sm:inline">Classification Filter</span>
            <span className="sm:hidden">Filter</span>
            {activeFiltersCount > 0 && (
              <span className="w-4 h-4 rounded-full bg-[#d1fe17] text-black text-[9px] font-black flex items-center justify-center">
                {activeFiltersCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Expandable Classification & Search Chat Panel */}
      {isDrawerOpen && (
        <div className="border-t border-white/10 bg-[#0d0d12] p-4 sm:px-6 space-y-4 animate-fade-in shadow-2xl">
          {/* Row 1: Search Chat / Semantic Query */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-1.5 font-bold text-white">
                <svg className="w-3.5 h-3.5 text-[#d1fe17]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                </svg>
                <span>Search Chat (Natural Language Filter)</span>
              </div>
              <span className="text-[10px] text-neutral-400 font-mono">
                Showing {totalFilteredCount} of {totalCount} drops
              </span>
            </div>

            <div className="relative">
              <input
                type="text"
                value={filters.searchChat}
                onChange={(e) => onUpdateFilters({ searchChat: e.target.value })}
                placeholder="Ask or search: e.g. 'silk abaya at sunset', 'gym mirror flash', 'poolside cocktail dress'..."
                className="w-full bg-white/[0.04] border border-white/10 rounded-2xl px-4 py-2.5 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-[#d1fe17] pr-20"
              />
              {filters.searchChat && (
                <button
                  onClick={() => onUpdateFilters({ searchChat: '' })}
                  className="absolute right-3 top-2.5 text-xs text-neutral-400 hover:text-white"
                >
                  Clear
                </button>
              )}
            </div>
          </div>

          {/* Row 2: Specific Classification Attributes */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1 text-xs">
            {/* Aspect Ratio */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-semibold text-neutral-300">
                Aspect Ratio
              </label>
              <div className="grid grid-cols-3 gap-1.5">
                {['All', '3:4', '1:1', '16:9', '9:16'].map((ratio) => (
                  <button
                    key={ratio}
                    onClick={() => onUpdateFilters({ aspectRatio: ratio })}
                    className={`py-1.5 px-2 rounded-xl text-xs font-medium cursor-pointer transition-all ${
                      filters.aspectRatio === ratio
                        ? 'bg-[#d1fe17] text-black font-bold'
                        : 'bg-white/5 text-neutral-400 hover:text-white'
                    }`}
                  >
                    {ratio === 'All' ? 'All Ratios' : ratio}
                  </button>
                ))}
              </div>
            </div>

            {/* Lighting Classification */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-semibold text-neutral-300">
                Lighting Classification
              </label>
              <div className="grid grid-cols-2 gap-1.5">
                {[
                  { id: 'All', label: 'All Lighting' },
                  { id: 'flash', label: '35mm Direct Flash' },
                  { id: 'golden', label: 'Golden Hour' },
                  { id: 'softbox', label: 'Studio Softbox' },
                  { id: 'sun', label: 'Natural Sunlight' },
                ].map((lt) => (
                  <button
                    key={lt.id}
                    onClick={() => onUpdateFilters({ lighting: lt.id })}
                    className={`py-1.5 px-2 rounded-xl text-left truncate text-xs font-medium cursor-pointer transition-all ${
                      filters.lighting === lt.id
                        ? 'bg-[#d1fe17] text-black font-bold'
                        : 'bg-white/5 text-neutral-400 hover:text-white'
                    }`}
                  >
                    {lt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Shot Type Classification */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-semibold text-neutral-300">
                Shot Type / Framing
              </label>
              <div className="grid grid-cols-2 gap-1.5">
                {[
                  { id: 'All', label: 'All Framing' },
                  { id: 'portrait', label: 'Close-Up Portrait' },
                  { id: 'full-body', label: 'Full-Body' },
                  { id: 'selfie', label: 'Mirror Selfie' },
                  { id: 'medium', label: 'Medium Studio' },
                ].map((st) => (
                  <button
                    key={st.id}
                    onClick={() => onUpdateFilters({ shotType: st.id })}
                    className={`py-1.5 px-2 rounded-xl text-left truncate text-xs font-medium cursor-pointer transition-all ${
                      filters.shotType === st.id
                        ? 'bg-[#d1fe17] text-black font-bold'
                        : 'bg-white/5 text-neutral-400 hover:text-white'
                    }`}
                  >
                    {st.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Filter Footer Actions */}
          <div className="flex items-center justify-between pt-2 border-t border-white/5 text-xs">
            <span className="text-neutral-400 text-[11px]">
              Influencer Identity: <span className="text-white font-semibold">Gabriela Sanchez (@gabrielasanchezs)</span>
            </span>

            <div className="flex items-center gap-2">
              {activeFiltersCount > 0 && (
                <button
                  onClick={onResetFilters}
                  className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-neutral-300 hover:text-white transition-colors cursor-pointer"
                >
                  Reset Filters
                </button>
              )}
              <button
                onClick={() => setIsDrawerOpen(false)}
                className="px-4 py-1.5 rounded-xl bg-[#d1fe17] text-black font-bold transition-transform hover:scale-105 active:scale-95 cursor-pointer shadow"
              >
                Apply Filters
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
