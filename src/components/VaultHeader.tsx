import React from 'react';

export type NavTab = 'vault' | 'moodboard' | 'create' | 'influencer' | 'video' | 'assets';

interface VaultHeaderProps {
  activeTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  onOpenSearch: () => void;
}

export const VaultHeader: React.FC<VaultHeaderProps> = ({
  activeTab,
  onSelectTab,
  onOpenSearch,
}) => {
  return (
    <header className="sticky top-0 z-40 h-16 px-6 bg-[#0a0a0d]/95 backdrop-blur-xl border-b border-white/10 flex items-center justify-between transition-all">
      {/* Left: Platform Logo Only (No Search Bar) */}
      <div className="flex items-center">
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
      </nav>

      {/* Right: Search, Assets & Profile Avatar Cluster */}
      <div className="flex items-center gap-2">
        {/* Search Icon Button */}
        <button
          onClick={onOpenSearch}
          className="w-10 h-10 rounded-2xl flex items-center justify-center transition-all bg-white/[0.06] hover:bg-white/10 text-neutral-300 hover:text-white cursor-pointer active:scale-95"
          title="Search"
        >
          <svg
            className="w-5 h-5"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
        </button>

        {/* Assets Icon Button (Solid Folder) */}
        <button
          onClick={() => onSelectTab('assets')}
          className={`w-10 h-10 rounded-2xl flex items-center justify-center transition-all cursor-pointer active:scale-95 ${
            activeTab === 'assets'
              ? 'bg-[#d1fe17]/15 text-[#d1fe17] border border-[#d1fe17]/30'
              : 'bg-white/[0.06] hover:bg-white/10 text-neutral-300 hover:text-white'
          }`}
          title="Assets"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
            <path d="M4 4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2h-8l-2-2H4z" />
          </svg>
        </button>

        {/* Profile Avatar Display (Unlinked) */}
        <div className="ml-1">
          <div className="w-9 h-9 rounded-full p-0.5 bg-gradient-to-tr from-amber-500 via-rose-500 to-fuchsia-500 shadow-md select-none">
            <img
              src="/images/influencer-avatar.png"
              alt="Profile Avatar"
              className="w-full h-full rounded-full object-cover"
            />
          </div>
        </div>
      </div>
    </header>
  );
};
