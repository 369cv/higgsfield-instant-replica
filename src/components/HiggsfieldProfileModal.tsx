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
  const [activeTab, setActiveTab] = useState<'All works' | 'Projects' | 'Shots' | 'Blog' | 'Rating' | 'Settings'>('All works');
  const [modelChoice, setModelChoice] = useState(() => localStorage.getItem('halalfans_model_pref') || 'Seedance 2.0 Turbo');
  const [aspectChoice, setAspectChoice] = useState(() => localStorage.getItem('halalfans_aspect_pref') || '9:16 Vertical Reel');
  const [disclosureEnabled, setDisclosureEnabled] = useState(() => localStorage.getItem('halalfans_disclosure_pref') !== 'false');

  const handleSavePref = (key: string, val: string) => {
    localStorage.setItem(key, val);
  };

  const handleClearCache = () => {
    if (confirm('Clear local application cache and restore initial presets?')) {
      const keysToRemove = [
        'halalfans_active_tab_v6',
        'halalfans_selected_category_v6',
        'halalfans_filters_v6',
        'halalfans_audience_mode_v6',
        'halalfans_selected_archetype_v6',
        'halalfans_active_headshot_v6',
        'halalfans_custom_prompt_v6',
      ];
      keysToRemove.forEach((k) => localStorage.removeItem(k));
      alert('Application cache cleared. The page will now reload.');
      window.location.reload();
    }
  };

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
              <svg className="w-3 h-3 text-cyan-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="6 3 18 3 22 9 12 22 2 9 6 3" />
                <line x1="2" y1="9" x2="22" y2="9" />
              </svg>
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
          {(['All works', 'Projects', 'Shots', 'Blog', 'Rating', 'Settings'] as const).map((tab) => (
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

        {/* Settings Tab View */}
        {activeTab === 'Settings' ? (
          <div className="space-y-6 max-w-3xl">
            {/* 1. Default Video Model */}
            <div className="p-6 rounded-2xl bg-[#141416] border border-white/5 space-y-3">
              <h3 className="text-sm font-bold text-white">Default Video Model</h3>
              <p className="text-xs text-neutral-400">
                Select the default video inference engine for storyboards and reels.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1">
                {['Seedance 2.0 Turbo', 'LTX-Video', 'Flux.1 Pro'].map((m) => (
                  <button
                    key={m}
                    onClick={() => {
                      setModelChoice(m);
                      handleSavePref('halalfans_model_pref', m);
                    }}
                    className={`px-3 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      modelChoice === m
                        ? 'bg-[#d1fe17] text-black shadow-md'
                        : 'bg-white/5 text-neutral-300 hover:text-white hover:bg-white/10 border border-white/5'
                    }`}
                  >
                    {m}
                  </button>
                ))}
              </div>
            </div>

            {/* 2. Output Aspect Ratio */}
            <div className="p-6 rounded-2xl bg-[#141416] border border-white/5 space-y-3">
              <h3 className="text-sm font-bold text-white">Default Aspect Ratio</h3>
              <p className="text-xs text-neutral-400">
                Preferred frame orientation for camera renders.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1">
                {['9:16 Vertical Reel', '16:9 Cinema', '1:1 Feed'].map((a) => (
                  <button
                    key={a}
                    onClick={() => {
                      setAspectChoice(a);
                      handleSavePref('halalfans_aspect_pref', a);
                    }}
                    className={`px-3 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      aspectChoice === a
                        ? 'bg-[#d1fe17] text-black shadow-md'
                        : 'bg-white/5 text-neutral-300 hover:text-white hover:bg-white/10 border border-white/5'
                    }`}
                  >
                    {a}
                  </button>
                ))}
              </div>
            </div>

            {/* 3. Responsible Use & Policy Disclosure */}
            <div className="p-6 rounded-2xl bg-[#141416] border border-white/5 flex items-center justify-between gap-4">
              <div className="space-y-1">
                <h3 className="text-sm font-bold text-white">Synthetic Media Watermark</h3>
                <p className="text-xs text-neutral-400">
                  Embed responsible AI disclosure tags in exported media metadata.
                </p>
              </div>
              <button
                onClick={() => {
                  const nextVal = !disclosureEnabled;
                  setDisclosureEnabled(nextVal);
                  handleSavePref('halalfans_disclosure_pref', String(nextVal));
                }}
                className={`w-12 h-6 rounded-full transition-colors relative cursor-pointer ${
                  disclosureEnabled ? 'bg-[#d1fe17]' : 'bg-white/20'
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-full bg-black transition-transform absolute top-0.5 ${
                    disclosureEnabled ? 'left-6.5' : 'left-0.5'
                  }`}
                />
              </button>
            </div>

            {/* 4. App Cache & Persistence Manager */}
            <div className="p-6 rounded-2xl bg-[#141416] border border-white/5 flex items-center justify-between gap-4">
              <div className="space-y-1">
                <h3 className="text-sm font-bold text-white">Reset Local Session & Cache</h3>
                <p className="text-xs text-neutral-400">
                  Clear stored navigation state, filters, and custom prompts to start fresh.
                </p>
              </div>
              <button
                onClick={handleClearCache}
                className="px-4 py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 text-xs font-bold transition-colors cursor-pointer"
              >
                Clear Cache
              </button>
            </div>
          </div>
        ) : (
          /* Works & Showcase sections */
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
      )}
    </div>
  </div>
);
};
