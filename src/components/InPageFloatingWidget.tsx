import React, { useState } from 'react';
import { X, Sparkles, User, RefreshCw, Wand2 } from 'lucide-react';
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
  initialPrompt = "A three-quarter view, medium close-up photograph centers on a young Caucasian woman in her mid-20s seated in the driver's seat of a luxury sports car...",
  souls,
  onGenerate
}) => {
  const [useSoul, setUseSoul] = useState(true);
  const [selectedSoulId, setSelectedSoulId] = useState<string>(souls[0]?.id || 'soul-savage');
  const [aspectRatio, setAspectRatio] = useState<string>('1:1');
  const [prompt, setPrompt] = useState<string>(initialPrompt);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onGenerate({
      prompt,
      soulId: useSoul ? selectedSoulId : undefined,
      aspectRatio,
      referenceImage
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
      <div className="relative w-full max-w-lg rounded-3xl bg-[#121318] border border-[#282b37] shadow-2xl p-6 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[#23252e]">
          <div className="flex items-center gap-2">
            <span className="w-7 h-7 rounded-lg bg-black flex items-center justify-center text-lime font-black text-base border border-[#2e313d]">
              〰
            </span>
            <span className="font-bold text-sm tracking-tight text-white">Recreate with Soul</span>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-lime/15 text-lime border border-lime/30">
              Higgsfield 2.0
            </span>
          </div>

          <button
            onClick={onClose}
            className="w-7 h-7 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-[#717684] hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          {/* Reference Image + Prompt preview */}
          <div className="flex gap-3 bg-[#181920] p-3 rounded-2xl border border-[#23252e]">
            <img
              src={referenceImage}
              alt="Source"
              className="w-20 h-20 rounded-xl object-cover border border-white/10 flex-shrink-0"
            />
            <div className="flex-1 space-y-1.5">
              <div className="flex items-center justify-between text-[11px] text-[#717684]">
                <span>VISION PROMPT DECONSTRUCTION</span>
                <span className="text-lime flex items-center gap-1 font-medium">
                  <Wand2 className="w-3 h-3" /> Auto-Extracted
                </span>
              </div>
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                rows={2}
                className="w-full bg-transparent text-xs text-[#dee0e3] resize-none focus:outline-none"
              />
            </div>
          </div>

          {/* Soul Identity Toggle */}
          <div className="flex items-center justify-between p-3 rounded-2xl bg-[#181920] border border-[#23252e]">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-lime/10 border border-lime/20 flex items-center justify-center text-lime">
                <User className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs font-semibold text-white">Apply Character Soul</div>
                <div className="text-[11px] text-[#717684]">
                  {useSoul ? 'Keeps chosen facial identity & likeness' : 'Generates 4 variations of original scene'}
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setUseSoul(!useSoul)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                useSoul ? 'bg-lime' : 'bg-[#282b37]'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  useSoul ? 'translate-x-6 bg-black' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          {/* Avatar Carousel (if Soul active) */}
          {useSoul && (
            <div className="space-y-2">
              <div className="text-xs font-semibold text-[#717684] uppercase tracking-wider">
                Select Identity
              </div>
              <div className="grid grid-cols-3 gap-2">
                {souls.map((soul) => (
                  <button
                    key={soul.id}
                    type="button"
                    onClick={() => setSelectedSoulId(soul.id)}
                    className={`flex flex-col items-center gap-2 p-2.5 rounded-xl border text-center transition-all ${
                      selectedSoulId === soul.id
                        ? 'bg-lime/10 border-lime text-white'
                        : 'bg-[#181920] border-[#23252e] text-[#8e93a4] hover:border-[#3a3e4e]'
                    }`}
                  >
                    <img
                      src={soul.avatarUrl}
                      alt={soul.name}
                      className="w-10 h-10 rounded-full object-cover border border-white/10"
                    />
                    <span className="text-[11px] font-medium truncate w-full">{soul.name}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Aspect Ratio Row */}
          <div className="space-y-1.5">
            <div className="text-xs font-semibold text-[#717684] uppercase tracking-wider">
              Aspect Ratio
            </div>
            <div className="grid grid-cols-4 gap-2">
              {['1:1', '9:16', '16:9', '3:4'].map((ratio) => (
                <button
                  key={ratio}
                  type="button"
                  onClick={() => setAspectRatio(ratio)}
                  className={`py-1.5 rounded-xl text-xs font-medium border transition-colors ${
                    aspectRatio === ratio
                      ? 'bg-white/15 border-white text-white'
                      : 'bg-[#181920] border-[#23252e] text-[#717684] hover:text-white'
                  }`}
                >
                  {ratio}
                </button>
              ))}
            </div>
          </div>

          {/* Submit Action */}
          <button
            type="submit"
            className="w-full py-3 rounded-2xl bg-lime hover:bg-lime-hover text-black font-bold text-xs flex items-center justify-center gap-2 transition-transform active:scale-[0.98] shadow-lg shadow-lime/25"
          >
            <Sparkles className="w-4 h-4 fill-black" />
            <span>Generate 4 Variations (Soul 2.0)</span>
          </button>
        </form>
      </div>
    </div>
  );
};
