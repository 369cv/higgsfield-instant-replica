import React from 'react';

interface GeneratingQueueProps {
  isGenerating: boolean;
  progressText?: string;
  activeCount?: number;
}

export const GeneratingQueue: React.FC<GeneratingQueueProps> = ({
  isGenerating,
  progressText = 'Generating',
  activeCount = 4
}) => {
  if (!isGenerating) return null;

  return (
    <div className="w-full mb-6">
      {/* 4 Generating Tiles Across - Exact Replica of User Screenshot */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {Array.from({ length: activeCount }).map((_, idx) => (
          <div
            key={idx}
            className="relative aspect-square w-full rounded-xl bg-[#131313] border border-[#23252e] overflow-hidden flex flex-col justify-between p-3 shadow-lg group"
          >
            {/* Generating Lime Badge in Top Left */}
            <div className="self-start inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-black/70 backdrop-blur-md border border-white/5">
              <span className="text-[#d1fe17] text-xs font-semibold animate-soft-pulse">◐</span>
              <span className="text-[#d1fe17] text-[11px] font-medium tracking-wide">
                {progressText}
              </span>
            </div>

            {/* Subtle Shimmering Ambient Glow inside tile */}
            <div className="absolute inset-0 bg-gradient-to-t from-white/[0.03] to-transparent pointer-events-none animate-pulse" />

            {/* Bottom status hint */}
            <div className="text-[10px] text-[#5e636e] font-mono tracking-tight self-end z-10">
              Pass {idx + 1}/4 • 2k Soul
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
