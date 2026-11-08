import React, { useState, useEffect, useMemo } from 'react';
import { VaultItem, StoredInfluencer, StudioHeadshot } from '../types';
import { InfluencerStore, BAHA_SAVAGE } from '../services/influencerStore';

interface InfluencerScreenProps {
  vaultItems?: VaultItem[];
  onSelectInfluencerDrops?: (dropIds: string[], influencerName: string) => void;
  onOpenPromptVault?: () => void;
}

interface CharacterTypeOption {
  id: string;
  name: string;
  image: string;
}

export type AudienceMode = 'business' | 'creator' | 'actor';

interface ArchetypeOption {
  id: string;
  name: string;
  subtitle: string;
  image: string;
  defaultPrompt: string;
}

const AUDIENCE_ARCHETYPES: Record<AudienceMode, ArchetypeOption[]> = {
  business: [
    {
      id: 'biz-founder',
      name: 'Executive Founder',
      subtitle: 'Executive Lounge & Strategy',
      image: '/images/archetypes/business-founder.png',
      defaultPrompt: 'High-end executive founder in sleek belted ensemble with gold-accented handbag, warm ambient wood-paneled executive lounge, crisp editorial lighting',
    },
    {
      id: 'biz-penthouse',
      name: 'Metropolitan Executive',
      subtitle: 'Penthouse & Silk',
      image: '/images/archetypes/business-penthouse.png',
      defaultPrompt: 'Executive woman in tailored black blazer, cream-white silk trousers, structured leather handbag in luxury urban hotel penthouse suite',
    },
    {
      id: 'biz-power',
      name: 'Architectural Power Suiting',
      subtitle: 'Modernist Columns',
      image: '/images/archetypes/business-power.png',
      defaultPrompt: 'High-power business executive in architectural leather shoulder blazer and pinstriped trousers in front of monumental modernist stone columns',
    },
    {
      id: 'biz-advisory',
      name: 'Strategic Advisory',
      subtitle: 'Jacquemus & Architecture',
      image: '/images/archetypes/business-advisory.png',
      defaultPrompt: 'Strategic modern advisory portrait in dark green tailored blazer with Jacquemus handbag, seated in modern architectural armchair with backlit minimalist shelves',
    },
  ],
  creator: [
    {
      id: 'cr-matcha',
      name: 'Matcha & Cafe Lifestyle',
      subtitle: 'Aesthetic Wellness',
      image: '/images/archetypes/creator-matcha.png',
      defaultPrompt: 'Aesthetic cafe lifestyle creator in pale yellow fitted crop top and narrow sunglasses, holding iced green matcha smoothie with white flowers backdrop',
    },
    {
      id: 'cr-nightlife',
      name: 'Dubai Nightlife & Flash',
      subtitle: '35mm Direct Flash',
      image: '/images/archetypes/creator-nightlife.png',
      defaultPrompt: 'Direct flash nightlife candid of young woman in pastel pink feather halter dress, poolside terrace, illuminated Burj Al Arab night skyline',
    },
    {
      id: 'cr-fitness',
      name: 'Gym & Athletic Wellness',
      subtitle: 'Workout Glow & Selfies',
      image: '/images/archetypes/creator-fitness.png',
      defaultPrompt: 'Athletic wellness mirror selfie in matching light gray gym set, warm olive complexion, natural post-workout glow',
    },
    {
      id: 'cr-supercar',
      name: 'Supercar & Glamour Night',
      subtitle: 'McLaren Nightlife',
      image: '/images/archetypes/creator-supercar.png',
      defaultPrompt: 'Glamorous nightlife creator standing beside an orange McLaren supercar with dihedral doors open, 35mm film flash',
    },
  ],
  actor: [
    {
      id: 'act-cinematic',
      name: 'Period & Cinematic Lead',
      subtitle: 'Ferrari Interior Night Still',
      image: '/images/archetypes/actor-cinematic.png',
      defaultPrompt: 'Pensive cinematic character portrait in luxury Ferrari interior at nighttime, moody warm sodium and cool ambient lighting, voluminous cascading hair',
    },
    {
      id: 'act-theatrical',
      name: 'Theatrical Gala & Premiere',
      subtitle: 'Editorial Knot Gown',
      image: '/images/archetypes/actor-theatrical.png',
      defaultPrompt: 'Editorial dramatic portrait in off-the-shoulder white gown with high knot updo, theatrical key light from below against geometric textured wall',
    },
    {
      id: 'act-casting',
      name: 'Dramatic Casting Slate',
      subtitle: 'Direct Gaze Close-Up',
      image: '/images/archetypes/actor-casting.png',
      defaultPrompt: 'Dramatic casting close-up portrait, intense direct camera gaze, contoured bone structure, bold red lip, soft clean studio key light',
    },
    {
      id: 'act-noir',
      name: 'Cinematic Noir & City Arrival',
      subtitle: 'Luxury Car & Volumetric Coat',
      image: '/images/archetypes/actor-noir.png',
      defaultPrompt: 'Cinematic night shot stepping out of luxury black car, looking back over shoulder in volumetric black coat, direct flash 35mm noir',
    },
  ],
};

const AUDIENCE_WARDROBES: Record<AudienceMode, string[]> = {
  business: ['Tailored Taupe Blazer', 'Executive Silk Blouse', 'Double-Breasted Pant Suit', 'Minimalist Charcoal Shift'],
  creator: ['Feather Halter Mini Dress', 'Flowing Silk Satin Abaya', 'Draped Silk Trench Coat', 'Seamless Gym Two-Piece', 'Poolside Halter Bikini'],
  actor: ['18% Gray Studio Crewneck', 'Vintage Black Leather Jacket', 'Period High-Collar Gown', 'Minimalist Black Camisole'],
};

const AUDIENCE_LIGHTING: Record<AudienceMode, string[]> = {
  business: ['Hasselblad 85mm Prime', 'Commercial Studio Softbox', 'Executive Key Light', 'Daylight Clean Boardroom'],
  creator: ['35mm Direct Night Flash', 'Kodak Portra 400 Film Grain', 'iPhone Raw Mirror Selfie', 'Golden Hour Sun-Drenched 50mm'],
  actor: ['Cooke Anamorphic 50mm', '18% Studio Gray Cyc Key Light', 'Cinematic Chiaroscuro Rim', 'Rembrandt Portrait Shadow'],
};

const AUDIENCE_ENVIRONMENTS: Record<AudienceMode, string[]> = {
  business: ['Skyline Penthouse Glass Balcony', 'High-Key Architecture Boardroom', 'Minimalist White Executive Studio'],
  creator: ['Burj Al Arab & Cabana Poolside', 'Milan Cobblestone Street Night', 'Terracotta Infinity Sun Terrace', 'Luxury Sunset Yacht Deck'],
  actor: ['Industry Casting Soundstage', 'Neutral 18% Gray Cyc Wall', 'Cinematic Theatrical Black Box'],
};

interface AccessoryOption {
  id: string;
  name: string;
  image: string;
}

interface RenderingStyleOption {
  id: string;
  name: string;
  image: string;
}

const ACCESSORIES: AccessoryOption[] = [
  { id: 'tattoos', name: 'Tattoos', image: '/images/builder/accessories/tattoos.png' },
  { id: 'piercing', name: 'Piercing', image: '/images/builder/accessories/piercing.png' },
  { id: 'scarification', name: 'Scarification', image: '/images/builder/accessories/scarification.png' },
  { id: 'symbols', name: 'Symbols / markings', image: '/images/builder/accessories/symbols.png' },
  { id: 'cyber', name: 'Cyber markings', image: '/images/builder/accessories/cyber.png' },
];

const RENDERING_STYLES: RenderingStyleOption[] = [
  { id: 'hyper-realistic', name: 'Hyper-realistic', image: '/images/builder/styles/hyper-realistic.png' },
  { id: 'anime', name: 'Anime', image: '/images/builder/styles/anime.png' },
  { id: 'cartoon', name: 'Cartoon', image: '/images/builder/styles/cartoon.png' },
  { id: '2d-illustration', name: '2D illustration', image: '/images/builder/styles/2d-illustration.png' },
];

const CHARACTER_TYPES: CharacterTypeOption[] = [
  { id: 'human', name: 'Human', image: '/images/character-types/human.png' },
  { id: 'ant', name: 'Ant', image: '/images/character-types/ant.png' },
  { id: 'bee', name: 'Bee', image: '/images/character-types/bee.png' },
  { id: 'octopus', name: 'Octopus', image: '/images/character-types/octopus.png' },
  { id: 'crocodile', name: 'Crocodile', image: '/images/character-types/crocodile.png' },
  { id: 'iguana', name: 'Iguana', image: '/images/character-types/iguana.png' },
  { id: 'lizard', name: 'Lizard', image: '/images/character-types/lizard.png' },
  { id: 'alien', name: 'Alien', image: '/images/character-types/alien.png' },
  { id: 'beetle', name: 'Beetle', image: '/images/character-types/beetle.png' },
  { id: 'reptile', name: 'Reptile', image: '/images/character-types/reptile.png' },
  { id: 'amphibian', name: 'Amphibian', image: '/images/character-types/amphibian.png' },
  { id: 'elf', name: 'Elf', image: '/images/character-types/elf.png' },
  { id: 'mantis', name: 'Mantis', image: '/images/character-types/mantis.png' },
];

