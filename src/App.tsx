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
import { PromptsNicheSubheader } from './components/PromptsNicheSubheader';
import { HiggsfieldService } from './services/higgsfieldBridge';
import { VaultItem } from './types';

export const App: React.FC = () => {
  const [vault, setVault] = useState<VaultItem[]>([]);
  const [selectedItem, setSelectedItem] = useState<VaultItem | null>(null);
  const [activeTab, setActiveTab] = useState<NavTab>('vault');
  const [isGenerating, setIsGenerating] = useState(false);
  const [inProgressCount, setInProgressCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  // Search & Taxonomy state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All Drops');
  const [isSearchOpen, setIsSearchOpen] = useState(false);

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

  // Filter items by search and category taxonomy
  const displayedItems = vault.filter(item => {
    // 1. Natural Language Search
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchesPrompt = item.prompt.toLowerCase().includes(q);
      const matchesTitle = item.title && item.title.toLowerCase().includes(q);
      if (!matchesPrompt && !matchesTitle) return false;
    }

    // 2. Taxonomy Category
    if (selectedCategory && selectedCategory !== 'All' && selectedCategory !== 'All Drops') {
      const cat = selectedCategory.toLowerCase();
      if (cat.includes('burj') || cat.includes('poolside')) {
        return item.prompt.toLowerCase().includes('burj') || item.prompt.toLowerCase().includes('pool') || item.prompt.toLowerCase().includes('palm');
      }
      if (cat.includes('editorial') || cat.includes('silk') || cat.includes('abaya')) {
        return item.prompt.toLowerCase().includes('silk') || item.prompt.toLowerCase().includes('abaya') || item.prompt.toLowerCase().includes('luxury') || item.prompt.toLowerCase().includes('satin') || item.prompt.toLowerCase().includes('couture');
      }
      if (cat.includes('gym') || cat.includes('fitness')) {
        return item.prompt.toLowerCase().includes('gym') || item.prompt.toLowerCase().includes('fitness') || item.prompt.toLowerCase().includes('athletic') || item.prompt.toLowerCase().includes('mirror selfie');
      }
      if (cat.includes('nightlife') || cat.includes('35mm') || cat.includes('flash') || cat.includes('streetwear')) {
        return item.prompt.toLowerCase().includes('night') || item.prompt.toLowerCase().includes('flash') || item.prompt.toLowerCase().includes('35mm') || item.prompt.toLowerCase().includes('streetwear');
      }
      if (cat.includes('beach') || cat.includes('yacht') || cat.includes('resort')) {
        return item.prompt.toLowerCase().includes('beach') || item.prompt.toLowerCase().includes('yacht') || item.prompt.toLowerCase().includes('resort') || item.prompt.toLowerCase().includes('ocean');
      }
      if (cat.includes('modest') || cat.includes('hijab')) {
        return item.prompt.toLowerCase().includes('abaya') || item.prompt.toLowerCase().includes('hijab') || item.prompt.toLowerCase().includes('modest');
      }
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
      />

      {/* Main View Router */}
      {(activeTab === 'vault' || activeTab === 'explore') && (
        <main className="flex-1 w-full max-w-[1920px] mx-auto p-0 pb-12 flex flex-col">
          {/* Niche Subheader Navigation - Sits cleanly below header with 0 overlap */}
          <PromptsNicheSubheader
            selectedCategory={selectedCategory}
            onSelectCategory={setSelectedCategory}
            totalCount={vault.length || 1604}
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

      {/* User Flow 1: Mood Board Screen */}
      {activeTab === 'moodboard' && (
        <main className="flex-1 w-full">
          <MoodBoardScreen
            vaultItems={vault}
            onReturnToVault={() => setActiveTab('vault')}
            onSelectItem={(item) => setSelectedItem(item)}
            onAnimateReel={(board) => {
              handleOpenSidebar('motion');
            }}
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

      {/* AI Influencer Vault & Creation Studio Screen */}
      {activeTab === 'influencer' && (
        <main className="flex-1 w-full flex flex-col">
          <InfluencerScreen
            onSelectInfluencerDrops={(dropIds, influencerName) => {
              setSelectedCategory('All Drops');
              setSearchQuery(influencerName);
              setActiveTab('vault');
            }}
            onOpenPromptVault={() => setActiveTab('vault')}
          />
        </main>
      )}

      {activeTab === 'video' && (
        <main className="flex-1 w-full max-w-5xl mx-auto p-12 text-center space-y-4">
          <div className="w-16 h-16 rounded-3xl bg-cyan-500/10 text-cyan-400 mx-auto flex items-center justify-center">
            <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="23 7 16 12 23 17 23 7" />
              <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-white">Video Studio</h2>
          <p className="text-xs text-neutral-400 max-w-md mx-auto">
            Cinematic motion director & camera rigs. Next user flow in queue.
          </p>
          <button
            onClick={() => setActiveTab('vault')}
            className="px-4 py-2 bg-white/10 hover:bg-white/15 text-white font-semibold text-xs rounded-xl inline-flex items-center gap-1.5"
          >
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="19" y1="12" x2="5" y2="12" />
              <polyline points="12 19 5 12 12 5" />
            </svg>
            <span>Return to Prompt Vault</span>
          </button>
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
    </div>
  );
};
