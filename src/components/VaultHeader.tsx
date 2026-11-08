import React from 'react';

export type NavTab = 'vault' | 'moodboard' | 'create' | 'influencer' | 'video' | 'assets' | 'explore';

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
  const navItems: { id: NavTab; label: string; icon: React.ReactNode }[] = [
    {
      id: 'vault',
      label: 'Prompts Vault',
      icon: (
        <svg
          className="w-4 h-4"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <rect x="3" y="3" width="7" height="7" rx="1.5" />
          <rect x="14" y="3" width="7" height="7" rx="1.5" />
          <rect x="14" y="14" width="7" height="7" rx="1.5" />
          <rect x="3" y="14" width="7" height="7" rx="1.5" />
        </svg>
      ),
    },
    {
      id: 'influencer',
      label: 'AI Influencer',
      icon: (
        <svg
          className="w-4 h-4"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
          <circle cx="9" cy="7" r="4" />
          <path d="M19 8v6m3-3h-6" />
        </svg>
      ),
    },
    {
      id: 'moodboard',
      label: 'Moodboard',
      icon: (
        <svg
          className="w-4 h-4"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <rect x="3" y="3" width="7" height="9" rx="1" />
          <rect x="14" y="3" width="7" height="5" rx="1" />
          <rect x="14" y="12" width="7" height="9" rx="1" />
          <rect x="3" y="16" width="7" height="5" rx="1" />
        </svg>
      ),
    },
    {
      id: 'explore',
      label: 'Explore',
      icon: (
        <svg
          className="w-4 h-4"
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
      ),
    },
  ];

  return (
    <header className="sticky top-0 z-40 h-16 px-6 bg-[#0a0a0d]/95 backdrop-blur-xl border-b border-white/10 flex items-center justify-between transition-all select-none">
      {/* Left: Minimal Brand Mark */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => onSelectTab('vault')}
          className="flex items-center gap-2.5 text-left group cursor-pointer focus:outline-none"
        >
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#d1fe17] to-[#88a804] flex items-center justify-center text-black font-extrabold text-xs shadow-[0_0_15px_rgba(209,254,23,0.25)] group-hover:scale-105 transition-transform">
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2.5"
                d="M13 10V3L4 14h7v7l9-11h-7z"
              />
            </svg>
          </div>
          <span className="text-xs font-bold tracking-tight text-white hidden sm:inline-block">
            PROMPT VAULT
          </span>
        </button>
      </div>

      {/* Center: The Navigation Menu Options (Prompts Vault, AI Influencer, Moodboard, Explore) */}
      <nav className="flex items-center gap-1 sm:gap-2 p-1 rounded-2xl bg-white/[0.03] border border-white/5">
        {navItems.map((item) => {
          const isActive =
            activeTab === item.id || (item.id === 'vault' && activeTab === 'create');
          return (
            <button
              key={item.id}
              onClick={() => onSelectTab(item.id)}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-medium transition-all cursor-pointer ${
                isActive
                  ? 'bg-[#d1fe17] text-black font-bold shadow-[0_0_15px_rgba(209,254,23,0.25)]'
                  : 'text-neutral-400 hover:text-white hover:bg-white/[0.06]'
              }`}
            >
              <span className={isActive ? 'text-black' : 'text-neutral-400'}>
                {item.icon}
              </span>
              <span>{item.label}</span>
            </button>
          );
        })}
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