export const InfluencerScreen: React.FC<InfluencerScreenProps> = ({
  vaultItems = [],
  onSelectInfluencerDrops,
  onOpenPromptVault,
}) => {
  // Roster of managed influencers (primary: Baha Savage)
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
  const [studioHeadshots] = useState<StudioHeadshot[]>(() =>
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
      BAHA_SAVAGE
    );
  }, [influencers, activeInfluencerId, isCreatingNew]);

  // View mode: 'studio' (3-column layout) | 'photoshoots' (full 1,604 drops grid)
  const [viewMode, setViewMode] = useState<'studio' | 'photoshoots'>('studio');

  // Bottom prompt input
  const [customPrompt, setCustomPrompt] = useState<string>('');

  // Target Audience Trigger Mode: 'business' | 'creator' | 'actor'
  const [audienceMode, setAudienceMode] = useState<AudienceMode>('creator');
  const [selectedArchetype, setSelectedArchetype] = useState<string>('cr-nightlife');
  const [selectedWardrobe, setSelectedWardrobe] = useState<string>('Feather Halter Mini Dress');
  const [selectedLighting, setSelectedLighting] = useState<string>('35mm Direct Night Flash');
  const [selectedEnvironment, setSelectedEnvironment] = useState<string>('Burj Al Arab & Cabana Poolside');

  // Character Details Modal
  const [showDetailsModal, setShowDetailsModal] = useState<boolean>(false);
  const [detailsTab, setDetailsTab] = useState<'details' | 'comments'>('details');

  // Builder Accordion states (Right panel)
  const [expandedSection, setExpandedSection] = useState<string>('archetype');
  const [selectedCharacterType, setSelectedCharacterType] = useState<string>('human');
  const [builderGender, setBuilderGender] = useState<string>('Female');
  const [builderEthnicity, setBuilderEthnicity] = useState<string>('Mediterranean / Levantine');
  const [builderSkinColor, setBuilderSkinColor] = useState<string>('Warm Golden-Olive');
  const [builderEyeColor, setBuilderEyeColor] = useState<string>('Deep Espresso Dark Brown');
  const [builderSkinCondition, setBuilderSkinCondition] = useState<string>('Natural Fine Pores');
  const [builderAge, setBuilderAge] = useState<number>(28);
  const [advancedTab, setAdvancedTab] = useState<'face' | 'body' | 'style'>('face');
  const [selectedAccessory, setSelectedAccessory] = useState<string | null>(null);
  const [selectedRenderingStyle, setSelectedRenderingStyle] = useState<string>('hyper-realistic');

  // Responsible Use Policy Modal states
  const [showPolicyModal, setShowPolicyModal] = useState<boolean>(false);
  const [hasAcceptedPolicy, setHasAcceptedPolicy] = useState<boolean>(false);
  const [policyCheckbox, setPolicyCheckbox] = useState<boolean>(false);

  // Studio Interactive Dock states (Higgsfield Web Character Details & Creative Tools)
  const [activeDockTool, setActiveDockTool] = useState<'overview' | 'color' | 'upscale' | 'enhancer' | 'relight' | 'inpaint' | 'angles'>('overview');
  const [colorGradePreset, setColorGradePreset] = useState<'none' | 'cinematic' | 'teal_orange' | 'kodachrome' | 'noir' | 'golden_hour'>('none');
  const [colorExposure, setColorExposure] = useState<number>(100);
  const [colorContrast, setColorContrast] = useState<number>(100);
  const [colorWarmth, setColorWarmth] = useState<number>(0);
  const [colorSaturation, setColorSaturation] = useState<number>(100);
  const [relightDirection, setRelightDirection] = useState<'front' | 'top' | 'key_left' | 'rim_right' | 'backlight'>('front');
  const [angleYaw, setAngleYaw] = useState<number>(0);
  const [anglePitch, setAnglePitch] = useState<number>(0);
  const [angleZoom, setAngleZoom] = useState<number>(100);
  const [upscaleFactor, setUpscaleFactor] = useState<'2K' | '4K' | '8K'>('4K');
  const [enhancerLevel, setEnhancerLevel] = useState<number>(85);

  const modalImageFilter = useMemo(() => {
    let f = `contrast(${colorContrast}%) saturate(${colorSaturation}%) brightness(${colorExposure}%)`;
    if (colorGradePreset === 'cinematic') f += ' sepia(15%) hue-rotate(-5deg)';
    else if (colorGradePreset === 'teal_orange') f += ' hue-rotate(15deg) contrast(110%)';
    else if (colorGradePreset === 'kodachrome') f += ' saturate(130%) contrast(105%)';
    else if (colorGradePreset === 'noir') f += ' grayscale(100%) contrast(120%)';
    else if (colorGradePreset === 'golden_hour') f += ' sepia(35%) brightness(105%)';
    if (colorWarmth > 0) f += ` sepia(${colorWarmth}%)`;
    return f;
  }, [colorContrast, colorSaturation, colorExposure, colorGradePreset, colorWarmth]);

  const modalImageTransform = useMemo(() => {
    return `perspective(1000px) rotateY(${angleYaw}deg) rotateX(${-anglePitch}deg) scale(${angleZoom / 100})`;
  }, [angleYaw, anglePitch, angleZoom]);

  const handleSwitchAudienceMode = (mode: AudienceMode) => {
    setAudienceMode(mode);
    const archs = AUDIENCE_ARCHETYPES[mode];
    if (archs && archs.length > 0) {
      setSelectedArchetype(archs[0].id);
      setCustomPrompt(archs[0].defaultPrompt);
      if (archs[0].image) {
        setActiveHeadshotUrl(archs[0].image);
      }
    }
    setSelectedWardrobe(AUDIENCE_WARDROBES[mode][0]);
    setSelectedLighting(AUDIENCE_LIGHTING[mode][0]);
    setSelectedEnvironment(AUDIENCE_ENVIRONMENTS[mode][0]);
    showToast(
      `Trigger profile: ${
        mode === 'business' ? 'Business Owner' : mode === 'creator' ? 'AI Creator' : 'Actor & Talent'
      }`
    );
  };

  // Dynamic selected tags on canvas
  const dynamicTags = useMemo(() => {
    const tags: { id: string; label: string; onRemove: () => void }[] = [];

    // Trigger Mode Badge
    tags.push({
      id: 'audience',
      label: audienceMode === 'business' ? 'Business' : audienceMode === 'creator' ? 'Creator' : 'Actor/Twin',
      onRemove: () => handleSwitchAudienceMode('creator'),
    });

    // Selected Archetype
    const curArch = AUDIENCE_ARCHETYPES[audienceMode].find((a) => a.id === selectedArchetype);
    if (curArch) {
      tags.push({
        id: 'archetype',
        label: curArch.name,
        onRemove: () => setSelectedArchetype(AUDIENCE_ARCHETYPES[audienceMode][0].id),
      });
    }

    if (builderGender) {
      tags.push({ id: 'gender', label: builderGender, onRemove: () => setBuilderGender('Female') });
    }
    if (builderEthnicity) {
      const shortEth = builderEthnicity.split('/')[0].trim();
      tags.push({ id: 'ethnicity', label: shortEth, onRemove: () => setBuilderEthnicity('Mediterranean / Levantine') });
    }
    if (selectedWardrobe) {
      tags.push({
        id: 'wardrobe',
        label: selectedWardrobe.split(' ')[0],
        onRemove: () => setSelectedWardrobe(AUDIENCE_WARDROBES[audienceMode][0]),
      });
    }
    if (selectedLighting) {
      tags.push({
        id: 'lighting',
        label: selectedLighting.split(' ')[0],
        onRemove: () => setSelectedLighting(AUDIENCE_LIGHTING[audienceMode][0]),
      });
    }
    if (builderSkinColor) {
      tags.push({ id: 'skin', label: builderSkinColor.split(' ')[0], onRemove: () => setBuilderSkinColor('Warm Golden-Olive') });
    }
    if (builderEyeColor) {
      tags.push({ id: 'eye', label: builderEyeColor.split(' ')[0], onRemove: () => setBuilderEyeColor('Deep Espresso Dark Brown') });
    }
    if (builderAge) {
      tags.push({ id: 'age', label: builderAge < 30 ? `Age ${builderAge}` : `Adult (${builderAge})`, onRemove: () => setBuilderAge(28) });
    }
    if (selectedRenderingStyle) {
      const sName = RENDERING_STYLES.find((s) => s.id === selectedRenderingStyle)?.name;
      if (sName) tags.push({ id: 'style', label: sName, onRemove: () => setSelectedRenderingStyle('hyper-realistic') });
    }
    if (selectedAccessory) {
      const aName = ACCESSORIES.find((a) => a.id === selectedAccessory)?.name;
      if (aName) tags.push({ id: 'accessory', label: aName, onRemove: () => setSelectedAccessory(null) });
    }
    return tags;
  }, [
    audienceMode,
    selectedArchetype,
    selectedWardrobe,
    selectedLighting,
    builderGender,
    builderEthnicity,
    builderSkinColor,
    builderEyeColor,
    builderAge,
    selectedRenderingStyle,
    selectedAccessory,
  ]);

  // Notification Toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Sync drops count
  useEffect(() => {
    if (vaultItems.length > 0) {
      InfluencerStore.autoTraceFromVault(vaultItems);
      setInfluencers(InfluencerStore.getAll());
    }
  }, [vaultItems]);

  // Select an influencer from left sidebar
  const handleSelectInfluencer = (inf: StoredInfluencer) => {
    setIsCreatingNew(false);
    setViewMode('studio');
    setActiveInfluencerId(inf.id);
    InfluencerStore.setActiveInfluencerId(inf.id);
    if (inf.headshotImage) {
      setActiveHeadshotUrl(inf.headshotImage);
      InfluencerStore.setActiveHeadshot(inf.headshotImage);
    }
  };

  // Start "Create New" flow
  const handleStartCreateNew = () => {
    setIsCreatingNew(true);
    setViewMode('studio');
    setCustomPrompt('');
  };

  // Reset Builder to defaults
  const handleResetBuilder = () => {
    setSelectedCharacterType('human');
    setBuilderGender('Female');
    setBuilderEthnicity('Mediterranean / Levantine');
    setBuilderSkinColor('Warm Golden-Olive');
    setBuilderEyeColor('Deep Espresso Dark Brown');
    setBuilderSkinCondition('Natural Fine Pores');
    setBuilderAge(28);
    setSelectedAccessory(null);
    setSelectedRenderingStyle('hyper-realistic');
    showToast('Builder settings reset to defaults');
  };

  const executeGeneration = () => {
    showToast('Generating new character variation with Higgsfield Soul 2.0...');
    setTimeout(() => {
      setIsCreatingNew(false);
      showToast('Character generated successfully!');
    }, 1500);
  };

  // Handle Generate CTA (intercepted by Responsible Use Policy if not accepted)
  const handleGenerateInfluencer = () => {
    if (!hasAcceptedPolicy) {
      setShowPolicyModal(true);
      return;
    }
    executeGeneration();
  };

  const handlePolicyConfirm = () => {
    if (!policyCheckbox) return;
    setHasAcceptedPolicy(true);
    setShowPolicyModal(false);
    executeGeneration();
  };

  return (
    <div className="flex-1 w-full bg-[#08080a] text-white flex flex-col min-h-[calc(100vh-4rem)] select-none">
      
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-50 bg-[#16161e] border border-[#d1fe17]/60 text-white px-4 py-2.5 rounded-2xl shadow-2xl flex items-center gap-2.5 text-xs font-semibold backdrop-blur-md animate-fade-in">
          <div className="w-2 h-2 rounded-full bg-[#d1fe17] animate-pulse" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* =================================================================== */}
      {/* PHOTOSHOOTS VIEW (GRID OF ALL REAL DROPS FOR THIS INFLUENCER)       */}
      {/* =================================================================== */}
      {viewMode === 'photoshoots' && (
        <div className="flex-1 flex flex-col max-w-7xl mx-auto w-full px-4 sm:px-6 py-6">
          <div className="flex items-center justify-between pb-6 border-b border-white/10 mb-6">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setViewMode('studio')}
                className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="m15 18-6-6 6-6" />
                </svg>
                <span>Back to Studio</span>
              </button>
              <div>
                <h2 className="text-lg font-extrabold text-white">
                  {activeInfluencer?.name} — All Photoshoots ({vaultItems.length || 1604})
                </h2>
                <p className="text-xs text-neutral-400">
                  Real generated drops cataloged in Prompt Vault for this verified AI identity
                </p>
              </div>
            </div>

            <button
              onClick={() => onOpenPromptVault?.()}
              className="px-4 py-2 rounded-xl bg-[#d1fe17] text-black text-xs font-bold hover:bg-[#bce414] transition-all cursor-pointer"
            >
              Open in Prompt Vault
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3.5 pb-16">
            {vaultItems.slice(0, 100).map((item) => (
              <div
                key={item.id}
                onClick={() => onSelectInfluencerDrops?.([item.id], activeInfluencer?.name || 'Baha Savage')}
                className="group relative aspect-[3/4] rounded-2xl overflow-hidden bg-[#121217] border border-white/10 hover:border-[#d1fe17]/60 transition-all cursor-pointer shadow-lg"
              >
                <img
                  src={item.imageUrl || item.fullImageUrl}
                  alt={item.prompt?.slice(0, 40)}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                <div className="absolute bottom-2 left-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                  <p className="text-[10px] text-white font-medium line-clamp-2 leading-tight">
                    {item.prompt}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* 3-COLUMN HIGGSFIELD AI INFLUENCER STUDIO VIEW                       */}
      {/* =================================================================== */}
      {viewMode === 'studio' && (
        <div className="flex-1 flex flex-col md:flex-row w-full h-[calc(100vh-4rem)] overflow-hidden">
          
          {/* =================================================================== */}
          {/* COLUMN 1: LEFT SIDEBAR (ROSTER & INCENTIVE)                         */}
          {/* =================================================================== */}
          <aside className="w-full md:w-56 lg:w-60 border-b md:border-b-0 md:border-r border-white/10 bg-[#08080b] flex flex-col shrink-0 h-full overflow-hidden">
            {/* Header: AI Influencer Studio */}
            <div className="px-4 py-3.5 border-b border-white/10 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-neutral-300">
                  <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                    <circle cx="11" cy="7" r="4" />
                  </svg>
                </div>
                <span className="text-xs font-bold text-white tracking-wide">
                  AI Influencer Studio
                </span>
              </div>
            </div>

            {/* Roster List */}
            <div className="flex-1 overflow-y-auto no-scrollbar p-3 space-y-3">
              {/* 1. Create New Card (Higgsfield Style, 3:4 Aspect) */}
              <button
                onClick={handleStartCreateNew}
                className={`w-full aspect-[3/4] rounded-2xl border flex flex-col items-center justify-center p-3 text-center transition-all cursor-pointer group ${
                  isCreatingNew
                    ? 'border-[#d1fe17] bg-[#d1fe17]/10'
                    : 'border-white/15 bg-white/[0.02] hover:bg-white/[0.05] hover:border-white/30'
                }`}
              >
                <div className="w-10 h-10 rounded-2xl bg-white/5 group-hover:bg-[#d1fe17]/20 text-neutral-400 group-hover:text-[#d1fe17] flex items-center justify-center mb-2 transition-colors">
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <line x1="12" y1="5" x2="12" y2="19" />
                    <line x1="5" y1="12" x2="19" y2="12" />
                  </svg>
                </div>
                <span className="text-xs font-bold text-white group-hover:text-[#d1fe17] transition-colors">
                  Create new
                </span>
              </button>

              {/* 2. Influencer Cards in Roster (Clean Minimalist 3:4, object-top) */}
              {influencers.map((inf) => {
                const isSelected = !isCreatingNew && activeInfluencerId === inf.id;
                return (
                  <div
                    key={inf.id}
                    onClick={() => handleSelectInfluencer(inf)}
                    className={`group relative aspect-[3/4] rounded-2xl overflow-hidden cursor-pointer transition-all select-none shadow-md ${
                      isSelected
                        ? 'border-2 border-[#d1fe17] shadow-[0_0_20px_rgba(209,254,23,0.3)]'
                        : 'border border-white/10 hover:border-white/30 bg-[#121217]'
                    }`}
                  >
                    <img
                      src={inf.headshotImage || '/images/archetypes/business-founder.png'}
                      alt={inf.name}
                      className="w-full h-full object-cover object-top transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent pointer-events-none" />

                    {/* Minimalist Name at bottom left */}
                    <div className="absolute bottom-2.5 left-3 right-3 pointer-events-none">
                      <h4 className="text-xs font-bold text-white tracking-wide truncate">
                        {inf.name}
                      </h4>
                    </div>
                  </div>
                );
              })}
            </div>
          </aside>

          {/* =================================================================== */}
          {/* COLUMN 2: CENTER CANVAS (THE HIGGSFIELD INFLUENCER STAGE)           */}
          {/* =================================================================== */}
          <section className="flex-1 flex flex-col items-center justify-between p-4 sm:p-6 bg-[#0a0a0d] h-full overflow-y-auto no-scrollbar relative">
            
            {/* Center Canvas Box */}
            <div className="relative w-full max-w-sm aspect-[3/4] rounded-3xl bg-[#111116] border border-white/15 overflow-hidden shadow-2xl flex items-center justify-center my-auto group">
              {isCreatingNew ? (
                // Blank creation stage matching Higgsfield Web AI influencer 1.png
                <div className="flex flex-col items-center justify-center p-8 text-center space-y-3">
                  <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-neutral-400">
                    <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                      <rect x="3" y="3" width="18" height="18" rx="2" />
                      <circle cx="8.5" cy="8.5" r="1.5" />
                      <polyline points="21 15 16 10 5 21" />
                    </svg>
                  </div>
                  <h3 className="text-sm font-bold text-white">Your AI influencer lives here.</h3>
                  <p className="text-xs text-neutral-400 max-w-xs leading-relaxed">
                    Design and build your AI influencer from scratch
                  </p>
                </div>
              ) : (
                // Active Influencer Portrait Canvas matching Higgsfield Web AI influencer 2.png
                <>
                  <img
                    src={activeHeadshotUrl || '/images/archetypes/business-founder.png'}
                    alt={activeInfluencer?.name}
                    className="w-full h-full object-cover object-top select-none"
                  />

                  {/* Top Left Thumbnails Stack (Real Variations of Active Mode) */}
                  <div className="absolute top-3.5 left-3.5 flex flex-col gap-1.5">
                    {AUDIENCE_ARCHETYPES[audienceMode].map((arch) => (
                      <div
                        key={arch.id}
                        onClick={() => {
                          setActiveHeadshotUrl(arch.image);
                          setSelectedArchetype(arch.id);
                          setCustomPrompt(arch.defaultPrompt);
                          showToast(`Selected ${arch.name}`);
                        }}
                        className={`w-9 h-9 rounded-xl overflow-hidden cursor-pointer transition-all ${
                          activeHeadshotUrl === arch.image
                            ? 'border-2 border-[#d1fe17] shadow-lg ring-1 ring-[#d1fe17]/50'
                            : 'border border-white/30 opacity-70 hover:opacity-100'
                        }`}
                      >
                        <img src={arch.image} alt="" className="w-full h-full object-cover object-top" />
                      </div>
                    ))}
                  </div>

                  {/* Top Right Actions: Heart, Download, Three-Dots */}
                  <div className="absolute top-3.5 right-3.5 flex items-center gap-1.5">
                    <button
                      onClick={() => showToast('Saved to favorites')}
                      className="w-8 h-8 rounded-full bg-black/50 backdrop-blur-md flex items-center justify-center text-white hover:text-rose-400 transition-colors"
                      title="Favorite"
                    >
                      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                      </svg>
                    </button>
                    <button
                      onClick={() => showToast('High-res studio headshot downloaded')}
                      className="w-8 h-8 rounded-full bg-black/50 backdrop-blur-md flex items-center justify-center text-white hover:text-[#d1fe17] transition-colors"
                      title="Download"
                    >
                      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                        <polyline points="7 10 12 15 17 10" />
                        <line x1="12" y1="15" x2="12" y2="3" />
                      </svg>
                    </button>
                    <button
                      onClick={() => setShowDetailsModal(true)}
                      className="w-8 h-8 rounded-full bg-black/50 backdrop-blur-md flex items-center justify-center text-white hover:text-[#d1fe17] transition-colors cursor-pointer"
                      title="Character Details"
                    >
                      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                        <circle cx="5" cy="12" r="1.8" />
                        <circle cx="12" cy="12" r="1.8" />
                        <circle cx="19" cy="12" r="1.8" />
                      </svg>
                    </button>
                  </div>

                  {/* Bottom Text Overlay & 4 Action Pill Circles */}
                  <div className="absolute bottom-4 left-4 right-4 flex flex-col items-center space-y-3 pointer-events-none">
                    <div className="text-center">
                      <h2 className="text-sm font-black text-white uppercase tracking-wider drop-shadow-md">
                        {activeInfluencer?.name}
                      </h2>
                      {activeInfluencer?.instagramHandle && (
                        <p className="text-[11px] font-medium text-neutral-300 drop-shadow">
                          {activeInfluencer.instagramHandle}
                        </p>
                      )}
                    </div>

                    {/* 4 Floating Circular Actions */}
                    <div className="flex items-center gap-2 pointer-events-auto">
                      {/* 1. Re-roll variation */}
                      <button
                        onClick={() => {
                          const archs = AUDIENCE_ARCHETYPES[audienceMode];
                          const currentIndex = archs.findIndex((a) => a.image === activeHeadshotUrl);
                          const nextIndex = (currentIndex + 1) % archs.length;
                          const nextArch = archs[nextIndex];
                          setActiveHeadshotUrl(nextArch.image);
                          setSelectedArchetype(nextArch.id);
                          setCustomPrompt(nextArch.defaultPrompt);
                          showToast(`Switched to ${nextArch.name}`);
                        }}
                        className="w-9 h-9 rounded-full bg-white/20 backdrop-blur-md hover:bg-white/30 text-white flex items-center justify-center transition-transform hover:scale-105 active:scale-95 cursor-pointer shadow-lg"
                        title="Cycle variation"
                      >
                        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0 1 18.8-4.3M22 12.5a10 10 0 0 1-18.8 4.2" />
                        </svg>
                      </button>

                      {/* 2. Style / Magic Wand */}
                      <button
                        onClick={() => {
                          const p = prompt('Edit character prompt:', customPrompt || activeInfluencer?.signaturePrompt);
                          if (p !== null) {
                            setCustomPrompt(p);
                            showToast('Prompt updated!');
                          }
                        }}
                        className="w-10 h-10 rounded-full bg-[#d1fe17] text-black flex items-center justify-center transition-transform hover:scale-110 active:scale-95 cursor-pointer shadow-[0_0_15px_rgba(209,254,23,0.4)]"
                        title="Style character"
                      >
                        <svg className="w-5 h-5 text-black" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                          <path d="m12 3-1.9 5.8a2 2 0 0 1-1.3 1.3L3 12l5.8 1.9a2 2 0 0 1 1.3 1.3L12 21l1.9-5.8a2 2 0 0 1 1.3-1.3L21 12l-5.8-1.9a2 2 0 0 1-1.3-1.3Z" />
                        </svg>
                      </button>

                      {/* 3. Video camera -> opens motion */}
                      <button
                        onClick={() => setShowDetailsModal(true)}
                        className="w-9 h-9 rounded-full bg-white/20 backdrop-blur-md hover:bg-white/30 text-white flex items-center justify-center transition-transform hover:scale-105 active:scale-95 cursor-pointer shadow-lg"
                        title="Animate character / Motion"
                      >
                        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <polygon points="23 7 16 12 23 17 23 7" />
                          <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
                        </svg>
                      </button>

                      {/* 4. Grid -> switches to photoshoots */}
                      <button
                        onClick={() => setViewMode('photoshoots')}
                        className="w-9 h-9 rounded-full bg-white/20 backdrop-blur-md hover:bg-white/30 text-white flex items-center justify-center transition-transform hover:scale-105 active:scale-95 cursor-pointer shadow-lg"
                        title="View photoshoots grid (1,604 drops)"
                      >
                        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <rect x="3" y="3" width="7" height="7" />
                          <rect x="14" y="3" width="7" height="7" />
                          <rect x="14" y="14" width="7" height="7" />
                          <rect x="3" y="14" width="7" height="7" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Dynamic Selected Tag Cloud Chips (Higgsfield Creating an AI influencer 6.png) */}
            {dynamicTags.length > 0 && (
              <div className="w-full max-w-sm flex flex-wrap items-center justify-center gap-1.5 py-2 px-1">
                {dynamicTags.map((tag) => (
                  <div
                    key={tag.id}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#181820]/90 border border-white/10 text-white text-[11px] font-medium backdrop-blur-md shadow-sm hover:border-white/30 transition-all"
                  >
                    <span>{tag.label}</span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        tag.onRemove();
                      }}
                      className="w-3.5 h-3.5 rounded-full bg-white/10 hover:bg-white/30 text-neutral-300 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
                      title="Remove"
                    >
                      <svg className="w-2.5 h-2.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                        <line x1="18" y1="6" x2="6" y2="18" />
                        <line x1="6" y1="6" x2="18" y2="18" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Bottom Bar below Canvas matching Higgsfield Web AI influencer 1 & 2 */}
            <div className="w-full max-w-sm mt-1 shrink-0">
              {isCreatingNew ? (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      showToast('Randomized builder attributes');
                    }}
                    className="w-10 h-10 rounded-xl bg-white/10 hover:bg-white/20 text-neutral-300 hover:text-white flex items-center justify-center transition-colors cursor-pointer shrink-0"
                    title="Randomize"
                  >
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="16 3 21 3 21 8" />
                      <line x1="4" y1="20" x2="21" y2="3" />
                      <polyline points="21 16 21 21 16 21" />
                      <line x1="15" y1="15" x2="21" y2="21" />
                      <line x1="4" y1="4" x2="9" y2="9" />
                    </svg>
                  </button>
                  <button
                    onClick={handleGenerateInfluencer}
                    className="flex-1 py-2.5 rounded-xl bg-[#d1fe17] text-black font-extrabold text-xs flex items-center justify-center gap-1.5 hover:bg-[#bce414] active:scale-95 transition-all cursor-pointer shadow-lg"
                  >
                    <span>
                      {audienceMode === 'business'
                        ? 'Generate Campaign Shoot'
                        : audienceMode === 'creator'
                        ? 'Generate Viral Drop'
                        : 'Generate Casting Slate'}
                    </span>
                    <span className="flex items-center gap-1">
                      <svg className="w-3 h-3 fill-black" viewBox="0 0 24 24">
                        <path d="M12 2L14.5 9.5L22 12L14.5 14.5L12 22L9.5 14.5L2 12L9.5 9.5L12 2Z" />
                      </svg>
                      <span className="font-mono">2</span>
                    </span>
                  </button>
                </div>
              ) : (
                <div className="flex items-center rounded-2xl bg-[#121217] border border-white/10 pl-3 pr-1.5 py-1.5 focus-within:border-white/30 transition-colors">
                  <input
                    type="text"
                    value={customPrompt}
                    onChange={(e) => setCustomPrompt(e.target.value)}
                    placeholder="Type to customize character"
                    className="flex-1 bg-transparent text-xs text-white placeholder-neutral-500 focus:outline-none"
                  />
                  <button
                    onClick={handleGenerateInfluencer}
                    className="px-4 py-1.5 rounded-xl bg-[#d1fe17] text-black font-extrabold text-xs flex items-center gap-1.5 hover:bg-[#bce414] active:scale-95 transition-all cursor-pointer"
                  >
                    <span>EDIT</span>
                    <span className="flex items-center gap-1">
                      <svg className="w-3 h-3 fill-black" viewBox="0 0 24 24">
                        <path d="M12 2L14.5 9.5L22 12L14.5 14.5L12 22L9.5 14.5L2 12L9.5 9.5L12 2Z" />
                      </svg>
                      <span className="font-mono">2</span>
                    </span>
                  </button>
                </div>
              )}
            </div>
          </section>

          {/* =================================================================== */}
          {/* COLUMN 3: RIGHT SIDEBAR (THE HIGGSFIELD BUILDER)                    */}
          {/* =================================================================== */}
          <aside className="w-full md:w-80 lg:w-96 border-t md:border-t-0 md:border-l border-white/10 bg-[#08080b] flex flex-col shrink-0 h-full overflow-hidden">
            {/* Builder Header */}
            <div className="px-5 py-3.5 border-b border-white/10 flex items-center justify-between shrink-0">
              <span className="text-xs font-bold text-white tracking-wide">Builder</span>
              <button
                onClick={handleResetBuilder}
                className="text-xs text-neutral-400 hover:text-white transition-colors cursor-pointer"
              >
                Reset
              </button>
            </div>

            {/* Target Audience Trigger Switcher (Business / AI Creator / Actor) */}
            <div className="p-3 border-b border-white/10 bg-white/[0.01] shrink-0">
              <div className="grid grid-cols-3 gap-1.5 p-1 rounded-2xl bg-black/50 border border-white/10">
                <button
                  onClick={() => handleSwitchAudienceMode('business')}
                  className={`py-2 px-1.5 rounded-xl text-[10px] font-bold flex flex-col items-center justify-center gap-1 transition-all cursor-pointer ${
                    audienceMode === 'business'
                      ? 'bg-[#d1fe17] text-black shadow-md'
                      : 'text-neutral-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                    <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
                    <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
                  </svg>
                  <span>Business</span>
                </button>

                <button
                  onClick={() => handleSwitchAudienceMode('creator')}
                  className={`py-2 px-1.5 rounded-xl text-[10px] font-bold flex flex-col items-center justify-center gap-1 transition-all cursor-pointer ${
                    audienceMode === 'creator'
                      ? 'bg-[#d1fe17] text-black shadow-md'
                      : 'text-neutral-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                    <path d="m12 3-1.9 5.8a2 2 0 0 1-1.3 1.3L3 12l5.8 1.9a2 2 0 0 1 1.3 1.3L12 21l1.9-5.8a2 2 0 0 1 1.3-1.3L21 12l-5.8-1.9a2 2 0 0 1-1.3-1.3Z" />
                  </svg>
                  <span>AI Creator</span>
                </button>

                <button
                  onClick={() => handleSwitchAudienceMode('actor')}
                  className={`py-2 px-1.5 rounded-xl text-[10px] font-bold flex flex-col items-center justify-center gap-1 transition-all cursor-pointer ${
                    audienceMode === 'actor'
                      ? 'bg-[#d1fe17] text-black shadow-md'
                      : 'text-neutral-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                    <rect x="2" y="2" width="20" height="20" rx="2.18" ry="2.18" />
                    <line x1="7" y1="2" x2="7" y2="22" />
                    <line x1="17" y1="2" x2="17" y2="22" />
                    <line x1="2" y1="12" x2="22" y2="12" />
                    <line x1="2" y1="7" x2="7" y2="7" />
                    <line x1="2" y1="17" x2="7" y2="17" />
                    <line x1="17" y1="17" x2="22" y2="17" />
                    <line x1="17" y1="7" x2="22" y2="7" />
                  </svg>
                  <span>Actor / Twin</span>
                </button>
              </div>
            </div>

            {/* Accordion Controls Container */}
            <div className="flex-1 overflow-y-auto no-scrollbar divide-y divide-white/5">
              
              {/* 0. Official Higgsfield Character Type (13 Types from Creating an AI influencer 1.png) */}
              <div className="p-4 space-y-3">
                <button
                  onClick={() => setExpandedSection(expandedSection === 'characterType' ? '' : 'characterType')}
                  className="w-full flex items-center justify-between text-xs font-semibold text-neutral-200 hover:text-white transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-2">
                    <svg className="w-3.5 h-3.5 text-neutral-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                    </svg>
                    <span>Character Type</span>
                    <span className="text-[10px] text-neutral-500 font-mono">• 1</span>
                  </div>
                  <svg
                    className={`w-3.5 h-3.5 text-neutral-400 transition-transform ${
                      expandedSection === 'characterType' ? 'rotate-180' : ''
                    }`}
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <polyline points="6 9 12 15 18 9" />
                  </svg>
                </button>

                {expandedSection === 'characterType' && (
                  <div className="grid grid-cols-3 gap-2 pt-1 animate-fade-in">
                    {CHARACTER_TYPES.map((char) => {
                      const isSelected = selectedCharacterType === char.id;
                      return (
                        <div
                          key={char.id}
                          onClick={() => {
                            setSelectedCharacterType(char.id);
                            showToast(`Character type: ${char.name}`);
                          }}
                          className={`group relative aspect-[3/4] rounded-xl overflow-hidden cursor-pointer transition-all bg-[#121217] flex flex-col justify-end p-2 select-none ${
                            isSelected
                              ? 'border-2 border-[#d1fe17] bg-[#16161e] shadow-lg ring-1 ring-[#d1fe17]/50'
                              : 'border border-white/10 hover:border-white/30'
                          }`}
                        >
                          <img
                            src={char.image}
                            alt={char.name}
                            className="absolute inset-0 w-full h-full object-cover object-top transition-transform duration-300 group-hover:scale-105"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent pointer-events-none" />
                          <span className="relative z-10 text-[11px] font-bold text-white tracking-tight truncate">
                            {char.name}
                          </span>
                          {isSelected && (
                            <div className="absolute top-1.5 right-1.5 z-10 w-4 h-4 rounded-full bg-[#d1fe17] text-black flex items-center justify-center shadow">
                              <svg className="w-2.5 h-2.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5">
                                <polyline points="20 6 9 17 4 12" />
                              </svg>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* 1. Persona Archetype (Aligned with Vault & Selected Audience) */}
              <div className="p-4 space-y-3">
                <button
                  onClick={() => setExpandedSection(expandedSection === 'archetype' ? '' : 'archetype')}
                  className="w-full flex items-center justify-between text-xs font-semibold text-neutral-200 hover:text-white transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-2">
                    <svg className="w-3.5 h-3.5 text-neutral-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
                      <circle cx="12" cy="7" r="4" />
                    </svg>
                    <span>Persona Archetype</span>
                    <span className="text-[10px] text-neutral-500 font-mono">• 1</span>
                  </div>
                  <svg
                    className={`w-3.5 h-3.5 text-neutral-400 transition-transform ${
                      expandedSection === 'archetype' ? 'rotate-180' : ''
                    }`}
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <polyline points="6 9 12 15 18 9" />
                  </svg>
                </button>

                {expandedSection === 'archetype' && (
                  <div className="grid grid-cols-2 gap-2 pt-1 animate-fade-in">
                    {AUDIENCE_ARCHETYPES[audienceMode].map((arch) => {
                      const isSelected = selectedArchetype === arch.id;
                      return (
                        <div
                          key={arch.id}
                          onClick={() => {
                            setSelectedArchetype(arch.id);
                            setCustomPrompt(arch.defaultPrompt);
                            if (arch.image) setActiveHeadshotUrl(arch.image);
                            showToast(`Selected ${arch.name}`);
                          }}
                          className={`group relative aspect-[3/4] rounded-xl overflow-hidden cursor-pointer transition-all ${
                            isSelected
                              ? 'border-2 border-[#d1fe17] bg-[#16161e] shadow-lg'
                              : 'border border-white/10 hover:border-white/30 bg-[#121217]'
                          }`}
                        >
                          <img
                            src={arch.image}
                            alt=""
                            className="w-full h-full object-cover object-top transition-transform duration-300 group-hover:scale-105"
                          />
                          {isSelected && (
                            <div className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-[#d1fe17] text-black flex items-center justify-center shadow">
                              <svg className="w-2.5 h-2.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5">
                                <polyline points="20 6 9 17 4 12" />
                              </svg>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* 2. Wardrobe & Styling Presets */}
              <div className="p-4 space-y-2.5">
                <button
                  onClick={() => setExpandedSection(expandedSection === 'wardrobe' ? '' : 'wardrobe')}
                  className="w-full flex items-center justify-between text-xs font-semibold text-neutral-200 hover:text-white transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-2">
                    <svg className="w-3.5 h-3.5 text-neutral-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M20.38 3.46 16 2a4 4 0 0 1-8 0L3.62 3.46a2 2 0 0 0-1.34 2.23l.58 3.47a1 1 0 0 0 .99.84H6v10c0 1.1.9 2 2 2h8a2 2 0 0 0 2-2V10h2.15a1 1 0 0 0 .99-.84l.58-3.47a2 2 0 0 0-1.34-2.23z" />
                    </svg>
                    <span>Wardrobe & Styling</span>
                  </div>
                  <svg
                    className={`w-3.5 h-3.5 text-neutral-400 transition-transform ${
                      expandedSection === 'wardrobe' ? 'rotate-180' : ''
                    }`}
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <polyline points="6 9 12 15 18 9" />
                  </svg>
                </button>

                {expandedSection === 'wardrobe' && (
                  <div className="flex flex-wrap gap-1.5 pt-1 animate-fade-in">
                    {AUDIENCE_WARDROBES[audienceMode].map((w) => (
                      <button
                        key={w}
                        onClick={() => setSelectedWardrobe(w)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all cursor-pointer ${
                          selectedWardrobe === w
                            ? 'bg-[#d1fe17] text-black font-bold shadow-md'
                            : 'bg-white/5 text-neutral-300 hover:text-white hover:bg-white/10 border border-white/5'
                        }`}
                      >
                        {w}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* 3. Camera & Film Aesthetic */}
              <div className="p-4 space-y-2.5">
                <button
                  onClick={() => setExpandedSection(expandedSection === 'lighting' ? '' : 'lighting')}
                  className="w-full flex items-center justify-between text-xs font-semibold text-neutral-200 hover:text-white transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-2">
                    <svg className="w-3.5 h-3.5 text-neutral-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z" />
                      <circle cx="12" cy="13" r="3" />
                    </svg>
                    <span>Camera & Film Aesthetic</span>
                  </div>
                  <svg
                    className={`w-3.5 h-3.5 text-neutral-400 transition-transform ${
                      expandedSection === 'lighting' ? 'rotate-180' : ''
                    }`}
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <polyline points="6 9 12 15 18 9" />
                  </svg>
                </button>

                {expandedSection === 'lighting' && (
                  <div className="flex flex-wrap gap-1.5 pt-1 animate-fade-in">
                    {AUDIENCE_LIGHTING[audienceMode].map((l) => (
                      <button
                        key={l}
                        onClick={() => setSelectedLighting(l)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all cursor-pointer ${
                          selectedLighting === l
                            ? 'bg-[#d1fe17] text-black font-bold shadow-md'
                            : 'bg-white/5 text-neutral-300 hover:text-white hover:bg-white/10 border border-white/5'
                        }`}
                      >
                        {l}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* 4. Setting & Atmosphere */}
              <div className="p-4 space-y-2.5">
                <button
                  onClick={() => setExpandedSection(expandedSection === 'env' ? '' : 'env')}
                  className="w-full flex items-center justify-between text-xs font-semibold text-neutral-200 hover:text-white transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-2">
                    <svg className="w-3.5 h-3.5 text-neutral-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                      <circle cx="12" cy="10" r="3" />
                    </svg>
                    <span>Setting & Atmosphere</span>
                  </div>
                  <svg
                    className={`w-3.5 h-3.5 text-neutral-400 transition-transform ${
                      expandedSection === 'env' ? 'rotate-180' : ''
                    }`}
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <polyline points="6 9 12 15 18 9" />
                  </svg>
                </button>

                {expandedSection === 'env' && (
                  <div className="flex flex-wrap gap-1.5 pt-1 animate-fade-in">
                    {AUDIENCE_ENVIRONMENTS[audienceMode].map((env) => (
                      <button
                        key={env}
                        onClick={() => setSelectedEnvironment(env)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all cursor-pointer ${
                          selectedEnvironment === env
                            ? 'bg-[#d1fe17] text-black font-bold shadow-md'
                            : 'bg-white/5 text-neutral-300 hover:text-white hover:bg-white/10 border border-white/5'
                        }`}
                      >
                        {env}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* 2. Gender */}
              <div className="p-4 space-y-2.5">
                <button
                  onClick={() => setExpandedSection(expandedSection === 'gender' ? '' : 'gender')}
                  className="w-full flex items-center justify-between text-xs font-semibold text-neutral-200 hover:text-white transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-2">
                    <svg className="w-3.5 h-3.5 text-neutral-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="12" cy="12" r="10" />
                      <line x1="12" y1="8" x2="12" y2="12" />
                      <line x1="12" y1="16" x2="12.01" y2="16" />
                    </svg>
                    <span>Gender</span>
                    <span className="text-[10px] text-neutral-500 font-mono">• 1</span>
                  </div>
                  <svg
                    className={`w-3.5 h-3.5 text-neutral-400 transition-transform ${
                      expandedSection === 'gender' ? 'rotate-180' : ''
                    }`}
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <polyline points="6 9 12 15 18 9" />
                  </svg>
                </button>

                {expandedSection === 'gender' && (
                  <div className="grid grid-cols-2 gap-1.5 pt-1 animate-fade-in">
                    {[
                      {
                        id: 'Female',
                        label: 'Female',
                        icon: (
                          <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                            <circle cx="12" cy="9" r="5" />
                            <line x1="12" y1="14" x2="12" y2="21" />
                            <line x1="8.5" y1="17.5" x2="15.5" y2="17.5" />
                          </svg>
                        ),
                      },
                      {
                        id: 'Male',
                        label: 'Male',
                        icon: (
                          <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                            <circle cx="9.5" cy="14.5" r="5" />
                            <line x1="13" y1="11" x2="20" y2="4" />
                            <polyline points="14 4 20 4 20 10" />
                          </svg>
                        ),
                      },
                      {
                        id: 'Trans man',
                        label: 'Trans man',
                        icon: (
                          <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                            <circle cx="10" cy="14" r="4.5" />
                            <line x1="13.5" y1="10.5" x2="20" y2="4" />
                            <polyline points="15 4 20 4 20 9" />
                            <line x1="15" y1="11" x2="18.5" y2="7.5" />
                          </svg>
                        ),
                      },
                      {
                        id: 'Trans woman',
                        label: 'Trans woman',
                        icon: (
                          <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                            <circle cx="12" cy="8.5" r="4.5" />
                            <line x1="12" y1="13" x2="12" y2="21" />
                            <line x1="8.5" y1="17" x2="15.5" y2="17" />
                            <line x1="9.5" y1="14.5" x2="14.5" y2="14.5" />
                          </svg>
                        ),
                      },
                      {
                        id: 'Non-binary',
                        label: 'Non-binary',
                        icon: (
                          <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                            <circle cx="12" cy="13.5" r="5" />
                            <line x1="12" y1="8.5" x2="12" y2="3.5" />
                            <line x1="9" y1="5.5" x2="15" y2="5.5" />
                          </svg>
                        ),
                      },
                    ].map((g) => (
                      <button
                        key={g.id}
                        onClick={() => setBuilderGender(g.id)}
                        className={`px-3 py-2 rounded-xl text-xs font-medium flex items-center justify-between transition-all cursor-pointer ${
                          builderGender === g.id
                            ? 'bg-[#d1fe17] text-black font-bold shadow-md'
                            : 'bg-white/5 text-neutral-300 hover:text-white hover:bg-white/10 border border-white/5'
                        }`}
                      >
                        <span>{g.label}</span>
                        <span className="shrink-0 opacity-80">{g.icon}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* 3. Ethnicity / Origin Base */}
              <div className="p-4 space-y-2.5">
                <button
                  onClick={() => setExpandedSection(expandedSection === 'ethnicity' ? '' : 'ethnicity')}
                  className="w-full flex items-center justify-between text-xs font-semibold text-neutral-200 hover:text-white transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-2">
                    <svg className="w-3.5 h-3.5 text-neutral-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="12" cy="12" r="10" />
                      <line x1="2" y1="12" x2="22" y2="12" />
                      <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
                    </svg>
                    <span>Ethnicity / Origin Base</span>
                  </div>
                  <svg
                    className={`w-3.5 h-3.5 text-neutral-400 transition-transform ${
                      expandedSection === 'ethnicity' ? 'rotate-180' : ''
                    }`}
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <polyline points="6 9 12 15 18 9" />
                  </svg>
                </button>

                {expandedSection === 'ethnicity' && (
                  <div className="flex flex-wrap gap-1.5 pt-1 animate-fade-in">
                    {[
                      'Mediterranean / Levantine',
                      'Caucasian',
                      'Middle Eastern',
                      'Latina',
                      'East Asian',
                      'South Asian',
                      'African',
                    ].map((eth) => (
                      <button
                        key={eth}
                        onClick={() => setBuilderEthnicity(eth)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all cursor-pointer ${
                          builderEthnicity === eth
                            ? 'bg-[#d1fe17] text-black font-bold'
                            : 'bg-white/5 text-neutral-300 hover:text-white hover:bg-white/10'
                        }`}
                      >
                        {eth}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* 4. Skin Color */}
              <div className="p-4 space-y-2.5">
                <button
                  onClick={() => setExpandedSection(expandedSection === 'skin' ? '' : 'skin')}
                  className="w-full flex items-center justify-between text-xs font-semibold text-neutral-200 hover:text-white transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-[#C89D7C] border border-white/20" />
                    <span>Skin Color</span>
                  </div>
                  <svg
                    className={`w-3.5 h-3.5 text-neutral-400 transition-transform ${
                      expandedSection === 'skin' ? 'rotate-180' : ''
                    }`}
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <polyline points="6 9 12 15 18 9" />
                  </svg>
                </button>

                {expandedSection === 'skin' && (
                  <div className="flex flex-wrap gap-1.5 pt-1 animate-fade-in">
                    {[
                      { name: 'Warm Golden-Olive', hex: '#C89D7C' },
                      { name: 'Fair Porcelain', hex: '#F2D6C4' },
                      { name: 'Warm Tan', hex: '#B87B56' },
                      { name: 'Rich Deep Bronze', hex: '#784421' },
                      { name: 'Olive Radiance', hex: '#A87C51' },
                      { name: 'Neutral Beige', hex: '#DFB897' },
                    ].map((c) => (
                      <button
                        key={c.name}
                        onClick={() => setBuilderSkinColor(c.name)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-medium flex items-center gap-2 transition-all cursor-pointer ${
                          builderSkinColor === c.name
                            ? 'bg-[#d1fe17] text-black font-bold'
                            : 'bg-white/5 text-neutral-300 hover:text-white hover:bg-white/10'
                        }`}
                      >
                        <span
                          className="w-2.5 h-2.5 rounded-full border border-black/20 shrink-0"
                          style={{ backgroundColor: c.hex }}
                        />
                        <span>{c.name}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* 5. Eye Color */}
              <div className="p-4 space-y-2.5">
                <button
                  onClick={() => setExpandedSection(expandedSection === 'eyes' ? '' : 'eyes')}
                  className="w-full flex items-center justify-between text-xs font-semibold text-neutral-200 hover:text-white transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-[#2C1D11] border border-white/20" />
                    <span>Eye Color</span>
                  </div>
                  <svg
                    className={`w-3.5 h-3.5 text-neutral-400 transition-transform ${
                      expandedSection === 'eyes' ? 'rotate-180' : ''
                    }`}
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <polyline points="6 9 12 15 18 9" />
                  </svg>
                </button>

                {expandedSection === 'eyes' && (
                  <div className="flex flex-wrap gap-1.5 pt-1 animate-fade-in">
                    {[
                      { name: 'Deep Espresso Dark Brown', hex: '#2C1D11' },
                      { name: 'Hazel Warm', hex: '#7A5C2B' },
                      { name: 'Emerald Green', hex: '#2D5A3C' },
                      { name: 'Deep Amber', hex: '#A35B16' },
                      { name: 'Sapphire Blue', hex: '#2B4A6F' },
                    ].map((e) => (
                      <button
                        key={e.name}
                        onClick={() => setBuilderEyeColor(e.name)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-medium flex items-center gap-2 transition-all cursor-pointer ${
                          builderEyeColor === e.name
                            ? 'bg-[#d1fe17] text-black font-bold'
                            : 'bg-white/5 text-neutral-300 hover:text-white hover:bg-white/10'
                        }`}
                      >
                        <span
                          className="w-2.5 h-2.5 rounded-full border border-black/20 shrink-0"
                          style={{ backgroundColor: e.hex }}
                        />
                        <span>{e.name}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* 6. Age Bracket */}
              <div className="p-4 space-y-2.5">
                <div className="flex items-center justify-between text-xs font-semibold text-neutral-200">
                  <div className="flex items-center gap-2">
                    <svg className="w-3.5 h-3.5 text-neutral-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                      <line x1="16" y1="2" x2="16" y2="6" />
                      <line x1="8" y1="2" x2="8" y2="6" />
                      <line x1="3" y1="10" x2="21" y2="10" />
                    </svg>
                    <span>Age Bracket</span>
                  </div>
                  <span className="font-mono text-[#d1fe17] font-bold">{builderAge} Years</span>
                </div>
                <input
                  type="range"
                  min="18"
                  max="60"
                  value={builderAge}
                  onChange={(e) => setBuilderAge(Number(e.target.value))}
                  className="w-full accent-[#d1fe17] cursor-pointer"
                />
              </div>

              {/* 7. Advanced Settings (Face / Body / Style tabs) */}
              <div className="p-4 space-y-3">
                <div className="flex items-center justify-between text-xs font-semibold text-neutral-200">
                  <div className="flex items-center gap-2">
                    <svg className="w-3.5 h-3.5 text-neutral-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="12" cy="12" r="3" />
                      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
                    </svg>
                    <span>Advanced settings</span>
                  </div>
                </div>

                {/* 3 Icon Tabs matching Higgsfield Web Creating an AI influencer */}
                <div className="grid grid-cols-3 gap-2">
                  <button
                    onClick={() => setAdvancedTab('face')}
                    className={`p-2.5 rounded-xl border flex flex-col items-center justify-center gap-1 transition-all cursor-pointer ${
                      advancedTab === 'face'
                        ? 'border-white bg-white/10 text-white'
                        : 'border-white/10 bg-white/[0.02] text-neutral-400 hover:text-white'
                    }`}
                  >
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="12" cy="12" r="10" />
                      <line x1="9" y1="9" x2="9.01" y2="9" />
                      <line x1="15" y1="9" x2="15.01" y2="9" />
                      <path d="M8 15s1.5 2 4 2 4-2 4-2" />
                    </svg>
                    <span className="text-[10px] font-bold">Face</span>
                  </button>

                  <button
                    onClick={() => setAdvancedTab('body')}
                    className={`p-2.5 rounded-xl border flex flex-col items-center justify-center gap-1 transition-all cursor-pointer ${
                      advancedTab === 'body'
                        ? 'border-white bg-white/10 text-white'
                        : 'border-white/10 bg-white/[0.02] text-neutral-400 hover:text-white'
                    }`}
                  >
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                    </svg>
                    <span className="text-[10px] font-bold">Body</span>
                  </button>

                  <button
                    onClick={() => setAdvancedTab('style')}
                    className={`p-2.5 rounded-xl border flex flex-col items-center justify-center gap-1 transition-all cursor-pointer ${
                      advancedTab === 'style'
                        ? 'border-white bg-white/10 text-white'
                        : 'border-white/10 bg-white/[0.02] text-neutral-400 hover:text-white'
                    }`}
                  >
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                    </svg>
                    <span className="text-[10px] font-bold">Style</span>
                  </button>
                </div>

                {/* Sub-settings */}
                <div className="pt-2 space-y-3 text-xs">
                  {advancedTab === 'face' && (
                    <div className="space-y-1.5 text-neutral-300">
                      <div className="flex items-center justify-between py-1 border-b border-white/5">
                        <span className="text-neutral-400">Eyes - Type</span>
                        <span className="font-semibold text-white">Almond Sculpted</span>
                      </div>
                      <div className="flex items-center justify-between py-1 border-b border-white/5">
                        <span className="text-neutral-400">Eyes - Details</span>
                        <span className="font-semibold text-white">Defined Lash Line</span>
                      </div>
                      <div className="flex items-center justify-between py-1 border-b border-white/5">
                        <span className="text-neutral-400">Mouth & Teeth</span>
                        <span className="font-semibold text-white">Full Satin Lips</span>
                      </div>
                      <div className="flex items-center justify-between py-1">
                        <span className="text-neutral-400">Face Skin Material</span>
                        <span className="font-semibold text-white">Visible Fine Pores</span>
                      </div>
                    </div>
                  )}

                  {advancedTab === 'body' && (
                    <div className="space-y-1.5 text-neutral-300">
                      <div className="flex items-center justify-between py-1 border-b border-white/5">
                        <span className="text-neutral-400">Build / Posture</span>
                        <span className="font-semibold text-white">5&apos;9&quot; Lean Athletic</span>
                      </div>
                      <div className="flex items-center justify-between py-1 border-b border-white/5">
                        <span className="text-neutral-400">Silhouettes</span>
                        <span className="font-semibold text-white">High Poise Executive</span>
                      </div>
                      <div className="flex items-center justify-between py-1">
                        <span className="text-neutral-400">Movement Flow</span>
                        <span className="font-semibold text-white">Fluid Confident</span>
                      </div>
                    </div>
                  )}

                  {advancedTab === 'style' && (
                    <div className="space-y-3">
                      {/* Accessories & Markings (5 Visual Cards) */}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-xs font-semibold text-neutral-200">
                          <span className="flex items-center gap-1.5">
                            <span>Accessories & Markings</span>
                            {selectedAccessory && <span className="text-[10px] text-[#d1fe17] font-mono">• 1</span>}
                          </span>
                          {selectedAccessory && (
                            <button
                              onClick={() => setSelectedAccessory(null)}
                              className="text-[10px] text-neutral-400 hover:text-white"
                            >
                              Clear
                            </button>
                          )}
                        </div>
                        <div className="grid grid-cols-3 gap-2">
                          {ACCESSORIES.map((acc) => {
                            const isSel = selectedAccessory === acc.id;
                            return (
                              <div
                                key={acc.id}
                                onClick={() => {
                                  setSelectedAccessory(isSel ? null : acc.id);
                                  showToast(isSel ? 'Removed accessory' : `Selected ${acc.name}`);
                                }}
                                className={`group relative aspect-[4/3] rounded-xl overflow-hidden cursor-pointer transition-all ${
                                  isSel
                                    ? 'border-2 border-[#d1fe17] bg-[#16161e]'
                                    : 'border border-white/10 hover:border-white/30 bg-[#121217]'
                                }`}
                              >
                                <img
                                  src={acc.image}
                                  alt={acc.name}
                                  className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent pointer-events-none" />
                                <span className="absolute bottom-1 left-1.5 right-1 text-[9px] font-bold text-white truncate pointer-events-none">
                                  {acc.name}
                                </span>
                                {isSel && (
                                  <div className="absolute top-1 right-1 w-3.5 h-3.5 rounded-full bg-[#d1fe17] text-black flex items-center justify-center shadow">
                                    <svg className="w-2 h-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5">
                                      <polyline points="20 6 9 17 4 12" />
                                    </svg>
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {/* Rendering Style (4 Visual Cards) */}
                      <div className="space-y-2 pt-2 border-t border-white/5">
                        <div className="flex items-center justify-between text-xs font-semibold text-neutral-200">
                          <span className="flex items-center gap-1.5">
                            <span>Rendering Style</span>
                            <span className="text-[10px] text-[#d1fe17] font-mono">• 1</span>
                          </span>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          {RENDERING_STYLES.map((style) => {
                            const isSel = selectedRenderingStyle === style.id;
                            return (
                              <div
                                key={style.id}
                                onClick={() => {
                                  setSelectedRenderingStyle(style.id);
                                  showToast(`Selected style: ${style.name}`);
                                }}
                                className={`group relative aspect-[4/3] rounded-xl overflow-hidden cursor-pointer transition-all ${
                                  isSel
                                    ? 'border-2 border-[#d1fe17] bg-[#16161e]'
                                    : 'border border-white/10 hover:border-white/30 bg-[#121217]'
                                }`}
                              >
                                <img
                                  src={style.image}
                                  alt={style.name}
                                  className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent pointer-events-none" />
                                <span className="absolute bottom-1.5 left-2 right-1 text-[10px] font-bold text-white truncate pointer-events-none">
                                  {style.name}
                                </span>
                                {isSel && (
                                  <div className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-[#d1fe17] text-black flex items-center justify-center shadow">
                                    <svg className="w-2.5 h-2.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5">
                                      <polyline points="20 6 9 17 4 12" />
                                    </svg>
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

            </div>
          </aside>
        </div>
      )}

      {/* =================================================================== */}
      {/* CHARACTER DETAILS MODAL MATCHING HIGGSFIELD WEB CHARACTER DETAILS 1 */}
      {/* =================================================================== */}
      {showDetailsModal && activeInfluencer && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-xl flex items-center justify-center p-4 sm:p-6 animate-fade-in">
          <div className="w-full max-w-5xl h-[88vh] rounded-3xl bg-[#0c0c10] border border-white/15 shadow-2xl flex flex-col md:flex-row overflow-hidden relative">
            
            {/* Left/Center Big Portrait Stage */}
            <div className="flex-1 bg-black/60 flex flex-col items-center justify-between p-6 relative overflow-hidden">
              <div className="relative flex-1 w-full max-w-md my-auto aspect-[3/4] rounded-2xl overflow-hidden shadow-2xl border border-white/10 flex items-center justify-center bg-black/40">
                <img
                  src={activeHeadshotUrl || '/images/archetypes/business-penthouse.png'}
                  alt={activeInfluencer.name}
                  style={{
                    filter: modalImageFilter,
                    transform: modalImageTransform,
                    transition: 'transform 0.15s ease-out, filter 0.2s ease',
                  }}
                  className="w-full h-full object-cover object-top select-none will-change-transform"
                />

                {/* Floating Active Tool Badge */}
                {activeDockTool !== 'overview' && (
                  <div className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-black/70 backdrop-blur-md border border-white/20 text-[#d1fe17] text-[10px] font-bold uppercase tracking-wider shadow flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#d1fe17] animate-pulse" />
                    <span>{activeDockTool} active</span>
                  </div>
                )}
              </div>

              {/* Interactive Studio Tool Drawer (When tool selected) */}
              {activeDockTool === 'color' && (
                <div className="w-full max-w-xl p-3 rounded-2xl bg-[#14141c]/95 border border-white/15 backdrop-blur-md mb-2 space-y-2.5 animate-fade-in shrink-0">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white flex items-center gap-1.5">
                      <span>Color Grading Presets</span>
                      <span className="text-[9px] px-1.5 py-0.2 rounded bg-[#d1fe17] text-black font-extrabold uppercase">Live</span>
                    </span>
                    <button
                      onClick={() => {
                        setColorGradePreset('none');
                        setColorExposure(100);
                        setColorContrast(100);
                        setColorWarmth(0);
                        setColorSaturation(100);
                        showToast('Reset color grade');
                      }}
                      className="text-[10px] text-neutral-400 hover:text-white transition-colors"
                    >
                      Reset
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {[
                      { id: 'none', label: 'Original' },
                      { id: 'cinematic', label: '35mm Film' },
                      { id: 'teal_orange', label: 'Teal & Orange' },
                      { id: 'kodachrome', label: 'Kodachrome' },
                      { id: 'noir', label: 'B&W Noir' },
                      { id: 'golden_hour', label: 'Golden Hour' },
                    ].map((p) => (
                      <button
                        key={p.id}
                        onClick={() => setColorGradePreset(p.id as any)}
                        className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all ${
                          colorGradePreset === p.id
                            ? 'bg-[#d1fe17] text-black font-bold shadow'
                            : 'bg-white/5 text-neutral-300 hover:text-white border border-white/10'
                        }`}
                      >
                        {p.label}
                      </button>
                    ))}
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 text-[10px] text-neutral-300">
                    <div>
                      <div className="flex justify-between mb-0.5"><span>Warmth</span><span>{colorWarmth}%</span></div>
                      <input type="range" min="0" max="60" value={colorWarmth} onChange={(e) => setColorWarmth(Number(e.target.value))} className="w-full accent-[#d1fe17] h-1" />
                    </div>
                    <div>
                      <div className="flex justify-between mb-0.5"><span>Contrast</span><span>{colorContrast}%</span></div>
                      <input type="range" min="80" max="140" value={colorContrast} onChange={(e) => setColorContrast(Number(e.target.value))} className="w-full accent-[#d1fe17] h-1" />
                    </div>
                    <div>
                      <div className="flex justify-between mb-0.5"><span>Saturation</span><span>{colorSaturation}%</span></div>
                      <input type="range" min="50" max="150" value={colorSaturation} onChange={(e) => setColorSaturation(Number(e.target.value))} className="w-full accent-[#d1fe17] h-1" />
                    </div>
                    <div>
                      <div className="flex justify-between mb-0.5"><span>Exposure</span><span>{colorExposure}%</span></div>
                      <input type="range" min="70" max="130" value={colorExposure} onChange={(e) => setColorExposure(Number(e.target.value))} className="w-full accent-[#d1fe17] h-1" />
                    </div>
                  </div>
                </div>
              )}

              {activeDockTool === 'relight' && (
                <div className="w-full max-w-xl p-3 rounded-2xl bg-[#14141c]/95 border border-white/15 backdrop-blur-md mb-2 space-y-2 animate-fade-in shrink-0">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white">3D Studio Relighting Direction</span>
                    <span className="text-[10px] text-neutral-400">Position key & rim lights</span>
                  </div>
                  <div className="grid grid-cols-5 gap-1.5">
                    {[
                      { id: 'front', label: 'Front Fill' },
                      { id: 'top', label: 'Top Overhead' },
                      { id: 'key_left', label: 'Left Key' },
                      { id: 'rim_right', label: 'Right Rim' },
                      { id: 'backlight', label: 'Back Halo' },
                    ].map((light) => (
                      <button
                        key={light.id}
                        onClick={() => {
                          setRelightDirection(light.id as any);
                          showToast(`Relit with ${light.label}`);
                        }}
                        className={`p-2 rounded-xl text-[11px] font-semibold text-center transition-all ${
                          relightDirection === light.id
                            ? 'bg-[#d1fe17] text-black shadow-lg'
                            : 'bg-white/5 text-neutral-300 hover:text-white border border-white/10'
                        }`}
                      >
                        {light.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {activeDockTool === 'angles' && (
                <div className="w-full max-w-xl p-3 rounded-2xl bg-[#14141c]/95 border border-white/15 backdrop-blur-md mb-2 space-y-2 animate-fade-in shrink-0">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white">3D Camera Turnaround & Pitch</span>
                    <button
                      onClick={() => {
                        setAngleYaw(0);
                        setAnglePitch(0);
                        setAngleZoom(100);
                        showToast('Reset camera angle');
                      }}
                      className="text-[10px] text-neutral-400 hover:text-white"
                    >
                      Reset
                    </button>
                  </div>
                  <div className="grid grid-cols-3 gap-3 text-[10px] text-neutral-300">
                    <div>
                      <div className="flex justify-between mb-0.5"><span>Yaw (Pan)</span><span>{angleYaw}°</span></div>
                      <input type="range" min="-30" max="30" value={angleYaw} onChange={(e) => setAngleYaw(Number(e.target.value))} className="w-full accent-[#d1fe17] h-1" />
                    </div>
                    <div>
                      <div className="flex justify-between mb-0.5"><span>Pitch (Tilt)</span><span>{anglePitch}°</span></div>
                      <input type="range" min="-20" max="20" value={anglePitch} onChange={(e) => setAnglePitch(Number(e.target.value))} className="w-full accent-[#d1fe17] h-1" />
                    </div>
                    <div>
                      <div className="flex justify-between mb-0.5"><span>Zoom</span><span>{angleZoom}%</span></div>
                      <input type="range" min="90" max="130" value={angleZoom} onChange={(e) => setAngleZoom(Number(e.target.value))} className="w-full accent-[#d1fe17] h-1" />
                    </div>
                  </div>
                </div>
              )}

              {activeDockTool === 'upscale' && (
                <div className="w-full max-w-xl p-3 rounded-2xl bg-[#14141c]/95 border border-white/15 backdrop-blur-md mb-2 flex items-center justify-between animate-fade-in shrink-0">
                  <div>
                    <h4 className="text-xs font-bold text-white">Resolution Upscaling</h4>
                    <p className="text-[10px] text-neutral-400">Preserves microscopic pores, skin translucency and fiber details</p>
                  </div>
                  <div className="flex items-center gap-1.5">
                    {(['2K', '4K', '8K'] as const).map((fac) => (
                      <button
                        key={fac}
                        onClick={() => {
                          setUpscaleFactor(fac);
                          showToast(`Upscale target: ${fac}`);
                        }}
                        className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition-all ${
                          upscaleFactor === fac
                            ? 'bg-[#d1fe17] text-black shadow-md'
                            : 'bg-white/5 text-neutral-300 hover:text-white border border-white/10'
                        }`}
                      >
                        {fac}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {activeDockTool === 'enhancer' && (
                <div className="w-full max-w-xl p-3 rounded-2xl bg-[#14141c]/95 border border-white/15 backdrop-blur-md mb-2 flex items-center justify-between gap-4 animate-fade-in shrink-0">
                  <div className="flex-1">
                    <div className="flex justify-between text-xs font-bold text-white mb-1">
                      <span>Face & Iris Enhancer</span>
                      <span className="font-mono text-[#d1fe17]">{enhancerLevel}%</span>
                    </div>
                    <input
                      type="range"
                      min="50"
                      max="100"
                      value={enhancerLevel}
                      onChange={(e) => setEnhancerLevel(Number(e.target.value))}
                      className="w-full accent-[#d1fe17] h-1.5"
                    />
                  </div>
                  <button
                    onClick={() => showToast(`Facial enhancer set to ${enhancerLevel}%`)}
                    className="px-3 py-2 rounded-xl bg-[#d1fe17] text-black font-extrabold text-[11px] hover:bg-[#bce414] transition-colors"
                  >
                    Apply
                  </button>
                </div>
              )}

              {activeDockTool === 'inpaint' && (
                <div className="w-full max-w-xl p-3 rounded-2xl bg-[#14141c]/95 border border-white/15 backdrop-blur-md mb-2 flex items-center justify-between gap-3 animate-fade-in shrink-0">
                  <div>
                    <h4 className="text-xs font-bold text-white">Smart Inpaint Brush</h4>
                    <p className="text-[10px] text-neutral-400">Brush over garments, jewelry or background to swap elements</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => showToast('Inpaint brush activated')}
                      className="px-3 py-1.5 rounded-xl bg-white/10 text-white font-bold text-xs hover:bg-white/20 transition-colors"
                    >
                      Brush Size: 24px
                    </button>
                    <button
                      onClick={() => showToast('Mask cleared')}
                      className="px-3 py-1.5 rounded-xl bg-rose-500/20 text-rose-400 font-bold text-xs hover:bg-rose-500/30 transition-colors"
                    >
                      Clear
                    </button>
                  </div>
                </div>
              )}

              {/* Bottom Dock: Overview, Color Grading, Upscale, Enhancer, Relight, Inpaint, Angles */}
              <div className="w-full max-w-xl flex items-center justify-center gap-1.5 p-1.5 rounded-2xl bg-[#16161e]/90 border border-white/10 backdrop-blur-md mt-2 overflow-x-auto no-scrollbar shrink-0">
                <button
                  onClick={() => setActiveDockTool('overview')}
                  className={`px-3 py-1.5 rounded-xl font-bold text-xs shrink-0 transition-all ${
                    activeDockTool === 'overview'
                      ? 'bg-white/20 text-white'
                      : 'text-neutral-400 hover:text-white'
                  }`}
                >
                  Overview
                </button>
                <button
                  onClick={() => setActiveDockTool(activeDockTool === 'color' ? 'overview' : 'color')}
                  className={`px-3 py-1.5 rounded-xl font-medium text-xs shrink-0 flex items-center gap-1 transition-all ${
                    activeDockTool === 'color'
                      ? 'bg-[#d1fe17] text-black font-extrabold shadow'
                      : 'text-neutral-400 hover:text-white'
                  }`}
                >
                  <span>Color Grading</span>
                  <span className={`text-[9px] px-1 py-0.2 rounded font-bold ${activeDockTool === 'color' ? 'bg-black text-[#d1fe17]' : 'bg-[#d1fe17] text-black'}`}>New</span>
                </button>
                <button
                  onClick={() => setActiveDockTool(activeDockTool === 'upscale' ? 'overview' : 'upscale')}
                  className={`px-3 py-1.5 rounded-xl font-medium text-xs shrink-0 transition-all ${
                    activeDockTool === 'upscale'
                      ? 'bg-[#d1fe17] text-black font-extrabold shadow'
                      : 'text-neutral-400 hover:text-white'
                  }`}
                >
                  Upscale
                </button>
                <button
                  onClick={() => setActiveDockTool(activeDockTool === 'enhancer' ? 'overview' : 'enhancer')}
                  className={`px-3 py-1.5 rounded-xl font-medium text-xs shrink-0 transition-all ${
                    activeDockTool === 'enhancer'
                      ? 'bg-[#d1fe17] text-black font-extrabold shadow'
                      : 'text-neutral-400 hover:text-white'
                  }`}
                >
                  Enhancer
                </button>
                <button
                  onClick={() => setActiveDockTool(activeDockTool === 'relight' ? 'overview' : 'relight')}
                  className={`px-3 py-1.5 rounded-xl font-medium text-xs shrink-0 transition-all ${
                    activeDockTool === 'relight'
                      ? 'bg-[#d1fe17] text-black font-extrabold shadow'
                      : 'text-neutral-400 hover:text-white'
                  }`}
                >
                  Relight
                </button>
                <button
                  onClick={() => setActiveDockTool(activeDockTool === 'inpaint' ? 'overview' : 'inpaint')}
                  className={`px-3 py-1.5 rounded-xl font-medium text-xs shrink-0 transition-all ${
                    activeDockTool === 'inpaint'
                      ? 'bg-[#d1fe17] text-black font-extrabold shadow'
                      : 'text-neutral-400 hover:text-white'
                  }`}
                >
                  Inpaint
                </button>
                <button
                  onClick={() => setActiveDockTool(activeDockTool === 'angles' ? 'overview' : 'angles')}
                  className={`px-3 py-1.5 rounded-xl font-medium text-xs shrink-0 transition-all ${
                    activeDockTool === 'angles'
                      ? 'bg-[#d1fe17] text-black font-extrabold shadow'
                      : 'text-neutral-400 hover:text-white'
                  }`}
                >
                  Angles
                </button>
              </div>
            </div>

            {/* Right Information & Action Panel */}
            <div className="w-full md:w-80 lg:w-96 border-t md:border-t-0 md:border-l border-white/10 bg-[#0e0e13] p-6 flex flex-col justify-between shrink-0 h-full overflow-y-auto no-scrollbar">
              <div className="space-y-6">
                {/* Author Header */}
                <div className="flex items-center justify-between pb-4 border-b border-white/10">
                  <div className="flex items-center gap-3">
                    <img
                      src="/images/baha/baha-avatar.jpg"
                      alt="Baha Savage"
                      className="w-10 h-10 rounded-full object-cover border border-white/20"
                    />
                    <div>
                      <h4 className="text-xs font-bold text-white">bahasavage</h4>
                      <span className="text-[10px] text-neutral-400">Author • Verified Soul ID</span>
                    </div>
                  </div>

                  <button
                    onClick={() => setShowDetailsModal(false)}
                    className="p-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-neutral-400 hover:text-white transition-colors cursor-pointer"
                  >
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <line x1="18" y1="6" x2="6" y2="18" />
                      <line x1="6" y1="12" x2="18" y2="12" />
                    </svg>
                  </button>
                </div>

                {/* Details / Comments Tabs */}
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setDetailsTab('details')}
                    className={`text-xs font-bold pb-1 transition-all ${
                      detailsTab === 'details'
                        ? 'text-white border-b-2 border-[#d1fe17]'
                        : 'text-neutral-400 hover:text-white'
                    }`}
                  >
                    Details
                  </button>
                  <button
                    onClick={() => setDetailsTab('comments')}
                    className={`text-xs font-bold pb-1 transition-all ${
                      detailsTab === 'comments'
                        ? 'text-white border-b-2 border-[#d1fe17]'
                        : 'text-neutral-400 hover:text-white'
                    }`}
                  >
                    Comments
                  </button>
                </div>

                {/* INFORMATION */}
                <div className="space-y-3">
                  <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider block">
                    INFORMATION
                  </span>

                  <div className="space-y-2 text-xs">
                    <div className="flex items-center justify-between py-1 border-b border-white/5">
                      <span className="text-neutral-400">Identity</span>
                      <span className="font-semibold text-white">{activeInfluencer.name}</span>
                    </div>
                    <div className="flex items-center justify-between py-1 border-b border-white/5">
                      <span className="text-neutral-400">Handle</span>
                      <span className="font-mono text-[#d1fe17]">{activeInfluencer.instagramHandle || '@bahasavage'}</span>
                    </div>
                    <div className="flex items-center justify-between py-1 border-b border-white/5">
                      <span className="text-neutral-400">Feature</span>
                      <span className="font-semibold text-white">AI Influencer</span>
                    </div>
                    <div className="flex items-center justify-between py-1 border-b border-white/5">
                      <span className="text-neutral-400">Quality</span>
                      <span className="font-mono text-white">2k Ultra-Res</span>
                    </div>
                    <div className="flex items-center justify-between py-1">
                      <span className="text-neutral-400">Cataloged Drops</span>
                      <span className="font-mono text-white">{vaultItems.length || 1604}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons Section */}
              <div className="pt-6 space-y-3">
                {/* Big Motion CTA */}
                <button
                  onClick={() => {
                    showToast('Opening Motion studio with Seedance 2.0...');
                    setTimeout(() => showToast('Motion clip ready to render!'), 1500);
                  }}
                  className="w-full py-3 rounded-2xl bg-[#d1fe17] text-black font-extrabold text-xs shadow-xl flex items-center justify-center gap-2 hover:bg-[#bce414] active:scale-95 transition-all cursor-pointer"
                >
                  <svg className="w-4 h-4 fill-black" viewBox="0 0 24 24">
                    <polygon points="5 3 19 12 5 21 5 3" />
                  </svg>
                  <span>Motion</span>
                </button>

                {/* 2x2 Grid of Actions */}
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => showToast('Animation engine initialized')}
                    className="py-2 px-3 rounded-xl bg-white/5 hover:bg-white/10 text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polygon points="23 7 16 12 23 17 23 7" />
                      <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
                    </svg>
                    <span>Animate</span>
                  </button>

                  <button
                    onClick={() => showToast('Recreating character seed...')}
                    className="py-2 px-3 rounded-xl bg-white/5 hover:bg-white/10 text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0 1 18.8-4.3M22 12.5a10 10 0 0 1-18.8 4.2" />
                    </svg>
                    <span>Recreate</span>
                  </button>

                  <button
                    onClick={() => {
                      setShowDetailsModal(false);
                      setViewMode('photoshoots');
                    }}
                    className="py-2 px-3 rounded-xl bg-white/5 hover:bg-white/10 text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="3" y="3" width="7" height="7" />
                      <rect x="14" y="3" width="7" height="7" />
                      <rect x="14" y="14" width="7" height="7" />
                      <rect x="3" y="14" width="7" height="7" />
                    </svg>
                    <span>Open in</span>
                  </button>

                  <button
                    onClick={() => showToast('Character locked as reference')}
                    className="py-2 px-3 rounded-xl bg-white/5 hover:bg-white/10 text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="3" y="3" width="18" height="18" rx="2" />
                      <circle cx="8.5" cy="8.5" r="1.5" />
                      <polyline points="21 15 16 10 5 21" />
                    </svg>
                    <span>Reference</span>
                  </button>
                </div>

                {/* Bottom Row */}
                <div className="flex items-center justify-between pt-2">
                  <button
                    onClick={() => showToast('Download started')}
                    className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                      <polyline points="7 10 12 15 17 10" />
                      <line x1="12" y1="15" x2="12" y2="3" />
                    </svg>
                    <span>Download</span>
                  </button>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => showToast('Saved to favorites')}
                      className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-white transition-colors cursor-pointer"
                    >
                      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                      </svg>
                    </button>
                    <button
                      onClick={() => showToast('Share link copied to clipboard')}
                      className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-white transition-colors cursor-pointer"
                    >
                      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="18" cy="5" r="3" />
                        <circle cx="6" cy="12" r="3" />
                        <circle cx="18" cy="19" r="3" />
                        <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
                        <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* =================================================================== */}
      {/* RESPONSIBLE USE POLICY MODAL (HIGGSFIELD CREATING AN AI INFLUENCER 7) */}
      {/* =================================================================== */}
      {showPolicyModal && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in">
          <div className="w-full max-w-lg rounded-3xl bg-[#121217] border border-white/15 p-6 sm:p-7 shadow-2xl space-y-5 animate-scale-in">
            <div className="space-y-1">
              <h3 className="text-lg font-black text-white tracking-wide">
                Responsible Use Policy
              </h3>
              <p className="text-xs font-semibold text-[#d1fe17] uppercase tracking-wider">
                Before you start creating
              </p>
            </div>

            <div className="space-y-3 text-xs text-neutral-300 leading-relaxed bg-white/[0.02] p-4 rounded-2xl border border-white/5">
              <p>
                Laws governing synthetic media vary by country, state, and platform, and may be stricter for advertising, endorsements, or content depicting real individuals.
              </p>
              <p>
                If your AI-generated content could reasonably be mistaken for real footage, disclose it clearly: in your caption, on-screen, or both. It&apos;s your responsibility to know and follow the rules that apply where you publish.
              </p>
            </div>

            {/* Checkbox */}
            <label className="flex items-start gap-3 cursor-pointer group select-none pt-1">
              <div className="relative flex items-center justify-center mt-0.5">
                <input
                  type="checkbox"
                  checked={policyCheckbox}
                  onChange={(e) => setPolicyCheckbox(e.target.checked)}
                  className="sr-only"
                />
                <div
                  className={`w-5 h-5 rounded-lg border transition-all flex items-center justify-center ${
                    policyCheckbox
                      ? 'bg-[#d1fe17] border-[#d1fe17] text-black shadow-[0_0_10px_rgba(209,254,23,0.3)]'
                      : 'border-white/30 bg-white/5 group-hover:border-white/50'
                  }`}
                >
                  {policyCheckbox && (
                    <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  )}
                </div>
              </div>
              <span className="text-xs text-neutral-200 group-hover:text-white transition-colors leading-snug">
                I understand and accept responsibility for the content I create
              </span>
            </label>

            {/* Buttons */}
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/10">
              <button
                onClick={() => setShowPolicyModal(false)}
                className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-neutral-300 hover:text-white text-xs font-bold transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handlePolicyConfirm}
                disabled={!policyCheckbox}
                className={`px-5 py-2 rounded-xl text-xs font-extrabold transition-all ${
                  policyCheckbox
                    ? 'bg-[#d1fe17] text-black hover:bg-[#bce414] shadow-lg cursor-pointer'
                    : 'bg-white/10 text-neutral-500 cursor-not-allowed'
                }`}
              >
                I agree, continue
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
