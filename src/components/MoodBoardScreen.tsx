import React, { useState } from 'react';
import { VaultItem } from '../types';

export interface MoodBoard {
  id: string;
  title: string;
  description: string;
  tags: string[];
  dropIds: string[];
  updatedAt: string;
}

interface MoodBoardScreenProps {
  vaultItems: VaultItem[];
  onReturnToVault: () => void;
  onSelectItem: (item: VaultItem) => void;
  onAnimateReel?: (board: MoodBoard) => void;
}

export const MoodBoardScreen: React.FC<MoodBoardScreenProps> = ({
  vaultItems,
  onReturnToVault,
  onSelectItem,
  onAnimateReel,
}) => {
  // Pre-populated initial boards matching our theme
  const [boards, setBoards] = useState<MoodBoard[]>(() => {
    try {
      const saved = localStorage.getItem('halalfans_moodboards');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }

    // Default boards with real item IDs from the vault
    const defaultIds = vaultItems.slice(0, 14).map(i => i.id);
    const secondIds = vaultItems.slice(14, 23).map(i => i.id);

    return [
      {
        id: 'board-1',
        title: 'Dubai Nightlife & Satin Abayas',
        description: 'High flash photography, silk and satin modest dresses against Burj Al Arab and evening cabanas.',
        tags: ['#ModestLuxury', '#NightlifeFlash', '#BurjAlArab'],
        dropIds: defaultIds.length > 0 ? defaultIds : ['drop-1', 'drop-2', 'drop-3', 'drop-4'],
        updatedAt: 'Updated 2h ago',
      },
      {
        id: 'board-2',
        title: 'Modest Fall & Trench Coats',
        description: 'Earth tones, tailored trench coats, silk scarves and gold jewelry.',
        tags: ['#FallFashion', '#Outerwear', '#EarthTones'],
        dropIds: secondIds.length > 0 ? secondIds : ['drop-5', 'drop-6', 'drop-7', 'drop-8'],
        updatedAt: 'Updated yesterday',
      },
    ];
  });

  const [activeBoard, setActiveBoard] = useState<MoodBoard | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  // Form states for creating/editing
  const [boardTitle, setBoardTitle] = useState('');
  const [boardDesc, setBoardDesc] = useState('');
  const [boardTags, setBoardTags] = useState<string[]>(['#ModestLuxury']);
  const [selectedDropIds, setSelectedDropIds] = useState<Set<string>>(new Set());

  const handleOpenCreate = () => {
    setBoardTitle('New Mood Board');
    setBoardDesc('');
    setBoardTags(['#ModestLuxury']);
    setSelectedDropIds(new Set(vaultItems.slice(0, 4).map(i => i.id)));
    setIsCreating(true);
  };

  const handleOpenEdit = (board: MoodBoard) => {
    setActiveBoard(board);
    setBoardTitle(board.title);
    setBoardDesc(board.description);
    setBoardTags(board.tags);
    setSelectedDropIds(new Set(board.dropIds));
    setIsCreating(true);
  };

  const toggleDropSelection = (id: string) => {
    setSelectedDropIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleSaveBoard = () => {
    if (!boardTitle.trim()) return;

    if (activeBoard) {
      // Edit existing
      const updated = boards.map(b =>
        b.id === activeBoard.id
          ? {
              ...b,
              title: boardTitle,
              description: boardDesc,
              tags: boardTags,
              dropIds: Array.from(selectedDropIds),
              updatedAt: 'Updated just now',
            }
          : b
      );
      setBoards(updated);
      localStorage.setItem('halalfans_moodboards', JSON.stringify(updated));
    } else {
      // Create new
      const newBoard: MoodBoard = {
        id: `board-${Date.now()}`,
        title: boardTitle,
        description: boardDesc,
        tags: boardTags,
        dropIds: Array.from(selectedDropIds),
        updatedAt: 'Created just now',
      };
      const updated = [newBoard, ...boards];
      setBoards(updated);
      localStorage.setItem('halalfans_moodboards', JSON.stringify(updated));
    }

    setIsCreating(false);
    setActiveBoard(null);
  };

  const handleExportJSON = (board: MoodBoard) => {
    const boardItems = vaultItems.filter(i => board.dropIds.includes(i.id));
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify({
      title: board.title,
      description: board.description,
      tags: board.tags,
      dropsCount: boardItems.length,
      prompts: boardItems.map(i => ({ id: i.id, prompt: i.prompt, model: i.model, aspectRatio: i.aspectRatio })),
    }, null, 2));

    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `${board.title.replace(/\s+/g, '_')}_prompts.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="w-full max-w-[1920px] mx-auto p-6 md:p-10 space-y-8 animate-in fade-in duration-200">
      {/* Top Header Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-6">
        <div>
          <div className="flex items-center gap-3">
            <button
              onClick={onReturnToVault}
              className="text-xs font-semibold text-neutral-400 hover:text-white bg-white/5 hover:bg-white/10 px-3 py-1.5 rounded-xl border border-white/10 transition-colors flex items-center gap-1.5"
            >
              <span>←</span>
              <span>Back to Prompt Vault</span>
            </button>
            <span className="text-xs text-neutral-600">/</span>
            <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">Curation Hub</span>
          </div>

          <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight mt-2">
            Mood Boards
          </h1>
          <p className="text-xs md:text-sm text-neutral-400 mt-1">
            Organize drops into themed mood boards, export prompt packs, or batch-render video reels.
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="px-5 py-2.5 bg-[#d1fe17] text-black font-extrabold text-xs rounded-xl shadow-lg shadow-[#d1fe17]/25 flex items-center gap-2 hover:scale-[1.02] active:scale-95 transition-all self-start md:self-auto"
        >
          <span className="text-sm">+</span>
          <span>Create Mood Board</span>
        </button>
      </div>

      {/* Mood Boards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {boards.map((board) => {
          const boardDrops = vaultItems.filter(i => board.dropIds.includes(i.id)).slice(0, 4);

          return (
            <div
              key={board.id}
              onClick={() => handleOpenEdit(board)}
              className="bg-[#111116] border border-white/10 hover:border-white/25 rounded-2xl p-5 space-y-4 cursor-pointer transition-all hover:shadow-2xl hover:shadow-black/50 group"
            >
              {/* 4-Card Collage Preview */}
              <div className="grid grid-cols-2 gap-2 aspect-[4/3] rounded-xl overflow-hidden bg-black/40 relative">
                {boardDrops.length > 0 ? (
                  boardDrops.map((drop, idx) => (
                    <img
                      key={drop.id || idx}
                      src={drop.imageUrl}
                      alt={drop.title || 'Drop'}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ))
                ) : (
                  <div className="col-span-2 flex items-center justify-center text-xs text-neutral-500">
                    No drops added yet
                  </div>
                )}
                <div className="absolute top-2 right-2 px-2 py-0.5 rounded-md bg-black/80 backdrop-blur-md text-[10px] font-mono text-[#d1fe17] font-bold border border-white/10">
                  {board.dropIds.length} Drops
                </div>
              </div>

              {/* Title & Metadata */}
              <div className="space-y-1.5">
                <h3 className="text-base font-bold text-white group-hover:text-[#d1fe17] transition-colors">
                  {board.title}
                </h3>
                <p className="text-xs text-neutral-400 line-clamp-2">
                  {board.description || 'No description provided.'}
                </p>
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {board.tags.map(tag => (
                    <span key={tag} className="text-[10px] bg-white/5 text-neutral-300 px-2 py-0.5 rounded-md font-mono">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              {/* Quick Actions Footer */}
              <div className="flex items-center justify-between pt-3 border-t border-white/5 text-xs">
                <span className="text-neutral-500 text-[11px] font-mono">{board.updatedAt}</span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleExportJSON(board);
                    }}
                    className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-neutral-300 font-semibold text-[11px]"
                  >
                    JSON
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (onAnimateReel) onAnimateReel(board);
                      else alert(`Batch Kling video generation queued for ${board.title}`);
                    }}
                    className="px-2.5 py-1 rounded-lg bg-amber-400/10 hover:bg-amber-400/20 text-amber-300 font-semibold text-[11px] border border-amber-400/20"
                  >
                    🎬 Animate Reel
                  </button>
                </div>
              </div>
            </div>
          );
        })}

        {/* Create New Mood Board Card */}
        <div
          onClick={handleOpenCreate}
          className="border-2 border-dashed border-white/10 hover:border-[#d1fe17]/50 rounded-2xl p-6 flex flex-col items-center justify-center text-center space-y-3 cursor-pointer transition-all aspect-[4/3] bg-white/[0.01] hover:bg-[#d1fe17]/[0.02]"
        >
          <div className="w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center text-neutral-400 text-2xl font-bold">
            +
          </div>
          <div>
            <h3 className="text-sm font-bold text-white">Create New Mood Board</h3>
            <p className="text-xs text-neutral-500 mt-1">Select from {vaultItems.length.toLocaleString()} drops</p>
          </div>
        </div>
      </div>

      {/* ================= MODAL: CREATE / EDIT MOOD BOARD STUDIO ================= */}
      {isCreating && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-6xl max-h-[90vh] bg-[#0c0c10] border border-white/15 rounded-3xl overflow-hidden shadow-2xl flex flex-col">
            {/* Modal Header */}
            <div className="px-8 py-4 bg-[#111116] border-b border-white/10 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-xs font-bold uppercase tracking-wider text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded-md">
                  {activeBoard ? 'Edit Mood Board' : 'New Mood Board'}
                </span>
                <span className="text-sm font-bold text-white">Select drops to curate</span>
              </div>

              <div className="flex items-center gap-4">
                <span className="text-xs text-neutral-400">
                  <strong className="text-white">{selectedDropIds.size}</strong> drops selected
                </span>
                <button
                  onClick={() => setIsCreating(false)}
                  className="px-4 py-2 bg-white/10 hover:bg-white/15 text-white font-medium text-xs rounded-xl"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveBoard}
                  className="px-5 py-2 bg-[#d1fe17] text-black font-extrabold text-xs rounded-xl shadow-lg shadow-[#d1fe17]/25"
                >
                  Save Mood Board →
                </button>
              </div>
            </div>

            {/* Modal Content: Split Sidebar & Grid */}
            <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
              {/* Left Config Panel */}
              <div className="w-full lg:w-[360px] bg-[#0e0e12] border-r border-white/10 p-6 space-y-5 overflow-y-auto">
                <div>
                  <label className="text-xs font-bold text-neutral-400 uppercase tracking-wider block mb-1.5">
                    Board Title
                  </label>
                  <input
                    type="text"
                    value={boardTitle}
                    onChange={(e) => setBoardTitle(e.target.value)}
                    placeholder="e.g. Dubai Nightlife & Satin"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white font-medium focus:outline-none focus:border-[#d1fe17]"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-neutral-400 uppercase tracking-wider block mb-1.5">
                    Description & Notes
                  </label>
                  <textarea
                    rows={3}
                    value={boardDesc}
                    onChange={(e) => setBoardDesc(e.target.value)}
                    placeholder="Aesthetic references, lighting, color palette..."
                    className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-xs text-neutral-200 resize-none focus:outline-none focus:border-[#d1fe17]"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-neutral-400 uppercase tracking-wider block mb-1.5">
                    Aesthetic Tags
                  </label>
                  <div className="flex flex-wrap gap-1.5">
                    {boardTags.map(tag => (
                      <span
                        key={tag}
                        onClick={() => setBoardTags(boardTags.filter(t => t !== tag))}
                        className="text-xs bg-[#d1fe17]/15 text-[#d1fe17] border border-[#d1fe17]/30 px-2.5 py-1 rounded-lg font-semibold cursor-pointer hover:bg-red-500/20 hover:text-red-400 hover:border-red-500/30"
                      >
                        {tag} ✕
                      </span>
                    ))}
                    <button
                      onClick={() => {
                        const tag = prompt('Enter new aesthetic tag (e.g. #Editorial):');
                        if (tag) setBoardTags([...boardTags, tag.startsWith('#') ? tag : `#${tag}`]);
                      }}
                      className="text-xs bg-white/5 text-neutral-300 border border-white/10 px-2.5 py-1 rounded-lg hover:border-white/30"
                    >
                      + Add Tag
                    </button>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-white/5 border border-white/5 space-y-2 text-xs">
                  <span className="font-bold text-neutral-300 block">Board Actions</span>
                  <div className="flex items-center justify-between text-neutral-400">
                    <span>Export JSON</span>
                    <button
                      onClick={() => handleExportJSON({ id: 'temp', title: boardTitle, description: boardDesc, tags: boardTags, dropIds: Array.from(selectedDropIds), updatedAt: '' })}
                      className="text-[#d1fe17] font-bold"
                    >
                      Download
                    </button>
                  </div>
                </div>

                <button
                  onClick={handleSaveBoard}
                  className="w-full py-3 bg-[#d1fe17] text-black font-extrabold text-xs rounded-xl shadow-lg shadow-[#d1fe17]/25"
                >
                  ✨ Save Mood Board ({selectedDropIds.size} Drops)
                </button>
              </div>

              {/* Right Selection Grid */}
              <div className="flex-1 p-6 overflow-y-auto space-y-4">
                <div className="flex items-center justify-between text-xs text-neutral-400">
                  <span>Click any image to add or remove it from this mood board</span>
                  <span className="text-white font-mono">{vaultItems.length.toLocaleString()} Total Drops</span>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {vaultItems.map((item) => {
                    const isSelected = selectedDropIds.has(item.id);

                    return (
                      <div
                        key={item.id}
                        onClick={() => toggleDropSelection(item.id)}
                        className={`relative rounded-xl overflow-hidden aspect-[3/4] cursor-pointer border-2 transition-all ${
                          isSelected
                            ? 'border-[#d1fe17] shadow-lg shadow-[#d1fe17]/20 scale-[0.98]'
                            : 'border-transparent hover:border-white/30 opacity-75 hover:opacity-100'
                        }`}
                      >
                        <img
                          src={item.imageUrl}
                          alt={item.title || 'Drop'}
                          className="w-full h-full object-cover"
                          loading="lazy"
                        />
                        {isSelected && (
                          <div className="absolute top-2.5 right-2.5 w-6 h-6 rounded-full bg-[#d1fe17] text-black flex items-center justify-center font-black text-xs shadow-md">
                            ✓
                          </div>
                        )}
                        <div className="absolute inset-x-0 bottom-0 p-2.5 bg-gradient-to-t from-black/90 to-transparent text-[11px] font-medium text-white line-clamp-1">
                          {item.title || item.prompt.slice(0, 30)}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
