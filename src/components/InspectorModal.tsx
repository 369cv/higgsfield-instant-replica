import React, { useState, useEffect } from 'react';
import { X, Copy, Check, Heart } from 'lucide-react';
import { VaultItem } from '../types';

interface InspectorModalProps {
  item: VaultItem | null;
  onClose: () => void;
  isFavorited?: boolean;
  onToggleFavorite?: (id: string) => void;
}

/**
 * Prompt-only inspector: the generated image plus its copy-ready prompt.
 * No reference/original image, no details table, no edit or comments tabs.
 */
export const InspectorModal: React.FC<InspectorModalProps> = ({
  item,
  onClose,
  isFavorited = false,
  onToggleFavorite,
}) => {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setCopied(false);
  }, [item]);

  useEffect(() => {
    if (!item) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [item, onClose]);

  if (!item) return null;

  const image = item.imageUrl || item.fullImageUrl;
  const prompt = (item.prompt || '').replace(/\nHEX VALUES:.*$/s, '').trim();

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(prompt);
    } catch {
      // Fallback for browsers without async clipboard permission
      const ta = document.createElement('textarea');
      ta.value = prompt;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      ta.remove();
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col md:flex-row bg-[#070709] overflow-hidden"
      role="dialog"
      aria-modal="true"
      aria-label="Prompt"
    >
      {/* Image stage: top on mobile, left on desktop */}
      <div className="relative w-full md:flex-1 h-[45vh] md:h-full flex items-center justify-center bg-black shrink-0 overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center blur-3xl opacity-20 scale-110 pointer-events-none"
          style={{ backgroundImage: `url(${image})` }}
        />
        <img
          src={image}
          alt=""
          decoding="async"
          className="relative z-10 max-h-full max-w-full object-contain p-3 md:p-8"
        />
        <button
          onClick={onClose}
          className="absolute top-3 right-3 md:top-5 md:left-5 md:right-auto z-20 w-9 h-9 rounded-full bg-black/70 backdrop-blur-md border border-white/10 flex items-center justify-center text-white/80 hover:text-white cursor-pointer"
          aria-label="Close"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Prompt panel: bottom on mobile, right on desktop */}
      <div className="flex-1 md:flex-none md:w-[420px] min-h-0 flex flex-col bg-[#0d0e12] border-t md:border-t-0 md:border-l border-white/[0.06]">
        <div className="px-5 pt-5 pb-2 text-[11px] font-semibold tracking-[0.14em] uppercase text-[#717684]">
          Prompt
        </div>

        <div className="flex-1 min-h-0 overflow-y-auto px-5 pb-4">
          <p className="text-[13.5px] leading-relaxed text-[#d8dbe2] whitespace-pre-wrap select-text">
            {prompt}
          </p>
        </div>

        <div
          className="p-4 border-t border-white/[0.06] flex items-center gap-2"
          style={{ paddingBottom: 'max(1rem, env(safe-area-inset-bottom))' }}
        >
          <button
            onClick={handleCopy}
            className="flex-1 h-12 rounded-xl bg-[#d1fe17] hover:bg-[#bfee00] text-black font-bold text-sm flex items-center justify-center gap-2 active:scale-[0.98] transition-transform cursor-pointer"
          >
            {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            {copied ? 'Copied' : 'Copy prompt'}
          </button>
          {onToggleFavorite && (
            <button
              onClick={() => onToggleFavorite(item.id)}
              className={`w-12 h-12 rounded-xl bg-white/[0.05] hover:bg-white/10 border border-white/10 flex items-center justify-center cursor-pointer ${
                isFavorited ? 'text-red-500' : 'text-neutral-300'
              }`}
              aria-label={isFavorited ? 'Remove from favourites' : 'Save to favourites'}
            >
              <Heart className={`w-5 h-5 ${isFavorited ? 'fill-red-500' : ''}`} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
