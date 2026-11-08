import React, { useState, useEffect, useMemo } from 'react';
import { VaultItem } from '../types';
import { InfluencerStore, BAHA_SAVAGE } from '../services/influencerStore';
import consolidatedData from '../data/consolidatedInfluencers.json';

interface InfluencerScreenProps {
  vaultItems: VaultItem[];
  onSelectInfluencerDrops?: (dropIds: string[], influencerName: string) => void;
  onOpenPromptVault?: () => void;
  onSelectVideoStudio?: () => void;
}

export interface InfluencerCharacter {
  id: string;
  name: string;
  handle: string;
  type: string;
  gender: string;
  build: string;
  hairstyle: string;
  hairColor: string;
  style: string;
  ethnicity: string;
  age: string;
  skinColor: string;
  imageUrl: string;
  prompt: string;
  dropsCount: number;
  category: string;
  isOfficial?: boolean;
}

const CHARACTER_TYPES = [
  { id: 'average', name: 'Average', icon: '/images/influencer-dashboard/types/average_face.png' },
  { id: 'bold', name: 'Bold', icon: '/images/influencer-dashboard/types/bold_face.png' },
  { id: 'extreme', name: 'Extreme', icon: '/images/influencer-dashboard/types/extreme_face.png' },
  { id: 'insect', name: 'Insect', icon: '/images/influencer-dashboard/types/insect_face.png' },
  { id: 'frog', name: 'Frog', icon: '/images/influencer-dashboard/types/frog_face.png' },
  { id: 'cat', name: 'Cat', icon: '/images/influencer-dashboard/types/cat_face.png' },
  { id: 'dog', name: 'Dog', icon: '/images/influencer-dashboard/types/dog_face.png' },
  { id: 'rodent', name: 'Rodent', icon: '/images/influencer-dashboard/types/rodent_face.png' },
  { id: 'bird', name: 'Bird', icon: '/images/influencer-dashboard/types/bird_face.png' },
];

const GENDERS = ['Female', 'Male', 'Non-binary', 'Androgynous', 'Fluid'];
const BUILDS = ['Athletic', 'Muscular', 'Slim', 'Curvy', 'Heavy', 'Petite', 'Broad'];
const HAIRSTYLES = [
  'Long Dark Waves', 'Sleek Straight Part', 'Chignon & Updo', 'Voluminous Blowout', 
  'Textured Waves', 'High Ponytail', 'Bob Cut', 'Pixie Crop', 'Afro Volume', 
  'Mustache Mullet', 'High Fade', 'Curtain Bangs', 'Braids & Cornrows', 'Buzz Cut'
];
const HAIR_COLORS = [
  'Dark Chocolate Brown', 'Jet Black', 'Warm Auburn', 'Honey Caramel', 
  'Platinum Blonde', 'Ash Brown', 'Burgundy Wine', 'Golden Hazel'
];
const STYLES = [
  'Quiet Luxury & Sovereign Tailoring', 'Dubai Nightlife & Flash', 'Luxury Penthouse Silk', 
  'Aesthetic Cafe & Wellness', 'Architectural Modernist', 'Haute Couture Evening', 
  'Travel & Resort Minimalist', 'High-Fashion Streetwear'
];
const ETHNICITIES = [
  'Mediterranean / Levantine', 'Middle Eastern', 'South Asian', 'East Asian', 
  'African / Black', 'Caucasian', 'Hispanic / Latino'
];
const AGES = ['Young Adult (18-25)', 'Prime Adult (26-35)', 'Mature (36-50)'];
const SKIN_COLORS = [
  'Warm Golden-Olive', 'Sun-Kissed Honey', 'Warm Ivory', 'Porcelain Fair', 
  'Rich Bronze', 'Warm Caramel', 'Deep Espresso', 'Ebony Luminous'
];

const MOTION_PRESETS = [
  { id: 'catwalk', name: 'Haute Catwalk Stroll', speed: 'Fluid Pace', description: 'Runway poise with natural posture and direct camera engagement' },
  { id: 'selfie', name: 'Mirror Turn & Pose', speed: 'Social Pace', description: 'Editorial candid turn with subtle head tilt and gentle smile' },
  { id: 'walking', name: 'Metropolitan Walk', speed: 'Cinematic Pace', description: 'Urban avenue tracking movement with natural fabric drift' },
  { id: 'headtilt', name: '3D Portrait Angle', speed: 'Slow Motion', description: 'Smooth facial turn showcasing jawline contour and lighting shifts' },
  { id: 'dance', name: 'Rhythmic Subtle Motion', speed: 'Dynamic Pace', description: 'Subtle rhythmic movement ideal for social clips' },
  { id: 'zoom', name: '35mm Push-In', speed: 'Editorial', description: 'Gradual focal push-in accentuating eye detail and makeup contour' },
];

// Real influencers from consolidated vault data
const REAL_INFLUENCERS: InfluencerCharacter[] = [
  {
    id: BAHA_SAVAGE.id,
    name: BAHA_SAVAGE.name,
    handle: BAHA_SAVAGE.instagramHandle || '@bahasavage',
    type: 'Extreme',
    gender: 'Female',
    build: 'Athletic',
    hairstyle: 'Long Dark Waves',
    hairColor: 'Dark Chocolate Brown',
    style: 'Quiet Luxury & Sovereign Tailoring',
    ethnicity: 'Mediterranean / Levantine',
    age: 'Prime Adult (26-35)',
    skinColor: 'Warm Golden-Olive',
    imageUrl: BAHA_SAVAGE.referenceImage,
    prompt: BAHA_SAVAGE.signaturePrompt,
    dropsCount: 1604,
    category: BAHA_SAVAGE.category,
    isOfficial: true,
  },
  ...consolidatedData.influencers.map((inf) => ({
    id: inf.id,
    name: inf.name,
    handle: `@${inf.name.toLowerCase().replace(/[^a-z]/g, '')}`,
    type: 'Bold',
    gender: 'Female',
    build: 'Slim',
    hairstyle: inf.hair || 'Long Dark Waves',
    hairColor: 'Dark Chocolate Brown',
    style: inf.category,
    ethnicity: inf.ethnicity || 'Mediterranean / Levantine',
    age: 'Prime Adult (26-35)',
    skinColor: 'Warm Golden-Olive',
    imageUrl: inf.sampleImageUrl || inf.referenceImage,
    prompt: `Editorial fashion portrait of ${inf.name} in ${inf.category} styling, high-contrast studio illumination`,
    dropsCount: inf.dropsCount || 1,
    category: inf.category,
    isOfficial: true,
  })),
];

