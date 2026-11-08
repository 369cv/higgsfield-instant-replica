import React, { useState, useEffect, useMemo } from 'react';
import { StoredInfluencer } from '../types';
import { InfluencerStore } from '../services/influencerStore';

interface InfluencerScreenProps {
  onSelectInfluencerDrops?: (dropIds: string[], influencerName: string) => void;
  onOpenPromptVault?: () => void;
}

export const InfluencerScreen: React.FC<InfluencerScreenProps> = ({
  onSelectInfluencerDrops,
  onOpenPromptVault,
}) => {
  const [influencers, setInfluencers] = useState<StoredInfluencer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'vault' | 'studio'>('vault');
  const [selectedInfluencer, setSelectedInfluencer] = useState<StoredInfluencer | null>(null);

  // Search & Filter in Vault view
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  // Studio Interactive Builder States
  const [characterType, setCharacterType] = useState('Human');
  const [gender, setGender] = useState('Female');
  const [ethnicity, setEthnicity] = useState('Caucasian');
  const [age, setAge] = useState(22);
  const [hair, setHair] = useState('Long Brunette');
  const [aesthetic, setAesthetic] = useState('Luxury & Silk');
  const [customPrompt, setCustomPrompt] = useState('');
  const [influencerName, setInfluencerName] = useState('');

  // Policy Modal
  const [showPolicyModal, setShowPolicyModal] = useState(false);
  const [saveSuccessNotice, setSaveSuccessNotice] = useState<string | null>(null);

  // Load influencers from store
  useEffect(() => {
    let isMounted = true;
    async function loadData() {
      setIsLoading(true);
      const data = await InfluencerStore.getAll();
      if (isMounted) {
        setInfluencers(data);
        if (data.length > 0 && !selectedInfluencer) {
          setSelectedInfluencer(data[0]);
          loadInfluencerIntoStudio(data[0]);
        }
        setIsLoading(false);
      }
    }
    loadData();
    return () => {
      isMounted = false;
    };
  }, []);

  const loadInfluencerIntoStudio = (inf: StoredInfluencer) => {
    setSelectedInfluencer(inf);
    setInfluencerName(inf.name);
    setEthnicity(inf.ethnicity || 'Caucasian');
    setHair(inf.hair || 'Long Brunette');
    setAge(inf.age || 22);
    setAesthetic(inf.category || 'Luxury & Silk');
    setCustomPrompt(inf.signaturePrompt || '');
  };

  const handleCreateNewBlank = () => {
    window.scrollTo(0, 0);
    setSelectedInfluencer(null);
    setInfluencerName('New Persona');
    setCharacterType('Human');
    setGender('Female');
    setEthnicity('Caucasian');
    setAge(22);
    setHair('Long Brunette');
    setAesthetic('Luxury & Silk');
    setCustomPrompt(
      'A full-body high fashion photograph of a stylish female influencer...'
    );
    setViewMode('studio');
  };

  const handleOpenStudioWithInfluencer = (inf: StoredInfluencer) => {
    window.scrollTo(0, 0);
    loadInfluencerIntoStudio(inf);
    setViewMode('studio');
  };

  // Filtered list in Vault view
  const filteredInfluencers = useMemo(() => {
    return influencers.filter((inf) => {
      // 1. Search Query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = inf.name.toLowerCase().includes(q);
        const matchesCat = inf.category.toLowerCase().includes(q);
        const matchesEth = inf.ethnicity.toLowerCase().includes(q);
        const matchesPrompt = inf.signaturePrompt.toLowerCase().includes(q);
        if (!matchesName && !matchesCat && !matchesEth && !matchesPrompt) return false;
      }

      // 2. Category Filter
      if (selectedCategory !== 'All') {
        const cat = selectedCategory.toLowerCase();
        if (cat.includes('nightlife') && !inf.category.toLowerCase().includes('nightlife')) return false;
        if (cat.includes('editorial') && !inf.category.toLowerCase().includes('editorial')) return false;
        if (cat.includes('gym') && !inf.category.toLowerCase().includes('gym')) return false;
        if (cat.includes('poolside') && !inf.category.toLowerCase().includes('poolside') && !inf.category.toLowerCase().includes('resort')) return false;
        if (cat.includes('streetwear') && !inf.category.toLowerCase().includes('streetwear') && !inf.category.toLowerCase().includes('flash')) return false;
        if (cat.includes('modest') && !inf.category.toLowerCase().includes('modest')) return false;
      }

      return true;
    });
  }, [influencers, searchQuery, selectedCategory]);

  const handleSaveInfluencer = () => {
    const saved = InfluencerStore.save({
      id: selectedInfluencer ? selectedInfluencer.id : undefined,
      name: influencerName || 'Custom Influencer',
      referenceImage: selectedInfluencer
        ? selectedInfluencer.referenceImage
        : 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=500&auto=format&fit=crop&q=80',
      sampleImageUrl: selectedInfluencer
        ? selectedInfluencer.sampleImageUrl
        : 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=800&auto=format&fit=crop&q=80',
      category: aesthetic,
      ethnicity,
      hair,
      age,
      dropsCount: selectedInfluencer ? selectedInfluencer.dropsCount : 1,
      associatedDropIds: selectedInfluencer ? selectedInfluencer.associatedDropIds : [],
      signaturePrompt: customPrompt,
    });

    setInfluencers((prev) => [saved, ...prev.filter((i) => i.id !== saved.id)]);
    setSelectedInfluencer(saved);
    setShowPolicyModal(false);
    setSaveSuccessNotice(`Saved "${saved.name}" to Influencer Vault!`);
    setTimeout(() => setSaveSuccessNotice(null), 3000);
  };

  const categories = [
    { id: 'All', label: `All (${influencers.length || 400})` },
    { id: 'Nightlife', label: 'Nightlife & Flash' },
    { id: 'Editorial', label: 'Editorial & Luxury' },
    { id: 'Gym', label: 'Gym & Fitness' },
    { id: 'Poolside', label: 'Dubai Poolside & Resort' },
    { id: 'Streetwear', label: 'Streetwear & 35mm' },
    { id: 'Modest', label: 'Modest & Silk' },
  ];

  return (
    <div className="w-full flex-1 flex flex-col bg-[#09090c] text-white select-none">
      {/* Save Success Toast */}
      {saveSuccessNotice && (
        <div className="fixed top-20 right-6 z-50 flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#d1fe17] text-black font-bold text-xs shadow-2xl animate-fade-in">
          <svg className="w-4 h-4 text-black" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <polyline points="20 6 9 17 4 12" />
          </svg>
          <span>{saveSuccessNotice}</span>
        </div>
      )}

      {/* ===================================================================== */}
      {/* VIEW 1: THE INFLUENCER VAULT ROSTER                                   */}
      {/* ===================================================================== */}
      {viewMode === 'vault' && (
        <div className="flex-1 flex flex-col p-4 sm:p-6 max-w-7xl mx-auto w-full">
          {/* Header Banner */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6 border-b border-white/10">
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase bg-[#d1fe17]/10 text-[#d1fe17] border border-[#d1fe17]/20">
                  Prompt Vault Personas
                </span>
                <span className="text-xs text-neutral-400 font-mono">
                  {influencers.length} Stored Influencers
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
                AI Influencer Vault
              </h1>
              <p className="text-xs text-neutral-400 mt-1 max-w-2xl">
                Each influencer extracted from the Prompt Vault is stored and ready-to-go. Select any persona to start a photoshoot, customize their look in the studio, or create a brand new character.
              </p>
            </div>

            {/* Actions: Create New */}
            <div className="flex items-center gap-3">
              <button
                onClick={handleCreateNewBlank}
                className="flex items-center gap-2 px-4 sm:px-5 py-2.5 rounded-xl bg-[#d1fe17] text-black font-bold text-xs shadow-[0_0_20px_rgba(209,254,23,0.3)] hover:scale-[1.02] active:scale-95 transition-all cursor-pointer"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="12" y1="5" x2="12" y2="19" />
                  <line x1="5" y1="12" x2="19" y2="12" />
                </svg>
                <span>Create New Influencer</span>
              </button>
            </div>
          </div>

          {/* Filters & Search Toolbar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 py-4">
            {/* Category Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1 text-xs">
              {categories.map((cat) => {
                const isActive = selectedCategory === cat.id;
                return (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all cursor-pointer ${
                      isActive
                        ? 'bg-white/10 text-white font-bold border border-white/20'
                        : 'bg-white/[0.03] text-neutral-400 hover:text-white border border-white/5'
                    }`}
                  >
                    {cat.label}
                  </button>
                );
              })}
            </div>

            {/* Search Input */}
            <div className="relative w-full sm:w-72">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search influencers by name or style..."
                className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-3 pl-8 py-2 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-[#d1fe17]"
              />
              <svg className="w-3.5 h-3.5 text-neutral-500 absolute left-2.5 top-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
            </div>
          </div>

          {/* Grid of Influencers */}
          {isLoading ? (
            <div className="flex items-center justify-center py-24 text-neutral-400 text-xs font-mono">
              <svg className="w-5 h-5 text-[#d1fe17] animate-spin mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" strokeDasharray="32" strokeDashoffset="10" />
              </svg>
              <span>Loading 400 Extracted Influencers...</span>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4 mt-2">
              {/* CARD 0: CREATE NEW CARD */}
              <div
                onClick={handleCreateNewBlank}
                className="aspect-[3/4] rounded-2xl border-2 border-dashed border-white/15 bg-white/[0.02] hover:bg-white/[0.05] hover:border-[#d1fe17]/50 flex flex-col items-center justify-center p-4 text-center cursor-pointer transition-all group"
              >
                <div className="w-12 h-12 rounded-2xl bg-white/5 group-hover:bg-[#d1fe17]/20 border border-white/10 group-hover:border-[#d1fe17]/40 flex items-center justify-center text-neutral-400 group-hover:text-[#d1fe17] transition-all mb-3">
                  <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="12" y1="5" x2="12" y2="19" />
                    <line x1="5" y1="12" x2="19" y2="12" />
                  </svg>
                </div>
                <h4 className="text-xs font-bold text-white group-hover:text-[#d1fe17] transition-colors">
                  Create Influencer
                </h4>
                <p className="text-[10px] text-neutral-400 mt-1">
                  Design attributes or upload custom reference face
                </p>
              </div>

              {/* STORED INFLUENCER CARDS */}
              {filteredInfluencers.slice(0, 100).map((inf) => (
                <div
                  key={inf.id}
                  className="group relative aspect-[3/4] rounded-2xl overflow-hidden bg-[#121217] border border-white/10 hover:border-[#d1fe17]/60 transition-all flex flex-col justify-end p-3 shadow-lg"
                >
                  <img
                    src={inf.referenceImage}
                    alt={inf.name}
                    className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/40 to-transparent pointer-events-none" />

                  {/* Top Badges */}
                  <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between z-10">
                    <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-black/60 backdrop-blur-md text-[#d1fe17] border border-white/10 font-mono">
                      {inf.dropsCount} Drops
                    </span>
                    <span className="px-2 py-0.5 rounded-full text-[9px] font-medium bg-black/60 backdrop-blur-md text-white/80 border border-white/10 truncate max-w-[90px]">
                      {inf.category}
                    </span>
                  </div>

                  {/* Card Content */}
                  <div className="relative z-10 space-y-1">
                    <h3 className="text-xs font-bold text-white leading-tight">
                      {inf.name}
                    </h3>
                    <p className="text-[10px] text-neutral-300 truncate">
                      {inf.ethnicity} · {inf.hair}
                    </p>

                    <div className="pt-2 flex items-center gap-1.5">
                      <button
                        onClick={() => handleOpenStudioWithInfluencer(inf)}
                        className="flex-1 py-1.5 rounded-lg bg-[#d1fe17] text-black text-[10px] font-bold text-center hover:bg-[#bce414] transition-colors cursor-pointer"
                      >
                        Open Studio
                      </button>
                      {onSelectInfluencerDrops && inf.associatedDropIds && inf.associatedDropIds.length > 0 && (
                        <button
                          onClick={() => onSelectInfluencerDrops(inf.associatedDropIds || [], inf.name)}
                          className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white cursor-pointer transition-colors"
                          title={`View ${inf.dropsCount} Prompt Vault Drops`}
                        >
                          <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                            <polyline points="15 3 21 3 21 9" />
                            <line x1="10" y1="14" x2="21" y2="3" />
                          </svg>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {filteredInfluencers.length > 100 && (
            <div className="mt-8 p-4 rounded-2xl bg-white/[0.02] border border-white/10 flex items-center justify-between text-xs text-neutral-400">
              <span>
                Showing 100 of {filteredInfluencers.length} influencers in catalog. Use search or categories to filter.
              </span>
            </div>
          )}
        </div>
      )}

      {/* ===================================================================== */}
      {/* VIEW 2: THE AI INFLUENCER CREATION STUDIO                             */}
      {/* ===================================================================== */}
      {viewMode === 'studio' && (
        <div className="flex-1 flex flex-col md:flex-row w-full h-[calc(100vh-4rem)] overflow-hidden">
          {/* COLUMN 1: LEFT ROSTER DRAWER */}
          <aside className="w-full md:w-64 border-b md:border-b-0 md:border-r border-white/10 bg-[#0c0c10] flex flex-col shrink-0 h-full overflow-hidden">
            <div className="p-3 border-b border-white/10 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-white tracking-wide uppercase">
                  Influencer Vault
                </span>
                <span className="px-1.5 py-0.5 rounded-full bg-white/10 text-[9px] font-mono text-neutral-300">
                  {influencers.length}
                </span>
              </div>
              <button
                onClick={() => {
                  window.scrollTo(0, 0);
                  setViewMode('vault');
                }}
                className="text-[11px] text-[#d1fe17] hover:underline cursor-pointer font-medium"
              >
                View Roster
              </button>
            </div>

            <div className="p-2 border-b border-white/5 shrink-0">
              <button
                onClick={handleCreateNewBlank}
                className="w-full flex items-center justify-center gap-2 py-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-dashed border-white/20 text-xs font-bold text-white transition-all cursor-pointer"
              >
                <svg className="w-3.5 h-3.5 text-[#d1fe17]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <line x1="12" y1="5" x2="12" y2="19" />
                  <line x1="5" y1="12" x2="19" y2="12" />
                </svg>
                <span>New Influencer</span>
              </button>
            </div>

            {/* Influencer Roster List */}
            <div className="flex-1 overflow-y-auto no-scrollbar p-2 space-y-1">
              {influencers.slice(0, 50).map((inf) => {
                const isActive = selectedInfluencer?.id === inf.id;
                return (
                  <div
                    key={inf.id}
                    onClick={() => loadInfluencerIntoStudio(inf)}
                    className={`flex items-center gap-2.5 p-2 rounded-xl cursor-pointer transition-all ${
                      isActive
                        ? 'bg-[#d1fe17]/10 border border-[#d1fe17]/40'
                        : 'hover:bg-white/[0.04] border border-transparent'
                    }`}
                  >
                    <img
                      src={inf.referenceImage}
                      alt={inf.name}
                      className="w-9 h-9 rounded-lg object-cover shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <p className={`text-xs font-medium truncate ${isActive ? 'text-white font-bold' : 'text-neutral-300'}`}>
                        {inf.name}
                      </p>
                      <p className="text-[10px] text-neutral-400 truncate">
                        {inf.category}
                      </p>
                    </div>
                    {isActive && <span className="w-2 h-2 rounded-full bg-[#d1fe17] shrink-0" />}
                  </div>
                );
              })}
            </div>
          </aside>

          {/* COLUMN 2: CENTER STUDIO STAGE */}
          <section className="flex-1 flex flex-col items-center justify-between p-4 sm:p-6 bg-gradient-to-b from-[#0a0a0d] to-[#060608] h-full overflow-y-auto">
            {/* Top Canvas Bar */}
            <div className="w-full flex items-center justify-between mb-4 shrink-0">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-[10px] font-mono text-neutral-400">
                  CANVAS · 1024×1365
                </span>
                <span className="px-2.5 py-1 rounded-full bg-[#d1fe17]/10 border border-[#d1fe17]/30 text-[10px] font-mono text-[#d1fe17]">
                  {selectedInfluencer ? `${selectedInfluencer.name.toUpperCase()} (STORED)` : 'NEW PERSONA'}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowPolicyModal(true)}
                  className="px-3 py-1.5 rounded-xl bg-[#d1fe17] text-black text-xs font-bold hover:bg-[#bce414] transition-all cursor-pointer"
                >
                  Save Influencer
                </button>
              </div>
            </div>

            {/* Canvas Stage Box */}
            <div className="relative w-full max-w-md md:max-w-lg aspect-[3/4] rounded-3xl bg-[#121217] border border-white/15 overflow-hidden shadow-2xl flex items-center justify-center group my-auto">
              {selectedInfluencer ? (
                <img
                  src={selectedInfluencer.sampleImageUrl || selectedInfluencer.referenceImage}
                  alt={selectedInfluencer.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="flex flex-col items-center justify-center p-8 text-center">
                  <div className="w-16 h-16 rounded-3xl bg-white/5 border border-white/10 flex items-center justify-center text-neutral-400 mb-4">
                    <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                      <circle cx="12" cy="7" r="4" />
                    </svg>
                  </div>
                  <h3 className="text-sm font-bold text-white">Clean Influencer Studio</h3>
                  <p className="text-xs text-neutral-400 mt-1.5 max-w-xs leading-relaxed">
                    Configure attributes on the right panel or select a stored influencer from your vault to begin generation.
                  </p>
                </div>
              )}

              {/* Floating Dock */}
              <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between p-2 rounded-2xl bg-black/80 backdrop-blur-xl border border-white/15 shadow-xl">
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => {
                      setSaveSuccessNotice('Regenerating variation...');
                      setTimeout(() => setSaveSuccessNotice(null), 2500);
                    }}
                    className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white cursor-pointer"
                    title="Regenerate Variation"
                  >
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M23 4v6h-6M1 20v-6h6" />
                      <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
                    </svg>
                  </button>
                  <button
                    onClick={() => {
                      setSaveSuccessNotice('Turnaround grid queued');
                      setTimeout(() => setSaveSuccessNotice(null), 2500);
                    }}
                    className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white cursor-pointer"
                    title="Generate Multi-Angle Turnaround Sheet"
                  >
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="3" y="3" width="18" height="18" rx="2" />
                      <line x1="9" y1="3" x2="9" y2="21" />
                      <line x1="15" y1="3" x2="15" y2="21" />
                    </svg>
                  </button>
                </div>

                <button
                  onClick={() => setShowPolicyModal(true)}
                  className="px-4 py-1.5 rounded-xl bg-[#d1fe17] text-black font-bold text-xs flex items-center gap-2 hover:bg-[#bce414] cursor-pointer"
                >
                  <span>Generate Persona</span>
                  <span className="px-1.5 py-0.5 rounded bg-black/20 text-[10px] font-mono">
                    2 Credits
                  </span>
                </button>
              </div>
            </div>

            {/* Custom Prompt Bar */}
            <div className="w-full max-w-xl mt-4 shrink-0">
              <div className="relative flex items-center">
                <input
                  type="text"
                  value={customPrompt}
                  onChange={(e) => setCustomPrompt(e.target.value)}
                  placeholder="Type to customize character prompt..."
                  className="w-full bg-[#121217] border border-white/15 rounded-2xl px-4 py-3 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-[#d1fe17] pr-28"
                />
                <button
                  onClick={() => setShowPolicyModal(true)}
                  className="absolute right-2 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
                >
                  <svg className="w-3.5 h-3.5 text-[#d1fe17]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="m12 3-1.9 5.8a2 2 0 0 1-1.3 1.3L3 12l5.8 1.9a2 2 0 0 1 1.3 1.3L12 21l1.9-5.8a2 2 0 0 1 1.3-1.3L21 12l-5.8-1.9a2 2 0 0 1-1.3-1.3Z" />
                  </svg>
                  <span>Edit Prompt</span>
                </button>
              </div>
            </div>
          </section>

          {/* COLUMN 3: RIGHT ATTRIBUTE BUILDER */}
          <aside className="w-full md:w-80 border-t md:border-t-0 md:border-l border-white/10 bg-[#0c0c10] flex flex-col shrink-0 h-full overflow-y-auto no-scrollbar p-4 space-y-4">
            <div>
              <h2 className="text-xs font-bold text-white uppercase tracking-wider">
                Attribute Builder
              </h2>
              <p className="text-[10px] text-neutral-400 mt-0.5">
                Control identity characteristics
              </p>
            </div>

            {/* Persona Name */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-semibold text-neutral-300">
                Influencer Name
              </label>
              <input
                type="text"
                value={influencerName}
                onChange={(e) => setInfluencerName(e.target.value)}
                placeholder="e.g. Maya V."
                className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-[#d1fe17]"
              />
            </div>

            {/* Character Type */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-semibold text-neutral-300">
                Character Type
              </label>
              <div className="grid grid-cols-3 gap-1.5">
                {['Human', 'Cyberpunk', 'Anime'].map((t) => (
                  <button
                    key={t}
                    onClick={() => setCharacterType(t)}
                    className={`py-1.5 rounded-xl text-xs font-medium cursor-pointer transition-all ${
                      characterType === t
                        ? 'bg-[#d1fe17] text-black font-bold'
                        : 'bg-white/5 text-neutral-400 hover:text-white'
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            {/* Gender */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-semibold text-neutral-300">
                Gender
              </label>
              <div className="grid grid-cols-2 gap-1.5">
                {['Female', 'Male'].map((g) => (
                  <button
                    key={g}
                    onClick={() => setGender(g)}
                    className={`py-1.5 rounded-xl text-xs font-medium cursor-pointer transition-all ${
                      gender === g
                        ? 'bg-[#d1fe17] text-black font-bold'
                        : 'bg-white/5 text-neutral-400 hover:text-white'
                    }`}
                  >
                    {g}
                  </button>
                ))}
              </div>
            </div>

            {/* Ethnicity / Origin */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-semibold text-neutral-300">
                Ethnicity / Origin Base
              </label>
              <div className="grid grid-cols-2 gap-1.5 text-xs">
                {[
                  'Caucasian',
                  'Middle Eastern',
                  'Latina',
                  'South Asian',
                  'East Asian',
                  'Afro-Caribbean',
                ].map((eth) => (
                  <button
                    key={eth}
                    onClick={() => setEthnicity(eth)}
                    className={`py-1.5 rounded-xl text-xs font-medium cursor-pointer transition-all ${
                      ethnicity === eth
                        ? 'bg-[#d1fe17] text-black font-bold'
                        : 'bg-white/5 text-neutral-400 hover:text-white'
                    }`}
                  >
                    {eth}
                  </button>
                ))}
              </div>
            </div>

            {/* Age Slider */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-[11px]">
                <span className="font-semibold text-neutral-300">Age Bracket</span>
                <span className="font-mono text-[#d1fe17]">{age} Years Old</span>
              </div>
              <input
                type="range"
                min="18"
                max="50"
                value={age}
                onChange={(e) => setAge(Number(e.target.value))}
                className="w-full accent-[#d1fe17] cursor-pointer"
              />
            </div>

            {/* Hair Style & Color */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-semibold text-neutral-300">
                Hair Style & Color
              </label>
              <div className="grid grid-cols-2 gap-1.5 text-xs">
                {['Long Brunette', 'Blonde Bob', 'Dark Waves', 'Auburn Curls'].map((h) => (
                  <button
                    key={h}
                    onClick={() => setHair(h)}
                    className={`py-1.5 rounded-xl text-xs font-medium cursor-pointer transition-all ${
                      hair === h
                        ? 'bg-[#d1fe17] text-black font-bold'
                        : 'bg-white/5 text-neutral-400 hover:text-white'
                    }`}
                  >
                    {h}
                  </button>
                ))}
              </div>
            </div>

            {/* Signature Aesthetic */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-semibold text-neutral-300">
                Signature Aesthetic
              </label>
              <div className="grid grid-cols-2 gap-1.5 text-xs">
                {['Luxury & Silk', 'Gym & Active', '35mm Flash', 'Dubai Poolside'].map((aes) => (
                  <button
                    key={aes}
                    onClick={() => setAesthetic(aes)}
                    className={`py-1.5 rounded-xl text-xs font-medium cursor-pointer transition-all ${
                      aesthetic === aes
                        ? 'bg-[#d1fe17] text-black font-bold'
                        : 'bg-white/5 text-neutral-400 hover:text-white'
                    }`}
                  >
                    {aes}
                  </button>
                ))}
              </div>
            </div>

            {/* Save Button */}
            <div className="pt-2">
              <button
                onClick={() => setShowPolicyModal(true)}
                className="w-full py-2.5 rounded-xl bg-[#d1fe17] text-black font-bold text-xs shadow-lg hover:scale-[1.02] active:scale-95 transition-transform cursor-pointer"
              >
                Save Persona to Vault
              </button>
            </div>
          </aside>
        </div>
      )}

      {/* ===================================================================== */}
      {/* RESPONSIBLE USE POLICY MODAL                                          */}
      {/* ===================================================================== */}
      {showPolicyModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-md rounded-3xl bg-[#121217] border border-white/15 p-6 shadow-2xl space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-[#d1fe17]/10 border border-[#d1fe17]/20 flex items-center justify-center text-[#d1fe17]">
              <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              </svg>
            </div>

            <div>
              <h3 className="text-base font-bold text-white">Responsible AI Influencer Policy</h3>
              <p className="text-xs text-neutral-400 mt-1 leading-relaxed">
                By creating or using an AI influencer, you agree to transparent generation guidelines and verify that characters created do not impersonate real living individuals without consent.
              </p>
            </div>

            <div className="p-3 rounded-xl bg-white/[0.03] border border-white/10 flex items-center justify-between text-xs">
              <span className="text-neutral-300 font-medium">Automatic Watermark / Disclosure</span>
              <span className="text-[#d1fe17] font-bold">Enabled</span>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <button
                onClick={() => setShowPolicyModal(false)}
                className="flex-1 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-semibold cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveInfluencer}
                className="flex-1 py-2.5 rounded-xl bg-[#d1fe17] hover:bg-[#bce414] text-black text-xs font-bold shadow-lg cursor-pointer"
              >
                Agree & Store Influencer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
