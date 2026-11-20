import React, { useEffect, useMemo, useRef, useState } from 'react';
import { X, Check, Search, Sparkles, ImagePlus, UserCheck, ChevronRight, RotateCcw, Users, ShieldCheck, Minus, Plus } from 'lucide-react';
import { toast } from '../../components/ui';
import { Dropzone, SelectPopover } from '../influencer/controls';
import { RENDER_STYLES } from '../remix/catalog';
import { addGeneration } from '../remix/store';
import {
  Clip,
  CastEntry,
  Quality,
  PersonPoint,
  SCENE_MODELS,
  LIMITS,
  WATERMARK,
  canRemix,
  castComplete,
  castPrompt,
  estimateSceneCredits,
  buildProvenance,
  placeholderPeople,
} from './logic';
import { INFLUENCERS, Influencer, influencerName, markRecent, useSceneStore } from './store';
import { ClipMedia } from './SceneLibrary';

/** Count-up for the credit estimate. */
function useCountUp(target: number, ms = 450) {
  const [v, setV] = useState(target);
  const from = useRef(target);
  useEffect(() => {
    const start = performance.now();
    const a = from.current;
    let raf = 0;
    const step = (t: number) => {
      const k = Math.min(1, (t - start) / ms);
      const eased = 1 - Math.pow(1 - k, 3);
      setV(Math.round(a + (target - a) * eased));
      if (k < 1) raf = requestAnimationFrame(step);
      else from.current = target;
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [target, ms]);
  return v;
}

export const ScenePanel: React.FC<{ clip: Clip; parentRemixId?: string; initialCast?: CastEntry[]; onClose: () => void; onSubmitted: () => void }> = ({
  clip,
  parentRemixId,
  initialCast,
  onClose,
  onSubmitted,
}) => {
  const allowed = canRemix(clip);
  const [people, setPeople] = useState<PersonPoint[]>([]);
  const [method, setMethod] = useState<'annotated' | 'detector' | 'placeholder' | 'running'>('running');
  const [cast, setCast] = useState<CastEntry[]>(initialCast || []);
  const [active, setActive] = useState(1);
  const [picker, setPicker] = useState<number | null>(null);
  const [swap, setSwap] = useState(false);
  const [objects, setObjects] = useState<string[]>([]);
  const [style, setStyle] = useState('none');
  const [prompt, setPrompt] = useState('');
  const [promptEdited, setPromptEdited] = useState(false);
  const [model, setModel] = useState<string>(SCENE_MODELS[0].id);
  const [quality, setQuality] = useState<Quality>('720p');

  // Person detection: API first (annotated / detector), fall back to clip annotations, then placeholders.
  useEffect(() => {
    let off = false;
    setMethod('running');
    const local = () => (clip.people.length ? { people: clip.people, method: 'annotated' as const } : { people: placeholderPeople(clip.people_count), method: 'placeholder' as const });
    const done = (r: { people: PersonPoint[]; method: any }) => {
      if (off) return;
      setPeople(r.people);
      setMethod(r.method);
      setCast((c) => r.people.map((p) => c.find((e) => e.person_index === p.index) || { person_index: p.index, influencer_id: null, keep: false }));
    };
    const t = setTimeout(() => {
      if (clip.source === 'user_upload') return done(local()); // uploads live in this browser until storage is wired
      fetch('/api/scenes/detect', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ clip_id: clip.id }) })
        .then((r) => (r.ok ? r.json() : Promise.reject()))
        .then(done)
        .catch(() => done(local()));
    }, 500);
    return () => {
      off = true;
      clearTimeout(t);
    };
  }, [clip.id]);

  const autoPrompt = useMemo(() => castPrompt(cast, influencerName, swap ? objects.length : 0), [cast, swap, objects.length]);
  useEffect(() => {
    if (!promptEdited) setPrompt(autoPrompt);
  }, [autoPrompt, promptEdited]);

  const castCount = cast.filter((c) => c.influencer_id).length;
  const credits = estimateSceneCredits({ model, quality, duration_s: clip.duration_s, cast: castCount, objectRefs: swap ? objects.length : 0, styled: style !== 'none' });
  const shown = useCountUp(credits);
  const ready = allowed.ok && method !== 'running' && castComplete(people.length, cast);

  const setEntry = (idx: number, patch: Partial<CastEntry>) => setCast((c) => c.map((e) => (e.person_index === idx ? { ...e, ...patch } : e)));
  const adjustCount = (d: number) => {
    const n = Math.max(1, Math.min(LIMITS.maxPeople, people.length + d));
    const next = placeholderPeople(n);
    setPeople(next);
    setCast((c) => next.map((p) => c.find((e) => e.person_index === p.index) || { person_index: p.index, influencer_id: null, keep: false }));
  };
  const [w, h] = clip.aspect.split(':').map(Number);

  const submit = () => {
    if (!ready) return;
    const provenance = buildProvenance({ model, clip, cast });
    addGeneration({
      kind: 'remix',
      mode: swap ? 'swap' : 'transfer',
      model,
      quality,
      aspect: clip.aspect,
      seconds: clip.duration_s,
      inputs: {
        video: clip.storage_url || undefined,
        videoName: clip.title,
        refs: [...cast.filter((c) => c.influencer_id).map((c) => INFLUENCERS.find((i) => i.id === c.influencer_id)!.face), ...(swap ? objects : [])],
        prompt,
        style: RENDER_STYLES.find((s) => s.id === style)?.name || 'No style',
      },
      output: { url: clip.storage_url || clip.poster_url || '', poster: clip.poster_url || undefined },
      parentId: clip.id,
      credits,
      scene: {
        clipId: clip.id,
        clipTitle: clip.title,
        cast: cast.map((c) => ({ person_index: c.person_index, influencerId: c.influencer_id, name: c.influencer_id ? influencerName(c.influencer_id) : 'Original' })),
        provenance: { ...provenance },
        watermark: WATERMARK,
        parentRemixId,
      },
    });
    // Best effort: register the job server-side too (no-op if the API isn't deployed).
    fetch('/api/scenes/remixes', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ clip_id: clip.id, character_map: cast, object_refs: [], style: style === 'none' ? null : style, prompt, model, quality, parent_remix_id: parentRemixId }),
    }).catch(() => {});
    toast(`Queued · ${credits} credits`);
    onSubmitted();
  };

  return (
    <>
      <div className="flex-1 min-h-0 overflow-y-auto px-3 py-3 space-y-3">
        <div className="flex items-center gap-2">
          <button onClick={onClose} className="text-[12px] text-neutral-400 hover:text-white cursor-pointer">
            ← Back
          </button>
          <span className="ml-auto text-[11px] text-neutral-500 flex items-center gap-1">
            <ShieldCheck className="w-3 h-3" /> {clip.source === 'preset' ? 'Platform clip' : 'Your upload · rights attested'}
          </span>
        </div>

        {/* Tilted preview with numbered person chips */}
        <div className="rounded-xl bg-surface border border-white/[0.06] p-4">
          <div className="theme-dark relative mx-auto w-[88%] -rotate-2 rounded-xl overflow-hidden border-4 border-white shadow-2xl bg-black transition-transform duration-300 hover:rotate-0" style={{ aspectRatio: `${w}/${h}`, maxHeight: 300 }}>
            <ClipMedia clip={clip} still className="w-full h-full object-cover" />
            {method === 'running' && (
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                <div className="absolute inset-x-0 h-0.5 bg-[#d1fe17] shadow-[0_0_12px_#d1fe17] animate-scan" />
                <span className="text-[12px] text-white font-medium">Detecting people…</span>
              </div>
            )}
            {method !== 'running' && (
              <div
                className="absolute inset-0 cursor-crosshair"
                onClick={(e) => {
                  if (method !== 'placeholder') return;
                  const r = (e.currentTarget as HTMLElement).getBoundingClientRect();
                  const x = (e.clientX - r.left) / r.width;
                  const y = (e.clientY - r.top) / r.height;
                  setPeople((ps) => ps.map((p) => (p.index === active ? { ...p, x, y } : p)));
                }}
              >
                {people.map((p) => {
                  const e = cast.find((c) => c.person_index === p.index);
                  const inf = INFLUENCERS.find((i) => i.id === e?.influencer_id);
                  return (
                    <button
                      key={p.index}
                      onClick={(ev) => (ev.stopPropagation(), setActive(p.index), setPicker(p.index))}
                      style={{ left: `${p.x * 100}%`, top: `${p.y * 100}%` }}
                      className={`absolute -translate-x-1/2 -translate-y-1/2 w-8 h-8 rounded-full border-2 text-[12px] font-bold flex items-center justify-center overflow-hidden shadow-lg transition-all duration-200 cursor-pointer animate-pop ${
                        inf || e?.keep ? 'border-[#d1fe17]' : 'border-white'
                      } ${active === p.index ? 'scale-110 ring-2 ring-[#d1fe17]/60' : ''} bg-black/70 text-white`}
                      aria-label={`Person ${p.index}`}
                    >
                      {inf ? <img src={inf.face} alt="" className="w-full h-full object-cover" /> : p.index}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
          <div className="mt-3 flex items-center justify-between text-[11px] text-neutral-500">
            <span className="truncate">
              {clip.title} · {Math.round(clip.duration_s)}s
            </span>
            {method === 'placeholder' ? (
              <span className="flex items-center gap-1">
                Estimated
                <button onClick={() => adjustCount(-1)} className="w-5 h-5 rounded bg-white/[0.07] flex items-center justify-center cursor-pointer" aria-label="Fewer people">
                  <Minus className="w-3 h-3" />
                </button>
                {people.length}
                <button onClick={() => adjustCount(1)} className="w-5 h-5 rounded bg-white/[0.07] flex items-center justify-center cursor-pointer" aria-label="More people">
                  <Plus className="w-3 h-3" />
                </button>
              </span>
            ) : (
              method !== 'running' && (
                <span className="flex items-center gap-1">
                  <Users className="w-3 h-3" /> {people.length} detected
                </span>
              )
            )}
          </div>
          {method === 'placeholder' && <p className="mt-1 text-[10.5px] text-neutral-500">Tap a chip, then tap the frame to place it on the right person.</p>}
        </div>

        {!allowed.ok && <div className="rounded-xl bg-red-500/10 border border-red-500/30 p-3 text-[12.5px] text-red-300">{allowed.reason}</div>}

        {/* Cast */}
        <div className="rounded-xl bg-surface border border-white/[0.06] p-3">
          <div className="text-[13px] font-semibold mb-0.5">Cast</div>
          <p className="text-[11px] text-neutral-500 mb-2">Pick one of your AI influencers for each person, or keep them.</p>
          <div className="space-y-1.5">
            {cast.map((e) => {
              const inf = INFLUENCERS.find((i) => i.id === e.influencer_id);
              return (
                <div key={e.person_index} className={`flex items-center gap-2 rounded-lg p-1.5 transition-colors duration-150 ${active === e.person_index ? 'bg-white/[0.05]' : ''}`}>
                  <span className="w-6 h-6 rounded-full bg-white/10 text-[11px] font-bold flex items-center justify-center shrink-0">{e.person_index}</span>
                  <button
                    onClick={() => (setActive(e.person_index), setPicker(e.person_index))}
                    className="flex-1 min-w-0 h-9 px-2 rounded-lg bg-white/[0.05] hover:bg-white/10 flex items-center gap-2 text-left text-[12.5px] cursor-pointer"
                  >
                    {inf ? <img src={inf.face} alt="" className="w-6 h-6 rounded-full object-cover" /> : <UserCheck className="w-4 h-4 text-neutral-500" />}
                    <span className={`truncate ${inf ? 'text-white' : e.keep ? 'text-neutral-400' : 'text-neutral-500'}`}>{inf ? inf.name : e.keep ? 'Keeping original' : 'Choose influencer'}</span>
                    <ChevronRight className="w-3.5 h-3.5 ml-auto text-neutral-500" />
                  </button>
                  <button
                    onClick={() => setEntry(e.person_index, { keep: !e.keep, influencer_id: null })}
                    className={`h-9 px-2.5 rounded-lg text-[11.5px] cursor-pointer transition-colors ${e.keep ? 'bg-white/15 text-white' : 'bg-white/[0.05] text-neutral-400'}`}
                  >
                    Keep
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* Objects swap */}
        <div className="rounded-xl bg-surface border border-white/[0.06] p-3">
          <label className="flex items-center justify-between cursor-pointer">
            <span>
              <span className="block text-[13px] font-medium">Objects swap</span>
              <span className="block text-[11px] text-neutral-500">Products or outfits · up to {LIMITS.maxObjectRefs}</span>
            </span>
            <input type="checkbox" className="sr-only peer" checked={swap} onChange={(e) => setSwap(e.target.checked)} />
            <span className="w-9 h-5 rounded-full bg-white/10 peer-checked:bg-[#d1fe17] relative transition-colors after:absolute after:top-0.5 after:left-0.5 after:w-4 after:h-4 after:rounded-full after:bg-white after:transition-transform peer-checked:after:translate-x-4" />
          </label>
          <div className={`grid transition-[grid-template-rows] duration-300 ${swap ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'}`}>
            <div className="overflow-hidden">
              <div className="pt-3">
                <Dropzone
                  accept="image/*"
                  multiple
                  icon={<ImagePlus className="w-4 h-4" />}
                  title="Add product or outfit images"
                  hint={`${objects.length}/${LIMITS.maxObjectRefs}`}
                  onFiles={(fs) => setObjects((o) => [...o, ...fs.filter((f) => f.type.startsWith('image/')).map((f) => URL.createObjectURL(f))].slice(0, LIMITS.maxObjectRefs))}
                >
                  {objects.length > 0 && (
                    <div className="px-3 pb-3 grid grid-cols-6 gap-1.5">
                      {objects.map((o, i) => (
                        <button key={o} onClick={() => setObjects(objects.filter((_, j) => j !== i))} className="relative aspect-square rounded-md overflow-hidden group cursor-pointer" aria-label="Remove">
                          <img src={o} alt="" className="w-full h-full object-cover" />
                          <span className="absolute inset-0 bg-black/60 hidden group-hover:flex items-center justify-center">
                            <X className="w-3 h-3 text-white" />
                          </span>
                        </button>
                      ))}
                    </div>
                  )}
                </Dropzone>
              </div>
            </div>
          </div>
        </div>

        <SelectPopover label="Style" value={style} onChange={setStyle} options={RENDER_STYLES.map((s) => ({ value: s.id, label: s.name }))} />

        {/* Prompt (auto-filled) */}
        <div className="rounded-xl bg-surface border border-white/[0.06] p-3">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[13px] font-medium">Prompt</span>
            {promptEdited && (
              <button onClick={() => setPromptEdited(false)} className="text-[11px] text-neutral-400 hover:text-white flex items-center gap-1 cursor-pointer">
                <RotateCcw className="w-3 h-3" /> Auto
              </button>
            )}
          </div>
          <textarea
            value={prompt}
            onChange={(e) => (setPrompt(e.target.value), setPromptEdited(true))}
            rows={4}
            className="w-full bg-transparent text-[12.5px] text-white placeholder-neutral-500 resize-none focus:outline-none"
          />
        </div>

        <SelectPopover label="Model" value={model} onChange={setModel} options={SCENE_MODELS.map((m) => ({ value: m.id, label: m.name, description: m.tagline, badges: [...m.badges] }))} />
        <SelectPopover label="Quality" value={quality} onChange={(v) => setQuality(v as Quality)} options={(['480p', '720p', '1080p'] as const).map((q) => ({ value: q, label: q }))} />
      </div>

      <div className="shrink-0 p-3 border-t border-white/[0.06]">
        <button
          onClick={submit}
          disabled={!ready}
          className={`w-full h-12 rounded-xl font-semibold text-[14px] flex items-center justify-center gap-2 transition-all duration-200 ${
            ready ? 'bg-[#d1fe17] text-black hover:brightness-95 cursor-pointer' : 'bg-white/[0.06] text-neutral-500 cursor-not-allowed'
          }`}
        >
          Generate
          <span className="flex items-center gap-1 tabular-nums">
            <Sparkles className="w-3.5 h-3.5" /> {shown}
          </span>
        </button>
        {!ready && method !== 'running' && allowed.ok && <p className="mt-1.5 text-center text-[11px] text-neutral-500">Cast at least one influencer and choose or keep every person</p>}
      </div>

      {picker !== null && (
        <CastPicker
          person={picker}
          value={cast.find((c) => c.person_index === picker)?.influencer_id || null}
          onClose={() => setPicker(null)}
          onPick={(id) => {
            setEntry(picker, { influencer_id: id, keep: false });
            markRecent(id);
            const next = cast.find((c) => c.person_index > picker && !c.influencer_id && !c.keep);
            setPicker(null);
            if (next) setActive(next.person_index);
          }}
        />
      )}
    </>
  );
};

/* ============================================================
 * Cast picker
 * ============================================================ */

const CastPicker: React.FC<{ person: number; value: string | null; onPick: (id: string) => void; onClose: () => void }> = ({ person, value, onPick, onClose }) => {
  const { recentInfluencers } = useSceneStore();
  const [q, setQ] = useState('');
  const match = (i: Influencer) => i.name.toLowerCase().includes(q.toLowerCase());
  const recent = recentInfluencers.map((id) => INFLUENCERS.find((i) => i.id === id)).filter((x): x is Influencer => !!x && match(x));
  const rest = INFLUENCERS.filter(match);

  const Tile: React.FC<{ i: Influencer }> = ({ i }) => (
    <button
      onClick={() => onPick(i.id)}
      className={`theme-dark relative rounded-xl overflow-hidden bg-surface border-2 text-left transition-all duration-150 hover:scale-[1.02] cursor-pointer ${value === i.id ? 'border-[#d1fe17] shadow-[0_0_0_3px_rgba(209,254,23,0.25)]' : 'border-transparent'}`}
    >
      <img src={i.sheet} alt={i.name} loading="lazy" className="w-full aspect-[4/5] object-cover object-top" />
      <span className="absolute inset-x-0 bottom-0 p-2 bg-gradient-to-t from-black/85 text-[12px] font-medium text-white truncate">{i.name}</span>
      {value === i.id && (
        <span className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-[#d1fe17] text-black flex items-center justify-center animate-pop">
          <Check className="w-3.5 h-3.5" />
        </span>
      )}
    </button>
  );

  return (
    <div className="fixed inset-0 z-[70] bg-black/70 flex items-end sm:items-center justify-center" onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()} className="w-full sm:max-w-3xl max-h-[88vh] flex flex-col rounded-t-2xl sm:rounded-2xl bg-base border border-white/10 animate-sheet-up">
        <div className="px-5 pt-4 pb-3 flex items-center gap-3 border-b border-white/[0.06]">
          <div className="flex-1">
            <div className="text-[16px] font-bold">Cast person {person}</div>
            <div className="text-[11.5px] text-neutral-500">Only your own AI influencers can be cast — never real people.</div>
          </div>
          <label className="flex items-center gap-2 h-9 px-3 rounded-lg bg-white/[0.06]">
            <Search className="w-3.5 h-3.5 text-neutral-500" />
            <input autoFocus value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search" className="w-32 bg-transparent text-[13px] focus:outline-none" />
          </label>
          <button onClick={onClose} className="p-1.5 text-neutral-400 hover:text-white cursor-pointer" aria-label="Close">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {recent.length > 0 && !q && (
            <section>
              <div className="text-[11px] uppercase tracking-wide text-neutral-500 mb-2">Recently used</div>
              <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                {recent.slice(0, 5).map((i) => (
                  <Tile key={i.id} i={i} />
                ))}
              </div>
            </section>
          )}
          <section>
            <div className="text-[11px] uppercase tracking-wide text-neutral-500 mb-2">Your influencers · {rest.length}</div>
            <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
              {rest.map((i) => (
                <Tile key={i.id} i={i} />
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};
