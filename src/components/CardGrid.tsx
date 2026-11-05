import React, { useState } from 'react';
import {
  Heart,
  Download,
  Copy,
  MoreHorizontal,
  Image as ImageIcon,
  Video,
  Maximize2,
  ChevronDown,
  Check,
  Eye
} from 'lucide-react';
import { VaultItem, LayoutMode } from '../types';

interface CardGridProps {
  items: VaultItem[];
  layout: LayoutMode;
  cardSize: number;
  splitByDate: boolean;
  lastViewedId?: string | null;
  onSelectItem: (item: VaultItem) => void;
}

export const CardGrid: React.FC<CardGridProps> = ({
  items,
  layout,
  cardSize,
  splitByDate,
  lastViewedId,
  onSelectItem
}) => {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const getColClass = () => {
    switch (cardSize) {
      case 1:
        return 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5';
      case 2:
        return 'grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4';
      case 3:
      default:
        return 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4';
      case 4:
        return 'grid-cols-1 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-2';
    }
  };

  const handleCopyPrompt = (e: React.MouseEvent, item: VaultItem) => {
    e.stopPropagation();
    navigator.clipboard.writeText(item.prompt);
    setCopiedId(item.id);
    setTimeout(() => setCopiedId(null), 1500);
  };

  const handleDownload = (e: React.MouseEvent, item: VaultItem) => {
    e.stopPropagation();
    const a = document.createElement('a');
    a.href = item.imageUrl;
    a.download = `higgsfield-${item.id}.png`;
    a.target = '_blank';
    a.click();
  };

  const renderCard = (item: VaultItem) => {
    const isSquare = layout === 'square';
    const isLastViewed = lastViewedId === item.id;

    return (
      <div
        key={item.id}
        onClick={() => onSelectItem(item)}
        className="group relative cursor-pointer overflow-hidden rounded-md bg-[#121318] hover:opacity-95 transition-all duration-200"
      >
        {/* Pure Image Container - Tightly packed */}
        <div className={`w-full overflow-hidden ${isSquare ? 'aspect-square' : 'aspect-[3/4]'}`}>
          <img
            src={item.imageUrl}
            alt=""
            loading="lazy"
            className="w-full h-full object-cover transition-transform duration-200 group-hover:scale-[1.01]"
          />
        </div>

        {/* Resting State 'Last viewed' pill ONLY if user actually clicked & viewed it */}
        {isLastViewed && (
          <div className="absolute bottom-2 right-2 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/70 backdrop-blur-md border border-white/10 text-white/90 text-[10px] font-medium pointer-events-none group-hover:opacity-0 transition-opacity shadow-lg">
            <Eye className="w-3 h-3 text-[#d1fe17]" />
            <span>Last viewed</span>
          </div>
        )}

        {/* Higgsfield Glassmorphic Hover Overlay */}
        <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-150 flex flex-col justify-between p-2.5 pointer-events-none">
          {/* Top Row: Left Selection Square, Right Vertical Action Stack */}
          <div className="flex items-start justify-between pointer-events-auto">
            {/* Top-Left Selection Square (Glassmorphic) */}
            <div
              onClick={(e) => e.stopPropagation()}
              className="w-7 h-7 rounded-lg bg-black/40 backdrop-blur-md border border-white/15 hover:bg-black/60 hover:border-white/30 flex items-center justify-center text-white/80 transition-all shadow-md"
              title="Select"
            >
              <div className="w-3.5 h-3.5 rounded-sm border border-white/70" />
            </div>

            {/* Top-Right Vertical Icon Stack (Glassmorphic) */}
            <div className="flex flex-col items-center gap-1.5">
              <button
                className="w-7 h-7 rounded-lg bg-black/40 backdrop-blur-md border border-white/15 hover:bg-black/60 hover:border-white/30 flex items-center justify-center text-white/80 hover:text-white transition-all shadow-md"
                onClick={(e) => {
                  e.stopPropagation();
                  item.isLiked = !item.isLiked;
                }}
                title="Like"
              >
                <Heart className={`w-3.5 h-3.5 ${item.isLiked ? 'fill-red-500 text-red-500' : ''}`} />
              </button>

              <button
                onClick={(e) => handleDownload(e, item)}
                className="w-7 h-7 rounded-lg bg-black/40 backdrop-blur-md border border-white/15 hover:bg-black/60 hover:border-white/30 flex items-center justify-center text-white/80 hover:text-white transition-all shadow-md"
                title="Download"
              >
                <Download className="w-3.5 h-3.5" />
              </button>

              <button
                onClick={(e) => handleCopyPrompt(e, item)}
                className="w-7 h-7 rounded-lg bg-black/40 backdrop-blur-md border border-white/15 hover:bg-black/60 hover:border-white/30 flex items-center justify-center text-white/80 hover:text-white transition-all shadow-md"
                title="Copy prompt"
              >
                {copiedId === item.id ? (
                  <Check className="w-3.5 h-3.5 text-[#d1fe17]" />
                ) : (
                  <Copy className="w-3.5 h-3.5" />
                )}
              </button>

              <button
                onClick={(e) => e.stopPropagation()}
                className="w-7 h-7 rounded-lg bg-black/40 backdrop-blur-md border border-white/15 hover:bg-black/60 hover:border-white/30 flex items-center justify-center text-white/80 hover:text-white transition-all shadow-md"
                title="More"
              >
                <MoreHorizontal className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Bottom Row Tooling (Glassmorphic pills matching Screenshot) */}
          <div className="flex items-center justify-end gap-1 pointer-events-auto">
            <div
              onClick={(e) => e.stopPropagation()}
              className="flex items-center gap-1 bg-black/40 backdrop-blur-md border border-white/15 hover:bg-black/60 rounded-md px-2 py-1 text-white/80 text-[10px] transition-colors shadow-md"
              title="Image tool"
            >
              <ImageIcon className="w-3 h-3" />
            </div>

            <div
              onClick={(e) => e.stopPropagation()}
              className="flex items-center gap-0.5 bg-black/40 backdrop-blur-md border border-white/15 hover:bg-black/60 rounded-md px-2 py-1 text-white/80 text-[10px] transition-colors shadow-md"
              title="Video tool"
            >
              <Video className="w-3 h-3" />
              <ChevronDown className="w-2.5 h-2.5 opacity-60" />
            </div>

            <div
              onClick={(e) => e.stopPropagation()}
              className="flex items-center gap-0.5 bg-black/40 backdrop-blur-md border border-white/15 hover:bg-black/60 rounded-md px-2 py-1 text-white/80 text-[10px] transition-colors shadow-md"
              title="Expand tool"
            >
              <Maximize2 className="w-3 h-3" />
              <ChevronDown className="w-2.5 h-2.5 opacity-60" />
            </div>
          </div>
        </div>
      </div>
    );
  };

  if (items.length === 0) {
    return (
      <div className="py-24 flex flex-col items-center justify-center text-center text-[#717684]">
        <div className="w-10 h-10 rounded-xl bg-[#121318] border border-[#23252e] flex items-center justify-center text-[#d1fe17] mb-2">
          <img src="/icons/icon32.png" alt="" className="w-5 h-5 object-contain" />
        </div>
        <div className="text-xs font-medium text-white">Loading Soul Generations...</div>
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
      <div className="space-y-6 pb-12">
        {Object.entries(groups).map(([date, groupItems]) => (
          <div key={date}>
            <div className="text-[11px] font-semibold uppercase tracking-wider text-[#717684] mb-2 px-0.5">
              {date}
            </div>
            <div className={`grid gap-1.5 ${getColClass()}`}>
              {groupItems.map(renderCard)}
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className={`grid gap-1.5 pb-12 ${getColClass()}`}>
      {items.map(renderCard)}
    </div>
  );
};
