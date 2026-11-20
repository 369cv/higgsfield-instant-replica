import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Sparkles,
  X,
  Search,
  Check,
  Upload,
  FolderOpen,
  Plus,
  Minus,
  Palette as PaletteIcon,
  User,
  ChevronDown,
  CheckCircle2,
  XCircle,
  Trash2,
  Loader2,
  ArrowLeft,
  Copy,
} from 'lucide-react';
import { VaultItem } from '../../types';
import { toast } from '../../components/ui';
import { HiggsfieldService } from '../../services/higgsfieldBridge';
import { CHARACTER_PRESETS, presetFace } from '../influencer/catalog';
import curated from '../../data/curatedMoodboards.json';
import {
  CURATED_PRESETS,
  CuratedPreset,
  PRESET_GROUPS,
  GEN_MODELS,
  ASPECTS,
  QUALITIES,
  CURATED_PALETTES,
  Palette,
  BUILD_RULES,
  estimateCost,
} from './catalog';
import {
  useMoodboardStore,
  addBoard,
  deleteBoard,
  addPalette,
  addGen,
  deleteGen,
  inspectImage,
  extractPalette,
  UserMoodboard,
} from './store';

/** A moodboard reference usable by the generator: curated preset or user board. */
interface BoardRef {
  id: string;
  name: string;
  cover: string;
  look: string;
  mine?: boolean;
}

const GENERAL: BoardRef = { id: 'general', name: 'General', cover: '', look: '' };

/* ============================================================
 * Studio
 * ============================================================ */

export const MoodboardStudio: React.FC<{ vaultItems: VaultItem[] }> = ({ vaultItems }) => {
  const store = useMoodboardStore();
  const [view, setView] = useState<'landing' | 'generator'>('landing');
  const [board, setBoard] = useState<BoardRef>(GENERAL);
  const [building, setBuilding] = useState(false);
  const [picker, setPicker] = useState(false);

  // Cover art: user's own curated drops first, then vault images.
  const pool = useMemo(() => {
    const own = (curated.curatedBoards as { sampleImages: string[]; datasetImages?: string[] }[]).flatMap((b) => [...b.sampleImages, ...(b.datasetImages || [])]);
    const vault = vaultItems.filter((v) => !v.videoUrl).map((v) => v.imageUrl || v.fullImageUrl || '').filter(Boolean);
    return [...new Set([...own, ...vault])];
  }, [vaultItems]);

  const presets: BoardRef[] = useMemo(
    () => CURATED_PRESETS.map((p, i) => ({ id: p.id, name: p.name, look: p.look, cover: pool[(i * 3) % Math.max(1, pool.length)] || '' })),
    [pool]
  );
  const mine: BoardRef[] = store.boards.map((b) => ({ id: b.id, name: b.name, cover: b.cover, look: b.look, mine: true }));

  const openGenerator = (b: BoardRef) => {
    setBoard(b);
    setView('generator');
    window.scrollTo({ top: 0 });
  };

  return (
    <div className="flex-1 flex flex-col min-h-app-content">
      {view === 'landing' ? (
        <Landing
          pool={pool}
          presets={presets}
          presetMeta={CURATED_PRESETS}
          mine={store.boards}
          onBuild={() => setBuilding(true)}
          onOpen={openGenerator}
        />
      ) : (
        <Generator
          board={board}
          onBack={() => setView('landing')}
          onChangeBoard={() => setPicker(true)}
          onClearBoard={() => setBoard(GENERAL)}
          pool={pool}
        />
      )}

      {picker && (
        <BoardPicker
          curated={presets}
          mine={mine}
          value={board.id}
          onClose={() => setPicker(false)}
          onBuild={() => (setPicker(false), setBuilding(true))}
          onPick={(b) => (setBoard(b), setPicker(false))}
        />
      )}
      {building && (
        <BuildModal
          vaultItems={vaultItems}
          onClose={() => setBuilding(false)}
          onCreated={(b) => {
            setBuilding(false);
            toast(`Training "${b.name}"…`);
            openGenerator({ id: b.id, name: b.name, cover: b.cover, look: b.look, mine: true });
          }}
        />
      )}
    </div>
  );
};

/* ============================================================
 * Landing: hero + curated grid + my boards
 * ============================================================ */

