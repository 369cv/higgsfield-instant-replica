import React from 'react';
import { SlidersHorizontal, LayoutGrid, Plus, Sparkles } from 'lucide-react';
import { AccountInfo } from '../types';

interface HeaderProps {
  account: AccountInfo | null;
  onOpenView: () => void;
  onOpenRecreate: () => void;
  activeFilterCount?: number;
}

export const Header: React.FC<HeaderProps> = ({
  account,
  onOpenView,
  onOpenRecreate,
  activeFilterCount = 0
}) => {
  return (
    <header className="sticky top-0 z-40 bg-[#0b0c0e]/95 backdrop-blur-md border-b border-[#1f212a] px-4 py-3 flex items-center justify-between">
      {/* Brand & Account */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          {/* Official Higgsfield Squiggly Glyph */}
          <div className="w-8 h-8 rounded-lg bg-[#121318] border border-[#282b37] flex items-center justify-center text-lime font-black text-xl shadow-inner">
            〰
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-sm tracking-tight text-white">Higgsfield Instant</span>
              <span className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-lime/15 text-lime border border-lime/30">
                Soul 2.0
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-[#717684]">
              <span>{account?.email || 'baha@bahasavage.com'}</span>
              <span>•</span>
              <span className="text-lime font-medium">{account?.credits ?? 270} credits</span>
            </div>
          </div>
        </div>
      </div>

      {/* Action Controls */}
      <div className="flex items-center gap-2">
        {/* Filter button */}
        <button
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#181920] hover:bg-[#1f212a] text-[#babdc5] hover:text-white text-xs font-medium border border-[#282b37] transition-colors"
        >
          <SlidersHorizontal className="w-3.5 h-3.5" />
          <span>Filter</span>
          {activeFilterCount > 0 && (
            <span className="w-4 h-4 rounded-full bg-lime text-black text-[10px] font-bold flex items-center justify-center">
              {activeFilterCount}
            </span>
          )}
        </button>

        {/* View popover trigger */}
        <button
          onClick={onOpenView}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#181920] hover:bg-[#1f212a] text-[#babdc5] hover:text-white text-xs font-medium border border-[#282b37] transition-colors"
        >
          <LayoutGrid className="w-3.5 h-3.5" />
          <span>View</span>
        </button>

        {/* Recreate CTA */}
        <button
          onClick={onOpenRecreate}
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-lime hover:bg-lime-hover text-black text-xs font-bold transition-transform active:scale-95 shadow-md shadow-lime/20"
        >
          <Sparkles className="w-3.5 h-3.5 fill-black" />
          <span>Recreate</span>
        </button>
      </div>
    </header>
  );
};
