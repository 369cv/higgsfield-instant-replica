import React, { useState } from 'react';
import {
  Home,
  Tv,
  Filter,
  Search,
  Heart,
  Plus,
  BarChart3,
  Menu,
  LayoutGrid
} from 'lucide-react';
import { CreatePopover, MoreMenuPopover, EcosystemPopover } from './NavigationPopovers';

interface HeaderProps {
  onHomeClick?: () => void;
  onVideosClick?: () => void;
  onFilterClick?: () => void;
  onSearchClick?: () => void;
  onFavoritesClick?: () => void;
  onCreateSoulDrop?: () => void;
  onAnimateToVideo?: () => void;
  onOpenScheduledContent?: () => void;
  onAnalyticsClick?: () => void;
  onProfileClick?: () => void;
  activeTab?: string;
  favoritesCount?: number;
}

// Halal Fans Outline Logo (Instagram-silhouette rounded squircle)
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
  onVideosClick,
  onFilterClick,
  onSearchClick,
  onFavoritesClick,
  onCreateSoulDrop,
  onAnimateToVideo,
  onOpenScheduledContent,
  onAnalyticsClick,
  onProfileClick,
  activeTab = 'home',
  favoritesCount = 0
}) => {
  // Popover toggle states
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isMoreMenuOpen, setIsMoreMenuOpen] = useState(false);
  const [isEcosystemOpen, setIsEcosystemOpen] = useState(false);

  return (
    <>
      {/* Top Desktop & Tablet Header Bar */}
      <header className="sticky top-0 z-40 w-full bg-[#070709]/95 backdrop-blur-xl border-b border-white/5 transition-all">
        <div className="w-full px-4 sm:px-8 py-2.5 flex items-center justify-between">
          <div className="w-full flex items-center justify-between sm:justify-around gap-2 max-w-[1920px] mx-auto relative">
            {/* 1. Halal Fans Logo */}
            <button
              onClick={onHomeClick}
              className="w-10 h-10 rounded-xl flex items-center justify-center text-white hover:text-[#d1fe17] hover:bg-white/5 transition-all cursor-pointer"
              title="Halal Fans"
            >
              <HalalFansOutlineLogo className="w-5 h-5 text-white" />
            </button>

            {/* 2. Home (Desktop) */}
            <button
              onClick={onHomeClick}
              className={`hidden md:flex w-10 h-10 rounded-xl items-center justify-center transition-all cursor-pointer ${
                activeTab === 'home'
                  ? 'text-[#d1fe17] bg-[#d1fe17]/10'
                  : 'text-neutral-400 hover:text-white hover:bg-white/5'
              }`}
              title="Home"
            >
              <Home className="w-5 h-5" />
            </button>

            {/* 3. Video / Reels (Desktop) */}
            <button
              onClick={onVideosClick}
              className={`hidden md:flex w-10 h-10 rounded-xl items-center justify-center transition-all cursor-pointer ${
                activeTab === 'videos'
                  ? 'text-[#d1fe17] bg-[#d1fe17]/10'
                  : 'text-neutral-400 hover:text-white hover:bg-white/5'
              }`}
              title="Reels & Motion"
            >
              <Tv className="w-5 h-5" />
            </button>

            {/* 4. Filter Funnel */}
            <button
              onClick={onFilterClick}
              className="w-10 h-10 rounded-xl flex items-center justify-center text-neutral-400 hover:text-white hover:bg-white/5 transition-all cursor-pointer"
              title="Filter Categories"
            >
              <Filter className="w-5 h-5" />
            </button>

            {/* 5. Search */}
            <button
              onClick={onSearchClick}
              className="w-10 h-10 rounded-xl flex items-center justify-center text-neutral-400 hover:text-white hover:bg-white/5 transition-all cursor-pointer"
              title="Search Prompts"
            >
              <Search className="w-5 h-5" />
            </button>

            {/* 6. Heart / Favorites (Desktop) */}
            <button
              onClick={onFavoritesClick}
              className={`hidden md:flex w-10 h-10 rounded-xl items-center justify-center transition-all cursor-pointer ${
                activeTab === 'favorites'
                  ? 'text-red-500 bg-red-500/10'
                  : 'text-neutral-400 hover:text-white hover:bg-white/5'
              }`}
              title="Favorites"
            >
              <Heart className={`w-5 h-5 ${favoritesCount > 0 ? 'fill-red-500 text-red-500' : ''}`} />
            </button>

            {/* 7. Plus / Create (Neon Button with Popover) */}
            <div className="relative">
              <button
                onClick={() => {
                  setIsCreateOpen(prev => !prev);
                  setIsMoreMenuOpen(false);
                  setIsEcosystemOpen(false);
                }}
                className="w-10 h-10 rounded-xl bg-[#d1fe17] hover:bg-[#bfee00] text-black font-black flex items-center justify-center transition-transform active:scale-95 shadow-lg shadow-[#d1fe17]/25 cursor-pointer"
                title="Create Content"
              >
                <Plus className="w-5 h-5 stroke-[3]" />
              </button>

              <CreatePopover
                isOpen={isCreateOpen}
                onClose={() => setIsCreateOpen(false)}
                onCreateSoulDrop={onCreateSoulDrop}
                onAnimateToVideo={onAnimateToVideo}
                onScheduleBuffer={onOpenScheduledContent}
              />
            </div>

            {/* 8. Analytics Dashboard (Desktop) */}
            <button
              onClick={onAnalyticsClick}
              className="hidden md:flex w-10 h-10 rounded-xl items-center justify-center text-neutral-400 hover:text-white hover:bg-white/5 transition-all cursor-pointer"
              title="Professional Dashboard"
            >
              <BarChart3 className="w-5 h-5" />
            </button>

            {/* 9. Profile Avatar (Influencer Persona Studio) */}
            <button
              onClick={onProfileClick}
              className="w-9 h-9 rounded-full overflow-hidden border-2 border-white/20 hover:border-[#d1fe17] ring-1 ring-white/10 flex-shrink-0 transition-all cursor-pointer shadow-md"
              title="Creator Profile & Influencer Studio"
            >
              <img
                src="/images/influencer-avatar.png"
                alt="Influencer Profile"
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).src = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=128&auto=format&fit=crop&q=80';
                }}
              />
            </button>

            {/* 10. Hamburger Menu (More Menu Popover) */}
            <div className="relative">
              <button
                onClick={() => {
                  setIsMoreMenuOpen(prev => !prev);
                  setIsCreateOpen(false);
                  setIsEcosystemOpen(false);
                }}
                className="w-10 h-10 rounded-xl flex items-center justify-center text-neutral-400 hover:text-white hover:bg-white/5 transition-all cursor-pointer"
                title="More Options"
              >
                <Menu className="w-5 h-5" />
              </button>

              <MoreMenuPopover
                isOpen={isMoreMenuOpen}
                onClose={() => setIsMoreMenuOpen(false)}
                onOpenScheduledContent={onOpenScheduledContent}
                onOpenActivity={onAnalyticsClick}
                onOpenSaved={onFavoritesClick}
                onSwitchAccounts={onProfileClick}
              />
            </div>

            {/* 11. Layout Grid / Ecosystem Popover */}
            <div className="relative">
              <button
                onClick={() => {
                  setIsEcosystemOpen(prev => !prev);
                  setIsCreateOpen(false);
                  setIsMoreMenuOpen(false);
                }}
                className="w-10 h-10 rounded-xl flex items-center justify-center text-neutral-400 hover:text-white hover:bg-white/5 transition-all cursor-pointer"
                title="Also from Meta / Ecosystem"
              >
                <LayoutGrid className="w-5 h-5" />
              </button>

              <EcosystemPopover
                isOpen={isEcosystemOpen}
                onClose={() => setIsEcosystemOpen(false)}
                onSelectMetaAI={() => alert('Opening Meta AI / Higgsfield assistant.')}
                onSelectAIStudio={() => alert('Opening AI Studio.')}
                onSelectWhatsApp={() => alert('WhatsApp notification bridge.')}
                onSelectThreads={() => alert('Threads content dispatcher.')}
              />
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Bottom Dock (Instagram Native Mobile UX for screens < 768px) */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#070709]/95 backdrop-blur-2xl border-t border-white/10 px-6 py-2 flex items-center justify-between">
        {/* Home */}
        <button
          onClick={onHomeClick}
          className={`p-2 rounded-xl flex items-center justify-center ${
            activeTab === 'home' ? 'text-[#d1fe17]' : 'text-neutral-400'
          }`}
          title="Home"
        >
          <Home className="w-6 h-6" />
        </button>

        {/* Reels */}
        <button
          onClick={onVideosClick}
          className={`p-2 rounded-xl flex items-center justify-center ${
            activeTab === 'videos' ? 'text-[#d1fe17]' : 'text-neutral-400'
          }`}
          title="Reels"
        >
          <Tv className="w-6 h-6" />
        </button>

        {/* Center Create Button */}
        <button
          onClick={() => setIsCreateOpen(true)}
          className="w-11 h-11 rounded-2xl bg-[#d1fe17] text-black font-black flex items-center justify-center shadow-lg shadow-[#d1fe17]/25 -translate-y-2"
          title="Create"
        >
          <Plus className="w-6 h-6 stroke-[3]" />
        </button>

        {/* Favorites */}
        <button
          onClick={onFavoritesClick}
          className={`p-2 rounded-xl flex items-center justify-center ${
            activeTab === 'favorites' ? 'text-red-500' : 'text-neutral-400'
          }`}
          title="Favorites"
        >
          <Heart className={`w-6 h-6 ${favoritesCount > 0 ? 'fill-red-500 text-red-500' : ''}`} />
        </button>

        {/* Professional Dashboard */}
        <button
          onClick={onAnalyticsClick}
          className="p-2 rounded-xl flex items-center justify-center text-neutral-400"
          title="Professional Dashboard"
        >
          <BarChart3 className="w-6 h-6" />
        </button>
      </nav>
    </>
  );
};
