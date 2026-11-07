import React, { useState, useEffect, useRef } from 'react';
import { Heart } from 'lucide-react';
import { VaultItem, LayoutMode } from '../types';
import { GeneratingQueue } from './GeneratingQueue';

interface CardGridProps {
  items: VaultItem[];
  layout: LayoutMode;
  cardSize: number;
  splitByDate: boolean;
  onSelectItem: (item: VaultItem) => void;
  favorites: Set<string>;
  onToggleFavorite: (id: string) => void;
}

const INITIAL_BATCH = 24;
const BATCH_INCREMENT = 24;

export const CardGrid: React.FC<CardGridProps> = ({
  items,
  layout,
  cardSize,
  splitByDate,
  onSelectItem,
  favorites,
  onToggleFavorite
}) => {
  const [visibleCount, setVisibleCount] = useState<number>(INITIAL_BATCH);
  const [isLoadingMore, setIsLoadingMore] = useState<boolean>(false);
  const sentinelRef = useRef<HTMLDivElement>(null);

  // Auto-expand visibleCount if items array starts smaller or expands
  useEffect(() => {
    if (items.length > 0 && visibleCount < INITIAL_BATCH) {
      setVisibleCount(Math.min(INITIAL_BATCH, items.length));
    }
  }, [items.length]);

  // Infinite Scroll with IntersectionObserver
  useEffect(() => {
    if (visibleCount >= items.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const first = entries[0];
        if (first.isIntersecting && !isLoadingMore) {
          setIsLoadingMore(true);
          setTimeout(() => {
            setVisibleCount((prev) => Math.min(prev + BATCH_INCREMENT, items.length));
            setIsLoadingMore(false);
          }, 180);
        }
      },
      { rootMargin: '500px' }
    );

    const sentinel = sentinelRef.current;
    if (sentinel) observer.observe(sentinel);

    return () => {
      if (sentinel) observer.unobserve(sentinel);
    };
  }, [visibleCount, items.length, isLoadingMore]);

  // Fallback scroll listener for instant responsiveness
  useEffect(() => {
    const handleScroll = () => {
      if (visibleCount >= items.length) return;
      const scrollPosition = window.innerHeight + window.scrollY;
      const threshold = document.documentElement.scrollHeight - 700;
      if (scrollPosition >= threshold) {
        setVisibleCount((prev) => Math.min(prev + BATCH_INCREMENT, items.length));
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [visibleCount, items.length]);

  const getColClass = () => {
    switch (cardSize) {
      case 1:
        return 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5';
      case 2:
        return 'grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4';
      case 3:
      default:
        return 'grid-cols-2 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-4';
      case 4:
        return 'grid-cols-1 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-2';
    }
  };

  const renderCard = (item: VaultItem) => {
    const isSquare = layout === 'square';
    const isFavorited = favorites.has(item.id);

    return (
      <div
        key={item.id}
        onClick={() => onSelectItem(item)}
        className="group relative cursor-pointer overflow-hidden bg-black select-none"
      >
        {/* Seamless Image Container - Zero gap between cards */}
        <div className={`w-full overflow-hidden ${isSquare ? 'aspect-square' : 'aspect-[3/4]'}`}>
          <img
            src={item.imageUrl}
            alt=""
            loading="lazy"
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.015]"
          />
        </div>

        {/* Vintage Dark Overlay on Hover - Smooth dark vignette, NO harsh borders */}
        <div className={`absolute inset-0 transition-opacity duration-200 pointer-events-none p-2.5 flex justify-end items-start ${
          isFavorited ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
        } bg-gradient-to-t from-black/60 via-transparent to-black/60`}>
          {/* ONLY the Favorite Heart Icon in Top Right */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleFavorite(item.id);
            }}
            className={`w-7 h-7 rounded-md backdrop-blur-md flex items-center justify-center transition-all shadow-md pointer-events-auto ${
              isFavorited
                ? 'bg-black/80 text-red-500'
                : 'bg-black/60 hover:bg-black/85 text-white/80 hover:text-white'
            }`}
            title={isFavorited ? 'Remove favorite' : 'Add to favorites'}
          >
            <Heart className={`w-3.5 h-3.5 ${isFavorited ? 'fill-red-500 text-red-500' : ''}`} />
          </button>
        </div>
      </div>
    );
  };

  const displayedItems = items.slice(0, visibleCount);

  if (items.length === 0) {
    return (
      <div className="w-full py-8">
        <GeneratingQueue isGenerating={true} progressText="Generating Soul" activeCount={4} />
      </div>
    );
  }

  if (splitByDate) {
    const groups: { [date: string]: VaultItem[] } = {};
    displayedItems.forEach((item) => {
      const dateKey = item.createdAt.split(' at ')[0] || item.createdAt;
      if (!groups[dateKey]) groups[dateKey] = [];
      groups[dateKey].push(item);
    });

    return (
      <div className="space-y-4 pb-12">
        {Object.entries(groups).map(([date, groupItems]) => (
          <div key={date}>
            <div className="text-[11px] font-semibold uppercase tracking-wider text-[#717684] mb-2 px-2">
              {date}
            </div>
            {/* Fine line separation between images */}
            <div className={`grid gap-1 sm:gap-1.5 ${getColClass()}`}>
              {groupItems.map(renderCard)}
            </div>
          </div>
        ))}

        {/* Infinite Scroll Sentinel */}
        {visibleCount < items.length && (
          <div
            ref={sentinelRef}
            className="w-full py-10 flex flex-col items-center justify-center gap-2.5 select-none"
          >
            <div className="relative w-8 h-8 flex items-center justify-center">
              <div className="absolute inset-0 rounded-full border-2 border-white/10" />
              <div className="absolute inset-0 rounded-full border-2 border-[#d1fe17] border-t-transparent animate-spin" />
            </div>
            <span className="text-[11px] font-medium text-[#717684] tracking-wider uppercase">
              Loading more Soul generations...
            </span>
          </div>
        )}
      </div>
    );
  }

  {/* Fine line separation between images */}
  return (
    <div className="w-full pb-12">
      <div className={`grid gap-1 sm:gap-1.5 ${getColClass()}`}>
        {displayedItems.map(renderCard)}
      </div>

      {/* Infinite Scroll Sentinel */}
      {visibleCount < items.length && (
        <div
          ref={sentinelRef}
          className="w-full py-10 flex flex-col items-center justify-center gap-2.5 select-none"
        >
          <div className="relative w-8 h-8 flex items-center justify-center">
            <div className="absolute inset-0 rounded-full border-2 border-white/10" />
            <div className="absolute inset-0 rounded-full border-2 border-[#d1fe17] border-t-transparent animate-spin" />
          </div>
          <span className="text-[11px] font-medium text-[#717684] tracking-wider uppercase">
            Loading more Soul generations...
          </span>
        </div>
      )}
    </div>
  );
};
