import React, { useState, useEffect } from 'react';
import { VaultHeader, NavTab } from './components/VaultHeader';
import { CardGrid } from './components/CardGrid';
import { AssetsScreen } from './components/AssetsScreen';
import { LockedScreen } from './components/LockedScreen';
import { SearchModal } from './components/SearchModal';
import { GeneratingQueue } from './components/GeneratingQueue';
import { InspectorModal } from './components/InspectorModal';
import { PromptsNicheSubheader, ClassificationFilters } from './components/PromptsNicheSubheader';
import { HiggsfieldProfileModal } from './components/HiggsfieldProfileModal';
import { MobileNavBar, MobileTabBar, MobileDrawer, MobileView, MOBILE_TITLES } from './components/MobileShell';
import { Heart } from 'lucide-react';
import { ToastHost } from './components/ui';
import { useSettings } from './services/settings';
import { HiggsfieldService } from './services/higgsfieldBridge';
import { VaultItem } from './types';
import { getCanonicalNiche } from './utils/categorizationFramework';

const ACTIVE_TAB_KEY = 'halalfans_active_tab_v7';
const SELECTED_CATEGORY_KEY = 'halalfans_selected_category_v7';
const FILTERS_KEY = 'halalfans_filters_v7';

export const App: React.FC = () => {
  const [vault, setVault] = useState<VaultItem[]>([]);
  const settings = useSettings();
  const [selectedItem, setSelectedItem] = useState<VaultItem | null>(null);
  
  // Persistent Navigation State (Leave off where user killed app)
  const [activeTab, setActiveTabState] = useState<NavTab>(() => {
    try {
      const saved = localStorage.getItem(ACTIVE_TAB_KEY);
      if (saved && ['vault', 'moodboard', 'influencer', 'video', 'assets', 'explore'].includes(saved)) {
        return saved as NavTab;
      }
    } catch {}
    return 'vault';
  });

  // Mobile-only: the vault filtered to favourites ("Saved" tab) and the hamburger drawer.
  const [savedOnly, setSavedOnly] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const setActiveTab = (tab: NavTab) => {
    setActiveTabState(tab);
    setSavedOnly(false);
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
    // 0. Saved view (mobile tab): favourites only
    if (savedOnly && !favorites.has(item.id)) return false;

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

  const LOCKED_COPY: Record<'influencer' | 'moodboard' | 'video' | 'explore', { title: string; description: string }> = {
    influencer: {
      title: 'AI Influencer',
      description: 'Build and manage consistent AI characters. This feature is unlocking soon.',
    },
    moodboard: {
      title: 'Moodboard',
      description: 'Curated style boards you can apply to any prompt. Unlocking soon.',
    },
    video: {
      title: 'Cinema Studio',
      description: 'Motion and cinematic video prompts are on the way. Unlocking soon.',
    },
    explore: {
      title: 'Explore',
      description: 'Discover trending prompts from the community. Unlocking soon.',
    },
  };

  const mobileView: MobileView = isProfileOpen
    ? 'profile'
    : activeTab === 'vault' && savedOnly
      ? 'saved'
      : activeTab;

  const handleMobileNavigate = (view: MobileView | 'search') => {
    if (view === 'search') {
      setIsSearchOpen(true);
      return;
    }
    if (view === 'profile') {
      setIsProfileOpen(true);
      return;
    }
    setIsProfileOpen(false);
    if (view === 'saved') {
      setActiveTabState('vault');
      setSavedOnly(true);
      window.scrollTo({ top: 0 });
      return;
    }
    if (view === activeTab && !savedOnly) {
      window.scrollTo({ top: 0, behavior: 'smooth' }); // iOS: tap active tab to scroll to top
      return;
    }
    setActiveTab(view);
    window.scrollTo({ top: 0 });
  };

  return (
    <div className="min-h-screen bg-canvas text-white flex flex-col relative selection:bg-[#d1fe17] selection:text-black">
      {/* Mobile (iOS-style): top nav bar with hamburger + search */}
      <MobileNavBar
        title={MOBILE_TITLES[mobileView] || 'Prompts'}
        onOpenMenu={() => setIsMenuOpen(true)}
        onOpenSearch={() => setIsSearchOpen(true)}
      />

      {/* Desktop: pure-icon header navigation with search, assets and profile */}
      <VaultHeader
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        onOpenSearch={() => setIsSearchOpen(true)}
        onOpenProfile={() => setIsProfileOpen(true)}
      />

      {/* Main View Router */}
      {activeTab === 'vault' && (
        <main className="flex-1 w-full max-w-[1920px] mx-auto p-0 pb-[calc(var(--m-tab-h)+1rem)] md:pb-12 flex flex-col">
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

          {savedOnly && displayedItems.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center px-8 py-24">
              <div className="w-14 h-14 rounded-2xl bg-white/[0.06] flex items-center justify-center mb-4">
                <Heart className="w-6 h-6 text-neutral-400" />
              </div>
              <h2 className="text-[17px] font-semibold mb-1">No saved prompts yet</h2>
              <p className="text-sm text-neutral-400 mb-6">Tap the heart on any prompt to keep it here.</p>
              <button
                onClick={() => handleMobileNavigate('vault')}
                className="h-11 px-5 rounded-xl bg-[#d1fe17] text-black font-semibold text-sm active:scale-[0.98]"
              >
                Browse prompts
              </button>
            </div>
          ) : (
          <CardGrid
            items={displayedItems}
            layout="masonry"
            cardSize={settings.gridDensity === 'compact' ? 0 : 3}
            splitByDate={false}
            favorites={favorites}
            onToggleFavorite={toggleFavorite}
            onSelectItem={(item) => setSelectedItem(item)}
          />
          )}
        </main>
      )}

      {/* Locked sections: kept in the nav, shown as a blurred page with a lock */}
      {(activeTab === 'influencer' ||
        activeTab === 'moodboard' ||
        activeTab === 'video' ||
        activeTab === 'explore') && (
        <main className="flex-1 w-full flex flex-col">
          <LockedScreen
            key={activeTab}
            title={LOCKED_COPY[activeTab].title}
            description={LOCKED_COPY[activeTab].description}
            previewItems={vault}
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
              if (studio === 'video') setActiveTab('video');
              else if (studio === 'influencer') setActiveTab('influencer');
              else setActiveTab('vault');
            }}
          />
        </main>
      )}

      {/* Full-Screen Search Modal matching reference */}
      <SearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        searchQuery={searchQuery}
        onSearchChange={(q) => {
          setSearchQuery(q);
          if (activeTab !== 'vault') setActiveTab('vault');
        }}
        onSelectCategory={(cat) => {
          setSelectedCategory(cat);
          if (activeTab !== 'vault') setActiveTab('vault');
        }}
        onSelectItem={(item) => setSelectedItem(item)}
        vaultItems={vault}
      />

      {/* Mobile (iOS-style): bottom tab bar and hamburger drawer */}
      <MobileTabBar active={mobileView} onSelect={handleMobileNavigate} />
      <MobileDrawer
        isOpen={isMenuOpen}
        active={mobileView}
        savedCount={favorites.size}
        onClose={() => setIsMenuOpen(false)}
        onNavigate={handleMobileNavigate}
      />

      {/* Inspector Modal */}
      <InspectorModal
        item={selectedItem}
        isFavorited={selectedItem ? favorites.has(selectedItem.id) : false}
        onToggleFavorite={toggleFavorite}
        onClose={() => setSelectedItem(null)}
      />

      {/* Higgsfield Profile & Settings Modal */}
      <HiggsfieldProfileModal
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
        savedCount={favorites.size}
        onOpenSaved={() => handleMobileNavigate('saved')}
        onClearSaved={() => {
          setFavorites(new Set());
          try {
            localStorage.setItem('halalfans_favorites', '[]');
          } catch {}
        }}
      />
      <ToastHost />
    </div>
  );
};
