import React, { useEffect, useMemo, useState } from 'react';
import {
  Compass,
  History as HistoryIcon,
  Users,
  Film,
  TrendingUp,
  RefreshCw,
  Repeat2,
  Heart,
  Copy,
  Check,
  X,
  MoreHorizontal,
  Trash2,
  Clapperboard,
  ChevronDown,
} from 'lucide-react';
import { VaultItem } from '../../types';
import { toast } from '../../components/ui';
import { TraitSelection, compileCharacterPrompt, selectionChips, selectionCount } from './traits';
import { BuilderPanel, MotionPanel, MotionState, initialMotion } from './panels';
import {
  HERO_MEDIA,
  INFLUENCER_GALLERY,
  MOTION_PRESETS,
  COMMUNITY_TRENDS,
  MOTION_MODELS,
  STYLE_PRESETS,
  CHARACTER_PRESETS,
  presetSheet,
  presetBody,
} from './catalog';
import { InfluencerJob, addJob, deleteJob, useJobs } from './history';

const SELECTION_KEY = 'influencer_selection_v1';
const PRESET_KEY = 'influencer_preset_v1';
const presetName = (id?: string | null) => CHARACTER_PRESETS.find((p) => p.id === id)?.name;

type LeftTab = 'create' | 'motion';
type CanvasView = 'explore' | 'history';
type GalleryTab = 'influencers' | 'presets' | 'trends';
type MobilePane = 'build' | 'explore' | 'history';

const fmt = (n?: number) =>
  n === undefined ? '' : n >= 1000 ? `${(n / 1000).toFixed(n >= 10000 ? 0 : 1)}K` : String(n);

async function copyText(text: string) {
  try {
    await navigator.clipboard.writeText(text);
  } catch {
    const ta = document.createElement('textarea');
    ta.value = text;
    document.body.appendChild(ta);
    ta.select();
    document.execCommand('copy');
    ta.remove();
  }
}

/* ============================================================
 * Studio
 * ============================================================ */

