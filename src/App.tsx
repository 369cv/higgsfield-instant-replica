import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { CardGrid } from './components/CardGrid';
import { GeneratingQueue } from './components/GeneratingQueue';
import { InspectorModal } from './components/InspectorModal';
import { HiggsfieldService } from './services/higgsfieldBridge';
import { VaultItem } from './types';

export const App: React.FC = () => {
  const [vault, setVault] = useState<VaultItem[]>([]);
  const [selectedItem, setSelectedItem] = useState<VaultItem | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [inProgressCount, setInProgressCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

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
        if (isMounted) {
          setVault(details.items);
          setInProgressCount(details.inProgressCount);
          if (details.inProgressCount > 0) {
            setIsGenerating(true);
          } else {
            setIsGenerating(false);
          }
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

  const handleTurnToVideo = (_item: VaultItem) => {
    setIsGenerating(true);
    setTimeout(() => {
      setIsGenerating(false);
      alert('Job queued on Halal Fans: turning into video with Google Veo 3 / Kling 3.0.');
    }, 2500);
  };

  return (
    <div className="min-h-screen bg-[#070709] text-white flex flex-col relative selection:bg-[#d1fe17] selection:text-black">
      {/* Top Header with Natural Black Fade & 'Create your Influencer' button */}
      <Header />

      {/* Main Grid View - Seamless zero-gap masonry layout */}
      <main className="flex-1 w-full max-w-[1920px] mx-auto p-0 pb-12">
        {/* Animated Green Circular Spinner Queue whenever generating or loading */}
        {(isGenerating || isLoading) && (
          <div className="mb-0">
            <GeneratingQueue
              isGenerating={true}
              progressText={isLoading ? "Loading Soul" : "Generating"}
              activeCount={inProgressCount > 0 ? inProgressCount : 4}
            />
          </div>
        )}

        {/* Clean Zero-Gap Gallery - Only Heart on Hover, No Last Viewed */}
        <CardGrid
          items={vault}
          layout="masonry"
          cardSize={3}
          splitByDate={false}
          favorites={favorites}
          onToggleFavorite={toggleFavorite}
          onSelectItem={(item) => setSelectedItem(item)}
        />
      </main>

      {/* Full Prompt Vault Inspector with Original Reference click support */}
      <InspectorModal
        item={selectedItem}
        isFavorited={selectedItem ? favorites.has(selectedItem.id) : false}
        onToggleFavorite={toggleFavorite}
        onClose={() => setSelectedItem(null)}
        onRecreate={() => {
          setSelectedItem(null);
        }}
        onTurnToVideo={handleTurnToVideo}
      />
    </div>
  );
};
