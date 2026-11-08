import React, { useState, useMemo, useEffect } from 'react';
import { VaultItem } from '../types';

export type AssetTab =
  | 'assets'
  | 'projects'
  | 'favourites'
  | 'elements'
  | 'trash'
  | 'images'
  | 'video'
  | 'audio'
  | 'enhanced';

export interface ProjectItem {
  id: string;
  title: string;
  category: 'Cinema studio' | 'Marketing Studio' | 'Ads Studio' | 'Contests';
  isPrivate: boolean;
  coverUrl?: string;
  createdAt: string;
}

interface AssetsScreenProps {
  vaultItems: VaultItem[];
  favorites: Set<string>;
  onToggleFavorite: (id: string) => void;
  onSelectItem: (item: VaultItem) => void;
  onReturnToVault: () => void;
  onNavigateToStudio?: (studio: 'create' | 'video' | 'influencer') => void;
}

export const AssetsScreen: React.FC<AssetsScreenProps> = ({
  vaultItems,
  favorites,
  onToggleFavorite,
  onSelectItem,
  onReturnToVault,
  onNavigateToStudio,
}) => {
  const [activeTab, setActiveTab] = useState<AssetTab>('assets');
  const [searchQuery, setSearchQuery] = useState('');
  const [projectCategory, setProjectCategory] = useState<string>('All');
  const [viewColumns, setViewColumns] = useState<3 | 4 | 6>(4);
  const [selectedAssetIds, setSelectedAssetIds] = useState<Set<string>>(new Set());

  // Real data state backed by localStorage
  const [projects, setProjects] = useState<ProjectItem[]>(() => {
    try {
      const saved = localStorage.getItem('halalfans_projects');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [trashIds, setTrashIds] = useState<Set<string>>(() => {
    try {
      const saved = localStorage.getItem('halalfans_trash');
      return saved ? new Set(JSON.parse(saved)) : new Set();
    } catch {
      return new Set();
    }
  });

  const [videos] = useState<VaultItem[]>(() => {
    try {
      const saved = localStorage.getItem('halalfans_videos');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [audio] = useState<any[]>(() => {
    try {
      const saved = localStorage.getItem('halalfans_audio');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [enhancedIds] = useState<Set<string>>(() => {
    try {
      const saved = localStorage.getItem('halalfans_enhanced');
      return saved ? new Set(JSON.parse(saved)) : new Set();
    } catch {
      return new Set();
    }
  });

  const [elements] = useState<any[]>(() => {
    try {
      const saved = localStorage.getItem('halalfans_elements');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Project creation dialog state
  const [isCreatingProject, setIsCreatingProject] = useState(false);
  const [newProjectTitle, setNewProjectTitle] = useState('');
  const [newProjectCategory, setNewProjectCategory] = useState<ProjectItem['category']>('Cinema studio');
  const [newProjectPrivate, setNewProjectPrivate] = useState(true);

  // Sync trash to localStorage
  const saveTrash = (next: Set<string>) => {
    setTrashIds(next);
    try {
      localStorage.setItem('halalfans_trash', JSON.stringify(Array.from(next)));
    } catch (e) {
      console.error(e);
    }
  };

  const handleMoveToTrash = (ids: string[]) => {
    const next = new Set(trashIds);
    ids.forEach((id) => next.add(id));
    saveTrash(next);
    setSelectedAssetIds(new Set());
  };

  const handleRestoreFromTrash = (ids: string[]) => {
    const next = new Set(trashIds);
    ids.forEach((id) => next.delete(id));
    saveTrash(next);
    setSelectedAssetIds(new Set());
  };

  const handleEmptyTrash = () => {
    saveTrash(new Set());
    setSelectedAssetIds(new Set());
  };

  const handleCreateProject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProjectTitle.trim()) return;
    const newProj: ProjectItem = {
      id: `proj_${Date.now()}`,
      title: newProjectTitle.trim(),
      category: newProjectCategory,
      isPrivate: newProjectPrivate,
      createdAt: new Date().toISOString(),
    };
    const next = [newProj, ...projects];
    setProjects(next);
    try {
      localStorage.setItem('halalfans_projects', JSON.stringify(next));
    } catch (e) {
      console.error(e);
    }
    setNewProjectTitle('');
    setIsCreatingProject(false);
  };

  // Filter vault items: exclude trash
  const nonTrashVault = useMemo(() => {
    return vaultItems.filter((i) => !trashIds.has(i.id));
  }, [vaultItems, trashIds]);

  // Derived datasets for each tab
  const tabData = useMemo(() => {
    let list: VaultItem[] = [];

    if (activeTab === 'assets' || activeTab === 'images') {
      list = nonTrashVault;
    } else if (activeTab === 'favourites') {
      list = nonTrashVault.filter((i) => favorites.has(i.id));
    } else if (activeTab === 'enhanced') {
      list = nonTrashVault.filter((i) => enhancedIds.has(i.id));
    } else if (activeTab === 'video') {
      list = videos.filter((v) => !trashIds.has(v.id));
    } else if (activeTab === 'trash') {
      list = vaultItems.filter((i) => trashIds.has(i.id));
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (i) =>
          i.prompt.toLowerCase().includes(q) ||
          (i.title && i.title.toLowerCase().includes(q))
      );
    }

    return list;
  }, [activeTab, nonTrashVault, favorites, enhancedIds, videos, trashIds, vaultItems, searchQuery]);

  // Group items by date for natural timeline presentation
  const groupedByDate = useMemo(() => {
    const groups: { [date: string]: VaultItem[] } = {};

    tabData.forEach((item, index) => {
      // Derive clean date group
      let dateKey = 'Earlier Creations';
      if (item.createdAt) {
        try {
          const d = new Date(item.createdAt);
          if (!isNaN(d.getTime())) {
            dateKey = d.toLocaleDateString('en-US', {
              month: 'long',
              day: 'numeric',
              year: 'numeric',
            });
          }
        } catch {
          dateKey = 'Earlier Creations';
        }
      } else {
        // Fallback natural grouping
        if (index < 4) dateKey = 'Today';
        else if (index < 16) dateKey = 'November 5, 2026';
        else if (index < 32) dateKey = 'August 23, 2026';
        else dateKey = 'August 21, 2026';
      }

      if (!groups[dateKey]) groups[dateKey] = [];
      groups[dateKey].push(item);
    });

    return groups;
  }, [tabData]);

  // Selection handlers
  const toggleSelectAsset = (id: string) => {
    setSelectedAssetIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleSelectDateGroup = (items: VaultItem[]) => {
    const allSelected = items.every((i) => selectedAssetIds.has(i.id));
    setSelectedAssetIds((prev) => {
      const next = new Set(prev);
      if (allSelected) {
        items.forEach((i) => next.delete(i.id));
      } else {
        items.forEach((i) => next.add(i.id));
      }
      return next;
    });
  };

  // Badges counts
  const counts = {
    assets: nonTrashVault.length,
    projects: projects.length,
    favourites: nonTrashVault.filter((i) => favorites.has(i.id)).length,
    elements: elements.length,
    trash: trashIds.size,
    images: nonTrashVault.length,
    video: videos.filter((v) => !trashIds.has(v.id)).length,
    audio: audio.length,
    enhanced: nonTrashVault.filter((i) => enhancedIds.has(i.id)).length,
  };

  const navItemsTop: { id: AssetTab; label: string; count: number; icon: React.ReactNode }[] = [
    {
      id: 'assets',
      label: 'Assets',
      count: counts.assets,
      icon: (
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
          <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
          <line x1="12" y1="22.08" x2="12" y2="12" />
        </svg>
      ),
    },
    {
      id: 'projects',
      label: 'Projects',
      count: counts.projects,
      icon: (
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
        </svg>
      ),
    },
    {
      id: 'favourites',
      label: 'Favourites',
      count: counts.favourites,
      icon: (
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
        </svg>
      ),
    },
    {
      id: 'elements',
      label: 'Elements',
      count: counts.elements,
      icon: (
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="4" />
          <path d="M16 8v5a3 3 0 0 0 6 0v-1a10 10 0 1 0-3.92 7.94" />
        </svg>
      ),
    },
    {
      id: 'trash',
      label: 'Trash',
      count: counts.trash,
      icon: (
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="3 6 5 6 21 6" />
          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
        </svg>
      ),
    },
  ];

  const navItemsTools: { id: AssetTab; label: string; count: number; icon: React.ReactNode }[] = [
    {
      id: 'images',
      label: 'Images',
      count: counts.images,
      icon: (
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
          <circle cx="9" cy="9" r="2" />
          <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
        </svg>
      ),
    },
    {
      id: 'video',
      label: 'Video',
      count: counts.video,
      icon: (
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polygon points="23 7 16 12 23 17 23 7" />
          <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
        </svg>
      ),
    },
    {
      id: 'audio',
      label: 'Audio',
      count: counts.audio,
      icon: (
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M9 18V5l12-2v13" />
          <circle cx="6" cy="18" r="3" />
          <circle cx="18" cy="16" r="3" />
        </svg>
      ),
    },
    {
      id: 'enhanced',
      label: 'Enhanced',
      count: counts.enhanced,
      icon: (
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="m12 3-1.9 5.8a2 2 0 0 1-1.3 1.3L3 12l5.8 1.9a2 2 0 0 1 1.3 1.3L12 21l1.9-5.8a2 2 0 0 1 1.3-1.3L21 12l-5.8-1.9a2 2 0 0 1-1.3-1.3Z" />
        </svg>
      ),
    },
  ];

  return (
    <div className="flex h-[calc(100vh-64px)] w-full bg-[#070709] text-white overflow-hidden select-none">
      {/* ================= LEFT SIDEBAR ================= */}
      <aside className="w-60 shrink-0 bg-[#0c0c10] border-r border-white/5 flex flex-col justify-between p-3.5 space-y-6 overflow-y-auto">
        <div className="space-y-6">
          {/* Back Navigation to Prompt Vault */}
          <button
            onClick={onReturnToVault}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-neutral-400 hover:text-white bg-white/5 hover:bg-white/10 transition-colors"
          >
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="19" y1="12" x2="5" y2="12" />
              <polyline points="12 19 5 12 12 5" />
            </svg>
            <span>Prompt Vault</span>
          </button>

          {/* Primary Asset Group */}
          <nav className="space-y-0.5">
            {navItemsTop.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id);
                    setSelectedAssetIds(new Set());
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium transition-all ${
                    isActive
                      ? 'bg-white/10 text-white font-bold'
                      : 'text-neutral-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <span className={isActive ? 'text-[#d1fe17]' : 'text-neutral-400'}>
                      {item.icon}
                    </span>
                    <span>{item.label}</span>
                  </div>
                  <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded-md ${
                    isActive ? 'bg-white/10 text-white font-bold' : 'text-neutral-500'
                  }`}>
                    {item.count > 999 ? '999+' : item.count}
                  </span>
                </button>
              );
            })}
          </nav>

          {/* Tools Category */}
          <div className="space-y-2 pt-2 border-t border-white/5">
            <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider px-3 block">
              Tools
            </span>
            <nav className="space-y-0.5">
              {navItemsTools.map((item) => {
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      setActiveTab(item.id);
                      setSelectedAssetIds(new Set());
                    }}
                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium transition-all ${
                      isActive
                        ? 'bg-white/10 text-white font-bold'
                        : 'text-neutral-400 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <span className={isActive ? 'text-[#d1fe17]' : 'text-neutral-400'}>
                        {item.icon}
                      </span>
                      <span>{item.label}</span>
                    </div>
                    <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded-md ${
                      isActive ? 'bg-white/10 text-white font-bold' : 'text-neutral-500'
                    }`}>
                      {item.count > 999 ? '999+' : item.count}
                    </span>
                  </button>
                );
              })}
            </nav>
          </div>
        </div>
      </aside>

      {/* ================= MAIN CONTENT WORKSPACE ================= */}
      <section className="flex-1 flex flex-col overflow-hidden bg-[#070709]">
        {/* Top Control Bar */}
        <header className="h-16 px-8 border-b border-white/5 flex items-center justify-between shrink-0 bg-[#0a0a0d]/50 backdrop-blur-sm">
          {/* Left Title / Sub-tabs */}
          <div className="flex items-center gap-6">
            <h1 className="text-xl font-black text-white capitalize">
              {activeTab === 'enhanced' ? 'Upscaled' : activeTab}
            </h1>

            {/* Projects Filter Pills */}
            {activeTab === 'projects' && (
              <div className="flex items-center gap-1.5">
                {['All', 'Cinema studio', 'Marketing Studio', 'Ads Studio', 'Contests'].map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setProjectCategory(cat)}
                    className={`px-3 py-1 rounded-xl text-xs font-semibold transition-all ${
                      projectCategory === cat
                        ? 'bg-white/15 text-white'
                        : 'text-neutral-400 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            )}

            {/* Trash Sub-header */}
            {activeTab === 'trash' && (
              <span className="text-xs text-neutral-500">
                Items are permanently deleted after 30 days.
              </span>
            )}
          </div>

          {/* Right Action Cluster */}
          <div className="flex items-center gap-3">
            {/* Search Input in Assets */}
            <div className="relative flex items-center bg-white/5 border border-white/10 rounded-xl px-3 py-1.5 focus-within:border-white/30 transition-colors w-48 lg:w-64">
              <svg className="w-3.5 h-3.5 text-neutral-400 mr-2 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search"
                className="w-full bg-transparent text-xs text-white placeholder-neutral-500 focus:outline-none"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="text-neutral-400 hover:text-white ml-1 shrink-0"
                >
                  <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </button>
              )}
            </div>

            {/* Batch Trash Actions */}
            {activeTab === 'trash' ? (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleRestoreFromTrash(Array.from(trashIds))}
                  disabled={trashIds.size === 0}
                  className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 disabled:opacity-40 text-xs font-semibold text-white flex items-center gap-1.5 transition-colors"
                >
                  <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="1 4 1 10 7 10" />
                    <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10" />
                  </svg>
                  <span>Restore all</span>
                </button>
                <button
                  onClick={handleEmptyTrash}
                  disabled={trashIds.size === 0}
                  className="px-3 py-1.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 disabled:opacity-40 text-xs font-semibold text-red-400 border border-red-500/20 flex items-center gap-1.5 transition-colors"
                >
                  <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="3 6 5 6 21 6" />
                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                  </svg>
                  <span>Empty trash</span>
                </button>
              </div>
            ) : selectedAssetIds.size > 0 ? (
              <div className="flex items-center gap-2">
                <span className="text-xs text-neutral-400 font-mono">
                  {selectedAssetIds.size} selected
                </span>
                <button
                  onClick={() => handleMoveToTrash(Array.from(selectedAssetIds))}
                  className="px-3 py-1.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-xs font-semibold text-red-400 border border-red-500/20 flex items-center gap-1.5 transition-colors"
                >
                  <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="3 6 5 6 21 6" />
                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                  </svg>
                  <span>Move to Trash</span>
                </button>
              </div>
            ) : null}

            {/* New Project Trigger */}
            {activeTab === 'projects' && (
              <button
                onClick={() => setIsCreatingProject(true)}
                className="px-3 py-1.5 bg-[#d1fe17] hover:bg-[#bfee00] text-black text-xs font-bold rounded-xl flex items-center gap-1.5 transition-all shadow-md shadow-[#d1fe17]/20"
              >
                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="12" y1="5" x2="12" y2="19" />
                  <line x1="5" y1="12" x2="19" y2="12" />
                </svg>
                <span>New Project</span>
              </button>
            )}

            {/* View Density Switcher */}
            <button
              onClick={() => {
                if (viewColumns === 4) setViewColumns(6);
                else if (viewColumns === 6) setViewColumns(3);
                else setViewColumns(4);
              }}
              className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-semibold text-neutral-300 hover:text-white flex items-center gap-1.5 border border-white/10 transition-colors"
              title="Toggle Grid Density"
            >
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect width="7" height="7" x="3" y="3" rx="1" />
                <rect width="7" height="7" x="14" y="3" rx="1" />
                <rect width="7" height="7" x="14" y="14" rx="1" />
                <rect width="7" height="7" x="3" y="14" rx="1" />
              </svg>
              <span>View</span>
            </button>
          </div>
        </header>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-8 space-y-10">
          {/* ================= VIEW: PROJECTS ================= */}
          {activeTab === 'projects' && (
            <div>
              {projects.length === 0 ? (
                /* Pure Clean Empty Slate (No Demo/Fake Data) */
                <div className="py-24 text-center space-y-4 max-w-md mx-auto">
                  <div className="w-16 h-16 rounded-3xl bg-white/5 border border-white/10 flex items-center justify-center text-neutral-400 mx-auto">
                    <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white">No projects yet</h3>
                    <p className="text-xs text-neutral-400 mt-1 leading-relaxed">
                      Create dedicated workspaces for your production campaigns, Cinema Studio sequences, and multi-prompt ad drops.
                    </p>
                  </div>
                  <button
                    onClick={() => setIsCreatingProject(true)}
                    className="px-4 py-2 bg-[#d1fe17] hover:bg-[#bfee00] text-black text-xs font-bold rounded-xl inline-flex items-center gap-1.5 transition-all shadow-md shadow-[#d1fe17]/20"
                  >
                    <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="12" y1="5" x2="12" y2="19" />
                      <line x1="5" y1="12" x2="19" y2="12" />
                    </svg>
                    <span>Create Your First Project</span>
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {projects
                    .filter((p) => projectCategory === 'All' || p.category === projectCategory)
                    .map((proj) => (
                      <div
                        key={proj.id}
                        className="rounded-2xl bg-[#0f0f14] border border-white/10 hover:border-white/20 transition-all p-4 flex flex-col justify-between space-y-4 group cursor-pointer"
                      >
                        <div className="aspect-video rounded-xl bg-white/5 border border-white/5 flex items-center justify-center overflow-hidden">
                          {proj.coverUrl ? (
                            <img src={proj.coverUrl} alt={proj.title} className="w-full h-full object-cover" />
                          ) : (
                            <div className="text-center space-y-1">
                              <svg className="w-6 h-6 text-neutral-500 mx-auto" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
                              </svg>
                              <span className="text-[10px] text-neutral-500 font-mono block">Studio Canvas</span>
                            </div>
                          )}
                        </div>
                        <div className="space-y-1">
                          <div className="flex items-center justify-between">
                            <h4 className="text-sm font-bold text-white group-hover:text-[#d1fe17] transition-colors">
                              {proj.title}
                            </h4>
                            <span className="text-[10px] text-neutral-500 font-mono">
                              {proj.isPrivate ? 'Private' : 'Shared'}
                            </span>
                          </div>
                          <span className="text-[11px] text-neutral-400 block">{proj.category}</span>
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </div>
          )}

          {/* ================= VIEW: VIDEO (EMPTY SLATE ONLY - NO DEMO/FAKE DATA) ================= */}
          {activeTab === 'video' && videos.length === 0 && (
            <div className="py-24 text-center space-y-4 max-w-md mx-auto">
              <div className="w-16 h-16 rounded-3xl bg-white/5 border border-white/10 flex items-center justify-center text-neutral-400 mx-auto">
                <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <polygon points="23 7 16 12 23 17 23 7" />
                  <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
                </svg>
              </div>
              <div>
                <h3 className="text-base font-bold text-white">No video assets yet</h3>
                <p className="text-xs text-neutral-400 mt-1 leading-relaxed">
                  Generate your first cinematic video from an image drop or start camera trajectories in Video Studio.
                </p>
              </div>
              {onNavigateToStudio && (
                <button
                  onClick={() => onNavigateToStudio('video')}
                  className="px-4 py-2 bg-[#d1fe17] hover:bg-[#bfee00] text-black text-xs font-bold rounded-xl inline-flex items-center gap-1.5 transition-all shadow-md shadow-[#d1fe17]/20"
                >
                  <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="12" y1="5" x2="12" y2="19" />
                    <line x1="5" y1="12" x2="19" y2="12" />
                  </svg>
                  <span>Open Video Studio</span>
                </button>
              )}
            </div>
          )}

          {/* ================= VIEW: AUDIO (EMPTY SLATE ONLY) ================= */}
          {activeTab === 'audio' && audio.length === 0 && (
            <div className="py-24 text-center space-y-4 max-w-md mx-auto">
              <div className="w-16 h-16 rounded-3xl bg-white/5 border border-white/10 flex items-center justify-center text-neutral-400 mx-auto">
                <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 18V5l12-2v13" />
                  <circle cx="6" cy="18" r="3" />
                  <circle cx="18" cy="16" r="3" />
                </svg>
              </div>
              <div>
                <h3 className="text-base font-bold text-white">No audio tracks yet</h3>
                <p className="text-xs text-neutral-400 mt-1 leading-relaxed">
                  Synthesized soundtracks, vocal isolations, and speech tracks will appear here once rendered.
                </p>
              </div>
            </div>
          )}

          {/* ================= VIEW: ELEMENTS (EMPTY SLATE ONLY) ================= */}
          {activeTab === 'elements' && elements.length === 0 && (
            <div className="py-24 text-center space-y-4 max-w-md mx-auto">
              <div className="w-16 h-16 rounded-3xl bg-white/5 border border-white/10 flex items-center justify-center text-neutral-400 mx-auto">
                <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="4" />
                  <path d="M16 8v5a3 3 0 0 0 6 0v-1a10 10 0 1 0-3.92 7.94" />
                </svg>
              </div>
              <div>
                <h3 className="text-base font-bold text-white">No elements saved</h3>
                <p className="text-xs text-neutral-400 mt-1 leading-relaxed">
                  Persona seed anchors, identity locks, and custom characters created in AI Influencer Studio will be cataloged here.
                </p>
              </div>
              {onNavigateToStudio && (
                <button
                  onClick={() => onNavigateToStudio('influencer')}
                  className="px-4 py-2 bg-fuchsia-500 hover:bg-fuchsia-400 text-white text-xs font-bold rounded-xl inline-flex items-center gap-1.5 transition-all shadow-md shadow-fuchsia-500/20"
                >
                  <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="12" y1="5" x2="12" y2="19" />
                    <line x1="5" y1="12" x2="19" y2="12" />
                  </svg>
                  <span>Train AI Influencer</span>
                </button>
              )}
            </div>
          )}

          {/* ================= VIEW: ENHANCED (EMPTY SLATE IF ZERO) ================= */}
          {activeTab === 'enhanced' && counts.enhanced === 0 && (
            <div className="py-24 text-center space-y-4 max-w-md mx-auto">
              <div className="w-16 h-16 rounded-3xl bg-white/5 border border-white/10 flex items-center justify-center text-neutral-400 mx-auto">
                <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="m12 3-1.9 5.8a2 2 0 0 1-1.3 1.3L3 12l5.8 1.9a2 2 0 0 1 1.3 1.3L12 21l1.9-5.8a2 2 0 0 1 1.3-1.3L21 12l-5.8-1.9a2 2 0 0 1-1.3-1.3Z" />
                </svg>
              </div>
              <div>
                <h3 className="text-base font-bold text-white">No upscaled assets</h3>
                <p className="text-xs text-neutral-400 mt-1 leading-relaxed">
                  High-resolution 4K and 8K upscales will be stored here once rendered from the inspector modal.
                </p>
              </div>
            </div>
          )}

          {/* ================= VIEW: TRASH (EMPTY SLATE IF ZERO) ================= */}
          {activeTab === 'trash' && counts.trash === 0 && (
            <div className="py-24 text-center space-y-4 max-w-md mx-auto">
              <div className="w-16 h-16 rounded-3xl bg-white/5 border border-white/10 flex items-center justify-center text-neutral-400 mx-auto">
                <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="3 6 5 6 21 6" />
                  <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                </svg>
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Trash is empty</h3>
                <p className="text-xs text-neutral-400 mt-1 leading-relaxed">
                  Deleted assets are preserved here for 30 days before permanent removal.
                </p>
              </div>
            </div>
          )}

          {/* ================= VIEW: FAVOURITES (EMPTY SLATE IF ZERO) ================= */}
          {activeTab === 'favourites' && counts.favourites === 0 && (
            <div className="py-24 text-center space-y-4 max-w-md mx-auto">
              <div className="w-16 h-16 rounded-3xl bg-white/5 border border-white/10 flex items-center justify-center text-neutral-400 mx-auto">
                <svg className="w-8 h-8 text-rose-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                </svg>
              </div>
              <div>
                <h3 className="text-base font-bold text-white">No favourites yet</h3>
                <p className="text-xs text-neutral-400 mt-1 leading-relaxed">
                  Click the heart icon on any drop in the Prompt Vault or mood board to curate your favourites here.
                </p>
              </div>
              <button
                onClick={onReturnToVault}
                className="px-4 py-2 bg-white/10 hover:bg-white/15 text-white text-xs font-semibold rounded-xl inline-flex items-center gap-1.5 transition-colors"
              >
                <span>Browse Prompt Vault</span>
              </button>
            </div>
          )}

          {/* ================= VIEW: DATE-GROUPED REAL ASSETS (Assets, Images, Trash, Favourites, Enhanced) ================= */}
          {(activeTab === 'assets' ||
            activeTab === 'images' ||
            (activeTab === 'favourites' && counts.favourites > 0) ||
            (activeTab === 'trash' && counts.trash > 0) ||
            (activeTab === 'enhanced' && counts.enhanced > 0)) && (
            <div className="space-y-10">
              {Object.entries(groupedByDate).map(([dateLabel, items]) => {
                const allSelected = items.every((i) => selectedAssetIds.has(i.id));

                return (
                  <div key={dateLabel} className="space-y-4">
                    {/* Date Section Header with Batch Checkbox */}
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => toggleSelectDateGroup(items)}
                        className={`w-4 h-4 rounded-md border flex items-center justify-center transition-all ${
                          allSelected
                            ? 'bg-[#d1fe17] border-[#d1fe17] text-black'
                            : 'border-white/20 hover:border-white/50 bg-white/5'
                        }`}
                        title="Select All for Date"
                      >
                        {allSelected && (
                          <svg className="w-3 h-3 stroke-[3]" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                            <polyline points="20 6 9 17 4 12" />
                          </svg>
                        )}
                      </button>
                      <h3 className="text-xs font-bold text-neutral-300 tracking-wider">
                        {dateLabel}
                      </h3>
                      <span className="text-[10px] text-neutral-500 font-mono">
                        ({items.length})
                      </span>
                    </div>

                    {/* Dynamic Grid Responsive by viewColumns */}
                    <div
                      className={`grid gap-4 ${
                        viewColumns === 3
                          ? 'grid-cols-2 md:grid-cols-3'
                          : viewColumns === 6
                          ? 'grid-cols-2 md:grid-cols-4 lg:grid-cols-6'
                          : 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4'
                      }`}
                    >
                      {items.map((item) => {
                        const isSelected = selectedAssetIds.has(item.id);
                        const isFav = favorites.has(item.id);

                        return (
                          <div
                            key={item.id}
                            onClick={() => onSelectItem(item)}
                            className={`group relative rounded-2xl overflow-hidden aspect-[3/4] bg-[#0c0c10] border transition-all cursor-pointer ${
                              isSelected
                                ? 'border-[#d1fe17] ring-2 ring-[#d1fe17]/20 shadow-lg'
                                : 'border-white/10 hover:border-white/25 hover:shadow-xl'
                            }`}
                          >
                            <img
                              src={item.imageUrl}
                              alt={item.title || 'Asset'}
                              loading="lazy"
                              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                            />

                            {/* Top Left Selection Checkbox */}
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleSelectAsset(item.id);
                              }}
                              className={`absolute top-2.5 left-2.5 w-6 h-6 rounded-lg border backdrop-blur-md flex items-center justify-center transition-all ${
                                isSelected
                                  ? 'bg-[#d1fe17] border-[#d1fe17] text-black shadow-md'
                                  : 'bg-black/40 border-white/20 hover:border-white text-white opacity-0 group-hover:opacity-100'
                              }`}
                            >
                              {isSelected && (
                                <svg className="w-3.5 h-3.5 stroke-[3]" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                  <polyline points="20 6 9 17 4 12" />
                                </svg>
                              )}
                            </button>

                            {/* Top Right Action Overlay (Favorite & Trash) */}
                            <div className="absolute top-2.5 right-2.5 flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onToggleFavorite(item.id);
                                }}
                                className={`w-7 h-7 rounded-xl flex items-center justify-center backdrop-blur-md transition-colors ${
                                  isFav
                                    ? 'bg-rose-500 text-white'
                                    : 'bg-black/50 hover:bg-black/80 text-white border border-white/10'
                                }`}
                                title={isFav ? 'Remove Favourite' : 'Add Favourite'}
                              >
                                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill={isFav ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2">
                                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                                </svg>
                              </button>

                              {activeTab !== 'trash' ? (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleMoveToTrash([item.id]);
                                  }}
                                  className="w-7 h-7 rounded-xl bg-black/50 hover:bg-red-500/80 text-white border border-white/10 flex items-center justify-center backdrop-blur-md transition-colors"
                                  title="Move to Trash"
                                >
                                  <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <polyline points="3 6 5 6 21 6" />
                                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                                  </svg>
                                </button>
                              ) : (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleRestoreFromTrash([item.id]);
                                  }}
                                  className="w-7 h-7 rounded-xl bg-black/50 hover:bg-emerald-500/80 text-white border border-white/10 flex items-center justify-center backdrop-blur-md transition-colors"
                                  title="Restore Item"
                                >
                                  <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                    <polyline points="1 4 1 10 7 10" />
                                    <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10" />
                                  </svg>
                                </button>
                              )}
                            </div>

                            {/* Bottom Title Gradient */}
                            <div className="absolute inset-x-0 bottom-0 p-3 bg-gradient-to-t from-black/90 via-black/40 to-transparent">
                              <p className="text-xs font-bold text-white line-clamp-1">
                                {item.title || item.prompt.slice(0, 36)}
                              </p>
                              <span className="text-[10px] text-neutral-400 font-mono mt-0.5 block">
                                {(item.model || 'Soul 2.0').replace(/higgsfield\s*/gi, '')}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* ================= MODAL: CREATE PROJECT ================= */}
      {isCreatingProject && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-[#111116] border border-white/15 rounded-3xl p-6 shadow-2xl space-y-6">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <h3 className="text-base font-bold text-white">Create New Project</h3>
              <button
                onClick={() => setIsCreatingProject(false)}
                className="text-neutral-400 hover:text-white"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleCreateProject} className="space-y-4 text-xs">
              <div>
                <label className="text-neutral-400 uppercase font-bold text-[10px] tracking-wider block mb-1.5">
                  Project Title
                </label>
                <input
                  type="text"
                  value={newProjectTitle}
                  onChange={(e) => setNewProjectTitle(e.target.value)}
                  placeholder="e.g. Dubai Nightlife Editorial"
                  required
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-3.5 py-2.5 text-white placeholder-neutral-500 focus:outline-none focus:border-[#d1fe17]"
                />
              </div>

              <div>
                <label className="text-neutral-400 uppercase font-bold text-[10px] tracking-wider block mb-1.5">
                  Category
                </label>
                <select
                  value={newProjectCategory}
                  onChange={(e) => setNewProjectCategory(e.target.value as any)}
                  className="w-full bg-neutral-900 border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[#d1fe17]"
                >
                  <option value="Cinema studio">Cinema studio</option>
                  <option value="Marketing Studio">Marketing Studio</option>
                  <option value="Ads Studio">Ads Studio</option>
                  <option value="Contests">Contests</option>
                </select>
              </div>

              <div className="flex items-center justify-between py-2 border-t border-b border-white/5">
                <div>
                  <span className="font-bold text-white block">Private Project</span>
                  <span className="text-[11px] text-neutral-400">Only accessible by your session</span>
                </div>
                <input
                  type="checkbox"
                  checked={newProjectPrivate}
                  onChange={(e) => setNewProjectPrivate(e.target.checked)}
                  className="w-4 h-4 accent-[#d1fe17]"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsCreatingProject(false)}
                  className="px-3.5 py-2 rounded-xl text-neutral-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#d1fe17] text-black font-extrabold rounded-xl shadow-md shadow-[#d1fe17]/20"
                >
                  Create Project
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
