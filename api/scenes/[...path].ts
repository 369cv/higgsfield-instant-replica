/**
 * Scene Remix API (Vercel function, catch-all).
 *
 *   GET    /api/scenes/clips?q=&genre=&mood=&setting=&people=&duration=&sort=   search + filters
 *   POST   /api/scenes/clips                    create user upload (requires rights attestation)
 *   GET    /api/scenes/clips/:id
 *   PATCH  /api/scenes/clips/:id                owner edits; {visibility:'public'} -> 'pending' (review)
 *   DELETE /api/scenes/clips/:id                owner soft-delete
 *   POST   /api/scenes/clips/:id/like
 *   POST   /api/scenes/detect                   {clip_id} -> {people:[{index,x,y}], method}
 *   POST   /api/scenes/estimate                 {clip_id, model, quality, cast, object_refs, styled}
 *   GET    /api/scenes/collections              POST create · PATCH/DELETE /:id · POST /reorder {ids}
 *   GET    /api/scenes/remixes                  POST create job · GET /:id (status/progress/output)
 *   POST   /api/scenes/reports                  DMCA / abuse report on a clip or remix
 *
 * Identity: `x-user-id` header until real auth lands (TODO: replace with session lookup).
 */
import { repo } from './_repo';
import {
  Clip,
  Collection,
  Remix,
  CastEntry,
  Quality,
  searchClips,
  validateUpload,
  canRemix,
  castComplete,
  placeholderPeople,
  estimateSceneCredits,
  buildProvenance,
  castPrompt,
  RIGHTS_STATEMENT,
  LIMITS,
  uid,
} from '../../src/features/scenes/logic';

type Req = { method?: string; query: Record<string, string | string[]>; headers: Record<string, string | undefined>; body?: any };
type Res = { status(n: number): Res; json(b: unknown): void; setHeader(k: string, v: string): void; end(): void };

const list = (v?: string | string[]) => (Array.isArray(v) ? v : v ? v.split(',') : []).filter(Boolean);
const STOCK_INFLUENCER = /^[a-z0-9-]+$/; // platform presets; user-made ids are checked against `influencers` once auth lands
const JOB_SECONDS = 20;

/** Stateless job progress until a real worker is wired (REMIX_WORKER_URL). */
function withProgress(r: Remix, clip?: Clip | null): Remix {
  if (r.status === 'done' || r.status === 'failed' || process.env.REMIX_WORKER_URL) return r;
  const p = Math.min(100, Math.round(((Date.now() - Date.parse(r.created_at)) / 1000 / JOB_SECONDS) * 100));
  return p >= 100
    ? { ...r, status: 'done', progress: 100, output_url: clip?.storage_url || clip?.poster_url || null }
    : { ...r, status: p > 0 ? 'running' : 'queued', progress: p };
}

