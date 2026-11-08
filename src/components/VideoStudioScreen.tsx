import React, { useState } from 'react';
import { VaultItem } from '../types';

interface VideoStudioScreenProps {
  vaultItems: VaultItem[];
  onReturnToVault?: () => void;
}

interface VideoPreset {
  id: string;
  name: string;
  model: string;
  thumbnail: string;
  tag?: string;
}

export const VideoStudioScreen: React.FC<VideoStudioScreenProps> = ({
  vaultItems,
  onReturnToVault,
}) => {
  const [activeTab, setActiveTab] = useState<'create' | 'edit' | 'motion'>('create');
  const [modelFamily, setModelFamily] = useState<'seedance' | 'kling'>('seedance');
  const [showPresetPicker, setShowPresetPicker] = useState(false);

  // Video Settings
  const [duration, setDuration] = useState<'5s' | '8s'>('8s');
  const [aspectRatio, setAspectRatio] = useState<'16:9' | '1:1' | '9:16'>('16:9');
  const [quality, setQuality] = useState<'1080p' | '720p' | '4K'>('1080p');
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [multiShot, setMultiShot] = useState(false);
  const [promptText, setPromptText] = useState(
    'A cinematic night tracking shot of a luxury sports car moving through neon reflections...'
  );

  // Frame selection
  const [startFrame, setStartFrame] = useState<string | null>(
    vaultItems.length > 0 ? (vaultItems[0].imageUrl || vaultItems[0].fullImageUrl || null) : null
  );
  const [endFrame, setEndFrame] = useState<string | null>(null);

  // Active Preset
  const presets: VideoPreset[] = [
    {
      id: 'general',
      name: 'GENERAL',
      model: 'Seedance 2.0',
      thumbnail: 'https://d8j0ntlcm91z4.cloudfront.net/user_336JgWTlqHQHPYleCS3LEJ2wTSb/hf_20261107_214641_9271be3f-9133-4616-80ad-78f86ba445f9_min.webp',
    },
    {
      id: 'cgi-breakdown',
      name: 'CGI BREAKDOWN',
      model: 'Seedance 2.0',
      thumbnail: 'https://d8j0ntlcm91z4.cloudfront.net/user_336JgWTlqHQHPYleCS3LEJ2wTSb/hf_20261107_214641_787510e3-c547-4994-b0ef-c7004c10e5d7_min.webp',
      tag: 'NEW',
    },
    {
      id: 'neon-city',
      name: 'NEON CITY',
      model: 'Kling 3.0',
      thumbnail: 'https://d8j0ntlcm91z4.cloudfront.net/user_336JgWTlqHQHPYleCS3LEJ2wTSb/hf_20261107_214641_cdca0579-8fc8-4739-a572-c0a4d5c6ce2c_min.webp',
      tag: 'NEW',
    },
    {
      id: 'soul-fighter',
      name: 'SOUL FIGHTER',
      model: 'Kling 3.0',
      thumbnail: 'https://d8j0ntlcm91z4.cloudfront.net/user_336JgWTlqHQHPYleCS3LEJ2wTSb/hf_20261107_214641_ff3a423f-4e74-47b5-8f0b-7f6ab800e5eb_min.webp',
    },
    {
      id: 'nightline',
      name: 'NIGHTLINE',
      model: 'Seedance 2.0',
      thumbnail: 'https://d8j0ntlcm91z4.cloudfront.net/user_336JgWTlqHQHPYleCS3LEJ2wTSb/hf_20261106_032931_d976d760-0475-445e-9ab3-2bb95860981c_min.webp',
    },
    {
      id: 'apex-hunter',
      name: 'APEX HUNTER',
      model: 'Kling 3.0',
      thumbnail: 'https://d8j0ntlcm91z4.cloudfront.net/user_336JgWTlqHQHPYleCS3LEJ2wTSb/hf_20261106_032629_50852861-9ff2-406b-81f9-ef02fb7a2ab5_min.webp',
    },
  ];

  const [selectedPreset, setSelectedPreset] = useState<VideoPreset>(presets[0]);
  const [isGeneratingVideo, setIsGeneratingVideo] = useState(false);
  const [hasGeneratedOutput, setHasGeneratedOutput] = useState(false);

  const handleGenerate = () => {
    setIsGeneratingVideo(true);
    setTimeout(() => {
      setIsGeneratingVideo(false);
      setHasGeneratedOutput(true);
    }, 2800);
  };

  return (
    <div className="flex-1 w-full bg-canvas text-white flex flex-col md:flex-row h-[calc(100vh-4rem)] overflow-hidden select-none">
      
      {/* =================================================================== */}
      {/* LEFT CONTROL SIDEBAR                                                */}
      {/* =================================================================== */}
      <aside className="w-full md:w-80 border-b md:border-b-0 md:border-r border-white/10 bg-base flex flex-col shrink-0 h-full overflow-y-auto no-scrollbar p-4 space-y-4">
        
        {/* Top Tab Strip: Create Video | Edit Video | Motion Control */}
        <div className="flex items-center gap-1 p-1 rounded-xl bg-white/[0.03] border border-white/5 text-xs shrink-0">
          <button
            onClick={() => setActiveTab('create')}
            className={`flex-1 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
              activeTab === 'create' ? 'bg-[#d1fe17] text-black shadow-sm' : 'text-neutral-400 hover:text-white'
            }`}
          >
            Create Video
          </button>
          <button
            onClick={() => setActiveTab('edit')}
            className={`flex-1 py-1.5 rounded-lg font-medium transition-all cursor-pointer ${
              activeTab === 'edit' ? 'bg-[#d1fe17] text-black font-bold shadow-sm' : 'text-neutral-400 hover:text-white'
            }`}
          >
            Edit Video
          </button>
          <button
            onClick={() => setActiveTab('motion')}
            className={`flex-1 py-1.5 rounded-lg font-medium transition-all cursor-pointer ${
              activeTab === 'motion' ? 'bg-[#d1fe17] text-black font-bold shadow-sm' : 'text-neutral-400 hover:text-white'
            }`}
          >
            Motion Control
          </button>
        </div>

        {/* Selected Preset Style Card */}
        <div className="relative aspect-[16/9] rounded-2xl overflow-hidden bg-surface border border-white/10 p-3 flex flex-col justify-between group shadow-md shrink-0">
          <img src={selectedPreset.thumbnail} alt="" className="absolute inset-0 w-full h-full object-cover opacity-60" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent pointer-events-none" />

          <div className="relative z-10 flex items-center justify-between">
            <span className="px-2 py-0.5 rounded-full text-[9px] font-mono bg-black/60 backdrop-blur-md text-accent-ink border border-white/10 font-bold">
              {selectedPreset.model}
            </span>
            <button
              onClick={() => setShowPresetPicker(!showPresetPicker)}
              className="px-2.5 py-1 rounded-lg bg-black/60 hover:bg-black/90 text-white text-[10px] font-semibold flex items-center gap-1 border border-white/10 transition-colors cursor-pointer"
            >
              <svg className="w-3 h-3 text-accent-ink" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M12 20h9M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
              </svg>
              <span>Change</span>
            </button>
          </div>

          <div className="relative z-10">
            <h3 className="text-sm font-extrabold text-white tracking-wide">{selectedPreset.name}</h3>
          </div>
        </div>

        {/* Start Frame & End Frame Dropzones */}
        <div className="grid grid-cols-2 gap-2 shrink-0">
          <div className="relative aspect-[4/3] rounded-xl bg-white/[0.02] border border-white/10 p-2 flex flex-col items-center justify-center text-center overflow-hidden group">
            {startFrame ? (
              <>
                <img src={startFrame} alt="Start frame" className="absolute inset-0 w-full h-full object-cover" />
                <span className="absolute bottom-1 left-1 px-1.5 py-0.5 rounded bg-black/70 text-[8px] text-white font-mono">
                  Start frame
                </span>
              </>
            ) : (
              <>
                <svg className="w-5 h-5 text-neutral-500 mb-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="3" width="18" height="18" rx="2" />
                  <circle cx="8.5" cy="8.5" r="1.5" />
                  <polyline points="21 15 16 10 5 21" />
                </svg>
                <span className="text-[10px] font-medium text-neutral-300">Start frame</span>
                <span className="text-[8px] text-neutral-500">Optional</span>
              </>
            )}
          </div>

          <div className="relative aspect-[4/3] rounded-xl bg-white/[0.02] border border-white/10 p-2 flex flex-col items-center justify-center text-center overflow-hidden group">
            {endFrame ? (
              <>
                <img src={endFrame} alt="End frame" className="absolute inset-0 w-full h-full object-cover" />
                <span className="absolute bottom-1 left-1 px-1.5 py-0.5 rounded bg-black/70 text-[8px] text-white font-mono">
                  End frame
                </span>
              </>
            ) : (
              <>
                <svg className="w-5 h-5 text-neutral-500 mb-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="3" width="18" height="18" rx="2" />
                  <circle cx="8.5" cy="8.5" r="1.5" />
                  <polyline points="21 15 16 10 5 21" />
                </svg>
                <span className="text-[10px] font-medium text-neutral-300">End frame</span>
                <span className="text-[8px] text-neutral-500">Optional</span>
              </>
            )}
          </div>
        </div>

        {/* Multi-shot switch */}
        <div className="flex items-center justify-between text-xs py-1 shrink-0">
          <span className="text-neutral-300 font-medium">Multi-shot</span>
          <button
            onClick={() => setMultiShot(!multiShot)}
            className={`w-9 h-5 rounded-full transition-colors relative cursor-pointer ${
              multiShot ? 'bg-[#d1fe17]' : 'bg-white/10'
            }`}
          >
            <span
              className={`block w-3.5 h-3.5 rounded-full bg-white transition-transform ${
                multiShot ? 'translate-x-4 bg-black' : 'translate-x-1'
              }`}
            />
          </button>
        </div>

        {/* Prompt Input */}
        <div className="space-y-1.5 shrink-0">
          <label className="text-[11px] font-semibold text-neutral-300">Prompt</label>
          <textarea
            rows={3}
            value={promptText}
            onChange={(e) => setPromptText(e.target.value)}
            placeholder="Describe your scene in detail. Use @ to reference assets"
            className="w-full bg-surface border border-white/10 rounded-xl p-2.5 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-[#d1fe17] resize-none"
          />
          <div className="flex items-center gap-1.5 text-[10px]">
            <button className="px-2 py-0.5 rounded-md bg-white/5 hover:bg-white/10 text-neutral-400 hover:text-white border border-white/5">
              @ Elements
            </button>
            <button
              onClick={() => setAudioEnabled(!audioEnabled)}
              className={`px-2 py-0.5 rounded-md border text-neutral-400 ${
                audioEnabled ? 'bg-[#d1fe17]/10 text-accent-ink border-[#d1fe17]/20 font-bold' : 'border-white/5'
              }`}
            >
              Audio {audioEnabled ? 'On' : 'Off'}
            </button>
          </div>
        </div>

        {/* Model Selector & Format Pills */}
        <div className="space-y-2 shrink-0">
          <div className="flex items-center justify-between p-2 rounded-xl bg-white/[0.02] border border-white/10 text-xs">
            <span className="text-neutral-400">Model</span>
            <span className="font-bold text-white font-mono">{selectedPreset.model}</span>
          </div>

          <div className="grid grid-cols-3 gap-1.5 text-xs">
            <button
              onClick={() => setDuration(duration === '5s' ? '8s' : '5s')}
              className="py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-neutral-300 font-mono text-[11px]"
            >
              {duration}
            </button>
            <button
              onClick={() => setAspectRatio(aspectRatio === '16:9' ? '9:16' : '16:9')}
              className="py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-neutral-300 font-mono text-[11px]"
            >
              {aspectRatio}
            </button>
            <button
              onClick={() => setQuality(quality === '1080p' ? '4K' : '1080p')}
              className="py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-neutral-300 font-mono text-[11px]"
            >
              {quality}
            </button>
          </div>
        </div>

        {/* Generate CTA */}
        <div className="pt-2 shrink-0">
          <button
            disabled={isGeneratingVideo}
            onClick={handleGenerate}
            className={`w-full py-3 rounded-2xl font-extrabold text-xs flex items-center justify-center gap-2 shadow-xl transition-all cursor-pointer ${
              isGeneratingVideo
                ? 'bg-white/10 text-neutral-400 cursor-not-allowed'
                : 'bg-[#d1fe17] text-black hover:bg-[#bce414] active:scale-95'
            }`}
          >
            {isGeneratingVideo ? (
              <>
                <svg className="w-4 h-4 animate-spin text-black" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <circle cx="12" cy="12" r="10" strokeDasharray="32" strokeDashoffset="10" />
                </svg>
                <span>Rendering Video...</span>
              </>
            ) : (
              <>
                <span>Generate</span>
                <svg className="w-3.5 h-3.5 text-black" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="m12 3-1.9 5.8a2 2 0 0 1-1.3 1.3L3 12l5.8 1.9a2 2 0 0 1 1.3 1.3L12 21l1.9-5.8a2 2 0 0 1 1.3-1.3L21 12l-5.8-1.9a2 2 0 0 1-1.3-1.3Z" />
                </svg>
                <span className="font-mono">32</span>
              </>
            )}
          </button>
        </div>
      </aside>

      {/* =================================================================== */}
      {/* MAIN VIEW AREA (Presets / Hero / Video Player)                      */}
      {/* =================================================================== */}
      <main className="flex-1 flex flex-col p-6 overflow-y-auto no-scrollbar relative bg-gradient-to-b from-base to-canvas">
        
        {/* Preset Picker Modal/Overlay when toggled */}
        {showPresetPicker ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setModelFamily('seedance')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    modelFamily === 'seedance' ? 'bg-[#d1fe17] text-black' : 'bg-white/5 text-neutral-400'
                  }`}
                >
                  Seedance 2.0
                </button>
                <button
                  onClick={() => setModelFamily('kling')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    modelFamily === 'kling' ? 'bg-[#d1fe17] text-black' : 'bg-white/5 text-neutral-400'
                  }`}
                >
                  Kling 3.0
                </button>
              </div>

              <button
                onClick={() => setShowPresetPicker(false)}
                className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-neutral-400 hover:text-white"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {presets.map((p) => (
                <div
                  key={p.id}
                  onClick={() => {
                    setSelectedPreset(p);
                    setShowPresetPicker(false);
                  }}
                  className="group relative aspect-[3/4] rounded-2xl overflow-hidden bg-surface border border-white/10 hover:border-[#d1fe17] cursor-pointer transition-all flex flex-col justify-end p-3 shadow-lg"
                >
                  <img src={p.thumbnail} alt="" className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />
                  <div className="relative z-10">
                    <span className="text-xs font-bold text-white leading-tight">{p.name}</span>
                    <p className="text-[10px] text-neutral-400 font-mono">{p.model}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : hasGeneratedOutput ? (
          /* Live Generated Video Player */
          <div className="flex-1 flex flex-col items-center justify-center max-w-4xl mx-auto w-full space-y-4">
            <div className="relative w-full aspect-video rounded-3xl overflow-hidden bg-black border border-white/15 shadow-2xl flex items-center justify-center group">
              <img
                src={selectedPreset.thumbnail}
                alt="Generated output"
                className="w-full h-full object-cover opacity-90 group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                <div className="w-16 h-16 rounded-full bg-[#d1fe17] text-black flex items-center justify-center shadow-[0_0_30px_rgba(209,254,23,0.5)] hover:scale-110 transition-transform cursor-pointer">
                  <svg className="w-7 h-7 fill-current ml-0.5" viewBox="0 0 24 24">
                    <polygon points="5 3 19 12 5 21 5 3" />
                  </svg>
                </div>
              </div>

              {/* Specs Overlay */}
              <div className="absolute top-4 left-4 flex items-center gap-2">
                <span className="px-2.5 py-1 rounded-full bg-black/70 backdrop-blur-md text-accent-ink text-[10px] font-mono font-bold border border-white/10">
                  {selectedPreset.model}
                </span>
                <span className="px-2.5 py-1 rounded-full bg-black/70 backdrop-blur-md text-white text-[10px] font-mono border border-white/10">
                  {duration} · {aspectRatio} · {quality}
                </span>
              </div>
            </div>

            <div className="w-full flex items-center justify-between text-xs text-neutral-400 px-2">
              <p className="truncate max-w-xl text-neutral-300">Prompt: {promptText}</p>
              <button
                onClick={() => setHasGeneratedOutput(false)}
                className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-white font-medium"
              >
                Create Another
              </button>
            </div>
          </div>
        ) : (
          /* Feature Demonstration Hero (Matching Higgsfield Web Video 1.png) */
          <div className="flex-1 flex flex-col justify-center max-w-4xl mx-auto w-full py-8">
            <div className="text-center mb-10">
              <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white uppercase">
                Make Videos In One Click
              </h2>
              <p className="text-xs sm:text-sm text-neutral-400 mt-2 max-w-xl mx-auto">
                250+ presets for camera control, framing, and high-quality VFX - or use the general preset for manual control.
              </p>
            </div>

            {/* 3 Step Demonstration Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Step 1: Add Image */}
              <div className="p-5 rounded-3xl bg-surface border border-white/10 flex flex-col justify-between space-y-4">
                <div className="aspect-[4/3] rounded-2xl bg-white/5 border border-dashed border-white/15 flex flex-col items-center justify-center p-4 text-center">
                  <svg className="w-8 h-8 text-neutral-400 mb-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                    <rect x="3" y="3" width="18" height="18" rx="2" />
                    <circle cx="8.5" cy="8.5" r="1.5" />
                    <polyline points="21 15 16 10 5 21" />
                  </svg>
                  <span className="text-xs font-bold text-white">Upload image</span>
                  <span className="text-[10px] text-neutral-500 mt-0.5">Paste from clipboard</span>
                </div>
                <div>
                  <h4 className="text-xs font-extrabold text-white uppercase">Add Image</h4>
                  <p className="text-[11px] text-neutral-400 mt-1">
                    Upload or generate an image to start your animation
                  </p>
                </div>
              </div>

              {/* Step 2: Choose Preset */}
              <div className="p-5 rounded-3xl bg-surface border border-white/10 flex flex-col justify-between space-y-4">
                <div className="aspect-[4/3] rounded-2xl overflow-hidden bg-black/60 relative">
                  <img
                    src="https://d8j0ntlcm91z4.cloudfront.net/user_336JgWTlqHQHPYleCS3LEJ2wTSb/hf_20261107_214641_9271be3f-9133-4616-80ad-78f86ba445f9_min.webp"
                    alt=""
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 border-2 border-[#d1fe17] rounded-2xl" />
                </div>
                <div>
                  <h4 className="text-xs font-extrabold text-white uppercase">Choose Preset</h4>
                  <p className="text-[11px] text-neutral-400 mt-1">
                    Pick a preset to control your image movement
                  </p>
                </div>
              </div>

              {/* Step 3: Get Video */}
              <div className="p-5 rounded-3xl bg-surface border border-white/10 flex flex-col justify-between space-y-4">
                <div className="aspect-[4/3] rounded-2xl overflow-hidden bg-black relative">
                  <img
                    src="https://d8j0ntlcm91z4.cloudfront.net/user_336JgWTlqHQHPYleCS3LEJ2wTSb/hf_20261107_214641_787510e3-c547-4994-b0ef-c7004c10e5d7_min.webp"
                    alt=""
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                    <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white">
                      <svg className="w-5 h-5 fill-current ml-0.5" viewBox="0 0 24 24">
                        <polygon points="5 3 19 12 5 21 5 3" />
                      </svg>
                    </div>
                  </div>
                </div>
                <div>
                  <h4 className="text-xs font-extrabold text-white uppercase">Get Video</h4>
                  <p className="text-[11px] text-neutral-400 mt-1">
                    Click generate to create your final animated video!
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

    </div>
  );
};
