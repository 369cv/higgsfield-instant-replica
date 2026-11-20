import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Search,
  Repeat2,
  Heart,
  Bookmark,
  Flag,
  Upload,
  ExternalLink,
  SlidersHorizontal,
  ChevronDown,
  Plus,
  X,
  Check,
  Share2,
  Trash2,
  ArrowUp,
  ArrowDown,
  Pencil,
  Lock,
  Clock,
  Globe,
  Users,
  ShieldCheck,
} from 'lucide-react';
import { toast } from '../../components/ui';
import {
  Clip,
  ClipQuery,
  GENRES,
  DURATIONS,
  SortKey,
  searchClips,
  facets,
  validateUpload,
  findSceneUrl,
  RIGHTS_STATEMENT,
  LIMITS,
} from './logic';
import {
  useSceneStore,
  visibleClips,
  toggleLike,
  createCollection,
  toggleInCollection,
  updateCollection,
  moveCollection,
  deleteCollection,
  shareCollection,
  addUpload,
  requestPublish,
  makePrivate,
  deleteUpload,
  fileReport,
  sha256,
  probeVideo,
  BLOCKED_HASHES,
} from './store';

const fmt = (n: number) => (n >= 1000 ? `${(n / 1000).toFixed(n >= 10000 ? 0 : 1)}K` : String(n));
type Tab = 'library' | 'collections' | 'uploads';

/* ============================================================
 * Media: autoplay muted only while in view; poster drift for stills
 * ============================================================ */

export const ClipMedia: React.FC<{ clip: Clip; className?: string; still?: boolean }> = ({ clip, className = '', still }) => {
  const ref = useRef<HTMLVideoElement>(null);
  useEffect(() => {
    const v = ref.current;
    if (!v) return;
    const io = new IntersectionObserver(([e]) => (e.isIntersecting ? v.play().catch(() => {}) : v.pause()), { threshold: 0.35 });
    io.observe(v);
    return () => io.disconnect();
  }, [clip.storage_url]);
  if (clip.storage_url && !still) {
    return <video ref={ref} src={clip.storage_url} poster={clip.poster_url || undefined} muted loop playsInline preload="metadata" className={className} />;
  }
  return clip.poster_url ? (
    <img src={clip.poster_url} alt="" loading="lazy" className={`${className} ${still ? '' : 'animate-kenburns'}`} />
  ) : (
    <div className={`${className} bg-surface`} />
  );
};

/* ============================================================
 * Library root
 * ============================================================ */

export const SceneLibrary: React.FC<{ onRemix: (c: Clip) => void }> = ({ onRemix }) => {
  const store = useSceneStore();
  const [tab, setTab] = useState<Tab>('library');
  const [uploadOpen, setUploadOpen] = useState(false);
  const [report, setReport] = useState<Clip | null>(null);
  const all = useMemo(() => visibleClips(store), [store]);

  return (
    <div className="pb-24">
      <div className="px-5 pt-3 flex items-center gap-1">
        {(
          [
            ['library', 'Library'],
            ['collections', `Collections${store.collections.length ? ` · ${store.collections.length}` : ''}`],
            ['uploads', `My Uploads${store.uploads.length ? ` · ${store.uploads.length}` : ''}`],
          ] as const
        ).map(([id, label]) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            className={`h-8 px-3 rounded-full text-[12.5px] font-medium transition-colors duration-150 cursor-pointer ${
              tab === id ? 'bg-white/10 text-white' : 'text-neutral-500 hover:text-white'
            }`}
          >
            {label}
          </button>
        ))}
        <button onClick={() => setUploadOpen(true)} className="ml-auto h-8 px-3 rounded-full bg-white/[0.06] hover:bg-white/10 text-[12.5px] flex items-center gap-1.5 cursor-pointer">
          <Upload className="w-3.5 h-3.5" /> Upload clip
        </button>
      </div>

      <div key={tab} className="animate-fade-in">
        {tab === 'library' && <LibraryTab clips={all} onRemix={onRemix} onReport={setReport} />}
        {tab === 'collections' && <CollectionsTab clips={all} onRemix={onRemix} onReport={setReport} />}
        {tab === 'uploads' && <UploadsTab onRemix={onRemix} onUpload={() => setUploadOpen(true)} />}
      </div>

      {uploadOpen && (
        <UploadModal
          onClose={() => setUploadOpen(false)}
          onDone={() => {
            setUploadOpen(false);
            setTab('uploads');
          }}
        />
      )}
      {report && <ReportModal clip={report} onClose={() => setReport(null)} />}
    </div>
  );
};

/* ============================================================
 * Library tab
 * ============================================================ */

