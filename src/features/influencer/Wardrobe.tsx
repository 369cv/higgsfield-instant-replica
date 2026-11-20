import React, { useCallback, useEffect, useMemo, useReducer, useRef, useState } from 'react';
import {
  Undo2,
  Redo2,
  RotateCcw,
  Bookmark,
  Clapperboard,
  ChevronDown,
  Copy,
  Check,
  Trash2,
} from 'lucide-react';
import { CHARACTER_PRESETS, presetFace } from './catalog';
import {
  OUTFITS,
  OUTFIT_CATEGORIES,
  PIECE_GROUPS,
  STAGE_FILTERS,
  FRAMINGS,
  BASE_LOOK,
  Framing,
  StageFilterId,
  lookImage,
  availableOutfits,
  renderPrompt,
  STAGE_BACKGROUND,
  characterName,
  Outfit,
} from './wardrobe';
import { toast } from '../../components/ui';

/* ============================================================
 * State: current look + undo/redo history + saved library
 * ============================================================ */

export interface WardrobeSnapshot {
  characterId: string;
  lookId: string;
  filter: StageFilterId;
  framing: Framing;
}

export interface SavedLook extends WardrobeSnapshot {
  id: string;
  createdAt: string;
}

const LIB_KEY = 'wardrobe_library_v1';
const STATE_KEY = 'wardrobe_state_v1';

const loadLib = (): SavedLook[] => {
  try {
    return JSON.parse(localStorage.getItem(LIB_KEY) || '[]');
  } catch {
    return [];
  }
};

