import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Repeat2,
  Heart,
  Sparkles,
  Film,
  ImagePlus,
  Trash2,
  Plus,
  X,
  Pencil,
  ChevronRight,
  Search,
  SlidersHorizontal,
  LayoutList,
  LayoutGrid,
  Rows3,
  Download,
  Wand2,
  Brush,
  Eraser,
  Undo2,
  Volume2,
  VolumeX,
  Check,
  Library,
  History as HistoryIcon,
  Share2,
  Flag,
} from 'lucide-react';
import { VaultItem } from '../../types';
import { toast } from '../../components/ui';
import { Dropzone, SelectPopover } from '../influencer/controls';
import { SceneLibrary, ReportModal } from '../scenes/SceneLibrary';
import { ScenePanel } from '../scenes/ScenePanel';
import { PRESETS, useSceneStore } from '../scenes/store';
import { Clip, CastEntry } from '../scenes/logic';
import {
  MODES,
  RemixMode,
  REMIX_MODELS,
  QUALITIES,
  Quality,
  CATEGORIES,
  Category,
  RENDER_STYLES,
  EDIT_TOOLS,
  EditToolId,
  BITRATES,
  ASPECTS,
  LIMITS,
  estimateCredits,
  seededStats,
  fmtCount,
  buildSwapPrompt,
} from './catalog';
import {
  RemixGeneration,
  addGeneration,
  deleteGeneration,
  updateGeneration,
  useGenerations,
  toggleLibraryLike,
  useLibraryLikes,
} from './store';

/* ============================================================
 * Types & helpers
 * ============================================================ */

interface VideoInput {
  url: string;
  name: string;
  seconds: number;
  poster?: string;
}

interface CreateState {
  mode: RemixMode;
  styleId: string;
  customStyle: string | null;
  video: VideoInput | null;
  refs: string[];
  usePrompt: boolean;
  prompt: string;
  model: string;
  quality: Quality;
  parentId?: string;
}

const initialCreate = (): CreateState => ({
  mode: 'transfer',
  styleId: 'none',
  customStyle: null,
  video: null,
  refs: [],
  usePrompt: false,
  prompt: '',
  model: REMIX_MODELS[0].id,
  quality: '720p',
});

interface LibraryCard {
  id: string;
  video?: string;
  poster: string;
  prompt: string;
  refs: string[];
  remixes: number;
  likes: number;
  category: Category;
  timestamp: number;
  aspect: string;
}

const readDuration = (url: string) =>
  new Promise<number>((resolve) => {
    const v = document.createElement('video');
    v.preload = 'metadata';
    v.onloadedmetadata = () => resolve(Math.round(v.duration || 0));
    v.onerror = () => resolve(0);
    v.src = url;
  });

const modelName = (id: string) => REMIX_MODELS.find((m) => m.id === id)?.name || id;
const styleName = (s: { styleId: string; customStyle: string | null }) =>
  s.customStyle ? 'Custom style' : RENDER_STYLES.find((x) => x.id === s.styleId)?.name || 'No style';

/* ============================================================
 * Studio
 * ============================================================ */

type LeftTab = 'create' | 'edit';
type CanvasTab = 'library' | 'history';

