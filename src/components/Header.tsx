import React from 'react';

interface HeaderProps {
  onCreateInfluencer?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onCreateInfluencer }) => {
  return (
    <header className="sticky top-0 z-40 w-full bg-gradient-to-b from-black via-black/85 to-transparent backdrop-blur-md px-6 py-4 flex items-center justify-end transition-all">
      {/* Top Navigation: strictly Create your Influencer button */}
      <button
        onClick={onCreateInfluencer}
        className="px-4 py-2 rounded-xl bg-[#d1fe17] hover:bg-[#bfee00] text-black font-extrabold text-xs tracking-tight transition-transform active:scale-95 shadow-md shadow-[#d1fe17]/20"
      >
        Create your Influencer
      </button>
    </header>
  );
};
