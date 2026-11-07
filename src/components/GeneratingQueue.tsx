import React from 'react';

interface GeneratingQueueProps {
  isGenerating?: boolean;
  progressText?: string;
  activeCount?: number;
}

export const GeneratingQueue: React.FC<GeneratingQueueProps> = ({
  isGenerating = true,
  progressText = 'Generating',
  activeCount = 4
}) => {
  if (!isGenerating) return null;

  return (
    <div className="w-full mb-1 sm:mb-1.5">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-1 sm:gap-1.5">
        {Array.from({ length: activeCount }).map((_, idx) => (
          <div
            key={idx}
            className="relative aspect-[3/4] w-full bg-[#0d0e12] overflow-hidden flex flex-col items-center justify-center p-4 group select-none"
          >
            {/* Vintage subtle vignette */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/60 pointer-events-none" />

            {/* Top-left generating badge */}
            <div className="absolute top-2.5 left-2.5 z-10 flex items-center gap-1.5 px-2.5 py-1 rounded bg-black/60 backdrop-blur-md">
              <span className="w-2 h-2 rounded-full bg-[#d1fe17] animate-ping" />
              <span className="text-[#d1fe17] text-[10px] font-semibold tracking-wider uppercase">
                {progressText}
              </span>
            </div>

            {/* Glowing Green Circular Spinner Animation */}
            <div className="relative z-10 flex flex-col items-center justify-center gap-3">
              <div className="relative w-12 h-12 flex items-center justify-center">
                {/* Soft ambient lime glow */}
                <div className="absolute inset-0 rounded-full bg-[#d1fe17]/25 blur-lg animate-pulse" />
                {/* Rotating SVG circular ring */}
                <svg
                  className="w-10 h-10 animate-spin text-[#d1fe17]"
                  viewBox="0 0 24 24"
                  fill="none"
                >
                  <circle
                    className="opacity-20"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="2.5"
                  />
                  <path
                    className="opacity-100"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
              </div>
              <span className="text-[11px] font-medium text-white/70 tracking-wide">
                Pass {idx + 1} of 4
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