export const RemixStudio: React.FC<{ vaultItems: VaultItem[] }> = ({ vaultItems }) => {
  const gens = useGenerations();
  const [leftTab, setLeftTab] = useState<LeftTab>('create');
  const [canvasTab, setCanvasTab] = useState<CanvasTab>('library');
  const [mobilePane, setMobilePane] = useState<'build' | 'canvas'>('build');
  const [create, setCreate] = useState<CreateState>(initialCreate);
  const [modelSheet, setModelSheet] = useState(false);
  const [styleModal, setStyleModal] = useState(false);
  const [scene, setScene] = useState<{ clip: Clip; parentRemixId?: string; cast?: CastEntry[] } | null>(null);
  const sceneStore = useSceneStore();

  const startScene = (clip: Clip, parentRemixId?: string, cast?: CastEntry[]) => {
    setScene({ clip, parentRemixId, cast });
    setLeftTab('create');
    setMobilePane('build');
  };

  const remixAgain = (g: RemixGeneration) => {
    const clip = [...sceneStore.uploads, ...PRESETS].find((c) => c.id === g.scene?.clipId);
    if (!clip) return toast('That clip is no longer available');
    startScene(
      clip,
      g.id,
      g.scene!.cast.map((c) => ({ person_index: c.person_index, influencer_id: c.influencerId, keep: !c.influencerId }))
    );
  };

  const library = useMemo<LibraryCard[]>(() => {
    const withMedia = vaultItems.filter((v) => v.videoUrl || v.imageUrl);
    const sorted = [...withMedia].sort((a, b) => Number(!!b.videoUrl) - Number(!!a.videoUrl));
    return sorted.slice(0, 120).map((v) => {
      const s = seededStats(v.id);
      return {
        id: v.id,
        video: v.videoUrl,
        poster: v.imageUrl || v.fullImageUrl || v.referenceImage,
        prompt: v.prompt,
        refs: [v.referenceImage].filter(Boolean),
        remixes: s.remixes,
        likes: s.likes,
        category: s.category,
        timestamp: v.timestamp,
        aspect: v.aspectRatio,
      };
    });
  }, [vaultItems]);

  const generate = () => {
    if (!create.video) return;
    const credits = estimateCredits({
      model: create.model,
      quality: create.quality,
      seconds: create.video.seconds,
      refs: create.refs.length,
      styled: create.styleId !== 'none' || !!create.customStyle,
    });
    addGeneration({
      kind: 'remix',
      mode: create.mode,
      model: create.model,
      quality: create.quality,
      aspect: '9:16',
      seconds: create.video.seconds,
      inputs: {
        video: create.video.url,
        videoName: create.video.name,
        refs: create.refs,
        prompt: create.usePrompt ? create.prompt : '',
        style: styleName(create),
      },
      output: { url: create.video.url, poster: create.video.poster || create.refs[0] },
      parentId: create.parentId,
      credits,
    });
    setCanvasTab('history');
    setMobilePane('canvas');
    toast(`Queued · ${credits} credits`);
  };

  const model = REMIX_MODELS.find((m) => m.id === create.model)!;

  const leftPanel = (
    <aside
      className={`${mobilePane === 'build' ? 'flex' : 'hidden'} lg:flex w-full lg:w-[340px] shrink-0 flex-col bg-base lg:border-r border-white/[0.06] h-full min-h-0`}
    >
      <div role="tablist" className="flex gap-5 px-4 pt-3 border-b border-white/[0.06] shrink-0">
        {(
          [
            ['create', 'Create Video'],
            ['edit', 'Edit Video'],
          ] as const
        ).map(([id, label]) => (
          <button
            key={id}
            role="tab"
            aria-selected={leftTab === id}
            onClick={() => setLeftTab(id)}
            className={`pb-2.5 text-[13px] font-medium border-b-2 -mb-px cursor-pointer ${
              leftTab === id ? 'border-[#d1fe17] text-white' : 'border-transparent text-neutral-500 hover:text-white'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {scene && leftTab === 'create' ? (
        <ScenePanel
          key={scene.clip.id + (scene.parentRemixId || '')}
          clip={scene.clip}
          parentRemixId={scene.parentRemixId}
          initialCast={scene.cast}
          onClose={() => setScene(null)}
          onSubmitted={() => {
            setCanvasTab('history');
            setMobilePane('canvas');
          }}
        />
      ) : leftTab === 'create' ? (
        <CreatePanel
          state={create}
          onChange={setCreate}
          onGenerate={generate}
          onOpenModels={() => setModelSheet(true)}
          onOpenStyle={() => setStyleModal(true)}
          modelLabel={model.name}
          modelTagline={model.tagline}
          banner={library.find((l) => l.video)?.video}
          bannerPoster={library[0]?.poster}
        />
      ) : (
        <EditPanel
          onGenerate={(g) => {
            addGeneration(g);
            setCanvasTab('history');
            setMobilePane('canvas');
            toast(`Queued · ${g.credits} credits`);
          }}
        />
      )}
    </aside>
  );

  const canvas = (
    <main className={`${mobilePane === 'canvas' ? 'block' : 'hidden'} lg:block flex-1 min-w-0 h-full overflow-y-auto relative`}>
      <div className="sticky top-0 z-20 bg-canvas/90 backdrop-blur px-5 pt-3 border-b border-white/[0.06] flex gap-5">
        {(
          [
            ['library', 'Scene Remix', Library],
            ['history', 'History', HistoryIcon],
          ] as const
        ).map(([id, label, Icon]) => (
          <button
            key={id}
            onClick={() => setCanvasTab(id)}
            className={`pb-2.5 text-[13px] font-medium border-b-2 -mb-px flex items-center gap-1.5 cursor-pointer ${
              canvasTab === id ? 'border-[#d1fe17] text-white' : 'border-transparent text-neutral-500 hover:text-white'
            }`}
          >
            <Icon className="w-3.5 h-3.5" /> {label}
            {id === 'history' && gens.length > 0 && <span className="text-neutral-500">{gens.length}</span>}
          </button>
        ))}
      </div>
      {canvasTab === 'library' ? <SceneLibrary onRemix={(c) => startScene(c)} /> : <HistoryView gens={gens} onRemixAgain={remixAgain} />}
      {modelSheet && (
        <ModelSheet
          value={create.model}
          onClose={() => setModelSheet(false)}
          onPick={(id) => {
            setCreate((s) => ({ ...s, model: id }));
            setModelSheet(false);
          }}
        />
      )}
    </main>
  );

  return (
    <div className="flex flex-col lg:flex-row h-app-content min-h-0">
      <div className="lg:hidden flex gap-1 p-2 bg-base border-b border-white/[0.06]">
        {(
          [
            ['build', 'Build'],
            ['canvas', 'Library & History'],
          ] as const
        ).map(([id, label]) => (
          <button
            key={id}
            onClick={() => setMobilePane(id)}
            className={`flex-1 h-9 rounded-lg text-[13px] font-medium ${mobilePane === id ? 'bg-white/10 text-white' : 'text-neutral-500'}`}
          >
            {label}
          </button>
        ))}
      </div>
      {leftPanel}
      {canvas}
      {styleModal && (
        <StyleModal
          styleId={create.styleId}
          custom={create.customStyle}
          onClose={() => setStyleModal(false)}
          onApply={(styleId, customStyle) => {
            setCreate((s) => ({ ...s, styleId, customStyle }));
            setStyleModal(false);
          }}
        />
      )}
    </div>
  );
};

/* ============================================================
 * Create panel
 * ============================================================ */

const CreatePanel: React.FC<{
  state: CreateState;
  onChange: React.Dispatch<React.SetStateAction<CreateState>>;
  onGenerate: () => void;
  onOpenModels: () => void;
  onOpenStyle: () => void;
  modelLabel: string;
  modelTagline: string;
  banner?: string;
  bannerPoster?: string;
}> = ({ state, onChange, onGenerate, onOpenModels, onOpenStyle, modelLabel, modelTagline, banner, bannerPoster }) => {
  const set = (p: Partial<CreateState>) => onChange((s) => ({ ...s, ...p }));
  const [builder, setBuilder] = useState<{ subject: string; ref: number }[]>([{ subject: '', ref: 1 }]);
  const [constraints, setConstraints] = useState('Use the outfits from the references.');

  const onVideo = async (files: File[]) => {
    const f = files.find((x) => x.type.startsWith('video/'));
    if (!f) return toast('Drop a video file');
    const url = URL.createObjectURL(f);
    const seconds = await readDuration(url);
    if (seconds && (seconds < LIMITS.videoMin || seconds > LIMITS.videoMax)) {
      URL.revokeObjectURL(url);
      return toast(`Video must be ${LIMITS.videoMin}–${LIMITS.videoMax}s (got ${seconds}s)`);
    }
    set({ video: { url, name: f.name, seconds: seconds || 8 }, parentId: undefined });
  };

  const onRefs = (files: File[]) => {
    const imgs = files.filter((f) => f.type.startsWith('image/'));
    const room = LIMITS.refsMax - state.refs.length;
    if (imgs.length > room) toast(`Up to ${LIMITS.refsMax} references`);
    set({ refs: [...state.refs, ...imgs.slice(0, room).map((f) => URL.createObjectURL(f))] });
  };

  const credits = state.video
    ? estimateCredits({
        model: state.model,
        quality: state.quality,
        seconds: state.video.seconds,
        refs: state.refs.length,
        styled: state.styleId !== 'none' || !!state.customStyle,
      })
    : null;
  const canGenerate = !!state.video && state.refs.length > 0;
  const refsInput = useRef<HTMLInputElement>(null);

  return (
    <>
      <div className="flex-1 min-h-0 overflow-y-auto px-3 py-3 space-y-3">
        {/* Model banner */}
        <div className="theme-dark relative h-[120px] rounded-xl overflow-hidden bg-surface border border-white/[0.06]">
          {banner ? (
            <video src={banner} poster={bannerPoster} muted loop autoPlay playsInline className="absolute inset-0 w-full h-full object-cover opacity-70" />
          ) : bannerPoster ? (
            <img src={bannerPoster} alt="" className="absolute inset-0 w-full h-full object-cover opacity-60" />
          ) : null}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
          <button
            onClick={onOpenModels}
            className="absolute top-2 right-2 h-7 px-2.5 rounded-lg bg-black/50 backdrop-blur text-[12px] text-white flex items-center gap-1 cursor-pointer hover:bg-black/70"
          >
            <Pencil className="w-3 h-3" /> Change
          </button>
          <div className="absolute left-3 bottom-2.5">
            <div className="text-[18px] font-black uppercase tracking-tight text-[#d1fe17] leading-none">{modelLabel}</div>
            <div className="text-[11px] text-neutral-300 mt-1">{modelTagline}</div>
          </div>
        </div>

        {/* Mode toggle */}
        <div className="grid grid-cols-2 gap-1 p-1 rounded-xl bg-surface border border-white/[0.06]">
          {MODES.map((m) => (
            <button
              key={m.id}
              onClick={() => set({ mode: m.id })}
              title={m.hint}
              className={`h-9 rounded-lg text-[12.5px] font-medium cursor-pointer ${
                state.mode === m.id ? 'bg-white/10 text-white' : 'text-neutral-500 hover:text-white'
              }`}
            >
              {m.label}
            </button>
          ))}
        </div>

        {/* Style row */}
        <button
          onClick={onOpenStyle}
          className="w-full rounded-xl bg-surface border border-white/[0.06] px-3 py-2.5 flex items-center gap-3 text-left cursor-pointer hover:bg-white/[0.03]"
        >
          <span className="w-9 h-9 rounded-lg bg-white/[0.06] overflow-hidden flex items-center justify-center">
            {state.customStyle ? <img src={state.customStyle} alt="" className="w-full h-full object-cover" /> : <Wand2 className="w-4 h-4 text-neutral-400" />}
          </span>
          <span className="flex-1">
            <span className="flex items-center gap-1.5 text-[11px] text-neutral-500">
              Style <span className="px-1.5 rounded bg-[#d1fe17] text-black text-[9px] font-bold">NEW</span>
            </span>
            <span className="block text-[13px] text-white">{styleName(state)}</span>
          </span>
          <span className="text-[12px] text-neutral-400 flex items-center">
            Apply <ChevronRight className="w-3.5 h-3.5" />
          </span>
        </button>

        {/* Reference video */}
        {state.video ? (
          <div className="rounded-xl bg-surface border border-white/[0.06] p-4 relative">
            <div className="mx-auto w-[85%] -rotate-3 rounded-xl overflow-hidden border-4 border-white shadow-2xl bg-black transition-transform hover:rotate-0">
              {/\.(mp4|webm|mov)|^blob:/i.test(state.video.url) ? (
                <video src={state.video.url} poster={state.video.poster} muted loop autoPlay playsInline className="w-full aspect-video object-cover" />
              ) : (
                <img src={state.video.url} alt="" className="w-full aspect-video object-cover" />
              )}
            </div>
            <div className="mt-3 flex items-center justify-between text-[11px] text-neutral-500">
              <span className="truncate">
                {state.video.name} · {state.video.seconds}s
              </span>
              <button onClick={() => set({ video: null, parentId: undefined })} className="p-1 hover:text-white cursor-pointer" aria-label="Remove video">
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ) : (
          <Dropzone accept="video/*" icon={<Film className="w-4 h-4" />} title="Reference video" hint={`${LIMITS.videoMin}–${LIMITS.videoMax}s · the motion to copy`} onFiles={onVideo} />
        )}

        {/* References */}
        {state.refs.length ? (
          <div className="rounded-xl bg-surface border border-white/[0.06] p-3">
            <div className="text-[11px] text-neutral-500 mb-2">
              References · {state.refs.length}/{LIMITS.refsMax}
            </div>
            <div className="grid grid-cols-4 gap-2">
              <button
                onClick={() => refsInput.current?.click()}
                className="aspect-square rounded-lg bg-white/[0.05] flex items-center justify-center text-neutral-400 hover:text-white cursor-pointer"
                aria-label="Add references"
              >
                <Plus className="w-4 h-4" />
              </button>
              {state.refs.map((r, i) => (
                <div key={r + i} className="theme-dark relative aspect-square rounded-lg overflow-hidden group">
                  <img src={r} alt="" className="w-full h-full object-cover bg-white/[0.05]" onError={(e) => ((e.target as HTMLImageElement).style.visibility = 'hidden')} />
                  <span className="absolute left-1 bottom-1 text-[9px] px-1 rounded bg-black/60 text-white">@image{i + 1}</span>
                  <button
                    onClick={() => set({ refs: state.refs.filter((_, j) => j !== i) })}
                    className="absolute top-1 right-1 w-5 h-5 rounded-full bg-black/60 text-white hidden group-hover:flex items-center justify-center cursor-pointer"
                    aria-label="Remove reference"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
              <button
                onClick={() => set({ refs: [] })}
                className="aspect-square rounded-lg bg-white/[0.05] flex items-center justify-center text-neutral-400 hover:text-red-400 cursor-pointer"
                aria-label="Clear references"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
            <input
              ref={refsInput}
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={(e) => {
                onRefs(Array.from(e.target.files || []));
                e.target.value = '';
              }}
            />
          </div>
        ) : (
          <Dropzone
            accept="image/*"
            multiple
            icon={<ImagePlus className="w-4 h-4" />}
            title="References"
            hint={`Characters, products, clothes · up to ${LIMITS.refsMax}`}
            onFiles={onRefs}
          />
        )}

        {/* Prompt */}
        <div className="rounded-xl bg-surface border border-white/[0.06] p-3">
          <label className="flex items-center justify-between cursor-pointer">
            <span className="text-[13px] font-medium text-white">Prompt</span>
            <input type="checkbox" className="sr-only peer" checked={state.usePrompt} onChange={(e) => set({ usePrompt: e.target.checked })} />
            <span className="w-9 h-5 rounded-full bg-white/10 peer-checked:bg-[#d1fe17] relative transition-colors after:absolute after:top-0.5 after:left-0.5 after:w-4 after:h-4 after:rounded-full after:bg-white after:transition-transform peer-checked:after:translate-x-4" />
          </label>
          {state.usePrompt && (
            <>
              <textarea
                value={state.prompt}
                onChange={(e) => set({ prompt: e.target.value })}
                rows={5}
                placeholder="Describe the new scene. Reference attachments with @image1, @image2…"
                className="mt-2 w-full bg-transparent text-[13px] text-white placeholder-neutral-500 resize-none focus:outline-none"
              />
              {state.refs.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {state.refs.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => set({ prompt: `${state.prompt}${state.prompt.endsWith(' ') || !state.prompt ? '' : ' '}@image${i + 1} ` })}
                      className="text-[10.5px] px-1.5 py-0.5 rounded bg-white/[0.07] text-neutral-300 hover:bg-white/15 cursor-pointer"
                    >
                      @image{i + 1}
                    </button>
                  ))}
                </div>
              )}
              {state.mode === 'swap' && (
                <div className="mt-3 pt-3 border-t border-white/[0.06] space-y-2">
                  <div className="text-[11px] text-neutral-500">Guided swap builder</div>
                  {builder.map((row, i) => (
                    <div key={i} className="flex gap-1.5">
                      <input
                        value={row.subject}
                        onChange={(e) => setBuilder(builder.map((r, j) => (j === i ? { ...r, subject: e.target.value } : r)))}
                        placeholder="the guy in the white t-shirt"
                        className="flex-1 min-w-0 h-8 px-2 rounded-lg bg-white/[0.05] text-[12px] text-white placeholder-neutral-600 focus:outline-none"
                      />
                      <select
                        value={row.ref}
                        onChange={(e) => setBuilder(builder.map((r, j) => (j === i ? { ...r, ref: Number(e.target.value) } : r)))}
                        className="h-8 px-1 rounded-lg bg-white/[0.05] text-[12px] text-white"
                      >
                        {Array.from({ length: Math.max(1, state.refs.length) }, (_, k) => (
                          <option key={k} value={k + 1} className="bg-neutral-900">
                            @image{k + 1}
                          </option>
                        ))}
                      </select>
                    </div>
                  ))}
                  <input
                    value={constraints}
                    onChange={(e) => setConstraints(e.target.value)}
                    placeholder="Constraints"
                    className="w-full h-8 px-2 rounded-lg bg-white/[0.05] text-[12px] text-white placeholder-neutral-600 focus:outline-none"
                  />
                  <div className="flex gap-1.5">
                    <button
                      onClick={() => setBuilder([...builder, { subject: '', ref: Math.min(builder.length + 1, Math.max(1, state.refs.length)) }])}
                      className="h-7 px-2 rounded-lg bg-white/[0.06] text-[11.5px] text-neutral-300 cursor-pointer"
                    >
                      + Swap
                    </button>
                    <button
                      onClick={() => set({ prompt: buildSwapPrompt(builder, constraints) })}
                      className="h-7 px-2 rounded-lg bg-white/[0.06] text-[11.5px] text-[#d1fe17] cursor-pointer"
                    >
                      Write prompt
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        <SelectPopover
          label="Model"
          value={state.model}
          onChange={(v) => set({ model: v })}
          options={REMIX_MODELS.map((m) => ({ value: m.id, label: m.name, description: m.tagline, badges: m.badges }))}
        />
        <SelectPopover label="Quality" value={state.quality} onChange={(v) => set({ quality: v as Quality })} options={QUALITIES.map((q) => ({ value: q, label: q }))} />
      </div>

      <div className="shrink-0 p-3 border-t border-white/[0.06]">
        <button
          onClick={onGenerate}
          disabled={!canGenerate}
          className={`w-full h-12 rounded-xl font-semibold text-[14px] flex items-center justify-center gap-2 transition-all ${
            canGenerate ? 'bg-[#d1fe17] text-black hover:brightness-95 cursor-pointer' : 'bg-white/[0.06] text-neutral-500 cursor-not-allowed'
          }`}
        >
          Generate
          {credits !== null && canGenerate && (
            <span key={credits} className="flex items-center gap-1 animate-sheet-up">
              <Sparkles className="w-3.5 h-3.5" /> {credits}
            </span>
          )}
        </button>
        {!canGenerate && <p className="mt-1.5 text-center text-[11px] text-neutral-500">Add a reference video and at least one reference image</p>}
      </div>
    </>
  );
};

/* ============================================================
 * Edit panel (8 tools)
 * ============================================================ */

const EditPanel: React.FC<{ onGenerate: (g: Omit<RemixGeneration, 'id' | 'createdAt' | 'status'>) => void }> = ({ onGenerate }) => {
  const [tool, setTool] = useState<EditToolId | null>(null);
  const [mode, setMode] = useState<'prompt' | 'draw'>('prompt');
  const [video, setVideo] = useState<VideoInput | null>(null);
  const [elements, setElements] = useState<string[]>([]);
  const [prompt, setPrompt] = useState('');
  const [audio, setAudio] = useState(true);
  const [model, setModel] = useState(REMIX_MODELS[0].id);
  const [quality, setQuality] = useState<Quality>('1080p');
  const [bitrate, setBitrate] = useState<string>('High');
  const [aspect, setAspect] = useState<string>('9:16');
  const [extendBy, setExtendBy] = useState(5);
  const [drawing, setDrawing] = useState(false);
  const [mask, setMask] = useState<string | null>(null);

  if (!tool) {
    return (
      <div className="flex-1 min-h-0 overflow-y-auto p-3 space-y-1.5">
        {EDIT_TOOLS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTool(t.id)}
            className="w-full rounded-xl bg-surface border border-white/[0.06] px-3.5 py-3 flex items-center gap-3 text-left cursor-pointer hover:bg-white/[0.04]"
          >
            <span className="flex-1">
              <span className="flex items-center gap-1.5 text-[13px] font-medium text-white">
                {t.name}
                {t.isNew && <span className="px-1.5 rounded bg-[#d1fe17] text-black text-[9px] font-bold">NEW</span>}
              </span>
              <span className="block text-[11.5px] text-neutral-500">{t.desc}</span>
            </span>
            <ChevronRight className="w-4 h-4 text-neutral-500" />
          </button>
        ))}
      </div>
    );
  }

  const meta = EDIT_TOOLS.find((t) => t.id === tool)!;
  const seconds = (video?.seconds || 5) + (tool === 'extend' ? extendBy : 0);
  const credits = estimateCredits({ model, quality, seconds, refs: elements.length, styled: false });
  const canGen = !!video && (tool !== 'edit' || mode === 'draw' ? !!video : !!prompt.trim());

  return (
    <>
      <div className="flex-1 min-h-0 overflow-y-auto p-3 space-y-3">
        <button onClick={() => setTool(null)} className="text-[12px] text-neutral-400 hover:text-white cursor-pointer">
          ← All tools
        </button>
        <div className="text-[15px] font-semibold text-white">{meta.name}</div>
        {tool === 'edit' && (
          <div className="grid grid-cols-2 gap-1 p-1 rounded-xl bg-surface border border-white/[0.06]">
            {(['prompt', 'draw'] as const).map((m) => (
              <button
                key={m}
                onClick={() => setMode(m)}
                className={`h-8 rounded-lg text-[12.5px] font-medium capitalize cursor-pointer ${mode === m ? 'bg-white/10 text-white' : 'text-neutral-500'}`}
              >
                {m}
              </button>
            ))}
          </div>
        )}
        {video ? (
          <div className="rounded-xl overflow-hidden bg-black relative">
            <video src={video.url} muted loop autoPlay playsInline className="w-full aspect-video object-cover" />
            {mask && <img src={mask} alt="" className="absolute inset-0 w-full h-full object-cover pointer-events-none" />}
            <button onClick={() => (setVideo(null), setMask(null))} className="absolute top-2 right-2 p-1.5 rounded-lg bg-black/60 text-white cursor-pointer" aria-label="Remove video">
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        ) : (
          <Dropzone
            accept="video/*"
            icon={<Film className="w-4 h-4" />}
            title="Upload video"
            hint="Up to 30s"
            onFiles={async (files) => {
              const f = files.find((x) => x.type.startsWith('video/'));
              if (!f) return;
              const url = URL.createObjectURL(f);
              const s = await readDuration(url);
              if (s > LIMITS.videoMax) return toast(`Max ${LIMITS.videoMax}s`);
              setVideo({ url, name: f.name, seconds: s || 5 });
            }}
          />
        )}

        {tool === 'edit' && mode === 'draw' && (
          <button
            disabled={!video}
            onClick={() => setDrawing(true)}
            className="w-full h-10 rounded-xl bg-surface border border-white/[0.06] text-[13px] text-white flex items-center justify-center gap-2 disabled:opacity-40 cursor-pointer"
          >
            <Brush className="w-4 h-4" /> {mask ? 'Edit sketch' : 'Draw on frame'}
          </button>
        )}

        {tool === 'edit' && (
          <>
            <Dropzone
              accept="image/*,audio/*"
              multiple
              icon={<ImagePlus className="w-4 h-4" />}
              title="Elements"
              hint={`Images or audio · up to ${LIMITS.editRefsMax}`}
              onFiles={(fs) => setElements((e) => [...e, ...fs.map((f) => URL.createObjectURL(f))].slice(0, LIMITS.editRefsMax))}
            >
              {elements.length > 0 && <div className="px-3 pb-3 text-[11px] text-neutral-400">{elements.length} element(s) attached</div>}
            </Dropzone>
            <div className="rounded-xl bg-surface border border-white/[0.06] p-3">
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                rows={4}
                placeholder={mode === 'draw' ? 'What should appear in the sketched area?' : 'Describe the change. Use @element1 to reference uploads.'}
                className="w-full bg-transparent text-[13px] text-white placeholder-neutral-500 resize-none focus:outline-none"
              />
              <div className="flex items-center justify-between">
                <span className="text-[10.5px] px-1.5 py-0.5 rounded bg-white/[0.07] text-neutral-400">@ elements</span>
                <button onClick={() => setAudio(!audio)} className="text-neutral-400 hover:text-white cursor-pointer" aria-label="Toggle audio">
                  {audio ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
                </button>
              </div>
            </div>
          </>
        )}
        {tool === 'extend' && (
          <SelectPopover label="Extend by" value={String(extendBy)} onChange={(v) => setExtendBy(Number(v))} options={[3, 5, 8, 10].map((n) => ({ value: String(n), label: `${n}s` }))} />
        )}
        {tool === 'reframe' && <SelectPopover label="Format" value={aspect} onChange={setAspect} options={ASPECTS.map((a) => ({ value: a, label: a }))} />}

        <SelectPopover
          label="Model"
          value={model}
          onChange={setModel}
          options={REMIX_MODELS.map((m) => ({ value: m.id, label: m.name, description: m.tagline, badges: m.badges }))}
        />
        <SelectPopover label="Quality" value={quality} onChange={(v) => setQuality(v as Quality)} options={QUALITIES.map((q) => ({ value: q, label: q }))} />
        <SelectPopover label="Bitrate" value={bitrate} onChange={setBitrate} options={BITRATES.map((b) => ({ value: b, label: b }))} />
      </div>
      <div className="shrink-0 p-3 border-t border-white/[0.06]">
        <button
          disabled={!canGen}
          onClick={() =>
            video &&
            onGenerate({
              kind: 'edit',
              tool,
              model,
              quality,
              aspect: tool === 'reframe' ? aspect : '9:16',
              seconds,
              inputs: { video: video.url, videoName: video.name, refs: elements, prompt, style: 'No style' },
              output: { url: video.url },
              credits,
            })
          }
          className={`w-full h-12 rounded-xl font-semibold text-[14px] flex items-center justify-center gap-2 ${
            canGen ? 'bg-[#d1fe17] text-black cursor-pointer' : 'bg-white/[0.06] text-neutral-500 cursor-not-allowed'
          }`}
        >
          {meta.name} {canGen && <span className="flex items-center gap-1"><Sparkles className="w-3.5 h-3.5" /> {credits}</span>}
        </button>
      </div>
      {drawing && video && (
        <DrawModal
          video={video.url}
          onClose={() => setDrawing(false)}
          onSave={(png) => {
            setMask(png);
            setDrawing(false);
          }}
        />
      )}
    </>
  );
};

/* ============================================================
 * Draw-to-edit modal
 * ============================================================ */

const DrawModal: React.FC<{ video: string; onClose: () => void; onSave: (png: string) => void }> = ({ video, onClose, onSave }) => {
  const canvas = useRef<HTMLCanvasElement>(null);
  const [tab, setTab] = useState<'video' | 'edit'>('edit');
  const [tool, setTool] = useState<'brush' | 'eraser'>('brush');
  const [size, setSize] = useState(18);
  const history = useRef<ImageData[]>([]);
  const drawingRef = useRef(false);

  useEffect(() => {
    const c = canvas.current!;
    const r = c.getBoundingClientRect();
    c.width = r.width;
    c.height = r.height;
  }, []);

  const pos = (e: React.PointerEvent) => {
    const r = canvas.current!.getBoundingClientRect();
    return [e.clientX - r.left, e.clientY - r.top] as const;
  };
  const down = (e: React.PointerEvent) => {
    const ctx = canvas.current!.getContext('2d')!;
    history.current.push(ctx.getImageData(0, 0, canvas.current!.width, canvas.current!.height));
    drawingRef.current = true;
    ctx.beginPath();
    ctx.moveTo(...pos(e));
  };
  const move = (e: React.PointerEvent) => {
    if (!drawingRef.current) return;
    const ctx = canvas.current!.getContext('2d')!;
    ctx.globalCompositeOperation = tool === 'eraser' ? 'destination-out' : 'source-over';
    ctx.strokeStyle = 'rgba(209,254,23,0.75)';
    ctx.lineWidth = size;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.lineTo(...pos(e));
    ctx.stroke();
  };
  const undo = () => {
    const prev = history.current.pop();
    if (prev) canvas.current!.getContext('2d')!.putImageData(prev, 0, 0);
  };

  return (
    <div className="theme-dark fixed inset-0 z-[80] bg-black/90 flex flex-col" role="dialog" aria-label="Draw to edit">
      <div className="flex items-center gap-5 px-5 h-14 border-b border-white/10">
        {(
          [
            ['video', 'Draw to Video'],
            ['edit', 'Draw to Edit'],
          ] as const
        ).map(([id, l]) => (
          <button key={id} onClick={() => setTab(id)} className={`text-[13px] font-medium cursor-pointer ${tab === id ? 'text-white' : 'text-neutral-500'}`}>
            {l}
          </button>
        ))}
        <div className="flex-1" />
        <button onClick={onClose} className="p-2 text-neutral-400 hover:text-white cursor-pointer" aria-label="Close">
          <X className="w-5 h-5" />
        </button>
      </div>
      <div className="flex-1 flex items-center justify-center p-6 min-h-0">
        <div className="relative w-full max-w-4xl aspect-video rounded-xl overflow-hidden bg-neutral-900">
          <video src={video} muted playsInline className="absolute inset-0 w-full h-full object-contain" />
          <canvas
            ref={canvas}
            onPointerDown={down}
            onPointerMove={move}
            onPointerUp={() => (drawingRef.current = false)}
            onPointerLeave={() => (drawingRef.current = false)}
            className="absolute inset-0 w-full h-full cursor-crosshair touch-none"
          />
        </div>
      </div>
      <div className="flex items-center justify-center gap-2 p-4 border-t border-white/10">
        <button onClick={() => setTool('brush')} className={`p-2.5 rounded-lg cursor-pointer ${tool === 'brush' ? 'bg-white/15 text-white' : 'text-neutral-400'}`} aria-label="Brush">
          <Brush className="w-4 h-4" />
        </button>
        <button onClick={() => setTool('eraser')} className={`p-2.5 rounded-lg cursor-pointer ${tool === 'eraser' ? 'bg-white/15 text-white' : 'text-neutral-400'}`} aria-label="Eraser">
          <Eraser className="w-4 h-4" />
        </button>
        <input type="range" min={4} max={60} value={size} onChange={(e) => setSize(Number(e.target.value))} className="w-32 accent-[#d1fe17]" aria-label="Brush size" />
        <button onClick={undo} className="p-2.5 rounded-lg text-neutral-400 hover:text-white cursor-pointer" aria-label="Undo">
          <Undo2 className="w-4 h-4" />
        </button>
        <button
          onClick={() => onSave(canvas.current!.toDataURL('image/png'))}
          className="ml-4 h-10 px-5 rounded-xl bg-[#d1fe17] text-black font-semibold text-[13px] cursor-pointer"
        >
          Use sketch
        </button>
      </div>
    </div>
  );
};

/* ============================================================
 * Style modal (Presets / Custom)
 * ============================================================ */

const StyleModal: React.FC<{
  styleId: string;
  custom: string | null;
  onClose: () => void;
  onApply: (styleId: string, custom: string | null) => void;
}> = ({ styleId, custom, onClose, onApply }) => {
  const [tab, setTab] = useState<'presets' | 'custom'>(custom ? 'custom' : 'presets');
  const [pick, setPick] = useState(styleId);
  const [img, setImg] = useState<string | null>(custom);
  return (
    <div className="fixed inset-0 z-[70] bg-black/70 flex items-end sm:items-center justify-center" onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()} className="w-full sm:max-w-2xl max-h-[85vh] flex flex-col rounded-t-2xl sm:rounded-2xl bg-base border border-white/10 animate-sheet-up">
        <div className="flex items-center gap-5 px-5 pt-4 border-b border-white/[0.06]">
          {(['presets', 'custom'] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`pb-3 text-[13px] font-medium capitalize border-b-2 -mb-px cursor-pointer ${tab === t ? 'border-[#d1fe17] text-white' : 'border-transparent text-neutral-500'}`}
            >
              {t}
            </button>
          ))}
          <div className="flex-1" />
          <button onClick={onClose} className="pb-3 text-neutral-400 hover:text-white cursor-pointer" aria-label="Close">
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-4">
          {tab === 'presets' ? (
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
              {RENDER_STYLES.map((s, i) => (
                <button
                  key={s.id}
                  onClick={() => setPick(s.id)}
                  className={`theme-dark relative aspect-[4/5] rounded-xl overflow-hidden border-2 text-left cursor-pointer ${
                    pick === s.id ? 'border-[#d1fe17]' : 'border-transparent'
                  }`}
                  style={{ background: `linear-gradient(135deg, hsl(${(i * 47) % 360} 55% 30%), hsl(${(i * 47 + 80) % 360} 60% 14%))` }}
                >
                  <span className="absolute left-2 bottom-2 text-[12px] font-medium text-white drop-shadow">{s.name}</span>
                  {pick === s.id && <Check className="absolute top-2 right-2 w-4 h-4 text-[#d1fe17]" />}
                </button>
              ))}
            </div>
          ) : (
            <div className="space-y-3">
              <p className="text-[12px] text-neutral-400">Upload one image. The output takes its look — palette, texture, lighting — not its subject.</p>
              <Dropzone accept="image/*" icon={<ImagePlus className="w-4 h-4" />} title="Upload style image" hint="JPG or PNG" onFiles={(f) => f[0] && setImg(URL.createObjectURL(f[0]))}>
                {img && <img src={img} alt="" className="mx-3 mb-3 h-40 rounded-lg object-cover" />}
              </Dropzone>
            </div>
          )}
        </div>
        <div className="p-4 border-t border-white/[0.06] flex justify-end gap-2">
          <button onClick={onClose} className="h-10 px-4 rounded-xl bg-white/[0.06] text-[13px] text-white cursor-pointer">
            Cancel
          </button>
          <button
            onClick={() => onApply(tab === 'custom' && img ? 'none' : pick, tab === 'custom' ? img : null)}
            className="h-10 px-5 rounded-xl bg-[#d1fe17] text-black font-semibold text-[13px] cursor-pointer"
          >
            Apply
          </button>
        </div>
      </div>
    </div>
  );
};

/* ============================================================
 * Model picker sheet (slides over canvas)
 * ============================================================ */

const ModelSheet: React.FC<{ value: string; onPick: (id: string) => void; onClose: () => void }> = ({ value, onPick, onClose }) => {
  const [prov, setProv] = useState<'All' | 'Studio' | 'Partner'>('All');
  const [q, setQ] = useState('');
  const list = REMIX_MODELS.filter((m) => (prov === 'All' || m.provider === prov) && (m.name + m.tagline).toLowerCase().includes(q.toLowerCase()));
  return (
    <div className="absolute inset-0 z-30 bg-canvas animate-sheet-up p-5 overflow-y-auto">
      <div className="flex items-center gap-3 mb-4">
        <h2 className="text-[17px] font-semibold flex-1">Choose a model</h2>
        <button onClick={onClose} className="p-2 text-neutral-400 hover:text-white cursor-pointer" aria-label="Close">
          <X className="w-5 h-5" />
        </button>
      </div>
      <div className="flex flex-wrap items-center gap-2 mb-4">
        {(['All', 'Studio', 'Partner'] as const).map((p) => (
          <button key={p} onClick={() => setProv(p)} className={`h-8 px-3 rounded-full text-[12.5px] cursor-pointer ${prov === p ? 'bg-[#d1fe17] text-black' : 'bg-white/[0.06] text-neutral-300'}`}>
            {p}
          </button>
        ))}
        <div className="flex items-center gap-2 h-8 px-3 rounded-full bg-white/[0.06] ml-auto">
          <Search className="w-3.5 h-3.5 text-neutral-500" />
          <input autoFocus value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search models" className="bg-transparent text-[12.5px] focus:outline-none w-40" />
        </div>
      </div>
      <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-3">
        {list.map((m) => (
          <button
            key={m.id}
            onClick={() => onPick(m.id)}
            className={`rounded-xl p-4 text-left bg-surface border cursor-pointer hover:bg-white/[0.04] ${value === m.id ? 'border-[#d1fe17]' : 'border-white/[0.06]'}`}
          >
            <div className="flex items-center gap-2">
              <span className="text-[15px] font-semibold flex-1">{m.name}</span>
              {m.tier === 'lite' && <span className="text-[10px] px-1.5 py-0.5 rounded bg-white/[0.07] text-neutral-300">Lite</span>}
            </div>
            <div className="text-[12px] text-neutral-500 mt-0.5">{m.tagline}</div>
            <div className="flex gap-1 mt-3">
              {m.badges.map((b) => (
                <span key={b} className="text-[10px] px-1.5 py-0.5 rounded bg-white/[0.07] text-neutral-400">
                  {b}
                </span>
              ))}
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-white/[0.07] text-neutral-400">{m.provider}</span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

/* ============================================================
 * History (filter + view)
 * ============================================================ */

type HistView = 'list' | 'grid' | 'masonry';

const HistoryView: React.FC<{ gens: RemixGeneration[]; onRemixAgain: (g: RemixGeneration) => void }> = ({ gens, onRemixAgain }) => {
  const [reporting, setReporting] = useState<RemixGeneration | null>(null);
  const [filterOpen, setFilterOpen] = useState(false);
  const [viewOpen, setViewOpen] = useState(false);
  const [f, setF] = useState({ model: 'all', from: '', to: '', hideFailed: false, liked: false, downloaded: false });
  const [view, setView] = useState<HistView>('list');
  const [size, setSize] = useState(3);

  const list = gens.filter((g) => {
    if (f.model !== 'all' && g.model !== f.model) return false;
    if (f.hideFailed && g.status === 'failed') return false;
    if (f.liked && !g.liked) return false;
    if (f.downloaded && !g.downloaded) return false;
    if (f.from && g.createdAt.slice(0, 10) < f.from) return false;
    if (f.to && g.createdAt.slice(0, 10) > f.to) return false;
    return true;
  });

  const download = (g: RemixGeneration) => {
    if (!g.output?.url) return;
    const a = document.createElement('a');
    a.href = g.output.url;
    a.download = `remix-${g.id}.mp4`;
    a.click();
    updateGeneration(g.id, { downloaded: true });
  };

  const cols = ['', 'grid-cols-1', 'grid-cols-2', 'grid-cols-3', 'grid-cols-4', 'grid-cols-5'][size];
  const mcols = ['', 'columns-1', 'columns-2', 'columns-3', 'columns-4', 'columns-5'][size];

  const Media: React.FC<{ g: RemixGeneration; className?: string }> = ({ g, className }) =>
    g.status === 'queued' || g.status === 'running' ? (
      <div className={`${className} aspect-[9/16] max-h-[420px] relative overflow-hidden rounded-xl shimmer flex flex-col items-center justify-center gap-2 text-neutral-400 text-[12px]`}>
        {g.output?.poster && <img src={g.output.poster} alt="" className="absolute inset-0 w-full h-full object-cover opacity-20 blur-sm" />}
        <span className="relative">{g.status === 'queued' ? 'Queued…' : `Generating · ${g.progress ?? 0}%`}</span>
        <span className="relative w-2/3 h-1.5 rounded-full bg-white/10 overflow-hidden">
          <span className="block h-full bg-[#d1fe17] transition-[width] duration-300" style={{ width: `${g.progress ?? 2}%` }} />
        </span>
      </div>
    ) : (
      <div className={`${className} relative overflow-hidden`}>
        {g.output?.url && /\.(mp4|webm|mov)|^blob:/i.test(g.output.url) ? (
          <video src={g.output.url} poster={g.output.poster} muted loop autoPlay playsInline controls={view === 'list'} className="w-full h-full object-contain bg-black" />
        ) : (
          <img src={g.output?.poster || g.output?.url} alt="" className="w-full h-full object-cover bg-black" />
        )}
        {g.scene && (
          <span className="theme-dark absolute right-2 bottom-2 px-1.5 py-0.5 rounded bg-black/55 text-[9.5px] text-white/85 tracking-wide pointer-events-none">{g.scene.watermark}</span>
        )}
      </div>
    );

  const Actions: React.FC<{ g: RemixGeneration }> = ({ g }) => (
    <div className="flex gap-1">
      <button onClick={() => updateGeneration(g.id, { liked: !g.liked })} className="p-1.5 rounded-lg hover:bg-white/10 cursor-pointer" aria-label="Like">
        <Heart className={`w-4 h-4 ${g.liked ? 'fill-red-500 text-red-500' : 'text-neutral-400'}`} />
      </button>
      <button onClick={() => download(g)} className="p-1.5 rounded-lg hover:bg-white/10 cursor-pointer" aria-label="Download">
        <Download className={`w-4 h-4 ${g.downloaded ? 'text-[#d1fe17]' : 'text-neutral-400'}`} />
      </button>
      {g.scene && g.status === 'done' && (
        <>
          <button
            onClick={async () => {
              const url = `${location.origin}/r/${g.id}`;
              try {
                if (navigator.share) await navigator.share({ title: g.scene!.clipTitle, url });
                else await navigator.clipboard.writeText(url);
                toast('Link ready to share');
              } catch {}
            }}
            className="p-1.5 rounded-lg hover:bg-white/10 cursor-pointer"
            aria-label="Share"
          >
            <Share2 className="w-4 h-4 text-neutral-400" />
          </button>
          <button onClick={() => onRemixAgain(g)} className="p-1.5 rounded-lg hover:bg-white/10 cursor-pointer" aria-label="Remix again">
            <Repeat2 className="w-4 h-4 text-neutral-400" />
          </button>
          <button onClick={() => setReporting(g)} className="p-1.5 rounded-lg hover:bg-white/10 cursor-pointer" aria-label="Report">
            <Flag className="w-4 h-4 text-neutral-400" />
          </button>
        </>
      )}
      <button onClick={() => deleteGeneration(g.id)} className="p-1.5 rounded-lg hover:bg-white/10 cursor-pointer" aria-label="Delete">
        <Trash2 className="w-4 h-4 text-neutral-400" />
      </button>
    </div>
  );

  return (
    <div className="p-5 pb-24">
      <div className="flex items-center gap-2 mb-4 relative">
        <button onClick={() => (setFilterOpen(!filterOpen), setViewOpen(false))} className="h-8 px-3 rounded-lg bg-white/[0.06] text-[12.5px] flex items-center gap-1.5 cursor-pointer">
          <SlidersHorizontal className="w-3.5 h-3.5" /> Filter
        </button>
        <button onClick={() => (setViewOpen(!viewOpen), setFilterOpen(false))} className="h-8 px-3 rounded-lg bg-white/[0.06] text-[12.5px] flex items-center gap-1.5 cursor-pointer">
          <LayoutGrid className="w-3.5 h-3.5" /> View
        </button>
        <span className="text-[12px] text-neutral-500 ml-auto">{list.length} generations</span>
        {filterOpen && (
          <div className="absolute top-10 left-0 z-20 w-72 rounded-xl bg-base border border-white/10 shadow-2xl p-3 space-y-3 animate-sheet-up">
            <div className="text-[11px] uppercase tracking-wide text-neutral-500">Type</div>
            <select value={f.model} onChange={(e) => setF({ ...f, model: e.target.value })} className="w-full h-9 px-2 rounded-lg bg-white/[0.06] text-[13px]">
              <option value="all" className="bg-neutral-900">All models</option>
              {REMIX_MODELS.map((m) => (
                <option key={m.id} value={m.id} className="bg-neutral-900">
                  {m.name}
                </option>
              ))}
            </select>
            <div className="flex gap-2">
              <input type="date" value={f.from} onChange={(e) => setF({ ...f, from: e.target.value })} className="flex-1 h-9 px-2 rounded-lg bg-white/[0.06] text-[12px] [color-scheme:dark]" aria-label="From" />
              <input type="date" value={f.to} onChange={(e) => setF({ ...f, to: e.target.value })} className="flex-1 h-9 px-2 rounded-lg bg-white/[0.06] text-[12px] [color-scheme:dark]" aria-label="To" />
            </div>
            {(
              [
                ['hideFailed', 'Hide failed'],
                ['liked', 'Liked'],
                ['downloaded', 'Downloaded'],
              ] as const
            ).map(([k, l], i) => (
              <React.Fragment key={k}>
                {i === 1 && <div className="text-[11px] uppercase tracking-wide text-neutral-500 pt-1">Activity</div>}
                <label className="flex items-center justify-between text-[13px] cursor-pointer">
                  {l}
                  <input type="checkbox" checked={f[k]} onChange={(e) => setF({ ...f, [k]: e.target.checked })} className="accent-[#d1fe17]" />
                </label>
              </React.Fragment>
            ))}
          </div>
        )}
        {viewOpen && (
          <div className="absolute top-10 left-20 z-20 w-60 rounded-xl bg-base border border-white/10 shadow-2xl p-3 space-y-3 animate-sheet-up">
            <div className="grid grid-cols-3 gap-1">
              {(
                [
                  ['list', LayoutList],
                  ['grid', LayoutGrid],
                  ['masonry', Rows3],
                ] as const
              ).map(([v, Icon]) => (
                <button key={v} onClick={() => setView(v)} className={`h-14 rounded-lg flex flex-col items-center justify-center gap-1 text-[11px] capitalize cursor-pointer ${view === v ? 'bg-white/15 text-white' : 'bg-white/[0.04] text-neutral-400'}`}>
                  <Icon className="w-4 h-4" /> {v}
                </button>
              ))}
            </div>
            {view !== 'list' && (
              <label className="block text-[11px] text-neutral-500">
                Card size
                <input type="range" min={1} max={5} value={6 - size} onChange={(e) => setSize(6 - Number(e.target.value))} className="w-full accent-[#d1fe17]" />
              </label>
            )}
          </div>
        )}
      </div>

      {list.length === 0 ? (
        <div className="text-center py-24 text-neutral-500 text-sm">
          {gens.length ? 'Nothing matches these filters.' : 'Your remixes will appear here. Recreate something from the library to start.'}
        </div>
      ) : view === 'list' ? (
        <div className="space-y-4">
          {list.map((g) => (
            <div key={g.id} className="flex flex-col md:flex-row gap-4 rounded-2xl bg-surface border border-white/[0.06] p-3">
              <Media g={g} className="w-full md:w-[300px] rounded-xl max-h-[460px] object-contain" />
              <div className="flex-1 min-w-0 space-y-3">
                <div className="flex items-center gap-2">
                  <span className="text-[13px] font-semibold">{modelName(g.model)}</span>
                  <span className="text-[10.5px] px-1.5 py-0.5 rounded bg-white/[0.07] text-neutral-300">
                    {g.kind === 'edit' ? EDIT_TOOLS.find((t) => t.id === g.tool)?.name : MODES.find((m) => m.id === g.mode)?.label}
                  </span>
                  {g.parentId && <span className="text-[10.5px] px-1.5 py-0.5 rounded bg-[#d1fe17]/15 text-[#d1fe17]">Remix</span>}
                  <div className="ml-auto">
                    <Actions g={g} />
                  </div>
                </div>
                {g.inputs.refs.length > 0 && (
                  <div className="flex gap-1.5 flex-wrap">
                    {g.inputs.refs.slice(0, 8).map((r, i) => (
                      <img key={i} src={r} alt="" className="w-10 h-10 rounded-lg object-cover" onError={(e) => ((e.target as HTMLImageElement).style.display = 'none')} />
                    ))}
                  </div>
                )}
                {g.scene && (
                  <div className="text-[12px] text-neutral-300">
                    <span className="text-neutral-500">Scene · </span>
                    {g.scene.clipTitle}
                    <span className="text-neutral-500"> · Cast </span>
                    {g.scene.cast.map((c) => `${c.person_index}: ${c.name}`).join(', ')}
                  </div>
                )}
                {g.inputs.prompt && <p className="text-[12.5px] text-neutral-300 line-clamp-4">{g.inputs.prompt}</p>}
                {g.scene && (
                  <details className="text-[11px] text-neutral-500">
                    <summary className="cursor-pointer hover:text-white">Provenance</summary>
                    <pre className="mt-1 p-2 rounded-lg bg-black/30 whitespace-pre-wrap break-all">{JSON.stringify(g.scene.provenance, null, 2)}</pre>
                  </details>
                )}
                <dl className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-[11.5px]">
                  {[
                    ['Resolution', g.quality],
                    ['Duration', `${g.seconds}s`],
                    ['Aspect', g.aspect],
                    ['Style', g.inputs.style],
                    ['Credits', String(g.credits)],
                    ['Date', new Date(g.createdAt).toLocaleString()],
                  ].map(([k, v]) => (
                    <div key={k}>
                      <dt className="text-neutral-500">{k}</dt>
                      <dd className="text-white">{v}</dd>
                    </div>
                  ))}
                </dl>
              </div>
            </div>
          ))}
        </div>
      ) : view === 'grid' ? (
        <div className={`grid ${cols} gap-3`}>
          {list.map((g) => (
            <div key={g.id} className="rounded-xl overflow-hidden bg-surface relative group">
              <Media g={g} className="w-full aspect-[9/16] object-cover" />
              <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 bg-black/60 rounded-lg">
                <Actions g={g} />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className={`${mcols} gap-3`}>
          {list.map((g) => (
            <div key={g.id} className="mb-3 break-inside-avoid rounded-xl overflow-hidden bg-surface relative group">
              <Media g={g} className="w-full" />
              <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 bg-black/60 rounded-lg">
                <Actions g={g} />
              </div>
            </div>
          ))}
        </div>
      )}
      {reporting && <ReportModal targetId={reporting.id} targetLabel={`remix of “${reporting.scene?.clipTitle}”`} onClose={() => setReporting(null)} />}
    </div>
  );
};
