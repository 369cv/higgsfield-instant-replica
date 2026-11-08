import React from 'react';

export type NavTab = 'vault' | 'moodboard' | 'create' | 'influencer' | 'video' | 'assets';

interface VaultHeaderProps {
  activeTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
}

export const VaultHeader: React.FC<VaultHeaderProps> = ({
  activeTab,
  onSelectTab,
  searchQuery,
  onSearchChange,
}) => {
  return (
    <header className="sticky top-0 z-40 h-16 px-6 bg-[#0a0a0d]/95 backdrop-blur-xl border-b border-white/10 flex items-center justify-between transition-all">
      {/* Left: Platform Logo Only & Minimal Search */}
      <div className="flex items-center gap-5">
        <button
          onClick={() => onSelectTab('vault')}
          className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center hover:border-[#d1fe17] hover:scale-105 transition-all group cursor-pointer"
          title="Return to Home"
        >
          {/* Platform Swirl Logo */}
          <svg
            className="w-5 h-5 text-white group-hover:text-[#d1fe17] transition-colors"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2zm1 14.5c-2.4 0-3.8-1.4-3.8-3.3 0-1.8 1.4-3.2 3.2-3.2 2 0 3.3 1.2 3.3 2.8 0 1.5-1.1 2.5-2.5 2.5z" />
          </svg>
        </button>

        <div className="relative w-64 md:w-72">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search..."
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

      {/* Center: Iconic Navigation + Full-Page (+) Create Trigger */}
      <nav className="flex items-center gap-1.5 bg-white/5 p-1 rounded-2xl border border-white/10 relative">
        {/* 1. Home / Drops Feed Icon */}
        <button
          onClick={() => onSelectTab('vault')}
          className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all relative ${
            activeTab === 'vault'
              ? 'bg-[#d1fe17]/15 border border-[#d1fe17]/30 text-[#d1fe17]'
              : 'text-neutral-400 hover:text-white hover:bg-white/10'
          }`}
          title="Home"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>
          {activeTab === 'vault' && (
            <span className="absolute -bottom-1 w-1.5 h-1.5 rounded-full bg-[#d1fe17] shadow-[0_0_8px_#d1fe17]" />
          )}
        </button>

        {/* 2. Mood Board Icon */}
        <button
          onClick={() => onSelectTab('moodboard')}
          className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all relative ${
            activeTab === 'moodboard'
              ? 'bg-[#d1fe17]/15 border border-[#d1fe17]/30 text-[#d1fe17]'
              : 'text-neutral-400 hover:text-white hover:bg-white/10'
          }`}
          title="Mood Boards"
        >
          <svg className="w-5 h-5 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
          {activeTab === 'moodboard' && (
            <span className="absolute -bottom-1 w-1.5 h-1.5 rounded-full bg-[#d1fe17] shadow-[0_0_8px_#d1fe17]" />
          )}
        </button>

        {/* 3. The Plus Sign (+) Button -> Direct Full-Page Routing to Create New */}
        <button
          onClick={() => onSelectTab('create')}
          className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg font-black transition-all cursor-pointer ${
            activeTab === 'create'
              ? 'bg-[#d1fe17] text-black shadow-lg shadow-[#d1fe17]/30 scale-105'
              : 'bg-[#d1fe17] text-black shadow-md shadow-[#d1fe17]/20 hover:scale-105 active:scale-95'
          }`}
          title="Create New (Full Page)"
        >
          +
        </button>

        {/* 4. Video Studio Icon */}
        <button
          onClick={() => onSelectTab('video')}
          className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all relative ${
            activeTab === 'video'
              ? 'bg-[#d1fe17]/15 border border-[#d1fe17]/30 text-[#d1fe17]'
              : 'text-neutral-400 hover:text-white hover:bg-white/10'
          }`}
          title="Video Studio"
        >
          <svg className="w-5 h-5 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
          {activeTab === 'video' && (
            <span className="absolute -bottom-1 w-1.5 h-1.5 rounded-full bg-[#d1fe17] shadow-[0_0_8px_#d1fe17]" />
          )}
        </button>

        {/* 5. Assets Hub Icon */}
        <button
          onClick={() => onSelectTab('assets')}
          className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all relative ${
            activeTab === 'assets'
              ? 'bg-[#d1fe17]/15 border border-[#d1fe17]/30 text-[#d1fe17]'
              : 'text-neutral-400 hover:text-white hover:bg-white/10'
          }`}
          title="Assets"
        >
          <svg className="w-5 h-5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
          </svg>
          {activeTab === 'assets' && (
            <span className="absolute -bottom-1 w-1.5 h-1.5 rounded-full bg-[#d1fe17] shadow-[0_0_8px_#d1fe17]" />
          )}
        </button>
      </nav>

      {/* Right: Profile Avatar Only */}
      <div className="flex items-center">
        <button
          onClick={() => onSelectTab('influencer')}
          className="w-9 h-9 rounded-full p-0.5 bg-gradient-to-tr from-amber-500 via-rose-500 to-fuchsia-500 cursor-pointer shadow-md hover:scale-105 transition-transform"
          title="Profile Persona"
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
