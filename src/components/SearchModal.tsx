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
    { id: 'All', label: 'All' },
    { id: 'Models', label: '✨ Models' },
    { id: 'Products', label: '✨ Products' },
    { id: 'Characters', label: '🗂️ Characters' },
    { id: 'Community', label: '👥 Community' },
    { id: 'Apps', label: 'Apps ↗' },
    { id: 'Originals', label: 'Originals ↗' },
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
            className="w-6 h-6 rounded-full bg-white/10 hover:bg-white/20 text-neutral-300 hover:text-white flex items-center justify-center text-xs ml-2 transition-colors cursor-pointer shrink-0"
            title="Close"
          >
            ✕
          </button>
        </div>

        {/* Filter / Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1 text-xs">
          {filters.map((f) => (
            <button
              key={f.id}
              onClick={() => setActiveFilter(f.id)}
              className={`px-3 py-1.5 rounded-xl font-medium whitespace-nowrap transition-all cursor-pointer ${
                activeFilter === f.id
                  ? 'bg-white/15 text-white border border-white/20 shadow-sm'
                  : 'bg-white/5 hover:bg-white/10 text-neutral-400 hover:text-neutral-200 border border-transparent'
              }`}
            >
              {f.label}
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
                <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center text-xs text-neutral-300 group-hover:bg-[#d1fe17] group-hover:text-black transition-colors">
                  🔀
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
                  <span className="text-[10px]">♦️</span>
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
                <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center text-neutral-400 text-xs group-hover:bg-white/20">
                  📊
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
                <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center text-neutral-400 text-xs group-hover:bg-white/20">
                  👤
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
                <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center text-neutral-400 text-xs group-hover:bg-white/20">
                  田
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
                <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center text-neutral-400 text-xs group-hover:bg-white/20">
                  🪄
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
                <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center text-neutral-400 text-xs group-hover:bg-white/20">
                  🔀
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