const Landing: React.FC<{
  pool: string[];
  presets: BoardRef[];
  presetMeta: CuratedPreset[];
  mine: UserMoodboard[];
  onBuild: () => void;
  onOpen: (b: BoardRef) => void;
}> = ({ pool, presets, presetMeta, mine, onBuild, onOpen }) => {
  const [set, setSet] = useState(0);
  const [group, setGroup] = useState<(typeof PRESET_GROUPS)[number]>('All');
  const sets = Math.max(1, Math.floor(pool.length / 4));

  useEffect(() => {
    const t = setInterval(() => setSet((s) => (s + 1) % sets), 3500);
    return () => clearInterval(t);
  }, [sets]);

  const hero = pool.slice(set * 4, set * 4 + 4);
  const filtered = presets.filter((p, i) => group === 'All' || presetMeta[i].group === group);

  return (
    <div className="pb-[calc(var(--m-tab-h)+24px)] md:pb-12">
      <section className="px-4 pt-10 pb-10 flex flex-col items-center text-center overflow-hidden">
        <div className="relative flex items-center justify-center gap-2 sm:gap-3 h-[140px] sm:h-[170px] mb-8" aria-hidden="true">
          <div className="absolute inset-0 blur-3xl bg-white/10 rounded-full scale-75" />
          {hero.map((src, i) => (
            <div
              key={`${set}-${i}`}
              className={`relative overflow-hidden bg-surface border-2 border-white/80 shadow-2xl animate-sheet-up ${
                i === 2 ? 'rounded-full w-[78px] h-[78px] sm:w-[140px] sm:h-[140px]' : 'rounded-xl w-[70px] h-[88px] sm:w-[130px] sm:h-[150px]'
              }`}
              style={{ transform: `rotate(${[-8, -3, 0, 6][i]}deg)`, animationDelay: `${i * 70}ms` }}
            >
              <img src={src} alt="" className="w-full h-full object-cover grayscale" />
            </div>
          ))}
        </div>
        <h1 className="text-[34px] sm:text-[52px] font-black uppercase tracking-tight leading-none">Build your moodboard</h1>
        <p className="mt-3 text-[14px] text-neutral-400 max-w-md">
          Turn your references into a focused board that locks style, tone, consistent details and creative direction.
        </p>
        <button
          onClick={onBuild}
          className="mt-6 h-11 px-6 rounded-xl bg-[#ff3d9a] text-[#fff] font-semibold text-[14px] flex items-center gap-2 shadow-[0_4px_0_#8fae0f] active:translate-y-0.5 active:shadow-none cursor-pointer"
        >
          Build your moodboard <Sparkles className="w-4 h-4" />
        </button>
      </section>

      {mine.length > 0 && (
        <section className="px-4 sm:px-6 mb-8">
          <h2 className="text-[15px] font-semibold mb-3">My moodboards</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {mine.map((b) => (
              <BoardCard
                key={b.id}
                b={{ id: b.id, name: b.name, cover: b.cover, look: b.look, mine: true }}
                status={b.status}
                onOpen={onOpen}
                onDelete={() => deleteBoard(b.id)}
              />
            ))}
          </div>
        </section>
      )}

      <section className="px-4 sm:px-6">
        <div className="flex items-center gap-2 mb-3 overflow-x-auto no-scrollbar">
          <h2 className="text-[15px] font-semibold mr-2 shrink-0">Curated</h2>
          {PRESET_GROUPS.map((g) => (
            <button
              key={g}
              onClick={() => setGroup(g)}
              className={`shrink-0 h-8 px-3 rounded-full text-[12.5px] cursor-pointer ${group === g ? 'bg-[#ff3d9a] text-[#fff]' : 'bg-white/[0.06] text-neutral-300'}`}
            >
              {g}
            </button>
          ))}
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {filtered.map((b) => (
            <BoardCard key={b.id} b={b} onOpen={onOpen} />
          ))}
        </div>
      </section>
    </div>
  );
};

const BoardCard: React.FC<{ b: BoardRef; status?: string; onOpen: (b: BoardRef) => void; onDelete?: () => void }> = ({ b, status, onOpen, onDelete }) => (
  <div className="theme-dark relative group aspect-square rounded-xl overflow-hidden bg-surface">
    <button onClick={() => onOpen(b)} className="absolute inset-0 cursor-pointer" aria-label={`Generate with ${b.name}`}>
      {b.cover && <img src={b.cover} alt="" loading="lazy" className="w-full h-full object-cover transition-all duration-300 group-hover:brightness-50" />}
      <span className="absolute inset-0 flex items-center justify-center">
        <span className="h-9 px-4 rounded-full bg-[#ff3d9a] text-[#fff] text-[13px] font-semibold flex items-center gap-1.5 scale-75 opacity-0 group-hover:scale-100 group-hover:opacity-100 transition-all">
          <Sparkles className="w-3.5 h-3.5" /> Generate
        </span>
      </span>
      <span className="absolute left-3 bottom-3 text-[13px] font-semibold text-white drop-shadow">{b.name}</span>
    </button>
    {status === 'training' && (
      <span className="absolute top-2 left-2 h-6 px-2 rounded-full bg-black/70 text-[11px] text-white flex items-center gap-1">
        <Loader2 className="w-3 h-3 animate-spin" /> Training
      </span>
    )}
    {onDelete && (
      <button onClick={onDelete} className="absolute top-2 right-2 p-1.5 rounded-lg bg-black/60 text-white opacity-0 group-hover:opacity-100 cursor-pointer" aria-label="Delete moodboard">
        <Trash2 className="w-3.5 h-3.5" />
      </button>
    )}
  </div>
);

/* ============================================================
 * Generator: results canvas + docked prompt bar
 * ============================================================ */

