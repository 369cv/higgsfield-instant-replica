import React, { useState, useEffect } from 'react';

interface GeneratingQueueProps {
  isGenerating?: boolean;
  progressText?: string;
  activeCount?: number;
  onCancel?: () => void;
}

export const GeneratingQueue: React.FC<GeneratingQueueProps> = ({
  isGenerating = true,
  progressText = 'Rendering',
  activeCount = 4,
  onCancel,
}) => {
  const [stepIndex, setStepIndex] = useState(0);

  const steps = [
    'Initializing model latents...',
    'Synthesizing prompt context...',
    'Sampling diffusion steps...',
    'Refining high-frequency details...',
  ];

  useEffect(() => {
    if (!isGenerating) return;
    const interval = setInterval(() => {
      setStepIndex((prev) => (prev + 1) % steps.length);
    }, 2200);
    return () => clearInterval(interval);
  }, [isGenerating]);

  if (!isGenerating) return null;

  return (
    <div className="w-full mb-3 px-2 sm:px-0">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-3">
        {Array.from({ length: activeCount }).map((_, idx) => (
          <div
            key={idx}
            className="relative aspect-[3/4] w-full rounded-2xl bg-base border border-white/10 overflow-hidden flex flex-col justify-between p-4 group select-none shadow-xl transition-all"
          >
            {/* Ambient Shimmer Background Gradient */}
            <div className="absolute inset-0 bg-gradient-to-b from-white/[0.03] via-transparent to-black/60 pointer-events-none" />

            {/* Top Status Header */}
            <div className="relative z-10 flex items-center justify-between">
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/5 border border-white/10 backdrop-blur-md">
                <span className="w-1.5 h-1.5 rounded-full bg-[#d1fe17] animate-pulse" />
                <span className="text-white text-[10px] font-semibold tracking-wide uppercase">
                  {progressText}
                </span>
              </div>

              <span className="text-[10px] text-neutral-400 font-mono">
                {idx + 1}/{activeCount}
              </span>
            </div>

            {/* Center Generative Wave / Visual Loader */}
            <div className="relative z-10 flex flex-col items-center justify-center gap-3.5 my-auto">
              {/* Delicate concentric pulsing orbital rings */}
              <div className="relative w-14 h-14 flex items-center justify-center">
                <div className="absolute inset-0 rounded-full border border-[#d1fe17]/20 animate-ping opacity-25" />
                <div className="absolute inset-1 rounded-full border border-dashed border-[#d1fe17]/40 animate-spin" style={{ animationDuration: '8s' }} />

                {/* Inner Glow Core with Starburst Vector */}
                <div className="w-8 h-8 rounded-full bg-[#d1fe17]/10 flex items-center justify-center text-accent-ink">
                  <svg className="w-4 h-4 animate-pulse" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="m12 3-1.9 5.8a2 2 0 0 1-1.3 1.3L3 12l5.8 1.9a2 2 0 0 1 1.3 1.3L12 21l1.9-5.8a2 2 0 0 1 1.3-1.3L21 12l-5.8-1.9a2 2 0 0 1-1.3-1.3Z" />
                  </svg>
                </div>
              </div>

              {/* Dynamic Status Text */}
              <div className="text-center space-y-1">
                <p className="text-[11px] font-medium text-neutral-300">
                  {steps[(stepIndex + idx) % steps.length]}
                </p>
                <p className="text-[9px] text-neutral-500 font-mono">
                  Iterating checkpoint latents
                </p>
              </div>
            </div>

            {/* Bottom Progress Bar */}
            <div className="relative z-10 space-y-1.5">
              <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-[#d1fe17] to-cyan-400 rounded-full animate-pulse transition-all duration-700"
                  style={{ width: `${((stepIndex + 1) / steps.length) * 100}%` }}
                />
              </div>

              <div className="flex items-center justify-between text-[9px] text-neutral-500 font-mono">
                <span>Pass {(stepIndex % 4) + 1} of 4</span>
                <span>{Math.round(((stepIndex + 1) / steps.length) * 100)}%</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
