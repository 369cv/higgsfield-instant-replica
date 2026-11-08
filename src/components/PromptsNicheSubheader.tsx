import React from 'react';

interface PromptsNicheSubheaderProps {
  selectedCategory: string;
  onSelectCategory: (category: string) => void;
  totalCount?: number;
}

export const PromptsNicheSubheader: React.FC<PromptsNicheSubheaderProps> = ({
  selectedCategory,
  onSelectCategory,
  totalCount = 1604,
}) => {
  const niches = [
    { id: 'All', label: `All Drops (${totalCount.toLocaleString()})` },
    { id: 'Burj', label: 'Burj Al Arab & Poolside' },
    { id: 'Editorial', label: 'Editorial Silk & Abaya' },
    { id: 'Gym', label: 'Gym & Fitness Selfies' },
    { id: 'Nightlife', label: '35mm Night Flash & Streetwear' },
    { id: 'Beach', label: 'Yacht & Beach Resort' },
  ];

  return (
    <div className="w-full bg-[#0a0a0d] border-b border-white/10 px-4 sm:px-6 py-2.5 flex items-center justify-between shrink-0 select-none z-30 transition-all">
      {/* Scrollable Niche Pills */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar scroll-smooth py-0.5">
        {niches.map((niche) => {
          const isActive =
            (niche.id === 'All' && (!selectedCategory || selectedCategory === 'All' || selectedCategory === 'All Drops')) ||
            selectedCategory.toLowerCase().includes(niche.id.toLowerCase());

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

      {/* Right Sort / Status indicator */}
      <div className="hidden md:flex items-center gap-2 text-[11px] text-neutral-400 font-mono pl-4 shrink-0">
        <span className="w-1.5 h-1.5 rounded-full bg-[#d1fe17] animate-pulse" />
        <span>Live Drops</span>
      </div>
    </div>
  );
};
