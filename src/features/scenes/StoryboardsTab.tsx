import React, { useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { Clapperboard, Clock, Users, Sparkles, Copy, Check, X, Film, ChevronLeft } from 'lucide-react';
import { Sheet, toast } from '../../components/ui';
import { addGeneration } from '../remix/store';
import { lookImage, BASE_LOOK } from '../influencer/wardrobe';
import { INFLUENCERS, influencerName } from './store';
import { STORYBOARDS, STORYBOARD_PACKS, Storyboard, StoryboardPack, compileShotPrompts, storyboardSeconds } from './storyboards';

/**
 * Storyboards as preset cards (cover + title). Opening one shows the full storyboard:
 * shots, casting and Generate (self-hosted engine via POST /api/storyboard).
 */

const PACK_BG: Record<StoryboardPack, string> = {
  'The Office': 'radial-gradient(120% 90% at 50% 20%, #5b6b7d 0%, #1f2730 60%, #0d1116 100%)',
  'The Listing': 'radial-gradient(120% 90% at 50% 15%, #c9a873 0%, #5a4630 55%, #17120c 100%)',
  'The Party': 'radial-gradient(120% 90% at 50% 20%, #8a4a6a 0%, #3a1d33 55%, #120910 100%)',
  'The Drama': 'radial-gradient(120% 90% at 50% 20%, #3f5f73 0%, #1b2833 55%, #080c10 100%)',
};

export const StoryboardsTab: React.FC = () => {
  const [pack, setPack] = useState<StoryboardPack | 'All'>('All');
  const [openId, setOpenId] = useState<string | null>(null);
  const list = useMemo(() => (pack === 'All' ? STORYBOARDS : STORYBOARDS.filter((s) => s.pack === pack)), [pack]);
  const open = STORYBOARDS.find((s) => s.id === openId) || null;

  return (
    <div className="px-5 pt-4">
      <div className="flex gap-1.5 overflow-x-auto no-scrollbar pb-4" role="group" aria-label="Storyboard packs">
        {(['All', ...STORYBOARD_PACKS] as const).map((p) => (
          <button
            key={p}
            onClick={() => setPack(p)}
            aria-pressed={pack === p}
            className={`shrink-0 h-8 px-3.5 rounded-full text-[12.5px] cursor-pointer ${
              pack === p ? 'bg-[#d1fe17] text-black font-semibold' : 'bg-white/[0.06] text-neutral-300 hover:bg-white/10'
            }`}
          >
            {p === 'All' ? 'All' : p}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3">
        {list.map((s, i) => (
          <PresetCard key={s.id} sb={s} index={i} onOpen={() => setOpenId(s.id)} />
        ))}
      </div>

      {open && <StoryboardViewer sb={open} onClose={() => setOpenId(null)} />}
    </div>
  );
};

/* ---------- Cover: cast signature looks on a pack backdrop ---------- */

const Cover: React.FC<{ sb: Storyboard; cast?: Record<string, string>; large?: boolean }> = ({ sb, cast, large }) => {
  const ids = sb.roles.map((r) => cast?.[r.id] || r.suggested).slice(0, 3);
  const n = ids.length;
  return (
    <div className="theme-dark absolute inset-0 overflow-hidden" style={{ background: PACK_BG[sb.pack] }}>
      <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/40 to-transparent" />
      {ids.map((id, i) => {
        const off = i - (n - 1) / 2;
        return (
          <img
            key={`${id}-${i}`}
            src={lookImage(id, BASE_LOOK)}
            alt=""
            loading="lazy"
            className={`absolute w-auto max-w-none object-contain drop-shadow-[0_10px_20px_rgba(0,0,0,0.45)] ${large ? 'bottom-[76px] h-[82%]' : 'bottom-0 h-[92%]'}`}
            style={{
              left: '50%',
              transform: `translateX(calc(-50% + ${off * (large ? 34 : 38)}%)) scale(${1 - Math.abs(off) * 0.06})`,
              zIndex: 10 - Math.abs(Math.round(off * 2)),
            }}
          />
        );
      })}
    </div>
  );
};

const PresetCard: React.FC<{ sb: Storyboard; index: number; onOpen: () => void }> = ({ sb, index, onOpen }) => {
  const seconds = storyboardSeconds(sb);
  return (
    <button
      onClick={onOpen}
      className="group relative aspect-[3/4] rounded-2xl overflow-hidden text-left cursor-pointer wd-card-in border border-white/[0.06]"
      style={{ animationDelay: `${index * 40}ms` }}
      aria-label={`Open storyboard ${sb.title}`}
    >
      <div className="absolute inset-0 transition-transform duration-500 group-hover:scale-[1.04]">
        <Cover sb={sb} />
      </div>
      <div className="theme-dark absolute top-2 left-2 z-20 flex gap-1">
        <span className="h-6 px-2 rounded-full bg-black/45 backdrop-blur text-[11px] text-white flex items-center gap-1">
          <Users className="w-3 h-3" /> {sb.roles.length}
        </span>
        <span className="h-6 px-2 rounded-full bg-black/45 backdrop-blur text-[11px] text-white flex items-center">{seconds}s</span>
      </div>
      <div className="theme-dark absolute inset-x-0 bottom-0 z-20 p-3 pt-12 bg-gradient-to-t from-black/90 via-black/55 to-transparent">
        <div className="text-[14px] font-semibold text-white leading-tight">{sb.title}</div>
        <div className="text-[11.5px] text-white/60 mt-0.5">
          {sb.pack} · {sb.shots.length} shots
        </div>
      </div>
    </button>
  );
};

/* ---------- Full-screen viewer ---------- */

const StoryboardViewer: React.FC<{ sb: Storyboard; onClose: () => void }> = ({ sb, onClose }) => {
  const [cast, setCast] = useState<Record<string, string>>(() => Object.fromEntries(sb.roles.map((r) => [r.id, r.suggested])));
  const [picking, setPicking] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [copied, setCopied] = useState(false);
  const seconds = storyboardSeconds(sb);
  const castNames = Object.fromEntries(sb.roles.map((r) => [r.id, influencerName(cast[r.id]) || r.label]));
  const prompts = compileShotPrompts(sb, castNames);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && !picking && onClose();
    window.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = prev;
    };
  }, [onClose, picking]);

  const copyPrompts = async () => {
    try {
      await navigator.clipboard.writeText(prompts.join('\n\n'));
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
      toast('Shot prompts copied');
    } catch {
      toast('Could not copy');
    }
  };

  const generate = async () => {
    setBusy(true);
    const castPayload = sb.roles.map((r) => {
      const inf = INFLUENCERS.find((i) => i.id === cast[r.id]);
      return { role: r.label, influencer_id: inf?.id || null, name: inf?.name || r.label, sheet_url: inf ? new URL(inf.sheet, location.origin).href : null };
    });
    const payload = {
      storyboard_id: sb.id,
      title: sb.title,
      aspect: '9:16',
      seconds,
      setting: sb.setting,
      line: sb.line || null,
      shots: sb.shots.map((sh, i) => ({ index: i, seconds: sh.seconds, prompt: prompts[i] })),
      cast: castPayload,
    };
    try {
      const r = await fetch('/api/storyboard', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      const d = await r.json().catch(() => ({}));
      if (r.status === 503 || d.error === 'engine_not_connected') {
        toast('The storyboard engine isn’t connected yet. Use Copy prompts for now.');
        return;
      }
      if (!r.ok || !d.job_id) {
        toast('The engine couldn’t start this job. Try again in a moment.');
        return;
      }
      addGeneration({
        kind: 'remix',
        model: 'Storyboard engine',
        quality: '720p',
        aspect: '9:16',
        seconds,
        inputs: { refs: castPayload.map((c) => c.sheet_url).filter((u): u is string => !!u), prompt: prompts.join('\n'), style: 'none' },
        scene: {
          clipId: sb.id,
          clipTitle: sb.title,
          cast: castPayload.map((c, i) => ({ person_index: i, influencerId: c.influencer_id, name: c.name })),
          provenance: { source: 'storyboard', storyboard_id: sb.id },
          watermark: 'AI-generated',
        },
        engineJobId: d.job_id,
        credits: 0,
      });
      toast(`Generating “${sb.title}”. Follow it in History.`);
      onClose();
    } catch {
      toast('Couldn’t reach the server. Check your connection.');
    } finally {
      setBusy(false);
    }
  };

  return createPortal(
    <div className="fixed inset-0 z-[60] bg-canvas flex flex-col md:flex-row animate-fade-in" role="dialog" aria-modal="true" aria-label={sb.title}>
      {/* Visual */}
      <div className="relative h-[46vh] md:h-auto md:flex-1 shrink-0 overflow-hidden">
        <Cover sb={sb} cast={cast} large />
        <button
          onClick={onClose}
          className="theme-dark absolute top-3 left-3 h-10 pl-2 pr-3.5 rounded-full bg-black/45 backdrop-blur text-white text-[13px] flex items-center gap-1 cursor-pointer"
          style={{ marginTop: 'env(safe-area-inset-top)' }}
          aria-label="Back to storyboards"
        >
          <ChevronLeft className="w-4 h-4" /> Storyboards
        </button>
        {/* Shot strip over the cover */}
        <div className="theme-dark absolute inset-x-3 bottom-3 grid gap-1.5" style={{ gridTemplateColumns: `repeat(${sb.shots.length}, minmax(0, 1fr))` }}>
          {sb.shots.map((sh, i) => (
            <div key={i} className="rounded-lg bg-black/45 backdrop-blur border border-white/10 px-2 py-1.5">
              <div className="flex items-center justify-between text-[10px]">
                <span className="font-semibold text-[#d1fe17]">{String(i + 1).padStart(2, '0')}</span>
                <span className="text-white/50">{sh.seconds}s</span>
              </div>
              <div className="text-[11px] text-white/85 leading-tight truncate">{sh.framing}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Details */}
      <aside className="flex-1 md:flex-none md:w-[420px] min-h-0 flex flex-col border-t md:border-t-0 md:border-l border-white/[0.06] bg-base">
        <div className="hidden md:flex justify-end p-3">
          <button onClick={onClose} className="w-9 h-9 rounded-full bg-white/[0.06] hover:bg-white/10 flex items-center justify-center cursor-pointer" aria-label="Close">
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="flex-1 min-h-0 overflow-y-auto px-5 pb-4 pt-4 md:pt-0 space-y-5">
          <div>
            <div className="text-[11px] uppercase tracking-[0.08em] text-neutral-500">{sb.pack}</div>
            <h2 className="text-[26px] font-black uppercase tracking-tight leading-none mt-1">{sb.title}</h2>
            <p className="text-[13.5px] text-neutral-400 mt-2">{sb.hook}</p>
            <div className="flex flex-wrap gap-1.5 mt-3 text-[11.5px] text-neutral-300">
              <span className="h-7 px-2.5 rounded-full bg-white/[0.06] flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> {seconds}s</span>
              <span className="h-7 px-2.5 rounded-full bg-white/[0.06] flex items-center gap-1"><Film className="w-3.5 h-3.5" /> {sb.shots.length} shots</span>
              <span className="h-7 px-2.5 rounded-full bg-white/[0.06] flex items-center">{sb.category}</span>
            </div>
          </div>

          <section>
            <h3 className="text-[11px] font-semibold uppercase tracking-[0.08em] text-neutral-300 pb-2">Cast</h3>
            <div className="space-y-1.5">
              {sb.roles.map((r) => {
                const inf = INFLUENCERS.find((i) => i.id === cast[r.id]);
                return (
                  <button
                    key={r.id}
                    onClick={() => setPicking(r.id)}
                    className="w-full h-14 pl-1.5 pr-3 rounded-xl bg-surface hover:bg-white/[0.08] border border-white/[0.06] flex items-center gap-3 cursor-pointer text-left"
                    aria-label={`Cast ${r.label}: ${inf?.name || 'none'}`}
                  >
                    {inf ? <img src={inf.face} alt="" className="w-11 h-11 rounded-lg object-cover object-top" /> : <span className="w-11 h-11 rounded-lg bg-white/10" />}
                    <span className="flex-1 leading-tight">
                      <span className="block text-[11px] text-neutral-500">{r.label}</span>
                      <span className="block text-[14px] text-white">{inf?.name || 'Choose'}</span>
                    </span>
                    <span className="text-[12px] text-neutral-500">Change</span>
                  </button>
                );
              })}
            </div>
          </section>

          <section>
            <h3 className="text-[11px] font-semibold uppercase tracking-[0.08em] text-neutral-300 pb-2 flex items-center gap-1.5">
              <Clapperboard className="w-3.5 h-3.5" /> Shot list
            </h3>
            <ol className="space-y-2">
              {sb.shots.map((sh, i) => (
                <li key={i} className="flex gap-3 rounded-xl bg-surface border border-white/[0.06] p-3">
                  <span className="text-[#d1fe17] font-semibold text-[13px] w-5 shrink-0">{i + 1}</span>
                  <span className="text-[13px] text-neutral-300">
                    <span className="text-white">{sh.framing}</span>: {sh.action}
                    <span className="block text-[11.5px] text-neutral-500 mt-0.5">{sh.seconds}s</span>
                  </span>
                </li>
              ))}
            </ol>
            {sb.line && <p className="mt-3 text-[13px] text-neutral-400 italic">“{sb.line}”</p>}
          </section>

          <section className="text-[12.5px] text-neutral-500">
            <span className="text-neutral-300">Setting:</span> {sb.setting}
          </section>
        </div>

        <div className="shrink-0 p-4 border-t border-white/[0.06] flex gap-2" style={{ paddingBottom: 'calc(1rem + env(safe-area-inset-bottom))' }}>
          <button onClick={copyPrompts} className="h-12 px-4 rounded-xl bg-white/[0.06] hover:bg-white/10 text-[13px] flex items-center gap-1.5 cursor-pointer" aria-label="Copy shot prompts">
            {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />} Prompts
          </button>
          <button
            onClick={generate}
            disabled={busy}
            className="flex-1 h-12 rounded-xl bg-gradient-to-r from-[#e4ff3a] to-[#c3f000] text-black font-bold text-[15px] flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 active:scale-[0.98]"
          >
            <Sparkles className="w-4 h-4" /> {busy ? 'Starting…' : 'Generate'}
          </button>
        </div>
      </aside>

      <Sheet open={!!picking} title={`Cast ${sb.roles.find((r) => r.id === picking)?.label || ''}`} onClose={() => setPicking(null)}>
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-2" role="radiogroup" aria-label="Influencers">
          {INFLUENCERS.map((inf) => {
            const active = picking ? cast[picking] === inf.id : false;
            return (
              <button
                key={inf.id}
                role="radio"
                aria-checked={active}
                onClick={() => {
                  if (picking) setCast((c) => ({ ...c, [picking]: inf.id }));
                  setPicking(null);
                }}
                className={`theme-dark relative aspect-[4/5] rounded-lg overflow-hidden border-2 cursor-pointer ${active ? 'border-[#d1fe17]' : 'border-transparent hover:border-white/20'}`}
              >
                <img src={inf.face} alt="" loading="lazy" className="absolute inset-0 w-full h-full object-cover object-top" />
                <span className="absolute inset-x-0 bottom-0 px-1 py-1 text-[10px] font-medium text-white bg-gradient-to-t from-black/80 to-transparent truncate">{inf.name}</span>
              </button>
            );
          })}
        </div>
      </Sheet>
    </div>,
    document.body
  );
};
