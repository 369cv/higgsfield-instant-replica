import React, { useState, useEffect } from 'react';
import {
  X,
  Copy,
  Check,
  Video,
  UserPlus,
  Download,
  Heart,
  Share2,
  MoreHorizontal,
  ChevronDown,
  ChevronUp,
  Upload,
  Maximize2,
  FileText,
  Info
} from 'lucide-react';
import { VaultItem } from '../types';

interface InspectorModalProps {
  item: VaultItem | null;
  onClose: () => void;
  onRecreate: (item: VaultItem) => void;
  onTurnToVideo: (item: VaultItem) => void;
  onSelectReferenceItem?: (refUrl: string) => void;
  isFavorited?: boolean;
  onToggleFavorite?: (id: string) => void;
}

export const InspectorModal: React.FC<InspectorModalProps> = ({
  item,
  onClose,
  onRecreate,
  onTurnToVideo,
  isFavorited = false,
  onToggleFavorite
}) => {
  const [activeTab, setActiveTab] = useState<'info' | 'edit' | 'comments'>('info');
  const [copied, setCopied] = useState(false);
  const [expandedPrompt, setExpandedPrompt] = useState(false);
  const [inspectingRef, setInspectingRef] = useState(false);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!item) return null;

  const previewImage = item.imageUrl || item.fullImageUrl;
  const fullImage = item.fullImageUrl || item.imageUrl;
  const currentDisplayImage = inspectingRef ? (item.referenceImage || previewImage) : previewImage;

  const handleCopy = () => {
    navigator.clipboard.writeText(item.prompt);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = inspectingRef ? (item.referenceImage || fullImage) : fullImage;
    link.download = `halalfans-${item.id}${inspectingRef ? '-reference' : ''}.png`;
    link.target = '_blank';
    link.click();
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col md:flex-row w-screen h-screen bg-[#070709] overflow-hidden select-none">
      {/* Left Side: Full-Screen Hero Image Display with Ambient Glow Backdrop */}
      <div className="flex-1 h-full relative flex items-center justify-center overflow-hidden bg-black">
        {/* Soft atmospheric ambient glow matching image colors */}
        <div
          className="absolute inset-0 bg-cover bg-center blur-3xl opacity-20 scale-110 pointer-events-none"
          style={{ backgroundImage: `url(${currentDisplayImage})` }}
        />

        {/* Crisp Center Stage Image - Zero text overlays */}
        <img
          src={currentDisplayImage}
          alt=""
          className="relative max-h-full max-w-full object-contain shadow-2xl transition-all duration-200 z-10"
        />

        {/* Minimal Fullscreen / Open in New Tab control at bottom right */}
        <div className="absolute bottom-5 right-5 z-20">
          <button
            onClick={() => window.open(currentDisplayImage, '_blank')}
            className="w-8 h-8 rounded-lg bg-black/60 backdrop-blur-md border border-white/10 hover:bg-black/85 flex items-center justify-center text-white/70 hover:text-white transition-colors cursor-pointer shadow-lg"
            title="Open full size"
          >
            <Maximize2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Right Side: Exact Sidebar Drawer Structure */}
      <div className="w-full md:w-[380px] lg:w-[400px] h-full bg-[#0d0e12] border-l border-[#1a1b22] flex flex-col justify-between shrink-0 z-20 overflow-hidden">
        {/* Top Header with User Info & Close */}
        <div className="px-4 pt-4 pb-3 flex items-center justify-between border-b border-[#181920]">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-full overflow-hidden bg-black ring-1 ring-white/10 flex-shrink-0">
              <img
                src="/icons/icon128.png"
                alt="Halal Fans"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex flex-col">
              <span className="font-semibold text-[13px] tracking-tight text-white leading-tight">
                Halal Fans
              </span>
              <span className="text-[11px] text-[#717684] leading-tight">
                Author
              </span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-7 h-7 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-[#717684] hover:text-white transition-colors cursor-pointer"
            title="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Navigation Tabs (Info, Edit, Comments) */}
        <div className="px-4 pt-3 pb-2 border-b border-[#181920]">
          <div className="grid grid-cols-3 p-1 rounded-xl bg-[#15161c] border border-white/5 text-xs font-medium">
            <button
              onClick={() => setActiveTab('info')}
              className={`py-1.5 rounded-lg text-center transition-all ${
                activeTab === 'info'
                  ? 'bg-[#22242e] text-white shadow-sm font-semibold'
                  : 'text-[#717684] hover:text-white'
              }`}
            >
              Info
            </button>
            <button
              onClick={() => setActiveTab('edit')}
              className={`py-1.5 rounded-lg text-center transition-all ${
                activeTab === 'edit'
                  ? 'bg-[#22242e] text-white shadow-sm font-semibold'
                  : 'text-[#717684] hover:text-white'
              }`}
            >
              Edit
            </button>
            <button
              onClick={() => setActiveTab('comments')}
              className={`py-1.5 rounded-lg text-center transition-all ${
                activeTab === 'comments'
                  ? 'bg-[#22242e] text-white shadow-sm font-semibold'
                  : 'text-[#717684] hover:text-white'
              }`}
            >
              Comments
            </button>
          </div>
        </div>

        {/* Scrollable Body Content */}
        <div className="p-4 space-y-4 overflow-y-auto flex-1">
          {/* PROMPT Section */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-[11px] font-semibold tracking-wider text-[#717684] uppercase">
              <span className="flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-[#717684]" />
                <span>PROMPT</span>
              </span>
              <button
                onClick={handleCopy}
                className="flex items-center gap-1 text-[11px] font-medium text-[#9ca3af] hover:text-white transition-colors bg-white/5 hover:bg-white/10 px-2 py-0.5 rounded-md cursor-pointer"
              >
                {copied ? <Check className="w-3 h-3 text-[#d1fe17]" /> : <Copy className="w-3 h-3 text-white/70" />}
                <span>{copied ? 'Copied' : 'Copy'}</span>
              </button>
            </div>

            {/* Prompt Box with Reference Thumbnail */}
            <div className="rounded-xl bg-[#14151b] border border-[#21232d] p-3 flex gap-3 items-start">
              {/* Reference Image Thumbnail with Upload Icon Overlay */}
              {item.referenceImage ? (
                <div
                  onClick={() => setInspectingRef(!inspectingRef)}
                  className={`relative w-14 h-14 rounded-lg overflow-hidden shrink-0 cursor-pointer border transition-all ${
                    inspectingRef
                      ? 'border-[#d1fe17] ring-2 ring-[#d1fe17]/40'
                      : 'border-white/15 hover:border-white/40'
                  }`}
                  title={inspectingRef ? "Show generated output" : "Click to view reference photo"}
                >
                  <img
                    src={item.referenceImage}
                    alt=""
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-x-0 bottom-0 bg-black/60 backdrop-blur-xs py-0.5 flex items-center justify-center">
                    <Upload className="w-2.5 h-2.5 text-white/90" />
                  </div>
                </div>
              ) : null}

              {/* Prompt Text with Expansion */}
              <div className="flex-1 text-[12px] leading-relaxed text-[#d1d5db] font-normal">
                <p className={expandedPrompt ? '' : 'line-clamp-4'}>
                  {item.prompt}
                </p>
                <button
                  onClick={() => setExpandedPrompt(!expandedPrompt)}
                  className="text-[#717684] hover:text-[#babdc5] text-[11px] font-medium mt-1.5 flex items-center gap-1 transition-colors cursor-pointer"
                >
                  {expandedPrompt ? (
                    <>Show less <ChevronUp className="w-3 h-3" /></>
                  ) : (
                    <>See all <ChevronDown className="w-3 h-3" /></>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* DETAILS Section */}
          <div className="space-y-2 pt-1">
            <div className="text-[11px] font-semibold uppercase tracking-wider text-[#717684] flex items-center gap-1.5">
              <Info className="w-3.5 h-3.5 text-[#717684]" />
              <span>DETAILS</span>
            </div>

            <div className="space-y-1 text-[12px]">
              <div className="flex justify-between py-2 border-b border-[#1b1c24]">
                <span className="text-[#717684]">Model</span>
                <span className="text-white font-medium">{item.model}</span>
              </div>

              <div className="flex justify-between py-2 border-b border-[#1b1c24]">
                <span className="text-[#717684]">Moodboard</span>
                <span className="text-white font-medium flex items-center gap-1">
                  {item.moodboard}
                </span>
              </div>

              <div className="flex justify-between py-2 border-b border-[#1b1c24]">
                <span className="text-[#717684]">Quality</span>
                <span className="text-white font-medium">{item.quality}</span>
              </div>

              <div className="flex justify-between py-2 border-b border-[#1b1c24]">
                <span className="text-[#717684]">Size</span>
                <span className="text-white font-mono">{item.size}</span>
              </div>

              <div className="flex justify-between py-2">
                <span className="text-[#717684]">Created</span>
                <span className="text-[#9ca3af]">{item.createdAt}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Sticky Bottom Actions - Exact 3-Row Layout from Higgsfield */}
        <div className="p-4 bg-[#0d0e12] border-t border-[#1a1b22] space-y-2.5 shrink-0">
          {/* Row 1: Big Lime 'Turn to video' button */}
          <button
            onClick={() => onTurnToVideo(item)}
            className="w-full py-2.5 rounded-xl bg-[#d1fe17] hover:bg-[#bfee00] text-black font-extrabold text-[12px] flex items-center justify-center gap-2 transition-transform active:scale-[0.98] shadow-md shadow-[#d1fe17]/20 cursor-pointer"
          >
            <Video className="w-4 h-4 fill-black" />
            <span>Turn to video</span>
          </button>

          {/* Row 2: Recreate & Reference side-by-side */}
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => onRecreate(item)}
              className="py-2 px-3 rounded-xl bg-[#16171d] hover:bg-[#20222a] text-[#e2e4ea] text-[12px] font-semibold flex items-center justify-center gap-1.5 border border-[#262833] transition-colors cursor-pointer"
            >
              <Copy className="w-3.5 h-3.5 text-white/80" />
              <span>Recreate</span>
            </button>

            <button
              onClick={() => onRecreate(item)}
              className="py-2 px-3 rounded-xl bg-[#16171d] hover:bg-[#20222a] text-[#e2e4ea] text-[12px] font-semibold flex items-center justify-center gap-1.5 border border-[#262833] transition-colors cursor-pointer"
            >
              <UserPlus className="w-3.5 h-3.5 text-white/90" />
              <span>Reference</span>
            </button>
          </div>

          {/* Row 3: Download Pill + Heart + Share + More */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleDownload}
              className="flex-1 py-2 px-3 rounded-xl bg-[#16171d] hover:bg-[#20222a] text-[#babdc5] hover:text-white border border-[#262833] text-[12px] font-medium flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              title="Download image"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download</span>
            </button>

            <button
              onClick={() => onToggleFavorite && onToggleFavorite(item.id)}
              className={`p-2 rounded-xl bg-[#16171d] hover:bg-[#20222a] border border-[#262833] transition-colors cursor-pointer ${
                isFavorited ? 'text-red-500' : 'text-[#babdc5] hover:text-white'
              }`}
              title={isFavorited ? "Remove from favorites" : "Favorite"}
            >
              <Heart className={`w-4 h-4 ${isFavorited ? 'fill-red-500 text-red-500' : ''}`} />
            </button>

            <button
              className="p-2 rounded-xl bg-[#16171d] hover:bg-[#20222a] text-[#babdc5] hover:text-white border border-[#262833] transition-colors cursor-pointer"
              title="Share"
            >
              <Share2 className="w-4 h-4" />
            </button>

            <button
              className="p-2 rounded-xl bg-[#16171d] hover:bg-[#20222a] text-[#babdc5] hover:text-white border border-[#262833] transition-colors cursor-pointer"
              title="More"
            >
              <MoreHorizontal className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
