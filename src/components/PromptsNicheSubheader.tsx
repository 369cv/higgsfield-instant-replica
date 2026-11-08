import React from 'react';

interface PromptsNicheSubheaderProps {
  selectedCategory: string;
  onSelectCategory: (category: string) => void;
}

export const PromptsNicheSubheader: React.FC<PromptsNicheSubheaderProps> = ({
  selectedCategory,
  onSelectCategory,
}) => {
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

  return (
    <div className="w-full bg-[#0a0a0d] border-b border-white/10 px-4 sm:px-6 py-2.5 flex items-center shrink-0 select-none z-30 transition-all">
      {/* Scrollable Niche Pills */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar scroll-smooth py-0.5">
        {niches.map((niche) => {
          const isActive =
            (niche.id === 'All' && (!selectedCategory || selectedCategory === 'All' || selectedCategory === 'All Drops')) ||
            selectedCategory.toLowerCase() === niche.label.toLowerCase() ||
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
    </div>
  );
};
