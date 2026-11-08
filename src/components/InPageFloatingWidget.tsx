import React, { useState } from 'react';
import { X, Sparkles } from 'lucide-react';
import { SoulCharacter } from '../types';

interface InPageFloatingWidgetProps {
  isOpen: boolean;
  onClose: () => void;
  referenceImage: string;
  initialPrompt?: string;
  souls: SoulCharacter[];
  onGenerate: (data: {
    prompt: string;
    soulId?: string;
    aspectRatio: string;
    referenceImage: string;
  }) => void;
}

export const InPageFloatingWidget: React.FC<InPageFloatingWidgetProps> = ({
  isOpen,
  onClose,
  referenceImage,
  initialPrompt = "",
  souls,
  onGenerate
}) => {
  const [selectedSoulId, setSelectedSoulId] = useState<string>(souls[0]?.id || '');
  const [aspectRatio, setAspectRatio] = useState<string>('3:4');
  const [prompt, setPrompt] = useState<string>(initialPrompt);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onGenerate({
      prompt,
      soulId: selectedSoulId || undefined,
      aspectRatio,
      referenceImage
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
      <div className="relative w-full max-w-lg rounded-2xl bg-surface border border-line shadow-2xl p-5 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-line">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-surface border border-line flex items-center justify-center p-1">
              <img src="/icons/icon32.png" alt="" className="w-full h-full object-contain" />
            </div>
            <span className="font-semibold text-sm tracking-tight text-white">Recreate with Soul</span>
          </div>

          <button
            onClick={onClose}
            className="w-7 h-7 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-muted hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          {/* Style Reference (Official Higgsfield component) */}
          <div className="space-y-1.5">
            <div className="text-xs font-semibold text-muted uppercase tracking-wider">
              Style Reference
            </div>
            <div className="flex gap-3 bg-surface p-3 rounded-xl border border-line">
              {referenceImage && (
                <img
                  src={referenceImage}
                  alt="Reference"
                  className="w-16 h-16 rounded-lg object-cover border border-white/10 flex-shrink-0"
                />
              )}
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Enter prompt description or leave as style reference..."
                rows={2}
                className="w-full bg-transparent text-xs text-soft resize-none focus:outline-none placeholder-muted"
              />
            </div>
          </div>

          {/* Character / Soul Selector (if available) */}
          {souls.length > 0 && (
            <div className="space-y-1.5">
              <div className="text-xs font-semibold text-muted uppercase tracking-wider">
                Character
              </div>
              <div className="grid grid-cols-3 gap-2">
                {souls.map((soul) => (
                  <button
                    key={soul.id}
                    type="button"
                    onClick={() => setSelectedSoulId(soul.id)}
                    className={`flex items-center gap-2 p-2 rounded-xl border transition-all ${
                      selectedSoulId === soul.id
                        ? 'bg-[#d1fe17]/10 border-[#d1fe17] text-white'
                        : 'bg-surface border-line text-muted hover:border-line'
                    }`}
                  >
                    <img
                      src={soul.avatarUrl}
                      alt={soul.name}
                      className="w-7 h-7 rounded-full object-cover border border-white/10"
                    />
                    <span className="text-xs font-medium truncate">{soul.name}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Aspect Ratio Selector */}
          <div className="space-y-1.5">
            <div className="text-xs font-semibold text-muted uppercase tracking-wider">
              Aspect ratio
            </div>
            <div className="grid grid-cols-4 gap-2">
              {['3:4', '1:1', '9:16', '16:9'].map((ratio) => (
                <button
                  key={ratio}
                  type="button"
                  onClick={() => setAspectRatio(ratio)}
                  className={`py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                    aspectRatio === ratio
                      ? 'bg-white/15 border-white text-white'
                      : 'bg-surface border-line text-muted hover:text-white'
                  }`}
                >
                  {ratio}
                </button>
              ))}
            </div>
          </div>

          {/* Generate CTA */}
          <button
            type="submit"
            className="w-full py-2.5 rounded-xl bg-[#d1fe17] hover:bg-[#bfee00] text-black font-bold text-xs flex items-center justify-center gap-1.5 transition-transform active:scale-[0.98] shadow-md shadow-[#d1fe17]/20"
          >
            <Sparkles className="w-3.5 h-3.5 fill-black" />
            <span>Generate</span>
          </button>
        </form>
      </div>
    </div>
  );
};
