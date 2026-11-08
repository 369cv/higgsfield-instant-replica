import React, { useEffect } from 'react';
import {
  Menu,
  Search,
  X,
  LayoutGrid,
  Heart,
  Folder,
  User,
  Lock,
  UserPlus,
  LayoutDashboard,
  Clapperboard,
  Compass,
  ChevronRight,
  Zap,
} from 'lucide-react';
import { NavTab, LOCKED_TABS } from './VaultHeader';
import { BRAND } from '../config/brand';

/** Which bottom tab / drawer row is highlighted. 'saved' is the vault filtered to favourites. */
export type MobileView = NavTab | 'saved' | 'profile';

export const MOBILE_TITLES: Record<string, string> = {
  vault: 'Prompts',
  saved: 'Saved',
  assets: 'Assets',
  profile: 'Profile',
  influencer: 'AI Influencer',
  moodboard: 'Moodboard',
  video: 'Cinema Studio',
  explore: 'Explore',
};

/* ---------------- Top navigation bar ---------------- */

interface MobileNavBarProps {
  title: string;
  onOpenMenu: () => void;
  onOpenSearch: () => void;
}

export const MobileNavBar: React.FC<MobileNavBarProps> = ({ title, onOpenMenu, onOpenSearch }) => (
  <header
    className="md:hidden sticky top-0 z-40 bg-[#070709]/80 backdrop-blur-xl backdrop-saturate-150 border-b border-white/[0.08]"
    style={{ paddingTop: 'env(safe-area-inset-top)' }}
  >
    <div className="h-11 px-1.5 grid grid-cols-[44px_1fr_44px] items-center">
      <button
        onClick={onOpenMenu}
        className="w-11 h-11 flex items-center justify-center text-white active:opacity-50"
        aria-label="Open menu"
      >
        <Menu className="w-[22px] h-[22px]" />
      </button>
      <h1 className="text-center text-[17px] font-semibold tracking-tight truncate">{title}</h1>
      <button
        onClick={onOpenSearch}
        className="w-11 h-11 flex items-center justify-center text-white active:opacity-50"
        aria-label="Search"
      >
        <Search className="w-[21px] h-[21px]" />
      </button>
    </div>
  </header>
);

/* ---------------- Bottom tab bar ---------------- */

interface MobileTabBarProps {
  active: MobileView;
  onSelect: (view: 'vault' | 'saved' | 'search' | 'profile') => void;
}

