import React, { useEffect, useRef } from 'react';
import {
  ImagePlus,
  Radio,
  TrendingUp,
  Settings,
  Activity,
  Bookmark,
  Moon,
  Calendar,
  MessageSquareWarning,
  Sparkles,
  Users2,
  Lock,
  Bot,
  Layers,
  MessageCircle,
  Hash
} from 'lucide-react';

interface PopoverProps {
  isOpen: boolean;
  onClose: () => void;
  anchorRef?: React.RefObject<HTMLElement | null>;
}

// 1. Instagram "+ Create" Popover (Screenshot media_1794093992303_a02d1c91.png)
export const CreatePopover: React.FC<PopoverProps & {
  onCreateSoulDrop?: () => void;
  onAnimateToVideo?: () => void;
  onScheduleBuffer?: () => void;
}> = ({ isOpen, onClose, onCreateSoulDrop, onAnimateToVideo, onScheduleBuffer }) => {
  const popoverRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    const handleClickOutside = (e: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      ref={popoverRef}
      className="absolute top-14 left-1/2 -translate-x-1/2 w-64 bg-[#262626]/95 backdrop-blur-2xl border border-white/10 rounded-2xl shadow-2xl p-2 z-50 text-white animate-in fade-in zoom-in-95 duration-150"
    >
      <div className="px-3 py-2 text-xs font-semibold text-neutral-400 uppercase tracking-wider">
        Create Content
      </div>
      <div className="space-y-1">
        <button
          onClick={() => {
            onClose();
            onCreateSoulDrop?.();
          }}
          className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl hover:bg-white/10 text-sm font-medium transition-colors text-left group"
        >
          <span className="flex items-center gap-3">
            <span className="font-semibold text-white">Post</span>
          </span>
          <ImagePlus className="w-5 h-5 text-neutral-400 group-hover:text-white transition-colors" />
        </button>

        <button
          onClick={() => {
            onClose();
            onAnimateToVideo?.();
          }}
          className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl hover:bg-white/10 text-sm font-medium transition-colors text-left group"
        >
          <span className="flex items-center gap-3">
            <span className="font-semibold text-white">Live video</span>
          </span>
          <Radio className="w-5 h-5 text-neutral-400 group-hover:text-white transition-colors" />
        </button>

        <button
          onClick={() => {
            onClose();
            onScheduleBuffer?.();
          }}
          className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl hover:bg-white/10 text-sm font-medium transition-colors text-left group"
        >
          <span className="flex items-center gap-3">
            <span className="font-semibold text-white">Ad</span>
          </span>
          <TrendingUp className="w-5 h-5 text-neutral-400 group-hover:text-white transition-colors" />
        </button>
      </div>
    </div>
  );
};