export function useWardrobe(initialCharacter: string) {
  const initial = useMemo<WardrobeSnapshot>(() => {
    try {
      const s = JSON.parse(localStorage.getItem(STATE_KEY) || 'null');
      if (s && CHARACTER_PRESETS.some((c) => c.id === s.characterId)) return s;
    } catch {}
    return { characterId: initialCharacter, lookId: BASE_LOOK, filter: 'daylight', framing: 'full' };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  type H = { past: WardrobeSnapshot[]; current: WardrobeSnapshot; future: WardrobeSnapshot[] };
  type A = { t: 'commit'; patch: Partial<WardrobeSnapshot> } | { t: 'undo' } | { t: 'redo' };
  const [h, dispatch] = useReducer(
    (st: H, a: A): H => {
      if (a.t === 'commit') {
        const next = { ...st.current, ...a.patch };
        if (JSON.stringify(next) === JSON.stringify(st.current)) return st;
        return { past: [...st.past, st.current].slice(-50), current: next, future: [] };
      }
      if (a.t === 'undo') {
        if (!st.past.length) return st;
        return { past: st.past.slice(0, -1), current: st.past[st.past.length - 1], future: [st.current, ...st.future] };
      }
      if (!st.future.length) return st;
      return { past: [...st.past, st.current], current: st.future[0], future: st.future.slice(1) };
    },
    { past: [], current: initial, future: [] }
  );
  const current = h.current;
  const [library, setLibrary] = useState<SavedLook[]>(loadLib);

  useEffect(() => {
    try {
      localStorage.setItem(STATE_KEY, JSON.stringify(current));
    } catch {}
  }, [current]);
  useEffect(() => {
    try {
      localStorage.setItem(LIB_KEY, JSON.stringify(library));
    } catch {}
  }, [library]);

  const commit = useCallback((patch: Partial<WardrobeSnapshot>) => dispatch({ t: 'commit', patch }), []);
  const undo = useCallback(() => dispatch({ t: 'undo' }), []);
  const redo = useCallback(() => dispatch({ t: 'redo' }), []);
  const reset = () => commit({ lookId: BASE_LOOK, filter: 'daylight', framing: 'full' });
  const save = () => {
    const look: SavedLook = { ...current, id: `look_${Date.now().toString(36)}`, createdAt: new Date().toISOString() };
    setLibrary((l) => [look, ...l].slice(0, 60));
    return look;
  };
  const remove = (id: string) => setLibrary((l) => l.filter((x) => x.id !== id));

  return { current, commit, undo, redo, reset, canUndo: h.past.length > 0, canRedo: h.future.length > 0, library, save, remove };
}

export type WardrobeApi = ReturnType<typeof useWardrobe>;

const outfitById = (id: string) => OUTFITS.find((o) => o.id === id);
const lookName = (id: string) => (id === BASE_LOOK ? 'Signature look' : outfitById(id)?.name || id);

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
 * Panel (left): character, categories, outfit grid, pieces
 * ============================================================ */

export const WardrobePanel: React.FC<{ w: WardrobeApi; embedded?: boolean }> = ({ w, embedded }) => {
  const { current, commit } = w;
  const [category, setCategory] = useState<(typeof OUTFIT_CATEGORIES)[number]>('All');
  const [openGroup, setOpenGroup] = useState<string | null>(null);
  const outfit = outfitById(current.lookId);
  const available = availableOutfits(current.characterId);
  const shown = available.filter((o) => category === 'All' || o.category === category);
  const categories = OUTFIT_CATEGORIES.filter((c) => c === 'All' || available.some((o) => o.category === c));

  return (
    <div className={`${embedded ? '' : 'flex-1 min-h-0 overflow-y-auto'} px-3 pb-4 space-y-3`}>
      {/* Character */}
      <section className="rounded-xl bg-surface border border-white/[0.06] p-2.5">
        <div className="px-1 pb-2 text-[13px] font-medium text-white">
          Character <span className="text-neutral-500 font-normal">· {characterName(current.characterId)}</span>
        </div>
        <div role="radiogroup" aria-label="Wardrobe character" className="flex gap-2 overflow-x-auto no-scrollbar">
          {[CHARACTER_PRESETS.find((c) => c.id === current.characterId)!, ...CHARACTER_PRESETS.filter((c) => c.id !== current.characterId)].map(
            (c) => {
              const active = c.id === current.characterId;
              return (
                <button
                  key={c.id}
                  type="button"
                  role="radio"
                  aria-checked={active}
                  aria-label={c.name}
                  onClick={() => commit({ characterId: c.id })}
                  className={`theme-dark shrink-0 w-14 h-14 rounded-full overflow-hidden border-2 cursor-pointer bg-neutral-100 ${
                    active ? 'border-[#d1fe17]' : 'border-transparent hover:border-white/30'
                  }`}
                >
                  <img src={presetFace(c.id)} alt="" loading="lazy" className="w-full h-full object-cover object-top" />
                </button>
              );
            }
          )}
        </div>
      </section>

      {/* Outfits */}
      <section className="rounded-xl bg-surface border border-white/[0.06] p-2.5">
        <div className="flex items-center justify-between px-1 pb-2">
          <span className="text-[13px] font-semibold uppercase tracking-wider text-white">Outfits</span>
          <span className="text-[12px] text-neutral-500">
            {shown.length + 1} look{shown.length === 0 ? '' : 's'}
          </span>
        </div>
        {categories.length > 1 && (
        <div role="tablist" aria-label="Outfit category" className="flex gap-1.5 overflow-x-auto no-scrollbar pb-2">
          {categories.map((c) => (
            <button
              key={c}
              role="tab"
              aria-selected={category === c}
              onClick={() => setCategory(c)}
              className={`shrink-0 h-8 px-3 rounded-full text-[12px] font-medium cursor-pointer border ${
                category === c ? 'bg-[#d1fe17] text-black border-[#d1fe17]' : 'border-white/[0.08] text-neutral-400 hover:text-white'
              }`}
            >
              {c}
            </button>
          ))}
        </div>
        )}
        <div role="radiogroup" aria-label="Outfits" className="grid grid-cols-2 gap-2">
          <OutfitCard
            name={lookName(BASE_LOOK)}
            sub="From the character sheet"
            active={current.lookId === BASE_LOOK}
            src={lookImage(current.characterId, BASE_LOOK)}
            onClick={() => commit({ lookId: BASE_LOOK })}
          />
          {shown.map((o, i) => {
            return (
              <OutfitCard
                key={`${category}-${o.id}`}
                name={o.name}
                sub={o.category}
                active={current.lookId === o.id}
                src={lookImage(current.characterId, o.id)}
                delay={i * 45}
                onClick={() => commit({ lookId: o.id })}
              />
            );
          })}
        </div>
        {available.length === 0 && (
          <p className="px-1 pt-2.5 text-[12px] text-neutral-500">More looks for {characterName(current.characterId)} are on the way.</p>
        )}
      </section>

      {/* Pieces */}
      <section className="space-y-1.5">
        {PIECE_GROUPS.map((g) => {
          const pieces = outfit?.pieces[g.id] || [];
          const open = openGroup === g.id;
          return (
            <div key={g.id} className="rounded-xl bg-surface border border-white/[0.06] overflow-hidden">
              <button
                type="button"
                onClick={() => setOpenGroup(open ? null : g.id)}
                aria-expanded={open}
                className="w-full h-10 px-3.5 flex items-center gap-2 text-left cursor-pointer"
              >
                <span className="text-[12.5px] font-semibold uppercase tracking-wide text-white">{g.label}</span>
                {pieces.length > 0 && <span className="text-[12px] text-neutral-500">· {pieces.length}</span>}
                <ChevronDown className={`ml-auto w-4 h-4 text-neutral-500 transition-transform ${open ? 'rotate-180' : ''}`} />
              </button>
              <div className={`grid transition-[grid-template-rows] duration-300 ${open ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'}`}>
                <div className="overflow-hidden">
                  <ul className="px-3.5 pb-3 space-y-1.5">
                    {pieces.length === 0 ? (
                      <li className="text-[12.5px] text-neutral-500">
                        {outfit ? 'Nothing in this look' : 'Pick an outfit to see its pieces'}
                      </li>
                    ) : (
                      pieces.map((p) => (
                        <li key={p.name} className="flex items-baseline gap-2 text-[13px]">
                          <span className="text-white">{p.name}</span>
                          <span className="text-neutral-500 text-[12px]">{p.color}</span>
                        </li>
                      ))
                    )}
                  </ul>
                </div>
              </div>
            </div>
          );
        })}
      </section>
    </div>
  );
};

const OutfitCard: React.FC<{
  name: string;
  sub: string;
  src: string;
  active: boolean;
  delay?: number;
  onClick: () => void;
}> = ({ name, sub, src, active, delay = 0, onClick }) => (
  <button
    type="button"
    role="radio"
    aria-checked={active}
    onClick={onClick}
    style={{ animationDelay: `${delay}ms` }}
    className={`theme-dark group relative h-[150px] rounded-xl overflow-hidden border cursor-pointer text-left wd-card-in transition-transform hover:-translate-y-0.5 bg-[radial-gradient(120%_90%_at_50%_30%,#f3f1ee,#d9d6d1)] ${
      active ? 'border-[#d1fe17] ring-2 ring-[#d1fe17]/40' : 'border-white/15'
    }`}
  >
    <img
      src={src}
      alt=""
      loading="lazy"
      className="absolute inset-x-0 top-1 w-full h-[135%] object-contain object-top transition-transform duration-300 group-hover:scale-105"
    />
    <span className="absolute inset-x-1.5 bottom-1.5 px-2 py-1 rounded-lg bg-black/55 backdrop-blur text-[11px] leading-tight text-white">
      <span className="block font-semibold truncate">{name}</span>
      <span className="block text-white/60 truncate">{sub}</span>
    </span>
  </button>
);

/* ============================================================
 * Stage (canvas): model with wipe swap, filters, framing, history
 * ============================================================ */

interface StageProps {
  w: WardrobeApi;
  onSendToMotion: (snapshot: WardrobeSnapshot) => void;
  embedded?: boolean; // mobile: stacked above the panel
}

interface Layer {
  key: number;
  src: string;
  entering: boolean;
}

export const WardrobeStage: React.FC<StageProps> = ({ w, onSendToMotion, embedded }) => {
  const { current, commit, undo, redo, canUndo, canRedo, reset, library, save, remove } = w;
  const src = lookImage(current.characterId, current.lookId);
  const stageRef = useRef<HTMLDivElement>(null);
  const filter = STAGE_FILTERS.find((f) => f.id === current.filter) || STAGE_FILTERS[0];
  const [layers, setLayers] = useState<Layer[]>([{ key: 0, src, entering: false }]);
  const [scanKey, setScanKey] = useState(0);
  const [filterOpen, setFilterOpen] = useState(false);
  const token = useRef(0);
  const keySeq = useRef(1);

  // Swap the figure with a top-to-bottom wipe once the new image is decoded.
  useEffect(() => {
    const top = layers[layers.length - 1];
    if (top && top.src === src) return;
    const my = ++token.current;
    const im = new Image();
    im.src = src;
    const go = () => {
      if (my !== token.current) return;
      setLayers((ls) => [...ls, { key: keySeq.current++, src, entering: true }]);
      setScanKey((k) => k + 1);
    };
    (im.decode ? im.decode() : Promise.resolve()).then(go, go);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [src]);

  // Keyboard: undo/redo, arrows step through looks.
  useEffect(() => {
    const ids = [BASE_LOOK, ...availableOutfits(current.characterId).map((o) => o.id)];
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement;
      if (t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.isContentEditable)) return;
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'z') {
        e.preventDefault();
        if (e.shiftKey) redo();
        else undo();
      } else if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
        const i = ids.indexOf(current.lookId);
        const n = (i + (e.key === 'ArrowRight' ? 1 : -1) + ids.length) % ids.length;
        commit({ lookId: ids[n] });
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [current.lookId, current.characterId, commit, undo, redo]);

  const framingTransform: Record<Framing, string> = {
    full: 'scale(1)',
    mid: 'scale(1.75)',
    portrait: 'scale(2.9)',
  };

  return (
    <div className={`flex flex-col ${embedded ? '' : 'h-full min-h-0'}`}>
      {/* Stage: loft room + registered cut-out */}
      <div
        ref={stageRef}
        onPointerMove={(e) => {
          const el = stageRef.current;
          if (!el) return;
          const r = el.getBoundingClientRect();
          const x = (e.clientX - r.left) / r.width - 0.5;
          const y = (e.clientY - r.top) / r.height - 0.5;
          el.style.setProperty('--bx', `${-x * 22}px`);
          el.style.setProperty('--by', `${-y * 12}px`);
          el.style.setProperty('--mx', `${x * 10}px`);
          el.style.setProperty('--ry', `${x * 5}deg`);
        }}
        className={`theme-dark relative ${embedded ? 'h-[56dvh] min-h-[380px]' : 'flex-1 min-h-[380px]'} overflow-hidden rounded-none lg:rounded-2xl lg:m-4 lg:mb-0 bg-[#cfd2d4] lg:border border-white/[0.08]`}
      >
        <div className="absolute -inset-[3%] transition-[filter] duration-700" style={{ filter: filter.filter }}>
          <div
            className="absolute inset-0 bg-cover bg-center transition-transform duration-700 ease-[cubic-bezier(.2,.7,.2,1)]"
            style={{ backgroundImage: `url(${STAGE_BACKGROUND})`, transform: 'translate3d(var(--bx,0),var(--by,0),0) scale(1.04)' }}
          />
          <div className="absolute inset-0 mix-blend-soft-light pointer-events-none transition-[background] duration-700" style={{ background: filter.tint }} />
        </div>
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              'radial-gradient(120% 90% at 50% 45%, transparent 55%, rgba(20,18,22,.38) 100%), linear-gradient(180deg, rgba(20,20,24,.22), transparent 18%, transparent 70%, rgba(20,20,24,.35))',
          }}
        />

        {/* Figure (2:3 canvas, feet on the floor line) */}
        <div className="absolute inset-x-0 top-[5%] bottom-[5%] flex justify-center" style={{ filter: filter.filter }}>
          <div
            className="relative h-full aspect-[2/3] transition-transform duration-1000 ease-[cubic-bezier(.65,0,.2,1)]"
            style={{ transform: framingTransform[current.framing], transformOrigin: '50% 6%' }}
          >
            <div className="wd-shadow absolute left-1/2 bottom-[0.5%] w-[46%] h-[4%] rounded-[50%] bg-[radial-gradient(closest-side,rgba(30,28,26,.55),rgba(30,28,26,0))] blur-[4px]" />
            <div
              className="absolute inset-0 transition-transform duration-700 ease-out"
              style={{ transform: 'perspective(1400px) translate3d(var(--mx,0),0,0) rotateY(var(--ry,0deg))' }}
            >
              <div className="absolute inset-0 wd-idle">
                {layers.map((l) => (
                  <img
                    key={l.key}
                    src={l.src}
                    alt=""
                    draggable={false}
                    onAnimationEnd={() => {
                      if (!l.entering) return;
                      setLayers((ls) => ls.filter((x) => x.key >= l.key).map((x) => (x.key === l.key ? { ...x, entering: false } : x)));
                    }}
                    className={`absolute inset-0 w-full h-full object-contain object-bottom select-none drop-shadow-[0_10px_18px_rgba(0,0,0,.18)] ${l.entering ? 'wd-wipe' : ''}`}
                  />
                ))}
                {scanKey > 0 && <div key={scanKey} className="wd-scan" aria-hidden="true" />}
                {/* drifting window light, clipped to the figure */}
                <div
                  className="absolute inset-0 overflow-hidden pointer-events-none"
                  style={{ WebkitMaskImage: `url(${src})`, maskImage: `url(${src})`, WebkitMaskSize: 'contain', maskSize: 'contain', WebkitMaskRepeat: 'no-repeat', maskRepeat: 'no-repeat', WebkitMaskPosition: 'bottom', maskPosition: 'bottom' }}
                  aria-hidden="true"
                >
                  <div className="wd-light absolute -inset-x-1/4 inset-y-0" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Look label */}
        <div className="absolute top-3 left-3 pointer-events-none">
          <div className="rounded-xl bg-black/40 backdrop-blur-md border border-white/20 px-3 py-2 text-white">
            <div className="text-[11px] text-white/70">{characterName(current.characterId)}</div>
            <div className="text-[14px] font-semibold">{lookName(current.lookId)}</div>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className={`shrink-0 px-3 lg:px-4 pt-3 ${embedded ? 'pb-3' : 'pb-[calc(var(--m-tab-h)+12px)] lg:pb-4'} space-y-3`}>
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex rounded-xl bg-surface border border-white/[0.06] p-1">
            <IconBtn label="Undo" onClick={undo} disabled={!canUndo}>
              <Undo2 className="w-4 h-4" />
            </IconBtn>
            <IconBtn label="Redo" onClick={redo} disabled={!canRedo}>
              <Redo2 className="w-4 h-4" />
            </IconBtn>
            <IconBtn
              label="Reset"
              onClick={() => {
                reset();
                toast('Reset to signature look');
              }}
            >
              <RotateCcw className="w-4 h-4" />
            </IconBtn>
          </div>

          <div role="radiogroup" aria-label="Framing" className="flex rounded-xl bg-surface border border-white/[0.06] p-1">
            {FRAMINGS.map((f) => (
              <button
                key={f.id}
                role="radio"
                aria-checked={current.framing === f.id}
                onClick={() => commit({ framing: f.id })}
                className={`h-8 px-3 rounded-lg text-[12.5px] font-medium cursor-pointer ${
                  current.framing === f.id ? 'bg-white/10 text-white' : 'text-neutral-500 hover:text-white'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          <div className="relative">
            <button
              type="button"
              onClick={() => setFilterOpen(!filterOpen)}
              aria-haspopup="listbox"
              aria-expanded={filterOpen}
              className="h-10 px-3 rounded-xl bg-surface border border-white/[0.06] text-[12.5px] font-medium flex items-center gap-1.5 cursor-pointer"
            >
              Filter: {filter.name}
              <ChevronDown className={`w-3.5 h-3.5 transition-transform ${filterOpen ? 'rotate-180' : ''}`} />
            </button>
            {filterOpen && (
              <ul role="listbox" aria-label="Filter" className="absolute z-20 bottom-full mb-2 left-0 w-44 rounded-xl bg-base border border-white/10 shadow-2xl p-1">
                {STAGE_FILTERS.map((f) => (
                  <li key={f.id}>
                    <button
                      role="option"
                      aria-selected={f.id === current.filter}
                      onClick={() => {
                        commit({ filter: f.id });
                        setFilterOpen(false);
                      }}
                      className="w-full px-3 py-2 rounded-lg text-left text-[13px] hover:bg-white/[0.06] flex items-center justify-between cursor-pointer"
                    >
                      {f.name}
                      {f.id === current.filter && <Check className="w-4 h-4 text-accent-ink" />}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="flex gap-2 ml-auto">
            <button
              type="button"
              onClick={() => {
                save();
                toast('Saved to library');
              }}
              className="h-10 px-4 rounded-xl border border-white/30 text-[13px] font-semibold flex items-center gap-1.5 hover:bg-white hover:text-black transition-colors cursor-pointer"
            >
              <Bookmark className="w-4 h-4" /> Save look
            </button>
            <button
              type="button"
              onClick={() => onSendToMotion(current)}
              className="h-10 px-4 rounded-xl bg-[#d1fe17] text-black text-[13px] font-bold flex items-center gap-1.5 cursor-pointer active:scale-[0.98]"
            >
              <Clapperboard className="w-4 h-4" /> Turn to motion
            </button>
          </div>
        </div>

        {/* Library */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[12px] font-semibold uppercase tracking-wider text-neutral-500">Library</span>
            <span className="text-[12px] text-neutral-500">{library.length} saved</span>
          </div>
          {library.length === 0 ? (
            <p className="text-[12.5px] text-neutral-500">Save a look to start your library.</p>
          ) : (
            <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
              {library.map((l) => (
                <div key={l.id} className="theme-dark group relative shrink-0 w-[64px] h-[92px] rounded-lg overflow-hidden border border-white/15 bg-[radial-gradient(120%_90%_at_50%_30%,#f3f1ee,#d9d6d1)] wd-pop">
                  <button
                    type="button"
                    onClick={() => commit({ characterId: l.characterId, lookId: l.lookId, filter: l.filter, framing: l.framing })}
                    title={`${characterName(l.characterId)} · ${lookName(l.lookId)}`}
                    aria-label={`Load ${characterName(l.characterId)} in ${lookName(l.lookId)}`}
                    className="absolute inset-0 cursor-pointer"
                  >
                    <img
                      src={lookImage(l.characterId, l.lookId)}
                      alt=""
                      className="w-full h-[140%] object-contain object-top"
                      style={{ filter: STAGE_FILTERS.find((f) => f.id === l.filter)?.filter }}
                    />
                  </button>
                  <button
                    type="button"
                    onClick={() => remove(l.id)}
                    aria-label="Remove from library"
                    className="absolute top-0.5 right-0.5 w-5 h-5 rounded-full bg-black/70 text-white flex items-center justify-center opacity-100 sm:opacity-0 group-hover:opacity-100 cursor-pointer"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const IconBtn: React.FC<{ label: string; onClick: () => void; disabled?: boolean; children: React.ReactNode }> = ({
  label,
  onClick,
  disabled,
  children,
}) => (
  <button
    type="button"
    onClick={onClick}
    disabled={disabled}
    aria-label={label}
    title={label}
    className="w-9 h-8 rounded-lg flex items-center justify-center text-white hover:bg-white/[0.08] disabled:opacity-35 disabled:cursor-not-allowed cursor-pointer"
  >
    {children}
  </button>
);

/** Prompt describing a wardrobe look, used when sending it to Motion. */
export function wardrobeLookPrompt(s: WardrobeSnapshot): string {
  const o: Outfit | undefined = outfitById(s.lookId);
  return o ? renderPrompt(s.characterId, o) : `${characterName(s.characterId)} in their signature look from the character sheet.`;
}

