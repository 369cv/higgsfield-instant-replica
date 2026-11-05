import React from 'react';
import { SlidersHorizontal, LayoutGrid, Sparkles } from 'lucide-react';
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
    <header className="sticky top-0 z-40 bg-[#0b0c0e] border-b border-[#1f212a] px-4 py-3 flex items-center justify-between">
      {/* Brand & Account Info */}
      <div className="flex items-center gap-3">
        {/* Official Higgsfield Icon Squircle */}
        <div className="w-9 h-9 rounded-xl bg-[#14151b] border border-[#23252e] flex items-center justify-center p-1.5 shadow-sm">
          <img
            src="/icons/icon32.png"
            alt="Higgsfield"
            className="w-full h-full object-contain"
          />
        </div>

        <div>
          <div className="flex items-center gap-2">
            <span className="font-semibold text-sm tracking-tight text-white">Higgsfield Instant</span>
            <span className="text-[10px] font-bold tracking-wider px-2 py-0.5 rounded-md bg-[#1b220e] text-[#d1fe17] border border-[#3b4716]">
              SOUL 2.0
            </span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-[#717684]">
            <span>{account?.email || 'baha@bahasavage.com'}</span>
            <span>•</span>
            <span className="text-[#d1fe17] font-semibold">{account?.credits ?? 270} credits</span>
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
            <span className="w-4 h-4 rounded-full bg-[#d1fe17] text-black text-[10px] font-bold flex items-center justify-center">
              {activeFilterCount}
            </span>
          )}
        </button>

        {/* View button */}
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
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-[#d1fe17] hover:bg-[#bfee00] text-black text-xs font-bold transition-transform active:scale-95 shadow-md shadow-[#d1fe17]/20"
        >
          <Sparkles className="w-3.5 h-3.5 fill-black" />
          <span>Recreate</span>
        </button>
      </div>
    </header>
  );
};
