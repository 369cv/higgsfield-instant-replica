import React from 'react';

interface ExploreScreenProps {
  onReturnToVault?: () => void;
}

export const ExploreScreen: React.FC<ExploreScreenProps> = ({ onReturnToVault }) => {
  return (
    <div className="flex-1 w-full flex flex-col items-center justify-center p-8 text-center min-h-[calc(100vh-4rem)] bg-[#08080a] select-none">
      <div className="w-16 h-16 rounded-3xl bg-white/[0.04] border border-white/10 flex items-center justify-center text-neutral-400 mb-4 shadow-xl">
        <svg
          className="w-7 h-7 text-neutral-400"
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

      <h2 className="text-xl font-bold text-white tracking-tight">Explore</h2>
      <p className="text-xs text-neutral-400 max-w-sm mt-1.5 leading-relaxed">
        This space is ready for your curated explore channels. Fresh drops will be added here.
      </p>

      {onReturnToVault && (
        <button
          onClick={onReturnToVault}
          className="mt-6 px-4 py-2 rounded-xl bg-white/[0.06] hover:bg-white/10 border border-white/10 text-xs font-semibold text-white transition-all cursor-pointer"
        >
          Return to Prompts Vault
        </button>
      )}
    </div>
  );
};
