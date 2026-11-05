import React from 'react';
import { Maximize2, Sparkles, Heart } from 'lucide-react';
import { VaultItem, LayoutMode } from '../types';

interface CardGridProps {
  items: VaultItem[];
  layout: LayoutMode;
  cardSize: number;
  splitByDate: boolean;
  onSelectItem: (item: VaultItem) => void;
}

export const CardGrid: React.FC<CardGridProps> = ({
  items,
  layout,
  cardSize,
  splitByDate,
  onSelectItem
}) => {
  // Determine column classes based on card size
  const getColClass = () => {
    switch (cardSize) {
      case 1:
        return 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5';
      case 2:
        return 'grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4';
      case 3:
      default:
        return 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3';
      case 4:
        return 'grid-cols-1 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-2';
    }
  };

  const renderCard = (item: VaultItem) => {
    const isSquare = layout === 'square';

    return (
      <div
        key={item.id}
        onClick={() => onSelectItem(item)}
        className="group relative cursor-pointer overflow-hidden rounded-xl bg-[#121318] border border-[#1f212a] hover:border-[#3a3e4e] transition-all duration-200 shadow-md hover:shadow-xl hover:scale-[1.01]"
      >
        {/* Pure Image Container - ZERO TEXT OVERLAY */}
        <div className={`w-full overflow-hidden ${isSquare ? 'aspect-square' : 'aspect-auto'}`}>
          <img
            src={item.imageUrl}
            alt=""
            loading="lazy"
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        </div>

        {/* Minimal Subtle Floating Action on Hover - No Text Clutter */}
        <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none flex items-start justify-between p-2.5">
          <div className="w-7 h-7 rounded-full bg-black/60 backdrop-blur-md flex items-center justify-center text-white/80">
            <Sparkles className="w-3.5 h-3.5 text-lime" />
          </div>
          <div className="w-7 h-7 rounded-full bg-black/60 backdrop-blur-md flex items-center justify-center text-white/80 hover:text-white">
            <Maximize2 className="w-3.5 h-3.5" />
          </div>
        </div>
      </div>
    );
  };

  if (splitByDate) {
    // Group items by created date
    const groups: { [date: string]: VaultItem[] } = {};
    items.forEach((item) => {
      const dateKey = item.createdAt.split(' at ')[0] || item.createdAt;
      if (!groups[dateKey]) groups[dateKey] = [];
      groups[dateKey].push(item);
    });

    return (
      <div className="space-y-8">
        {Object.entries(groups).map(([date, groupItems]) => (
          <div key={date}>
            <div className="text-xs font-semibold uppercase tracking-wider text-[#717684] mb-3 px-1">
              {date}
            </div>
            <div className={`grid gap-3 ${getColClass()}`}>
              {groupItems.map(renderCard)}
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className={`grid gap-3 ${getColClass()}`}>
      {items.map(renderCard)}
    </div>
  );
};