const LibraryTab: React.FC<{ clips: Clip[]; onRemix: (c: Clip) => void; onReport: (c: Clip) => void }> = ({ clips, onRemix, onReport }) => {
  const [q, setQ] = useState('');
  const [query, setQuery] = useState<ClipQuery>({ sort: 'trending' });
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const f = useMemo(() => facets(clips), [clips]);

  // debounce text search; skeleton on first paint
  useEffect(() => {
    const t = setTimeout(() => setQuery((x) => ({ ...x, q })), 180);
    return () => clearTimeout(t);
  }, [q]);
  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 450);
    return () => clearTimeout(t);
  }, []);

  const results = useMemo(() => searchClips(clips.filter((c) => c.visibility === 'public'), query), [clips, query]);
  const hero = useMemo(() => searchClips(clips.filter((c) => c.source === 'preset'), { sort: 'trending' }).slice(0, 5), [clips]);
  const toggle = (k: 'genre' | 'mood' | 'setting' | 'duration', v: string) =>
    setQuery((x) => {
      const cur = (x[k] as string[] | undefined) || [];
      return { ...x, [k]: cur.includes(v) ? cur.filter((y) => y !== v) : [...cur, v] };
    });
  const togglePeople = (n: number) => setQuery((x) => ({ ...x, people: x.people?.includes(n) ? x.people.filter((p) => p !== n) : [...(x.people || []), n] }));
  const active = (query.genre?.length || 0) + (query.mood?.length || 0) + (query.setting?.length || 0) + (query.people?.length || 0) + (query.duration?.length || 0);

  return (
    <>
      {/* Hero */}
      <section className="px-5 pt-8 pb-6 flex flex-col items-center text-center">
        {hero.length > 0 && (
        <div className="relative h-[170px] sm:h-[210px] w-full max-w-[560px] mb-5" aria-hidden="true">
          {hero.map((c, i) => {
            const off = i - Math.floor(hero.length / 2);
            return (
              <div
                key={c.id}
                className="theme-dark absolute top-1/2 left-1/2 w-[96px] h-[150px] sm:w-[120px] sm:h-[186px] rounded-xl overflow-hidden border-2 border-white/80 shadow-2xl bg-surface animate-fan-in"
                style={{
                  transform: `translate(calc(-50% + ${off * 74}px), -50%) rotate(${off * 5}deg)`,
                  zIndex: 10 - Math.abs(off),
                  animationDelay: `${i * 80}ms`,
                }}
              >
                <ClipMedia clip={c} className="w-full h-full object-cover" />
              </div>
            );
          })}
        </div>
        )}
        <h1 className="text-[28px] sm:text-[42px] font-black uppercase tracking-tight leading-none">Recast any scene</h1>
        <p className="mt-2 text-[13.5px] text-neutral-400 max-w-lg">Pick a moment, choose which of your AI influencers plays each part, and generate it in seconds.</p>
      </section>

      {/* Search + find-a-scene */}
      <div className="px-5 grid gap-2 md:grid-cols-[1fr_auto]">
        <label className="flex items-center gap-2 h-11 px-3.5 rounded-xl bg-surface border border-white/[0.06] focus-within:border-white/20 transition-colors">
          <Search className="w-4 h-4 text-neutral-500" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search titles, tags — or a line someone says"
            className="flex-1 bg-transparent text-[14px] focus:outline-none"
          />
          {q && (
            <button onClick={() => setQ('')} className="text-neutral-500 hover:text-white cursor-pointer" aria-label="Clear search">
              <X className="w-4 h-4" />
            </button>
          )}
        </label>
        <FindScene />
      </div>

      {/* Filters + sort */}
      <div className="sticky top-[41px] z-10 bg-canvas/90 backdrop-blur px-5 pt-3 pb-2">
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => setFiltersOpen(!filtersOpen)}
            aria-expanded={filtersOpen}
            className={`h-8 px-3 rounded-full text-[12.5px] flex items-center gap-1.5 cursor-pointer transition-colors duration-150 ${active ? 'bg-[#d1fe17] text-black' : 'bg-white/[0.06] text-neutral-300 hover:bg-white/10'}`}
          >
            <SlidersHorizontal className="w-3.5 h-3.5" /> Filters{active ? ` · ${active}` : ''}
            <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${filtersOpen ? 'rotate-180' : ''}`} />
          </button>
          {GENRES.map((g) => (
            <Chip key={g} on={!!query.genre?.includes(g)} onClick={() => toggle('genre', g)}>
              {g}
            </Chip>
          ))}
          <div className="ml-auto flex p-0.5 rounded-full bg-white/[0.06]">
            {(
              [
                ['trending', 'Trending'],
                ['latest', 'Latest'],
                ['most_remixed', 'Most remixed'],
              ] as [SortKey, string][]
            ).map(([s, l]) => (
              <button
                key={s}
                onClick={() => setQuery((x) => ({ ...x, sort: s }))}
                className={`h-7 px-3 rounded-full text-[12px] transition-colors duration-150 cursor-pointer ${query.sort === s ? 'bg-white/15 text-white' : 'text-neutral-500'}`}
              >
                {l}
              </button>
            ))}
          </div>
        </div>
        {/* accordion */}
        <div className={`grid transition-[grid-template-rows,opacity] duration-300 ease-out ${filtersOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}>
          <div className="overflow-hidden">
            <div className="pt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <FilterGroup label="Mood">
                {f.mood.map((m) => (
                  <Chip key={m} on={!!query.mood?.includes(m)} onClick={() => toggle('mood', m)}>
                    {m}
                  </Chip>
                ))}
              </FilterGroup>
              <FilterGroup label="Setting">
                {f.setting.map((m) => (
                  <Chip key={m} on={!!query.setting?.includes(m)} onClick={() => toggle('setting', m)}>
                    {m}
                  </Chip>
                ))}
              </FilterGroup>
              <FilterGroup label="People">
                {[1, 2, 3, 4].map((n) => (
                  <Chip key={n} on={!!query.people?.includes(n)} onClick={() => togglePeople(n)}>
                    {n === 4 ? '4+' : n}
                  </Chip>
                ))}
              </FilterGroup>
              <FilterGroup label="Duration">
                {DURATIONS.map((d) => (
                  <Chip key={d.id} on={!!query.duration?.includes(d.id)} onClick={() => toggle('duration', d.id)}>
                    {d.label}
                  </Chip>
                ))}
              </FilterGroup>
            </div>
            {active > 0 && (
              <button onClick={() => setQuery({ sort: query.sort, q: query.q })} className="mt-2 text-[12px] text-neutral-400 hover:text-white cursor-pointer">
                Clear filters
              </button>
            )}
          </div>
        </div>
      </div>

      {loading ? (
        <SkeletonGrid />
      ) : clips.length === 0 ? (
        <div className="text-center py-20 text-neutral-500 text-sm">
          New scenes are on the way. Meanwhile, <span className="text-white">upload your own clip</span> to recast it.
        </div>
      ) : results.length === 0 ? (
        <div className="text-center py-20 text-neutral-500 text-sm">
          No scenes match. Try another line or clear filters — or <span className="text-white">upload your own clip</span>.
        </div>
      ) : (
        <div key={JSON.stringify(query)} className="px-5 pt-2 columns-2 md:columns-3 xl:columns-4 gap-3 animate-fade-in">
          {results.map((c) => (
            <ClipCard key={c.id} clip={c} onRemix={onRemix} onReport={onReport} />
          ))}
        </div>
      )}
    </>
  );
};

