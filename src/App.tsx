import React, { useState, useEffect } from 'react';
import { VaultHeader, NavTab } from './components/VaultHeader';
import { CardGrid } from './components/CardGrid';
import { MoodBoardScreen } from './components/MoodBoardScreen';
import { GeneratingQueue } from './components/GeneratingQueue';
import { InspectorModal } from './components/InspectorModal';
import { HiggsfieldSidebar, SidebarMode } from './components/HiggsfieldSidebar';
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
      if (cat.includes('modest') || cat.includes('hijab')) {
        return item.prompt.toLowerCase().includes('abaya') || item.prompt.toLowerCase().includes('hijab') || item.prompt.toLowerCase().includes('modest');
      }
      if (cat.includes('nightlife') || cat.includes('flash')) {
        return item.prompt.toLowerCase().includes('night') || item.prompt.toLowerCase().includes('flash') || item.prompt.toLowerCase().includes('burj');
      }
      if (cat.includes('luxury') || cat.includes('editorial')) {
        return item.prompt.toLowerCase().includes('luxury') || item.prompt.toLowerCase().includes('silk') || item.prompt.toLowerCase().includes('satin') || item.prompt.toLowerCase().includes('couture');
      }
      if (cat.includes('resort') || cat.includes('swim')) {
        return item.prompt.toLowerCase().includes('pool') || item.prompt.toLowerCase().includes('resort') || item.prompt.toLowerCase().includes('cabana');
      }
      if (cat.includes('gym') || cat.includes('activewear')) {
        return item.prompt.toLowerCase().includes('gym') || item.prompt.toLowerCase().includes('fitness') || item.prompt.toLowerCase().includes('halter');
      }
      if (cat.includes('podcast') || cat.includes('studio')) {
        return item.prompt.toLowerCase().includes('podcast') || item.prompt.toLowerCase().includes('studio') || item.prompt.toLowerCase().includes('microphone');
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
      {/* Pure-Icon Header Navigation with Guided Tooltips & Centered (+) Hub */}
      <VaultHeader
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onCreateAction={handleCreateAction}
      />

      {/* Main View Router */}
      {activeTab === 'vault' && (
        <main className="flex-1 w-full max-w-[1920px] mx-auto p-0 pb-12">
          {(isGenerating || isLoading) && (
            <div className="mb-0">
              <GeneratingQueue
                isGenerating={true}
                progressText={isLoading ? "Loading Prompt Vault" : "Generating Persona Drop"}
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

      {/* Placeholders for upcoming user flows */}
      {activeTab === 'influencer' && (
        <main className="flex-1 w-full max-w-5xl mx-auto p-12 text-center space-y-4">
          <div className="w-16 h-16 rounded-3xl bg-fuchsia-500/10 text-fuchsia-400 mx-auto flex items-center justify-center text-2xl font-bold">
            👤
          </div>
          <h2 className="text-2xl font-bold text-white">AI Influencer Studio</h2>
          <p className="text-xs text-neutral-400 max-w-md mx-auto">
            Persona identity training and consistency seed locking. Next user flow in queue after Mood Boards.
          </p>
          <button
            onClick={() => setActiveTab('vault')}
            className="px-4 py-2 bg-white/10 hover:bg-white/15 text-white font-semibold text-xs rounded-xl"
          >
            ← Return to Prompt Vault
          </button>
        </main>
      )}

      {activeTab === 'video' && (
        <main className="flex-1 w-full max-w-5xl mx-auto p-12 text-center space-y-4">
          <div className="w-16 h-16 rounded-3xl bg-cyan-500/10 text-cyan-400 mx-auto flex items-center justify-center text-2xl font-bold">
            🎬
          </div>
          <h2 className="text-2xl font-bold text-white">Video Studio</h2>
          <p className="text-xs text-neutral-400 max-w-md mx-auto">
            Cinematic motion director & camera rigs. Next user flow in queue.
          </p>
          <button
            onClick={() => setActiveTab('vault')}
            className="px-4 py-2 bg-white/10 hover:bg-white/15 text-white font-semibold text-xs rounded-xl"
          >
            ← Return to Prompt Vault
          </button>
        </main>
      )}

      {activeTab === 'assets' && (
        <main className="flex-1 w-full max-w-5xl mx-auto p-12 text-center space-y-4">
          <div className="w-16 h-16 rounded-3xl bg-emerald-500/10 text-emerald-400 mx-auto flex items-center justify-center text-2xl font-bold">
            📁
          </div>
          <h2 className="text-2xl font-bold text-white">Assets Hub</h2>
          <p className="text-xs text-neutral-400 max-w-md mx-auto">
            Fashion factory wardrobe, face swap library, and exported bundles.
          </p>
          <button
            onClick={() => setActiveTab('vault')}
            className="px-4 py-2 bg-white/10 hover:bg-white/15 text-white font-semibold text-xs rounded-xl"
          >
            ← Return to Prompt Vault
          </button>
        </main>
      )}

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
