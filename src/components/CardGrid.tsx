import React from 'react';
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
        className="group relative cursor-pointer overflow-hidden rounded-xl bg-[#121318] border border-[#1f212a] hover:border-[#3a3e4e] transition-all duration-200 shadow-md hover:shadow-xl hover:scale-[1.008]"
      >
        {/* Pure Image Container - Clean, Zero Text, Zero Overlays */}
        <div className={`w-full overflow-hidden ${isSquare ? 'aspect-square' : 'aspect-auto'}`}>
          <img
            src={item.imageUrl}
            alt=""
            loading="lazy"
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        </div>
      </div>
    );
  };

  if (items.length === 0) {
    return (
      <div className="py-20 flex flex-col items-center justify-center text-center text-[#717684]">
        <div className="w-12 h-12 rounded-2xl bg-[#121318] border border-[#23252e] flex items-center justify-center text-lime mb-3">
          <img src="/icons/icon32.png" alt="" className="w-6 h-6 object-contain" />
        </div>
        <div className="text-sm font-medium text-white mb-1">No Soul Generations Yet</div>
        <div className="text-xs">Click Recreate above to start generating with Soul 2.0</div>
      </div>
    );
  }

  if (splitByDate) {
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
