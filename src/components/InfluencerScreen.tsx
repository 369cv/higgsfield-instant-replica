import React, { useState, useEffect, useMemo } from 'react';
import { VaultItem, StoredInfluencer, StudioHeadshot } from '../types';
import { InfluencerStore, GABRIELA_SANCHEZ } from '../services/influencerStore';
import { classifyDrop, getCanonicalNiche, NicheCategory } from '../utils/categorizationFramework';

interface InfluencerScreenProps {
  vaultItems?: VaultItem[];
  onSelectInfluencerDrops?: (dropIds: string[], influencerName: string) => void;
  onOpenPromptVault?: () => void;
}

export const InfluencerScreen: React.FC<InfluencerScreenProps> = ({
  vaultItems = [],
  onSelectInfluencerDrops,
  onOpenPromptVault,
}) => {
  // Roster of managed influencers
  const [influencers, setInfluencers] = useState<StoredInfluencer[]>(() =>
    InfluencerStore.getAll()
  );

  // Active selected influencer (or null if creating new)
  const [activeInfluencerId, setActiveInfluencerId] = useState<string | null>(() =>
    InfluencerStore.getActiveInfluencerId()
  );

  // Is in 'create new' mode
  const [isCreatingNew, setIsCreatingNew] = useState<boolean>(false);

  // Studio headshots for the active influencer
  const [studioHeadshots, setStudioHeadshots] = useState<StudioHeadshot[]>(() =>
    InfluencerStore.getStudioHeadshots()
  );
  const [activeHeadshotUrl, setActiveHeadshotUrl] = useState<string>(() =>
    InfluencerStore.getActiveHeadshot()
  );

  // Active influencer object
  const activeInfluencer = useMemo(() => {
    if (isCreatingNew) return null;
    return (
      influencers.find((inf) => inf.id === activeInfluencerId) ||
      influencers[0] ||
      GABRIELA_SANCHEZ
    );
  }, [influencers, activeInfluencerId, isCreatingNew]);

  // Center canvas view toggle: 'portrait' | 'collections'
  const [stageView, setStageView] = useState<'portrait' | 'collections'>('portrait');
  const [selectedNiche, setSelectedNiche] = useState<string>('All');

  // Bottom prompt input
  const [customPrompt, setCustomPrompt] = useState<string>('');

  // Character Details Modal
  const [showDetailsModal, setShowDetailsModal] = useState<boolean>(false);
  const [detailsTab, setDetailsTab] = useState<'details' | 'comments'>('details');

  // Builder Accordion states (Right panel)
  const [expandedSection, setExpandedSection] = useState<string>('type');
  const [builderCharacterType, setBuilderCharacterType] = useState<string>('Human');
  const [builderGender, setBuilderGender] = useState<string>('Female');
  const [builderEthnicity, setBuilderEthnicity] = useState<string>('Latina');
  const [builderSkinColor, setBuilderSkinColor] = useState<string>('Warm Tan');
  const [builderEyeColor, setBuilderEyeColor] = useState<string>('Hazel Brown');
  const [builderSkinCondition, setBuilderSkinCondition] = useState<string>('Clean Glass Skin');
  const [builderAge, setBuilderAge] = useState<number>(23);
  const [advancedTab, setAdvancedTab] = useState<'face' | 'body' | 'style'>('face');

  // Generation / Action Progress
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [progressStatus, setProgressStatus] = useState<string>('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Auto-trace influencers on mount if vault items are loaded
  useEffect(() => {
    if (vaultItems.length > 0) {
      const { added, updated } = InfluencerStore.autoTraceFromVault(vaultItems);
      if (added > 0 || updated > 0) {
        setInfluencers(InfluencerStore.getAll());
      }
    }
  }, [vaultItems]);

  // Select an influencer from left sidebar
  const handleSelectInfluencer = (inf: StoredInfluencer) => {
    setIsCreatingNew(false);
    setActiveInfluencerId(inf.id);
    InfluencerStore.setActiveInfluencerId(inf.id);
    setCustomPrompt(inf.signaturePrompt || '');
  };

  // Start "Create New" flow
  const handleStartCreateNew = () => {
    setIsCreatingNew(true);
    setActiveInfluencerId(null);
    setBuilderCharacterType('Human');
    setBuilderGender('Female');
    setBuilderEthnicity('Latina');
    setBuilderAge(22);
    setCustomPrompt('');
  };

  // Generate new influencer from Builder
  const handleGenerateInfluencer = () => {
    setIsGenerating(true);
    setProgressStatus('Sampling facial anatomy and proportions...');

    setTimeout(() => {
      setProgressStatus('Applying neutral studio gray backdrop...');
    }, 900);

    setTimeout(() => {
      setProgressStatus(`Configuring ${builderEthnicity} ${builderGender} skin shaders...`);
    }, 1800);

    setTimeout(() => {
      setProgressStatus('Rendering 2K master influencer identity...');
    }, 2700);

    setTimeout(() => {
      const newName = isCreatingNew
        ? `Persona ${influencers.length + 1}`
        : activeInfluencer?.name || 'New Influencer';

      const newInf: Partial<StoredInfluencer> = {
        name: newName,
        category: 'Fashion & Editorial',
        ethnicity: builderEthnicity,
        hair: 'Dark Waves',
        age: builderAge,
        referenceImage: activeHeadshotUrl,
        sampleImageUrl: activeHeadshotUrl,
        headshotImage: activeHeadshotUrl,
        signaturePrompt:
          customPrompt ||
          `A studio portrait of ${newName} (${builderEthnicity}, ${builderAge} years old) on neutral studio gray background, softbox lighting, 85mm f/1.4 lens...`,
      };

      const saved = InfluencerStore.save(newInf);
      setInfluencers(InfluencerStore.getAll());
      setActiveInfluencerId(saved.id);
      setIsCreatingNew(false);
      setIsGenerating(false);
      showToast(`AI Influencer "${saved.name}" successfully created and saved!`);
    }, 3600);
  };

  // Auto-trace button handler
  const handleManualTrace = () => {
    const { added, updated } = InfluencerStore.autoTraceFromVault(vaultItems);
    setInfluencers(InfluencerStore.getAll());
    showToast(
      added > 0 || updated > 0
        ? `Auto-traced ${added} new influencers, updated ${updated} profiles from vault.`
        : 'All 1,604 drops are synchronized with active influencer profiles.'
    );
  };

  // Filtered drops for active influencer (Gabriela Sanchez has all 1,604 drops)
  const influencerDrops = useMemo(() => {
    if (!activeInfluencer) return [];
    if (selectedNiche === 'All') return vaultItems;
    return vaultItems.filter((item) => getCanonicalNiche(item) === selectedNiche);
  }, [vaultItems, activeInfluencer, selectedNiche]);

  const niches: NicheCategory[] = [
    'Luxury & Lifestyle',
    'Fashion & Editorial',
    'Fitness & Wellness',
    'Nightlife & Flash',
    'Travel & Resort',
    'Streetwear & Urban',
    'Modest & Silk',
    'Beauty & Glamour',
  ];

  return (
    <div className="w-full flex-1 flex flex-col bg-[#070709] text-white select-none overflow-hidden h-[calc(100vh-4rem)]">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-50 flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#d1fe17] text-black font-bold text-xs shadow-2xl animate-fade-in">
          <svg className="w-4 h-4 text-black" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <polyline points="20 6 9 17 4 12" />
          </svg>
          <span>{toastMessage}</span>
        </div>
      )}

      {/* 3-Column Layout: Left Roster | Center Stage | Right Builder */}
      <div className="flex-1 flex flex-col md:flex-row w-full h-full overflow-hidden">
        
        {/* =================================================================== */}
        {/* COLUMN 1: LEFT SIDEBAR (AI Influencer Studio Roster)                */}
        {/* =================================================================== */}
        <aside className="w-full md:w-60 lg:w-64 border-b md:border-b-0 md:border-r border-white/10 bg-[#09090d] flex flex-col shrink-0 h-full overflow-hidden">
          {/* Studio Header Badge */}
          <div className="p-3.5 border-b border-white/10 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-neutral-300">
                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                  <circle cx="11" cy="7" r="4" />
                </svg>
              </div>
              <span className="text-xs font-bold text-white tracking-wide">
                AI Influencer Studio
              </span>
            </div>

            <button
              onClick={handleManualTrace}
              title="Auto-Trace & Sync Influencers from Prompt Vault"
              className="p-1 rounded-lg bg-white/5 hover:bg-white/10 text-neutral-400 hover:text-white transition-colors cursor-pointer"
            >
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0 1 18.8-4.3M22 12.5a10 10 0 0 1-18.8 4.2" />
              </svg>
            </button>
          </div>

          {/* Roster Cards List */}
          <div className="flex-1 overflow-y-auto no-scrollbar p-3 space-y-3">
            {/* 1. Create New Card */}
            <button
              onClick={handleStartCreateNew}
              className={`w-full aspect-[4/3] rounded-2xl border-2 border-dashed flex flex-col items-center justify-center p-3 text-center transition-all cursor-pointer group ${
                isCreatingNew
                  ? 'border-[#d1fe17] bg-[#d1fe17]/10'
                  : 'border-white/15 bg-white/[0.02] hover:bg-white/[0.05] hover:border-white/30'
              }`}
            >
              <div className="w-8 h-8 rounded-xl bg-white/5 group-hover:bg-[#d1fe17]/20 text-neutral-400 group-hover:text-[#d1fe17] flex items-center justify-center mb-1.5 transition-colors">
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <line x1="12" y1="5" x2="12" y2="19" />
                  <line x1="5" y1="12" x2="19" y2="12" />
                </svg>
              </div>
              <span className="text-xs font-bold text-white group-hover:text-[#d1fe17] transition-colors">
                Create new
              </span>
            </button>

            {/* 2. Existing Influencer Cards */}
            {influencers.map((inf) => {
              const isSelected = !isCreatingNew && activeInfluencerId === inf.id;
              return (
                <div
                  key={inf.id}
                  onClick={() => handleSelectInfluencer(inf)}
                  className={`group relative aspect-[4/3] rounded-2xl overflow-hidden cursor-pointer transition-all select-none shadow-md ${
                    isSelected
                      ? 'border-2 border-white ring-2 ring-[#d1fe17]/40 shadow-[0_0_20px_rgba(209,254,23,0.2)]'
                      : 'border border-white/10 hover:border-white/30 bg-[#121217]'
                  }`}
                >
                  <img
                    src={inf.headshotImage || inf.referenceImage || '/images/studio/headshot-1-master.png'}
                    alt={inf.name}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent pointer-events-none" />

                  {/* Name and drop count */}
                  <div className="absolute bottom-2.5 left-3 right-3 pointer-events-none">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold text-white truncate">{inf.name}</h4>
                      {inf.instagramHandle && (
                        <span className="text-[9px] font-mono text-[#d1fe17] truncate">
                          {inf.dropsCount || 1604} drops
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Bottom Incentive Card matching Higgsfield */}
          <div className="p-3 border-t border-white/10 shrink-0">
            <div className="p-3 rounded-2xl bg-gradient-to-br from-[#d1fe17]/15 to-transparent border border-[#d1fe17]/30 space-y-1">
              <span className="text-[10px] font-black text-[#d1fe17] uppercase tracking-wider block">
                EARN UP TO $3,500
              </span>
              <p className="text-[11px] font-bold text-white">WITH YOUR AI INFLUENCER</p>
              <button
                onClick={() => showToast('Creator monetization program is active for verified Soul IDs!')}
                className="text-[10px] text-neutral-400 hover:text-white underline pt-0.5 cursor-pointer block"
              >
                Learn more
              </button>
            </div>
          </div>
        </aside>

        {/* =================================================================== */}
        {/* COLUMN 2: CENTER CANVAS (The Influencer Stage)                      */}
        {/* =================================================================== */}
        <section className="flex-1 flex flex-col items-center justify-between p-4 sm:p-6 bg-gradient-to-b from-[#0a0a0d] to-[#050507] h-full overflow-y-auto no-scrollbar relative">
          
          {/* Top Bar on Center Stage */}
          <div className="w-full max-w-2xl flex items-center justify-between shrink-0 mb-3">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setStageView('portrait')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  stageView === 'portrait'
                    ? 'bg-white text-black shadow'
                    : 'bg-white/5 text-neutral-400 hover:text-white'
                }`}
              >
                Studio Canvas
              </button>
              <button
                onClick={() => setStageView('collections')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  stageView === 'collections'
                    ? 'bg-white text-black shadow'
                    : 'bg-white/5 text-neutral-400 hover:text-white'
                }`}
              >
                Photoshoots ({vaultItems.length || 1604})
              </button>
            </div>

            {activeInfluencer && (
              <button
                onClick={() => setShowDetailsModal(true)}
                className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-semibold text-neutral-300 hover:text-white flex items-center gap-1.5 transition-all cursor-pointer"
              >
                <svg className="w-3.5 h-3.5 text-[#d1fe17]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="16" x2="12" y2="12" />
                  <line x1="12" y1="8" x2="12.01" y2="8" />
                </svg>
                <span>Character Details</span>
              </button>
            )}
          </div>

          {/* STAGE VIEW A: MAIN STUDIO PORTRAIT CANVAS */}
          {stageView === 'portrait' && (
            <>
              {/* Canvas Box */}
              <div className="relative w-full max-w-md aspect-[3/4] rounded-3xl bg-[#111116] border border-white/15 overflow-hidden shadow-2xl flex items-center justify-center my-auto group">
                {isCreatingNew ? (
                  // Blank creation stage matching Higgsfield
                  <div className="flex flex-col items-center justify-center p-8 text-center space-y-3">
                    <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-neutral-400">
                      <svg className="w-7 h-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                        <rect x="3" y="3" width="18" height="18" rx="2" />
                        <circle cx="8.5" cy="8.5" r="1.5" />
                        <polyline points="21 15 16 10 5 21" />
                      </svg>
                    </div>
                    <h3 className="text-sm font-bold text-white">Your AI influencer lives here.</h3>
                    <p className="text-xs text-neutral-400 max-w-xs leading-relaxed">
                      Design and build your AI influencer from scratch using the Builder attributes on the right.
                    </p>
                  </div>
                ) : (
                  // Active Influencer Portrait Canvas matching Higgsfield
                  <>
                    <img
                      src={activeHeadshotUrl || activeInfluencer?.headshotImage || '/images/studio/headshot-1-master.png'}
                      alt={activeInfluencer?.name}
                      className="w-full h-full object-cover select-none"
                    />

                    {/* Top Left Thumbnails */}
                    <div className="absolute top-3 left-3 flex flex-col gap-1.5">
                      <div className="w-10 h-10 rounded-xl overflow-hidden border-2 border-white/60 shadow-lg">
                        <img src={activeHeadshotUrl} alt="" className="w-full h-full object-cover" />
                      </div>
                      <div className="w-10 h-10 rounded-xl overflow-hidden border border-white/20 opacity-70 hover:opacity-100 transition-opacity">
                        <img src="/images/studio/headshot-3-rembrandt.png" alt="" className="w-full h-full object-cover" />
                      </div>
                    </div>

                    {/* Top Right Heart, Download & Menu */}
                    <div className="absolute top-3 right-3 flex items-center gap-1.5">
                      <button
                        onClick={() => showToast('Saved to favorites')}
                        className="w-8 h-8 rounded-full bg-black/60 backdrop-blur-md flex items-center justify-center text-white hover:text-rose-400 transition-colors"
                      >
                        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => showToast('High-res headshot downloaded')}
                        className="w-8 h-8 rounded-full bg-black/60 backdrop-blur-md flex items-center justify-center text-white hover:text-[#d1fe17] transition-colors"
                      >
                        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                          <polyline points="7 10 12 15 17 10" />
                          <line x1="12" y1="15" x2="12" y2="3" />
                        </svg>
                      </button>
                    </div>

                    {/* Bottom Title & 4 Floating Action Circles */}
                    <div className="absolute bottom-4 left-4 right-4 flex flex-col items-center space-y-3 pointer-events-none">
                      <div className="text-center">
                        <h2 className="text-sm font-black text-white uppercase tracking-wider drop-shadow-md">
                          {activeInfluencer?.name}
                        </h2>
                        <p className="text-[10px] text-neutral-300 drop-shadow">
                          {activeInfluencer?.instagramHandle || 'A fully customizable AI influencer designed for virality'}
                        </p>
                      </div>

                      {/* 4 Floating Circular Actions */}
                      <div className="flex items-center gap-2 pointer-events-auto">
                        {/* 1. Re-roll */}
                        <button
                          onClick={() => {
                            showToast('Regenerating studio variation...');
                            setTimeout(() => showToast('Variation ready!'), 1500);
                          }}
                          className="w-9 h-9 rounded-full bg-white/20 backdrop-blur-md hover:bg-white/30 text-white flex items-center justify-center transition-transform hover:scale-105 active:scale-95 cursor-pointer shadow-lg"
                          title="Generate Variation"
                        >
                          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0 1 18.8-4.3M22 12.5a10 10 0 0 1-18.8 4.2" />
                          </svg>
                        </button>

                        {/* 2. Edit / Prompt (Lime Circle) */}
                        <button
                          onClick={() => {
                            const p = prompt('Edit character prompt:', customPrompt);
                            if (p !== null) {
                              setCustomPrompt(p);
                              showToast('Updated prompt!');
                            }
                          }}
                          className="w-10 h-10 rounded-full bg-[#d1fe17] text-black flex items-center justify-center transition-transform hover:scale-110 active:scale-95 cursor-pointer shadow-[0_0_15px_rgba(209,254,23,0.4)]"
                          title="Edit Character"
                        >
                          <svg className="w-5 h-5 text-black" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                            <path d="m12 3-1.9 5.8a2 2 0 0 1-1.3 1.3L3 12l5.8 1.9a2 2 0 0 1 1.3 1.3L12 21l1.9-5.8a2 2 0 0 1 1.3-1.3L21 12l-5.8-1.9a2 2 0 0 1-1.3-1.3Z" />
                          </svg>
                        </button>

                        {/* 3. Video / Animate (Yellow Circle) */}
                        <button
                          onClick={() => showToast('Opening Video Studio with character...')}
                          className="w-10 h-10 rounded-full bg-[#facc15] text-black flex items-center justify-center transition-transform hover:scale-110 active:scale-95 cursor-pointer shadow-lg"
                          title="Animate Reel"
                        >
                          <svg className="w-5 h-5 text-black" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                            <polygon points="23 7 16 12 23 17 23 7" />
                            <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
                          </svg>
                        </button>

                        {/* 4. Multi-Angle Turnaround Sheet */}
                        <button
                          onClick={() => showToast('Generating 4-angle turnaround sheet...')}
                          className="w-9 h-9 rounded-full bg-white/20 backdrop-blur-md hover:bg-white/30 text-white flex items-center justify-center transition-transform hover:scale-105 active:scale-95 cursor-pointer shadow-lg"
                          title="Angles Turnaround"
                        >
                          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <rect x="3" y="3" width="18" height="18" rx="2" />
                            <line x1="9" y1="3" x2="9" y2="21" />
                            <line x1="15" y1="3" x2="15" y2="21" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>

              {/* Bottom Bar below Canvas matching Higgsfield */}
              <div className="w-full max-w-xl mt-3 shrink-0">
                {isGenerating ? (
                  <div className="p-3 rounded-2xl bg-[#d1fe17]/10 border border-[#d1fe17]/30 flex items-center justify-center gap-3">
                    <svg className="w-4 h-4 text-[#d1fe17] animate-spin shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <circle cx="12" cy="12" r="10" strokeDasharray="32" strokeDashoffset="10" />
                    </svg>
                    <span className="text-xs font-bold text-[#d1fe17]">{progressStatus}</span>
                  </div>
                ) : (
                  <div className="relative flex items-center">
                    <input
                      type="text"
                      value={customPrompt}
                      onChange={(e) => setCustomPrompt(e.target.value)}
                      placeholder={isCreatingNew ? 'Describe your AI influencer or use builder...' : 'Type to customize character'}
                      className="w-full bg-[#121217] border border-white/15 rounded-2xl px-4 py-3 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-[#d1fe17] pr-28"
                    />

                    {isCreatingNew ? (
                      <button
                        onClick={handleGenerateInfluencer}
                        className="absolute right-2 px-4 py-1.5 rounded-xl bg-[#d1fe17] text-black font-extrabold text-xs flex items-center gap-1.5 shadow hover:scale-105 active:scale-95 transition-all cursor-pointer"
                      >
                        <span>Generate</span>
                        <span className="px-1 py-0.2 rounded bg-black/20 text-[9px] font-mono">2</span>
                      </button>
                    ) : (
                      <button
                        onClick={handleGenerateInfluencer}
                        className="absolute right-2 px-4 py-1.5 rounded-xl bg-[#d1fe17] text-black font-extrabold text-xs flex items-center gap-1.5 shadow hover:scale-105 active:scale-95 transition-all cursor-pointer"
                      >
                        <span>EDIT</span>
                        <svg className="w-3.5 h-3.5 text-black" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                          <path d="m12 3-1.9 5.8a2 2 0 0 1-1.3 1.3L3 12l5.8 1.9a2 2 0 0 1 1.3 1.3L12 21l1.9-5.8a2 2 0 0 1 1.3-1.3L21 12l-5.8-1.9a2 2 0 0 1-1.3-1.3Z" />
                        </svg>
                        <span className="px-1 py-0.2 rounded bg-black/20 text-[9px] font-mono">2</span>
                      </button>
                    )}
                  </div>
                )}
              </div>
            </>
          )}

          {/* STAGE VIEW B: PHOTOSHOOT COLLECTIONS GRID */}
          {stageView === 'collections' && (
            <div className="w-full flex-1 flex flex-col space-y-4 overflow-y-auto no-scrollbar">
              {/* Niche Pills */}
              <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1 shrink-0">
                <button
                  onClick={() => setSelectedNiche('All')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all cursor-pointer ${
                    selectedNiche === 'All'
                      ? 'bg-[#d1fe17] text-black font-bold'
                      : 'bg-white/5 text-neutral-400 hover:text-white'
                  }`}
                >
                  All ({vaultItems.length})
                </button>
                {niches.map((niche) => {
                  const isActive = selectedNiche === niche;
                  return (
                    <button
                      key={niche}
                      onClick={() => setSelectedNiche(niche)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all cursor-pointer ${
                        isActive
                          ? 'bg-[#d1fe17] text-black font-bold'
                          : 'bg-white/5 text-neutral-400 hover:text-white'
                      }`}
                    >
                      {niche}
                    </button>
                  );
                })}
              </div>

              {/* Photoshoot Drops Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                {influencerDrops.slice(0, 48).map((drop) => (
                  <div
                    key={drop.id}
                    onClick={() => {
                      if (onSelectInfluencerDrops) {
                        onSelectInfluencerDrops([drop.id], activeInfluencer?.name || 'Gabriela Sanchez');
                      } else if (onOpenPromptVault) {
                        onOpenPromptVault();
                      }
                    }}
                    className="group relative aspect-[3/4] rounded-2xl overflow-hidden bg-[#121217] border border-white/10 hover:border-[#d1fe17]/60 transition-all cursor-pointer shadow-md"
                  >
                    <img
                      src={drop.imageUrl || drop.fullImageUrl}
                      alt={drop.prompt}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/15 to-transparent pointer-events-none" />
                    <div className="absolute bottom-2.5 left-2.5 right-2.5 pointer-events-none">
                      <h4 className="text-xs font-bold text-white truncate">
                        {drop.category || 'Photoshoot Drop'}
                      </h4>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </section>

        {/* =================================================================== */}
        {/* COLUMN 3: RIGHT PANEL (The Builder Toolset)                         */}
        {/* =================================================================== */}
        <aside className="w-full md:w-72 lg:w-80 border-t md:border-t-0 md:border-l border-white/10 bg-[#09090d] flex flex-col shrink-0 h-full overflow-hidden">
          {/* Builder Header */}
          <div className="p-3.5 border-b border-white/10 flex items-center justify-between shrink-0">
            <span className="text-xs font-bold text-white uppercase tracking-wider">
              Builder
            </span>
            <button
              onClick={() => {
                setBuilderCharacterType('Human');
                setBuilderGender('Female');
                setBuilderEthnicity('Latina');
                setBuilderAge(23);
                showToast('Reset builder parameters to default');
              }}
              className="text-xs text-neutral-400 hover:text-white transition-colors cursor-pointer"
            >
              Reset
            </button>
          </div>

          {/* Builder Accordions */}
          <div className="flex-1 overflow-y-auto no-scrollbar p-3 space-y-2">
            
            {/* 1. Character Type Accordion */}
            <div className="border border-white/10 rounded-2xl overflow-hidden bg-white/[0.02]">
              <button
                onClick={() => setExpandedSection(expandedSection === 'type' ? '' : 'type')}
                className="w-full p-3 flex items-center justify-between text-left cursor-pointer hover:bg-white/5 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <svg className="w-3.5 h-3.5 text-[#d1fe17]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="7" r="4" />
                    <path d="M6 21v-2a6 6 0 0 1 12 0v2" />
                  </svg>
                  <span className="text-xs font-semibold text-white">Character Type</span>
                  <span className="text-[10px] text-neutral-400 font-mono">• 1</span>
                </div>
                <svg className={`w-3.5 h-3.5 text-neutral-400 transition-transform ${expandedSection === 'type' ? 'rotate-180' : ''}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </button>

              {expandedSection === 'type' && (
                <div className="p-3 pt-0 grid grid-cols-3 gap-2">
                  {/* Human Option (Selected) */}
                  <div
                    onClick={() => setBuilderCharacterType('Human')}
                    className={`aspect-square rounded-xl overflow-hidden relative cursor-pointer border-2 transition-all ${
                      builderCharacterType === 'Human'
                        ? 'border-[#d1fe17] shadow-[0_0_10px_rgba(209,254,23,0.3)]'
                        : 'border-white/10 hover:border-white/30'
                    }`}
                  >
                    <img src="/images/studio/headshot-1-master.png" alt="Human" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                    {builderCharacterType === 'Human' && (
                      <div className="absolute top-1 right-1 w-4 h-4 rounded-full bg-[#d1fe17] text-black flex items-center justify-center">
                        <svg className="w-2.5 h-2.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                      </div>
                    )}
                    <span className="absolute bottom-1 left-1.5 text-[10px] font-bold text-white">Human</span>
                  </div>

                  {/* Elf Option */}
                  <div
                    onClick={() => setBuilderCharacterType('Elf')}
                    className={`aspect-square rounded-xl overflow-hidden relative cursor-pointer border-2 transition-all ${
                      builderCharacterType === 'Elf'
                        ? 'border-[#d1fe17] shadow-[0_0_10px_rgba(209,254,23,0.3)]'
                        : 'border-white/10 hover:border-white/30'
                    }`}
                  >
                    <img src="/images/studio/headshot-5-highkey.png" alt="Elf" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                    <span className="absolute bottom-1 left-1.5 text-[10px] font-bold text-white">Elf</span>
                  </div>

                  {/* Cyborg Option */}
                  <div
                    onClick={() => setBuilderCharacterType('Cyborg')}
                    className={`aspect-square rounded-xl overflow-hidden relative cursor-pointer border-2 transition-all ${
                      builderCharacterType === 'Cyborg'
                        ? 'border-[#d1fe17] shadow-[0_0_10px_rgba(209,254,23,0.3)]'
                        : 'border-white/10 hover:border-white/30'
                    }`}
                  >
                    <img src="/images/studio/headshot-8-monochrome.png" alt="Cyborg" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                    <span className="absolute bottom-1 left-1.5 text-[10px] font-bold text-white">Cyborg</span>
                  </div>
                </div>
              )}
            </div>

            {/* 2. Gender Accordion */}
            <div className="border border-white/10 rounded-2xl overflow-hidden bg-white/[0.02]">
              <button
                onClick={() => setExpandedSection(expandedSection === 'gender' ? '' : 'gender')}
                className="w-full p-3 flex items-center justify-between text-left cursor-pointer hover:bg-white/5 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <svg className="w-3.5 h-3.5 text-neutral-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="9" />
                  </svg>
                  <span className="text-xs font-semibold text-white">Gender</span>
                </div>
                <svg className={`w-3.5 h-3.5 text-neutral-400 transition-transform ${expandedSection === 'gender' ? 'rotate-180' : ''}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </button>

              {expandedSection === 'gender' && (
                <div className="p-3 pt-0 grid grid-cols-2 gap-1.5">
                  {['Female', 'Male', 'Trans woman', 'Trans man'].map((g) => (
                    <button
                      key={g}
                      onClick={() => setBuilderGender(g)}
                      className={`py-1.5 px-2.5 rounded-xl text-xs font-medium cursor-pointer transition-all ${
                        builderGender === g
                          ? 'bg-[#d1fe17] text-black font-bold'
                          : 'bg-white/5 text-neutral-400 hover:text-white'
                      }`}
                    >
                      {g}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* 3. Ethnicity / Origin Base */}
            <div className="border border-white/10 rounded-2xl overflow-hidden bg-white/[0.02]">
              <button
                onClick={() => setExpandedSection(expandedSection === 'ethnicity' ? '' : 'ethnicity')}
                className="w-full p-3 flex items-center justify-between text-left cursor-pointer hover:bg-white/5 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <svg className="w-3.5 h-3.5 text-neutral-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10" />
                    <line x1="2" y1="12" x2="22" y2="12" />
                  </svg>
                  <span className="text-xs font-semibold text-white">Ethnicity / Origin</span>
                </div>
                <svg className={`w-3.5 h-3.5 text-neutral-400 transition-transform ${expandedSection === 'ethnicity' ? 'rotate-180' : ''}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </button>

              {expandedSection === 'ethnicity' && (
                <div className="p-3 pt-0 grid grid-cols-2 gap-1.5 text-xs">
                  {['Latina', 'Caucasian', 'Middle Eastern', 'South Asian', 'East Asian', 'Afro-Caribbean'].map((eth) => (
                    <button
                      key={eth}
                      onClick={() => setBuilderEthnicity(eth)}
                      className={`py-1.5 px-2 rounded-xl text-xs font-medium cursor-pointer transition-all ${
                        builderEthnicity === eth
                          ? 'bg-[#d1fe17] text-black font-bold'
                          : 'bg-white/5 text-neutral-400 hover:text-white'
                      }`}
                    >
                      {eth}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* 4. Age Slider */}
            <div className="border border-white/10 rounded-2xl p-3 bg-white/[0.02] space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-white">Age Bracket</span>
                <span className="font-mono text-[#d1fe17] font-bold">{builderAge} Years</span>
              </div>
              <input
                type="range"
                min="18"
                max="50"
                value={builderAge}
                onChange={(e) => setBuilderAge(Number(e.target.value))}
                className="w-full accent-[#d1fe17] cursor-pointer"
              />
            </div>

            {/* 5. Advanced Settings (Face / Body / Style tabs) matching Higgsfield */}
            <div className="border border-white/10 rounded-2xl overflow-hidden bg-white/[0.02] p-3 space-y-3">
              <span className="text-xs font-semibold text-white block">Advanced Settings</span>
              
              <div className="grid grid-cols-3 gap-1.5 p-1 rounded-xl bg-black/40 border border-white/10">
                {(['face', 'body', 'style'] as const).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setAdvancedTab(tab)}
                    className={`py-1 rounded-lg text-xs font-bold uppercase transition-all cursor-pointer ${
                      advancedTab === tab
                        ? 'bg-white/15 text-white shadow'
                        : 'text-neutral-400 hover:text-white'
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>

              {advancedTab === 'face' && (
                <div className="space-y-2 text-xs">
                  <div className="flex items-center justify-between text-neutral-400 text-[11px]">
                    <span>Jawline Sharpness</span>
                    <span className="text-white font-mono">Editorial</span>
                  </div>
                  <div className="flex items-center justify-between text-neutral-400 text-[11px]">
                    <span>Cheekbone Structure</span>
                    <span className="text-white font-mono">High Contour</span>
                  </div>
                  <div className="flex items-center justify-between text-neutral-400 text-[11px]">
                    <span>Eye Aperture</span>
                    <span className="text-white font-mono">Almond</span>
                  </div>
                </div>
              )}

              {advancedTab === 'body' && (
                <div className="space-y-2 text-xs">
                  <div className="flex items-center justify-between text-neutral-400 text-[11px]">
                    <span>Height</span>
                    <span className="text-white font-mono">5'10" (178 cm)</span>
                  </div>
                  <div className="flex items-center justify-between text-neutral-400 text-[11px]">
                    <span>Physique</span>
                    <span className="text-white font-mono">Athletic Slender</span>
                  </div>
                </div>
              )}

              {advancedTab === 'style' && (
                <div className="space-y-2 text-xs">
                  <div className="flex items-center justify-between text-neutral-400 text-[11px]">
                    <span>Lighting Engine</span>
                    <span className="text-[#d1fe17] font-mono">Master Softbox</span>
                  </div>
                  <div className="flex items-center justify-between text-neutral-400 text-[11px]">
                    <span>Backdrop</span>
                    <span className="text-white font-mono">18% Neutral Gray</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </aside>
      </div>

      {/* =================================================================== */}
      {/* 4. CHARACTER DETAILS INSPECTOR MODAL matching Higgsfield            */}
      {/* =================================================================== */}
      {showDetailsModal && activeInfluencer && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-xl flex items-center justify-center p-4">
          <div className="w-full max-w-5xl h-[85vh] rounded-3xl bg-[#111115] border border-white/15 overflow-hidden flex flex-col md:flex-row shadow-2xl">
            {/* Left: Image with bottom toolbars */}
            <div className="flex-1 flex flex-col bg-[#09090c] items-center justify-between p-4 overflow-hidden relative">
              <div className="w-full flex-1 flex items-center justify-center overflow-hidden my-auto">
                <img
                  src={activeHeadshotUrl || activeInfluencer.headshotImage}
                  alt={activeInfluencer.name}
                  className="max-h-[65vh] w-auto rounded-2xl object-contain shadow-2xl"
                />
              </div>

              {/* Bottom Quick Tools matching Higgsfield: Overview, Color Grading, Upscale, Enhancer, Relight, Inpaint, Angles */}
              <div className="w-full flex items-center justify-center gap-1.5 overflow-x-auto no-scrollbar py-2 shrink-0">
                {['Overview', 'Color Grading', 'Upscale', 'Enhancer', 'Relight', 'Inpaint', 'Angles'].map((tool) => (
                  <button
                    key={tool}
                    onClick={() => showToast(`Tool "${tool}" selected`)}
                    className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-semibold text-neutral-300 hover:text-white transition-colors cursor-pointer whitespace-nowrap"
                  >
                    {tool}
                  </button>
                ))}
              </div>
            </div>

            {/* Right: Character Info Sidebar matching Higgsfield */}
            <aside className="w-full md:w-80 border-t md:border-t-0 md:border-l border-white/10 bg-[#0e0e13] p-5 flex flex-col justify-between shrink-0 overflow-y-auto no-scrollbar">
              <div className="space-y-4">
                {/* Author Header */}
                <div className="flex items-center justify-between pb-3 border-b border-white/10">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-[#d1fe17] text-black font-black text-xs flex items-center justify-center">
                      GS
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-white">{activeInfluencer.name}</h4>
                      <p className="text-[10px] text-neutral-400">{activeInfluencer.instagramHandle || 'Verified Soul ID'}</p>
                    </div>
                  </div>

                  <button
                    onClick={() => setShowDetailsModal(false)}
                    className="p-1 rounded-lg text-neutral-400 hover:text-white transition-colors cursor-pointer"
                  >
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <line x1="18" y1="6" x2="6" y2="18" />
                      <line x1="6" y1="6" x2="18" y2="18" />
                    </svg>
                  </button>
                </div>

                {/* Details vs Comments Tabs */}
                <div className="flex items-center gap-4 text-xs font-bold border-b border-white/5 pb-2">
                  <button
                    onClick={() => setDetailsTab('details')}
                    className={`cursor-pointer ${detailsTab === 'details' ? 'text-white' : 'text-neutral-500'}`}
                  >
                    Details
                  </button>
                  <button
                    onClick={() => setDetailsTab('comments')}
                    className={`cursor-pointer ${detailsTab === 'comments' ? 'text-white' : 'text-neutral-500'}`}
                  >
                    Comments (0)
                  </button>
                </div>

                {/* Information Block */}
                <div className="space-y-2.5 text-xs">
                  <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider block">
                    Information
                  </span>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-neutral-400">Feature</span>
                    <span className="text-white font-medium">AI Influencer</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-neutral-400">Quality</span>
                    <span className="text-white font-mono">2K Master</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-neutral-400">Model Engine</span>
                    <span className="text-[#d1fe17] font-mono">Higgsfield Soul 2.0</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-neutral-400">Photoshoot Drops</span>
                    <span className="text-white font-mono">{activeInfluencer.dropsCount || 1604}</span>
                  </div>
                </div>

                {/* Prompt block */}
                <div className="space-y-1.5 pt-2">
                  <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider block">
                    Signature Prompt
                  </span>
                  <p className="text-[11px] text-neutral-300 bg-white/[0.03] p-2.5 rounded-xl border border-white/5 leading-relaxed">
                    {activeInfluencer.signaturePrompt}
                  </p>
                </div>
              </div>

              {/* Action Buttons matching Higgsfield */}
              <div className="pt-4 space-y-2 border-t border-white/10">
                <button
                  onClick={() => showToast('Motion reel queued for character!')}
                  className="w-full py-2.5 rounded-xl bg-[#d1fe17] text-black font-extrabold text-xs shadow-lg hover:bg-[#bce414] active:scale-95 transition-all cursor-pointer flex items-center justify-center gap-2"
                >
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                    <polygon points="5 3 19 12 5 21 5 3" />
                  </svg>
                  <span>Motion</span>
                </button>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <button
                    onClick={() => showToast('Recreating variation...')}
                    className="py-2 rounded-xl bg-white/5 hover:bg-white/10 text-white font-semibold transition-colors cursor-pointer"
                  >
                    Recreate
                  </button>
                  <button
                    onClick={() => {
                      if (onOpenPromptVault) onOpenPromptVault();
                      setShowDetailsModal(false);
                    }}
                    className="py-2 rounded-xl bg-white/5 hover:bg-white/10 text-white font-semibold transition-colors cursor-pointer"
                  >
                    View Drops
                  </button>
                </div>
              </div>
            </aside>
          </div>
        </div>
      )}
    </div>
  );
};
