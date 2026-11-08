import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { CardGrid } from './components/CardGrid';
import { GeneratingQueue } from './components/GeneratingQueue';
import { InspectorModal } from './components/InspectorModal';
import { HiggsfieldSidebar, SidebarMode } from './components/HiggsfieldSidebar';
import { HiggsfieldService } from './services/higgsfieldBridge';
import { VaultItem } from './types';

export const App: React.FC = () => {
  const [vault, setVault] = useState<VaultItem[]>([]);
  const [selectedItem, setSelectedItem] = useState<VaultItem | null>(null);
  const [activeTab, setActiveTab] = useState<'home' | 'favorites'>('home');
  const [isGenerating, setIsGenerating] = useState(false);
  const [inProgressCount, setInProgressCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  // Higgsfield Sidebar Drawer State
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [sidebarMode, setSidebarMode] = useState<SidebarMode>('create');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

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

  // Filter items by category and favorites
  const displayedItems = vault.filter(item => {
    if (activeTab === 'favorites' && !favorites.has(item.id)) return false;
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
      if (cat.includes('gym') || cat.includes('fitness')) {
        return item.prompt.toLowerCase().includes('gym') || item.prompt.toLowerCase().includes('fitness') || item.prompt.toLowerCase().includes('halter');
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
      {/* Header Navigation completely removed for clean canvas brainstorming */}

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

      {/* Higgsfield Aligned Studio Sidebar Drawer */}
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
