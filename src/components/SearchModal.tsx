import React, { useState, useEffect, useRef } from 'react';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  onSelectResult?: (query: string) => void;
}

export const SearchModal: React.FC<SearchModalProps> = ({
  isOpen,
  onClose,
  searchQuery,
  onSearchChange,
  onSelectResult,
}) => {
  const [activeFilter, setActiveFilter] = useState('All');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') onClose();
      };
      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const filters = [
    { id: 'All', label: 'All', icon: null },
    {
      id: 'Models',
      label: 'Models',
      icon: (
        <svg className="w-3.5 h-3.5 text-neutral-400 group-hover:text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="m12 3-1.9 5.8a2 2 0 0 1-1.3 1.3L3 12l5.8 1.9a2 2 0 0 1 1.3 1.3L12 21l1.9-5.8a2 2 0 0 1 1.3-1.3L21 12l-5.8-1.9a2 2 0 0 1-1.3-1.3Z" />
        </svg>
      ),
    },
    {
      id: 'Products',
      label: 'Products',
      icon: (
        <svg className="w-3.5 h-3.5 text-neutral-400 group-hover:text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="m12 3-1.9 5.8a2 2 0 0 1-1.3 1.3L3 12l5.8 1.9a2 2 0 0 1 1.3 1.3L12 21l1.9-5.8a2 2 0 0 1 1.3-1.3L21 12l-5.8-1.9a2 2 0 0 1-1.3-1.3Z" />
        </svg>
      ),
    },
    {
      id: 'Characters',
      label: 'Characters',
      icon: (
        <svg className="w-3.5 h-3.5 text-neutral-400 group-hover:text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect width="16" height="20" x="4" y="2" rx="2" />
          <line x1="8" x2="16" y1="6" y2="6" />
          <line x1="8" x2="16" y1="10" y2="10" />
          <line x1="8" x2="12" y1="14" y2="14" />
        </svg>
      ),
    },
    {
      id: 'Community',
      label: 'Community',
      icon: (
        <svg className="w-3.5 h-3.5 text-neutral-400 group-hover:text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
          <circle cx="9" cy="7" r="4" />
          <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
          <path d="M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
      ),
    },
    {
      id: 'Apps',
      label: 'Apps',
      iconRight: (
        <svg className="w-3 h-3 opacity-60" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <line x1="7" y1="17" x2="17" y2="7" />
          <polyline points="7 7 17 7 17 17" />
        </svg>
      ),
    },
    {
      id: 'Originals',
      label: 'Originals',
      iconRight: (
        <svg className="w-3 h-3 opacity-60" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <line x1="7" y1="17" x2="17" y2="7" />
          <polyline points="7 7 17 7 17 17" />
        </svg>
      ),
    },
  ];

  const handleItemClick = (label: string) => {
    onSearchChange(label);
    if (onSelectResult) onSelectResult(label);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-150">
      {/* Backdrop Click Dismiss */}
      <div className="absolute inset-0" onClick={onClose} />

      {/* Main Search Dialog Container */}
      <div className="relative w-full max-w-2xl bg-[#111116]/95 border border-white/15 rounded-3xl p-6 shadow-2xl backdrop-blur-2xl z-10 space-y-6 overflow-hidden max-h-[90vh] flex flex-col">
        {/* Search Input Bar */}
        <div className="relative flex items-center bg-white/5 border border-white/10 rounded-2xl px-4 py-3 focus-within:border-[#d1fe17] transition-colors">
          <svg
            className="w-5 h-5 text-neutral-400 mr-3 shrink-0"
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

          <input
            ref={inputRef}
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search"
            className="w-full bg-transparent text-sm text-white placeholder-neutral-500 focus:outline-none"
          />

          <button
            onClick={onClose}
            className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 text-neutral-300 hover:text-white flex items-center justify-center transition-colors cursor-pointer shrink-0"
            title="Close"
          >
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Filter / Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1 text-xs">
          {filters.map((f) => (
            <button
              key={f.id}
              onClick={() => setActiveFilter(f.id)}
              className={`px-3 py-1.5 rounded-xl font-medium whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 group ${
                activeFilter === f.id
                  ? 'bg-white/15 text-white border border-white/20 shadow-sm'
                  : 'bg-white/5 hover:bg-white/10 text-neutral-400 hover:text-neutral-200 border border-transparent'
              }`}
            >
              {'icon' in f && f.icon}
              <span>{f.label}</span>
              {'iconRight' in f && f.iconRight}
            </button>
          ))}
        </div>

        <div className="space-y-6 overflow-y-auto pr-1">
          {/* Recents Section */}
          <div className="space-y-2">
            <span className="text-[11px] font-bold text-neutral-500 tracking-wider block">
              Recents
            </span>

            <div className="space-y-1">
              <div
                onClick={() => handleItemClick('Nano Banana 2.1')}
                className="flex items-center gap-3 p-2 rounded-xl hover:bg-white/5 transition-colors cursor-pointer group"
              >
                <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center font-bold text-xs text-white group-hover:bg-[#d1fe17] group-hover:text-black transition-colors">
                  G
                </div>
                <div>
                  <div className="text-xs font-bold text-white group-hover:text-[#d1fe17] transition-colors">
                    Nano Banana 2.1
                  </div>
                  <div className="text-[10px] text-neutral-400">
                    Google's next-gen flagship image model
                  </div>
                </div>
              </div>

              <div
                onClick={() => handleItemClick('Canvas')}
                className="flex items-center gap-3 p-2 rounded-xl hover:bg-white/5 transition-colors cursor-pointer group"
              >
                <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center group-hover:bg-[#d1fe17] transition-colors">
                  <svg className="w-4 h-4 text-neutral-300 group-hover:text-black transition-colors" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="6" cy="6" r="3" />
                    <circle cx="18" cy="18" r="3" />
                    <path d="M6 9v3a6 6 0 0 0 6 6h3" />
                  </svg>
                </div>
                <div>
                  <div className="text-xs font-bold text-white group-hover:text-[#d1fe17] transition-colors">
                    Canvas
                  </div>
                  <div className="text-[10px] text-neutral-400">
                    Full workflow on one canvas
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Popular Products Section */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-neutral-500 tracking-wider">
                Popular products
              </span>
              <button
                onClick={() => handleItemClick('Products')}
                className="text-[11px] text-neutral-400 hover:text-white"
              >
                See all
              </button>
            </div>

            <div className="grid grid-cols-3 gap-3">
              {/* Product 1: SUPERCOMPUTER */}
              <div
                onClick={() => handleItemClick('Supercomputer')}
                className="rounded-2xl p-3.5 bg-gradient-to-br from-[#1d2710] to-[#12140d] border border-[#d1fe17]/20 hover:border-[#d1fe17]/60 transition-all cursor-pointer group flex flex-col justify-between h-24"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[9px] font-bold text-neutral-300 bg-black/40 px-1.5 py-0.5 rounded">
                    Agents
                  </span>
                  <span className="text-[9px] font-extrabold text-black bg-[#d1fe17] px-1.5 py-0.2 rounded font-mono">
                    NEW
                  </span>
                </div>
                <div>
                  <div className="text-xs font-black text-white group-hover:text-[#d1fe17] transition-colors flex items-center gap-1">
                    <span>SUPERCOMPUTER</span>
                    <span className="text-[10px]">↗</span>
                  </div>
                  <div className="text-[9px] text-neutral-400 line-clamp-1">
                    AI that acts, not just answers
                  </div>
                </div>
              </div>

              {/* Product 2: MCP & CLI */}
              <div
                onClick={() => handleItemClick('MCP & CLI')}
                className="rounded-2xl p-3.5 bg-gradient-to-br from-[#251010] to-[#140e0e] border border-red-500/20 hover:border-red-500/60 transition-all cursor-pointer group flex flex-col justify-between h-24"
              >
                <div className="flex items-center justify-between">
                  <span className="w-4 h-4 flex items-center justify-center">
                    <svg className="w-3.5 h-3.5 text-red-500 fill-current" viewBox="0 0 24 24">
                      <polygon points="12 2 22 12 12 22 2 12" />
                    </svg>
                  </span>
                  <span className="text-[9px] font-extrabold text-black bg-[#d1fe17] px-1.5 py-0.2 rounded font-mono">
                    NEW
                  </span>
                </div>
                <div>
                  <div className="text-xs font-black text-white group-hover:text-red-400 transition-colors flex items-center gap-1">
                    <span>MCP & CLI</span>
                    <span className="text-[10px]">↗</span>
                  </div>
                  <div className="text-[9px] text-neutral-400 line-clamp-1">
                    Turn OpenClaw into a creative engi...
                  </div>
                </div>
              </div>

              {/* Product 3: CINEMA STUDIO 4.0 */}
              <div
                onClick={() => handleItemClick('Cinema Studio')}
                className="rounded-2xl p-3.5 bg-gradient-to-br from-[#0e212a] to-[#0a141a] border border-cyan-500/20 hover:border-cyan-500/60 transition-all cursor-pointer group flex flex-col justify-between h-24"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[9px] font-bold text-neutral-300 bg-black/40 px-1.5 py-0.5 rounded">
                    Props
                  </span>
                  <span className="text-[9px] font-extrabold text-black bg-[#d1fe17] px-1.5 py-0.2 rounded font-mono">
                    NEW
                  </span>
                </div>
                <div>
                  <div className="text-xs font-black text-white group-hover:text-cyan-400 transition-colors flex items-center gap-1">
                    <span>CINEMA STUDIO 4.0</span>
                    <span className="text-[10px]">↗</span>
                  </div>
                  <div className="text-[9px] text-neutral-400 line-clamp-1">
                    Complete AI production studio
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Trending Section */}
          <div className="space-y-2">
            <span className="text-[11px] font-bold text-neutral-500 tracking-wider block">
              Trending
            </span>

            <div className="grid grid-cols-2 gap-x-4 gap-y-1">
              {/* Item 1 */}
              <div
                onClick={() => handleItemClick('MCP & CLI')}
                className="flex items-center gap-3 p-2 rounded-xl hover:bg-white/5 transition-colors cursor-pointer group"
              >
                <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center text-neutral-400 font-mono text-xs group-hover:bg-white/20">
                  &lt;/&gt;
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold text-white group-hover:text-[#d1fe17] transition-colors">
                      MCP & CLI
                    </span>
                    <span className="text-[8px] font-extrabold text-black bg-[#d1fe17] px-1 rounded font-mono">
                      NEW
                    </span>
                  </div>
                  <div className="text-[10px] text-neutral-400">Automate your production</div>
                </div>
              </div>

              {/* Item 2 */}
              <div
                onClick={() => handleItemClick('Seedance 2.0 4K')}
                className="flex items-center gap-3 p-2 rounded-xl hover:bg-white/5 transition-colors cursor-pointer group"
              >
                <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center text-neutral-400 group-hover:bg-white/20 transition-colors">
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M3 10v4" />
                    <path d="M7 6v12" />
                    <path d="M11 3v18" />
                    <path d="M15 8v8" />
                    <path d="M19 11v2" />
                  </svg>
                </div>
                <div>
                  <div className="text-xs font-bold text-white group-hover:text-[#d1fe17] transition-colors">
                    Seedance 2.0 4K
                  </div>
                  <div className="text-[10px] text-neutral-400">Next-gen multi-modal video generation</div>
                </div>
              </div>

              {/* Item 3 */}
              <div
                onClick={() => handleItemClick('AI Influencer')}
                className="flex items-center gap-3 p-2 rounded-xl hover:bg-white/5 transition-colors cursor-pointer group"
              >
                <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center text-neutral-400 group-hover:bg-white/20 transition-colors">
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                    <circle cx="12" cy="7" r="4" />
                  </svg>
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold text-white group-hover:text-fuchsia-400 transition-colors">
                      AI Influencer
                    </span>
                    <span className="text-[8px] font-extrabold text-white bg-pink-600 px-1.5 rounded uppercase font-mono">
                      TRENDING
                    </span>
                  </div>
                  <div className="text-[10px] text-neutral-400">Create and manage your AI influencer</div>
                </div>
              </div>

              {/* Item 4 */}
              <div
                onClick={() => handleItemClick('Cinema Studio')}
                className="flex items-center gap-3 p-2 rounded-xl hover:bg-white/5 transition-colors cursor-pointer group"
              >
                <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center text-neutral-400 group-hover:bg-white/20 transition-colors">
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect width="18" height="18" x="3" y="3" rx="2" />
                    <path d="M7 3v18" />
                    <path d="M3 7.5h4" />
                    <path d="M3 12h18" />
                    <path d="M3 16.5h4" />
                    <path d="M17 3v18" />
                    <path d="M17 7.5h4" />
                    <path d="M17 16.5h4" />
                  </svg>
                </div>
                <div>
                  <div className="text-xs font-bold text-white group-hover:text-[#d1fe17] transition-colors">
                    Cinema Studio
                  </div>
                  <div className="text-[10px] text-neutral-400">Versatile image styles by xAI</div>
                </div>
              </div>

              {/* Item 5 */}
              <div
                onClick={() => handleItemClick('Marketing Studio')}
                className="flex items-center gap-3 p-2 rounded-xl hover:bg-white/5 transition-colors cursor-pointer group"
              >
                <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center text-neutral-400 group-hover:bg-white/20 transition-colors">
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="m15 4-2 2 4 4 2-2z" />
                    <path d="m8 11-5 5 2 2 5-5z" />
                    <path d="m9 7 2 2" />
                    <path d="m2 22 3-3" />
                    <path d="M19 13v2" />
                    <path d="M19 21v2" />
                    <path d="M22 17h-2" />
                    <path d="M16 17h-2" />
                  </svg>
                </div>
                <div>
                  <div className="text-xs font-bold text-white group-hover:text-[#d1fe17] transition-colors">
                    Marketing Studio
                  </div>
                  <div className="text-[10px] text-neutral-400">Turn any product into a video ad</div>
                </div>
              </div>

              {/* Item 6 */}
              <div
                onClick={() => handleItemClick('Canvas')}
                className="flex items-center gap-3 p-2 rounded-xl hover:bg-white/5 transition-colors cursor-pointer group"
              >
                <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center text-neutral-400 group-hover:bg-white/20 transition-colors">
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="6" cy="6" r="3" />
                    <circle cx="18" cy="18" r="3" />
                    <path d="M6 9v3a6 6 0 0 0 6 6h3" />
                  </svg>
                </div>
                <div>
                  <div className="text-xs font-bold text-white group-hover:text-[#d1fe17] transition-colors">
                    Canvas
                  </div>
                  <div className="text-[10px] text-neutral-400">Full workflow on one canvas</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