export const InfluencerStudio: React.FC<{ vaultItems: VaultItem[] }> = ({ vaultItems }) => {
  const jobs = useJobs();
  const [leftTab, setLeftTab] = useState<LeftTab>('create');
  const [view, setView] = useState<CanvasView>('explore');
  const [mobilePane, setMobilePane] = useState<MobilePane>('build');
  const [galleryTab, setGalleryTab] = useState<GalleryTab>('influencers');
  const [selection, setSelection] = useState<TraitSelection>(() => {
    try {
      return JSON.parse(localStorage.getItem(SELECTION_KEY) || '{}');
    } catch {
      return {};
    }
  });
  const [photo, setPhoto] = useState<string | null>(null);
  const [presetId, setPresetId] = useState<string | null>(() => {
    try {
      const v = localStorage.getItem(PRESET_KEY);
      return v && CHARACTER_PRESETS.some((p) => p.id === v) ? v : null;
    } catch {
      return null;
    }
  });
  const [motion, setMotion] = useState<MotionState>(initialMotion);
  const [motionCharacter, setMotionCharacter] = useState<InfluencerJob | null>(null);
  const [detail, setDetail] = useState<InfluencerJob | null>(null);

  useEffect(() => {
    try {
      localStorage.setItem(SELECTION_KEY, JSON.stringify(selection));
    } catch {}
  }, [selection]);

  useEffect(() => {
    try {
      if (presetId) localStorage.setItem(PRESET_KEY, presetId);
      else localStorage.removeItem(PRESET_KEY);
    } catch {}
  }, [presetId]);

  const showCanvas = (v: CanvasView) => {
    setView(v);
    setMobilePane(v);
  };

  const generateCharacter = () => {
    if (selectionCount(selection) === 0 && !photo && !presetId) {
      toast('Pick a preset, a trait or upload a photo');
      return;
    }
    const job = addJob({
      kind: 'character',
      prompt: compileCharacterPrompt(selection, !!photo, presetName(presetId)),
      traits: selection,
      hasPhoto: !!photo,
      presetId: presetId || undefined,
    });
    showCanvas('history');
    setDetail(job);
  };

  const generateMotion = () => {
    const model = MOTION_MODELS.find((m) => m.id === motion.model)!;
    const styleName = motion.customStyle
      ? 'custom uploaded style (match its look, not its subject)'
      : STYLE_PRESETS.find((s) => s.id === motion.styleId)?.name || 'No style';
    const lines = [
      `${motion.mode} video, ${motion.quality}, ${model.name}.`,
      motion.mode === 'Motion transfer'
        ? `Apply the full-body motion, timing and camera of the reference video (${motion.video?.seconds}s) to the character.`
        : `Edit the reference video (${motion.video?.seconds}s), swapping its characters, products or clothes with the attached references.`,
      motionCharacter
        ? `Character identity: the attached character sheet (${[presetName(motionCharacter.presetId), ...selectionChips(motionCharacter.traits || {}).slice(0, 6)]
            .filter(Boolean)
            .join(', ')}).`
        : null,
      motion.images.length ? `Attached references: ${motion.images.map((_, i) => `@image${i + 1}`).join(', ')}.` : null,
      styleName !== 'No style' ? `Render style: ${styleName}.` : null,
      motion.usePrompt && motion.prompt.trim() ? `Scene: ${motion.prompt.trim()}` : null,
      'Keep the character identity, outfit and proportions consistent in every frame.',
    ].filter(Boolean) as string[];
    const job = addJob({
      kind: 'motion',
      prompt: lines.join(' '),
      parentId: motionCharacter?.id,
      motion: {
        mode: motion.mode,
        style: styleName,
        model: model.name,
        quality: motion.quality,
        videoSeconds: motion.video?.seconds,
        imageCount: motion.images.length,
        text: motion.usePrompt ? motion.prompt : '',
      },
    });
    showCanvas('history');
    setDetail(job);
  };

  const recreate = (traits?: TraitSelection, preset?: string) => {
    if (!traits && !preset) return;
    if (traits) setSelection(traits);
    setPresetId(preset || null);
    setLeftTab('create');
    setMobilePane('build');
    setDetail(null);
    toast('Loaded into the builder');
  };

  const usePreset = (id: string) => {
    setPresetId(id);
    if (photo) {
      URL.revokeObjectURL(photo);
      setPhoto(null);
    }
    setLeftTab('create');
    setMobilePane('build');
    toast(`${presetName(id)} selected`);
  };

  const turnToMotion = (job: InfluencerJob) => {
    setMotionCharacter(job);
    setLeftTab('motion');
    setMobilePane('build');
    setDetail(null);
    toast('Character sent to Motion');
  };

  const heroItems = useMemo(() => {
    if (HERO_MEDIA.length) return HERO_MEDIA.slice(0, 5);
    const picks = ['ananya-kapoor', 'layla-al-mansoor', 'sienna-o-connor', 'nadia-petrova', 'camila-santos'];
    return picks.map((id) => ({ image: presetBody(id), video: undefined as string | undefined }));
  }, []);

  /* ---------- Left panel ---------- */
  const leftPanel = (
    <aside
      className={`${mobilePane === 'build' ? 'flex' : 'hidden'} lg:flex w-full lg:w-[330px] shrink-0 flex-col bg-base lg:border-r border-white/[0.06] h-full min-h-0`}
    >
      <div className="px-4 pt-4 pb-3 text-center shrink-0">
        <div className="text-[11px] text-neutral-500">Create your own character with</div>
        <div className="text-[22px] font-black tracking-tight uppercase">AI Influencer</div>
      </div>
      <div className="px-3 pb-3 shrink-0">
        <div role="tablist" aria-label="Studio mode" className="grid grid-cols-2 gap-1 p-1 rounded-xl bg-surface border border-white/[0.06]">
          {(
            [
              ['create', 'Create Influencer'],
              ['motion', 'Motion'],
            ] as const
          ).map(([id, label]) => (
            <button
              key={id}
              role="tab"
              aria-selected={leftTab === id}
              onClick={() => setLeftTab(id)}
              className={`h-9 rounded-lg text-[13px] font-medium cursor-pointer ${
                leftTab === id ? 'bg-white/10 text-white' : 'text-neutral-500 hover:text-white'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>
      {leftTab === 'create' ? (
        <BuilderPanel
          selection={selection}
          onChange={setSelection}
          photo={photo}
          onPhoto={setPhoto}
          presetId={presetId}
          onPreset={setPresetId}
          onGenerate={generateCharacter}
        />
      ) : (
        <MotionPanel
          state={motion}
          onChange={setMotion}
          onGenerate={generateMotion}
          characterLabel={
            motionCharacter
              ? presetName(motionCharacter.presetId) || selectionChips(motionCharacter.traits || {}).slice(0, 3).join(' · ') || 'Character sheet'
              : null
          }
        />
      )}
    </aside>
  );

  /* ---------- Canvas ---------- */
  const canvas = (
    <main className={`${mobilePane === 'build' ? 'hidden' : 'block'} lg:block flex-1 min-w-0 h-full overflow-y-auto`}>
      <div className="hidden lg:flex px-5 pt-4 gap-1">
        <ViewToggle view={view} onChange={showCanvas} historyCount={jobs.length} />
      </div>

      {view === 'explore' ? (
        <>
          {/* Hero */}
          <section className="px-4 pt-6 pb-8 flex flex-col items-center text-center">
            {heroItems.length > 0 && (
              <div className="relative h-[210px] sm:h-[260px] w-full max-w-[600px] mb-6" aria-hidden="true">
                {heroItems.map((m, i) => {
                  const offset = i - Math.floor(heroItems.length / 2);
                  const center = offset === 0;
                  const small = typeof window !== 'undefined' && window.innerWidth < 640;
                  const k = small ? 0.72 : 1;
                  return (
                    <div
                      key={i}
                      className="theme-dark absolute top-1/2 left-1/2 rounded-xl overflow-hidden bg-neutral-900 shadow-2xl border border-white/10"
                      style={{
                        width: (center ? 150 : 120) * k,
                        height: (center ? 230 : 190) * k,
                        transform: `translate(calc(-50% + ${offset * (small ? 64 : 105)}px), -50%) rotate(${offset * 4}deg)`,
                        zIndex: 10 - Math.abs(offset),
                      }}
                    >
                      {m.video ? (
                        <video src={m.video} muted loop autoPlay playsInline className="w-full h-full object-cover" />
                      ) : (
                        <img src={m.image} alt="" className="w-full h-full object-cover" />
                      )}
                    </div>
                  );
                })}
              </div>
            )}
            <h1 className="text-[28px] sm:text-[38px] leading-[1.05] font-black uppercase tracking-tight">
              Your influencer,
              <br />
              your next drop
            </h1>
            <p className="mt-3 max-w-[460px] text-[14px] text-neutral-400">
              Design a character with the face, body and style you want, then put them in motion with any reference video.
            </p>
          </section>

          {/* Gallery tabs */}
          <div className="sticky top-0 z-10 bg-canvas/85 backdrop-blur-xl py-2.5 flex justify-center">
            <div role="tablist" aria-label="Gallery" className="flex gap-1 p-1 rounded-full bg-surface border border-white/[0.06] overflow-x-auto no-scrollbar max-w-full">
              {(
                [
                  ['influencers', 'AI Influencers', Users],
                  ['presets', 'Presets', Film],
                  ['trends', 'Community Trends', TrendingUp],
                ] as const
              ).map(([id, label, Icon]) => (
                <button
                  key={id}
                  role="tab"
                  aria-selected={galleryTab === id}
                  onClick={() => setGalleryTab(id)}
                  className={`h-8 px-3.5 rounded-full text-[12.5px] font-medium flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
                    galleryTab === id ? 'bg-white text-black' : 'text-neutral-400 hover:text-white'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" /> {label}
                </button>
              ))}
            </div>
          </div>

          <div className="px-3 sm:px-5 pb-[calc(var(--m-tab-h)+80px)] lg:pb-10 pt-3">
            {galleryTab === 'influencers' && (
              <Masonry empty="AI Influencer examples are coming soon.">
                {INFLUENCER_GALLERY.map((c) => (
                  <div key={c.id} className="theme-dark group relative mb-3 break-inside-avoid rounded-xl overflow-hidden bg-neutral-900">
                    <img src={c.image} alt={presetName(c.id) || ''} loading="lazy" className="w-full" />
                    {presetName(c.id) && (
                      <span className="absolute top-2 left-2 px-2 py-0.5 rounded-full bg-black/60 text-[11px] font-medium text-white">
                        {presetName(c.id)}
                      </span>
                    )}
                    {(c.traits || presetName(c.id)) && (
                      <button
                        type="button"
                        onClick={() => (presetName(c.id) ? usePreset(c.id) : recreate(c.traits))}
                        className="absolute bottom-2 right-2 h-8 px-3 rounded-full bg-black/70 backdrop-blur text-white text-[12px] font-medium flex items-center gap-1.5 opacity-100 sm:opacity-0 sm:translate-y-1 group-hover:opacity-100 group-hover:translate-y-0 transition-all cursor-pointer"
                      >
                        <RefreshCw className="w-3.5 h-3.5" /> {presetName(c.id) ? 'Use this character' : 'Recreate'}
                      </button>
                    )}
                  </div>
                ))}
              </Masonry>
            )}
            {galleryTab === 'presets' && (
              <Masonry empty="Motion presets are coming soon.">
                {MOTION_PRESETS.map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => {
                      if (!p.video) return;
                      setMotion({ ...motion, video: { url: p.video, seconds: 0 } });
                      setLeftTab('motion');
                      setMobilePane('build');
                      toast(`Preset “${p.title}” set as reference`);
                    }}
                    className="theme-dark group relative mb-3 w-full break-inside-avoid rounded-xl overflow-hidden bg-neutral-900 text-left cursor-pointer"
                  >
                    {p.video ? (
                      <video src={p.video} poster={p.poster} muted loop playsInline autoPlay className="w-full" />
                    ) : (
                      <img src={p.poster} alt="" className="w-full" />
                    )}
                    <span className="absolute bottom-2 left-2 text-[12px] font-semibold text-white drop-shadow">{p.title}</span>
                  </button>
                ))}
              </Masonry>
            )}
            {galleryTab === 'trends' && (
              <Masonry empty="Community trends are coming soon.">
                {COMMUNITY_TRENDS.map((t) => (
                  <div key={t.id} className="theme-dark group relative mb-3 break-inside-avoid rounded-xl overflow-hidden bg-neutral-900">
                    {t.video ? (
                      <video src={t.video} poster={t.poster} muted loop playsInline autoPlay className="w-full" />
                    ) : (
                      <img src={t.poster} alt="" className="w-full" />
                    )}
                    <div className="absolute top-2 left-2 flex gap-1.5 text-[11px] text-white">
                      {t.remixes !== undefined && (
                        <span className="px-1.5 py-0.5 rounded bg-black/60 flex items-center gap-1">
                          <Repeat2 className="w-3 h-3" /> {fmt(t.remixes)}
                        </span>
                      )}
                      {t.likes !== undefined && (
                        <span className="px-1.5 py-0.5 rounded bg-black/60 flex items-center gap-1">
                          <Heart className="w-3 h-3" /> {fmt(t.likes)}
                        </span>
                      )}
                    </div>
                    <span className="absolute bottom-2 left-2 px-1.5 py-0.5 rounded bg-black/60 text-[11px] text-white opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                      {t.mode}
                    </span>
                    {t.video && (
                      <button
                        type="button"
                        onClick={() => {
                          setMotion({ ...motion, mode: t.mode, video: { url: t.video!, seconds: 0 } });
                          setLeftTab('motion');
                          setMobilePane('build');
                          toast('Loaded into Motion');
                        }}
                        className="absolute bottom-2 right-2 h-8 px-3 rounded-full bg-black/70 backdrop-blur text-white text-[12px] font-medium flex items-center gap-1.5 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-all cursor-pointer"
                      >
                        <RefreshCw className="w-3.5 h-3.5" /> Recreate
                      </button>
                    )}
                  </div>
                ))}
              </Masonry>
            )}
          </div>
        </>
      ) : (
        <section className="px-3 sm:px-5 pt-4 pb-[calc(var(--m-tab-h)+80px)] lg:pb-10">
          {jobs.length === 0 ? (
            <div className="py-24 text-center">
              <HistoryIcon className="w-8 h-8 mx-auto text-neutral-600 mb-3" />
              <p className="text-[15px] font-semibold">Nothing here yet</p>
              <p className="text-[13px] text-neutral-500 mt-1">Your characters and motion briefs will appear here.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3">
              {jobs.map((j) => (
                <button
                  key={j.id}
                  type="button"
                  onClick={() => setDetail(j)}
                  className="text-left rounded-xl overflow-hidden bg-surface border border-white/[0.06] hover:border-white/20 cursor-pointer flex flex-col"
                >
                  {j.image || j.presetId ? (
                    <img src={j.image || presetSheet(j.presetId!)} alt="" className="w-full aspect-[4/3] object-cover bg-[#ffffff]" />
                  ) : (
                    <div className="aspect-[4/3] p-3 flex flex-col gap-2 bg-gradient-to-br from-white/[0.04] to-transparent">
                      <span className="self-start text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-white/[0.07] text-neutral-400">
                        {j.kind === 'character' ? 'Character' : j.motion?.mode}
                      </span>
                      <p className="text-[12px] leading-snug text-neutral-300 line-clamp-5">{j.prompt}</p>
                    </div>
                  )}
                  <div className="px-3 py-2 text-[11px] text-neutral-500 border-t border-white/[0.06]">
                    {new Date(j.createdAt).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })}
                  </div>
                </button>
              ))}
            </div>
          )}
        </section>
      )}
    </main>
  );

  return (
    <div className="flex flex-col h-app-content">
      {/* Mobile pane switcher */}
      <div className="lg:hidden shrink-0 px-3 py-2 border-b border-white/[0.06]">
        <div role="tablist" aria-label="Studio view" className="grid grid-cols-3 gap-1 p-1 rounded-xl bg-surface">
          {(
            [
              ['build', 'Build'],
              ['explore', 'Explore'],
              ['history', `History${jobs.length ? ` (${jobs.length})` : ''}`],
            ] as const
          ).map(([id, label]) => (
            <button
              key={id}
              role="tab"
              aria-selected={mobilePane === id}
              onClick={() => (id === 'build' ? setMobilePane('build') : showCanvas(id))}
              className={`h-8 rounded-lg text-[13px] font-medium cursor-pointer ${
                mobilePane === id ? 'bg-white/10 text-white' : 'text-neutral-500'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>
      <div className="flex-1 min-h-0 flex">
        {leftPanel}
        {canvas}
      </div>

      <JobDetail
        job={detail}
        onClose={() => setDetail(null)}
        onRecreate={recreate}
        onTurnToMotion={turnToMotion}
        onDelete={(id) => {
          deleteJob(id);
          setDetail(null);
          toast('Deleted');
        }}
      />
    </div>
  );
};

/* ============================================================
 * Pieces
 * ============================================================ */

const ViewToggle: React.FC<{ view: CanvasView; onChange: (v: CanvasView) => void; historyCount: number }> = ({
  view,
  onChange,
  historyCount,
}) => (
  <div role="tablist" aria-label="Canvas view" className="flex gap-1 p-1 rounded-xl bg-surface border border-white/[0.06]">
    {(
      [
        ['explore', 'Explore', Compass],
        ['history', 'History', HistoryIcon],
      ] as const
    ).map(([id, label, Icon]) => (
      <button
        key={id}
        role="tab"
        aria-selected={view === id}
        onClick={() => onChange(id)}
        className={`h-8 px-3 rounded-lg text-[12.5px] font-medium flex items-center gap-1.5 cursor-pointer ${
          view === id ? 'bg-white/10 text-white' : 'text-neutral-500 hover:text-white'
        }`}
      >
        <Icon className="w-3.5 h-3.5" /> {label}
        {id === 'history' && historyCount > 0 && <span className="text-neutral-500">{historyCount}</span>}
      </button>
    ))}
  </div>
);

const Masonry: React.FC<{ empty: string; children: React.ReactNode }> = ({ empty, children }) => {
  const count = React.Children.count(children);
  if (count === 0) {
    return (
      <div className="py-20 text-center">
        <Clapperboard className="w-8 h-8 mx-auto text-neutral-600 mb-3" />
        <p className="text-[14px] text-neutral-400">{empty}</p>
      </div>
    );
  }
  return <div className="columns-2 sm:columns-3 xl:columns-4 gap-3">{children}</div>;
};

interface JobDetailProps {
  job: InfluencerJob | null;
  onClose: () => void;
  onRecreate: (t?: TraitSelection, preset?: string) => void;
  onTurnToMotion: (j: InfluencerJob) => void;
  onDelete: (id: string) => void;
}

const JobDetail: React.FC<JobDetailProps> = ({ job, onClose, onRecreate, onTurnToMotion, onDelete }) => {
  const [copied, setCopied] = useState(false);
  const [allChips, setAllChips] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);

  useEffect(() => {
    setCopied(false);
    setAllChips(false);
    setMoreOpen(false);
    if (!job) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [job, onClose]);

  if (!job) return null;
  const chips =
    job.kind === 'character' ? [presetName(job.presetId), ...selectionChips(job.traits || {})].filter((c): c is string => !!c) : [];
  const stageImage = job.image || (job.presetId ? presetSheet(job.presetId) : undefined);
  const shown = allChips ? chips : chips.slice(0, 6);
  const m = job.motion;

  const copy = async () => {
    await copyText(job.prompt);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col md:flex-row bg-black/70 backdrop-blur-sm" role="dialog" aria-modal="true" aria-label="Generation details">
      <div className="absolute inset-0" onClick={onClose} />

      {/* Stage */}
      <div className="relative flex-1 min-h-[30vh] flex items-center justify-center p-6 pointer-events-none">
        {stageImage ? (
          <div className="pointer-events-auto max-h-full max-w-full flex flex-col items-center gap-3">
            <img src={stageImage} alt="" className="max-h-[70vh] max-w-full object-contain rounded-lg bg-[#ffffff]" />
            {!job.image && (
              <span className="theme-dark text-[12px] text-white/80 bg-black/50 px-3 py-1 rounded-full">
                Base character · generation connects soon, copy the prompt to use it now
              </span>
            )}
          </div>
        ) : (
          <div className="theme-dark pointer-events-auto w-full max-w-[560px] rounded-2xl bg-[#ffffff] text-[#111] p-6 shadow-2xl">
            <div className="text-[11px] font-bold uppercase tracking-wider text-[#777] mb-2">
              {job.kind === 'character' ? 'Character sheet prompt' : `${m?.mode} brief`}
            </div>
            <p className="text-[14px] leading-relaxed text-[#222] line-clamp-[12]">{job.prompt}</p>
            <p className="mt-4 text-[12px] text-[#888]">Image generation will connect here soon. Copy the prompt to use it now.</p>
          </div>
        )}
      </div>

      {/* Drawer */}
      <aside
        className="relative w-full md:w-[380px] max-h-[65dvh] md:max-h-none md:h-full bg-base md:border-l border-white/[0.08] rounded-t-[22px] md:rounded-none flex flex-col animate-sheet-up md:animate-none"
        style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
      >
        <div className="h-14 px-4 flex items-center justify-between shrink-0 border-b border-white/[0.06]">
          <div>
            <div className="text-[14px] font-semibold">{job.kind === 'character' ? 'AI Influencer' : 'Motion'}</div>
            <div className="text-[11px] text-neutral-500">
              {new Date(job.createdAt).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })}
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-white/[0.06] flex items-center justify-center text-neutral-400 cursor-pointer" aria-label="Close">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex-1 min-h-0 overflow-y-auto p-4 space-y-4">
          {job.kind === 'character' && (
            <section>
              <h3 className="text-[11px] font-semibold uppercase tracking-wider text-neutral-500 mb-2">Character parameters</h3>
              {chips.length ? (
                <div className="flex flex-wrap gap-1.5">
                  {shown.map((c) => (
                    <span key={c} className="text-[12px] px-2 py-1 rounded-md bg-white/[0.06] text-neutral-200">
                      {c}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-[12px] text-neutral-500">From your photo only</p>
              )}
              {chips.length > 6 && (
                <button onClick={() => setAllChips(!allChips)} className="mt-2 text-[12px] text-neutral-400 flex items-center gap-1 cursor-pointer">
                  {allChips ? 'Show less' : `See all ${chips.length}`}
                  <ChevronDown className={`w-3.5 h-3.5 transition-transform ${allChips ? 'rotate-180' : ''}`} />
                </button>
              )}
            </section>
          )}

          <section>
            <h3 className="text-[11px] font-semibold uppercase tracking-wider text-neutral-500 mb-2">Details</h3>
            <dl className="text-[12.5px] space-y-1.5">
              <Row k="Feature" v={job.kind === 'character' ? 'AI Influencer / Create' : `AI Influencer / ${m?.mode}`} />
              {job.presetId && <Row k="Base character" v={presetName(job.presetId) || ''} />}
              {job.hasPhoto && <Row k="Input" v="Your photo" />}
              {m && (
                <>
                  <Row k="Model" v={`${m.model} · ${m.quality}`} />
                  <Row k="Style" v={m.style} />
                  {m.videoSeconds ? <Row k="Reference" v={`${m.videoSeconds}s video`} /> : null}
                  <Row k="Images" v={String(m.imageCount)} />
                </>
              )}
            </dl>
          </section>

          <section>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-[11px] font-semibold uppercase tracking-wider text-neutral-500">Prompt</h3>
              <button onClick={copy} className="text-[12px] text-neutral-400 hover:text-white flex items-center gap-1 cursor-pointer">
                {copied ? <Check className="w-3.5 h-3.5 text-accent-ink" /> : <Copy className="w-3.5 h-3.5" />}
                {copied ? 'Copied' : 'Copy'}
              </button>
            </div>
            <p className="text-[13px] leading-relaxed text-neutral-300 whitespace-pre-wrap select-text">{job.prompt}</p>
          </section>
        </div>

        <div className="shrink-0 p-4 border-t border-white/[0.06] space-y-2">
          {job.kind === 'character' && (
            <button
              onClick={() => onTurnToMotion(job)}
              className="w-full h-11 rounded-xl bg-[#d1fe17] hover:bg-[#bfee00] text-black font-bold text-[14px] flex items-center justify-center gap-2 cursor-pointer"
            >
              <Clapperboard className="w-4 h-4" /> Turn to motion
            </button>
          )}
          <div className="flex gap-2">
            {job.kind === 'character' && (
              <button
                onClick={() => onRecreate(job.traits, job.presetId)}
                className="flex-1 h-10 rounded-xl bg-white/[0.06] hover:bg-white/10 text-[13px] font-semibold flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <RefreshCw className="w-4 h-4" /> Recreate
              </button>
            )}
            <button
              onClick={copy}
              className="flex-1 h-10 rounded-xl bg-white/[0.06] hover:bg-white/10 text-[13px] font-semibold flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Copy className="w-4 h-4" /> Copy prompt
            </button>
            <div className="relative">
              <button
                onClick={() => setMoreOpen(!moreOpen)}
                aria-haspopup="menu"
                aria-expanded={moreOpen}
                aria-label="More"
                className="w-10 h-10 rounded-xl bg-white/[0.06] hover:bg-white/10 flex items-center justify-center cursor-pointer"
              >
                <MoreHorizontal className="w-4 h-4" />
              </button>
              {moreOpen && (
                <div role="menu" className="absolute right-0 bottom-full mb-2 w-44 rounded-xl bg-base border border-white/10 shadow-2xl p-1">
                  <button
                    role="menuitem"
                    onClick={() => onDelete(job.id)}
                    className="w-full px-3 py-2 rounded-lg text-left text-[13px] text-[#ff453a] hover:bg-white/[0.06] flex items-center gap-2 cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" /> Delete
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </aside>
    </div>
  );
};

const Row: React.FC<{ k: string; v: string }> = ({ k, v }) => (
  <div className="flex justify-between gap-3">
    <dt className="text-neutral-500">{k}</dt>
    <dd className="text-white text-right">{v}</dd>
  </div>
);
