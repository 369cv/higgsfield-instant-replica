import React, { useEffect, useState } from 'react';
import {
  ArrowLeft,
  Heart,
  Copy,
  Flame,
  Pencil,
  Sparkles,
  LayoutGrid,
  Wind,
  Bell,
  Search,
  Trash2,
  Share2,
  MessageSquare,
  Info,
  RotateCcw,
} from 'lucide-react';
import {
  ListGroup,
  ListRow,
  Switch,
  SegmentedControl,
  ThemePicker,
  Sheet,
  PrimaryButton,
  SecondaryButton,
  toast,
} from './ui';
import { BrandMark } from './BrandMark';
import { BRAND } from '../config/brand';
import { RECENT_SEARCHES_KEY } from '../config/search';
import { useSettings, useStats, updateSettings, resetAllLocalData } from '../services/settings';
import pkg from '../../package.json';

/* ---------- Avatar (initials on a hue gradient) ---------- */

export const AVATAR_HUES = [275, 320, 200, 165, 30, 0];

export const Avatar: React.FC<{ name: string; hue: number; size?: number }> = ({ name, hue, size = 88 }) => {
  const initials = name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() || '')
    .join('');
  return (
    <span
      className="rounded-full flex items-center justify-center font-semibold text-[#ffffff] shrink-0 select-none"
      style={{
        width: size,
        height: size,
        fontSize: size * 0.38,
        background: `linear-gradient(135deg, hsl(${hue} 85% 62%), hsl(${(hue + 50) % 360} 80% 52%))`,
      }}
      aria-hidden="true"
    >
      {initials || '★'}
    </span>
  );
};

/* ---------- Page ---------- */

interface ProfileProps {
  isOpen: boolean;
  onClose: () => void;
  savedCount: number;
  onOpenSaved: () => void;
  onClearSaved: () => void;
}

type Confirm = null | 'history' | 'saved' | 'reset';

