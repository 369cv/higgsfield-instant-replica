import React from 'react';

interface HiggsfieldSuiteHeaderProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  selectedCategory: string;
  onSelectCategory: (category: string) => void;
  onCreateClick: () => void;
  onPersonaClick: () => void;
}

export const HiggsfieldSuiteHeader: React.FC<HiggsfieldSuiteHeaderProps> = ({
  activeTab,
  onTabChange,
  searchQuery,
  onSearchChange,
  selectedCategory,
  onSelectCategory,
  onCreateClick,
  onPersonaClick
}) => {
  return (
    <header className="sticky top-0 z-40 w-full bg-canvas/95 backdrop-blur-xl border-b border-white/10 transition-all">
      {/* Top Suite Bar */}
      <div className="w-full px-4 sm:px-8 py-3 flex flex-wrap items-center justify-between gap-4 max-w-[1920px] mx-auto">
        {/* Left: Brand + Higgsfield Suite Links */}
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#d1fe17] text-black font-black flex items-center justify-center text-xs shadow-lg shadow-[#d1fe17]/25">
              HF
            </div>
            <span className="font-extrabold text-sm tracking-tight text-white">Halal Fans</span>
            <span className="text-[10px] bg-[#d1fe17]/20 text-accent-ink px-2 py-0.5 rounded-full font-bold">SOUL 2.0</span>
          </div>

          <nav className="hidden lg:flex items-center gap-1.5 text-xs font-semibold text-neutral-300">
            <button
              onClick={() => onTabChange('vault')}
              className={`px-3.5 py-1.5 rounded-xl transition-all cursor-pointer ${
                activeTab === 'vault'
                  ? 'bg-white/15 text-white font-bold'
                  : 'hover:text-white hover:bg-white/5 text-neutral-400'
              }`}
            >
              Prompt Vault (1,604)
            </button>

            <button
              onClick={() => onTabChange('soul')}
              className={`px-3.5 py-1.5 rounded-xl transition-all cursor-pointer ${
                activeTab === 'soul'
                  ? 'bg-white/15 text-white font-bold'
                  : 'hover:text-white hover:bg-white/5 text-neutral-400'
              }`}
            >
              Soul Character
            </button>

            <button
              onClick={() => onTabChange('motion')}
              className={`px-3.5 py-1.5 rounded-xl transition-all cursor-pointer ${
                activeTab === 'motion'
                  ? 'bg-white/15 text-white font-bold'
                  : 'hover:text-white hover:bg-white/5 text-neutral-400'
              }`}
            >
              Video & Motion
            </button>

            <button
              onClick={() => onTabChange('genjutsu')}
              className={`px-3.5 py-1.5 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'genjutsu'
                  ? 'bg-white/15 text-white font-bold'
                  : 'hover:text-white hover:bg-white/5 text-neutral-400'
              }`}
            >
              <span>Genjutsu</span>
              <span className="text-[9px] bg-rose-500/20 text-rose-400 px-1 py-0.5 rounded font-bold">NEW</span>
            </button>

            <button
              onClick={() => onTabChange('influencer')}
              className={`px-3.5 py-1.5 rounded-xl transition-all cursor-pointer ${
                activeTab === 'influencer'
                  ? 'bg-white/15 text-white font-bold'
                  : 'hover:text-white hover:bg-white/5 text-neutral-400'
              }`}
            >
              AI Influencer
            </button>
          </nav>
        </div>

        {/* Center: Real-Time Prompt Search */}
        <div className="flex-1 max-w-md min-w-[240px]">
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Natural language prompt search (e.g. 'abaya', 'car', 'flash')..."
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-[#d1fe17] transition-colors"
            />
            {searchQuery && (
              <button
                onClick={() => onSearchChange('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-white"
              >
                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            )}
          </div>
        </div>

        {/* Right: Persona Face Lock & Create Action */}
        <div className="flex items-center gap-3">
          <button
            onClick={onPersonaClick}
            className="flex items-center gap-2.5 px-3 py-1 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 transition-colors cursor-pointer"
            title="Active Soul Identity Lock"
          >
            <div className="w-7 h-7 rounded-full p-0.5 bg-gradient-to-tr from-rose-500 to-orange-400 overflow-hidden flex-shrink-0">
              <img
                src="/images/influencer-avatar.png"
                alt="Persona"
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).src = '/images/influencer-avatar.png';
                }}
              />
            </div>
            <div className="text-left text-[11px]">
              <div className="font-bold text-white flex items-center gap-1">
                <span>@savage_mode</span>
                <svg className="w-3 h-3 text-emerald-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
              </div>
              <div className="text-[9px] text-neutral-400">Soul Lock Active</div>
            </div>
          </button>

          <button
            onClick={onCreateClick}
            className="px-4 py-2 bg-[#d1fe17] hover:bg-[#bfee00] text-black font-extrabold text-xs rounded-xl shadow-lg shadow-[#d1fe17]/25 flex items-center gap-1.5 transition-transform active:scale-95 cursor-pointer"
          >
            <span>+ Create Soul Drop</span>
          </button>
        </div>
      </div>

      {/* Subheader: Aesthetic Taxonomy Pills */}
      <div className="w-full bg-base border-t border-white/5 px-4 sm:px-8 py-2 flex items-center gap-2 overflow-x-auto text-xs scrollbar-none">
        <span className="text-neutral-500 font-semibold text-[11px] mr-2 flex-shrink-0">TAXONOMY:</span>
        {[
          { name: 'All Drops', count: 1604 },
          { name: 'Modest & Hijab', count: 280 },
          { name: 'Nightlife Flash', count: 659 },
          { name: 'Editorial & Luxury', count: 396 },
          { name: 'Resort & Swim', count: 100 },
          { name: 'Gym & Activewear', count: 80 },
          { name: 'Podcast Studio', count: 39 }
        ].map((cat) => {
          const isSelected = selectedCategory === cat.name || (selectedCategory === 'All' && cat.name === 'All Drops');
          return (
            <button
              key={cat.name}
              onClick={() => onSelectCategory(cat.name)}
              className={`px-3 py-1 rounded-full whitespace-nowrap transition-all cursor-pointer font-medium ${
                isSelected
                  ? 'bg-white text-black font-bold shadow-md shadow-white/10'
                  : 'bg-white/5 hover:bg-white/10 text-neutral-300'
              }`}
            >
              <span>{cat.name}</span>
              <span className={`ml-1.5 text-[10px] ${isSelected ? 'text-neutral-600 font-extrabold' : 'text-neutral-500'}`}>
                {cat.count}
              </span>
            </button>
          );
        })}
      </div>
    </header>
  );
};
