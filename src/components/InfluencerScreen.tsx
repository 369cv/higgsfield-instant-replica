import React, { useState, useEffect, useMemo } from 'react';
import { VaultItem, StudioHeadshot } from '../types';
import { InfluencerStore, GABRIELA_SANCHEZ } from '../services/influencerStore';

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
  // Active sub-tab: 'headshots' | 'photoshoots'
  const [activeTab, setActiveTab] = useState<'headshots' | 'photoshoots'>('headshots');

  // Active headshot image URL
  const [activeHeadshot, setActiveHeadshot] = useState<string>(() =>
    InfluencerStore.getActiveHeadshot()
  );

  // Studio headshots list
  const [studioHeadshots, setStudioHeadshots] = useState<StudioHeadshot[]>(() =>
    InfluencerStore.getStudioHeadshots()
  );

  // Photoshoot niche filter
  const [selectedNiche, setSelectedNiche] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');

  // Generator Modal state
  const [isGeneratorOpen, setIsGeneratorOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationStep, setGenerationStep] = useState<string>('');

  // Generator parameters
  const [genLighting, setGenLighting] = useState('Softbox Diffused');
  const [genAngle, setGenAngle] = useState('Frontal Eye-Level');
  const [genExpression, setGenExpression] = useState('Editorial Neutral');
  const [genBackdrop, setGenBackdrop] = useState('18% Neutral Gray');
  const [genPrompt, setGenPrompt] = useState(
    'Close-up studio headshot portrait of Gabriela Sanchez (@gabrielasanchezs) on neutral studio gray background, softbox lighting, 85mm f/1.4 lens, natural skin texture, editorial elegance, 8k resolution'
  );

  // Toast feedback
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Sync active headshot selection
  const handleSelectHeadshot = (headshot: StudioHeadshot) => {
    setActiveHeadshot(headshot.imageUrl);
    InfluencerStore.setActiveHeadshot(headshot.imageUrl);
    showToast(`Active headshot set to "${headshot.title}"`);
  };

  // Generator action
  const handleGenerateNewHeadshot = () => {
    setIsGenerating(true);
    setGenerationStep('Sampling facial identity of @gabrielasanchezs...');

    setTimeout(() => {
      setGenerationStep('Synthesizing neutral gray studio backdrop...');
    }, 900);

    setTimeout(() => {
      setGenerationStep(`Rendering ${genLighting} lighting pass...`);
    }, 1800);

    setTimeout(() => {
      setGenerationStep('Finalizing 1024×1024 master portrait...');
    }, 2600);

    setTimeout(() => {
      // Pick one of the studio variations or high-res portraits
      const newId = `hs-${Date.now()}`;
      const newHeadshot: StudioHeadshot = {
        id: newId,
        title: `${genLighting} • ${genAngle}`,
        imageUrl: activeHeadshot, // keeps the consistent real headshot of Gabriela Sanchez
        lighting: genLighting,
        angle: genAngle,
        background: genBackdrop,
        createdAt: 'Just now',
      };

      InfluencerStore.addStudioHeadshot(newHeadshot);
      setStudioHeadshots(InfluencerStore.getStudioHeadshots());
      setActiveHeadshot(newHeadshot.imageUrl);
      setIsGenerating(false);
      setIsGeneratorOpen(false);
      showToast('New studio headshot generated and set as active!');
    }, 3400);
  };

  // Niche categories matching Prompt Vault
  const niches = [
    { id: 'All', label: 'All' },
    { id: 'Luxury & Lifestyle', label: 'Luxury & Lifestyle' },
    { id: 'Fashion & Editorial', label: 'Fashion & Editorial' },
    { id: 'Fitness & Wellness', label: 'Fitness & Wellness' },
    { id: 'Nightlife & Flash', label: 'Nightlife & Flash' },
    { id: 'Travel & Resort', label: 'Travel & Resort' },
    { id: 'Streetwear & Urban', label: 'Streetwear & Urban' },
    { id: 'Modest & Silk', label: 'Modest & Silk' },
    { id: 'Beauty & Glamour', label: 'Beauty & Glamour' },
  ];

  // Filtered drops from vaultItems (all 1,604 are Gabriela Sanchez)
  const filteredPhotoshoots = useMemo(() => {
    return vaultItems.filter((item) => {
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesPrompt = (item.prompt || '').toLowerCase().includes(q);
        const matchesCat = (item.category || '').toLowerCase().includes(q);
        if (!matchesPrompt && !matchesCat) return false;
      }

      if (selectedNiche === 'All') return true;

      const nicheLower = selectedNiche.toLowerCase();
      const catLower = (item.category || '').toLowerCase();
      const promptLower = (item.prompt || '').toLowerCase();

      if (nicheLower.includes('luxury') || nicheLower.includes('lifestyle')) {
        return catLower.includes('luxury') || catLower.includes('editorial') || promptLower.includes('burj');
      }
      if (nicheLower.includes('fashion') || nicheLower.includes('editorial')) {
        return catLower.includes('editorial') || promptLower.includes('silk') || promptLower.includes('couture');
      }
      if (nicheLower.includes('fitness') || nicheLower.includes('wellness')) {
        return catLower.includes('gym') || catLower.includes('fitness') || promptLower.includes('workout');
      }
      if (nicheLower.includes('nightlife') || nicheLower.includes('flash')) {
        return catLower.includes('nightlife') || promptLower.includes('flash') || promptLower.includes('night');
      }
      if (nicheLower.includes('travel') || nicheLower.includes('resort')) {
        return catLower.includes('resort') || promptLower.includes('yacht') || promptLower.includes('beach');
      }
      if (nicheLower.includes('streetwear') || nicheLower.includes('urban')) {
        return catLower.includes('streetstyle') || promptLower.includes('streetwear') || promptLower.includes('tokyo');
      }
      if (nicheLower.includes('modest') || nicheLower.includes('silk')) {
        return catLower.includes('modest') || promptLower.includes('abaya') || promptLower.includes('dunes');
      }
      if (nicheLower.includes('beauty') || nicheLower.includes('glamour')) {
        return catLower.includes('studio') || promptLower.includes('portrait') || promptLower.includes('close-up');
      }

      return true;
    });
  }, [vaultItems, selectedNiche, searchQuery]);

  return (
    <div className="w-full flex-1 flex flex-col bg-[#09090c] text-white select-none">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-50 flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#d1fe17] text-black font-bold text-xs shadow-2xl animate-fade-in">
          <svg className="w-4 h-4 text-black" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <polyline points="20 6 9 17 4 12" />
          </svg>
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Main Container */}
      <div className="flex-1 flex flex-col max-w-7xl mx-auto w-full px-4 sm:px-6 py-6 space-y-6">
        
        {/* =================================================================== */}
        {/* 1. INFLUENCER PROFILE HERO (Gabriela Sanchez @gabrielasanchezs)     */}
        {/* =================================================================== */}
        <div className="p-5 sm:p-6 rounded-3xl bg-[#121217] border border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-6 shadow-xl">
          {/* Left: Avatar + Details */}
          <div className="flex items-center gap-4 sm:gap-5">
            {/* Studio Gray Avatar with Verified Badge */}
            <div className="relative shrink-0">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl overflow-hidden bg-[#1e1e24] border-2 border-[#d1fe17]/80 shadow-[0_0_20px_rgba(209,254,23,0.2)]">
                <img
                  src={activeHeadshot}
                  alt={GABRIELA_SANCHEZ.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div
                className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-[#d1fe17] text-black flex items-center justify-center border-2 border-[#121217] shadow"
                title="Verified Influencer Identity"
              >
                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </div>
            </div>

            {/* Profile Info */}
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                  {GABRIELA_SANCHEZ.name}
                </h1>
                <span className="px-2 py-0.5 rounded-full bg-white/10 text-[10px] font-mono text-neutral-300">
                  SOUL ID LOCKED
                </span>
              </div>

              {/* Instagram Handle Link */}
              <a
                href="https://www.instagram.com/gabrielasanchezs/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-neutral-300 hover:text-[#d1fe17] transition-colors cursor-pointer group"
              >
                <svg className="w-3.5 h-3.5 fill-current text-pink-500 group-hover:text-[#d1fe17] transition-colors" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                </svg>
                <span>{GABRIELA_SANCHEZ.instagramHandle}</span>
                <svg className="w-3 h-3 text-neutral-500 group-hover:text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                  <polyline points="15 3 21 3 21 9" />
                  <line x1="10" y1="14" x2="21" y2="3" />
                </svg>
              </a>

              <p className="text-[11px] text-neutral-400">
                Fashion Model & Content Creator • <span className="text-white font-semibold">1,604 Photoshoot Drops</span> in Vault
              </p>
            </div>
          </div>

          {/* Right: Primary Action Button */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => setIsGeneratorOpen(true)}
              className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-[#d1fe17] text-black font-extrabold text-xs shadow-[0_0_20px_rgba(209,254,23,0.3)] hover:scale-[1.02] active:scale-95 transition-all cursor-pointer"
            >
              <svg className="w-4 h-4 text-black" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="m12 3-1.9 5.8a2 2 0 0 1-1.3 1.3L3 12l5.8 1.9a2 2 0 0 1 1.3 1.3L12 21l1.9-5.8a2 2 0 0 1 1.3-1.3L21 12l-5.8-1.9a2 2 0 0 1-1.3-1.3Z" />
              </svg>
              <span>Generate Studio Headshot</span>
            </button>
          </div>
        </div>

        {/* =================================================================== */}
        {/* 2. SUB-NAVIGATION: HEADSHOTS vs PHOTOSHOOTS                         */}
        {/* =================================================================== */}
        <div className="flex items-center justify-between border-b border-white/10 pb-3">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('headshots')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'headshots'
                  ? 'bg-white text-black shadow-md'
                  : 'bg-white/[0.04] text-neutral-400 hover:text-white hover:bg-white/[0.08]'
              }`}
            >
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="7" r="4" />
                <path d="M6 21v-2a6 6 0 0 1 12 0v2" />
              </svg>
              <span>Studio Headshots</span>
              <span className={`px-1.5 py-0.2 rounded-full text-[9px] font-mono ${activeTab === 'headshots' ? 'bg-black/10 text-black' : 'bg-white/10 text-neutral-400'}`}>
                {studioHeadshots.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('photoshoots')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'photoshoots'
                  ? 'bg-white text-black shadow-md'
                  : 'bg-white/[0.04] text-neutral-400 hover:text-white hover:bg-white/[0.08]'
              }`}
            >
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="3" width="18" height="18" rx="2" />
                <circle cx="8.5" cy="8.5" r="1.5" />
                <polyline points="21 15 16 10 5 21" />
              </svg>
              <span>Photoshoot Collections</span>
              <span className={`px-1.5 py-0.2 rounded-full text-[9px] font-mono ${activeTab === 'photoshoots' ? 'bg-black/10 text-black' : 'bg-white/10 text-neutral-400'}`}>
                1,604
              </span>
            </button>
          </div>

          <span className="text-[11px] text-neutral-400 hidden sm:inline">
            {activeTab === 'headshots'
              ? 'Click any gray studio portrait to set as active headshot'
              : 'Browse Gabriela Sanchez drops categorized by photoshoot niche'}
          </span>
        </div>

        {/* =================================================================== */}
        {/* VIEW A: STUDIO HEADSHOTS (All Gray Background Portraits)            */}
        {/* =================================================================== */}
        {activeTab === 'headshots' && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4">
              {/* Studio Headshot Cards */}
              {studioHeadshots.map((hs) => {
                const isActive = activeHeadshot === hs.imageUrl;
                return (
                  <div
                    key={hs.id}
                    onClick={() => handleSelectHeadshot(hs)}
                    className={`group relative aspect-[3/4] rounded-2xl overflow-hidden bg-[#121217] transition-all cursor-pointer select-none shadow-lg ${
                      isActive
                        ? 'border-2 border-[#d1fe17] shadow-[0_0_20px_rgba(209,254,23,0.3)]'
                        : 'border border-white/10 hover:border-white/30'
                    }`}
                  >
                    <img
                      src={hs.imageUrl}
                      alt={hs.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.02]"
                      loading="lazy"
                    />

                    {/* Gradient Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/15 to-transparent pointer-events-none" />

                    {/* Active Pill at Top Right */}
                    {isActive && (
                      <div className="absolute top-2.5 right-2.5 px-2 py-0.5 rounded-full bg-[#d1fe17] text-black text-[9px] font-black tracking-wider uppercase shadow">
                        Active
                      </div>
                    )}

                    {/* Minimal Title at Bottom */}
                    <div className="absolute bottom-3 left-3 right-3 pointer-events-none space-y-0.5">
                      <h3 className="text-xs font-bold text-white tracking-wide truncate">
                        {hs.title}
                      </h3>
                      <p className="text-[10px] text-neutral-400 font-mono truncate">
                        {hs.lighting} • {hs.background}
                      </p>
                    </div>
                  </div>
                );
              })}

              {/* Generate New Headshot Card (Dashed) */}
              <button
                onClick={() => setIsGeneratorOpen(true)}
                className="group relative aspect-[3/4] rounded-2xl border-2 border-dashed border-white/15 bg-white/[0.02] hover:bg-white/[0.05] hover:border-[#d1fe17]/60 flex flex-col items-center justify-center p-4 text-center transition-all cursor-pointer"
              >
                <div className="w-10 h-10 rounded-2xl bg-white/5 group-hover:bg-[#d1fe17]/20 text-neutral-400 group-hover:text-[#d1fe17] flex items-center justify-center mb-3 transition-colors">
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <line x1="12" y1="5" x2="12" y2="19" />
                    <line x1="5" y1="12" x2="19" y2="12" />
                  </svg>
                </div>
                <span className="text-xs font-bold text-white group-hover:text-[#d1fe17] transition-colors">
                  Generate Headshot
                </span>
                <span className="text-[10px] text-neutral-400 mt-1 max-w-[120px]">
                  New portrait on gray studio backdrop
                </span>
              </button>
            </div>
          </div>
        )}

        {/* =================================================================== */}
        {/* VIEW B: PHOTOSHOOT COLLECTIONS (By Niche)                           */}
        {/* =================================================================== */}
        {activeTab === 'photoshoots' && (
          <div className="space-y-4">
            {/* Niche Toolbar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              {/* Niche Pills */}
              <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1">
                {niches.map((niche) => {
                  const isActive = selectedNiche === niche.label || (niche.id === 'All' && selectedNiche === 'All');
                  return (
                    <button
                      key={niche.id}
                      onClick={() => setSelectedNiche(niche.label)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all cursor-pointer ${
                        isActive
                          ? 'bg-[#d1fe17] text-black font-bold shadow-[0_0_15px_rgba(209,254,23,0.25)]'
                          : 'bg-white/[0.04] text-neutral-400 hover:text-white hover:bg-white/[0.08] border border-white/5'
                      }`}
                    >
                      {niche.label}
                    </button>
                  );
                })}
              </div>

              {/* Search input */}
              <div className="relative w-full sm:w-64">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Filter drops..."
                  className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-3 pl-8 py-1.5 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-[#d1fe17]"
                />
                <svg className="w-3.5 h-3.5 text-neutral-500 absolute left-2.5 top-2.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="11" cy="11" r="8" />
                  <line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
              </div>
            </div>

            {/* Grid of Gabriela Sanchez Photoshoot Drops */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4 pt-1">
              {filteredPhotoshoots.slice(0, 50).map((drop) => (
                <div
                  key={drop.id}
                  onClick={() => {
                    if (onSelectInfluencerDrops) {
                      onSelectInfluencerDrops([drop.id], 'Gabriela Sanchez');
                    } else if (onOpenPromptVault) {
                      onOpenPromptVault();
                    }
                  }}
                  className="group relative aspect-[3/4] rounded-2xl overflow-hidden bg-[#121217] border border-white/10 hover:border-[#d1fe17]/60 transition-all cursor-pointer shadow-lg select-none"
                >
                  <img
                    src={drop.imageUrl || drop.fullImageUrl}
                    alt={drop.prompt}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.02]"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent pointer-events-none" />

                  {/* Minimalist Title at Bottom */}
                  <div className="absolute bottom-3 left-3 right-3 pointer-events-none">
                    <h3 className="text-xs font-bold text-white tracking-wide truncate">
                      {drop.category || 'Photoshoot Drop'}
                    </h3>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* =================================================================== */}
      {/* 3. GENERATE STUDIO HEADSHOT MODAL                                   */}
      {/* =================================================================== */}
      {isGeneratorOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-2xl rounded-3xl bg-[#121217] border border-white/15 p-6 shadow-2xl flex flex-col space-y-5 max-h-[90vh] overflow-y-auto no-scrollbar">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-[#d1fe17]/10 border border-[#d1fe17]/30 flex items-center justify-center text-[#d1fe17]">
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="m12 3-1.9 5.8a2 2 0 0 1-1.3 1.3L3 12l5.8 1.9a2 2 0 0 1 1.3 1.3L12 21l1.9-5.8a2 2 0 0 1 1.3-1.3L21 12l-5.8-1.9a2 2 0 0 1-1.3-1.3Z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-sm font-extrabold text-white">Generate Studio Headshot</h3>
                  <p className="text-[10px] text-neutral-400">
                    Create a new gray-background studio headshot for @gabrielasanchezs
                  </p>
                </div>
              </div>

              <button
                onClick={() => !isGenerating && setIsGeneratorOpen(false)}
                disabled={isGenerating}
                className="p-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-neutral-400 hover:text-white transition-colors cursor-pointer"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            {/* Modal Body */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
              {/* Left: Reference Headshot */}
              <div className="flex flex-col items-center justify-center p-3 rounded-2xl bg-black/40 border border-white/10 space-y-2">
                <div className="w-full aspect-[3/4] rounded-xl overflow-hidden bg-[#1e1e24] relative">
                  <img
                    src={activeHeadshot}
                    alt="Gabriela Sanchez"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-2 left-2 px-2 py-0.5 rounded-full bg-black/70 backdrop-blur-md text-[9px] font-mono text-[#d1fe17]">
                    FACE SEED
                  </div>
                </div>
                <div className="text-center">
                  <p className="text-xs font-bold text-white">Gabriela Sanchez</p>
                  <p className="text-[10px] text-neutral-400 font-mono">1024×1024 Neutral Gray</p>
                </div>
              </div>

              {/* Right: Studio Controls */}
              <div className="sm:col-span-2 space-y-3.5">
                {/* Studio Backdrop Tone */}
                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-neutral-300">
                    Backdrop Tone (Gray Background)
                  </label>
                  <div className="grid grid-cols-2 gap-1.5 text-xs">
                    {['18% Neutral Gray', 'Deep Charcoal Gray', 'Cool Slate Gray', 'Soft Light Gray'].map((tone) => (
                      <button
                        key={tone}
                        type="button"
                        onClick={() => setGenBackdrop(tone)}
                        className={`py-1.5 px-2 rounded-xl text-left truncate text-xs font-medium cursor-pointer transition-all ${
                          genBackdrop === tone
                            ? 'bg-[#d1fe17] text-black font-bold'
                            : 'bg-white/5 text-neutral-400 hover:text-white'
                        }`}
                      >
                        {tone}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Studio Lighting */}
                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-neutral-300">
                    Lighting Style
                  </label>
                  <div className="grid grid-cols-2 gap-1.5 text-xs">
                    {['Softbox Diffused', 'Rembrandt Contrast', 'High-Key Luminous', 'Warm Rim Light'].map((lt) => (
                      <button
                        key={lt}
                        type="button"
                        onClick={() => setGenLighting(lt)}
                        className={`py-1.5 px-2 rounded-xl text-left truncate text-xs font-medium cursor-pointer transition-all ${
                          genLighting === lt
                            ? 'bg-[#d1fe17] text-black font-bold'
                            : 'bg-white/5 text-neutral-400 hover:text-white'
                        }`}
                      >
                        {lt}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Camera Framing / Angle */}
                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-neutral-300">
                    Camera Angle
                  </label>
                  <div className="grid grid-cols-2 gap-1.5 text-xs">
                    {['Frontal Eye-Level', '3/4 Editorial Angle', 'Slight Head Tilt', 'Tight Beauty Macro'].map((ang) => (
                      <button
                        key={ang}
                        type="button"
                        onClick={() => setGenAngle(ang)}
                        className={`py-1.5 px-2 rounded-xl text-left truncate text-xs font-medium cursor-pointer transition-all ${
                          genAngle === ang
                            ? 'bg-[#d1fe17] text-black font-bold'
                            : 'bg-white/5 text-neutral-400 hover:text-white'
                        }`}
                      >
                        {ang}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Facial Expression */}
                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-neutral-300">
                    Facial Expression
                  </label>
                  <div className="grid grid-cols-2 gap-1.5 text-xs">
                    {['Editorial Neutral', 'Subtle Smile', 'Confident Smirk', 'Glamour Gaze'].map((expr) => (
                      <button
                        key={expr}
                        type="button"
                        onClick={() => setGenExpression(expr)}
                        className={`py-1.5 px-2 rounded-xl text-left truncate text-xs font-medium cursor-pointer transition-all ${
                          genExpression === expr
                            ? 'bg-[#d1fe17] text-black font-bold'
                            : 'bg-white/5 text-neutral-400 hover:text-white'
                        }`}
                      >
                        {expr}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Prompt */}
                <div className="space-y-1 pt-1">
                  <label className="text-[11px] font-semibold text-neutral-300">
                    Prompt Specification
                  </label>
                  <textarea
                    rows={2}
                    value={genPrompt}
                    onChange={(e) => setGenPrompt(e.target.value)}
                    className="w-full bg-white/[0.04] border border-white/10 rounded-xl p-2.5 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-[#d1fe17] resize-none"
                  />
                </div>
              </div>
            </div>

            {/* Footer / Generation Progress */}
            <div className="pt-2 border-t border-white/10 flex flex-col gap-3">
              {isGenerating && (
                <div className="p-3 rounded-xl bg-[#d1fe17]/10 border border-[#d1fe17]/30 flex items-center gap-3">
                  <svg className="w-4 h-4 text-[#d1fe17] animate-spin shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <circle cx="12" cy="12" r="10" strokeDasharray="32" strokeDashoffset="10" />
                  </svg>
                  <span className="text-xs font-bold text-[#d1fe17] truncate">{generationStep}</span>
                </div>
              )}

              <div className="flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsGeneratorOpen(false)}
                  disabled={isGenerating}
                  className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-semibold cursor-pointer disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleGenerateNewHeadshot}
                  disabled={isGenerating}
                  className="flex items-center gap-2 px-5 py-2 rounded-xl bg-[#d1fe17] text-black text-xs font-bold shadow-lg hover:bg-[#bce414] active:scale-95 transition-all cursor-pointer disabled:opacity-50"
                >
                  <span>{isGenerating ? 'Rendering Headshot...' : 'Generate Headshot'}</span>
                  <span className="px-1.5 py-0.5 rounded bg-black/20 text-[10px] font-mono">1 Credit</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
