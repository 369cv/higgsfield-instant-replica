import React, { useState } from 'react';
import {
  X,
  Sparkles,
  Camera,
  Layers,
  Ratio,
  Sliders,
  MoveLeft,
  MoveRight,
  MoveUp,
  MoveDown,
  ZoomIn,
  RotateCw,
  Lock,
  ChevronRight,
  RefreshCw,
  Send,
  Video,
  Check
} from 'lucide-react';
import { VaultItem } from '../types';

export type SidebarMode = 'create' | 'motion' | 'filter' | 'search' | 'persona' | 'settings';

interface HiggsfieldSidebarProps {
  isOpen: boolean;
  mode: SidebarMode;
  onClose: () => void;
  activeItem?: VaultItem | null;
  onGenerateDrop?: (prompt: string, model: string, ratio: string) => void;
  onAnimateVideo?: (motionType: string) => void;
  onSelectCategory?: (category: string) => void;
}

export const HiggsfieldSidebar: React.FC<HiggsfieldSidebarProps> = ({
  isOpen,
  mode,
  onClose,
  activeItem,
  onGenerateDrop,
  onAnimateVideo,
  onSelectCategory
}) => {
  // State for generation controls
  const [selectedModel, setSelectedModel] = useState<'soul-2.0' | 'kling-1.5' | 'seedance' | 'flux-cinema'>('soul-2.0');
  const [aspectRatio, setAspectRatio] = useState<'9:16' | '1:1' | '16:9'>('9:16');
  const [promptText, setPromptText] = useState(
    activeItem ? activeItem.prompt : 'hyper-realistic full body fashion portrait, luxurious silk modest wear, cinematic evening lighting, 8k raw quality'
  );
  const [negativePrompt, setNegativePrompt] = useState('blurry, deformed, plastic look, low resolution, multiple heads');
  const [selectedCameraMove, setSelectedCameraMove] = useState('zoom-in');
  const [motionIntensity, setMotionIntensity] = useState(65);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedCategory, setSelectedCategoryState] = useState('All');

  if (!isOpen) return null;

  const handleGenerate = () => {
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      onGenerateDrop?.(promptText, selectedModel, aspectRatio);
      onClose();
    }, 1200);
  };

  const handleMotionSubmit = () => {
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      onAnimateVideo?.(selectedCameraMove);
      onClose();
    }, 1200);
  };

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm transition-opacity"
      />

      {/* Aligned Sidebar Drawer (Right on Desktop, Bottom Sheet on Mobile) */}
      <aside className="fixed inset-y-0 right-0 z-50 w-full sm:w-[440px] md:w-[480px] bg-[#0d0d0f] border-l border-white/10 shadow-2xl flex flex-col text-white animate-in slide-in-from-right duration-250">
        {/* Drawer Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-[#121215]">
          <div className="flex items-center gap-2.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#d1fe17] animate-pulse" />
            <h2 className="text-sm font-bold uppercase tracking-wider text-white">
              {mode === 'create' && 'Prompt Studio'}
              {mode === 'motion' && 'Cinematic Camera Motion'}
              {mode === 'persona' && 'Persona Identity & Soul Lock'}
              {mode === 'filter' && 'Prompt Vault Taxonomy'}
              {mode === 'search' && 'Semantic Prompt Explorer'}
              {mode === 'settings' && 'Vault Engine Settings'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-neutral-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Drawer Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* 1. PERSISTENT SOUL IDENTITY LOCK BAR */}
          <div className="p-4 rounded-2xl bg-[#16161a] border border-white/5 flex items-center justify-between">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-full p-0.5 bg-gradient-to-tr from-rose-500 to-orange-400 flex-shrink-0">
                <img
                  src="/images/influencer-avatar.png"
                  alt="Persona"
                  className="w-full h-full rounded-full object-cover"
                />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="font-bold text-sm text-white">Baha Savage</span>
                  <span className="text-[10px] bg-[#d1fe17]/20 text-[#d1fe17] px-1.5 py-0.5 rounded font-semibold">
                    SOUL 2.0
                  </span>
                </div>
                <div className="text-[11px] text-neutral-400 flex items-center gap-1 mt-0.5">
                  <Lock className="w-3 h-3 text-emerald-400" />
                  <span>Face Seed: 0053510b...</span>
                </div>
              </div>
            </div>
            <button
              onClick={() => alert('Switching persona / loading other LoRA identity.')}
              className="text-xs px-2.5 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-neutral-300 font-medium transition-colors"
            >
              Switch
            </button>
          </div>

          {/* 2. MODE: CREATE / PROMPT STUDIO */}
          {(mode === 'create' || mode === 'search') && (
            <div className="space-y-5">
              {/* Model Picker */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-neutral-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-[#d1fe17]" />
                  <span>Inference Engine</span>
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: 'soul-2.0', name: 'Soul Engine 2.0', sub: 'Facial Identity Lock' },
                    { id: 'kling-1.5', name: 'Kling 1.5 HD', sub: 'High Motion Detail' },
                    { id: 'seedance', name: 'Seedance Omni', sub: 'Subject Replacement' },
                    { id: 'flux-cinema', name: 'FLUX Cinema', sub: 'Photorealistic RAW' }
                  ].map((m) => (
                    <button
                      key={m.id}
                      onClick={() => setSelectedModel(m.id as any)}
                      className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                        selectedModel === m.id
                          ? 'bg-[#d1fe17]/10 border-[#d1fe17] text-white shadow-lg shadow-[#d1fe17]/10'
                          : 'bg-white/5 border-white/5 text-neutral-400 hover:text-white hover:bg-white/10'
                      }`}
                    >
                      <div className="text-xs font-bold text-white">{m.name}</div>
                      <div className="text-[10px] text-neutral-400 mt-0.5">{m.sub}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Aspect Ratio Picker */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-neutral-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Ratio className="w-3.5 h-3.5 text-blue-400" />
                  <span>Output Aspect Ratio</span>
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: '9:16', label: '9:16', sub: 'Reels / TikTok' },
                    { id: '1:1', label: '1:1', sub: 'Feed Square' },
                    { id: '16:9', label: '16:9', sub: 'Cinema Wide' }
                  ].map((r) => (
                    <button
                      key={r.id}
                      onClick={() => setAspectRatio(r.id as any)}
                      className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer ${
                        aspectRatio === r.id
                          ? 'bg-blue-500/15 border-blue-400 text-white font-bold'
                          : 'bg-white/5 border-white/5 text-neutral-400 hover:text-white'
                      }`}
                    >
                      <div className="text-xs font-bold">{r.label}</div>
                      <div className="text-[10px] text-neutral-400 mt-0.5">{r.sub}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Prompt Text Input */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-neutral-400 uppercase tracking-wider flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                    <span>Prompt Recipe</span>
                  </span>
                  <button
                    onClick={() => setPromptText('luxury satin abaya in Dubai night skyline, cinematic bokeh, street lamps, 8k')}
                    className="text-[10px] text-[#d1fe17] hover:underline"
                  >
                    Load Preset
                  </button>
                </label>
                <textarea
                  rows={4}
                  value={promptText}
                  onChange={(e) => setPromptText(e.target.value)}
                  className="w-full p-3.5 rounded-xl bg-black/60 border border-white/10 text-white placeholder-neutral-500 text-xs leading-relaxed focus:outline-none focus:border-[#d1fe17] transition-colors resize-none"
                  placeholder="Describe your scene or style..."
                />
              </div>

              {/* Negative Prompt */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">
                  Negative Prompt
                </label>
                <input
                  type="text"
                  value={negativePrompt}
                  onChange={(e) => setNegativePrompt(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-black/60 border border-white/10 text-white placeholder-neutral-500 text-xs focus:outline-none focus:border-white/30"
                />
              </div>
            </div>
          )}

          {/* 3. MODE: MOTION & CAMERA CONTROLS (KLING & SEEDANCE) */}
          {mode === 'motion' && (
            <div className="space-y-5">
              <div className="p-4 rounded-2xl bg-[#16161a] border border-white/5 space-y-3">
                <label className="text-xs font-semibold text-neutral-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Camera className="w-3.5 h-3.5 text-fuchsia-400" />
                  <span>Cinematic Camera Movement</span>
                </label>

                {/* 6-Way Directional Grid */}
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'pan-left', label: 'Pan Left', icon: MoveLeft },
                    { id: 'tilt-up', label: 'Tilt Up', icon: MoveUp },
                    { id: 'pan-right', label: 'Pan Right', icon: MoveRight },
                    { id: 'zoom-in', label: 'Zoom In', icon: ZoomIn },
                    { id: 'tilt-down', label: 'Tilt Down', icon: MoveDown },
                    { id: 'orbit', label: 'Orbit 360°', icon: RotateCw }
                  ].map((move) => {
                    const Icon = move.icon;
                    return (
                      <button
                        key={move.id}
                        onClick={() => setSelectedCameraMove(move.id)}
                        className={`p-3 rounded-xl border flex flex-col items-center justify-center gap-1.5 transition-all cursor-pointer ${
                          selectedCameraMove === move.id
                            ? 'bg-fuchsia-500/20 border-fuchsia-400 text-white font-bold shadow-lg shadow-fuchsia-500/10'
                            : 'bg-white/5 border-white/5 text-neutral-400 hover:text-white hover:bg-white/10'
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                        <span className="text-[11px]">{move.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Motion Intensity Slider */}
              <div className="space-y-2 p-4 rounded-2xl bg-[#16161a] border border-white/5">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-semibold text-neutral-300">Motion Amplitude</span>
                  <span className="font-bold text-[#d1fe17]">{motionIntensity}%</span>
                </div>
                <input
                  type="range"
                  min="20"
                  max="100"
                  value={motionIntensity}
                  onChange={(e) => setMotionIntensity(Number(e.target.value))}
                  className="w-full accent-[#d1fe17] cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-neutral-500">
                  <span>Subtle Breeze (20%)</span>
                  <span>Dynamic Action (100%)</span>
                </div>
              </div>
            </div>
          )}

          {/* 4. MODE: TAXONOMY & CATEGORY FILTERS */}
          {mode === 'filter' && (
            <div className="space-y-4">
              <label className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">
                Aesthetic Categories (1,604 Drops)
              </label>

              <div className="space-y-2">
                {[
                  { name: 'All Drops', count: 1604, sub: 'Complete verified persona feed' },
                  { name: 'Modest & Hijab', count: 280, sub: 'Abayas, hijabs, modest tailoring' },
                  { name: 'Nightlife & Flash', count: 659, sub: 'Hard flash, Burj Al Arab, evening' },
                  { name: 'Editorial & Luxury', count: 396, sub: 'Studio lighting, satin dresses, high fashion' },
                  { name: 'Resort & Swimwear', count: 100, sub: 'Poolside cabana, palm reflections' },
                  { name: 'Gym & Fitness', count: 80, sub: 'Activewear, halter tops, barbell racks' },
                  { name: 'Podcast & Studio', count: 39, sub: 'Microphones, talk show sets, warm rim' }
                ].map((cat) => (
                  <button
                    key={cat.name}
                    onClick={() => {
                      setSelectedCategoryState(cat.name);
                      onSelectCategory?.(cat.name);
                    }}
                    className={`w-full p-3.5 rounded-xl border flex items-center justify-between transition-all cursor-pointer ${
                      selectedCategory === cat.name
                        ? 'bg-[#d1fe17]/10 border-[#d1fe17] text-white'
                        : 'bg-white/5 border-white/5 text-neutral-300 hover:bg-white/10'
                    }`}
                  >
                    <div>
                      <div className="text-xs font-bold text-white">{cat.name}</div>
                      <div className="text-[10px] text-neutral-400">{cat.sub}</div>
                    </div>
                    <span className="text-xs font-extrabold px-2 py-0.5 rounded-full bg-white/10 text-white">
                      {cat.count}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* 5. MODE: PERSONA STUDIO */}
          {mode === 'persona' && (
            <div className="space-y-5">
              <div className="p-4 rounded-2xl bg-[#16161a] border border-white/5 space-y-3">
                <h3 className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">
                  Persona Face Embedding Matrix
                </h3>
                <div className="grid grid-cols-3 gap-2">
                  <div className="aspect-square rounded-xl overflow-hidden border border-white/10">
                    <img src="/images/influencer-avatar.png" alt="Front" className="w-full h-full object-cover" />
                  </div>
                  <div className="aspect-square rounded-xl overflow-hidden border border-white/10">
                    <img src="https://storage.googleapis.com/antigravity-media/higgsfield/0053510b-801a-4712-ae6a-b28ec4b953c8.webp" alt="Car Selfie" className="w-full h-full object-cover" />
                  </div>
                  <div className="aspect-square rounded-xl overflow-hidden border border-white/10">
                    <img src="https://storage.googleapis.com/antigravity-media/higgsfield/005a76c8-500b-4770-b74c-47bc63aa9a4a.webp" alt="Nightlife" className="w-full h-full object-cover" />
                  </div>
                </div>
                <div className="text-[11px] text-emerald-400 flex items-center gap-1.5 pt-1">
                  <Check className="w-3.5 h-3.5" />
                  <span>Consistency Score: 98.4% (Car Cutoff Verified)</span>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">
                  Influencer Persona Profiles
                </label>
                <div className="p-3 rounded-xl bg-white/5 border border-white/10 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <img src="/images/influencer-avatar.png" className="w-9 h-9 rounded-full object-cover" />
                    <div>
                      <div className="text-xs font-bold text-white">Baha Savage (@savage_mode)</div>
                      <div className="text-[10px] text-neutral-400">Halal Fans Primary · 1,604 drops</div>
                    </div>
                  </div>
                  <span className="text-[10px] bg-emerald-500/20 text-emerald-400 font-bold px-2 py-0.5 rounded">Active</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Drawer Sticky Footer Action Button */}
        <div className="p-4 border-t border-white/10 bg-[#121215]">
          {mode === 'motion' ? (
            <button
              onClick={handleMotionSubmit}
              disabled={isSubmitting}
              className="w-full py-3.5 bg-gradient-to-r from-fuchsia-600 to-pink-500 hover:from-fuchsia-500 hover:to-pink-400 text-white font-bold rounded-xl text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-transform active:scale-98 shadow-xl shadow-pink-500/20 cursor-pointer"
            >
              {isSubmitting ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Dispatching Kling Motion...</span>
                </>
              ) : (
                <>
                  <Video className="w-4 h-4" />
                  <span>Generate Video ({selectedCameraMove})</span>
                </>
              )}
            </button>
          ) : (
            <button
              onClick={handleGenerate}
              disabled={isSubmitting}
              className="w-full py-3.5 bg-[#d1fe17] hover:bg-[#bfee00] text-black font-black rounded-xl text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-transform active:scale-98 shadow-xl shadow-[#d1fe17]/25 cursor-pointer"
            >
              {isSubmitting ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Dispatching to Soul Engine...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 stroke-[2.5]" />
                  <span>Generate Soul Drop ({selectedModel})</span>
                </>
              )}
            </button>
          )}
        </div>
      </aside>
    </>
  );
};
