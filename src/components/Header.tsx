import React from 'react';
import {
  Home,
  Tv,
  Filter,
  Search,
  Heart,
  Plus,
  Layers,
  Menu,
  Sparkles
} from 'lucide-react';
import { SidebarMode } from './HiggsfieldSidebar';

interface HeaderProps {
  onHomeClick?: () => void;
  onFavoritesClick?: () => void;
  onOpenSidebar: (mode: SidebarMode) => void;
  activeTab?: string;
  favoritesCount?: number;
}

// Halal Fans Outline Logo (rounded squircle silhouette)
const HalalFansOutlineLogo: React.FC<{ className?: string }> = ({ className = 'w-6 h-6' }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <rect width="20" height="20" x="2" y="2" rx="5.5" ry="5.5" />
    <path d="M6.5 13c1.5-3 3-3 4.5 0s3 3 4.5 0 2-1.5 2-1.5" strokeWidth="2.2" />
    <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
  </svg>
);

export const Header: React.FC<HeaderProps> = ({
  onHomeClick,
  onFavoritesClick,
  onOpenSidebar,
  activeTab = 'home',
  favoritesCount = 0
}) => {
  return (
    <>
      {/* Desktop & Tablet Top Header Bar */}
      <header className="sticky top-0 z-40 w-full bg-[#070709]/95 backdrop-blur-xl border-b border-white/5 transition-all">
        <div className="w-full px-4 sm:px-8 py-2.5 flex items-center justify-between">
          <div className="w-full flex items-center justify-between sm:justify-around gap-2 max-w-[1920px] mx-auto">
            {/* 1. Halal Fans Brand Reset */}
            <button
              onClick={onHomeClick}
              className="w-10 h-10 rounded-xl flex items-center justify-center text-white hover:text-[#d1fe17] hover:bg-white/5 transition-all cursor-pointer"
              title="Halal Fans Prompt Vault"
            >
              <HalalFansOutlineLogo className="w-5 h-5 text-white" />
            </button>

            {/* 2. Home */}
            <button
              onClick={onHomeClick}
              className={`hidden md:flex w-10 h-10 rounded-xl items-center justify-center transition-all cursor-pointer ${
                activeTab === 'home'
                  ? 'text-[#d1fe17] bg-[#d1fe17]/10'
                  : 'text-neutral-400 hover:text-white hover:bg-white/5'
              }`}
              title="Home Feed (1,604 drops)"
            >
              <Home className="w-5 h-5" />
            </button>

            {/* 3. Video / Motion (Kling / Seedance) */}
            <button
              onClick={() => onOpenSidebar('motion')}
              className="w-10 h-10 rounded-xl flex items-center justify-center text-neutral-400 hover:text-[#d1fe17] hover:bg-white/5 transition-all cursor-pointer"
              title="Camera Motion & Video (Kling / Seedance)"
            >
              <Tv className="w-5 h-5" />
            </button>

            {/* 4. Filter Funnel (Taxonomy) */}
            <button
              onClick={() => onOpenSidebar('filter')}
              className="w-10 h-10 rounded-xl flex items-center justify-center text-neutral-400 hover:text-white hover:bg-white/5 transition-all cursor-pointer"
              title="Aesthetic Categories & Taxonomy"
            >
              <Filter className="w-5 h-5" />
            </button>

            {/* 5. Search (Prompt Explorer) */}
            <button
              onClick={() => onOpenSidebar('search')}
              className="w-10 h-10 rounded-xl flex items-center justify-center text-neutral-400 hover:text-white hover:bg-white/5 transition-all cursor-pointer"
              title="Prompt Explorer & Search"
            >
              <Search className="w-5 h-5" />
            </button>

            {/* 6. Heart / Favorites */}
            <button
              onClick={onFavoritesClick}
              className={`hidden md:flex w-10 h-10 rounded-xl items-center justify-center transition-all cursor-pointer ${
                activeTab === 'favorites'
                  ? 'text-red-500 bg-red-500/10'
                  : 'text-neutral-400 hover:text-white hover:bg-white/5'
              }`}
              title="Saved Drops & Prompts"
            >
              <Heart className={`w-5 h-5 ${favoritesCount > 0 ? 'fill-red-500 text-red-500' : ''}`} />
            </button>

            {/* 7. Plus / Create (Higgsfield Prompt Studio) */}
            <button
              onClick={() => onOpenSidebar('create')}
              className="w-10 h-10 rounded-xl bg-[#d1fe17] hover:bg-[#bfee00] text-black font-black flex items-center justify-center transition-transform active:scale-95 shadow-lg shadow-[#d1fe17]/25 cursor-pointer"
              title="Generate Soul Drop (Higgsfield Studio)"
            >
              <Plus className="w-5 h-5 stroke-[3]" />
            </button>

            {/* 8. Engine Specs / LoRA Layers */}
            <button
              onClick={() => onOpenSidebar('settings')}
              className="hidden md:flex w-10 h-10 rounded-xl items-center justify-center text-neutral-400 hover:text-white hover:bg-white/5 transition-all cursor-pointer"
              title="Engine Models & Specifications"
            >
              <Layers className="w-5 h-5" />
            </button>

            {/* 9. Profile Avatar (Persona Identity Drawer) */}
            <button
              onClick={() => onOpenSidebar('persona')}
              className="w-9 h-9 rounded-full overflow-hidden border-2 border-white/20 hover:border-[#d1fe17] ring-1 ring-white/10 flex-shrink-0 transition-all cursor-pointer shadow-md"
              title="Persona Identity & Consistency Lock"
            >
              <img
                src="/images/influencer-avatar.png"
                alt="Influencer Persona"
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).src = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=128&auto=format&fit=crop&q=80';
                }}
              />
            </button>

            {/* 10. Drawer Menu */}
            <button
              onClick={() => onOpenSidebar('create')}
              className="w-10 h-10 rounded-xl flex items-center justify-center text-neutral-400 hover:text-white hover:bg-white/5 transition-all cursor-pointer"
              title="Soul Studio Drawer"
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* 11. Quick Remix */}
            <button
              onClick={() => onOpenSidebar('create')}
              className="w-10 h-10 rounded-xl flex items-center justify-center text-[#d1fe17] bg-[#d1fe17]/10 hover:bg-[#d1fe17]/20 transition-all cursor-pointer"
              title="Quick Prompt Remix"
            >
              <Sparkles className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Bottom Dock (Aligned native mobile controls for screens < 768px) */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#070709]/95 backdrop-blur-2xl border-t border-white/10 px-6 py-2 flex items-center justify-between">
        <button
          onClick={onHomeClick}
          className={`p-2 rounded-xl flex items-center justify-center ${
            activeTab === 'home' ? 'text-[#d1fe17]' : 'text-neutral-400'
          }`}
          title="Home"
        >
          <Home className="w-6 h-6" />
        </button>

        <button
          onClick={() => onOpenSidebar('motion')}
          className="p-2 rounded-xl flex items-center justify-center text-neutral-400 hover:text-[#d1fe17]"
          title="Motion & Video"
        >
          <Tv className="w-6 h-6" />
        </button>

        <button
          onClick={() => onOpenSidebar('create')}
          className="w-11 h-11 rounded-2xl bg-[#d1fe17] text-black font-black flex items-center justify-center shadow-lg shadow-[#d1fe17]/25 -translate-y-2 cursor-pointer"
          title="Create Soul Drop"
        >
          <Plus className="w-6 h-6 stroke-[3]" />
        </button>

        <button
          onClick={onFavoritesClick}
          className={`p-2 rounded-xl flex items-center justify-center ${
            activeTab === 'favorites' ? 'text-red-500' : 'text-neutral-400'
          }`}
          title="Favorites"
        >
          <Heart className={`w-6 h-6 ${favoritesCount > 0 ? 'fill-red-500 text-red-500' : ''}`} />
        </button>

        <button
          onClick={() => onOpenSidebar('persona')}
          className="p-2 rounded-xl flex items-center justify-center text-neutral-400 hover:text-white"
          title="Persona Profile"
        >
          <div className="w-6 h-6 rounded-full overflow-hidden border border-white/30">
            <img src="/images/influencer-avatar.png" className="w-full h-full object-cover" />
          </div>
        </button>
      </nav>
    </>
  );
};
