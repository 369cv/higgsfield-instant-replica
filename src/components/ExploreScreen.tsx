import React from 'react';
import { VaultItem } from '../types';

interface ExploreScreenProps {
  vaultItems?: VaultItem[];
  onSelectItem?: (item: VaultItem) => void;
  onReturnToVault?: () => void;
}

export const ExploreScreen: React.FC<ExploreScreenProps> = ({
  vaultItems = [],
  onSelectItem,
  onReturnToVault,
}) => {
  const channels = [
    {
      id: 'ch-1',
      title: 'Editorial & Haute Couture',
      subtitle: 'Silk, high-fashion tailoring, and Paris runway aesthetics',
      filter: (item: VaultItem) => {
        const p = (item.prompt || '').toLowerCase();
        return p.includes('editorial') || p.includes('couture') || p.includes('silk') || p.includes('trench');
      },
    },
    {
      id: 'ch-2',
      title: 'Cinematic Stills & Narrative',
      subtitle: 'Moody chiaroscuro, 35mm film grain, and night atmospheres',
      filter: (item: VaultItem) => {
        const p = (item.prompt || '').toLowerCase();
        return p.includes('cinematic') || p.includes('ferrari') || p.includes('night') || p.includes('flash');
      },
    },
    {
      id: 'ch-3',
      title: 'Global Architecture & Penthouse',
      subtitle: 'Modernist stone columns, luxury marble suites, and rooftop lounges',
      filter: (item: VaultItem) => {
        const p = (item.prompt || '').toLowerCase();
        return p.includes('penthouse') || p.includes('marble') || p.includes('columns') || p.includes('modern');
      },
    },
    {
      id: 'ch-4',
      title: 'High-Speed Commercial & Automotive',
      subtitle: 'Supercar glamour, dihedral doors, and dynamic studio lighting',
      filter: (item: VaultItem) => {
        const p = (item.prompt || '').toLowerCase();
        return p.includes('mclaren') || p.includes('car') || p.includes('automotive') || p.includes('glamour');
      },
    },
  ];

  return (
    <div className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 py-10 flex flex-col min-h-[calc(100vh-4rem)] select-none">
      {/* Header Info */}
      <div className="flex flex-col items-center justify-center text-center pb-8 border-b border-white/10">
        <div className="w-14 h-14 rounded-2xl bg-white/[0.03] border border-white/10 flex items-center justify-center text-neutral-400 mb-3 shadow-lg">
          <svg
            className="w-6 h-6 text-[#d1fe17]"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="12" cy="12" r="10" />
            <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" />
          </svg>
        </div>

        <h2 className="text-2xl sm:text-3xl font-black text-white uppercase tracking-tight">
          Curated Explore Hub
        </h2>
        <p className="text-xs sm:text-sm text-neutral-400 max-w-lg mt-2 leading-relaxed">
          Discover hand-curated editorial channels, cinematic camera trajectories, and signature prompt recipes synced across the studio.
        </p>

        {onReturnToVault && (
          <button
            onClick={onReturnToVault}
            className="mt-5 px-5 py-2.5 rounded-xl bg-[#d1fe17] text-black font-extrabold text-xs shadow-[0_0_20px_rgba(209,254,23,0.3)] hover:scale-105 active:scale-95 transition-all cursor-pointer flex items-center gap-2"
          >
            <span>Browse Full Prompt Vault</span>
            <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-black/15 font-bold">1,604 Drops</span>
          </button>
        )}
      </div>

      {/* Structured Channels Grid */}
      <div className="py-8 space-y-12">
        {channels.map((ch) => {
          const matchedItems = vaultItems.filter(ch.filter).slice(0, 6);
          const hasItems = matchedItems.length > 0;

          return (
            <div key={ch.id} className="space-y-3.5">
              {/* Channel Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 pb-1">
                <div className="flex items-center gap-2.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-[#d1fe17] shadow-[0_0_8px_rgba(209,254,23,0.8)]" />
                  <div>
                    <h3 className="text-sm font-extrabold text-white tracking-wide">
                      {ch.title}
                    </h3>
                    <p className="text-[11px] text-neutral-400">
                      {ch.subtitle}
                    </p>
                  </div>
                </div>
                <span className="text-[10px] text-neutral-500 font-mono tracking-wider uppercase">
                  {hasItems ? `${matchedItems.length} Featured Drops` : 'Awaiting Stream Sync'}
                </span>
              </div>

              {/* Items Grid (3:4 Ratio) */}
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                {hasItems
                  ? matchedItems.map((item) => (
                      <div
                        key={item.id}
                        onClick={() => onSelectItem && onSelectItem(item)}
                        className="group relative aspect-[3/4] rounded-2xl overflow-hidden bg-[#121217] border border-white/10 hover:border-[#d1fe17]/60 transition-all cursor-pointer shadow-lg hover:shadow-[0_0_20px_rgba(209,254,23,0.2)]"
                      >
                        <img
                          src={item.imageUrl || item.fullImageUrl || ''}
                          alt={item.prompt}
                          className="w-full h-full object-cover object-top transition-transform duration-500 group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-transparent to-transparent opacity-80 group-hover:opacity-100 transition-opacity pointer-events-none" />
                        <div className="absolute bottom-2.5 left-2.5 right-2.5 pointer-events-none">
                          <p className="text-[10px] font-semibold text-white line-clamp-2 leading-tight">
                            {item.prompt}
                          </p>
                        </div>
                      </div>
                    ))
                  : [...Array(6)].map((_, idx) => (
                      <div
                        key={idx}
                        className="aspect-[3/4] rounded-2xl bg-white/[0.02] border border-white/5 relative overflow-hidden flex flex-col justify-end p-3"
                      >
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/[0.03] to-transparent animate-pulse" />
                        <div className="w-3/4 h-2.5 rounded-md bg-white/[0.04] mb-1.5" />
                        <div className="w-1/2 h-2 rounded-md bg-white/[0.02]" />
                      </div>
                    ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