export default async function handler(req: Req, res: Res) {
  res.setHeader('Cache-Control', 'no-store');
  const db = await repo();
  const user = (req.headers['x-user-id'] || 'anonymous').slice(0, 64);
  const parts = list(req.query.path as string[]).length ? (req.query.path as string[]) : [];
  const [resource, id, action] = parts;
  const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : req.body || {};
  const bad = (msg: string | string[], code = 400) => res.status(code).json({ error: Array.isArray(msg) ? msg : [msg] });

  try {
    /* ---------- clips ---------- */
    if (resource === 'clips' && !id && req.method === 'GET') {
      const clips = searchClips(await db.listClips(user), {
        q: (req.query.q as string) || '',
        genre: list(req.query.genre),
        mood: list(req.query.mood),
        setting: list(req.query.setting),
        people: list(req.query.people).map(Number),
        duration: list(req.query.duration),
        sort: (req.query.sort as any) || 'trending',
      });
      return res.status(200).json({ clips, durable: db.durable });
    }

    if (resource === 'clips' && !id && req.method === 'POST') {
      const blocked = body.content_sha256 && (await db.isBlocked(body.content_sha256)) ? new Set([body.content_sha256]) : undefined;
      const errors = validateUpload({
        type: body.mime_type,
        size: Number(body.size || 0),
        duration_s: Number(body.duration_s || 0),
        attested: body.rights_attestation === RIGHTS_STATEMENT,
        sha256: body.content_sha256,
        blocked,
      });
      if (!body.storage_url) errors.push('Upload the file to storage first (storage_url missing).');
      if (errors.length) return bad(errors, blocked ? 451 : 400);
      const clip: Clip = {
        id: uid('clip'),
        title: String(body.title || 'Untitled clip').slice(0, 120),
        source: 'user_upload',
        owner_id: user,
        storage_url: body.storage_url,
        poster_url: body.poster_url || null,
        duration_s: Number(body.duration_s),
        aspect: body.aspect || '9:16',
        genre: list(body.genre),
        mood: list(body.mood),
        setting: list(body.setting),
        people_count: Math.min(LIMITS.maxPeople, Math.max(1, Number(body.people_count || 1))),
        people: [],
        transcript: body.transcript || null,
        tags: list(body.tags),
        license_note: 'User attested ownership or rights.',
        content_sha256: body.content_sha256 || null,
        rights_attested_at: new Date().toISOString(),
        rights_attestation: RIGHTS_STATEMENT,
        visibility: 'private', // uploads are private by default
        remix_count: 0,
        like_count: 0,
        created_at: new Date().toISOString(),
      };
      return res.status(201).json({ clip: await db.insertClip(clip) });
    }

    if (resource === 'clips' && id) {
      const clip = await db.getClip(id);
      if (!clip || (clip.visibility !== 'public' && clip.owner_id !== user)) return bad('Not found', 404);
      if (action === 'like' && req.method === 'POST') return res.status(200).json({ clip: await db.toggleLike(id, user) });
      if (req.method === 'GET') return res.status(200).json({ clip });
      if (clip.owner_id !== user) return bad('Only the owner can change this clip', 403);
      if (req.method === 'PATCH') {
        const patch: Partial<Clip> = {};
        for (const k of ['title', 'transcript'] as const) if (k in body) (patch as any)[k] = String(body[k] ?? '').slice(0, 500);
        for (const k of ['genre', 'mood', 'setting', 'tags'] as const) if (k in body) patch[k] = list(body[k]);
        if (body.visibility === 'public') patch.visibility = 'pending'; // publishing requires review
        if (body.visibility === 'private') patch.visibility = 'private';
        return res.status(200).json({ clip: await db.updateClip(id, patch) });
      }
      if (req.method === 'DELETE') {
        await db.updateClip(id, { visibility: 'removed' });
        return res.status(204).end();
      }
    }

    /* ---------- detection ---------- */
    if (resource === 'detect' && req.method === 'POST') {
      const clip = await db.getClip(body.clip_id);
      if (!clip) return bad('Not found', 404);
      if (clip.people.length) return res.status(200).json({ people: clip.people, method: 'annotated' });
      if (process.env.PERSON_DETECTOR_URL && clip.storage_url) {
        const r = await fetch(process.env.PERSON_DETECTOR_URL, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ video_url: clip.storage_url }) });
        const out = await r.json();
        const people = (out.people || []).slice(0, LIMITS.maxPeople).map((p: any, i: number) => ({ index: i + 1, x: +p.x, y: +p.y }));
        await db.updateClip(clip.id, { people, people_count: people.length });
        return res.status(200).json({ people, method: 'detector' });
      }
      return res.status(200).json({ people: placeholderPeople(clip.people_count), method: 'placeholder' });
    }

    /* ---------- estimate ---------- */
    if (resource === 'estimate' && req.method === 'POST') {
      const clip = await db.getClip(body.clip_id);
      if (!clip) return bad('Not found', 404);
      const credits = estimateSceneCredits({
        model: body.model,
        quality: body.quality as Quality,
        duration_s: clip.duration_s,
        cast: Number(body.cast || 0),
        objectRefs: Math.min(LIMITS.maxObjectRefs, Number(body.object_refs || 0)),
        styled: !!body.styled,
      });
      return res.status(200).json({ credits });
    }

    /* ---------- collections ---------- */
    if (resource === 'collections') {
      if (req.method === 'GET' && !id) return res.status(200).json({ collections: await db.listCollections(user) });
      if (req.method === 'POST' && id === 'reorder') {
        const mine = await db.listCollections(user);
        const ids: string[] = body.ids || [];
        await Promise.all(mine.map((c) => db.upsertCollection({ ...c, position: Math.max(0, ids.indexOf(c.id)) })));
        return res.status(200).json({ collections: await db.listCollections(user) });
      }
      if (req.method === 'POST' && !id) {
        const n = (await db.listCollections(user)).length;
        const c: Collection = {
          id: uid('col'),
          owner_id: user,
          name: String(body.name || 'New collection').slice(0, 80),
          description: String(body.description || '').slice(0, 500),
          cover_clip_id: body.clip_ids?.[0] || null,
          clip_ids: list(body.clip_ids),
          visibility: body.visibility === 'public' ? 'public' : 'private',
          position: n,
          share_token: null,
          created_at: new Date().toISOString(),
        };
        return res.status(201).json({ collection: await db.upsertCollection(c) });
      }
      const existing = (await db.listCollections(user)).find((c) => c.id === id);
      if (!existing) return bad('Not found', 404);
      if (req.method === 'PATCH') {
        const next: Collection = { ...existing };
        if ('name' in body) next.name = String(body.name).slice(0, 80);
        if ('description' in body) next.description = String(body.description).slice(0, 500);
        if ('clip_ids' in body) next.clip_ids = list(body.clip_ids);
        if ('visibility' in body) next.visibility = body.visibility === 'public' ? 'public' : 'private';
        if (body.share) next.share_token ||= uid('share');
        next.cover_clip_id = next.clip_ids.includes(existing.cover_clip_id || '') ? existing.cover_clip_id : next.clip_ids[0] || null;
        return res.status(200).json({ collection: await db.upsertCollection(next) });
      }
      if (req.method === 'DELETE') {
        await db.deleteCollection(id, user);
        return res.status(204).end();
      }
    }

    /* ---------- remixes ---------- */
    if (resource === 'remixes') {
      if (req.method === 'GET' && !id) {
        const rs = await db.listRemixes(user);
        return res.status(200).json({ remixes: await Promise.all(rs.map(async (r) => withProgress(r, await db.getClip(r.clip_id)))) });
      }
      if (req.method === 'GET' && id) {
        const r = await db.getRemix(id);
        if (!r || r.user_id !== user) return bad('Not found', 404);
        return res.status(200).json({ remix: withProgress(r, await db.getClip(r.clip_id)) });
      }
      if (req.method === 'POST' && !id) {
        const clip = await db.getClip(body.clip_id);
        if (!clip) return bad('Clip not found', 404);
        const allowed = canRemix(clip);
        if (!allowed.ok) return bad(allowed.reason, 403);
        if (clip.visibility !== 'public' && clip.owner_id !== user) return bad('Not found', 404);
        const cast: CastEntry[] = (body.character_map || []).map((e: any) => ({
          person_index: Number(e.person_index),
          influencer_id: e.keep ? null : e.influencer_id || null,
          keep: !!e.keep,
        }));
        if (!castComplete(clip.people_count, cast)) return bad('Cast every person, or mark them “keep”.');
        if (cast.some((e) => e.influencer_id && !STOCK_INFLUENCER.test(e.influencer_id))) return bad('Only your AI influencers can be cast.', 403);
        const objectRefs: string[] = list(body.object_refs).slice(0, LIMITS.maxObjectRefs);
        const quality: Quality = ['480p', '720p', '1080p'].includes(body.quality) ? body.quality : '720p';
        const model = body.model || 'remix-pro';
        const credits = estimateSceneCredits({ model, quality, duration_s: clip.duration_s, cast: cast.filter((c) => c.influencer_id).length, objectRefs: objectRefs.length, styled: !!body.style });
        const remix: Remix = {
          id: uid('rmx'),
          user_id: user,
          clip_id: clip.id,
          character_map: cast,
          object_refs: objectRefs,
          style: body.style || null,
          prompt: String(body.prompt || castPrompt(cast, (x) => x, objectRefs.length)).slice(0, 4000),
          model,
          quality,
          status: 'queued',
          progress: 0,
          output_url: null,
          watermarked: true,
          provenance: buildProvenance({ model, clip, cast }),
          credits,
          parent_remix_id: body.parent_remix_id || null,
          created_at: new Date().toISOString(),
        };
        await db.insertRemix(remix);
        if (process.env.REMIX_WORKER_URL) {
          // Worker renders, burns in the watermark and embeds the provenance manifest, then PATCHes status back.
          fetch(process.env.REMIX_WORKER_URL, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ remix, clip }) }).catch(() => {});
        }
        return res.status(202).json({ remix });
      }
    }

    /* ---------- reports ---------- */
    if (resource === 'reports' && req.method === 'POST') {
      if (!['clip', 'remix'].includes(body.target_type) || !body.target_id) return bad('target_type and target_id are required');
      if (!['copyright', 'likeness', 'harmful', 'other'].includes(body.reason)) return bad('Unknown reason');
      await db.insertReport({
        id: uid('rep'),
        target_type: body.target_type,
        target_id: String(body.target_id),
        reason: body.reason,
        details: String(body.details || '').slice(0, 4000),
        reporter_email: body.reporter_email || null,
        created_at: new Date().toISOString(),
      });
      return res.status(201).json({ ok: true });
    }

    return bad('Not found', 404);
  } catch (e: any) {
    console.error('[scenes]', e);
    return bad('Server error', 500);
  }
}