const Chip: React.FC<{ on: boolean; onClick: () => void; children: React.ReactNode }> = ({ on, onClick, children }) => (
  <button
    onClick={onClick}
    aria-pressed={on}
    className={`h-8 px-3 rounded-full text-[12.5px] capitalize transition-colors duration-200 cursor-pointer ${on ? 'bg-[#d1fe17] text-black' : 'bg-white/[0.06] text-neutral-300 hover:bg-white/10'}`}
  >
    {children}
  </button>
);

const FilterGroup: React.FC<{ label: string; children: React.ReactNode }> = ({ label, children }) => (
  <div>
    <div className="text-[11px] uppercase tracking-wide text-neutral-500 mb-1.5">{label}</div>
    <div className="flex flex-wrap gap-1.5">{children}</div>
  </div>
);

const SkeletonGrid = () => (
  <div className="px-5 pt-2 columns-2 md:columns-3 xl:columns-4 gap-3">
    {[260, 340, 220, 300, 380, 240, 320, 280].map((h, i) => (
      <div key={i} className="mb-3 break-inside-avoid rounded-xl shimmer" style={{ height: h }} />
    ))}
  </div>
);

/** One-click searches on the external clip site (opens in a new tab). */
const QUICK_SHOWS = ['Selling Sunset', 'Suits', 'Shark Tank'];

const FindScene = () => {
  const [q, setQ] = useState('');
  const go = () => q.trim() && window.open(findSceneUrl(q), '_blank', 'noopener,noreferrer');
  return (
    <div className="flex flex-col">
      <div className="flex h-11 rounded-xl bg-surface border border-white/[0.06] overflow-hidden">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && go()}
          placeholder="Find a scene elsewhere…"
          className="w-full md:w-52 px-3 bg-transparent text-[13px] focus:outline-none"
          aria-label="Find a scene on an external site"
        />
        <button onClick={go} disabled={!q.trim()} className="px-3 text-[12.5px] flex items-center gap-1 text-neutral-300 hover:text-white disabled:opacity-40 cursor-pointer border-l border-white/[0.06]">
          Search <ExternalLink className="w-3.5 h-3.5" />
        </button>
      </div>
      <div className="mt-1.5 flex flex-wrap gap-1.5" role="group" aria-label="Quick searches">
        {QUICK_SHOWS.map((show) => (
          <button
            key={show}
            onClick={() => window.open(findSceneUrl(show), '_blank', 'noopener,noreferrer')}
            className="h-7 px-2.5 rounded-full bg-white/[0.06] hover:bg-white/10 text-[11.5px] text-neutral-300 flex items-center gap-1 cursor-pointer"
          >
            {show} <ExternalLink className="w-3 h-3" />
          </button>
        ))}
      </div>
      <span className="mt-1 text-[10.5px] text-neutral-500">Opens in a new tab. Downloaded clips must be ones you have rights to use.</span>
    </div>
  );
};

/* ============================================================
 * Card with hover-intent reveal
 * ============================================================ */

