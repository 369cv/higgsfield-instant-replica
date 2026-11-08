import React, { useEffect } from 'react';
import { ArrowLeft, User } from 'lucide-react';

interface HiggsfieldProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

/**
 * Profile shell. All previous sections (stats, works, projects, blog, rating,
 * settings) were removed; the new profile layout is still to be designed.
 */
export const HiggsfieldProfileModal: React.FC<HiggsfieldProfileModalProps> = ({ isOpen, onClose }) => {
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-x-0 top-0 bottom-[var(--m-tab-h)] md:bottom-0 z-50 overflow-y-auto bg-[#070709] text-white">
      <div
        className="sticky top-0 z-20 bg-[#070709]/80 backdrop-blur-xl border-b border-white/[0.08] md:border-white/5 px-4 sm:px-6"
        style={{ paddingTop: 'env(safe-area-inset-top)' }}
      >
        <div className="h-11 md:h-16 flex items-center relative">
        <button
          onClick={onClose}
          className="hidden md:flex items-center gap-2 text-sm font-semibold text-neutral-300 hover:text-white cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back</span>
        </button>
        <h1 className="md:hidden absolute inset-x-0 text-center text-[17px] font-semibold pointer-events-none">Profile</h1>
        </div>
      </div>

      <div className="max-w-xl mx-auto px-6 py-16 flex flex-col items-center text-center">
        <div className="w-24 h-24 rounded-full bg-white/[0.06] border border-white/10 flex items-center justify-center mb-6">
          <User className="w-10 h-10 text-neutral-400" />
        </div>
        <h2 className="text-xl font-bold mb-2">Your profile</h2>
        <p className="text-sm text-neutral-400">Profile features are coming soon.</p>
      </div>
    </div>
  );
};
