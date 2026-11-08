import React, { useState, useEffect } from 'react';
import { VaultHeader, NavTab } from './components/VaultHeader';
import { CardGrid } from './components/CardGrid';
import { MoodBoardScreen } from './components/MoodBoardScreen';
import { CreateHubScreen } from './components/CreateHubScreen';
import { AssetsScreen } from './components/AssetsScreen';
import { SearchModal } from './components/SearchModal';
import { GeneratingQueue } from './components/GeneratingQueue';
import { InspectorModal } from './components/InspectorModal';
import { HiggsfieldSidebar, SidebarMode } from './components/HiggsfieldSidebar';
import { InfluencerScreen } from './components/InfluencerScreen';
import { PromptsNicheSubheader, ClassificationFilters } from './components/PromptsNicheSubheader';
import { ExploreScreen } from './components/ExploreScreen';
import { VideoStudioScreen } from './components/VideoStudioScreen';
import { HiggsfieldProfileModal } from './components/HiggsfieldProfileModal';
import { HiggsfieldService } from './services/higgsfieldBridge';
import { VaultItem } from './types';
import { getCanonicalNiche } from './utils/categorizationFramework';

const ACTIVE_TAB_KEY = 'halalfans_active_tab_v7';
const SELECTED_CATEGORY_KEY = 'halalfans_selected_category_v7';
const FILTERS_KEY = 'halalfans_filters_v7';

