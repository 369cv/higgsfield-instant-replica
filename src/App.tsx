import React, { useState, useEffect } from 'react';
import { HiggsfieldSuiteHeader } from './components/HiggsfieldSuiteHeader';
import { CardGrid } from './components/CardGrid';
import { GeneratingQueue } from './components/GeneratingQueue';
import { InspectorModal } from './components/InspectorModal';
import { HiggsfieldSidebar, SidebarMode } from './components/HiggsfieldSidebar';
import { HiggsfieldService } from './services/higgsfieldBridge';
import { VaultItem } from './types';

export const App: React.FC = () => {
  const [vault, setVault] = useState<VaultItem[]>([]);
  const [selectedItem, setSelectedItem] = useState<VaultItem | null>(null);
  const [activeTab, setActiveTab] = useState<string>('vault');
  const [isGenerating, setIsGenerating] = useState(false);
  const [inProgressCount, setInProgressCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  // Search & Taxonomy state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All Drops');

  // Higgsfield Sidebar Drawer State
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

  // Load and continuously sync live tracked generations from Higgsfield Soul
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
      alert(`Queued on Higgsfield ${model} at ${ratio} ratio: "${prompt.slice(0, 50)}..."`);
    }, 2000);
  };

  const handleAnimateVideo = (motionType: string) => {
    setIsGenerating(true);
    setTimeout(() => {
      setIsGenerating(false);
      alert(`Kling 1.5 camera motion queued with trajectory: ${motionType}.`);
    }, 2500);
  };

  return (
    <div className="min-h-screen bg-[#070709] text-white flex flex-col relative selection:bg-[#d1fe17] selection:text-black">
      {/* Streamlined Higgsfield Suite Header (Concept 1) */}
      <HiggsfieldSuiteHeader
        activeTab={activeTab}
        onTabChange={(tab) => {
          setActiveTab(tab);
          if (tab === 'soul') handleOpenSidebar('persona');
          else if (tab === 'motion') handleOpenSidebar('motion');
          else if (tab === 'genjutsu') handleOpenSidebar('create');
          else if (tab === 'influencer') handleOpenSidebar('persona');
        }}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        selectedCategory={selectedCategory}
        onSelectCategory={setSelectedCategory}
        onCreateClick={() => handleOpenSidebar('create')}
        onPersonaClick={() => handleOpenSidebar('persona')}
      />

      {/* Main Grid View */}
      <main className="flex-1 w-full max-w-[1920px] mx-auto p-0 pb-12">
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
        onRecreate={() => {
          setSelectedItem(null);
          handleOpenSidebar('create');
        }}
        onTurnToVideo={() => {
          handleOpenSidebar('motion');
        }}
      />

      {/* Aligned Higgsfield Studio Sidebar Drawer */}
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