export const HiggsfieldProfileModal: React.FC<ProfileProps> = ({
  isOpen,
  onClose,
  savedCount,
  onOpenSaved,
  onClearSaved,
}) => {
  const settings = useSettings();
  const stats = useStats();
  const [editOpen, setEditOpen] = useState(false);
  const [draftName, setDraftName] = useState('');
  const [draftHue, setDraftHue] = useState(settings.avatarHue);
  const [confirm, setConfirm] = useState<Confirm>(null);

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && !editOpen && !confirm && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isOpen, onClose, editOpen, confirm]);

  if (!isOpen) return null;

  const name = settings.displayName || 'Creator';
  const memberSince = new Date(stats.memberSince + 'T00:00:00').toLocaleDateString(undefined, {
    month: 'short',
    year: 'numeric',
  });

  const openEdit = () => {
    setDraftName(settings.displayName);
    setDraftHue(settings.avatarHue);
    setEditOpen(true);
  };

  const share = async () => {
    const url = window.location.origin;
    try {
      if (navigator.share) {
        await navigator.share({ title: BRAND.name, text: BRAND.tagline, url });
        return;
      }
      await navigator.clipboard.writeText(url);
      toast('Link copied');
    } catch {
      // user cancelled the share sheet
    }
  };

  const runConfirm = () => {
    if (confirm === 'history') {
      try {
        localStorage.removeItem(RECENT_SEARCHES_KEY);
      } catch {}
      toast('Search history cleared');
    } else if (confirm === 'saved') {
      onClearSaved();
      toast('Saved prompts cleared');
    } else if (confirm === 'reset') {
      resetAllLocalData();
    }
    setConfirm(null);
  };

  const confirmCopy: Record<Exclude<Confirm, null>, { title: string; body: string; action: string }> = {
    history: { title: 'Clear search history?', body: 'Your recent searches will be removed.', action: 'Clear history' },
    saved: {
      title: 'Clear saved prompts?',
      body: `This removes all ${savedCount} saved prompt${savedCount === 1 ? '' : 's'} on this device.`,
      action: 'Clear saved',
    },
    reset: {
      title: 'Reset app data?',
      body: 'Removes your profile, settings, saved prompts and history from this device. This can’t be undone.',
      action: 'Reset everything',
    },
  };

  return (
    <div className="fixed inset-x-0 top-0 bottom-[var(--m-tab-h)] md:bottom-0 z-50 overflow-y-auto bg-base text-white">
      {/* Nav bar */}
      <div
        className="sticky top-0 z-20 bg-base/80 backdrop-blur-xl border-b border-white/[0.08] px-4 sm:px-6"
        style={{ paddingTop: 'env(safe-area-inset-top)' }}
      >
        <div className="h-11 md:h-16 max-w-2xl mx-auto flex items-center relative">
          <button
            onClick={onClose}
            className="hidden md:flex items-center gap-2 text-sm font-semibold text-neutral-300 hover:text-white cursor-pointer relative z-10"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back</span>
          </button>
          <h1 className="absolute inset-x-0 text-center text-[17px] font-semibold pointer-events-none">
            Profile &amp; Settings
          </h1>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 pt-6 pb-12">
        {/* Profile card */}
        <section className="rounded-2xl bg-surface border border-white/[0.06] p-6 mb-4 flex flex-col items-center text-center">
          <Avatar name={settings.displayName} hue={settings.avatarHue} size={88} />
          <h2 className="mt-3 text-[22px] font-bold tracking-tight">{name}</h2>
          <p className="text-[14px] text-neutral-500">Free plan · Member since {memberSince}</p>
          <button
            onClick={openEdit}
            className="mt-4 h-9 px-4 rounded-full bg-neutral-800 text-[14px] font-semibold text-white flex items-center gap-1.5 active:opacity-70 cursor-pointer"
          >
            <Pencil className="w-3.5 h-3.5" /> Edit profile
          </button>

          <div className="mt-6 w-full grid grid-cols-3 divide-x divide-white/[0.08]">
            {[
              { icon: Heart, value: savedCount, label: 'Saved' },
              { icon: Copy, value: stats.copies, label: 'Copied' },
              { icon: Flame, value: stats.streak, label: 'Day streak' },
            ].map(({ icon: Icon, value, label }) => (
              <div key={label} className="flex flex-col items-center gap-0.5">
                <span className="text-[20px] font-bold tabular-nums">{value}</span>
                <span className="flex items-center gap-1 text-[12px] text-neutral-500">
                  <Icon className="w-3 h-3" /> {label}
                </span>
              </div>
            ))}
          </div>
        </section>

        {/* Pro teaser (brand gradient) */}
        <section className="theme-dark relative overflow-hidden rounded-2xl mb-7 p-5 bg-[linear-gradient(120deg,#6d28d9_0%,#db2777_45%,#2dd4bf_100%)]">
          <div className="absolute -right-6 -top-6 opacity-30 pointer-events-none">
            <BrandMark size={120} className="shadow-none" />
          </div>
          <span className="relative inline-flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider px-2 py-1 rounded-full bg-black/25 text-white">
            <Sparkles className="w-3 h-3" /> Coming soon
          </span>
          <h3 className="relative mt-3 text-[19px] font-bold text-white">Pro is unlocking soon</h3>
          <p className="relative mt-1 text-[14px] leading-snug text-white/85 max-w-[34ch]">
            Motion prompts, moodboards, Cinema Studio and AI Influencer.
          </p>
        </section>

        <ListGroup title="Appearance" footer="System follows your device’s light or dark setting.">
          <ThemePicker value={settings.theme} onChange={(theme) => updateSettings({ theme })} />
        </ListGroup>

        <ListGroup title="Preferences">
          <ListRow
            icon={LayoutGrid}
            iconBg="bg-[#5e5ce6]"
            label="Grid density"
            trailing={
              <SegmentedControl
                label="Grid density"
                value={settings.gridDensity}
                onChange={(gridDensity) => updateSettings({ gridDensity })}
                options={[
                  { value: 'comfortable', label: 'Comfy' },
                  { value: 'compact', label: 'Compact' },
                ]}
              />
            }
          />
          <ListRow
            icon={Wind}
            iconBg="bg-[#30b0c7]"
            label="Reduce motion"
            description="Turn off animations and transitions."
            trailing={
              <Switch
                label="Reduce motion"
                checked={settings.reduceMotion}
                onChange={(reduceMotion) => updateSettings({ reduceMotion })}
              />
            }
          />
        </ListGroup>

        <ListGroup title="Notifications">
          <ListRow
            icon={Bell}
            iconBg="bg-[#ff375f]"
            label="Daily prompt reminder"
            badge="Soon"
            description="Get notified when today’s prompts drop."
            trailing={<Switch label="Daily prompt reminder" checked={false} onChange={() => {}} disabled />}
          />
        </ListGroup>

        <ListGroup title="Library">
          <ListRow icon={Heart} iconBg="bg-[#ff2d55]" label="Saved prompts" value={savedCount} onClick={onOpenSaved} />
          <ListRow
            icon={Search}
            iconBg="bg-[#8e8e93]"
            label="Clear search history"
            onClick={() => setConfirm('history')}
            chevron={false}
          />
          <ListRow
            icon={Trash2}
            iconBg="bg-[#ff9500]"
            label="Clear saved prompts"
            onClick={() => setConfirm('saved')}
            disabled={savedCount === 0}
            chevron={false}
          />
        </ListGroup>

        <ListGroup title="Support">
          <ListRow icon={Share2} iconBg="bg-[#0a84ff]" label={`Share ${BRAND.name}`} onClick={share} />
          {BRAND.supportEmail && (
            <ListRow
              icon={MessageSquare}
              iconBg="bg-[#34c759]"
              label="Send feedback"
              href={`mailto:${BRAND.supportEmail}?subject=${encodeURIComponent(BRAND.name + ' feedback')}`}
            />
          )}
        </ListGroup>

        <ListGroup title="About">
          <ListRow icon={Info} iconBg="bg-[#8e8e93]" label="Version" value={pkg.version} />
        </ListGroup>

        <ListGroup>
          <ListRow
            icon={RotateCcw}
            iconBg="bg-[#ff3b30]"
            label="Reset app data"
            destructive
            onClick={() => setConfirm('reset')}
            chevron={false}
          />
        </ListGroup>

        <footer className="flex flex-col items-center gap-2 pt-2 pb-6 text-center">
          <BrandMark size={44} />
          <div className="text-[15px] font-semibold">{BRAND.name}</div>
          <div className="text-[13px] text-neutral-500">{BRAND.tagline}</div>
        </footer>
      </div>

      {/* Edit profile */}
      <Sheet
        open={editOpen}
        title="Edit profile"
        onClose={() => setEditOpen(false)}
        footer={
          <PrimaryButton
            onClick={() => {
              updateSettings({ displayName: draftName.trim().slice(0, 30), avatarHue: draftHue });
              setEditOpen(false);
              toast('Profile updated');
            }}
          >
            Save
          </PrimaryButton>
        }
      >
        <div className="flex flex-col items-center py-4">
          <Avatar name={draftName} hue={draftHue} size={80} />
        </div>
        <label className="block text-[13px] uppercase tracking-wide text-neutral-500 px-1 pb-1.5" htmlFor="profile-name">
          Display name
        </label>
        <input
          id="profile-name"
          value={draftName}
          onChange={(e) => setDraftName(e.target.value)}
          maxLength={30}
          placeholder="Your name"
          autoComplete="nickname"
          className="w-full h-12 px-4 rounded-xl bg-surface border border-white/[0.08] text-[17px] text-white placeholder-neutral-500 focus:outline-none focus:border-[#d1fe17]"
        />
        <div className="text-[13px] uppercase tracking-wide text-neutral-500 px-1 pt-5 pb-2">Avatar colour</div>
        <div role="radiogroup" aria-label="Avatar colour" className="flex gap-3 px-1">
          {AVATAR_HUES.map((h) => (
            <button
              key={h}
              type="button"
              role="radio"
              aria-checked={draftHue === h}
              aria-label={`Colour ${h}`}
              onClick={() => setDraftHue(h)}
              className={`w-9 h-9 rounded-full cursor-pointer ring-offset-2 ring-offset-base transition-shadow ${
                draftHue === h ? 'ring-2 ring-[#d1fe17]' : ''
              }`}
              style={{ background: `linear-gradient(135deg, hsl(${h} 85% 62%), hsl(${(h + 50) % 360} 80% 52%))` }}
            />
          ))}
        </div>
      </Sheet>

      {/* Confirmations */}
      <Sheet
        open={confirm !== null}
        title={confirm ? confirmCopy[confirm].title : ''}
        onClose={() => setConfirm(null)}
        footer={
          <div className="flex flex-col gap-2">
            <PrimaryButton onClick={runConfirm} className="!bg-[#ff3b30] !text-[#ffffff] hover:!bg-[#e0352b]">
              {confirm ? confirmCopy[confirm].action : ''}
            </PrimaryButton>
            <SecondaryButton onClick={() => setConfirm(null)}>Cancel</SecondaryButton>
          </div>
        }
      >
        <p className="text-[15px] text-neutral-400 text-center px-2 pb-2">{confirm ? confirmCopy[confirm].body : ''}</p>
      </Sheet>
    </div>
  );
};
