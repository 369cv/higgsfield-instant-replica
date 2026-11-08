import React, { useState } from 'react';
import { Plus, ChevronRight, Sparkles, ChevronDown } from 'lucide-react';

interface FloatingPromptBarProps {
  onGenerate: (prompt: string) => void;
  onOpenUpload?: () => void;
}

export const FloatingPromptBar: React.FC<FloatingPromptBarProps> = ({
  onGenerate,
  onOpenUpload
}) => {
  const [prompt, setPrompt] = useState('');
  const [aspectRatio, setAspectRatio] = useState('3:4');
  const [batchCount, setBatchCount] = useState(4);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) return;
    onGenerate(prompt);
    setPrompt('');
  };

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 w-[94%] max-w-4xl">
      <form
        onSubmit={handleSubmit}
        className="rounded-2xl bg-[#14151b]/95 backdrop-blur-xl border border-[#282b37] p-2 md:p-2.5 shadow-2xl flex flex-col md:flex-row items-center gap-2"
      >
        {/* Input Text Area */}
        <div className="flex-1 flex items-center gap-2 px-3 py-1.5 w-full">
          <input
            type="text"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Upload image as a prompt or Describe the scene you imagine"
            className="w-full bg-transparent text-xs text-white placeholder-[#717684] focus:outline-none"
          />
        </div>

        {/* Toolbar Controls */}
        <div className="flex items-center gap-1.5 flex-wrap justify-between md:justify-end w-full md:w-auto px-1">
          {/* Plus / Upload */}
          <button
            type="button"
            onClick={onOpenUpload}
            className="w-7 h-7 rounded-lg bg-[#1f212a] hover:bg-[#282b37] flex items-center justify-center text-[#babdc5] hover:text-white transition-colors"
            title="Upload image"
          >
            <Plus className="w-3.5 h-3.5" />
          </button>

          {/* Model Pill */}
          <div className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#1f212a] text-[#dee0e3] text-[11px] font-medium border border-[#2e313d] cursor-pointer hover:bg-[#282b37]">
            <Sparkles className="w-3 h-3 text-[#d1fe17]" />
            <span>Soul Engine</span>
            <ChevronRight className="w-3 h-3 text-[#717684]" />
          </div>

          {/* Aspect Ratio */}
          <div className="flex items-center gap-1 px-2 py-1 rounded-lg bg-[#1f212a] text-[#babdc5] text-[11px] font-medium border border-[#2e313d] cursor-pointer hover:text-white">
            <span>{aspectRatio}</span>
          </div>

          {/* Resolution */}
          <div className="flex items-center gap-1 px-2 py-1 rounded-lg bg-[#1f212a] text-[#babdc5] text-[11px] font-medium border border-[#2e313d]">
            <span>1.5k</span>
          </div>

          {/* Batch count: 4 */}
          <div className="flex items-center gap-1 px-2 py-1 rounded-lg bg-[#1f212a] text-[#babdc5] text-[11px] font-mono border border-[#2e313d]">
            <span>- 4 +</span>
          </div>

          {/* Style Thumbnail */}
          <div className="relative w-12 h-7 rounded-lg overflow-hidden border border-[#2e313d] flex items-center justify-center bg-[#1f212a] group cursor-pointer">
            <span className="text-[9px] font-bold text-white uppercase tracking-wider z-10">
              General
            </span>
            <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20" />
          </div>

          {/* Generate Button in Lime */}
          <button
            type="submit"
            className="px-4 py-2 rounded-xl bg-[#d1fe17] hover:bg-[#bfee00] text-black font-extrabold text-xs flex items-center gap-1.5 transition-transform active:scale-95 shadow-md shadow-[#d1fe17]/25"
          >
            <span>GENERATE</span>
            <svg className="w-3 h-3 opacity-80" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="9 10 4 15 9 20" />
              <path d="M20 4v7a4 4 0 0 1-4 4H4" />
            </svg>
          </button>
        </div>
      </form>
    </div>
  );
};
