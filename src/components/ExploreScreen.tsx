import React from 'react';

interface ExploreScreenProps {
  onReturnToVault?: () => void;
}

export const ExploreScreen: React.FC<ExploreScreenProps> = ({ onReturnToVault }) => {
  const skeletonChannels = [
    { id: 'ch-1', title: 'Editorial & Haute Couture' },
    { id: 'ch-2', title: 'Cinematic Stills & Narrative' },
    { id: 'ch-3', title: 'Global Architecture & Penthouse' },
    { id: 'ch-4', title: 'High-Speed Commercial & Auto' },
  ];

  return (
    <div className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 py-10 flex flex-col min-h-[calc(100vh-4rem)] select-none">
      {/* Header Info */}
      <div className="flex flex-col items-center justify-center text-center pb-8 border-b border-white/10">
        <div className="w-14 h-14 rounded-2xl bg-white/[0.03] border border-white/10 flex items-center justify-center text-neutral-400 mb-3 shadow-lg">
          <svg
            className="w-6 h-6 text-neutral-300"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="12" cy="12" r="10" />
            <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" />
          </svg>
        </div>

        <h2 className="text-2xl font-black text-white uppercase tracking-tight">
          Curated Explore Hub
        </h2>
        <p className="text-xs text-neutral-400 max-w-md mt-1.5 leading-relaxed">
          Channel curation pipeline is initialized. Community and partner channels will sync directly here once released.
        </p>

        {onReturnToVault && (
          <button
            onClick={onReturnToVault}
            className="mt-4 px-4 py-2 rounded-xl bg-[#d1fe17] text-black font-extrabold text-xs shadow-[0_0_15px_rgba(209,254,23,0.3)] hover:scale-105 active:scale-95 transition-all cursor-pointer"
          >
            Browse Prompts Vault (1,604 Drops)
          </button>
        )}
      </div>

      {/* Structured Skeleton Wireframe Slate (Responsive Channel Placeholders) */}
      <div className="py-8 space-y-10">
        {skeletonChannels.map((ch) => (
          <div key={ch.id} className="space-y-3">
            {/* Channel Skeleton Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-[#d1fe17]/60 animate-pulse" />
                <span className="text-xs font-bold text-neutral-300 tracking-wide">
                  {ch.title}
                </span>
              </div>
              <span className="text-[10px] text-neutral-500 font-mono">
                Awaiting Stream Sync
              </span>
            </div>

            {/* Skeleton Grid (3:4 Ratio, Shimmer Skeleton Cards) */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
              {[...Array(6)].map((_, idx) => (
                <div
                  key={idx}
                  className="aspect-[3/4] rounded-2xl bg-white/[0.02] border border-white/5 relative overflow-hidden flex flex-col justify-end p-3 group"
                >
                  {/* Subtle Shimmer Animation */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/[0.03] to-transparent animate-pulse" />
                  
                  {/* Bottom Skeleton Tag */}
                  <div className="w-3/4 h-2.5 rounded-md bg-white/[0.04] mb-1.5" />
                  <div className="w-1/2 h-2 rounded-md bg-white/[0.02]" />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
