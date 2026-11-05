import React, { useState } from 'react';
import { X, Sparkles } from 'lucide-react';

interface PromoBannerProps {
  onAction?: () => void;
}

export const PromoBanner: React.FC<PromoBannerProps> = ({ onAction }) => {
  const [visible, setVisible] = useState(true);

  if (!visible) return null;

  return (
    <div className="relative w-full rounded-2xl bg-[#0c0d11] border border-[#23252e] px-4 py-2.5 md:px-6 md:py-3 mb-6 flex items-center justify-between gap-4 overflow-hidden shadow-xl">
      {/* Subtle Lime Ambient Glow on Left */}
      <div className="absolute -left-12 top-0 w-36 h-full bg-[#d1fe17]/10 blur-2xl pointer-events-none" />

      {/* Left Typography */}
      <div className="flex flex-col items-start z-10 select-none">
        <span className="text-white font-extrabold text-xs md:text-sm tracking-wide uppercase leading-tight">
          Build Your Next Hype Machine
        </span>
        <div className="flex items-center gap-1.5 text-[#d1fe17] font-black text-xs md:text-sm tracking-wide uppercase">
          <span>WITH</span>
          <Sparkles className="w-3.5 h-3.5 fill-[#d1fe17]" />
          <span>FREE GENERATIONS</span>
        </div>
      </div>

      {/* Center Real Card Deck Graphic */}
      <div className="hidden sm:flex items-center justify-center z-10 flex-shrink-0 h-11 md:h-12 overflow-hidden">
        <img
          src="/assets/banner_cards.png"
          alt="Characters"
          className="h-full object-contain filter contrast-105"
        />
      </div>

      {/* Right Action & Close */}
      <div className="flex items-center gap-3 z-10 flex-shrink-0">
        <button
          onClick={onAction}
          className="px-4 py-2 rounded-xl bg-[#d1fe17] hover:bg-[#bfee00] text-black font-extrabold text-xs tracking-tight transition-transform active:scale-95 shadow-md shadow-[#d1fe17]/20"
        >
          Create your Influencer
        </button>
        <button
          onClick={() => setVisible(false)}
          className="w-7 h-7 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-[#717684] hover:text-white transition-colors"
          title="Dismiss"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