export const InfluencerScreen: React.FC<InfluencerScreenProps> = ({
  vaultItems,
  onSelectInfluencerDrops,
  onSelectVideoStudio,
}) => {
  // Navigation Tabs: 'explore' | 'history'
  const [activeView, setActiveView] = useState<'explore' | 'history'>('explore');

  // Left Sidebar Mode: 'create' | 'motion'
  const [sidebarMode, setSidebarMode] = useState<'create' | 'motion'>('create');

  // Filter pills under hero
  const [activeFilter, setActiveFilter] = useState<'all' | 'presets' | 'trends'>('all');

  // Accordion Expand/Collapse states
  const [expandedSection, setExpandedSection] = useState<string>('type');

  // Builder Form Selections (persisted in localStorage)
  const [selectedType, setSelectedType] = useState<string>(() => {
    try {
      return localStorage.getItem('hf_inf_type') || 'extreme';
    } catch {
      return 'extreme';
    }
  });

  const [selectedGender, setSelectedGender] = useState<string>(() => {
    try {
      return localStorage.getItem('hf_inf_gender') || 'Female';
    } catch {
      return 'Female';
    }
  });

  const [selectedBuild, setSelectedBuild] = useState<string>(() => {
    try {
      return localStorage.getItem('hf_inf_build') || 'Athletic';
    } catch {
      return 'Athletic';
    }
  });

  const [selectedHairstyle, setSelectedHairstyle] = useState<string>(() => {
    try {
      return localStorage.getItem('hf_inf_hairstyle') || 'Long Dark Waves';
    } catch {
      return 'Long Dark Waves';
    }
  });

  const [selectedHairColor, setSelectedHairColor] = useState<string>(() => {
    try {
      return localStorage.getItem('hf_inf_haircolor') || 'Dark Chocolate Brown';
    } catch {
      return 'Dark Chocolate Brown';
    }
  });

  const [selectedStyle, setSelectedStyle] = useState<string>(() => {
    try {
      return localStorage.getItem('hf_inf_style') || 'Quiet Luxury & Sovereign Tailoring';
    } catch {
      return 'Quiet Luxury & Sovereign Tailoring';
    }
  });

  const [selectedEthnicity, setSelectedEthnicity] = useState<string>(() => {
    try {
      return localStorage.getItem('hf_inf_ethnicity') || 'Mediterranean / Levantine';
    } catch {
      return 'Mediterranean / Levantine';
    }
  });

  const [selectedAge, setSelectedAge] = useState<string>(() => {
    try {
      return localStorage.getItem('hf_inf_age') || 'Prime Adult (26-35)';
    } catch {
      return 'Prime Adult (26-35)';
    }
  });

  const [selectedSkinColor, setSelectedSkinColor] = useState<string>(() => {
    try {
      return localStorage.getItem('hf_inf_skincolor') || 'Warm Golden-Olive';
    } catch {
      return 'Warm Golden-Olive';
    }
  });

  const [useFreeGens, setUseFreeGens] = useState<boolean>(true);
  const [freeGensRemaining, setFreeGensRemaining] = useState<number>(15);

  // Selected motion preset
  const [selectedMotion, setSelectedMotion] = useState<string>('catwalk');

  // Generating & Progress State
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [generationProgress, setGenerationProgress] = useState<number>(0);

  // Toast feedback
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Inspect Modal
  const [inspectCharacter, setInspectCharacter] = useState<InfluencerCharacter | null>(null);

  // User Influencers Collection from local storage
  const [userInfluencers, setUserInfluencers] = useState<InfluencerCharacter[]>(() => {
    try {
      const saved = localStorage.getItem('hf_user_influencers_v7');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return [];
  });

  // Persist selections
  useEffect(() => {
    try {
      localStorage.setItem('hf_inf_type', selectedType);
      localStorage.setItem('hf_inf_gender', selectedGender);
      localStorage.setItem('hf_inf_build', selectedBuild);
      localStorage.setItem('hf_inf_hairstyle', selectedHairstyle);
      localStorage.setItem('hf_inf_haircolor', selectedHairColor);
      localStorage.setItem('hf_inf_style', selectedStyle);
      localStorage.setItem('hf_inf_ethnicity', selectedEthnicity);
      localStorage.setItem('hf_inf_age', selectedAge);
      localStorage.setItem('hf_inf_skincolor', selectedSkinColor);
      localStorage.setItem('hf_user_influencers_v7', JSON.stringify(userInfluencers));
    } catch (e) {
      console.error(e);
    }
  }, [
    selectedType,
    selectedGender,
    selectedBuild,
    selectedHairstyle,
    selectedHairColor,
    selectedStyle,
    selectedEthnicity,
    selectedAge,
    selectedSkinColor,
    userInfluencers,
  ]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Shuffle / Randomize attributes
  const handleShuffle = () => {
    const randomItem = <T,>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];
    setSelectedType(randomItem(CHARACTER_TYPES).id);
    setSelectedGender(randomItem(GENDERS));
    setSelectedBuild(randomItem(BUILDS));
    setSelectedHairstyle(randomItem(HAIRSTYLES));
    setSelectedHairColor(randomItem(HAIR_COLORS));
    setSelectedStyle(randomItem(STYLES));
    setSelectedEthnicity(randomItem(ETHNICITIES));
    setSelectedAge(randomItem(AGES));
    setSelectedSkinColor(randomItem(SKIN_COLORS));
    showToast('Randomized attributes');
  };

  // Generate Character Routine using vault drops
  const handleGenerate = () => {
    if (isGenerating) return;
    setIsGenerating(true);
    setGenerationProgress(10);

    const interval = setInterval(() => {
      setGenerationProgress((prev) => {
        if (prev >= 95) {
          clearInterval(interval);
          return 95;
        }
        return prev + 15;
      });
    }, 200);

    setTimeout(() => {
      clearInterval(interval);
      setGenerationProgress(100);

      const vaultMatch = vaultItems.length > 0
        ? vaultItems[Math.floor(Math.random() * vaultItems.length)].imageUrl
        : '/images/archetypes/business-founder.png';

      const typeObj = CHARACTER_TYPES.find((t) => t.id === selectedType);
      const newChar: InfluencerCharacter = {
        id: `inf-${Date.now()}`,
        name: `${selectedStyle.split(' ')[0]} Creator`,
        handle: `@creator_${Date.now().toString().slice(-4)}`,
        type: typeObj ? typeObj.name : 'Extreme',
        gender: selectedGender,
        build: selectedBuild,
        hairstyle: selectedHairstyle,
        hairColor: selectedHairColor,
        style: selectedStyle,
        ethnicity: selectedEthnicity,
        age: selectedAge,
        skinColor: selectedSkinColor,
        imageUrl: vaultMatch,
        prompt: `High-fashion portrait with ${selectedHairstyle} in ${selectedHairColor}, ${selectedBuild} build, wearing ${selectedStyle}, ${selectedEthnicity} heritage, crisp studio illumination`,
        dropsCount: 1,
        category: selectedStyle,
        isOfficial: false,
      };

      setUserInfluencers((prev) => [newChar, ...prev]);
      if (useFreeGens && freeGensRemaining > 0) {
        setFreeGensRemaining((prev) => Math.max(0, prev - 1));
      }
      setIsGenerating(false);
      setInspectCharacter(newChar);
      showToast('New AI influencer created');
    }, 1800);
  };

  // Filtered influencers for gallery grid
  const displayedInfluencers = useMemo(() => {
    let list = [...userInfluencers, ...REAL_INFLUENCERS];
    if (activeFilter === 'presets') {
      list = REAL_INFLUENCERS;
    } else if (activeFilter === 'trends') {
      list = list.slice(0, 4);
    }
    return list;
  }, [userInfluencers, activeFilter]);

  return (
    <div className="flex-1 w-full bg-[#0a0a0d] text-white flex flex-col md:flex-row h-[calc(100vh-4rem)] overflow-hidden select-none">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 px-4 py-2.5 rounded-2xl bg-[#d1fe17] text-black font-bold text-xs shadow-2xl flex items-center gap-2 animate-bounce">
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <polyline points="20 6 9 17 4 12" />
          </svg>
          <span>{toastMessage}</span>
        </div>
      )}

      {/* =================================================================== */}
      {/* 1. LEFT CREATION & ATTRIBUTE BUILDER SIDEBAR                        */}
      {/* =================================================================== */}
      <aside className="w-full md:w-[320px] lg:w-[350px] bg-[#0c0c10] border-r border-white/10 flex flex-col shrink-0 h-full overflow-hidden">
        {/* Top Header */}
        <div className="p-4 border-b border-white/10 shrink-0 space-y-3">
          <div>
            <span className="text-[10px] uppercase font-bold tracking-widest text-neutral-400 block">
              Create your own character with
            </span>
            <h1 className="text-xl font-black uppercase tracking-tight text-white mt-0.5">
              AI Influencer
            </h1>
          </div>

          {/* Mode Switcher: Create Influencer | Motion */}
          <div className="grid grid-cols-2 p-1 rounded-2xl bg-black/60 border border-white/10">
            <button
              onClick={() => setSidebarMode('create')}
              className={`py-2 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                sidebarMode === 'create'
                  ? 'bg-[#1b1b24] text-white shadow'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              Create Influencer
            </button>
            <button
              onClick={() => setSidebarMode('motion')}
              className={`py-2 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                sidebarMode === 'motion'
                  ? 'bg-[#1b1b24] text-white shadow'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              Motion
            </button>
          </div>
        </div>

        {/* Scrollable Builder Options Body */}
        <div className="flex-1 overflow-y-auto no-scrollbar p-4 space-y-4">
          {sidebarMode === 'create' ? (
            <>
              {/* Upload Your Photo Box */}
              <div
                onClick={() => showToast('Select a reference photo from your device')}
                className="group relative p-4 rounded-2xl border-2 border-dashed border-white/15 bg-white/[0.02] hover:bg-white/[0.05] hover:border-[#d1fe17]/50 transition-all cursor-pointer flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-neutral-400 group-hover:text-[#d1fe17] transition-colors">
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="3" y="3" width="18" height="18" rx="2" />
                      <circle cx="8.5" cy="8.5" r="1.5" />
                      <polyline points="21 15 16 10 5 21" />
                    </svg>
                  </div>
                  <div>
                    <span className="text-xs font-bold text-white block">Upload your photo</span>
                    <span className="text-[10px] text-neutral-500">Selfie, portrait, or studio shot</span>
                  </div>
                </div>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/10 text-neutral-400 font-medium">
                  Optional
                </span>
              </div>

              {/* Accordion 1: Character Type • 9 (3x3 Grid) */}
              <div className="border border-white/10 rounded-2xl bg-black/40 overflow-hidden">
                <button
                  onClick={() => setExpandedSection(expandedSection === 'type' ? '' : 'type')}
                  className="w-full px-4 py-3 flex items-center justify-between text-xs font-bold text-white hover:bg-white/5 transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-neutral-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
                      <circle cx="12" cy="7" r="4" />
                    </svg>
                    <span>Character type</span>
                    <span className="text-neutral-500 font-mono text-[11px]">• 9</span>
                  </div>
                  <svg
                    className={`w-3.5 h-3.5 text-neutral-400 transition-transform ${
                      expandedSection === 'type' ? 'rotate-180' : ''
                    }`}
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                  >
                    <polyline points="6 9 12 15 18 9" />
                  </svg>
                </button>

                {expandedSection === 'type' && (
                  <div className="p-3 pt-0 grid grid-cols-3 gap-2 animate-fade-in">
                    {CHARACTER_TYPES.map((t) => {
                      const isSelected = selectedType === t.id;
                      return (
                        <div
                          key={t.id}
                          onClick={() => {
                            setSelectedType(t.id);
                            showToast(`Selected ${t.name} type`);
                          }}
                          className={`flex flex-col items-center justify-center p-2 rounded-xl cursor-pointer transition-all ${
                            isSelected
                              ? 'bg-[#1e2b0c] border-2 border-[#d1fe17] shadow-[0_0_15px_rgba(209,254,23,0.3)]'
                              : 'bg-white/[0.03] border border-white/10 hover:border-white/30'
                          }`}
                        >
                          <div className="w-10 h-10 rounded-lg overflow-hidden flex items-center justify-center mb-1">
                            <img
                              src={t.icon}
                              alt={t.name}
                              className="w-full h-full object-contain"
                              onError={(e) => {
                                (e.target as HTMLElement).style.display = 'none';
                              }}
                            />
                          </div>
                          <span
                            className={`text-[10px] font-bold ${
                              isSelected ? 'text-[#d1fe17]' : 'text-neutral-300'
                            }`}
                          >
                            {t.name}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Accordion 2: Gender • 5 */}
              <div className="border border-white/10 rounded-2xl bg-black/40 overflow-hidden">
                <button
                  onClick={() => setExpandedSection(expandedSection === 'gender' ? '' : 'gender')}
                  className="w-full px-4 py-3 flex items-center justify-between text-xs font-bold text-white hover:bg-white/5 transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-neutral-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="12" cy="12" r="10" />
                      <line x1="12" y1="8" x2="12" y2="16" />
                      <line x1="8" y1="12" x2="16" y2="12" />
                    </svg>
                    <span>Gender</span>
                    <span className="text-neutral-500 font-mono text-[11px]">• 5</span>
                  </div>
                  <svg
                    className={`w-3.5 h-3.5 text-neutral-400 transition-transform ${
                      expandedSection === 'gender' ? 'rotate-180' : ''
                    }`}
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                  >
                    <polyline points="6 9 12 15 18 9" />
                  </svg>
                </button>
                {expandedSection === 'gender' && (
                  <div className="p-3 pt-0 flex flex-wrap gap-1.5 animate-fade-in">
                    {GENDERS.map((g) => (
                      <button
                        key={g}
                        onClick={() => setSelectedGender(g)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all cursor-pointer ${
                          selectedGender === g
                            ? 'bg-[#d1fe17] text-black font-bold shadow'
                            : 'bg-white/5 text-neutral-300 hover:bg-white/10'
                        }`}
                      >
                        {g}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Accordion 3: Build • 7 */}
              <div className="border border-white/10 rounded-2xl bg-black/40 overflow-hidden">
                <button
                  onClick={() => setExpandedSection(expandedSection === 'build' ? '' : 'build')}
                  className="w-full px-4 py-3 flex items-center justify-between text-xs font-bold text-white hover:bg-white/5 transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-neutral-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="12" cy="7" r="4" />
                      <path d="M5.5 21a8.38 8.38 0 0 1 13 0" />
                    </svg>
                    <span>Build</span>
                    <span className="text-neutral-500 font-mono text-[11px]">• 7</span>
                  </div>
                  <svg
                    className={`w-3.5 h-3.5 text-neutral-400 transition-transform ${
                      expandedSection === 'build' ? 'rotate-180' : ''
                    }`}
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                  >
                    <polyline points="6 9 12 15 18 9" />
                  </svg>
                </button>
                {expandedSection === 'build' && (
                  <div className="p-3 pt-0 flex flex-wrap gap-1.5 animate-fade-in">
                    {BUILDS.map((b) => (
                      <button
                        key={b}
                        onClick={() => setSelectedBuild(b)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all cursor-pointer ${
                          selectedBuild === b
                            ? 'bg-[#d1fe17] text-black font-bold shadow'
                            : 'bg-white/5 text-neutral-300 hover:bg-white/10'
                        }`}
                      >
                        {b}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Accordion 4: Hairstyle • 26 */}
              <div className="border border-white/10 rounded-2xl bg-black/40 overflow-hidden">
                <button
                  onClick={() => setExpandedSection(expandedSection === 'hairstyle' ? '' : 'hairstyle')}
                  className="w-full px-4 py-3 flex items-center justify-between text-xs font-bold text-white hover:bg-white/5 transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-neutral-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M12 2a5 5 0 0 0-5 5v1a4 4 0 0 0-4 4c0 3 2 5 5 5h8c3 0 5-2 5-5a4 4 0 0 0-4-4V7a5 5 0 0 0-5-5z" />
                    </svg>
                    <span>Hairstyle</span>
                    <span className="text-neutral-500 font-mono text-[11px]">• 26</span>
                  </div>
                  <svg
                    className={`w-3.5 h-3.5 text-neutral-400 transition-transform ${
                      expandedSection === 'hairstyle' ? 'rotate-180' : ''
                    }`}
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                  >
                    <polyline points="6 9 12 15 18 9" />
                  </svg>
                </button>
                {expandedSection === 'hairstyle' && (
                  <div className="p-3 pt-0 max-h-48 overflow-y-auto no-scrollbar flex flex-wrap gap-1.5 animate-fade-in">
                    {HAIRSTYLES.map((h) => (
                      <button
                        key={h}
                        onClick={() => setSelectedHairstyle(h)}
                        className={`px-2.5 py-1 rounded-xl text-[11px] font-medium transition-all cursor-pointer ${
                          selectedHairstyle === h
                            ? 'bg-[#d1fe17] text-black font-bold shadow'
                            : 'bg-white/5 text-neutral-300 hover:bg-white/10'
                        }`}
                      >
                        {h}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Accordion 5: Hair Color • 13 */}
              <div className="border border-white/10 rounded-2xl bg-black/40 overflow-hidden">
                <button
                  onClick={() => setExpandedSection(expandedSection === 'haircolor' ? '' : 'haircolor')}
                  className="w-full px-4 py-3 flex items-center justify-between text-xs font-bold text-white hover:bg-white/5 transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-2">
                    <div className="w-3.5 h-3.5 rounded-full bg-gradient-to-r from-amber-400 via-rose-500 to-indigo-500" />
                    <span>Hair Color</span>
                    <span className="text-neutral-500 font-mono text-[11px]">• 13</span>
                  </div>
                  <svg
                    className={`w-3.5 h-3.5 text-neutral-400 transition-transform ${
                      expandedSection === 'haircolor' ? 'rotate-180' : ''
                    }`}
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                  >
                    <polyline points="6 9 12 15 18 9" />
                  </svg>
                </button>
                {expandedSection === 'haircolor' && (
                  <div className="p-3 pt-0 flex flex-wrap gap-1.5 animate-fade-in">
                    {HAIR_COLORS.map((c) => (
                      <button
                        key={c}
                        onClick={() => setSelectedHairColor(c)}
                        className={`px-2.5 py-1 rounded-xl text-[11px] font-medium transition-all cursor-pointer ${
                          selectedHairColor === c
                            ? 'bg-[#d1fe17] text-black font-bold shadow'
                            : 'bg-white/5 text-neutral-300 hover:bg-white/10'
                        }`}
                      >
                        {c}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Accordion 6: Style • 8 */}
              <div className="border border-white/10 rounded-2xl bg-black/40 overflow-hidden">
                <button
                  onClick={() => setExpandedSection(expandedSection === 'style' ? '' : 'style')}
                  className="w-full px-4 py-3 flex items-center justify-between text-xs font-bold text-white hover:bg-white/5 transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-neutral-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M20.38 3.46 16 2a4 4 0 0 1-8 0L3.62 3.46a2 2 0 0 0-1.34 2.23l.58 3.47a1 1 0 0 0 .99.84H6v10c0 1.1.9 2 2 2h8a2 2 0 0 0 2-2V10h2.15a1 1 0 0 0 .99-.84l.58-3.47a2 2 0 0 0-1.34-2.23z" />
                    </svg>
                    <span>Style</span>
                    <span className="text-neutral-500 font-mono text-[11px]">• 8</span>
                  </div>
                  <svg
                    className={`w-3.5 h-3.5 text-neutral-400 transition-transform ${
                      expandedSection === 'style' ? 'rotate-180' : ''
                    }`}
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                  >
                    <polyline points="6 9 12 15 18 9" />
                  </svg>
                </button>
                {expandedSection === 'style' && (
                  <div className="p-3 pt-0 flex flex-wrap gap-1.5 animate-fade-in">
                    {STYLES.map((st) => (
                      <button
                        key={st}
                        onClick={() => setSelectedStyle(st)}
                        className={`px-2.5 py-1 rounded-xl text-[11px] font-medium transition-all cursor-pointer ${
                          selectedStyle === st
                            ? 'bg-[#d1fe17] text-black font-bold shadow'
                            : 'bg-white/5 text-neutral-300 hover:bg-white/10'
                        }`}
                      >
                        {st}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Accordion 7: Ethnicity • 6 */}
              <div className="border border-white/10 rounded-2xl bg-black/40 overflow-hidden">
                <button
                  onClick={() => setExpandedSection(expandedSection === 'ethnicity' ? '' : 'ethnicity')}
                  className="w-full px-4 py-3 flex items-center justify-between text-xs font-bold text-white hover:bg-white/5 transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-neutral-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="12" cy="12" r="10" />
                      <line x1="2" y1="12" x2="22" y2="12" />
                      <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
                    </svg>
                    <span>Ethnicity</span>
                    <span className="text-neutral-500 font-mono text-[11px]">• 6</span>
                  </div>
                  <svg
                    className={`w-3.5 h-3.5 text-neutral-400 transition-transform ${
                      expandedSection === 'ethnicity' ? 'rotate-180' : ''
                    }`}
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                  >
                    <polyline points="6 9 12 15 18 9" />
                  </svg>
                </button>
                {expandedSection === 'ethnicity' && (
                  <div className="p-3 pt-0 flex flex-wrap gap-1.5 animate-fade-in">
                    {ETHNICITIES.map((eth) => (
                      <button
                        key={eth}
                        onClick={() => setSelectedEthnicity(eth)}
                        className={`px-2.5 py-1 rounded-xl text-[11px] font-medium transition-all cursor-pointer ${
                          selectedEthnicity === eth
                            ? 'bg-[#d1fe17] text-black font-bold shadow'
                            : 'bg-white/5 text-neutral-300 hover:bg-white/10'
                        }`}
                      >
                        {eth}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Accordion 8: Age • 3 */}
              <div className="border border-white/10 rounded-2xl bg-black/40 overflow-hidden">
                <button
                  onClick={() => setExpandedSection(expandedSection === 'age' ? '' : 'age')}
                  className="w-full px-4 py-3 flex items-center justify-between text-xs font-bold text-white hover:bg-white/5 transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-neutral-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                      <circle cx="9" cy="7" r="4" />
                      <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                    </svg>
                    <span>Age</span>
                    <span className="text-neutral-500 font-mono text-[11px]">• 3</span>
                  </div>
                  <svg
                    className={`w-3.5 h-3.5 text-neutral-400 transition-transform ${
                      expandedSection === 'age' ? 'rotate-180' : ''
                    }`}
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                  >
                    <polyline points="6 9 12 15 18 9" />
                  </svg>
                </button>
                {expandedSection === 'age' && (
                  <div className="p-3 pt-0 flex flex-wrap gap-1.5 animate-fade-in">
                    {AGES.map((a) => (
                      <button
                        key={a}
                        onClick={() => setSelectedAge(a)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all cursor-pointer ${
                          selectedAge === a
                            ? 'bg-[#d1fe17] text-black font-bold shadow'
                            : 'bg-white/5 text-neutral-300 hover:bg-white/10'
                        }`}
                      >
                        {a}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Accordion 9: Skin color • 8 */}
              <div className="border border-white/10 rounded-2xl bg-black/40 overflow-hidden">
                <button
                  onClick={() => setExpandedSection(expandedSection === 'skin' ? '' : 'skin')}
                  className="w-full px-4 py-3 flex items-center justify-between text-xs font-bold text-white hover:bg-white/5 transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-2">
                    <div className="w-3.5 h-3.5 rounded-full bg-[#c89868]" />
                    <span>Skin color</span>
                    <span className="text-neutral-500 font-mono text-[11px]">• 8</span>
                  </div>
                  <svg
                    className={`w-3.5 h-3.5 text-neutral-400 transition-transform ${
                      expandedSection === 'skin' ? 'rotate-180' : ''
                    }`}
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                  >
                    <polyline points="6 9 12 15 18 9" />
                  </svg>
                </button>
                {expandedSection === 'skin' && (
                  <div className="p-3 pt-0 flex flex-wrap gap-1.5 animate-fade-in">
                    {SKIN_COLORS.map((sk) => (
                      <button
                        key={sk}
                        onClick={() => setSelectedSkinColor(sk)}
                        className={`px-2.5 py-1 rounded-xl text-[11px] font-medium transition-all cursor-pointer ${
                          selectedSkinColor === sk
                            ? 'bg-[#d1fe17] text-black font-bold shadow'
                            : 'bg-white/5 text-neutral-300 hover:bg-white/10'
                        }`}
                      >
                        {sk}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </>
          ) : (
            /* MOTION PRESETS VIEW */
            <div className="space-y-3">
              <div className="p-3 rounded-2xl bg-white/[0.02] border border-white/10">
                <h3 className="text-xs font-bold text-white mb-1">Select Motion Preset</h3>
                <p className="text-[11px] text-neutral-400">
                  Turn your AI influencer into an animated motion video.
                </p>
              </div>

              <div className="space-y-2">
                {MOTION_PRESETS.map((m) => {
                  const isSelected = selectedMotion === m.id;
                  return (
                    <div
                      key={m.id}
                      onClick={() => setSelectedMotion(m.id)}
                      className={`p-3 rounded-2xl cursor-pointer transition-all border ${
                        isSelected
                          ? 'border-[#d1fe17] bg-[#1a250b] shadow-[0_0_15px_rgba(209,254,23,0.2)]'
                          : 'border-white/10 bg-white/[0.02] hover:border-white/30'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-bold text-white">{m.name}</span>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/10 text-neutral-300 font-mono">
                          {m.speed}
                        </span>
                      </div>
                      <p className="text-[11px] text-neutral-400 leading-relaxed">
                        {m.description}
                      </p>
                    </div>
                  );
                })}
              </div>

              {onSelectVideoStudio && (
                <button
                  onClick={onSelectVideoStudio}
                  className="w-full py-3 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer mt-4"
                >
                  <svg className="w-4 h-4 text-[#d1fe17]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="2" y="2" width="20" height="20" rx="2.18" ry="2.18" />
                    <line x1="7" y1="2" x2="7" y2="22" />
                    <line x1="17" y1="2" x2="17" y2="22" />
                  </svg>
                  <span>Open Cinema Studio Workflow</span>
                </button>
              )}
            </div>
          )}
        </div>

        {/* Bottom Generation Actions Footer */}
        <div className="p-4 border-t border-white/10 bg-[#08080b] shrink-0 space-y-3">
          {/* Free Gens Toggle */}
          <div className="flex items-center justify-between text-xs">
            <span className="text-neutral-300 font-medium flex items-center gap-1.5">
              <span>Use free gens</span>
              <span className="text-[#d1fe17] font-bold">({freeGensRemaining} left)</span>
            </span>
            <button
              onClick={() => setUseFreeGens(!useFreeGens)}
              className={`w-9 h-5 rounded-full p-0.5 transition-colors cursor-pointer ${
                useFreeGens ? 'bg-[#d1fe17]' : 'bg-neutral-700'
              }`}
            >
              <div
                className={`w-4 h-4 rounded-full bg-black transition-transform ${
                  useFreeGens ? 'translate-x-4' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Shuffle & Generate Buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleShuffle}
              className="w-12 h-12 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/15 flex items-center justify-center text-white transition-all cursor-pointer shrink-0"
              title="Shuffle attributes"
            >
              <svg className="w-5 h-5 text-neutral-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="16 3 21 3 21 8" />
                <line x1="4" y1="20" x2="21" y2="3" />
                <polyline points="21 16 21 21 16 21" />
                <line x1="15" y1="15" x2="21" y2="21" />
                <line x1="4" y1="4" x2="9" y2="9" />
              </svg>
            </button>

            <button
              onClick={handleGenerate}
              disabled={isGenerating}
              className={`flex-1 h-12 rounded-2xl font-black text-sm tracking-wide flex items-center justify-center gap-2 transition-all cursor-pointer shadow-xl ${
                isGenerating
                  ? 'bg-neutral-800 text-neutral-400 cursor-not-allowed'
                  : 'bg-[#d1fe17] text-black hover:bg-[#e2ff4f] shadow-[0_0_25px_rgba(209,254,23,0.35)]'
              }`}
            >
              {isGenerating ? (
                <>
                  <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                  <span>Generating ({generationProgress}%)...</span>
                </>
              ) : (
                <>
                  <span>Generate</span>
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                    <path d="m12 3-1.9 5.8a2 2 0 0 1-1.3 1.3L3 12l5.8 1.9a2 2 0 0 1 1.3 1.3L12 21l1.9-5.8a2 2 0 0 1 1.3-1.3L21 12l-5.8-1.9a2 2 0 0 1-1.3-1.3Z" />
                  </svg>
                </>
              )}
            </button>
          </div>
        </div>
      </aside>

      {/* =================================================================== */}
      {/* 2. MAIN CONTENT AREA (HERO CAROUSEL & INFLUENCER GALLERY)           */}
      {/* =================================================================== */}
      <main className="flex-1 flex flex-col h-full overflow-y-auto no-scrollbar bg-[#09090c] relative">
        {/* Top View Switcher Header */}
        <div className="sticky top-0 z-20 px-6 py-4 bg-[#09090c]/90 backdrop-blur-xl border-b border-white/5 flex items-center justify-between">
          <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-white/[0.03] border border-white/10">
            <button
              onClick={() => setActiveView('explore')}
              className={`px-4 py-1.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
                activeView === 'explore'
                  ? 'bg-[#181822] text-white shadow'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" />
              </svg>
              <span>Explore</span>
            </button>

            <button
              onClick={() => setActiveView('history')}
              className={`px-4 py-1.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
                activeView === 'history'
                  ? 'bg-[#181822] text-white shadow'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <polyline points="12 6 12 12 16 14" />
              </svg>
              <span>History</span>
              {userInfluencers.length > 0 && (
                <span className="w-4 h-4 rounded-full bg-[#d1fe17] text-black text-[9px] font-black flex items-center justify-center">
                  {userInfluencers.length}
                </span>
              )}
            </button>
          </div>
        </div>

        {activeView === 'explore' ? (
          <div className="p-6 sm:p-8 space-y-10 max-w-7xl mx-auto w-full">
            {/* HERO CAROUSEL BANNER SECTION */}
            <div className="flex flex-col items-center text-center space-y-6 pt-4">
              {/* 3D Perspective Floating Arc Cards */}
              <div className="relative flex items-center justify-center h-64 sm:h-72 w-full max-w-2xl mx-auto">
                {/* Card -2 (Far Left) */}
                <div className="absolute left-4 sm:left-12 w-28 sm:w-36 aspect-[9/16] rounded-2xl overflow-hidden shadow-2xl opacity-60 transform -rotate-12 scale-90 translate-y-3 z-0 border border-white/20">
                  <img
                    src="https://d8j0ntlcm91z4.cloudfront.net/user_336JgWTlqHQHPYleCS3LEJ2wTSb/hf_20261107_214641_9271be3f-9133-4616-80ad-78f86ba445f9_min.webp"
                    alt=""
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Card -1 (Mid Left) */}
                <div className="absolute left-16 sm:left-32 w-32 sm:w-40 aspect-[9/16] rounded-2xl overflow-hidden shadow-2xl opacity-80 transform -rotate-6 scale-95 translate-y-1.5 z-10 border border-white/20">
                  <img
                    src="https://d8j0ntlcm91z4.cloudfront.net/user_336JgWTlqHQHPYleCS3LEJ2wTSb/hf_20261106_032226_ba56175c-b5d6-4183-aad0-5932f8023b3c_min.webp"
                    alt=""
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Center Card (Hero Front) */}
                <div className="relative w-36 sm:w-44 aspect-[9/16] rounded-2xl overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.9)] transform scale-105 z-20 border-2 border-white/40 ring-4 ring-[#d1fe17]/20">
                  <img
                    src="/images/archetypes/business-founder.png"
                    alt=""
                    className="w-full h-full object-cover object-top"
                  />
                </div>

                {/* Card +1 (Mid Right) */}
                <div className="absolute right-16 sm:right-32 w-32 sm:w-40 aspect-[9/16] rounded-2xl overflow-hidden shadow-2xl opacity-80 transform rotate-6 scale-95 translate-y-1.5 z-10 border border-white/20">
                  <img
                    src="https://d8j0ntlcm91z4.cloudfront.net/user_336JgWTlqHQHPYleCS3LEJ2wTSb/hf_20261106_024800_6cdc5d8b-71ca-460f-a0f5-46c088e0694f_min.webp"
                    alt=""
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Card +2 (Far Right) */}
                <div className="absolute right-4 sm:right-12 w-28 sm:w-36 aspect-[9/16] rounded-2xl overflow-hidden shadow-2xl opacity-60 transform rotate-12 scale-90 translate-y-3 z-0 border border-white/20">
                  <img
                    src="https://d8j0ntlcm91z4.cloudfront.net/user_336JgWTlqHQHPYleCS3LEJ2wTSb/hf_20261106_031737_bc164e3b-b104-4529-97ce-c92dde0980c8_min.webp"
                    alt=""
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>

              {/* Title & Subtitle */}
              <div className="space-y-2 max-w-xl mx-auto">
                <h2 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-white leading-tight">
                  YOUR INFLUENCER,<br />YOUR VIRAL HIT
                </h2>
                <p className="text-xs sm:text-sm text-neutral-400 leading-relaxed max-w-lg mx-auto">
                  Build your AI influencer with the face, body, and style you want. Choose a motion preset and watch them perform it in a video ready to share.
                </p>
              </div>

              {/* Category Sub-Navigation Pills */}
              <div className="flex items-center gap-2 pt-1">
                <button
                  onClick={() => setActiveFilter('all')}
                  className={`px-4 py-2 rounded-2xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
                    activeFilter === 'all'
                      ? 'bg-white text-black shadow-lg'
                      : 'bg-white/5 text-neutral-400 hover:text-white hover:bg-white/10'
                  }`}
                >
                  <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                    <circle cx="9" cy="7" r="4" />
                    <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                  </svg>
                  <span>AI Influencers</span>
                </button>

                <button
                  onClick={() => setActiveFilter('presets')}
                  className={`px-4 py-2 rounded-2xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
                    activeFilter === 'presets'
                      ? 'bg-white text-black shadow-lg'
                      : 'bg-white/5 text-neutral-400 hover:text-white hover:bg-white/10'
                  }`}
                >
                  <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
                    <path d="m12 3-1.9 5.8a2 2 0 0 1-1.3 1.3L3 12l5.8 1.9a2 2 0 0 1 1.3 1.3L12 21l1.9-5.8a2 2 0 0 1 1.3-1.3L21 12l-5.8-1.9a2 2 0 0 1-1.3-1.3Z" />
                  </svg>
                  <span>Curated Presets</span>
                </button>

                <button
                  onClick={() => setActiveFilter('trends')}
                  className={`px-4 py-2 rounded-2xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
                    activeFilter === 'trends'
                      ? 'bg-white text-black shadow-lg'
                      : 'bg-white/5 text-neutral-400 hover:text-white hover:bg-white/10'
                  }`}
                >
                  <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
                    <polyline points="17 6 23 6 23 12" />
                  </svg>
                  <span>Community Trends</span>
                </button>
              </div>
            </div>

            {/* MASONRY / DYNAMIC GALLERY GRID SECTION */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 pb-20">
              {displayedInfluencers.map((char) => (
                <div
                  key={char.id}
                  onClick={() => setInspectCharacter(char)}
                  className="group relative rounded-2xl overflow-hidden bg-[#111116] border border-white/10 hover:border-white/30 transition-all cursor-pointer shadow-lg hover:shadow-2xl hover:scale-[1.01]"
                >
                  <div className="aspect-[3/4] w-full overflow-hidden bg-black">
                    <img
                      src={char.imageUrl}
                      alt={char.name}
                      className="w-full h-full object-cover object-top transition-transform duration-500 group-hover:scale-105"
                    />
                  </div>

                  {/* Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-80 group-hover:opacity-95 transition-opacity pointer-events-none" />

                  {/* Top Badges */}
                  <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-black/60 backdrop-blur-md text-[#d1fe17] font-bold border border-[#d1fe17]/30">
                      {char.category || char.type}
                    </span>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        showToast('Saved to favorites');
                      }}
                      className="w-7 h-7 rounded-full bg-black/60 backdrop-blur-md flex items-center justify-center text-white hover:text-rose-400 transition-colors"
                    >
                      <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                      </svg>
                    </button>
                  </div>

                  {/* Bottom Character Info */}
                  <div className="absolute bottom-3 left-3 right-3">
                    <div className="flex items-center justify-between gap-1">
                      <h4 className="text-sm font-bold text-white tracking-wide truncate">
                        {char.name}
                      </h4>
                      {char.dropsCount > 1 && (
                        <span className="text-[9px] px-1.5 py-0.5 rounded bg-white/10 text-neutral-300 font-mono shrink-0">
                          {char.dropsCount} drops
                        </span>
                      )}
                    </div>
                    <span className="text-[11px] text-neutral-400 font-mono block">
                      {char.handle}
                    </span>
                    <p className="text-[10px] text-neutral-400 line-clamp-1 mt-0.5 font-sans">
                      {char.category} • {char.hairstyle}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          /* HISTORY VIEW */
          <div className="p-6 sm:p-8 max-w-5xl mx-auto w-full space-y-6">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div>
                <h2 className="text-lg font-bold text-white">Your Generated Influencers</h2>
                <p className="text-xs text-neutral-400">
                  {userInfluencers.length} characters built in your session
                </p>
              </div>

              {userInfluencers.length > 0 && (
                <button
                  onClick={() => {
                    if (confirm('Clear all your generated history?')) {
                      setUserInfluencers([]);
                      showToast('History cleared');
                    }
                  }}
                  className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-rose-500/20 text-neutral-400 hover:text-rose-400 text-xs font-semibold transition-colors cursor-pointer"
                >
                  Clear History
                </button>
              )}
            </div>

            {userInfluencers.length === 0 ? (
              <div className="flex flex-col items-center justify-center p-16 text-center rounded-3xl border border-white/10 bg-white/[0.01]">
                <div className="w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center text-neutral-400 mb-3">
                  <svg className="w-7 h-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                    <circle cx="9" cy="7" r="4" />
                  </svg>
                </div>
                <h3 className="text-sm font-bold text-white">No custom characters yet</h3>
                <p className="text-xs text-neutral-400 max-w-sm mt-1 mb-4 leading-relaxed">
                  Use the builder on the left to configure attributes and generate your first AI influencer.
                </p>
                <button
                  onClick={() => setActiveView('explore')}
                  className="px-5 py-2.5 rounded-2xl bg-[#d1fe17] text-black font-bold text-xs shadow-lg hover:scale-105 transition-all cursor-pointer"
                >
                  Explore Presets
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                {userInfluencers.map((char) => (
                  <div
                    key={char.id}
                    onClick={() => setInspectCharacter(char)}
                    className="group relative rounded-2xl overflow-hidden bg-[#111116] border border-white/10 hover:border-white/30 transition-all cursor-pointer shadow-lg"
                  >
                    <div className="aspect-[3/4] w-full overflow-hidden bg-black">
                      <img src={char.imageUrl} alt="" className="w-full h-full object-cover object-top" />
                    </div>
                    <div className="p-3">
                      <h4 className="text-xs font-bold text-white truncate">{char.name}</h4>
                      <span className="text-[10px] text-neutral-400 font-mono block">{char.handle}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>

      {/* =================================================================== */}
      {/* 3. CHARACTER INSPECTION & MOTION VIDEO MODAL                         */}
      {/* =================================================================== */}
      {inspectCharacter && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
          <div
            onClick={() => setInspectCharacter(null)}
            className="absolute inset-0"
          />

          <div className="relative z-10 w-full max-w-3xl bg-[#0f0f14] border border-white/15 rounded-3xl overflow-hidden shadow-2xl flex flex-col md:flex-row max-h-[90vh]">
            {/* Left Image View */}
            <div className="w-full md:w-1/2 aspect-[3/4] bg-black relative flex items-center justify-center">
              <img
                src={inspectCharacter.imageUrl}
                alt={inspectCharacter.name}
                className="w-full h-full object-cover object-top"
              />
              <span className="absolute top-4 left-4 text-xs font-bold px-3 py-1 rounded-full bg-black/70 backdrop-blur-md text-[#d1fe17] border border-[#d1fe17]/30">
                {inspectCharacter.category || inspectCharacter.type}
              </span>
            </div>

            {/* Right Details View */}
            <div className="w-full md:w-1/2 p-6 flex flex-col justify-between overflow-y-auto no-scrollbar space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xl font-black text-white">{inspectCharacter.name}</h3>
                    <span className="text-xs text-neutral-400 font-mono">{inspectCharacter.handle}</span>
                  </div>
                  <button
                    onClick={() => setInspectCharacter(null)}
                    className="p-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-neutral-400 hover:text-white transition-colors cursor-pointer"
                  >
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <line x1="18" y1="6" x2="6" y2="18" />
                      <line x1="6" y1="6" x2="18" y2="18" />
                    </svg>
                  </button>
                </div>

                {/* Attributes Grid */}
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="p-2.5 rounded-xl bg-white/[0.03] border border-white/5">
                    <span className="text-[10px] text-neutral-500 uppercase block font-semibold">Category</span>
                    <span className="text-neutral-200 font-medium">{inspectCharacter.category}</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-white/[0.03] border border-white/5">
                    <span className="text-[10px] text-neutral-500 uppercase block font-semibold">Hairstyle</span>
                    <span className="text-neutral-200 font-medium">{inspectCharacter.hairstyle}</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-white/[0.03] border border-white/5">
                    <span className="text-[10px] text-neutral-500 uppercase block font-semibold">Ethnicity</span>
                    <span className="text-neutral-200 font-medium">{inspectCharacter.ethnicity}</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-white/[0.03] border border-white/5">
                    <span className="text-[10px] text-neutral-500 uppercase block font-semibold">Total Drops</span>
                    <span className="text-[#d1fe17] font-bold font-mono">{inspectCharacter.dropsCount}</span>
                  </div>
                </div>

                {/* Prompt */}
                <div className="p-3 rounded-2xl bg-white/[0.02] border border-white/5 space-y-1">
                  <span className="text-[10px] text-[#d1fe17] uppercase font-bold tracking-wider">Prompt Specification</span>
                  <p className="text-xs text-neutral-300 leading-relaxed font-mono">
                    {inspectCharacter.prompt}
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2 pt-2 border-t border-white/10">
                {onSelectVideoStudio && (
                  <button
                    onClick={() => {
                      setInspectCharacter(null);
                      onSelectVideoStudio();
                    }}
                    className="w-full py-3 rounded-2xl bg-[#d1fe17] text-black font-extrabold text-xs flex items-center justify-center gap-2 shadow-lg hover:bg-[#e2ff4f] transition-all cursor-pointer"
                  >
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <polygon points="5 3 19 12 5 21 5 3" />
                    </svg>
                    <span>Create Motion Video in Cinema Studio</span>
                  </button>
                )}

                {onSelectInfluencerDrops && (
                  <button
                    onClick={() => {
                      onSelectInfluencerDrops([], inspectCharacter.name);
                      setInspectCharacter(null);
                    }}
                    className="w-full py-2.5 rounded-2xl bg-white/5 hover:bg-white/10 text-white font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer"
                  >
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="3" y="3" width="7" height="7" rx="1.5" />
                      <rect x="14" y="3" width="7" height="7" rx="1.5" />
                      <rect x="14" y="14" width="7" height="7" rx="1.5" />
                      <rect x="3" y="14" width="7" height="7" rx="1.5" />
                    </svg>
                    <span>Filter Drops by Character</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
