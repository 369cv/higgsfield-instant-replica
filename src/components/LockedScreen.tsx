import React from 'react';
import { Lock } from 'lucide-react';
import { VaultItem } from '../types';

interface LockedScreenProps {
  title: string;
  description: string;
  previewItems: VaultItem[];
  onReturnToVault: () => void;
}

/**
 * Full-page locked state: a blurred, non-interactive preview grid with a lock card on top.
 */
export const LockedScreen: React.FC<LockedScreenProps> = ({
  title,
  description,
  previewItems,
  onReturnToVault,
}) => {
  const tiles = previewItems.slice(0, 24);

  return (
    <div className="relative flex-1 w-full min-h-app-content overflow-hidden">
      {/* Blurred preview */}
      <div
        aria-hidden="true"
        className="absolute inset-0 grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-1 p-1 blur-2xl scale-110 opacity-60 pointer-events-none select-none"
      >
        {tiles.length > 0
          ? tiles.map((item) => (
              <div key={item.id} className="aspect-[3/4] bg-white/5 overflow-hidden">
                <img src={item.imageUrl} alt="" loading="lazy" className="w-full h-full object-cover" />
              </div>
            ))
          : Array.from({ length: 18 }).map((_, i) => (
              <div key={i} className="aspect-[3/4] bg-gradient-to-br from-white/10 to-white/[0.02]" />
            ))}
      </div>
      <div className="absolute inset-0 bg-canvas/60" aria-hidden="true" />

      {/* Lock card */}
      <div className="relative z-10 flex items-center justify-center min-h-app-content p-6">
        <div className="w-full max-w-sm text-center rounded-3xl bg-surface/85 border border-white/10 backdrop-blur-xl p-8 shadow-2xl">
          <div className="mx-auto mb-5 w-14 h-14 rounded-2xl bg-[#d1fe17]/10 border border-[#d1fe17]/30 flex items-center justify-center">
            <Lock className="w-6 h-6 text-accent-ink" />
          </div>
          <div className="inline-block mb-3 px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-[10px] font-bold tracking-[0.14em] uppercase text-neutral-300">
            Unlocking soon
          </div>
          <h1 className="text-xl font-bold text-white mb-2">{title}</h1>
          <p className="text-sm text-neutral-400 leading-relaxed mb-6">{description}</p>
          <button
            onClick={onReturnToVault}
            className="w-full h-11 rounded-xl bg-[#d1fe17] hover:bg-[#bfee00] text-black font-bold text-sm cursor-pointer active:scale-[0.98] transition-transform"
          >
            Browse today's prompts
          </button>
        </div>
      </div>
    </div>
  );
};
