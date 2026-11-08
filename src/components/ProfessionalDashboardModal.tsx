import React, { useState } from 'react';
import { X, ChevronDown, Info, Megaphone, TrendingUp, ArrowDownRight, ArrowUpRight } from 'lucide-react';

interface ProfessionalDashboardModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ProfessionalDashboardModal: React.FC<ProfessionalDashboardModalProps> = ({ isOpen, onClose }) => {
  const [filterContentType, setFilterContentType] = useState<'All' | 'Followers' | 'Non-followers'>('All');
  const [timeRange, setTimeRange] = useState('Last 30 days');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-4xl bg-[#121212] border border-white/10 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header matching screenshot media_1794093981351_5532c639.png */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
          <div className="flex items-center gap-3">
            <h2 className="text-xl font-bold text-white tracking-tight">Professional dashboard</h2>
            <button className="px-3 py-1 bg-white/10 hover:bg-white/15 rounded-lg text-xs font-semibold text-white flex items-center gap-1.5 transition-colors">
              <Megaphone className="w-3.5 h-3.5 text-blue-400" />
              Ad tools
            </button>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative">
              <button
                onClick={() => setTimeRange(timeRange === 'Last 30 days' ? 'Last 7 days' : 'Last 30 days')}
                className="px-3 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-xs font-medium text-neutral-300 flex items-center gap-2 transition-colors"
              >
                <span>{timeRange}</span>
                <ChevronDown className="w-3.5 h-3.5 text-neutral-400" />
              </button>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-neutral-400 hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Dashboard Body */}
        <div className="p-6 overflow-y-auto space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Left Column: Account Insights */}
            <div className="space-y-6">
              <div>
                <h3 className="text-sm font-semibold text-neutral-400 uppercase tracking-wider mb-4">
                  Account insights
                </h3>

                {/* Views Card */}
                <div className="p-5 rounded-2xl bg-[#1c1c1e] border border-white/5 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-neutral-400 text-sm font-medium">
                      <span>Views</span>
                      <Info className="w-3.5 h-3.5 text-neutral-500" />
                    </div>
                    <span className="text-xs font-medium text-emerald-400 flex items-center">
                      <ArrowUpRight className="w-3 h-3 mr-0.5" /> +84.2%
                    </span>
                  </div>

                  <div className="text-3xl font-extrabold text-white tracking-tight">5,757</div>
                  <div className="text-xs text-neutral-400">Total prompt & profile views</div>

                  <div className="pt-2 border-t border-white/5 space-y-2 text-xs">
                    <div className="flex justify-between text-neutral-300">
                      <span>Followers</span>
                      <span className="font-semibold text-white">19.3%</span>
                    </div>
                    <div className="flex justify-between text-neutral-300">
                      <span>Non-followers</span>
                      <span className="font-semibold text-white">80.7%</span>
                    </div>
                    <div className="flex justify-between text-neutral-300">
                      <span>Viewers</span>
                      <span className="font-semibold text-white">1,133</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Interactions Card */}
              <div className="p-5 rounded-2xl bg-[#1c1c1e] border border-white/5 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-neutral-400 text-sm font-medium">
                    <span>Interactions</span>
                    <Info className="w-3.5 h-3.5 text-neutral-500" />
                  </div>
                  <span className="text-xs font-medium text-rose-400 flex items-center">
                    <ArrowDownRight className="w-3 h-3 mr-0.5" /> -28
                  </span>
                </div>

                <div className="text-3xl font-extrabold text-white tracking-tight">-28</div>
                <div className="text-xs text-neutral-400">Interactions vs previous period</div>

                <div className="pt-2 border-t border-white/5 space-y-2 text-xs">
                  <div className="flex justify-between text-neutral-300">
                    <span>Followers</span>
                    <span className="font-semibold text-white">0%</span>
                  </div>
                  <div className="flex justify-between text-neutral-300">
                    <span>Non-followers</span>
                    <span className="font-semibold text-white">100%</span>
                  </div>
                  <div className="flex justify-between text-neutral-300">
                    <span>Accounts engaged</span>
                    <span className="font-semibold text-white">24</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Breakdown Charts */}
            <div className="space-y-6">
              {/* By Content Type */}
              <div className="p-5 rounded-2xl bg-[#1c1c1e] border border-white/5 space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-semibold text-white">By content type</h4>
                  <div className="flex items-center gap-1 bg-black/40 p-0.5 rounded-lg border border-white/10 text-xs">
                    {(['All', 'Followers', 'Non-followers'] as const).map((tab) => (
                      <button
                        key={tab}
                        onClick={() => setFilterContentType(tab)}
                        className={`px-2.5 py-1 rounded-md font-medium transition-all ${
                          filterContentType === tab
                            ? 'bg-blue-600 text-white shadow'
                            : 'text-neutral-400 hover:text-white'
                        }`}
                      >
                        {tab}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-3 pt-2">
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-neutral-300 font-medium">Reels</span>
                      <span className="text-white font-bold">93.4%</span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-white/5 overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-fuchsia-500 to-pink-500 rounded-full" style={{ width: '93.4%' }} />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-neutral-300 font-medium">Posts</span>
                      <span className="text-white font-bold">4.5%</span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-white/5 overflow-hidden">
                      <div className="h-full bg-indigo-500 rounded-full" style={{ width: '4.5%' }} />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-neutral-300 font-medium">Stories</span>
                      <span className="text-white font-bold">2.1%</span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-white/5 overflow-hidden">
                      <div className="h-full bg-amber-500 rounded-full" style={{ width: '2.1%' }} />
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4 pt-2 text-[11px] text-neutral-400">
                  <span className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-pink-500" /> Followers
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-indigo-500" /> Non-followers
                  </span>
                </div>
              </div>

              {/* By Content Interactions */}
              <div className="p-5 rounded-2xl bg-[#1c1c1e] border border-white/5 space-y-4">
                <h4 className="text-sm font-semibold text-white">By content interactions</h4>

                <div className="space-y-3 pt-2">
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-neutral-300 font-medium">Posts</span>
                      <span className="text-rose-400 font-bold">-25%</span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-white/5 overflow-hidden">
                      <div className="h-full bg-rose-500/40 rounded-full" style={{ width: '25%' }} />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-neutral-300 font-medium">Reels</span>
                      <span className="text-emerald-400 font-bold">+125%</span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-white/5 overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-fuchsia-500 to-pink-500 rounded-full" style={{ width: '85%' }} />
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 pt-2 text-[11px] text-neutral-400">
                  <span className="w-2 h-2 rounded-full bg-fuchsia-500" /> Followers and non-followers
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
