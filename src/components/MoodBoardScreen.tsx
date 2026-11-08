import React, { useState, useEffect } from 'react';
import { VaultItem } from '../types';

export interface MoodBoardRecord {
  id: string;
  title: string;
  status: 'ready' | 'in_queue';
  imagesCount: number;
  sampleImages: string[];
  datasetImages: string[];
  createdAt: string;
  isCurated?: boolean;
}

interface MoodBoardScreenProps {
  vaultItems: VaultItem[];
  onReturnToVault: () => void;
  onSelectItem?: (item: VaultItem) => void;
}

export const MoodBoardScreen: React.FC<MoodBoardScreenProps> = ({
  vaultItems,
  onReturnToVault,
  onSelectItem,
}) => {
  // Navigation tab: 'my' | 'curated'
  const [activeTab, setActiveTab] = useState<'my' | 'curated'>('my');

  // View state: 'hub' | 'create'
  const [viewState, setViewState] = useState<'hub' | 'create'>('hub');

  // Selected moodboard for details modal
  const [selectedBoard, setSelectedBoard] = useState<MoodBoardRecord | null>(null);
  const [detailsTab, setDetailsTab] = useState<'generations' | 'dataset'>('generations');

  // Three-dot popover menu for card
  const [menuOpenId, setMenuOpenId] = useState<string | null>(null);

  // Creation Studio form state
  const [boardName, setBoardName] = useState('New Collection');
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const [showAgreementModal, setShowAgreementModal] = useState(false);
  const [agreementChecked, setAgreementChecked] = useState(false);

  // Local storage for user moodboards
  const [myBoards, setMyBoards] = useState<MoodBoardRecord[]>(() => {
    try {
      const saved = localStorage.getItem('halalfans_moodboards_v2');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return [];
  });

  useEffect(() => {
    try {
      localStorage.setItem('halalfans_moodboards_v2', JSON.stringify(myBoards));
    } catch (e) {
      console.error(e);
    }
  }, [myBoards]);

  // Curated reference moodboards built from real prompt vault drops
  const curatedBoards: MoodBoardRecord[] = [
    {
      id: 'curated-1',
      title: 'Burj Luxury & Evening',
      status: 'ready',
      imagesCount: 276,
      sampleImages: [
        'https://d8j0ntlcm91z4.cloudfront.net/user_336JgWTlqHQHPYleCS3LEJ2wTSb/hf_20261107_214641_9271be3f-9133-4616-80ad-78f86ba445f9_min.webp',
        'https://d8j0ntlcm91z4.cloudfront.net/user_336JgWTlqHQHPYleCS3LEJ2wTSb/hf_20261107_214641_787510e3-c547-4994-b0ef-c7004c10e5d7_min.webp',
        'https://d8j0ntlcm91z4.cloudfront.net/user_336JgWTlqHQHPYleCS3LEJ2wTSb/hf_20261107_214641_cdca0579-8fc8-4739-a572-c0a4d5c6ce2c_min.webp',
        'https://d8j0ntlcm91z4.cloudfront.net/user_336JgWTlqHQHPYleCS3LEJ2wTSb/hf_20261107_214641_ff3a423f-4e74-47b5-8f0b-7f6ab800e5eb_min.webp',
      ],
      datasetImages: [
        'https://d8j0ntlcm91z4.cloudfront.net/user_336JgWTlqHQHPYleCS3LEJ2wTSb/hf_20261106_032931_c42263f6-eaf5-4d50-ac9c-9296754064bb_min.webp',
        'https://d8j0ntlcm91z4.cloudfront.net/user_336JgWTlqHQHPYleCS3LEJ2wTSb/hf_20261106_032931_37588442-d291-49b6-a020-f3ee0edbf8b6_min.webp',
      ],
      createdAt: 'Curated Preset',
      isCurated: true,
    },
    {
      id: 'curated-2',
      title: 'Gym & Athletic Glow',
      status: 'ready',
      imagesCount: 108,
      sampleImages: [
        'https://d8j0ntlcm91z4.cloudfront.net/user_336JgWTlqHQHPYleCS3LEJ2wTSb/hf_20261106_033015_1a550c13-3ba4-4a03-8d73-1baaf405cfff_min.webp',
        'https://d8j0ntlcm91z4.cloudfront.net/user_336JgWTlqHQHPYleCS3LEJ2wTSb/hf_20261106_033015_3a157abc-1c93-43f4-b51c-0ebf90d0c925_min.webp',
        'https://d8j0ntlcm91z4.cloudfront.net/user_336JgWTlqHQHPYleCS3LEJ2wTSb/hf_20261106_033015_e290e455-ed20-487e-9b88-3f3ef9dc0ac7_min.webp',
        'https://d8j0ntlcm91z4.cloudfront.net/user_336JgWTlqHQHPYleCS3LEJ2wTSb/hf_20261106_033015_b979c3b2-4abe-4b76-b75c-a745b4f9c94c_min.webp',
      ],
      datasetImages: [
        'https://d8j0ntlcm91z4.cloudfront.net/user_336JgWTlqHQHPYleCS3LEJ2wTSb/hf_20261106_032744_2f69ccba-1f9d-4235-bf49-563e71156b8b_min.webp',
        'https://d8j0ntlcm91z4.cloudfront.net/user_336JgWTlqHQHPYleCS3LEJ2wTSb/hf_20261106_032744_6bec0e98-36f9-4e8e-8d27-d763a616f067_min.webp',
      ],
      createdAt: 'Curated Preset',
      isCurated: true,
    },
    {
      id: 'curated-3',
      title: 'Editorial Silk & Abaya',
      status: 'ready',
      imagesCount: 200,
      sampleImages: [
        'https://d8j0ntlcm91z4.cloudfront.net/user_336JgWTlqHQHPYleCS3LEJ2wTSb/hf_20261106_032031_2b705f3a-3c6e-4e99-822b-b91933c4a562_min.webp',
        'https://d8j0ntlcm91z4.cloudfront.net/user_336JgWTlqHQHPYleCS3LEJ2wTSb/hf_20261106_032031_9de3bb3e-3999-4051-bc73-e89d2f54e539_min.webp',
        'https://d8j0ntlcm91z4.cloudfront.net/user_336JgWTlqHQHPYleCS3LEJ2wTSb/hf_20261106_032031_7e31f19f-3412-4d0e-9b39-09e5cfdf8ea9_min.webp',
        'https://d8j0ntlcm91z4.cloudfront.net/user_336JgWTlqHQHPYleCS3LEJ2wTSb/hf_20261106_032031_4cf98206-4879-4b96-931d-c2d49329431a_min.webp',
      ],
      datasetImages: [
        'https://d8j0ntlcm91z4.cloudfront.net/user_336JgWTlqHQHPYleCS3LEJ2wTSb/hf_20261106_031408_f1089536-3a8f-43ee-b523-6b9a1d85812d_min.webp',
      ],
      createdAt: 'Curated Preset',
      isCurated: true,
    },
    {
      id: 'curated-4',
      title: '35mm Night Flash',
      status: 'ready',
      imagesCount: 476,
      sampleImages: [
        'https://d8j0ntlcm91z4.cloudfront.net/user_336JgWTlqHQHPYleCS3LEJ2wTSb/hf_20261107_214641_9271be3f-9133-4616-80ad-78f86ba445f9_min.webp',
        'https://d8j0ntlcm91z4.cloudfront.net/user_336JgWTlqHQHPYleCS3LEJ2wTSb/hf_20261107_214641_787510e3-c547-4994-b0ef-c7004c10e5d7_min.webp',
        'https://d8j0ntlcm91z4.cloudfront.net/user_336JgWTlqHQHPYleCS3LEJ2wTSb/hf_20261107_214641_cdca0579-8fc8-4739-a572-c0a4d5c6ce2c_min.webp',
        'https://d8j0ntlcm91z4.cloudfront.net/user_336JgWTlqHQHPYleCS3LEJ2wTSb/hf_20261107_214641_ff3a423f-4e74-47b5-8f0b-7f6ab800e5eb_min.webp',
      ],
      datasetImages: [
        'https://d8j0ntlcm91z4.cloudfront.net/user_336JgWTlqHQHPYleCS3LEJ2wTSb/hf_20261106_033015_1a550c13-3ba4-4a03-8d73-1baaf405cfff_min.webp',
      ],
      createdAt: 'Curated Preset',
      isCurated: true,
    },
    {
      id: 'curated-5',
      title: 'Yacht & Beach Resort',
      status: 'ready',
      imagesCount: 128,
      sampleImages: [
        'https://d8j0ntlcm91z4.cloudfront.net/user_336JgWTlqHQHPYleCS3LEJ2wTSb/hf_20261106_032829_b9851fa2-9e38-470f-823b-05a958efbe76_min.webp',
        'https://d8j0ntlcm91z4.cloudfront.net/user_336JgWTlqHQHPYleCS3LEJ2wTSb/hf_20261106_032829_0fd7daf8-cd10-4e23-80fa-527cb2dcaf92_min.webp',
        'https://d8j0ntlcm91z4.cloudfront.net/user_336JgWTlqHQHPYleCS3LEJ2wTSb/hf_20261106_032829_d12137ec-cf52-443a-baa7-01f709bf65b9_min.webp',
        'https://d8j0ntlcm91z4.cloudfront.net/user_336JgWTlqHQHPYleCS3LEJ2wTSb/hf_20261106_032829_4fb5c768-c8f4-43d9-87cc-671248a60ca9_min.webp',
      ],
      datasetImages: [
        'https://d8j0ntlcm91z4.cloudfront.net/user_336JgWTlqHQHPYleCS3LEJ2wTSb/hf_20261106_023102_875d4f30-88da-4cdf-976d-d1ceedb0f284_min.webp',
      ],
      createdAt: 'Curated Preset',
      isCurated: true,
    },
    {
      id: 'curated-6',
      title: 'Tokyo Neon Streetwear',
      status: 'ready',
      imagesCount: 64,
      sampleImages: [
        'https://d8j0ntlcm91z4.cloudfront.net/user_336JgWTlqHQHPYleCS3LEJ2wTSb/hf_20261106_032303_3be1039c-582d-46d6-9431-0f354ed12560_min.webp',
        'https://d8j0ntlcm91z4.cloudfront.net/user_336JgWTlqHQHPYleCS3LEJ2wTSb/hf_20261106_032303_9ca8f7a7-00d4-4af2-979b-a7cd74a3ffa6_min.webp',
        'https://d8j0ntlcm91z4.cloudfront.net/user_336JgWTlqHQHPYleCS3LEJ2wTSb/hf_20261106_032303_16000efb-29cc-4874-a521-d3fed3a0c75d_min.webp',
        'https://d8j0ntlcm91z4.cloudfront.net/user_336JgWTlqHQHPYleCS3LEJ2wTSb/hf_20261106_032303_51fdbac1-c3f5-4d9a-bd73-ea96225cbd6e_min.webp',
      ],
      datasetImages: [
        'https://d8j0ntlcm91z4.cloudfront.net/user_336JgWTlqHQHPYleCS3LEJ2wTSb/hf_20261106_031408_f1089536-3a8f-43ee-b523-6b9a1d85812d_min.webp',
      ],
      createdAt: 'Curated Preset',
      isCurated: true,
    },
  ];

  // Quick seed from vault images for uploading
  const handleUploadFromAssets = () => {
    const samples = vaultItems.slice(0, 8).map((i) => i.imageUrl || i.fullImageUrl || '');
    setUploadedImages((prev) => [...prev, ...samples.filter(Boolean)]);
  };

  const handleStartCreate = () => {
    setBoardName('Burj Luxury & Evening Collection');
    setUploadedImages(vaultItems.slice(0, 24).map((i) => i.imageUrl || i.fullImageUrl || '').filter(Boolean));
    setViewState('create');
  };

  const handleCreateMoodboardFinal = () => {
    const newBoard: MoodBoardRecord = {
      id: `mb-${Date.now()}`,
      title: boardName || 'Untitled Moodboard',
      status: 'ready',
      imagesCount: uploadedImages.length || 5,
      sampleImages: uploadedImages.slice(0, 4),
      datasetImages: uploadedImages,
      createdAt: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      isCurated: false,
    };

    setMyBoards((prev) => [newBoard, ...prev]);
    setViewState('hub');
    setActiveTab('my');
  };

  const handleDeleteBoard = (id: string) => {
    setMyBoards((prev) => prev.filter((b) => b.id !== id));
    if (selectedBoard?.id === id) setSelectedBoard(null);
    setMenuOpenId(null);
  };

  return (
    <div className="flex-1 w-full bg-[#08080a] text-white flex flex-col min-h-[calc(100vh-4rem)] select-none">
      
      {/* =================================================================== */}
      {/* 1. HUB VIEW: HERO + MY MOODBOARDS / CURATED TABS                    */}
      {/* =================================================================== */}
      {viewState === 'hub' && (
        <div className="flex-1 flex flex-col max-w-7xl mx-auto w-full px-4 sm:px-6 py-8">
          
          {/* Top Hero Section */}
          <div className="flex flex-col items-center justify-center text-center pt-4 pb-12">
            {/* 4 Fanout Collage Cards */}
            <div className="flex items-center justify-center -space-x-4 mb-8">
              <div className="w-24 sm:w-28 aspect-[3/4] rounded-2xl bg-[#1a1a22] border-2 border-white/20 overflow-hidden shadow-2xl transform -rotate-12 -translate-y-2 hover:rotate-0 transition-transform">
                <img
                  src="https://d8j0ntlcm91z4.cloudfront.net/user_336JgWTlqHQHPYleCS3LEJ2wTSb/hf_20261107_214641_9271be3f-9133-4616-80ad-78f86ba445f9_min.webp"
                  alt="Fanout 1"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="w-24 sm:w-28 aspect-[3/4] rounded-2xl bg-[#1a1a22] border-2 border-white/20 overflow-hidden shadow-2xl transform -rotate-6 translate-y-1 hover:rotate-0 transition-transform">
                <img
                  src="https://d8j0ntlcm91z4.cloudfront.net/user_336JgWTlqHQHPYleCS3LEJ2wTSb/hf_20261107_214641_787510e3-c547-4994-b0ef-c7004c10e5d7_min.webp"
                  alt="Fanout 2"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="w-24 sm:w-28 aspect-[3/4] rounded-2xl bg-[#1a1a22] border-2 border-white/20 overflow-hidden shadow-2xl transform rotate-6 translate-y-1 hover:rotate-0 transition-transform">
                <img
                  src="https://d8j0ntlcm91z4.cloudfront.net/user_336JgWTlqHQHPYleCS3LEJ2wTSb/hf_20261107_214641_cdca0579-8fc8-4739-a572-c0a4d5c6ce2c_min.webp"
                  alt="Fanout 3"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="w-24 sm:w-28 aspect-[3/4] rounded-2xl bg-[#1a1a22] border-2 border-white/20 overflow-hidden shadow-2xl transform rotate-12 -translate-y-2 hover:rotate-0 transition-transform">
                <img
                  src="https://d8j0ntlcm91z4.cloudfront.net/user_336JgWTlqHQHPYleCS3LEJ2wTSb/hf_20261107_214641_ff3a423f-4e74-47b5-8f0b-7f6ab800e5eb_min.webp"
                  alt="Fanout 4"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>

            {/* Headline */}
            <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white uppercase">
              Create Your Moodboard
            </h1>
            <p className="text-xs sm:text-sm text-neutral-400 max-w-xl mt-3 leading-relaxed">
              Turn your references into a focused moodboard that defines style, tone, consistent details, and creative direction.
            </p>

            {/* Primary Action Button */}
            <button
              onClick={handleStartCreate}
              className="mt-6 flex items-center gap-2 px-6 py-3 rounded-2xl bg-[#d1fe17] text-black font-extrabold text-xs shadow-[0_0_25px_rgba(209,254,23,0.35)] hover:scale-105 active:scale-95 transition-all cursor-pointer"
            >
              <span>Build your moodboard</span>
              <svg className="w-4 h-4 text-black" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="m12 3-1.9 5.8a2 2 0 0 1-1.3 1.3L3 12l5.8 1.9a2 2 0 0 1 1.3 1.3L12 21l1.9-5.8a2 2 0 0 1 1.3-1.3L21 12l-5.8-1.9a2 2 0 0 1-1.3-1.3Z" />
              </svg>
            </button>
          </div>



          {/* UNIFIED MINIMALIST MOODBOARD GRID MATCHING REFERENCE SCREENSHOT */}
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 pt-2 pb-16">
            {/* User created boards prepended */}
            {myBoards.map((board) => (
              <div
                key={board.id}
                onClick={() => setSelectedBoard(board)}
                className="group relative aspect-[4/3] rounded-2xl overflow-hidden bg-[#121217] border border-white/10 hover:border-white/30 transition-all cursor-pointer shadow-lg select-none"
              >
                <img
                  src={board.sampleImages[0] || (vaultItems.length > 0 ? vaultItems[0].imageUrl : '')}
                  alt={board.title}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.02]"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent pointer-events-none" />
                <div className="absolute bottom-3.5 left-4 right-4 pointer-events-none">
                  <span className="text-xs sm:text-sm font-bold text-white tracking-wide">
                    {board.title}
                  </span>
                </div>
              </div>
            ))}

            {/* Curated Reference Presets */}
            {curatedBoards.map((board) => (
              <div
                key={board.id}
                onClick={() => setSelectedBoard(board)}
                className="group relative aspect-[4/3] rounded-2xl overflow-hidden bg-[#121217] border border-white/10 hover:border-white/30 transition-all cursor-pointer shadow-lg select-none"
              >
                <img
                  src={board.sampleImages[0]}
                  alt={board.title}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.02]"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent pointer-events-none" />
                <div className="absolute bottom-3.5 left-4 right-4 pointer-events-none">
                  <span className="text-xs sm:text-sm font-bold text-white tracking-wide">
                    {board.title}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* 2. CREATION STUDIO VIEW (Moodboard / New)                           */}
      {/* =================================================================== */}
      {viewState === 'create' && (
        <div className="flex-1 flex flex-col md:flex-row w-full h-[calc(100vh-4rem)] overflow-hidden">
          
          {/* Main Left/Center Upload Area */}
          <section className="flex-1 flex flex-col p-4 sm:p-6 overflow-y-auto no-scrollbar">
            {/* Breadcrumb */}
            <div className="flex items-center gap-2 text-xs text-neutral-400 mb-4">
              <button
                onClick={() => setViewState('hub')}
                className="hover:text-white transition-colors cursor-pointer"
              >
                Moodboard
              </button>
              <span>/</span>
              <span className="text-white font-medium">New</span>
            </div>

            {/* Top Upload Actions */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
              <button
                onClick={() => setShowAgreementModal(true)}
                className="flex flex-col items-center justify-center p-8 rounded-2xl border-2 border-dashed border-white/15 bg-white/[0.02] hover:bg-white/[0.05] hover:border-[#d1fe17]/50 transition-all cursor-pointer group"
              >
                <div className="w-10 h-10 rounded-xl bg-white/5 group-hover:bg-[#d1fe17]/20 text-neutral-400 group-hover:text-[#d1fe17] flex items-center justify-center mb-2 transition-all">
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <line x1="12" y1="5" x2="12" y2="19" />
                    <line x1="5" y1="12" x2="19" y2="12" />
                  </svg>
                </div>
                <span className="text-xs font-bold text-white">Upload images</span>
                <span className="text-[10px] text-neutral-500 mt-0.5">PNG, JPG, or WEBP</span>
              </button>

              <button
                onClick={handleUploadFromAssets}
                className="flex flex-col items-center justify-center p-8 rounded-2xl border border-white/10 bg-white/[0.02] hover:bg-white/[0.05] hover:border-white/20 transition-all cursor-pointer group"
              >
                <div className="w-10 h-10 rounded-xl bg-white/5 group-hover:bg-white/10 text-neutral-400 group-hover:text-white flex items-center justify-center mb-2 transition-all">
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M4 4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2h-8l-2-2H4z" />
                  </svg>
                </div>
                <span className="text-xs font-bold text-white">Upload from assets</span>
                <span className="text-[10px] text-neutral-500 mt-0.5">Choose from prompt vault assets</span>
              </button>
            </div>

            {/* Uploaded Images Preview Strip */}
            {uploadedImages.length > 0 && (
              <div className="mb-6">
                <div className="flex items-center justify-between text-xs mb-2">
                  <span className="text-neutral-300 font-semibold">Uploaded Images ({uploadedImages.length})</span>
                  <button
                    onClick={() => setUploadedImages([])}
                    className="text-[11px] text-rose-400 hover:underline cursor-pointer"
                  >
                    Clear All
                  </button>
                </div>
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                  {uploadedImages.map((src, idx) => (
                    <div
                      key={idx}
                      className="group relative aspect-[3/4] rounded-xl overflow-hidden bg-white/5 border border-white/10"
                    >
                      <img src={src} alt="" className="w-full h-full object-cover" />
                      <button
                        onClick={() => setUploadedImages((prev) => prev.filter((_, i) => i !== idx))}
                        className="absolute top-1 right-1 p-1 rounded-md bg-black/60 hover:bg-rose-600 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                          <line x1="18" y1="6" x2="6" y2="18" />
                          <line x1="6" y1="6" x2="18" y2="18" />
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Guidelines: Recommended vs Avoid (Matching reference screenshot) */}
            <div className="mt-auto pt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Recommended Box */}
              <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/10 space-y-3">
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                    <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white">Recommended:</h4>
                    <p className="text-[10px] text-neutral-400">20+ photos, one cohesive style</p>
                  </div>
                </div>

                <div className="grid grid-cols-4 gap-1.5">
                  <img src="https://d8j0ntlcm91z4.cloudfront.net/user_336JgWTlqHQHPYleCS3LEJ2wTSb/hf_20261107_214641_9271be3f-9133-4616-80ad-78f86ba445f9_min.webp" className="aspect-[3/4] rounded-lg object-cover" alt="" />
                  <img src="https://d8j0ntlcm91z4.cloudfront.net/user_336JgWTlqHQHPYleCS3LEJ2wTSb/hf_20261107_214641_787510e3-c547-4994-b0ef-c7004c10e5d7_min.webp" className="aspect-[3/4] rounded-lg object-cover" alt="" />
                  <img src="https://d8j0ntlcm91z4.cloudfront.net/user_336JgWTlqHQHPYleCS3LEJ2wTSb/hf_20261107_214641_cdca0579-8fc8-4739-a572-c0a4d5c6ce2c_min.webp" className="aspect-[3/4] rounded-lg object-cover" alt="" />
                  <img src="https://d8j0ntlcm91z4.cloudfront.net/user_336JgWTlqHQHPYleCS3LEJ2wTSb/hf_20261107_214641_ff3a423f-4e74-47b5-8f0b-7f6ab800e5eb_min.webp" className="aspect-[3/4] rounded-lg object-cover" alt="" />
                </div>
              </div>

              {/* Avoid Box */}
              <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/10 space-y-3">
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded-full bg-rose-500/20 text-rose-400 flex items-center justify-center">
                    <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                      <line x1="18" y1="6" x2="6" y2="18" />
                      <line x1="6" y1="6" x2="18" y2="18" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white">Avoid:</h4>
                    <p className="text-[10px] text-neutral-400">Mixed styles, inconsistent quality</p>
                  </div>
                </div>

                <div className="grid grid-cols-4 gap-1.5">
                  <img src="https://d8j0ntlcm91z4.cloudfront.net/user_336JgWTlqHQHPYleCS3LEJ2wTSb/hf_20261106_032931_d976d760-0475-445e-9ab3-2bb95860981c_min.webp" className="aspect-[3/4] rounded-lg object-cover border border-rose-500/40" alt="" />
                  <img src="https://d8j0ntlcm91z4.cloudfront.net/user_336JgWTlqHQHPYleCS3LEJ2wTSb/hf_20261106_032629_50852861-9ff2-406b-81f9-ef02fb7a2ab5_min.webp" className="aspect-[3/4] rounded-lg object-cover border border-rose-500/40" alt="" />
                  <img src="https://d8j0ntlcm91z4.cloudfront.net/user_336JgWTlqHQHPYleCS3LEJ2wTSb/hf_20261106_031931_f77b8f84-791f-4908-bcf7-569b64fb735f_min.webp" className="aspect-[3/4] rounded-lg object-cover border border-rose-500/40" alt="" />
                  <img src="https://d8j0ntlcm91z4.cloudfront.net/user_336JgWTlqHQHPYleCS3LEJ2wTSb/hf_20261106_030515_d8028277-1131-4685-9254-f47cd2dc645e_min.webp" className="aspect-[3/4] rounded-lg object-cover border border-rose-500/40" alt="" />
                </div>
              </div>
            </div>
          </section>

          {/* Right Sidebar: Name + Radial Metric Gauges + Create CTA */}
          <aside className="w-full md:w-80 border-t md:border-t-0 md:border-l border-white/10 bg-[#0c0c10] p-6 flex flex-col justify-between shrink-0 h-full overflow-y-auto no-scrollbar">
            <div className="space-y-6">
              {/* Moodboard Name Input */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-neutral-300">Moodboard name</label>
                <input
                  type="text"
                  value={boardName}
                  onChange={(e) => setBoardName(e.target.value)}
                  placeholder="e.g. Luxury Nightlife Collection"
                  className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-[#d1fe17]"
                />
              </div>

              {/* Metric Gauge 1: Number of images */}
              <div className="space-y-2">
                <div className="flex items-center gap-1.5 text-xs font-medium text-neutral-300">
                  <svg className="w-3.5 h-3.5 text-neutral-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="3" width="18" height="18" rx="2" />
                    <circle cx="8.5" cy="8.5" r="1.5" />
                    <polyline points="21 15 16 10 5 21" />
                  </svg>
                  <span>Number of images</span>
                </div>

                <div className="flex flex-col items-center justify-center p-4 rounded-2xl bg-white/[0.02] border border-white/10">
                  {/* Circular Radial Counter */}
                  <div className="relative w-24 h-24 flex items-center justify-center">
                    <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                      <path
                        className="text-white/10"
                        strokeWidth="3.5"
                        stroke="currentColor"
                        fill="none"
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      />
                      <path
                        className="text-rose-500"
                        strokeDasharray={`${Math.min((uploadedImages.length / 80) * 100, 100)}, 100`}
                        strokeWidth="3.5"
                        strokeLinecap="round"
                        stroke="currentColor"
                        fill="none"
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      />
                    </svg>
                    <div className="absolute flex flex-col items-center text-center">
                      <span className="text-xs font-bold text-white font-mono">{uploadedImages.length}/80</span>
                      <span className="text-[9px] px-1.5 py-0.2 rounded bg-rose-500/20 text-rose-400 font-bold uppercase">
                        {uploadedImages.length >= 20 ? 'Optimal' : 'Bad'}
                      </span>
                    </div>
                  </div>
                  <p className="text-[10px] text-neutral-400 mt-2 text-center">
                    Upload 20+ photos for best results
                  </p>
                </div>
              </div>

              {/* Metric Gauge 2: Quality */}
              <div className="space-y-2">
                <div className="flex items-center gap-1.5 text-xs font-medium text-neutral-300">
                  <svg className="w-3.5 h-3.5 text-neutral-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                  </svg>
                  <span>Quality</span>
                </div>

                <div className="flex flex-col items-center justify-center p-4 rounded-2xl bg-white/[0.02] border border-white/10">
                  <div className="relative w-24 h-24 flex items-center justify-center">
                    <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                      <path
                        className="text-white/10"
                        strokeWidth="3.5"
                        stroke="currentColor"
                        fill="none"
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      />
                      <path
                        className="text-[#d1fe17]"
                        strokeDasharray="90, 100"
                        strokeWidth="3.5"
                        strokeLinecap="round"
                        stroke="currentColor"
                        fill="none"
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      />
                    </svg>
                    <div className="absolute flex flex-col items-center text-center">
                      <span className="text-xs font-bold text-white font-mono">3024 px</span>
                      <span className="text-[9px] px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-400 font-bold uppercase">
                        Perfect
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom CTA */}
            <div className="pt-6">
              <button
                onClick={handleCreateMoodboardFinal}
                className="w-full py-3 rounded-2xl bg-[#d1fe17] text-black font-extrabold text-xs shadow-xl flex items-center justify-center gap-2 hover:bg-[#bce414] active:scale-95 transition-all cursor-pointer"
              >
                <span>Create moodboard</span>
                <svg className="w-3.5 h-3.5 text-black" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="m12 3-1.9 5.8a2 2 0 0 1-1.3 1.3L3 12l5.8 1.9a2 2 0 0 1 1.3 1.3L12 21l1.9-5.8a2 2 0 0 1 1.3-1.3L21 12l-5.8-1.9a2 2 0 0 1-1.3-1.3Z" />
                </svg>
                <span className="ml-1 font-mono">25</span>
              </button>
            </div>
          </aside>
        </div>
      )}

      {/* =================================================================== */}
      {/* 3. DETAILS MODAL (Generations vs Dataset tabs)                      */}
      {/* =================================================================== */}
      {selectedBoard && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-3xl rounded-3xl bg-[#121217] border border-white/15 p-6 shadow-2xl flex flex-col max-h-[85vh] overflow-hidden">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-4 border-b border-white/10 shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl overflow-hidden bg-black grid grid-cols-2 grid-rows-2 gap-0.5 p-0.5 shrink-0">
                  {selectedBoard.sampleImages.slice(0, 4).map((src, i) => (
                    <img key={i} src={src} alt="" className="w-full h-full object-cover" />
                  ))}
                </div>
                <div>
                  <span className="text-[10px] text-neutral-400 uppercase tracking-wider font-mono">Preset name</span>
                  <h3 className="text-base font-bold text-white leading-tight">{selectedBoard.title}</h3>
                </div>
                <button
                  onClick={() => onReturnToVault()}
                  className="ml-3 px-3 py-1.5 rounded-xl bg-[#d1fe17] text-black font-bold text-xs hover:bg-[#bce414] transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <svg className="w-3.5 h-3.5 text-black" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="m12 3-1.9 5.8a2 2 0 0 1-1.3 1.3L3 12l5.8 1.9a2 2 0 0 1 1.3 1.3L12 21l1.9-5.8a2 2 0 0 1 1.3-1.3L21 12l-5.8-1.9a2 2 0 0 1-1.3-1.3Z" />
                  </svg>
                  <span>Use preset</span>
                </button>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleDeleteBoard(selectedBoard.id)}
                  className="p-2 rounded-xl bg-white/5 hover:bg-rose-500/20 text-neutral-400 hover:text-rose-400 transition-colors"
                  title="Delete moodboard"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="3 6 5 6 21 6" />
                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                  </svg>
                </button>
                <button
                  onClick={() => setSelectedBoard(null)}
                  className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-neutral-400 hover:text-white transition-colors"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Modal Tabs */}
            <div className="flex items-center gap-2 pt-4 pb-3 shrink-0">
              <button
                onClick={() => setDetailsTab('generations')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  detailsTab === 'generations'
                    ? 'bg-white/10 text-white border border-white/15'
                    : 'text-neutral-400 hover:text-white'
                }`}
              >
                Generations
              </button>
              <button
                onClick={() => setDetailsTab('dataset')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  detailsTab === 'dataset'
                    ? 'bg-white/10 text-white border border-white/15'
                    : 'text-neutral-400 hover:text-white'
                }`}
              >
                Dataset
              </button>
            </div>

            {/* Modal Images Grid */}
            <div className="flex-1 overflow-y-auto no-scrollbar grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
              {(detailsTab === 'generations' ? selectedBoard.sampleImages : selectedBoard.datasetImages).map((src, i) => (
                <div key={i} className="aspect-[3/4] rounded-xl overflow-hidden bg-white/5 border border-white/10">
                  <img src={src} alt="" className="w-full h-full object-cover" />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* 4. MEDIA UPLOAD AGREEMENT MODAL                                     */}
      {/* =================================================================== */}
      {showAgreementModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-md rounded-3xl bg-[#121217] border border-white/15 p-6 shadow-2xl space-y-4">
            <h3 className="text-base font-extrabold text-white uppercase tracking-wide">Media Upload Agreement</h3>

            <div className="space-y-3 text-xs text-neutral-300">
              <div className="space-y-1">
                <p className="font-bold text-white">This process follows terms of service</p>
                <p className="text-neutral-400 text-[11px]">By starting, you agree to our terms. Violations may lead to account suspension.</p>
              </div>

              <div className="space-y-1">
                <p className="font-bold text-white">People in my images have given consent</p>
                <p className="text-neutral-400 text-[11px]">You must have permission for every visible face. Use AI responsibly.</p>
              </div>

              <div className="space-y-1">
                <p className="font-bold text-white">I understand training uses compute credits</p>
                <p className="text-neutral-400 text-[11px]">Training takes time and consumes credits. Track usage in your profile.</p>
              </div>
            </div>

            <label className="flex items-center gap-2.5 pt-2 text-xs text-neutral-300 cursor-pointer">
              <input
                type="checkbox"
                checked={agreementChecked}
                onChange={(e) => setAgreementChecked(e.target.checked)}
                className="w-4 h-4 rounded accent-[#d1fe17] cursor-pointer"
              />
              <span>I've read and agree with the above</span>
            </label>

            <div className="flex items-center gap-2 pt-2">
              <button
                onClick={() => setShowAgreementModal(false)}
                className="flex-1 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-semibold cursor-pointer"
              >
                Cancel
              </button>
              <button
                disabled={!agreementChecked}
                onClick={() => {
                  handleUploadFromAssets();
                  setShowAgreementModal(false);
                }}
                className={`flex-1 py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all ${
                  agreementChecked
                    ? 'bg-[#d1fe17] text-black hover:bg-[#bce414] cursor-pointer shadow-lg'
                    : 'bg-white/10 text-neutral-500 cursor-not-allowed'
                }`}
              >
                <span>Upload</span>
                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="17 8 12 3 7 8" />
                  <line x1="12" y1="3" x2="12" y2="15" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