const ClipCard: React.FC<{ clip: Clip; onRemix: (c: Clip) => void; onReport: (c: Clip) => void; extra?: React.ReactNode }> = ({ clip, onRemix, onReport, extra }) => {
  const store = useSceneStore();
  const [hover, setHover] = useState(false);
  const [saveOpen, setSaveOpen] = useState(false);
  const timer = useRef<number>();
  const liked = store.likes.includes(clip.id);
  const saved = store.collections.some((c) => c.clip_ids.includes(clip.id));
  const [w, h] = clip.aspect.split(':').map(Number);
  const show = hover || saveOpen;

  return (
    <div
      onMouseEnter={() => (timer.current = window.setTimeout(() => setHover(true), 150))}
      onMouseLeave={() => (clearTimeout(timer.current), setHover(false))}
      onFocus={() => setHover(true)}
      className="theme-dark mb-3 break-inside-avoid relative rounded-xl overflow-hidden bg-surface transition-transform duration-200 ease-out hover:scale-[1.02] hover:z-10 hover:shadow-2xl"
    >
      <div style={{ aspectRatio: `${w}/${h}` }} className="overflow-hidden">
        <ClipMedia clip={clip} className="w-full h-full object-cover" />
      </div>
      <div className="absolute top-2 left-2 flex gap-1">
        <span className="h-6 px-2 rounded-full bg-black/60 text-[10.5px] text-white flex items-center gap-1">
          <Users className="w-3 h-3" /> {clip.people_count}
        </span>
        <span className="h-6 px-2 rounded-full bg-black/60 text-[10.5px] text-white">{Math.round(clip.duration_s)}s</span>
      </div>
      <div className={`absolute top-2 right-2 flex gap-1 transition-opacity duration-150 ${show ? 'opacity-100' : 'opacity-0'}`}>
        <button onClick={() => setSaveOpen(!saveOpen)} className="w-8 h-8 rounded-full bg-black/60 text-white flex items-center justify-center cursor-pointer" aria-label="Save to collection">
          <Bookmark className={`w-4 h-4 ${saved ? 'fill-[#d1fe17] text-[#d1fe17]' : ''}`} />
        </button>
        {clip.visibility === 'public' && (
          <button onClick={() => onReport(clip)} className="w-8 h-8 rounded-full bg-black/60 text-white flex items-center justify-center cursor-pointer" aria-label="Report clip">
            <Flag className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
      {saveOpen && <AddToCollection clipId={clip.id} onClose={() => setSaveOpen(false)} />}
      <div className={`absolute inset-0 bg-gradient-to-t from-black/85 via-black/10 to-transparent pointer-events-none transition-opacity duration-150 ${show ? 'opacity-100' : 'opacity-0'}`} />
      <div className={`absolute left-2 right-2 bottom-2 transition-all duration-200 ease-out ${show ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3 pointer-events-none'}`}>
        <div className="text-[13px] font-semibold text-white mb-0.5 truncate">{clip.title}</div>
        <div className="flex items-center gap-3 text-[11.5px] text-white/90 mb-2">
          <span className="flex items-center gap-1">
            <Repeat2 className="w-3.5 h-3.5" /> {fmt(clip.remix_count)}
          </span>
          <button onClick={() => toggleLike(clip.id)} className="flex items-center gap-1 cursor-pointer" aria-label="Like">
            <Heart className={`w-3.5 h-3.5 ${liked ? 'fill-red-500 text-red-500' : ''}`} /> {fmt(clip.like_count)}
          </button>
          {extra}
        </div>
        <button onClick={() => onRemix(clip)} className="w-full h-9 rounded-lg bg-[#d1fe17] text-black text-[12.5px] font-semibold flex items-center justify-center gap-1.5 cursor-pointer active:scale-[0.98]">
          <Repeat2 className="w-3.5 h-3.5" /> Remix
        </button>
      </div>
    </div>
  );
};

/* ============================================================
 * Add-to-collection popover
 * ============================================================ */

const AddToCollection: React.FC<{ clipId: string; onClose: () => void }> = ({ clipId, onClose }) => {
  const store = useSceneStore();
  const [q, setQ] = useState('');
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const off = (e: MouseEvent) => !ref.current?.contains(e.target as Node) && onClose();
    setTimeout(() => document.addEventListener('mousedown', off), 0);
    return () => document.removeEventListener('mousedown', off);
  }, [onClose]);
  const list = store.collections.filter((c) => c.name.toLowerCase().includes(q.toLowerCase()));
  const exact = store.collections.some((c) => c.name.toLowerCase() === q.trim().toLowerCase());
  return (
    <div ref={ref} className="absolute top-12 right-2 z-20 w-60 rounded-xl bg-neutral-900 border border-white/10 shadow-2xl p-2 animate-sheet-up text-white">
      <input autoFocus value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search or name a collection" className="w-full h-8 px-2.5 mb-1 rounded-lg bg-white/[0.07] text-[12.5px] focus:outline-none" />
      <div className="max-h-48 overflow-y-auto">
        {list.map((c) => {
          const on = c.clip_ids.includes(clipId);
          return (
            <button key={c.id} onClick={() => toggleInCollection(c.id, clipId)} className="w-full px-2 py-1.5 rounded-lg flex items-center gap-2 text-left text-[12.5px] hover:bg-white/[0.07] cursor-pointer">
              <span className="flex-1 truncate">{c.name}</span>
              <span className="text-neutral-500 text-[11px]">{c.clip_ids.length}</span>
              <Check className={`w-3.5 h-3.5 text-[#d1fe17] ${on ? '' : 'invisible'}`} />
            </button>
          );
        })}
      </div>
      {!exact && (
        <button
          onClick={() => {
            createCollection(q || 'New collection', clipId);
            toast('Saved to new collection');
            onClose();
          }}
          className="w-full mt-1 px-2 py-1.5 rounded-lg flex items-center gap-2 text-[12.5px] text-[#d1fe17] hover:bg-white/[0.07] cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" /> New collection{q.trim() ? ` “${q.trim()}”` : ''}
        </button>
      )}
    </div>
  );
};

