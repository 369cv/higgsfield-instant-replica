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

interface GridImageCardProps {
  item: VaultItem;
  layout: LayoutMode;
  isAboveFold: boolean;
  isFavorited: boolean;
  onSelectItem: (item: VaultItem) => void;
  onToggleFavorite: (id: string) => void;
}

const GridImageCard: React.FC<GridImageCardProps> = ({
  item,
  layout,
  isAboveFold,
  isFavorited,
  onSelectItem,
  onToggleFavorite,
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const isSquare = layout === 'square';

  return (
    <div
      onClick={() => onSelectItem(item)}
      className="group relative cursor-pointer overflow-hidden bg-[#0c0c10] select-none will-change-transform"
    >
      {/* Seamless Media Container with Smooth Shimmer Skeleton */}
      <div className={`relative w-full overflow-hidden ${isSquare ? 'aspect-square' : 'aspect-[3/4]'} bg-[#121318]`}>
        {/* Subtle Skeleton Placeholder while loading */}
        {!isLoaded && (
          <div className="absolute inset-0 bg-white/[0.02] animate-pulse pointer-events-none" />
        )}

        <img
          src={item.imageUrl || item.fullImageUrl}
          alt=""
          loading={isAboveFold ? 'eager' : 'lazy'}
          decoding="async"
          onLoad={() => setIsLoaded(true)}
          className={`w-full h-full object-cover transition-all duration-300 group-hover:scale-[1.015] ${
            isLoaded ? 'opacity-100' : 'opacity-0'
          }`}
          onError={(e) => {
            const target = e.currentTarget as HTMLImageElement;
            if (item.fullImageUrl && target.src !== item.fullImageUrl) {
              target.src = item.fullImageUrl;
            }
            setIsLoaded(true);
          }}
        />
      </div>

      {/* Dark Vignette Overlay on Hover */}
      <div
        className={`absolute inset-0 transition-opacity duration-200 pointer-events-none p-2.5 flex justify-end items-start ${
          isFavorited ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
        } bg-gradient-to-t from-black/60 via-transparent to-black/60`}
      >
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
      <div className="w-full py-16 text-center space-y-3">
        <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-neutral-400 mx-auto">
          <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
        </div>
        <p className="text-xs text-neutral-400">No prompt drops found matching your criteria</p>
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
              {groupItems.map((item, idx) => (
                <GridImageCard
                  key={item.id}
                  item={item}
                  layout={layout}
                  isAboveFold={idx < 8}
                  isFavorited={favorites.has(item.id)}
                  onSelectItem={onSelectItem}
                  onToggleFavorite={onToggleFavorite}
                />
              ))}
            </div>
          </div>
        ))}

        {/* Infinite Scroll Sentinel */}
        {visibleCount < items.length && (
          <div
            ref={sentinelRef}
            className="w-full py-10 flex flex-col items-center justify-center gap-2.5 select-none"
          >
            <div className="relative w-7 h-7 flex items-center justify-center">
              <div className="absolute inset-0 rounded-full border border-white/10" />
              <div className="absolute inset-0 rounded-full border border-[#d1fe17] border-t-transparent animate-spin" />
            </div>
            <span className="text-[10px] font-medium text-neutral-500 tracking-wider uppercase font-mono">
              Loading more drops...
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
        {displayedItems.map((item, idx) => (
          <GridImageCard
            key={item.id}
            item={item}
            layout={layout}
            isAboveFold={idx < 8}
            isFavorited={favorites.has(item.id)}
            onSelectItem={onSelectItem}
            onToggleFavorite={onToggleFavorite}
          />
        ))}
      </div>

      {/* Infinite Scroll Sentinel */}
      {visibleCount < items.length && (
        <div
          ref={sentinelRef}
          className="w-full py-10 flex flex-col items-center justify-center gap-2.5 select-none"
        >
          <div className="relative w-7 h-7 flex items-center justify-center">
            <div className="absolute inset-0 rounded-full border border-white/10" />
            <div className="absolute inset-0 rounded-full border border-[#d1fe17] border-t-transparent animate-spin" />
          </div>
          <span className="text-[10px] font-medium text-neutral-500 tracking-wider uppercase font-mono">
            Loading more drops...
          </span>
        </div>
      )}
    </div>
  );
};