export const App: React.FC = () => {
  const [vault, setVault] = useState<VaultItem[]>([]);
  const [selectedItem, setSelectedItem] = useState<VaultItem | null>(null);
  
  // Persistent Navigation State (Leave off where user killed app)
  const [activeTab, setActiveTabState] = useState<NavTab>(() => {
    try {
      const saved = localStorage.getItem(ACTIVE_TAB_KEY);
      if (saved && ['vault', 'moodboard', 'create', 'influencer', 'video', 'assets', 'explore'].includes(saved)) {
        return saved as NavTab;
      }
    } catch {}
    return 'vault';
  });

  const setActiveTab = (tab: NavTab) => {
    setActiveTabState(tab);
    try {
      localStorage.setItem(ACTIVE_TAB_KEY, tab);
    } catch {}
  };

  const [isGenerating, setIsGenerating] = useState(false);
  const [inProgressCount, setInProgressCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  // Search & Taxonomy state with Persistence
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategoryState] = useState(() => {
    try {
      const saved = localStorage.getItem(SELECTED_CATEGORY_KEY);
      if (saved) return saved;
    } catch {}
    return 'All Drops';
  });

  const setSelectedCategory = (cat: string) => {
    setSelectedCategoryState(cat);
    try {
      localStorage.setItem(SELECTED_CATEGORY_KEY, cat);
    } catch {}
  };

  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  // Advanced Classification & Search Chat Filters with Persistence
  const [filters, setFilters] = useState<ClassificationFilters>(() => {
    try {
      const saved = localStorage.getItem(FILTERS_KEY);
      if (saved) return JSON.parse(saved);
    } catch {}
    return {
      niche: 'All',
      searchChat: '',
      aspectRatio: 'All',
      lighting: 'All',
      shotType: 'All',
    };
  });

  const handleUpdateFilters = (updated: Partial<ClassificationFilters>) => {
    setFilters((prev) => {
      const next = { ...prev, ...updated };
      try {
        localStorage.setItem(FILTERS_KEY, JSON.stringify(next));
      } catch {}
      return next;
    });
  };

  const handleResetFilters = () => {
    const defaultFilters: ClassificationFilters = {
      niche: 'All',
      searchChat: '',
      aspectRatio: 'All',
      lighting: 'All',
      shotType: 'All',
    };
    setFilters(defaultFilters);
    setSelectedCategory('All Drops');
    try {
      localStorage.setItem(FILTERS_KEY, JSON.stringify(defaultFilters));
      localStorage.setItem(SELECTED_CATEGORY_KEY, 'All Drops');
    } catch {}
  };

  // Sidebar Drawer State
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [sidebarMode, setSidebarMode] = useState<SidebarMode>('create');

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

  // Load and continuously sync live tracked generations
  useEffect(() => {
    let isMounted = true;

    async function loadVault() {
      try {
        const details = await HiggsfieldService.getVaultDetails();
        if (isMounted && details.items && details.items.length > 0) {
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

  // Filter items by search, deterministic category formula, and classification filters
  const displayedItems = vault.filter((item) => {
    // 1. Natural Language Search / Search Bar
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchesPrompt = (item.prompt || '').toLowerCase().includes(q);
      const matchesTitle = item.title && item.title.toLowerCase().includes(q);
      if (!matchesPrompt && !matchesTitle) return false;
    }

    // 2. Search Chat Filter (Natural Query from drawer)
    if (filters.searchChat.trim()) {
      const chatQuery = filters.searchChat.toLowerCase();
      const words = chatQuery.split(/\s+/).filter(Boolean);
      const p = (item.prompt || '').toLowerCase();
      const hasAllWords = words.every((w) => p.includes(w));
      if (!hasAllWords) return false;
    }

    // 3. Deterministic Canonical Niche Classification (100% mutually exclusive, 0 duplicates)
    if (selectedCategory && selectedCategory !== 'All' && selectedCategory !== 'All Drops') {
      const canonicalNiche = getCanonicalNiche(item);
      if (canonicalNiche.toLowerCase() !== selectedCategory.toLowerCase()) {
        return false;
      }
    }

    // 4. Aspect Ratio Classification
    if (filters.aspectRatio !== 'All' && item.aspectRatio) {
      if (!item.aspectRatio.includes(filters.aspectRatio)) return false;
    }

    // 5. Lighting Classification
    if (filters.lighting !== 'All') {
      const p = (item.prompt || '').toLowerCase();
      if (filters.lighting === 'flash' && !p.includes('flash') && !p.includes('35mm')) return false;
      if (filters.lighting === 'golden' && !p.includes('golden') && !p.includes('sunset') && !p.includes('dune')) return false;
      if (filters.lighting === 'softbox' && !p.includes('softbox') && !p.includes('studio')) return false;
      if (filters.lighting === 'sun' && !p.includes('sun') && !p.includes('daylight') && !p.includes('bright')) return false;
    }

    // 6. Shot Type Classification
    if (filters.shotType !== 'All') {
      const p = (item.prompt || '').toLowerCase();
      if (filters.shotType === 'portrait' && !p.includes('close-up') && !p.includes('portrait')) return false;
      if (filters.shotType === 'full-body' && !p.includes('full-body') && !p.includes('full body')) return false;
      if (filters.shotType === 'selfie' && !p.includes('selfie')) return false;
      if (filters.shotType === 'medium' && !p.includes('medium')) return false;
    }

    return true;
  });

  const handleOpenSidebar = (mode: SidebarMode) => {
    setSidebarMode(mode);
    setIsSidebarOpen(true);
  };

  const handleGenerateDrop = (prompt: string, model: string, ratio: string) => {
    setIsGenerating(true);
    setTimeout(() => {
      setIsGenerating(false);
      alert(`Queued generation on ${model} (${ratio}): "${prompt.slice(0, 50)}..."`);
    }, 2000);
  };

  const handleAnimateVideo = (motionType: string) => {
    setIsGenerating(true);
    setTimeout(() => {
      setIsGenerating(false);
      alert(`Camera motion queued with trajectory: ${motionType}.`);
    }, 2500);
  };

  const handleCreateAction = (action: 'influencer' | 'moodboard' | 'project') => {
    if (action === 'moodboard') {
      setActiveTab('moodboard');
    } else if (action === 'influencer') {
      setActiveTab('influencer');
    } else if (action === 'project') {
      setActiveTab('vault');
      setSearchQuery('');
      setSelectedCategory('All Drops');
      handleOpenSidebar('create');
    }
  };

  return (
    <div className="min-h-screen bg-[#070709] text-white flex flex-col relative selection:bg-[#d1fe17] selection:text-black">
      {/* Pure-Icon Header Navigation with Search & Assets next to Profile */}
      <VaultHeader
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        onOpenSearch={() => setIsSearchOpen(true)}
        onOpenProfile={() => setIsProfileOpen(true)}
      />

      {/* Main View Router */}
      {activeTab === 'vault' && (
        <main className="flex-1 w-full max-w-[1920px] mx-auto p-0 pb-12 flex flex-col">
          {/* Niche Subheader Navigation with Expandable Classification Filters */}
          <PromptsNicheSubheader
            selectedCategory={selectedCategory}
            onSelectCategory={setSelectedCategory}
            filters={filters}
            onUpdateFilters={handleUpdateFilters}
            onResetFilters={handleResetFilters}
            totalFilteredCount={displayedItems.length}
            totalCount={vault.length}
          />

          {/* Active Generation Queue - Only when actively generating */}
          {isGenerating && (
            <div className="mb-2 px-6 pt-4">
              <GeneratingQueue
                isGenerating={true}
                progressText="Synthesizing Drop"
                activeCount={inProgressCount > 0 ? inProgressCount : 4}
              />
            </div>
          )}

          {/* 1,604 Drops Masonry Grid */}
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
      )}

      {/* Explore Tab - Curated Live Channels & Exploration Feed */}
      {activeTab === 'explore' && (
        <main className="flex-1 w-full flex flex-col">
          <ExploreScreen
            vaultItems={vault}
            onSelectItem={(item) => setSelectedItem(item)}
            onReturnToVault={() => setActiveTab('vault')}
          />
        </main>
      )}

      {/* Moodboard Screen - Built strictly following Higgsfield User Flow */}
      {activeTab === 'moodboard' && (
        <main className="flex-1 w-full flex flex-col">
          <MoodBoardScreen
            vaultItems={vault}
            onReturnToVault={() => setActiveTab('vault')}
            onSelectItem={(item) => setSelectedItem(item)}
          />
        </main>
      )}

      {/* Full-Page Create New Screen */}
      {activeTab === 'create' && (
        <main className="flex-1 w-full">
          <CreateHubScreen
            onReturnHome={() => setActiveTab('vault')}
            onSelectAction={handleCreateAction}
          />
        </main>
      )}

      {/* AI Influencer Screen */}
      {activeTab === 'influencer' && (
        <main className="flex-1 w-full flex flex-col">
          <InfluencerScreen
            vaultItems={vault}
            onSelectInfluencerDrops={(dropIds, influencerName) => {
              setSelectedCategory('All Drops');
              setSearchQuery(influencerName);
              setActiveTab('vault');
            }}
            onOpenPromptVault={() => setActiveTab('vault')}
            onSelectVideoStudio={() => setActiveTab('video')}
          />
        </main>
      )}

      {/* Video Studio Screen - Built strictly following Higgsfield User Flow */}
      {activeTab === 'video' && (
        <main className="flex-1 w-full flex flex-col">
          <VideoStudioScreen
            vaultItems={vault}
            onReturnToVault={() => setActiveTab('vault')}
          />
        </main>
      )}

      {/* Full Assets Studio Screen */}
      {activeTab === 'assets' && (
        <main className="flex-1 w-full">
          <AssetsScreen
            vaultItems={vault}
            favorites={favorites}
            onToggleFavorite={toggleFavorite}
            onSelectItem={(item) => setSelectedItem(item)}
            onReturnToVault={() => setActiveTab('vault')}
            onNavigateToStudio={(studio) => {
              if (studio === 'create') setActiveTab('create');
              else if (studio === 'video') setActiveTab('video');
              else if (studio === 'influencer') setActiveTab('influencer');
            }}
          />
        </main>
      )}

      {/* Full-Screen Search Modal matching reference */}
      <SearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />

      {/* Inspector Modal */}
      <InspectorModal
        item={selectedItem}
        isFavorited={selectedItem ? favorites.has(selectedItem.id) : false}
        onToggleFavorite={toggleFavorite}
        onClose={() => setSelectedItem(null)}
        onRecreate={() => {
          setSelectedItem(null);
          handleOpenSidebar('create');
        }}
        onTurnToVideo={() => {
          handleOpenSidebar('motion');
        }}
      />

      {/* Studio Sidebar Drawer */}
      <HiggsfieldSidebar
        isOpen={isSidebarOpen}
        mode={sidebarMode}
        onClose={() => setIsSidebarOpen(false)}
        activeItem={selectedItem}
        onGenerateDrop={handleGenerateDrop}
        onAnimateVideo={handleAnimateVideo}
        onSelectCategory={(cat) => {
          setSelectedCategory(cat);
          setIsSidebarOpen(false);
        }}
      />
      {/* Higgsfield Profile & Settings Modal */}
      <HiggsfieldProfileModal
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
        onOpenCreate={() => {
          setIsProfileOpen(false);
          setActiveTab('create');
        }}
      />
    </div>
  );
};
