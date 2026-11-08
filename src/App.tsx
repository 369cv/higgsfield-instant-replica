import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { CardGrid } from './components/CardGrid';
import { GeneratingQueue } from './components/GeneratingQueue';
import { InspectorModal } from './components/InspectorModal';
import { ProfessionalDashboardModal } from './components/ProfessionalDashboardModal';
import { HiggsfieldProfileModal } from './components/HiggsfieldProfileModal';
import { BufferQueueModal } from './components/BufferQueueModal';
import { HiggsfieldService } from './services/higgsfieldBridge';
import { VaultItem } from './types';

export const App: React.FC = () => {
  const [vault, setVault] = useState<VaultItem[]>([]);
  const [selectedItem, setSelectedItem] = useState<VaultItem | null>(null);
  const [activeTab, setActiveTab] = useState<'home' | 'videos' | 'favorites'>('home');
  const [isGenerating, setIsGenerating] = useState(false);
  const [inProgressCount, setInProgressCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  // Modals state
  const [isDashboardOpen, setIsDashboardOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isBufferQueueOpen, setIsBufferQueueOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  // Favorites state persisted in localStorage
  const [favorites, setFavorites] = useState<Set<string>>(() => {
    try {
      const saved = localStorage.getItem('halalfans_favorites');
      return saved ? new Set(JSON.parse(saved)) : new Set();
    } catch {
      return new Set();
    }
  });

  const toggleFavorite = (id: string) => {
    setFavorites((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      try {
        localStorage.setItem('halalfans_favorites', JSON.stringify(Array.from(next)));
      } catch (e) {
        console.error('Failed to save favorites to localStorage', e);
      }
      return next;
    });
  };

  // Load and continuously sync live tracked generations from Higgsfield Soul
  useEffect(() => {
    let isMounted = true;

    async function loadVault() {
      try {
        const details = await HiggsfieldService.getVaultDetails();
        if (isMounted && details.items && details.items.length > 0) {
          // Filter strictly images from car cutoff onward
          const imagesOnly = details.items.filter(i => !i.isVideo);
          setVault(imagesOnly);
          setInProgressCount(details.inProgressCount);
          setIsGenerating(details.inProgressCount > 0);
        }
      } catch (err) {
        console.error(err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    loadVault();
    const interval = setInterval(loadVault, 3500);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  // Filter items by tab and search
  const displayedItems = vault.filter(item => {
    if (activeTab === 'favorites' && !favorites.has(item.id)) return false;
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      return (
        item.prompt.toLowerCase().includes(query) ||
        (item.title && item.title.toLowerCase().includes(query))
      );
    }
    return true;
  });

  const handleTurnToVideo = (_item: VaultItem) => {
    setIsGenerating(true);
    setTimeout(() => {
      setIsGenerating(false);
      alert('Job queued on Halal Fans: turning into video with Higgsfield Soul.');
    }, 2500);
  };

  return (
    <div className="min-h-screen bg-[#070709] text-white flex flex-col relative selection:bg-[#d1fe17] selection:text-black">
      {/* Search Input Bar (when search is toggled) */}
      {isSearchOpen && (
        <div className="w-full bg-[#121214] border-b border-white/10 px-4 sm:px-8 py-3 animate-in slide-in-from-top duration-200">
          <div className="max-w-xl mx-auto flex items-center gap-3">
            <input
              type="text"
              autoFocus
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search prompts (e.g. 'black leather jacket', 'cyberpunk', 'abaya', 'car')..."
              className="flex-1 bg-black/60 border border-white/15 rounded-xl px-4 py-2 text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-[#d1fe17]"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="text-xs text-neutral-400 hover:text-white px-2 py-1"
              >
                Clear
              </button>
            )}
            <button
              onClick={() => {
                setIsSearchOpen(false);
                setSearchQuery('');
              }}
              className="text-xs bg-white/10 hover:bg-white/15 px-3 py-2 rounded-xl text-neutral-300 font-medium"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Top Header with Full Width Icon Navigation and Floating Popovers */}
      <Header
        activeTab={activeTab}
        favoritesCount={favorites.size}
        onHomeClick={() => {
          setActiveTab('home');
          setSearchQuery('');
        }}
        onFavoritesClick={() => setActiveTab(prev => prev === 'favorites' ? 'home' : 'favorites')}
        onCreateSoulDrop={() => {
          setIsGenerating(true);
          setTimeout(() => {
            setIsGenerating(false);
            alert('Prompt dispatched to Higgsfield Soul Engine.');
          }, 2000);
        }}
        onAnimateToVideo={() => {
          if (vault.length > 0) {
            handleTurnToVideo(vault[0]);
          } else {
            alert('Select an image to animate to video.');
          }
        }}
        onOpenScheduledContent={() => setIsBufferQueueOpen(true)}
        onVideosClick={() => alert('Soul Videos filter: 37 motion generations indexed.')}
        onFilterClick={() => alert('Category filters: Modest/Hijab (280), Nightlife & Flash (659), Luxury (396).')}
        onSearchClick={() => setIsSearchOpen(prev => !prev)}
        onAnalyticsClick={() => setIsDashboardOpen(true)}
        onProfileClick={() => setIsProfileOpen(true)}
      />

      {/* Main Grid View */}
      <main className="flex-1 w-full max-w-[1920px] mx-auto p-0 pb-20 md:pb-12">
        {(isGenerating || isLoading) && (
          <div className="mb-0">
            <GeneratingQueue
              isGenerating={true}
              progressText={isLoading ? "Loading Soul Vault" : "Generating Soul"}
              activeCount={inProgressCount > 0 ? inProgressCount : 4}
            />
          </div>
        )}

        {/* Gallery Feed */}
        <CardGrid
          items={displayedItems}
          layout="masonry"
          cardSize={3}
          splitByDate={false}
          favorites={favorites}
          onToggleFavorite={toggleFavorite}
          onSelectItem={(item) => setSelectedItem(item)}
        />
      </main>

      {/* Inspector Modal */}
      <InspectorModal
        item={selectedItem}
        isFavorited={selectedItem ? favorites.has(selectedItem.id) : false}
        onToggleFavorite={toggleFavorite}
        onClose={() => setSelectedItem(null)}
        onRecreate={() => setSelectedItem(null)}
        onTurnToVideo={handleTurnToVideo}
      />

      {/* Professional Dashboard Modal (Instagram Dashboard screenshot media_1794093981351_5532c639.png) */}
      <ProfessionalDashboardModal
        isOpen={isDashboardOpen}
        onClose={() => setIsDashboardOpen(false)}
      />

      {/* Higgsfield Creator Profile Modal (screenshot media_1794094916442_070a1f7f.png) */}
      <HiggsfieldProfileModal
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
        onOpenCreate={() => {
          setIsGenerating(true);
          setTimeout(() => setIsGenerating(false), 2000);
        }}
      />

      {/* Buffer Scheduled Content Drawer/Modal */}
      <BufferQueueModal
        isOpen={isBufferQueueOpen}
        onClose={() => setIsBufferQueueOpen(false)}
        activeItem={selectedItem}
      />
    </div>
  );
};
