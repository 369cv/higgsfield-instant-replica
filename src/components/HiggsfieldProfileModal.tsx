import React, { useState } from 'react';
import {
  ArrowLeft,
  UploadCloud,
  Plus,
  Pencil,
  Eye,
  Award,
  Globe,
  Calendar,
  FolderKanban,
  FileText,
  Sparkles,
  ChevronRight
} from 'lucide-react';

interface HiggsfieldProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenCreate?: () => void;
}

export const HiggsfieldProfileModal: React.FC<HiggsfieldProfileModalProps> = ({
  isOpen,
  onClose,
  onOpenCreate
}) => {
  const [activeTab, setActiveTab] = useState<'All works' | 'Projects' | 'Shots' | 'Blog' | 'Rating' | 'Achievements'>('All works');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black text-white animate-in fade-in duration-200">
      {/* Top Bar */}
      <div className="sticky top-0 z-20 bg-black/90 backdrop-blur-xl border-b border-white/5 px-6 py-4 flex items-center justify-between">
        <button
          onClick={onClose}
          className="flex items-center gap-2 text-sm font-semibold text-neutral-300 hover:text-white transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back</span>
        </button>

        <div className="flex items-center gap-3">
          <button
            onClick={() => alert('Publishing asset to creator showcase.')}
            className="px-4 py-2 bg-neutral-900 hover:bg-neutral-800 border border-white/10 rounded-xl text-xs font-semibold text-white flex items-center gap-2 transition-colors cursor-pointer"
          >
            <UploadCloud className="w-4 h-4" />
            <span>Publish</span>
          </button>

          <button
            onClick={() => {
              onClose();
              onOpenCreate?.();
            }}
            className="px-4 py-2 bg-[#d1fe17] hover:bg-[#bfee00] rounded-xl text-xs font-black text-black flex items-center gap-2 transition-transform active:scale-95 shadow-lg shadow-[#d1fe17]/20 cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>Create</span>
          </button>
        </div>
      </div>

      {/* Profile Container */}
      <div className="max-w-6xl mx-auto px-6 py-10 space-y-12">
        {/* Profile Header matching screenshot media_1794094916442_070a1f7f.png */}
        <div className="flex flex-col md:flex-row items-start gap-8">
          {/* Avatar with red rim & gem badge */}
          <div className="relative">
            <div className="w-28 h-28 rounded-full p-1 bg-gradient-to-tr from-red-600 via-rose-500 to-amber-500">
              <div className="w-full h-full rounded-full overflow-hidden bg-black border-2 border-black">
                <img
                  src="/images/influencer-avatar.png"
                  alt="Baha Savage"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
            {/* Gem Badge */}
            <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 px-2.5 py-0.5 bg-neutral-900 border border-white/10 rounded-full text-[11px] font-bold text-neutral-300 flex items-center gap-1 shadow-lg">
              <span>💎</span>
              <span>0</span>
            </div>
          </div>

          {/* User Details */}
          <div className="flex-1 space-y-4">
            <div>
              <h1 className="text-2xl font-bold text-white tracking-tight">Baha Savage</h1>
              <p className="text-sm font-medium text-neutral-400">@savage_mode</p>
            </div>

            {/* Stats */}
            <div className="flex flex-wrap items-center gap-6 text-sm">
              <div><span className="font-bold text-white">1</span> <span className="text-neutral-400">Followers</span></div>
              <div><span className="font-bold text-white">5</span> <span className="text-neutral-400">Following</span></div>
              <div><span className="font-bold text-white">1</span> <span className="text-neutral-400">Views</span></div>
              <div><span className="font-bold text-white">0</span> <span className="text-neutral-400">Likes</span></div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 pt-1">
              <button
                onClick={() => alert('Editing influencer persona parameters.')}
                className="px-5 py-2 bg-neutral-900 hover:bg-neutral-800 border border-white/10 rounded-xl text-xs font-semibold text-white flex items-center gap-2 transition-colors cursor-pointer"
              >
                <Pencil className="w-3.5 h-3.5" />
                <span>Edit profile</span>
              </button>
              <button
                onClick={() => alert('Viewing public creator profile.')}
                className="w-9 h-9 bg-neutral-900 hover:bg-neutral-800 border border-white/10 rounded-xl flex items-center justify-center text-neutral-300 hover:text-white transition-colors cursor-pointer"
              >
                <Eye className="w-4 h-4" />
              </button>
            </div>

            {/* Bio */}
            <p className="text-sm text-neutral-300 max-w-lg leading-relaxed">
              When it's your turn, don't feel bad. Go full savage mode.
            </p>

            {/* Achievements Pill */}
            <div>
              <button className="px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/5 rounded-2xl text-xs font-medium text-neutral-300 flex items-center gap-2 transition-colors cursor-pointer">
                <Award className="w-4 h-4 text-amber-400" />
                <span>Your achievements</span>
                <ChevronRight className="w-3.5 h-3.5 text-neutral-500" />
              </button>
            </div>

            {/* Meta tags & Socials */}
            <div className="pt-2 flex flex-wrap items-center gap-6 text-xs text-neutral-400">
              <div className="flex items-center gap-1.5">
                <Globe className="w-3.5 h-3.5" />
                <span>Global</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5" />
                <span>Member since September 2025</span>
              </div>
            </div>
          </div>
        </div>

        {/* Profile Tabs Navigation */}
        <div className="flex items-center gap-2 border-b border-white/10 pb-4 overflow-x-auto">
          {(['All works', 'Projects', 'Shots', 'Blog', 'Rating', 'Achievements'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                activeTab === tab
                  ? 'bg-white text-black shadow-lg shadow-white/10'
                  : 'bg-transparent text-neutral-400 hover:text-white hover:bg-white/5'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Sections based on screenshot */}
        <div className="space-y-6">
          {/* Projects Card */}
          <div className="p-6 rounded-2xl bg-[#141416] border border-white/5 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 hover:border-white/10 transition-colors">
            <div className="flex items-center gap-5">
              <div className="w-16 h-16 rounded-xl bg-neutral-900 border border-white/10 flex items-center justify-center flex-shrink-0">
                <FolderKanban className="w-8 h-8 text-[#d1fe17]" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Ready to show your projects?</h3>
                <p className="text-xs text-neutral-400 mt-1">
                  Launch your projects and get noticed by millions across the Halal Fans network.
                </p>
              </div>
            </div>
            <button className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-semibold text-white flex items-center gap-2 transition-colors cursor-pointer">
              <span>Publish projects</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Blogs Card */}
          <div className="p-6 rounded-2xl bg-[#141416] border border-white/5 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 hover:border-white/10 transition-colors">
            <div className="flex items-center gap-5">
              <div className="w-16 h-16 rounded-xl bg-neutral-900 border border-white/10 flex items-center justify-center flex-shrink-0">
                <FileText className="w-8 h-8 text-blue-400" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Share your tips & tricks</h3>
                <p className="text-xs text-neutral-400 mt-1">
                  Write up how you made something: prompts, settings, pipeline, and face consistency seeds.
                </p>
              </div>
            </div>
            <button className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-semibold text-white flex items-center gap-2 transition-colors cursor-pointer">
              <Plus className="w-3.5 h-3.5" />
              <span>Write a post</span>
            </button>
          </div>

          {/* Shots Card */}
          <div className="p-6 rounded-2xl bg-[#141416] border border-white/5 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 hover:border-white/10 transition-colors">
            <div className="flex items-center gap-5">
              <div className="w-16 h-16 rounded-xl bg-neutral-900 border border-white/10 flex items-center justify-center flex-shrink-0">
                <Sparkles className="w-8 h-8 text-fuchsia-400" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Show your imagination</h3>
                <p className="text-xs text-neutral-400 mt-1">
                  Publish your best generated images or video. Help others create better and collect appreciations.
                </p>
              </div>
            </div>
            <button className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-semibold text-white flex items-center gap-2 transition-colors cursor-pointer">
              <span>Open assets</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