/* ============================================================
 * Collections tab
 * ============================================================ */

const CollectionsTab: React.FC<{ clips: Clip[]; onRemix: (c: Clip) => void; onReport: (c: Clip) => void }> = ({ clips, onRemix, onReport }) => {
  const store = useSceneStore();
  const cols = [...store.collections].sort((a, b) => a.position - b.position);
  const [open, setOpen] = useState<string | null>(cols[0]?.id || null);
  const [editing, setEditing] = useState<string | null>(null);
  const byId = (id: string) => clips.find((c) => c.id === id);

  if (!cols.length)
    return (
      <div className="text-center py-24">
        <Bookmark className="w-6 h-6 mx-auto text-neutral-500 mb-3" />
        <div className="text-[15px] font-semibold">No collections yet</div>
        <p className="text-[13px] text-neutral-500 mt-1 mb-4">Tap the bookmark on any scene to start one.</p>
        <button onClick={() => createCollection('My scenes')} className="h-9 px-4 rounded-xl bg-white/[0.08] text-[13px] cursor-pointer">
          New collection
        </button>
      </div>
    );

  const active = cols.find((c) => c.id === open) || cols[0];
  return (
    <div className="px-5 pt-5 grid gap-5 lg:grid-cols-[260px_1fr]">
      <ul className="space-y-1.5">
        {cols.map((c, i) => {
          const cover = byId(c.cover_clip_id || '');
          return (
            <li key={c.id} className={`rounded-xl p-2 flex items-center gap-2 border transition-colors duration-150 ${c.id === active.id ? 'border-[#d1fe17]/60 bg-white/[0.04]' : 'border-transparent hover:bg-white/[0.03]'}`}>
              <button onClick={() => setOpen(c.id)} className="w-11 h-11 rounded-lg overflow-hidden bg-surface shrink-0 cursor-pointer">
                {cover && <ClipMedia clip={cover} still className="w-full h-full object-cover" />}
              </button>
              <div className="flex-1 min-w-0">
                {editing === c.id ? (
                  <input
                    autoFocus
                    defaultValue={c.name}
                    onBlur={(e) => (updateCollection(c.id, { name: e.target.value || c.name }), setEditing(null))}
                    onKeyDown={(e) => e.key === 'Enter' && (e.target as HTMLInputElement).blur()}
                    className="w-full h-7 px-1.5 rounded bg-white/[0.07] text-[13px] focus:outline-none"
                  />
                ) : (
                  <button onClick={() => setOpen(c.id)} className="block w-full text-left text-[13px] font-medium truncate cursor-pointer">
                    {c.name}
                  </button>
                )}
                <div className="text-[11px] text-neutral-500 flex items-center gap-1">
                  {c.clip_ids.length} clips {c.visibility === 'public' ? <Globe className="w-3 h-3" /> : <Lock className="w-3 h-3" />}
                </div>
              </div>
              <div className="flex flex-col">
                <button disabled={i === 0} onClick={() => moveCollection(c.id, -1)} className="p-0.5 text-neutral-500 hover:text-white disabled:opacity-20 cursor-pointer" aria-label="Move up">
                  <ArrowUp className="w-3.5 h-3.5" />
                </button>
                <button disabled={i === cols.length - 1} onClick={() => moveCollection(c.id, 1)} className="p-0.5 text-neutral-500 hover:text-white disabled:opacity-20 cursor-pointer" aria-label="Move down">
                  <ArrowDown className="w-3.5 h-3.5" />
                </button>
              </div>
            </li>
          );
        })}
        <li>
          <button onClick={() => setOpen(createCollection('New collection').id)} className="w-full h-10 rounded-xl border border-dashed border-white/15 text-[12.5px] text-neutral-400 hover:text-white flex items-center justify-center gap-1.5 cursor-pointer">
            <Plus className="w-3.5 h-3.5" /> New collection
          </button>
        </li>
      </ul>

      <section key={active.id} className="animate-fade-in">
        <div className="flex items-center gap-2 mb-3 flex-wrap">
          <h2 className="text-[18px] font-semibold mr-2">{active.name}</h2>
          <IconBtn label="Rename" onClick={() => setEditing(active.id)} icon={<Pencil className="w-3.5 h-3.5" />} />
          <IconBtn
            label="Share"
            onClick={async () => {
              const url = shareCollection(active.id);
              try {
                await navigator.clipboard.writeText(url);
              } catch {}
              toast('Share link copied');
            }}
            icon={<Share2 className="w-3.5 h-3.5" />}
          />
          <IconBtn
            label={active.visibility === 'public' ? 'Make private' : 'Make public'}
            onClick={() => updateCollection(active.id, { visibility: active.visibility === 'public' ? 'private' : 'public' })}
            icon={active.visibility === 'public' ? <Lock className="w-3.5 h-3.5" /> : <Globe className="w-3.5 h-3.5" />}
          />
          <IconBtn label="Delete" onClick={() => (deleteCollection(active.id), setOpen(null))} icon={<Trash2 className="w-3.5 h-3.5" />} />
        </div>
        {active.clip_ids.length === 0 ? (
          <p className="text-[13px] text-neutral-500 py-12 text-center">Empty. Save scenes here from the library.</p>
        ) : (
          <div className="columns-2 md:columns-3 gap-3">
            {active.clip_ids.map((id, i) => {
              const c = byId(id);
              if (!c) return null;
              return (
                <ClipCard
                  key={id}
                  clip={c}
                  onRemix={onRemix}
                  onReport={onReport}
                  extra={
                    <span className="ml-auto flex gap-0.5">
                      <button
                        disabled={i === 0}
                        onClick={() => {
                          const ids = [...active.clip_ids];
                          [ids[i - 1], ids[i]] = [ids[i], ids[i - 1]];
                          updateCollection(active.id, { clip_ids: ids });
                        }}
                        className="p-1 disabled:opacity-30 cursor-pointer"
                        aria-label="Move earlier"
                      >
                        <ArrowUp className="w-3.5 h-3.5" />
                      </button>
                      <button onClick={() => updateCollection(active.id, { cover_clip_id: id })} className={`p-1 cursor-pointer ${active.cover_clip_id === id ? 'text-[#d1fe17]' : ''}`} aria-label="Set as cover">
                        <Bookmark className="w-3.5 h-3.5" />
                      </button>
                    </span>
                  }
                />
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
};

const IconBtn: React.FC<{ label: string; icon: React.ReactNode; onClick: () => void }> = ({ label, icon, onClick }) => (
  <button onClick={onClick} className="h-8 px-2.5 rounded-lg bg-white/[0.06] hover:bg-white/10 text-[12px] flex items-center gap-1.5 cursor-pointer">
    {icon} {label}
  </button>
);

/* ============================================================
 * My Uploads tab
 * ============================================================ */

const BADGE: Record<string, { label: string; cls: string; icon: React.ReactNode }> = {
  private: { label: 'Private', cls: 'bg-white/10 text-white', icon: <Lock className="w-3 h-3" /> },
  pending: { label: 'Pending review', cls: 'bg-amber-400/90 text-black', icon: <Clock className="w-3 h-3" /> },
  public: { label: 'Public', cls: 'bg-[#d1fe17] text-black', icon: <Globe className="w-3 h-3" /> },
};

const UploadsTab: React.FC<{ onRemix: (c: Clip) => void; onUpload: () => void }> = ({ onRemix, onUpload }) => {
  const { uploads } = useSceneStore();
  if (!uploads.length)
    return (
      <div className="text-center py-24">
        <Upload className="w-6 h-6 mx-auto text-neutral-500 mb-3" />
        <div className="text-[15px] font-semibold">No uploads yet</div>
        <p className="text-[13px] text-neutral-500 mt-1 mb-4">Upload a 4–30s MP4 or MOV you own. It stays private unless you publish it.</p>
        <button onClick={onUpload} className="h-9 px-4 rounded-xl bg-[#d1fe17] text-black text-[13px] font-semibold cursor-pointer">
          Upload clip
        </button>
      </div>
    );
  return (
    <div className="px-5 pt-5 grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3">
      {uploads.map((u) => {
        const b = BADGE[u.visibility] || BADGE.private;
        return (
          <div key={u.id} className="rounded-xl bg-surface border border-white/[0.06] overflow-hidden">
            <div className="theme-dark relative aspect-[9/12] bg-black">
              <ClipMedia clip={u} className="w-full h-full object-cover" />
              <span className={`absolute top-2 left-2 h-6 px-2 rounded-full text-[10.5px] font-semibold flex items-center gap-1 ${b.cls}`}>
                {b.icon} {b.label}
              </span>
            </div>
            <div className="p-2.5 space-y-2">
              <div className="text-[13px] font-medium truncate">{u.title}</div>
              <div className="text-[11px] text-neutral-500 flex items-center gap-1">
                <ShieldCheck className="w-3 h-3" /> Rights attested {new Date(u.rights_attested_at!).toLocaleDateString()}
              </div>
              <div className="flex gap-1.5">
                <button onClick={() => onRemix(u)} className="flex-1 h-8 rounded-lg bg-[#d1fe17] text-black text-[12px] font-semibold cursor-pointer">
                  Remix
                </button>
                {u.visibility === 'private' ? (
                  <button onClick={() => (requestPublish(u.id), toast('Submitted for review'))} className="h-8 px-2.5 rounded-lg bg-white/[0.07] text-[12px] cursor-pointer">
                    Publish
                  </button>
                ) : (
                  <button onClick={() => makePrivate(u.id)} className="h-8 px-2.5 rounded-lg bg-white/[0.07] text-[12px] cursor-pointer">
                    {u.visibility === 'pending' ? 'Withdraw' : 'Unpublish'}
                  </button>
                )}
                <button onClick={() => deleteUpload(u.id)} className="h-8 w-8 rounded-lg bg-white/[0.07] flex items-center justify-center cursor-pointer" aria-label="Delete upload">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

/* ============================================================
 * Upload modal (attestation first)
 * ============================================================ */

const UploadModal: React.FC<{ onClose: () => void; onDone: () => void }> = ({ onClose, onDone }) => {
  const [attested, setAttested] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [meta, setMeta] = useState<{ url: string; duration: number; aspect: string; poster: string | null; sha: string } | null>(null);
  const [title, setTitle] = useState('');
  const [people, setPeople] = useState(1);
  const [genre, setGenre] = useState<string[]>([]);
  const [transcript, setTranscript] = useState('');
  const [errors, setErrors] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);
  const input = useRef<HTMLInputElement>(null);

  const pick = async (f: File) => {
    setBusy(true);
    setErrors([]);
    const url = URL.createObjectURL(f);
    const [p, sha] = await Promise.all([probeVideo(url), sha256(f)]);
    const errs = validateUpload({ type: f.type, size: f.size, duration_s: p.duration, attested: true, sha256: sha, blocked: BLOCKED_HASHES });
    setBusy(false);
    if (errs.length) {
      URL.revokeObjectURL(url);
      setErrors(errs);
      return;
    }
    setFile(f);
    setTitle(f.name.replace(/\.[^.]+$/, '').slice(0, 80));
    setMeta({ url, duration: p.duration, aspect: p.aspect, poster: p.poster, sha });
  };

  const save = () => {
    if (!meta || !attested) return;
    addUpload({ title, url: meta.url, poster: meta.poster, duration: Math.round(meta.duration * 10) / 10, aspect: meta.aspect, sha256: meta.sha, people, genre, transcript });
    toast('Uploaded — private to you');
    onDone();
  };

  return (
    <div className="fixed inset-0 z-[70] bg-black/70 flex items-end sm:items-center justify-center" onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()} className="w-full sm:max-w-lg max-h-[92vh] overflow-y-auto rounded-t-2xl sm:rounded-2xl bg-base border border-white/10 p-5 animate-sheet-up space-y-4">
        <div className="flex items-start">
          <div className="flex-1">
            <h2 className="text-[17px] font-bold">Upload a clip</h2>
            <p className="text-[12.5px] text-neutral-400">MP4 or MOV, {LIMITS.minSeconds}–{LIMITS.maxSeconds}s. Private by default; publishing needs review.</p>
          </div>
          <button onClick={onClose} className="p-1 text-neutral-400 hover:text-white cursor-pointer" aria-label="Close">
            <X className="w-5 h-5" />
          </button>
        </div>

        <label className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-colors ${attested ? 'border-[#d1fe17]/60 bg-[#d1fe17]/5' : 'border-white/10'}`}>
          <input type="checkbox" checked={attested} onChange={(e) => setAttested(e.target.checked)} className="mt-0.5 accent-[#d1fe17] w-4 h-4" />
          <span className="text-[13px]">
            <span className="font-semibold">{RIGHTS_STATEMENT}</span>
            <span className="block text-[11.5px] text-neutral-500 mt-0.5">We store this statement with the upload. Clips that match known copyrighted content are blocked.</span>
          </span>
        </label>

        {!meta ? (
          <button
            disabled={!attested || busy}
            onClick={() => input.current?.click()}
            className="w-full h-28 rounded-xl border border-dashed border-white/15 bg-surface flex flex-col items-center justify-center gap-1.5 text-[13px] disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed"
          >
            <Upload className="w-5 h-5" />
            {busy ? 'Checking clip…' : attested ? 'Choose a video' : 'Tick the statement above first'}
          </button>
        ) : (
          <div className="flex gap-3">
            <video src={meta.url} muted autoPlay loop playsInline className="w-28 rounded-lg bg-black object-cover" />
            <div className="flex-1 text-[12px] text-neutral-400 space-y-0.5">
              <div className="text-white text-[13px] font-medium truncate">{file?.name}</div>
              <div>
                {meta.duration.toFixed(1)}s · {meta.aspect}
              </div>
              <div className="truncate">sha256 {meta.sha.slice(0, 16)}…</div>
              <button onClick={() => (URL.revokeObjectURL(meta.url), setMeta(null), setFile(null))} className="text-neutral-300 hover:text-white underline cursor-pointer">
                Choose another
              </button>
            </div>
          </div>
        )}
        <input
          ref={input}
          type="file"
          accept="video/mp4,video/quicktime,.mp4,.mov"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            e.target.value = '';
            if (f) pick(f);
          }}
        />
        {errors.length > 0 && (
          <ul className="rounded-xl bg-red-500/10 border border-red-500/30 p-3 text-[12.5px] text-red-300 space-y-1">
            {errors.map((e) => (
              <li key={e}>{e}</li>
            ))}
          </ul>
        )}

        {meta && (
          <div className="space-y-3">
            <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Title" className="w-full h-10 px-3 rounded-xl bg-surface border border-white/[0.06] text-[13.5px] focus:outline-none" />
            <div>
              <div className="text-[11px] uppercase tracking-wide text-neutral-500 mb-1.5">People in the clip</div>
              <div className="flex gap-1.5">
                {[1, 2, 3, 4, 5].map((n) => (
                  <Chip key={n} on={people === n} onClick={() => setPeople(n)}>
                    {n}
                  </Chip>
                ))}
              </div>
            </div>
            <div>
              <div className="text-[11px] uppercase tracking-wide text-neutral-500 mb-1.5">Genre</div>
              <div className="flex flex-wrap gap-1.5">
                {GENRES.map((g) => (
                  <Chip key={g} on={genre.includes(g)} onClick={() => setGenre(genre.includes(g) ? genre.filter((x) => x !== g) : [...genre, g])}>
                    {g}
                  </Chip>
                ))}
              </div>
            </div>
            <textarea value={transcript} onChange={(e) => setTranscript(e.target.value)} rows={2} placeholder="Key line (optional) — makes it searchable" className="w-full px-3 py-2 rounded-xl bg-surface border border-white/[0.06] text-[13px] resize-none focus:outline-none" />
          </div>
        )}

        <button onClick={save} disabled={!meta || !attested} className="w-full h-11 rounded-xl bg-[#d1fe17] text-black font-semibold text-[14px] disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed">
          Save privately
        </button>
      </div>
    </div>
  );
};

/* ============================================================
 * Report (DMCA) modal
 * ============================================================ */

export const ReportModal: React.FC<{ clip?: Clip; targetLabel?: string; targetId?: string; onClose: () => void }> = ({ clip, targetLabel, targetId, onClose }) => {
  const [reason, setReason] = useState('copyright');
  const [details, setDetails] = useState('');
  const [email, setEmail] = useState('');
  const target = clip ? `clip:${clip.id}` : `remix:${targetId}`;
  return (
    <div className="fixed inset-0 z-[80] bg-black/70 flex items-center justify-center p-4" onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()} className="w-full max-w-md rounded-2xl bg-base border border-white/10 p-5 animate-sheet-up space-y-3">
        <h2 className="text-[16px] font-bold">Report {clip ? `“${clip.title}”` : targetLabel || 'this remix'}</h2>
        <div className="grid grid-cols-2 gap-1.5">
          {(
            [
              ['copyright', 'Copyright (DMCA)'],
              ['likeness', 'Uses a real person'],
              ['harmful', 'Harmful content'],
              ['other', 'Other'],
            ] as const
          ).map(([id, l]) => (
            <button key={id} onClick={() => setReason(id)} className={`h-9 rounded-lg text-[12.5px] cursor-pointer ${reason === id ? 'bg-[#d1fe17] text-black font-semibold' : 'bg-white/[0.06]'}`}>
              {l}
            </button>
          ))}
        </div>
        {reason === 'copyright' && (
          <p className="text-[11.5px] text-neutral-400">
            Include the copyrighted work, your contact details and a statement that you are the owner or authorised to act for them. We remove infringing clips and remixes promptly.
          </p>
        )}
        <textarea value={details} onChange={(e) => setDetails(e.target.value)} rows={4} placeholder="Details" className="w-full px-3 py-2 rounded-xl bg-surface border border-white/[0.06] text-[13px] resize-none focus:outline-none" />
        <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Contact email" type="email" className="w-full h-10 px-3 rounded-xl bg-surface border border-white/[0.06] text-[13px] focus:outline-none" />
        <div className="flex gap-2 justify-end">
          <button onClick={onClose} className="h-10 px-4 rounded-xl bg-white/[0.06] text-[13px] cursor-pointer">
            Cancel
          </button>
          <button
            disabled={!details.trim() || (reason === 'copyright' && !email.trim())}
            onClick={() => {
              fileReport(target, reason);
              fetch('/api/scenes/reports', {
                method: 'POST',
                headers: { 'content-type': 'application/json' },
                body: JSON.stringify({ target_type: clip ? 'clip' : 'remix', target_id: clip?.id || targetId, reason, details, reporter_email: email }),
              }).catch(() => {});
              toast('Report sent. Thanks.');
              onClose();
            }}
            className="h-10 px-4 rounded-xl bg-red-500/90 text-white text-[13px] font-semibold disabled:opacity-40 cursor-pointer"
          >
            Send report
          </button>
        </div>
      </div>
    </div>
  );
};
