import React from 'react';

interface CreateHubScreenProps {
  onSelectAction: (action: 'influencer' | 'moodboard' | 'project') => void;
  onReturnHome: () => void;
}

export const CreateHubScreen: React.FC<CreateHubScreenProps> = ({
  onSelectAction,
  onReturnHome,
}) => {
  return (
    <div className="w-full max-w-6xl mx-auto px-6 py-12 space-y-12 animate-in fade-in duration-200">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-8">
        <div>
          <button
            onClick={onReturnHome}
            className="text-xs font-semibold text-neutral-400 hover:text-white bg-white/5 hover:bg-white/10 px-3 py-1.5 rounded-xl border border-white/10 transition-colors flex items-center gap-1.5 mb-3"
          >
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="19" y1="12" x2="5" y2="12" />
              <polyline points="12 19 5 12 12 5" />
            </svg>
            <span>Back to Home</span>
          </button>
          <h1 className="text-3xl md:text-4xl font-black text-white tracking-tight">
            Create New
          </h1>
          <p className="text-sm text-neutral-400 mt-1.5">
            Select a creation workflow to begin designing personas, mood boards, or fresh projects.
          </p>
        </div>
      </div>

      {/* 3 Full-Page Interactive Creation Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Card 1: AI Influencer */}
        <div
          onClick={() => onSelectAction('influencer')}
          className="bg-surface border border-white/10 hover:border-fuchsia-500/50 rounded-3xl p-8 flex flex-col justify-between space-y-8 cursor-pointer transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl hover:shadow-fuchsia-500/10 group"
        >
          <div className="space-y-6">
            {/* Visual Icon / Avatar Preview */}
            <div className="w-20 h-20 rounded-2xl bg-fuchsia-500/10 border border-fuchsia-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
              <svg className="w-10 h-10 text-fuchsia-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-fuchsia-400 bg-fuchsia-500/10 px-2 py-0.5 rounded-md font-mono">
                  Persona Engine
                </span>
                <span className="text-[10px] text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded-md font-mono">
                  98.4% Lock
                </span>
              </div>
              <h2 className="text-xl font-bold text-white group-hover:text-fuchsia-400 transition-colors">
                AI Influencer
              </h2>
              <p className="text-xs text-neutral-400 leading-relaxed">
                Train a consistent virtual persona using reference facial locks, anchor seeds, and multi-angle verification matrices.
              </p>
            </div>
          </div>

          <div className="pt-4 border-t border-white/5 flex items-center justify-between">
            <span className="text-xs font-bold text-neutral-300 group-hover:text-white">
              Launch Influencer Studio
            </span>
            <span className="w-8 h-8 rounded-full bg-white/5 group-hover:bg-fuchsia-500 text-white flex items-center justify-center transition-colors">
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="5" y1="12" x2="19" y2="12" />
                <polyline points="12 5 19 12 12 19" />
              </svg>
            </span>
          </div>
        </div>

        {/* Card 2: Mood Board */}
        <div
          onClick={() => onSelectAction('moodboard')}
          className="bg-surface border border-white/10 hover:border-amber-500/50 rounded-3xl p-8 flex flex-col justify-between space-y-8 cursor-pointer transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl hover:shadow-amber-500/10 group"
        >
          <div className="space-y-6">
            {/* Visual Icon Preview */}
            <div className="w-20 h-20 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
              <svg className="w-10 h-10 text-amber-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <rect width="7" height="9" x="3" y="3" rx="1" />
                <rect width="7" height="5" x="14" y="3" rx="1" />
                <rect width="7" height="9" x="14" y="12" rx="1" />
                <rect width="7" height="5" x="3" y="16" rx="1" />
              </svg>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-md font-mono">
                  Curation Hub
                </span>
                <span className="text-[10px] text-neutral-400 font-mono">
                  1,604 Drops
                </span>
              </div>
              <h2 className="text-xl font-bold text-white group-hover:text-amber-400 transition-colors">
                Mood Board
              </h2>
              <p className="text-xs text-neutral-400 leading-relaxed">
                Curate themed collections of inspiration drops, configure aesthetic tags, export prompt bundles, or animate batch video reels.
              </p>
            </div>
          </div>

          <div className="pt-4 border-t border-white/5 flex items-center justify-between">
            <span className="text-xs font-bold text-neutral-300 group-hover:text-white">
              Create Mood Board
            </span>
            <span className="w-8 h-8 rounded-full bg-white/5 group-hover:bg-amber-400 group-hover:text-black text-white flex items-center justify-center transition-colors">
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="5" y1="12" x2="19" y2="12" />
                <polyline points="12 5 19 12 12 19" />
              </svg>
            </span>
          </div>
        </div>

        {/* Card 3: New Project */}
        <div
          onClick={() => onSelectAction('project')}
          className="bg-surface border border-white/10 hover:border-cyan-500/50 rounded-3xl p-8 flex flex-col justify-between space-y-8 cursor-pointer transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl hover:shadow-cyan-500/10 group"
        >
          <div className="space-y-6">
            {/* Visual Icon Preview */}
            <div className="w-20 h-20 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
              <svg className="w-10 h-10 text-cyan-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
              </svg>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded-md font-mono">
                  Generation Canvas
                </span>
                <span className="text-[10px] text-accent-ink font-bold bg-[#d1fe17]/10 px-2 py-0.5 rounded-md font-mono">
                  Studio
                </span>
              </div>
              <h2 className="text-xl font-bold text-white group-hover:text-cyan-400 transition-colors">
                New Project
              </h2>
              <p className="text-xs text-neutral-400 leading-relaxed">
                Start a fresh canvas generation project to test prompts, aspect ratios, model checkpoints, and creative iterations.
              </p>
            </div>
          </div>

          <div className="pt-4 border-t border-white/5 flex items-center justify-between">
            <span className="text-xs font-bold text-neutral-300 group-hover:text-white">
              Open Canvas Project
            </span>
            <span className="w-8 h-8 rounded-full bg-white/5 group-hover:bg-cyan-400 group-hover:text-black text-white flex items-center justify-center transition-colors">
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="5" y1="12" x2="19" y2="12" />
                <polyline points="12 5 19 12 12 19" />
              </svg>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
