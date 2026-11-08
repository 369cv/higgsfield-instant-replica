import React, { useState } from 'react';

export type NavTab = 'vault' | 'moodboard' | 'influencer' | 'video' | 'assets';

interface VaultHeaderProps {
  activeTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  totalCount: number;
}

interface NavItem {
  id: NavTab;
  title: string;
  badge: string;
  desc: string;
  color: string;
  icon: (active: boolean) => React.ReactNode;
}

export const VaultHeader: React.FC<VaultHeaderProps> = ({
  activeTab,
  onSelectTab,
  searchQuery,
  onSearchChange,
  totalCount,
}) => {
  const [hoveredTab, setHoveredTab] = useState<NavTab | null>(null);

  const navItems: NavItem[] = [
    {
      id: 'vault',
      title: 'Prompt Vault',
      badge: 'Home',
      desc: 'Browse 1,604 curated drops',
      color: '#d1fe17',
      icon: (active) => (
        <svg className={`w-5 h-5 ${active ? 'text-[#d1fe17]' : 'text-neutral-400 group-hover:text-white'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
      ),
    },
    {
      id: 'moodboard',
      title: 'Mood Boards',
      badge: 'Curate',
      desc: 'Organize drops & batch animate',
      color: '#f59e0b',
      icon: (active) => (
        <svg className={`w-5 h-5 ${active ? 'text-amber-400' : 'text-neutral-400 group-hover:text-white'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
        </svg>
      ),
    },
    {
      id: 'influencer',
      title: 'AI Influencer',
      badge: 'Persona',
      desc: 'Anchor seed & 98.4% face lock',
      color: '#e879f9',
      icon: (active) => (
        <svg className={`w-5 h-5 ${active ? 'text-fuchsia-400' : 'text-neutral-400 group-hover:text-white'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    },
    {
      id: 'video',
      title: 'Video Studio',
      badge: 'Motion',
      desc: 'Animate keyframes with camera paths',
      color: '#22d3ee',
      icon: (active) => (
        <svg className={`w-5 h-5 ${active ? 'text-cyan-400' : 'text-neutral-400 group-hover:text-white'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
        </svg>
      ),
    },
    {
      id: 'assets',
      title: 'Assets Hub',
      badge: 'Library',
      desc: 'Fashion factory & saved batches',
      color: '#34d399',
      icon: (active) => (
        <svg className={`w-5 h-5 ${active ? 'text-emerald-400' : 'text-neutral-400 group-hover:text-white'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
        </svg>
      ),
    },
  ];

  return (
    <header className="sticky top-0 z-40 h-16 px-6 bg-[#0a0a0d]/90 backdrop-blur-xl border-b border-white/10 flex items-center justify-between transition-all">
      {/* Left: Home Return Logo & Quick Search */}
      <div className="flex items-center gap-6">
        <button
          onClick={() => onSelectTab('vault')}
          className="flex items-center gap-3 group text-left transition-transform active:scale-95"
          title="Return to Home (All Prompts)"
        >
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#d1fe17] to-emerald-400 text-black font-black flex items-center justify-center text-sm shadow-lg shadow-[#d1fe17]/20 group-hover:scale-105 transition-transform">
            ⚡
          </div>
          <div className="flex flex-col">
            <span className="font-black text-sm tracking-tight text-white group-hover:text-[#d1fe17] transition-colors">
              PROMPT VAULT
            </span>
            <span className="text-[10px] text-neutral-500 font-mono tracking-wider">
              {totalCount.toLocaleString()} DROPS
            </span>
          </div>
        </button>

        {/* Global Search Bar */}
        <div className="relative w-64 md:w-80">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search prompts, styles, tags..."
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-[#d1fe17] transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => onSearchChange('')}
              className="absolute right-3 top-2.5 text-xs text-neutral-400 hover:text-white"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Center: Pure-Icon Navigation with Guided Tooltips */}
      <nav className="flex items-center gap-2 bg-white/5 p-1.5 rounded-2xl border border-white/10 relative">
        {navItems.map((item) => {
          const isActive = activeTab === item.id;
          const isHovered = hoveredTab === item.id;

          return (
            <div
              key={item.id}
              className="relative"
              onMouseEnter={() => setHoveredTab(item.id)}
              onMouseLeave={() => setHoveredTab(null)}
            >
              <button
                onClick={() => onSelectTab(item.id)}
                className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all relative group ${
                  isActive
                    ? 'bg-[#d1fe17]/15 border border-[#d1fe17]/30 shadow-lg shadow-[#d1fe17]/10'
                    : 'hover:bg-white/10'
                }`}
                aria-label={item.title}
              >
                {item.icon(isActive)}

                {/* Subtle active indicator dot */}
                {isActive && (
                  <span className="absolute -bottom-1.5 w-1.5 h-1.5 rounded-full bg-[#d1fe17] shadow-[0_0_8px_#d1fe17]" />
                )}
              </button>

              {/* Guided Tooltip Popover on Hover */}
              {isHovered && (
                <div className="absolute top-13 left-1/2 -translate-x-1/2 bg-[#101016]/95 border border-white/15 backdrop-blur-xl px-3 py-1.5 rounded-xl shadow-2xl pointer-events-none z-50 flex flex-col items-center whitespace-nowrap animate-in fade-in zoom-in-95 duration-150">
                  <div className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[5px] border-l-transparent border-r-[5px] border-r-transparent border-b-[6px] border-b-[#101016]" />
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold text-white">{item.title}</span>
                    <span
                      className="px-1.5 py-0.2 rounded text-[9px] font-mono uppercase font-bold"
                      style={{ backgroundColor: `${item.color}25`, color: item.color }}
                    >
                      {item.badge}
                    </span>
                  </div>
                  <span className="text-[10px] text-neutral-400 mt-0.5">{item.desc}</span>
                </div>
              )}
            </div>
          );
        })}
      </nav>

      {/* Right: Credits Badge & Influencer Profile Picture */}
      <div className="flex items-center gap-3">
        <div className="px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 text-xs font-semibold text-neutral-300 flex items-center gap-1.5">
          <span className="text-cyan-400">💎</span>
          <span>1,420</span>
        </div>

        <button
          onClick={() => onSelectTab('influencer')}
          className="w-9 h-9 rounded-full p-0.5 bg-gradient-to-tr from-amber-500 via-rose-500 to-fuchsia-500 cursor-pointer shadow-md hover:scale-105 transition-transform"
          title="Baha Savage Persona"
        >
          <img
            src="/images/influencer-avatar.png"
            alt="Profile Avatar"
            className="w-full h-full rounded-full object-cover"
          />
        </button>
      </div>
    </header>
  );
};