export const MobileTabBar: React.FC<MobileTabBarProps> = ({ active, onSelect }) => {
  const tabs: { id: 'vault' | 'search' | 'saved' | 'profile'; label: string; icon: React.ElementType }[] = [
    { id: 'vault', label: 'Prompts', icon: LayoutGrid },
    { id: 'search', label: 'Search', icon: Search },
    { id: 'saved', label: 'Saved', icon: Heart },
    { id: 'profile', label: 'Profile', icon: User },
  ];
  return (
    <nav
      className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-[#0b0b0f]/85 backdrop-blur-xl backdrop-saturate-150 border-t border-white/[0.08]"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
      aria-label="Tabs"
    >
      <div className="h-[52px] grid grid-cols-4">
        {tabs.map(({ id, label, icon: Icon }) => {
          const isActive = active === id;
          return (
            <button
              key={id}
              onClick={() => onSelect(id)}
              className={`flex flex-col items-center justify-center gap-0.5 active:opacity-60 ${
                isActive ? 'text-[#d1fe17]' : 'text-neutral-500'
              }`}
              aria-current={isActive ? 'page' : undefined}
            >
              <Icon className={`w-[23px] h-[23px] ${isActive && id === 'saved' ? 'fill-current' : ''}`} strokeWidth={isActive ? 2.3 : 1.9} />
              <span className="text-[10px] font-medium">{label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};

/* ---------------- Hamburger drawer ---------------- */

interface MobileDrawerProps {
  isOpen: boolean;
  active: MobileView;
  savedCount: number;
  onClose: () => void;
  onNavigate: (view: MobileView) => void;
}

const LOCKED_ROWS: { id: NavTab; label: string; icon: React.ElementType }[] = [
  { id: 'influencer', label: 'AI Influencer', icon: UserPlus },
  { id: 'moodboard', label: 'Moodboard', icon: LayoutDashboard },
  { id: 'video', label: 'Cinema Studio', icon: Clapperboard },
  { id: 'explore', label: 'Explore', icon: Compass },
];

export const MobileDrawer: React.FC<MobileDrawerProps> = ({ isOpen, active, savedCount, onClose, onNavigate }) => {
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = prev;
    };
  }, [isOpen, onClose]);

  const go = (v: MobileView) => {
    onNavigate(v);
    onClose();
  };

  const Row: React.FC<{
    icon: React.ElementType;
    label: string;
    isActive?: boolean;
    trailing?: React.ReactNode;
    onClick: () => void;
    muted?: boolean;
  }> = ({ icon: Icon, label, isActive, trailing, onClick, muted }) => (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 pl-3.5 pr-3 h-11 text-left active:bg-white/10 ${
        isActive ? 'text-[#d1fe17]' : muted ? 'text-neutral-400' : 'text-white'
      }`}
    >
      <span
        className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
          isActive ? 'bg-[#d1fe17] text-black' : 'bg-white/[0.08] text-neutral-200'
        }`}
      >
        <Icon className="w-4 h-4" />
      </span>
      <span className="flex-1 text-[15px]">{label}</span>
      {trailing}
      <ChevronRight className="w-4 h-4 text-neutral-600" />
    </button>
  );

  const group = 'rounded-xl bg-[#16161c] overflow-hidden divide-y divide-white/[0.06]';
  const groupLabel = 'px-4 pb-1.5 pt-5 text-[12px] uppercase tracking-wide text-neutral-500';

  return (
    <div
      className={`md:hidden fixed inset-0 z-[55] ${isOpen ? 'visible' : 'invisible pointer-events-none'}`}
      style={{ transition: 'visibility 0.3s' }}
      aria-hidden={!isOpen}
    >
      <div
        onClick={onClose}
        className={`absolute inset-0 bg-black/60 transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0'}`}
      />
      <aside
        role="dialog"
        aria-modal="true"
        aria-label="Menu"
        className={`absolute inset-y-0 left-0 w-[84%] max-w-[330px] bg-[#0d0d11] border-r border-white/[0.08] flex flex-col transition-transform duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
        style={{ paddingTop: 'env(safe-area-inset-top)', paddingBottom: 'env(safe-area-inset-bottom)' }}
      >
        <div className="h-14 px-4 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-[10px] bg-gradient-to-br from-[#d1fe17] to-[#88a804] flex items-center justify-center text-black">
              <Zap className="w-4 h-4" strokeWidth={2.5} />
            </div>
            <div className="leading-tight">
              <div className="text-[15px] font-semibold">{BRAND.name}</div>
              <div className="text-[11px] text-neutral-500">{BRAND.tagline}</div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/[0.08] flex items-center justify-center text-neutral-300 active:opacity-60"
            aria-label="Close menu"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-3 pb-4">
          <div className={groupLabel}>Library</div>
          <div className={group}>
            <Row icon={LayoutGrid} label="Prompts Vault" isActive={active === 'vault'} onClick={() => go('vault')} />
            <Row
              icon={Heart}
              label="Saved"
              isActive={active === 'saved'}
              onClick={() => go('saved')}
              trailing={savedCount > 0 ? <span className="text-[13px] text-neutral-500">{savedCount}</span> : null}
            />
            <Row icon={Folder} label="Assets" isActive={active === 'assets'} onClick={() => go('assets')} />
          </div>

          <div className={groupLabel}>Unlocking soon</div>
          <div className={group}>
            {LOCKED_ROWS.filter((r) => LOCKED_TABS.includes(r.id)).map((r) => (
              <Row
                key={r.id}
                icon={r.icon}
                label={r.label}
                muted
                isActive={active === r.id}
                onClick={() => go(r.id)}
                trailing={<Lock className="w-3.5 h-3.5 text-neutral-500" />}
              />
            ))}
          </div>
        </div>

        <div className="px-3 pb-3 shrink-0">
          <div className={group}>
            <Row icon={User} label="Profile" isActive={active === 'profile'} onClick={() => go('profile')} />
          </div>
        </div>
      </aside>
    </div>
  );
};
