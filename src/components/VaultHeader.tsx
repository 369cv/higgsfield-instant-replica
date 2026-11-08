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
    <header className="sticky top-0 z-40 h-16 px-6 bg-[#0a0a0d]/95 backdrop-blur-xl border-b border-white/10 flex items-center justify-end transition-all">
      {/* Right: Search, Assets & Profile Avatar Cluster Only */}
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
