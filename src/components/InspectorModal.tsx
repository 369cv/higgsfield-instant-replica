import React, { useState } from 'react';
import {
  X,
  Copy,
  Check,
  Video,
  RotateCcw,
  Sparkles,
  Download,
  Heart,
  Share2,
  MoreHorizontal,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  Image as ImageIcon
} from 'lucide-react';
import { VaultItem } from '../types';

interface InspectorModalProps {
  item: VaultItem | null;
  onClose: () => void;
  onRecreate: (item: VaultItem) => void;
  onTurnToVideo: (item: VaultItem) => void;
  onSelectReferenceItem?: (refUrl: string) => void;
}

export const InspectorModal: React.FC<InspectorModalProps> = ({
  item,
  onClose,
  onRecreate,
  onTurnToVideo
}) => {
  const [activeTab, setActiveTab] = useState<'info' | 'edit' | 'comments'>('info');
  const [copied, setCopied] = useState(false);
  const [expandedPrompt, setExpandedPrompt] = useState(false);
  const [liked, setLiked] = useState(item?.isLiked || false);
  const [inspectingRef, setInspectingRef] = useState(false);

  if (!item) return null;

  const currentDisplayImage = inspectingRef ? (item.referenceImage || item.imageUrl) : item.imageUrl;

  const handleCopy = () => {
    navigator.clipboard.writeText(item.prompt);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = currentDisplayImage;
    link.download = `higgsfield-${item.id}${inspectingRef ? '-reference' : ''}.png`;
    link.target = '_blank';
    link.click();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-2 md:p-6 overflow-hidden">
      {/* Modal Container */}
      <div className="relative w-full max-w-6xl h-[92vh] rounded-3xl bg-[#0f1015] border border-[#23252e] flex flex-col md:flex-row overflow-hidden shadow-2xl">
        {/* Left Side: Hero Image Display */}
        <div className="flex-1 bg-black/75 flex items-center justify-center relative p-4 overflow-hidden">
          <img
            src={currentDisplayImage}
            alt={item.title}
            className="max-h-full max-w-full object-contain rounded-xl shadow-2xl transition-all duration-300"
          />

          {/* Floating bottom pill */}
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-3 px-3 py-1.5 rounded-full bg-black/70 backdrop-blur-md border border-white/10 text-xs text-white/80">
            <span className="font-mono">{item.aspectRatio}</span>
            <span>•</span>
            <span>{inspectingRef ? 'Original Source' : item.quality}</span>
            {inspectingRef ? (
              <>
                <span>•</span>
                <button
                  onClick={() => setInspectingRef(false)}
                  className="text-[#d1fe17] font-semibold hover:underline flex items-center gap-1"
                >
                  Viewing Original Reference (Click to switch back)
                </button>
              </>
            ) : item.referenceImage ? (
              <>
                <span>•</span>
                <button
                  onClick={() => setInspectingRef(true)}
                  className="text-white/60 hover:text-[#d1fe17] transition-colors flex items-center gap-1"
                >
                  <ImageIcon className="w-3 h-3" />
                  <span>View Original Reference</span>
                </button>
              </>
            ) : null}
          </div>
        </div>

        {/* Right Side: Inspector Sidebar (Exact Replica of Screenshot 2) */}
        <div className="w-full md:w-[420px] bg-[#121318] border-l border-[#23252e] flex flex-col justify-between overflow-y-auto">
          {/* Top Section */}
          <div className="p-5 space-y-4">
            {/* Header with Close */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-[#14151b] border border-[#282b37] flex items-center justify-center p-1">
                  <img src="/icons/icon32.png" alt="" className="w-full h-full object-contain" />
                </div>
                <span className="font-semibold text-xs tracking-tight text-white uppercase tracking-wider">
                  Generation Details
                </span>
              </div>

              <button
                onClick={onClose}
                className="w-7 h-7 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-[#717684] hover:text-white transition-colors"
                title="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Navigation Tabs (Info, Edit, Comments) */}
            <div className="flex items-center gap-1 p-1 rounded-xl bg-[#0b0c0e] border border-[#1f212a]">
              <button
                onClick={() => setActiveTab('info')}
                className={`flex-1 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  activeTab === 'info'
                    ? 'bg-[#1e2029] text-white shadow-sm'
                    : 'text-[#717684] hover:text-white'
                }`}
              >
                Info
              </button>
              <button
                onClick={() => setActiveTab('edit')}
                className={`flex-1 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  activeTab === 'edit'
                    ? 'bg-[#1e2029] text-white shadow-sm'
                    : 'text-[#717684] hover:text-white'
                }`}
              >
                Edit
              </button>
              <button
                onClick={() => setActiveTab('comments')}
                className={`flex-1 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  activeTab === 'comments'
                    ? 'bg-[#1e2029] text-white shadow-sm'
                    : 'text-[#717684] hover:text-white'
                }`}
              >
                Comments
              </button>
            </div>

            {/* PROMPT Section */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-[#717684]">
                <span>PROMPT</span>
                <button
                  onClick={handleCopy}
                  className="flex items-center gap-1 text-[11px] font-medium text-[#babdc5] hover:text-white transition-colors bg-white/5 hover:bg-white/10 px-2 py-0.5 rounded-md"
                >
                  {copied ? <Check className="w-3 h-3 text-[#d1fe17]" /> : <Copy className="w-3 h-3" />}
                  <span>{copied ? 'Copied' : 'Copy'}</span>
                </button>
              </div>

              {/* Prompt Text Box with Clickable Original Reference Thumbnail */}
              <div className="rounded-2xl bg-[#181920] border border-[#23252e] p-3.5 space-y-3">
                <div className="flex gap-3 items-start">
                  {/* Clickable Original Reference Image */}
                  {item.referenceImage ? (
                    <div
                      onClick={() => setInspectingRef(!inspectingRef)}
                      className="relative group/thumb cursor-pointer flex-shrink-0"
                      title={inspectingRef ? "Switch to generated output" : "Click to view original reference photo"}
                    >
                      <img
                        src={item.referenceImage}
                        alt="Original Reference"
                        className={`w-14 h-14 rounded-lg object-cover border transition-all ${
                          inspectingRef
                            ? 'border-[#d1fe17] ring-2 ring-[#d1fe17]/40 scale-105'
                            : 'border-white/10 group-hover/thumb:border-white/40'
                        }`}
                      />
                      {/* Icon overlay on thumbnail */}
                      <div className="absolute inset-x-0 bottom-0 bg-black/60 rounded-b-lg py-0.5 flex items-center justify-center">
                        <ImageIcon className="w-3 h-3 text-white/90" />
                      </div>
                    </div>
                  ) : null}

                  {/* Prompt Text */}
                  <div className="flex-1 text-xs leading-relaxed text-[#dee0e3] font-normal">
                    <p className={expandedPrompt ? '' : 'line-clamp-4'}>
                      {item.prompt}
                    </p>
                    <button
                      onClick={() => setExpandedPrompt(!expandedPrompt)}
                      className="text-[#717684] hover:text-[#d1fe17] text-[11px] font-medium mt-1 flex items-center gap-1 transition-colors"
                    >
                      {expandedPrompt ? (
                        <>Show less <ChevronUp className="w-3 h-3" /></>
                      ) : (
                        <>See all <ChevronDown className="w-3 h-3" /></>
                      )}
                    </button>
                  </div>
                </div>

                {inspectingRef && (
                  <div className="pt-2 border-t border-white/5 flex items-center justify-between text-[11px] text-[#d1fe17]">
                    <span>Viewing original reference image</span>
                    <button
                      onClick={() => setInspectingRef(false)}
                      className="underline text-white/70 hover:text-white"
                    >
                      Switch to Generation
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* DETAILS Section */}
            <div className="space-y-2.5 pt-1">
              <div className="text-xs font-semibold uppercase tracking-wider text-[#717684]">
                DETAILS
              </div>

              <div className="space-y-2 text-xs">
                <div className="flex justify-between py-1 border-b border-[#1f212a]">
                  <span className="text-[#717684]">
                    {inspectingRef ? 'Asset Type' : 'Model'}
                  </span>
                  <span className="text-white font-medium">
                    {inspectingRef ? 'Original Reference Photo' : item.model}
                  </span>
                </div>

                <div className="flex justify-between py-1 border-b border-[#1f212a]">
                  <span className="text-[#717684]">Moodboard</span>
                  <span className="text-white font-medium flex items-center gap-1">
                    {item.moodboard} 🎬
                  </span>
                </div>

                <div className="flex justify-between py-1 border-b border-[#1f212a]">
                  <span className="text-[#717684]">Quality</span>
                  <span className="text-white font-medium">{item.quality}</span>
                </div>

                <div className="flex justify-between py-1 border-b border-[#1f212a]">
                  <span className="text-[#717684]">Size</span>
                  <span className="text-white font-mono">{item.size}</span>
                </div>

                <div className="flex justify-between py-1">
                  <span className="text-[#717684]">Created</span>
                  <span className="text-[#babdc5]">{item.createdAt}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Sticky Bottom Actions */}
          <div className="p-4 bg-[#0e0f14] border-t border-[#23252e] space-y-2.5">
            {/* Big Lime 'Turn to video' button */}
            <button
              onClick={() => onTurnToVideo(item)}
              className="w-full py-3 rounded-xl bg-[#d1fe17] hover:bg-[#bfee00] text-black font-bold text-xs flex items-center justify-center gap-2 transition-transform active:scale-[0.98] shadow-lg shadow-[#d1fe17]/20"
            >
              <Video className="w-4 h-4 fill-black" />
              <span>Turn to video</span>
            </button>

            {/* Action Row */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => onRecreate(item)}
                className="flex-1 py-2 px-3 rounded-xl bg-[#181920] hover:bg-[#23252e] text-white text-xs font-medium flex items-center justify-center gap-1.5 border border-[#2b2e3b] transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Recreate</span>
              </button>

              <button
                onClick={() => onRecreate(item)}
                className="flex-1 py-2 px-3 rounded-xl bg-[#181920] hover:bg-[#23252e] text-white text-xs font-medium flex items-center justify-center gap-1.5 border border-[#2b2e3b] transition-colors"
              >
                <Sparkles className="w-3.5 h-3.5 text-[#d1fe17]" />
                <span>Reference</span>
              </button>

              <button
                onClick={handleDownload}
                className="p-2 rounded-xl bg-[#181920] hover:bg-[#23252e] text-[#babdc5] hover:text-white border border-[#2b2e3b] transition-colors"
                title="Download"
              >
                <Download className="w-4 h-4" />
              </button>

              <button
                onClick={() => setLiked(!liked)}
                className={`p-2 rounded-xl bg-[#181920] hover:bg-[#23252e] border border-[#2b2e3b] transition-colors ${
                  liked ? 'text-red-500' : 'text-[#babdc5] hover:text-white'
                }`}
                title="Like"
              >
                <Heart className={`w-4 h-4 ${liked ? 'fill-red-500' : ''}`} />
              </button>

              <button
                className="p-2 rounded-xl bg-[#181920] hover:bg-[#23252e] text-[#babdc5] hover:text-white border border-[#2b2e3b] transition-colors"
                title="Share"
              >
                <Share2 className="w-4 h-4" />
              </button>

              <button
                className="p-2 rounded-xl bg-[#181920] hover:bg-[#23252e] text-[#babdc5] hover:text-white border border-[#2b2e3b] transition-colors"
                title="More"
              >
                <MoreHorizontal className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
