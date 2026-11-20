import React, { useMemo, useState } from 'react';
import { Clapperboard, Clock, Users, ChevronDown, Sparkles, Copy, Check, Film } from 'lucide-react';
import { Sheet, toast } from '../../components/ui';
import { addGeneration } from '../remix/store';
import { INFLUENCERS, influencerName } from './store';
import { STORYBOARDS, STORYBOARD_PACKS, Storyboard, StoryboardPack, compileShotPrompts, storyboardSeconds } from './storyboards';

/**
 * Storyboards: pick a storyboard, cast each role with an AI influencer, generate on the
 * self-hosted storyboard engine (POST /api/storyboard). Progress shows in History.
 */
export const StoryboardsTab: React.FC = () => {
  const [pack, setPack] = useState<StoryboardPack | 'All'>('All');
  const list = useMemo(() => (pack === 'All' ? STORYBOARDS : STORYBOARDS.filter((s) => s.pack === pack)), [pack]);
  const packs = pack === 'All' ? STORYBOARD_PACKS : [pack];

  return (
    <div className="px-5 pt-5">
      <header className="flex flex-col gap-1 pb-4">
        <h2 className="text-[22px] sm:text-[28px] font-black uppercase tracking-tight leading-none">Storyboards</h2>
        <p className="text-[13px] text-neutral-400 max-w-xl">
          Multi-shot scenes ready to shoot. Cast each role with your AI influencers and generate.
        </p>
      </header>

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
            {p === 'All' ? `All · ${STORYBOARDS.length}` : p}
          </button>
        ))}
      </div>

      {packs.map((p) => {
        const items = list.filter((s) => s.pack === p);
        if (!items.length) return null;
        return (
          <section key={p} className="pb-6">
            <h3 className="px-0.5 pb-2.5 text-[11px] font-semibold uppercase tracking-[0.08em] text-neutral-300">
              {p} <span className="text-neutral-500 font-normal">· {items.length}</span>
            </h3>
            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
              {items.map((s) => (
                <StoryboardCard key={s.id} sb={s} />
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
};

/* ---------- Card ---------- */

const StoryboardCard: React.FC<{ sb: Storyboard }> = ({ sb }) => {
  const [cast, setCast] = useState<Record<string, string>>(() => Object.fromEntries(sb.roles.map((r) => [r.id, r.suggested])));
  const [picking, setPicking] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [copied, setCopied] = useState(false);
  const seconds = storyboardSeconds(sb);
  const castNames = Object.fromEntries(sb.roles.map((r) => [r.id, influencerName(cast[r.id]) || r.label]));
  const prompts = compileShotPrompts(sb, castNames);

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
    } catch {
      toast('Couldn’t reach the server. Check your connection.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <article className="rounded-2xl bg-surface border border-white/[0.06] overflow-hidden flex flex-col">
      {/* Shot strip */}
      <div className="theme-dark grid gap-1 p-2 bg-black/40" style={{ gridTemplateColumns: `repeat(${sb.shots.length}, minmax(0, 1fr))` }}>
        {sb.shots.map((sh, i) => (
          <div key={i} className="aspect-[9/12] rounded-lg bg-gradient-to-b from-white/[0.08] to-white/[0.02] border border-white/[0.06] p-1.5 flex flex-col">
            <span className="text-[10px] font-semibold text-[#d1fe17]">{String(i + 1).padStart(2, '0')}</span>
            <span className="mt-auto text-[10px] leading-tight text-white/80 line-clamp-3">{sh.framing}</span>
            <span className="text-[9.5px] text-white/40">{sh.seconds}s</span>
          </div>
        ))}
      </div>

      <div className="p-3.5 flex flex-col gap-2.5 flex-1">
        <div>
          <h4 className="text-[15px] font-semibold text-white">{sb.title}</h4>
          <p className="text-[12.5px] text-neutral-400 mt-0.5">{sb.hook}</p>
        </div>
        <div className="flex flex-wrap gap-1.5 text-[11px] text-neutral-400">
          <span className="h-6 px-2 rounded-full bg-white/[0.06] flex items-center gap-1"><Clock className="w-3 h-3" /> {seconds}s</span>
          <span className="h-6 px-2 rounded-full bg-white/[0.06] flex items-center gap-1"><Users className="w-3 h-3" /> {sb.roles.length}</span>
          <span className="h-6 px-2 rounded-full bg-white/[0.06] flex items-center gap-1"><Film className="w-3 h-3" /> {sb.shots.length} shots</span>
          <span className="h-6 px-2 rounded-full bg-white/[0.06] flex items-center">{sb.category}</span>
        </div>

        {/* Cast */}
        <div className="flex flex-wrap gap-2">
          {sb.roles.map((r) => {
            const inf = INFLUENCERS.find((i) => i.id === cast[r.id]);
            return (
              <button
                key={r.id}
                onClick={() => setPicking(r.id)}
                className="h-10 pl-1 pr-3 rounded-full bg-white/[0.05] hover:bg-white/10 border border-white/[0.06] flex items-center gap-2 cursor-pointer"
                aria-label={`Cast ${r.label}: ${inf?.name || 'none'}`}
              >
                {inf ? <img src={inf.face} alt="" className="w-8 h-8 rounded-full object-cover object-top" /> : <span className="w-8 h-8 rounded-full bg-white/10" />}
                <span className="text-left leading-tight">
                  <span className="block text-[10px] text-neutral-500">{r.label}</span>
                  <span className="block text-[12px] text-white">{inf?.name || 'Choose'}</span>
                </span>
              </button>
            );
          })}
        </div>

        {/* Shot list */}
        <button onClick={() => setOpen(!open)} aria-expanded={open} className="flex items-center gap-1.5 text-[12px] text-neutral-400 hover:text-white cursor-pointer self-start">
          <Clapperboard className="w-3.5 h-3.5" /> Shot list <ChevronDown className={`w-3.5 h-3.5 transition-transform ${open ? 'rotate-180' : ''}`} />
        </button>
        {open && (
          <ol className="space-y-1.5 text-[12.5px]">
            {sb.shots.map((sh, i) => (
              <li key={i} className="flex gap-2">
                <span className="text-[#d1fe17] font-semibold w-5 shrink-0">{i + 1}</span>
                <span className="text-neutral-300">
                  <span className="text-white">{sh.framing}</span>: {sh.action} <span className="text-neutral-500">· {sh.seconds}s</span>
                </span>
              </li>
            ))}
            {sb.line && <li className="pt-1 text-neutral-400 italic">“{sb.line}”</li>}
          </ol>
        )}

        <div className="mt-auto pt-1 flex gap-2">
          <button
            onClick={copyPrompts}
            className="h-10 px-3 rounded-xl bg-white/[0.06] hover:bg-white/10 text-[12.5px] flex items-center gap-1.5 cursor-pointer"
            aria-label="Copy shot prompts"
          >
            {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />} Prompts
          </button>
          <button
            onClick={generate}
            disabled={busy}
            className="flex-1 h-10 rounded-xl bg-[#d1fe17] text-black font-semibold text-[13.5px] flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-60 active:scale-[0.98]"
          >
            <Sparkles className="w-4 h-4" /> {busy ? 'Starting…' : 'Generate'}
          </button>
        </div>
      </div>

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
    </article>
  );
};
