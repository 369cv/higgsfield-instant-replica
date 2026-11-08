import React from 'react';
import { Lock, User } from 'lucide-react';

export type NavTab = 'vault' | 'moodboard' | 'create' | 'influencer' | 'video' | 'assets' | 'explore';

/** Tabs that stay in the nav but open a blurred "unlocking soon" page. */
export const LOCKED_TABS: NavTab[] = ['influencer', 'moodboard', 'video', 'explore'];

interface VaultHeaderProps {
  activeTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  onOpenSearch: () => void;
  onOpenProfile?: () => void;
}

export const VaultHeader: React.FC<VaultHeaderProps> = ({
  activeTab,
  onSelectTab,
  onOpenSearch,
  onOpenProfile,
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
      id: 'video',
      label: 'Cinema Studio',
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
          <rect x="2" y="2" width="20" height="20" rx="2.18" ry="2.18" />
          <line x1="7" y1="2" x2="7" y2="22" />
          <line x1="17" y1="2" x2="17" y2="22" />
          <line x1="2" y1="12" x2="22" y2="12" />
          <line x1="2" y1="7" x2="7" y2="7" />
          <line x1="2" y1="17" x2="7" y2="17" />
          <line x1="17" y1="17" x2="22" y2="17" />
          <line x1="17" y1="7" x2="22" y2="7" />
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
    <header className="sticky top-0 z-40 h-16 px-3 sm:px-6 gap-2 bg-[#0a0a0d]/95 backdrop-blur-xl border-b border-white/10 flex items-center justify-between transition-all select-none">
      {/* Left: Minimal Brand Logo Icon Only */}
      <div className="flex items-center shrink-0">
        <button
          onClick={() => onSelectTab('vault')}
          className="group cursor-pointer focus:outline-none"
          title="Return to Vault"
        >
          <div className="w-9 h-9 rounded-2xl bg-gradient-to-br from-[#d1fe17] to-[#88a804] flex items-center justify-center text-black font-extrabold text-xs shadow-[0_0_15px_rgba(209,254,23,0.25)] group-hover:scale-105 transition-transform active:scale-95">
            <svg
              className="w-4.5 h-4.5"
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
        </button>
      </div>

      {/* Center: The Navigation Menu Options (Prompts Vault, AI Influencer, Moodboard, Explore) */}
      <nav className="flex items-center gap-0.5 sm:gap-2 p-1 rounded-2xl bg-white/[0.03] border border-white/5 min-w-0 overflow-x-auto no-scrollbar">
        {navItems.map((item) => {
          const isActive =
            activeTab === item.id || (item.id === 'vault' && activeTab === 'create');
          const isLocked = LOCKED_TABS.includes(item.id);
          return (
            <button
              key={item.id}
              onClick={() => onSelectTab(item.id)}
              title={isLocked ? `${item.label}: unlocking soon` : item.label}
              aria-label={item.label}
              className={`relative shrink-0 flex items-center gap-2 px-2.5 lg:px-3.5 py-1.5 rounded-xl text-xs font-medium transition-all cursor-pointer ${
                isActive
                  ? 'bg-[#d1fe17] text-black font-bold shadow-[0_0_15px_rgba(209,254,23,0.25)]'
                  : 'text-neutral-400 hover:text-white hover:bg-white/[0.06]'
              }`}
            >
              <span className={isActive ? 'text-black' : 'text-neutral-400'}>
                {item.icon}
              </span>
              <span className="hidden lg:inline">{item.label}</span>
              {isLocked && (
                <Lock
                  aria-hidden="true"
                  className={`w-2.5 h-2.5 lg:w-3 lg:h-3 absolute top-0.5 right-0.5 lg:static ${
                    isActive ? 'text-black/60' : 'text-neutral-500'
                  }`}
                />
              )}
            </button>
          );
        })}
      </nav>

      {/* Right: Search, Assets & Profile Avatar Cluster */}
      <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
        {/* Search Icon Button */}
        <button
          onClick={onOpenSearch}
          className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl flex items-center justify-center transition-all bg-white/[0.06] hover:bg-white/10 text-neutral-300 hover:text-white cursor-pointer active:scale-95"
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
          className={`w-9 h-9 sm:w-10 sm:h-10 rounded-2xl flex items-center justify-center transition-all cursor-pointer active:scale-95 ${
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

        {/* Profile Avatar Button */}
        <button
          onClick={onOpenProfile}
          className="sm:ml-1 cursor-pointer focus:outline-none transition-transform hover:scale-105 active:scale-95"
          title="Profile"
          aria-label="Profile"
        >
          <div className="w-9 h-9 rounded-full bg-white/[0.08] border border-white/15 flex items-center justify-center text-neutral-300">
            <User className="w-4 h-4" />
          </div>
        </button>
      </div>
    </header>
  );
};