const Generator: React.FC<{
  board: BoardRef;
  onBack: () => void;
  onChangeBoard: () => void;
  onClearBoard: () => void;
  pool: string[];
}> = ({ board, onBack, onChangeBoard, onClearBoard, pool }) => {
  const store = useMoodboardStore();
  const [prompt, setPrompt] = useState('');
  const [model, setModel] = useState(GEN_MODELS[0].id);
  const [aspect, setAspect] = useState<string>('3:4');
  const [quality, setQuality] = useState<string>('1.5k');
  const [n, setN] = useState(4);
  const [palette, setPalette] = useState<Palette | null>(null);
  const [character, setCharacter] = useState<string | null>(null);
  const [refs, setRefs] = useState<string[]>([]);
  const [pop, setPop] = useState<null | 'model' | 'aspect' | 'quality' | 'palette' | 'character'>(null);
  const [busy, setBusy] = useState(false);
  const refInput = useRef<HTMLInputElement>(null);

  const cost = estimateCost(quality, n);
  const charName = CHARACTER_PRESETS.find((c) => c.id === character)?.name;

  const generate = async () => {
    if (!prompt.trim()) return toast('Describe the scene first');
    setBusy(true);
    const fullPrompt = [
      prompt.trim(),
      board.look && `Style (moodboard "${board.name}"): ${board.look}.`,
      palette && `Color palette: ${palette.colors.join(', ')}.`,
      charName && `Character: ${charName}, keep identity consistent.`,
      refs.length && `Use ${refs.length} attached reference image(s).`,
    ]
      .filter(Boolean)
      .join(' ');
    const images: string[] = [];
    for (let i = 0; i < n; i++) {
      const item = await HiggsfieldService.generate({
        prompt: fullPrompt,
        model,
        aspectRatio: aspect,
        referenceImage: refs[0] || (i === 0 && board.cover) || pool[(i * 7 + Date.now()) % Math.max(1, pool.length)],
      });
      images.push(item.imageUrl || item.referenceImage);
    }
    addGen({
      prompt: prompt.trim(),
      fullPrompt,
      model,
      aspect,
      quality,
      moodboard: board.id === 'general' ? undefined : { id: board.id, name: board.name },
      characterId: character || undefined,
      palette: palette || undefined,
      images: images.filter(Boolean),
      credits: cost,
    });
    setBusy(false);
  };

  const [aw, ah] = aspect.split(':').map(Number);
  const close = () => setPop(null);

  return (
    <div className="flex-1 flex flex-col">
      <div className="px-4 sm:px-6 pt-4 flex items-center gap-2">
        <button onClick={onBack} className="h-8 px-2.5 rounded-lg bg-white/[0.06] text-[12.5px] flex items-center gap-1.5 cursor-pointer">
          <ArrowLeft className="w-3.5 h-3.5" /> Moodboards
        </button>
        <span className="text-[12px] text-neutral-500">{store.gens.length} generations</span>
      </div>

      <div className="flex-1 px-4 sm:px-6 pt-4 pb-[calc(var(--m-tab-h)+190px)] md:pb-[190px] space-y-6">
        {busy && (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
            {Array.from({ length: n }, (_, i) => (
              <div key={i} className="rounded-xl bg-surface animate-pulse" style={{ aspectRatio: `${aw}/${ah}` }} />
            ))}
          </div>
        )}
        {store.gens.length === 0 && !busy ? (
          <div className="text-center text-neutral-500 text-sm py-24">
            {board.id === 'general' ? 'Describe a scene below to start.' : `"${board.name}" is applied. Describe a scene below.`}
          </div>
        ) : (
          store.gens.map((g) => (
            <div key={g.id}>
              <div className="flex items-center gap-2 mb-2 text-[12px] text-neutral-400">
                <span className="truncate flex-1 text-neutral-200">{g.prompt}</span>
                {g.moodboard && <span className="px-1.5 py-0.5 rounded bg-white/[0.07]">{g.moodboard.name}</span>}
                {g.palette && (
                  <span className="flex">
                    {g.palette.colors.map((c) => (
                      <span key={c} className="w-2.5 h-2.5" style={{ background: c }} />
                    ))}
                  </span>
                )}
                <span>
                  {g.aspect} · {g.quality}
                </span>
                <button
                  onClick={() => (navigator.clipboard?.writeText(g.fullPrompt), toast('Prompt copied'))}
                  className="p-1 hover:text-white cursor-pointer"
                  aria-label="Copy prompt"
                >
                  <Copy className="w-3.5 h-3.5" />
                </button>
                <button onClick={() => deleteGen(g.id)} className="p-1 hover:text-white cursor-pointer" aria-label="Delete">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
                {g.images.map((src, i) => {
                  const [w, h] = g.aspect.split(':').map(Number);
                  return <img key={i} src={src} alt="" className="w-full rounded-xl object-cover bg-surface" style={{ aspectRatio: `${w}/${h}` }} />;
                })}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Docked prompt bar */}
      <div className="fixed left-0 right-0 bottom-[var(--m-tab-h)] md:bottom-4 z-40 px-3 md:px-6 pointer-events-none">
        <div className="pointer-events-auto mx-auto max-w-4xl rounded-2xl bg-base/95 backdrop-blur border border-white/10 shadow-2xl p-3 relative">
          {pop && <div className="fixed inset-0 z-0" onClick={close} />}
          <div className="flex gap-2 items-start relative z-10">
            <button
              onClick={() => refInput.current?.click()}
              className="shrink-0 w-10 h-10 rounded-xl bg-white/[0.06] flex items-center justify-center text-neutral-300 hover:text-white cursor-pointer overflow-hidden"
              aria-label="Add reference images"
            >
              {refs[0] ? <img src={refs[0]} alt="" className="w-full h-full object-cover" /> : <Plus className="w-4 h-4" />}
            </button>
            <input
              ref={refInput}
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={(e) => {
                setRefs([...refs, ...Array.from(e.target.files || []).map((f) => URL.createObjectURL(f))]);
                e.target.value = '';
              }}
            />
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && (e.metaKey || e.ctrlKey) && generate()}
              rows={2}
              placeholder="Describe the scene you imagine"
              className="flex-1 bg-transparent text-[14px] text-white placeholder-neutral-500 resize-none focus:outline-none pt-2"
            />
          </div>
          <div className="mt-2 flex items-center gap-1.5 flex-wrap relative z-10">
            <Chip label={GEN_MODELS.find((m) => m.id === model)!.name} onClick={() => setPop(pop === 'model' ? null : 'model')} />
            <Chip label={aspect} onClick={() => setPop(pop === 'aspect' ? null : 'aspect')} />
            <Chip label={quality} onClick={() => setPop(pop === 'quality' ? null : 'quality')} />
            <div className="h-8 rounded-lg bg-white/[0.06] flex items-center text-[12px]">
              <button onClick={() => setN(Math.max(1, n - 1))} className="px-2 h-full text-neutral-400 hover:text-white cursor-pointer" aria-label="Fewer">
                <Minus className="w-3 h-3" />
              </button>
              <span className="w-8 text-center">{n}/4</span>
              <button onClick={() => setN(Math.min(4, n + 1))} className="px-2 h-full text-neutral-400 hover:text-white cursor-pointer" aria-label="More">
                <Plus className="w-3 h-3" />
              </button>
            </div>
            <Chip
              icon={palette ? <span className="flex">{palette.colors.slice(0, 4).map((c) => <span key={c} className="w-2 h-3" style={{ background: c }} />)}</span> : <PaletteIcon className="w-3.5 h-3.5" />}
              label={palette?.name || 'Color'}
              onClick={() => setPop(pop === 'palette' ? null : 'palette')}
            />
            <Chip
              icon={character ? <img src={presetFace(character)} alt="" className="w-5 h-5 rounded-full object-cover" /> : <User className="w-3.5 h-3.5" />}
              label={charName || 'Character'}
              onClick={() => setPop(pop === 'character' ? null : 'character')}
            />
            <div className="h-8 pl-1 pr-1 rounded-lg bg-white/[0.06] flex items-center gap-1.5 text-[12px]">
              {board.cover ? <img src={board.cover} alt="" className="w-6 h-6 rounded object-cover" /> : <Sparkles className="w-3.5 h-3.5 ml-1 text-neutral-400" />}
              <span className="max-w-[110px] truncate">{board.name}</span>
              <button onClick={onChangeBoard} className="text-[#ff3d9a] hover:underline cursor-pointer">
                Change
              </button>
              {board.id !== 'general' && (
                <button onClick={onClearBoard} className="text-neutral-400 hover:text-white cursor-pointer" aria-label="Remove moodboard">
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
            <button
              onClick={generate}
              disabled={busy}
              className="ml-auto h-10 px-5 rounded-xl bg-[#ff3d9a] text-[#fff] font-semibold text-[13.5px] flex items-center gap-1.5 disabled:opacity-60 cursor-pointer"
            >
              {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Generate'}
              <span className="flex items-center gap-0.5 text-[12px]">
                <Sparkles className="w-3 h-3" /> {cost}
              </span>
            </button>
          </div>

          {pop && (
            <div className="absolute z-20 left-3 right-3 bottom-full mb-2 rounded-2xl bg-base border border-white/10 shadow-2xl p-3 max-h-[60vh] overflow-y-auto animate-sheet-up">
              {pop === 'model' && <ModelList value={model} onPick={(v) => (setModel(v), close())} />}
              {pop === 'aspect' && (
                <div className="flex flex-wrap gap-2">
                  {ASPECTS.map((a) => {
                    const [w, h] = a.split(':').map(Number);
                    return (
                      <button key={a} onClick={() => (setAspect(a), close())} className={`w-16 h-16 rounded-xl flex flex-col items-center justify-center gap-1 text-[11px] cursor-pointer ${aspect === a ? 'bg-white/15' : 'bg-white/[0.05]'}`}>
                        <span className="border border-white/60 rounded-sm" style={{ width: (w / Math.max(w, h)) * 22, height: (h / Math.max(w, h)) * 22 }} />
                        {a}
                      </button>
                    );
                  })}
                </div>
              )}
              {pop === 'quality' &&
                QUALITIES.map((q) => (
                  <button key={q.id} onClick={() => (setQuality(q.id), close())} className="w-full px-3 py-2.5 rounded-lg flex items-center gap-3 text-left hover:bg-white/[0.06] cursor-pointer">
                    <span className="flex-1">
                      <span className="block text-[13px]">{q.label}</span>
                      <span className="block text-[11px] text-neutral-500">{q.desc}</span>
                    </span>
                    {quality === q.id && <Check className="w-4 h-4 text-[#ff3d9a]" />}
                  </button>
                ))}
              {pop === 'palette' && <PaletteSheet value={palette} onPick={(p) => (setPalette(p), close())} />}
              {pop === 'character' && (
                <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                  <button onClick={() => (setCharacter(null), close())} className={`aspect-square rounded-xl bg-white/[0.05] text-[11px] text-neutral-400 cursor-pointer ${!character ? 'ring-2 ring-[#ff3d9a]' : ''}`}>
                    None
                  </button>
                  {CHARACTER_PRESETS.map((c) => (
                    <button key={c.id} onClick={() => (setCharacter(c.id), close())} title={c.name} className={`aspect-square rounded-xl overflow-hidden cursor-pointer ${character === c.id ? 'ring-2 ring-[#ff3d9a]' : ''}`}>
                      <img src={presetFace(c.id)} alt={c.name} loading="lazy" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const Chip: React.FC<{ label: string; icon?: React.ReactNode; onClick: () => void }> = ({ label, icon, onClick }) => (
  <button onClick={onClick} className="h-8 px-2.5 rounded-lg bg-white/[0.06] hover:bg-white/10 text-[12px] flex items-center gap-1.5 cursor-pointer">
    {icon}
    <span className="max-w-[110px] truncate">{label}</span>
    <ChevronDown className="w-3 h-3 text-neutral-500" />
  </button>
);

const ModelList: React.FC<{ value: string; onPick: (v: string) => void }> = ({ value, onPick }) => {
  const [q, setQ] = useState('');
  return (
    <>
      <div className="flex items-center gap-2 px-2.5 h-9 mb-2 rounded-lg bg-white/[0.05]">
        <Search className="w-3.5 h-3.5 text-neutral-500" />
        <input autoFocus value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search models" className="flex-1 bg-transparent text-[13px] focus:outline-none" />
      </div>
      {GEN_MODELS.filter((m) => (m.name + m.desc).toLowerCase().includes(q.toLowerCase())).map((m) => (
        <button
          key={m.id}
          disabled={m.disabled}
          onClick={() => onPick(m.id)}
          className="w-full px-3 py-2.5 rounded-lg flex items-center gap-2 text-left hover:bg-white/[0.06] disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed"
        >
          <span className="flex-1">
            <span className="block text-[13px]">{m.name}</span>
            <span className="block text-[11px] text-neutral-500">{m.desc}</span>
          </span>
          {m.badges.map((b) => (
            <span key={b} className={`text-[10px] px-1.5 py-0.5 rounded ${b === 'New' ? 'bg-[#ff3d9a] text-[#fff]' : 'bg-white/[0.07] text-neutral-400'}`}>
              {b}
            </span>
          ))}
          {value === m.id && <Check className="w-4 h-4 text-[#ff3d9a]" />}
        </button>
      ))}
    </>
  );
};

const PaletteSheet: React.FC<{ value: Palette | null; onPick: (p: Palette | null) => void }> = ({ value, onPick }) => {
  const store = useMoodboardStore();
  const input = useRef<HTMLInputElement>(null);
  const [working, setWorking] = useState(false);
  const all = [...store.palettes, ...CURATED_PALETTES];
  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        <button
          onClick={() => input.current?.click()}
          className="h-10 px-4 rounded-xl bg-white/[0.08] text-[13px] flex items-center gap-2 cursor-pointer"
        >
          {working ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />} Upload & create
        </button>
        {value && (
          <button onClick={() => onPick(null)} className="h-10 px-3 rounded-xl text-[13px] text-neutral-400 cursor-pointer">
            Clear
          </button>
        )}
        <input
          ref={input}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={async (e) => {
            const f = e.target.files?.[0];
            e.target.value = '';
            if (!f) return;
            setWorking(true);
            try {
              const colors = await extractPalette(URL.createObjectURL(f));
              const p = { id: `pal_${Date.now().toString(36)}`, name: f.name.replace(/\.[^.]+$/, '').slice(0, 18) || 'My palette', colors };
              addPalette(p);
              onPick(p);
            } catch {
              toast('Could not read that image');
            }
            setWorking(false);
          }}
        />
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {all.map((p) => (
          <button key={p.id} onClick={() => onPick(p)} className={`rounded-xl overflow-hidden bg-white/[0.04] text-left cursor-pointer ${value?.id === p.id ? 'ring-2 ring-[#ff3d9a]' : ''}`}>
            <div className="h-14" style={{ background: `linear-gradient(135deg, ${p.colors[1]}, ${p.colors[3]})` }} />
            <div className="flex h-3">
              {p.colors.map((c) => (
                <span key={c} className="flex-1" style={{ background: c }} />
              ))}
            </div>
            <div className="px-2 py-1.5 text-[12px]">{p.name}</div>
          </button>
        ))}
      </div>
    </div>
  );
};

/* ============================================================
 * Moodboard picker (Curated | My Moodboards)
 * ============================================================ */

const BoardPicker: React.FC<{
  curated: BoardRef[];
  mine: BoardRef[];
  value: string;
  onClose: () => void;
  onBuild: () => void;
  onPick: (b: BoardRef) => void;
}> = ({ curated, mine, value, onClose, onBuild, onPick }) => {
  const [tab, setTab] = useState<'curated' | 'mine'>('curated');
  const [q, setQ] = useState('');
  const list = (tab === 'curated' ? [GENERAL, ...curated] : mine).filter((b) => b.name.toLowerCase().includes(q.toLowerCase()));
  return (
    <div className="fixed inset-0 z-[70] bg-black/70 flex items-end sm:items-center justify-center" onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()} className="w-full sm:max-w-3xl max-h-[88vh] flex flex-col rounded-t-2xl sm:rounded-2xl bg-base border border-white/10 animate-sheet-up overflow-hidden">
        <div className="relative px-5 py-5 bg-gradient-to-br from-white/[0.06] to-transparent flex items-center gap-4">
          <div className="flex-1">
            <div className="text-[18px] font-black uppercase tracking-tight">Moodboards</div>
            <div className="text-[12px] text-neutral-400">Lock a look across every generation.</div>
          </div>
          <button onClick={onBuild} className="h-9 px-4 rounded-xl bg-[#ff3d9a] text-[#fff] text-[13px] font-semibold flex items-center gap-1.5 cursor-pointer">
            Build <Sparkles className="w-3.5 h-3.5" />
          </button>
          <button onClick={onClose} className="p-2 text-neutral-400 hover:text-white cursor-pointer" aria-label="Close">
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="px-5 pt-3 flex items-center gap-4 border-b border-white/[0.06]">
          {(
            [
              ['curated', 'Curated'],
              ['mine', 'My Moodboards'],
            ] as const
          ).map(([id, l]) => (
            <button key={id} onClick={() => setTab(id)} className={`pb-2.5 text-[13px] font-medium border-b-2 -mb-px cursor-pointer ${tab === id ? 'border-[#ff3d9a] text-white' : 'border-transparent text-neutral-500'}`}>
              {l}
            </button>
          ))}
          <div className="ml-auto mb-2 flex items-center gap-2 h-8 px-2.5 rounded-lg bg-white/[0.05]">
            <Search className="w-3.5 h-3.5 text-neutral-500" />
            <input autoFocus value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search" className="w-32 bg-transparent text-[12.5px] focus:outline-none" />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto p-4">
          {list.length === 0 ? (
            <div className="text-center py-16">
              <div className="text-[14px] font-semibold">No moodboards yet</div>
              <div className="text-[12px] text-neutral-500 mt-1 mb-4">Build one from 5+ photos in a single style.</div>
              <button onClick={onBuild} className="h-9 px-4 rounded-xl bg-white/[0.08] text-[13px] cursor-pointer">
                Build your moodboard
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
              {list.map((b) => (
                <button key={b.id} onClick={() => onPick(b)} className={`theme-dark relative aspect-square rounded-xl overflow-hidden bg-surface border-2 cursor-pointer ${value === b.id ? 'border-[#ff3d9a]' : 'border-transparent'}`}>
                  {b.cover ? <img src={b.cover} alt="" loading="lazy" className="w-full h-full object-cover" /> : <span className="absolute inset-0 flex items-center justify-center text-neutral-500"><Sparkles className="w-5 h-5" /></span>}
                  <span className="absolute inset-x-0 bottom-0 p-2 text-[12px] font-medium text-white text-left bg-gradient-to-t from-black/80">{b.name}</span>
                  {value === b.id && (
                    <span className="absolute top-1.5 right-1.5 w-5 h-5 rounded-full bg-[#ff3d9a] text-[#fff] flex items-center justify-center">
                      <Check className="w-3 h-3" />
                    </span>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

/* ============================================================
 * Build flow (upload → quality gate → name → train)
 * ============================================================ */

interface BuildImage {
  src: string; // persisted thumb
  width: number;
  height: number;
  blur: number;
  mean: [number, number, number];
}

const BuildModal: React.FC<{ vaultItems: VaultItem[]; onClose: () => void; onCreated: (b: UserMoodboard) => void }> = ({ vaultItems, onClose, onCreated }) => {
  const store = useMoodboardStore();
  const [imgs, setImgs] = useState<BuildImage[]>([]);
  const [name, setName] = useState('');
  const [assets, setAssets] = useState(false);
  const [confirm, setConfirm] = useState(false);
  const [loading, setLoading] = useState(0);
  const input = useRef<HTMLInputElement>(null);

  const add = async (srcs: string[]) => {
    const room = BUILD_RULES.max - imgs.length;
    setLoading((l) => l + Math.min(room, srcs.length));
    for (const s of srcs.slice(0, room)) {
      try {
        const r = await inspectImage(s);
        setImgs((p) => (p.some((x) => x.src === r.thumb) ? p : [...p, { src: r.thumb, width: r.width, height: r.height, blur: r.blur, mean: r.mean }]));
      } catch {
        /* skip unreadable */
      }
      setLoading((l) => l - 1);
    }
  };

  // Quality gate
  const lowRes = imgs.filter((i) => Math.min(i.width, i.height) < BUILD_RULES.minSide);
  const blurry = imgs.filter((i) => i.blur > 0 && i.blur < 60);
  const coherence = useMemo(() => {
    if (imgs.length < 3) return 1;
    const m = [0, 1, 2].map((k) => imgs.reduce((s, i) => s + i.mean[k], 0) / imgs.length);
    const v = imgs.reduce((s, i) => s + Math.hypot(i.mean[0] - m[0], i.mean[1] - m[1], i.mean[2] - m[2]), 0) / imgs.length;
    return Math.max(0, 1 - v / 90);
  }, [imgs]);
  const flagged = new Set([...lowRes, ...blurry].map((i) => i.src));
  const ok = imgs.length >= BUILD_RULES.min && !loading;

  const tryClose = () => (imgs.length ? setConfirm(true) : onClose());

  const create = () => {
    const tone = (() => {
      const m = [0, 1, 2].map((k) => imgs.reduce((s, i) => s + i.mean[k], 0) / imgs.length);
      const l = 0.299 * m[0] + 0.587 * m[1] + 0.114 * m[2];
      const warm = m[0] - m[2];
      return `${l > 150 ? 'bright, airy' : l < 80 ? 'dark, moody' : 'balanced'} exposure, ${warm > 15 ? 'warm' : warm < -15 ? 'cool' : 'neutral'} color temperature`;
    })();
    const b = addBoard({
      name: name.trim() || `Moodboard ${store.boards.length + 1}`,
      cover: imgs[0].src,
      images: imgs.map((i) => i.src),
      look: `consistent with the user's moodboard references: ${tone}, matching grain, lighting and styling`,
    });
    onCreated(b);
  };

  return (
    <div className="fixed inset-0 z-[75] bg-black/70 flex items-end sm:items-center justify-center" onClick={tryClose}>
      <div onClick={(e) => e.stopPropagation()} className="w-full sm:max-w-2xl max-h-[92vh] flex flex-col rounded-t-2xl sm:rounded-2xl bg-base border border-white/10 animate-sheet-up">
        <div className="px-5 pt-5 pb-3 flex items-start gap-3">
          <div className="flex-1">
            <h2 className="text-[18px] font-bold">Build your moodboard</h2>
            <p className="text-[12.5px] text-neutral-400">Add at least {BUILD_RULES.min} photos to continue — {BUILD_RULES.ideal}+ works best.</p>
          </div>
          <button onClick={tryClose} className="p-1.5 text-neutral-400 hover:text-white cursor-pointer" aria-label="Close">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 pb-4 space-y-4">
          <div className="grid grid-cols-2 gap-2 relative">
            <button onClick={() => input.current?.click()} className="h-20 rounded-xl border border-dashed border-white/15 bg-surface flex flex-col items-center justify-center gap-1 text-[13px] cursor-pointer hover:bg-white/[0.04]">
              <Upload className="w-4 h-4" /> Upload from device
            </button>
            <button onClick={() => setAssets(!assets)} className="h-20 rounded-xl border border-dashed border-white/15 bg-surface flex flex-col items-center justify-center gap-1 text-[13px] cursor-pointer hover:bg-white/[0.04]">
              <FolderOpen className="w-4 h-4" /> Upload from assets
            </button>
            <input
              ref={input}
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={(e) => {
                add(Array.from(e.target.files || []).map((f) => URL.createObjectURL(f)));
                e.target.value = '';
              }}
            />
            {assets && <AssetPicker vaultItems={vaultItems} gens={store.gens.flatMap((g) => g.images)} onClose={() => setAssets(false)} onAdd={(s) => (add(s), setAssets(false))} />}
          </div>

          {imgs.length === 0 ? (
            <div className="grid grid-cols-2 gap-3">
              <RuleCard good title="Do" items={[`${BUILD_RULES.ideal}+ photos`, 'One cohesive style', 'No faces']} />
              <RuleCard title="Don't" items={['Faces or portraits', 'Mixed styles', 'Blurry or low quality']} />
            </div>
          ) : (
            <>
              <div className="flex items-center gap-3 text-[12px]">
                <span className={imgs.length >= BUILD_RULES.min ? 'text-[#ff3d9a]' : 'text-neutral-400'}>
                  {imgs.length}/{BUILD_RULES.min} minimum
                </span>
                <div className="flex-1 h-1.5 rounded-full bg-white/[0.06] overflow-hidden">
                  <div className="h-full bg-[#ff3d9a] transition-all" style={{ width: `${Math.min(100, (imgs.length / BUILD_RULES.ideal) * 100)}%` }} />
                </div>
                <span className="text-neutral-500">ideal {BUILD_RULES.ideal}</span>
              </div>
              <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                {imgs.map((i, k) => (
                  <div key={i.src} className={`relative aspect-square rounded-lg overflow-hidden group ${flagged.has(i.src) ? 'ring-2 ring-amber-400' : ''}`}>
                    <img src={i.src} alt="" className="w-full h-full object-cover" />
                    <button onClick={() => setImgs(imgs.filter((_, j) => j !== k))} className="absolute top-1 right-1 w-5 h-5 rounded-full bg-black/70 text-white hidden group-hover:flex items-center justify-center cursor-pointer" aria-label="Remove">
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
                {Array.from({ length: loading }, (_, k) => (
                  <div key={`l${k}`} className="aspect-square rounded-lg bg-surface animate-pulse" />
                ))}
              </div>
              {(lowRes.length > 0 || blurry.length > 0 || coherence < 0.5) && (
                <ul className="rounded-xl bg-amber-400/10 border border-amber-400/30 p-3 text-[12px] text-amber-200 space-y-1">
                  {lowRes.length > 0 && <li>{lowRes.length} photo(s) under {BUILD_RULES.minSide}px — they may soften results.</li>}
                  {blurry.length > 0 && <li>{blurry.length} photo(s) look blurry.</li>}
                  {coherence < 0.5 && <li>These look like mixed styles. A tighter set trains a stronger look.</li>}
                </ul>
              )}
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Name your moodboard"
                className="w-full h-11 px-3 rounded-xl bg-surface border border-white/[0.06] text-[14px] focus:outline-none focus:border-white/20"
              />
            </>
          )}
        </div>
        <div className="p-4 border-t border-white/[0.06]">
          <button
            disabled={!ok}
            onClick={create}
            className={`w-full h-11 rounded-xl font-semibold text-[14px] ${ok ? 'bg-[#ff3d9a] text-[#fff] cursor-pointer' : 'bg-white/[0.06] text-neutral-500 cursor-not-allowed'}`}
          >
            Continue
          </button>
        </div>
      </div>

      {confirm && (
        <div className="fixed inset-0 z-[80] bg-black/60 flex items-center justify-center p-4" onClick={(e) => (e.stopPropagation(), setConfirm(false))}>
          <div onClick={(e) => e.stopPropagation()} className="w-full max-w-sm rounded-2xl bg-base border border-white/10 p-5 animate-sheet-up">
            <div className="text-[15px] font-semibold">Discard moodboard?</div>
            <p className="text-[13px] text-neutral-400 mt-1">Uploaded photos will be lost.</p>
            <div className="mt-4 grid grid-cols-2 gap-2">
              <button onClick={() => setConfirm(false)} className="h-10 rounded-xl bg-white/[0.08] text-[13px] cursor-pointer">
                Keep editing
              </button>
              <button onClick={onClose} className="h-10 rounded-xl bg-red-500/90 text-white text-[13px] font-semibold cursor-pointer">
                Discard
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const RuleCard: React.FC<{ good?: boolean; title: string; items: string[] }> = ({ good, title, items }) => (
  <div className={`rounded-xl p-3 border ${good ? 'border-[#ff3d9a]/30 bg-[#ff3d9a]/5' : 'border-red-400/30 bg-red-400/5'}`}>
    <div className="flex items-center gap-1.5 text-[13px] font-semibold mb-2">
      {good ? <CheckCircle2 className="w-4 h-4 text-[#ff3d9a]" /> : <XCircle className="w-4 h-4 text-red-400" />} {title}
    </div>
    <ul className="text-[12px] text-neutral-300 space-y-1">
      {items.map((i) => (
        <li key={i}>• {i}</li>
      ))}
    </ul>
  </div>
);

const AssetPicker: React.FC<{ vaultItems: VaultItem[]; gens: string[]; onClose: () => void; onAdd: (srcs: string[]) => void }> = ({ vaultItems, gens, onClose, onAdd }) => {
  const [tab, setTab] = useState<'uploads' | 'gens'>('uploads');
  const [sel, setSel] = useState<Set<string>>(new Set());
  const uploads = useMemo(() => vaultItems.filter((v) => !v.videoUrl).map((v) => v.imageUrl || v.fullImageUrl || '').filter(Boolean).slice(0, 120), [vaultItems]);
  const list = tab === 'uploads' ? uploads : gens;
  return (
    <div className="absolute z-10 top-full mt-2 left-0 right-0 rounded-2xl bg-base border border-white/10 shadow-2xl p-3 animate-sheet-up">
      <div className="flex items-center gap-4 mb-3">
        {(
          [
            ['uploads', 'Uploads'],
            ['gens', 'Image Generations'],
          ] as const
        ).map(([id, l]) => (
          <button key={id} onClick={() => setTab(id)} className={`text-[13px] font-medium cursor-pointer ${tab === id ? 'text-white' : 'text-neutral-500'}`}>
            {l}
          </button>
        ))}
        <button onClick={onClose} className="ml-auto p-1 text-neutral-400 cursor-pointer" aria-label="Close">
          <X className="w-4 h-4" />
        </button>
      </div>
      {list.length === 0 ? (
        <p className="text-center text-[12px] text-neutral-500 py-8">Nothing here yet.</p>
      ) : (
        <div className="grid grid-cols-5 sm:grid-cols-6 gap-1.5 max-h-64 overflow-y-auto">
          {list.map((s) => (
            <button
              key={s}
              onClick={() => {
                const n = new Set(sel);
                n.has(s) ? n.delete(s) : n.add(s);
                setSel(n);
              }}
              className={`relative aspect-square rounded-lg overflow-hidden cursor-pointer ${sel.has(s) ? 'ring-2 ring-[#ff3d9a]' : ''}`}
            >
              <img src={s} alt="" loading="lazy" className="w-full h-full object-cover" />
              {sel.has(s) && <Check className="absolute top-1 right-1 w-4 h-4 text-[#ff3d9a]" />}
            </button>
          ))}
        </div>
      )}
      <button
        disabled={!sel.size}
        onClick={() => onAdd([...sel])}
        className="mt-3 w-full h-9 rounded-xl bg-[#ff3d9a] text-[#fff] text-[13px] font-semibold disabled:opacity-40 cursor-pointer"
      >
        Add {sel.size || ''} selected
      </button>
    </div>
  );
};
