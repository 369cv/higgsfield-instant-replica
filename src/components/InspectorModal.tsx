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
  Upload,
  Maximize2
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

  const heroImage = item.fullImageUrl || item.imageUrl;
  const currentDisplayImage = inspectingRef ? (item.referenceImage || heroImage) : heroImage;

  const handleCopy = () => {
    navigator.clipboard.writeText(item.prompt);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = currentDisplayImage;
    link.download = `halalfans-${item.id}${inspectingRef ? '-reference' : ''}.png`;
    link.target = '_blank';
    link.click();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-2 md:p-6 overflow-hidden">
      {/* Modal Container */}
      <div className="relative w-full max-w-6xl h-[92vh] rounded-3xl bg-[#0f1015] border border-[#23252e] flex flex-col md:flex-row overflow-hidden shadow-2xl">
        {/* Left Side: Hero Image Display - ZERO text on image, pure visual */}
        <div className="flex-1 bg-black/75 flex items-center justify-center relative p-4 overflow-hidden">
          <img
            src={currentDisplayImage}
            alt=""
            className="max-h-full max-w-full object-contain rounded-xl shadow-2xl transition-all duration-200"
          />

          {/* Minimal Fullscreen / Expand control at bottom right */}
          <div className="absolute bottom-4 right-4 flex items-center gap-2 pointer-events-auto">
            <button
              onClick={() => window.open(currentDisplayImage, '_blank')}
              className="w-8 h-8 rounded-lg bg-black/40 backdrop-blur-md border border-white/10 hover:bg-black/60 flex items-center justify-center text-white/70 hover:text-white transition-colors"
              title="Full size"
            >
              <Maximize2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Right Side: Inspector Sidebar (Exact Replica of Screenshot 2) */}
        <div className="w-full md:w-[420px] bg-[#121318] border-l border-[#23252e] flex flex-col justify-between overflow-y-auto">
          {/* Top Section */}
          <div className="p-5 space-y-4">
            {/* Header with User Info & Close */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full overflow-hidden border border-white/20">
                  <img
                    src={item.imageUrl}
                    alt=""
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex flex-col">
                  <span className="font-semibold text-xs tracking-tight text-white">
                    {item.author.username || 'Creator'}
                  </span>
                  <span className="text-[10px] text-[#717684]">
                    {item.author.role || 'Author'}
                  </span>
                </div>
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

              {/* Prompt Text Box with Official Reference Thumbnail */}
              <div className="rounded-2xl bg-[#181920] border border-[#23252e] p-3.5 space-y-2">
                <div className="flex gap-3 items-start">
                  {/* Reference Image Thumbnail with Upload/Reference Icon */}
                  {item.referenceImage ? (
                    <div
                      onClick={() => setInspectingRef(!inspectingRef)}
                      className="relative group/thumb cursor-pointer flex-shrink-0"
                      title={inspectingRef ? "Show generated output" : "Click to view reference photo"}
                    >
                      <img
                        src={item.referenceImage}
                        alt=""
                        className={`w-14 h-14 rounded-lg object-cover border transition-all ${
                          inspectingRef
                            ? 'border-[#d1fe17] ring-2 ring-[#d1fe17]/40'
                            : 'border-white/15 group-hover/thumb:border-white/40'
                        }`}
                      />
                      {/* Upload / Reference icon in center bottom matching Screenshot 2 */}
                      <div className="absolute inset-x-0 bottom-0 bg-black/50 backdrop-blur-sm rounded-b-lg py-0.5 flex items-center justify-center">
                        <Upload className="w-3 h-3 text-white/90" />
                      </div>
                    </div>
                  ) : null}

                  {/* Prompt Text with expansion */}
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
              </div>
            </div>

            {/* DETAILS Section */}
            <div className="space-y-2.5 pt-1">
              <div className="text-xs font-semibold uppercase tracking-wider text-[#717684]">
                DETAILS
              </div>

              <div className="space-y-2 text-xs">
                <div className="flex justify-between py-1 border-b border-[#1f212a]">
                  <span className="text-[#717684]">Model</span>
                  <span className="text-white font-medium">{item.model}</span>
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

          {/* Sticky Bottom Actions - Exact Replica of Screenshot 2 */}
          <div className="p-4 bg-[#0e0f14] border-t border-[#23252e] space-y-2.5">
            {/* Big Lime 'Turn to video' button */}
            <button
              onClick={() => onTurnToVideo(item)}
              className="w-full py-3 rounded-xl bg-[#d1fe17] hover:bg-[#bfee00] text-black font-bold text-xs flex items-center justify-center gap-2 transition-transform active:scale-[0.98] shadow-lg shadow-[#d1fe17]/20"
            >
              <Video className="w-4 h-4 fill-black" />
              <span>Turn to video</span>
            </button>

            {/* Action Row: Recreate, Reference */}
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
                className="flex items-center gap-1.5 py-2 px-3 rounded-xl bg-[#181920] hover:bg-[#23252e] text-[#babdc5] hover:text-white border border-[#2b2e3b] text-xs font-medium transition-colors"
                title="Download"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download</span>
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