// 2. Instagram "≡ More" Popover (Screenshot media_1794093900325_6bdb3b83.png)
export const MoreMenuPopover: React.FC<PopoverProps & {
  onOpenSettings?: () => void;
  onOpenActivity?: () => void;
  onOpenSaved?: () => void;
  onToggleAppearance?: () => void;
  onOpenScheduledContent?: () => void;
  onOpenReport?: () => void;
  onOpenBufferAds?: () => void;
  onSwitchAccounts?: () => void;
  onLogout?: () => void;
}> = ({
  isOpen,
  onClose,
  onOpenSettings,
  onOpenActivity,
  onOpenSaved,
  onToggleAppearance,
  onOpenScheduledContent,
  onOpenReport,
  onOpenBufferAds,
  onSwitchAccounts,
  onLogout
}) => {
  const popoverRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    const handleClickOutside = (e: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      ref={popoverRef}
      className="absolute top-14 right-8 sm:right-16 w-68 bg-[#262626]/95 backdrop-blur-2xl border border-white/10 rounded-2xl shadow-2xl p-2 z-50 text-white animate-in fade-in zoom-in-95 duration-150"
    >
      <div className="space-y-0.5">
        <button
          onClick={() => { onClose(); onOpenSettings?.(); }}
          className="w-full flex items-center gap-3.5 px-3 py-2.5 rounded-xl hover:bg-white/10 text-sm font-medium transition-colors text-left"
        >
          <Settings className="w-5 h-5 text-neutral-300" />
          <span>Settings</span>
        </button>

        <button
          onClick={() => { onClose(); onOpenActivity?.(); }}
          className="w-full flex items-center gap-3.5 px-3 py-2.5 rounded-xl hover:bg-white/10 text-sm font-medium transition-colors text-left"
        >
          <Activity className="w-5 h-5 text-neutral-300" />
          <span>Your activity</span>
        </button>

        <button
          onClick={() => { onClose(); onOpenSaved?.(); }}
          className="w-full flex items-center gap-3.5 px-3 py-2.5 rounded-xl hover:bg-white/10 text-sm font-medium transition-colors text-left"
        >
          <Bookmark className="w-5 h-5 text-neutral-300" />
          <span>Saved</span>
        </button>

        <button
          onClick={() => { onClose(); onToggleAppearance?.(); }}
          className="w-full flex items-center gap-3.5 px-3 py-2.5 rounded-xl hover:bg-white/10 text-sm font-medium transition-colors text-left"
        >
          <Moon className="w-5 h-5 text-neutral-300" />
          <span>Switch appearance</span>
        </button>

        <button
          onClick={() => { onClose(); onOpenScheduledContent?.(); }}
          className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl hover:bg-white/10 text-sm font-medium transition-colors text-left"
        >
          <span className="flex items-center gap-3.5">
            <Calendar className="w-5 h-5 text-[#d1fe17]" />
            <span className="font-medium text-white">Scheduled content</span>
          </span>
          <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 bg-[#d1fe17]/20 text-[#d1fe17] rounded">Buffer</span>
        </button>

        <button
          onClick={() => { onClose(); onOpenReport?.(); }}
          className="w-full flex items-center gap-3.5 px-3 py-2.5 rounded-xl hover:bg-white/10 text-sm font-medium transition-colors text-left"
        >
          <MessageSquareWarning className="w-5 h-5 text-neutral-300" />
          <span>Report a problem</span>
        </button>
      </div>

      <div className="my-2 border-t border-white/10" />

      <div className="space-y-0.5">
        <button
          onClick={() => { onClose(); onOpenBufferAds?.(); }}
          className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl hover:bg-white/10 text-sm font-medium transition-colors text-left"
        >
          <span className="flex items-center gap-3.5">
            <Sparkles className="w-5 h-5 text-blue-400" />
            <span>Ads Manager</span>
          </span>
          <span className="text-[11px] font-semibold bg-blue-600 text-white px-2 py-0.5 rounded-full">
            New
          </span>
        </button>

        <button
          onClick={() => { onClose(); onSwitchAccounts?.(); }}
          className="w-full flex items-center gap-3.5 px-3 py-2.5 rounded-xl hover:bg-white/10 text-sm font-medium transition-colors text-left"
        >
          <Users2 className="w-5 h-5 text-neutral-300" />
          <span>Switch accounts</span>
        </button>
      </div>

      <div className="my-2 border-t border-white/10" />

      <div>
        <button
          onClick={() => { onClose(); onLogout?.(); }}
          className="w-full flex items-center gap-3.5 px-3 py-2.5 rounded-xl hover:bg-red-500/20 text-sm font-medium text-red-400 transition-colors text-left"
        >
          <Lock className="w-5 h-5" />
          <span>Log out</span>
        </button>
      </div>
    </div>
  );
};

// 3. Instagram "Also from Meta" Ecosystem Popover (Screenshot media_1794093913776_806c7a6e.png)
export const EcosystemPopover: React.FC<PopoverProps & {
  onSelectMetaAI?: () => void;
  onSelectAIStudio?: () => void;
  onSelectWhatsApp?: () => void;
  onSelectThreads?: () => void;
}> = ({ isOpen, onClose, onSelectMetaAI, onSelectAIStudio, onSelectWhatsApp, onSelectThreads }) => {
  const popoverRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    const handleClickOutside = (e: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      ref={popoverRef}
      className="absolute top-14 right-2 sm:right-6 w-60 bg-[#262626]/95 backdrop-blur-2xl border border-white/10 rounded-2xl shadow-2xl p-2 z-50 text-white animate-in fade-in zoom-in-95 duration-150"
    >
      <div className="px-3 py-2 text-xs font-semibold text-neutral-400 uppercase tracking-wider">
        Also from Meta / Ecosystem
      </div>
      <div className="space-y-1">
        <button
          onClick={() => { onClose(); onSelectMetaAI?.(); }}
          className="w-full flex items-center gap-3.5 px-3 py-2.5 rounded-xl hover:bg-white/10 text-sm font-medium transition-colors text-left"
        >
          <Bot className="w-5 h-5 text-white" />
          <span>Meta AI</span>
        </button>

        <button
          onClick={() => { onClose(); onSelectAIStudio?.(); }}
          className="w-full flex items-center gap-3.5 px-3 py-2.5 rounded-xl hover:bg-white/10 text-sm font-medium transition-colors text-left"
        >
          <Layers className="w-5 h-5 text-white" />
          <span>AI Studio</span>
        </button>

        <button
          onClick={() => { onClose(); onSelectWhatsApp?.(); }}
          className="w-full flex items-center gap-3.5 px-3 py-2.5 rounded-xl hover:bg-white/10 text-sm font-medium transition-colors text-left"
        >
          <MessageCircle className="w-5 h-5 text-[#25D366]" />
          <span>WhatsApp</span>
        </button>

        <button
          onClick={() => { onClose(); onSelectThreads?.(); }}
          className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl hover:bg-white/10 text-sm font-medium transition-colors text-left"
        >
          <span className="flex items-center gap-3.5">
            <Hash className="w-5 h-5 text-white" />
            <span>Threads</span>
          </span>
          <span className="text-[11px] font-bold bg-red-600 text-white px-2 py-0.5 rounded-full">
            6
          </span>
        </button>
      </div>
    </div>
  );
};
