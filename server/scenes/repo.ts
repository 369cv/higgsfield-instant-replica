/**
 * Scene Remix repository. Postgres when DATABASE_URL is set (run db/migrations first),
 * otherwise an in-memory store seeded with the preset clips (dev / preview only — not durable).
 */
import presetClips from '../../db/seed/preset-clips.json';
// Bundled as text by esbuild (--loader:.sql=text); applied automatically on first connect.
import schemaSql from '../../db/migrations/001_scene_remix.sql';
import type { Clip, Collection, Remix } from '../../src/features/scenes/logic';

export interface Report {
  id: string;
  target_type: 'clip' | 'remix';
  target_id: string;
  reason: string;
  details: string;
  reporter_email?: string | null;
  created_at: string;
}

export interface Repo {
  durable: boolean;
  listClips(viewer: string): Promise<Clip[]>;
  getClip(id: string): Promise<Clip | null>;
  insertClip(c: Clip): Promise<Clip>;
  updateClip(id: string, patch: Partial<Clip>): Promise<Clip | null>;
  toggleLike(id: string, user: string): Promise<Clip | null>;
  isBlocked(sha: string): Promise<boolean>;
  listCollections(owner: string): Promise<Collection[]>;
  upsertCollection(c: Collection): Promise<Collection>;
  deleteCollection(id: string, owner: string): Promise<void>;
  listRemixes(user: string): Promise<Remix[]>;
  getRemix(id: string): Promise<Remix | null>;
  insertRemix(r: Remix): Promise<Remix>;
  updateRemix(id: string, patch: Partial<Remix>): Promise<void>;
  insertReport(r: Report): Promise<void>;
}

/* ---------------- memory ---------------- */

function memoryRepo(): Repo {
  const g = globalThis as any;
  const s = (g.__sceneStore ||= {
    clips: (presetClips as unknown as Clip[]).map((c) => ({ ...c })),
    likes: new Set<string>(),
    collections: [] as Collection[],
    remixes: [] as Remix[],
    reports: [] as Report[],
    blocked: new Set<string>(),
  });
  return {
    durable: false,
    async listClips(viewer) {
      return s.clips.filter((c: Clip) => c.visibility === 'public' || c.owner_id === viewer);
    },
    async getClip(id) {
      return s.clips.find((c: Clip) => c.id === id) || null;
    },
    async insertClip(c) {
      s.clips.unshift(c);
      return c;
    },
    async updateClip(id, patch) {
      const c = s.clips.find((x: Clip) => x.id === id);
      if (!c) return null;
      Object.assign(c, patch);
      return c;
    },
    async toggleLike(id, user) {
      const c = s.clips.find((x: Clip) => x.id === id);
      if (!c) return null;
      const k = `${id}:${user}`;
      if (s.likes.has(k)) (s.likes.delete(k), c.like_count--);
      else (s.likes.add(k), c.like_count++);
      return c;
    },
    async isBlocked(sha) {
      return s.blocked.has(sha);
    },
    async listCollections(owner) {
      return s.collections.filter((c: Collection) => c.owner_id === owner).sort((a: Collection, b: Collection) => a.position - b.position);
    },
    async upsertCollection(c) {
      const i = s.collections.findIndex((x: Collection) => x.id === c.id);
      if (i >= 0) s.collections[i] = c;
      else s.collections.push(c);
      return c;
    },
    async deleteCollection(id, owner) {
      s.collections = s.collections.filter((c: Collection) => !(c.id === id && c.owner_id === owner));
    },
    async listRemixes(user) {
      return s.remixes.filter((r: Remix) => r.user_id === user);
    },
    async getRemix(id) {
      return s.remixes.find((r: Remix) => r.id === id) || null;
    },
    async insertRemix(r) {
      s.remixes.unshift(r);
      return r;
    },
    async updateRemix(id, patch) {
      const r = s.remixes.find((x: Remix) => x.id === id);
      if (r) Object.assign(r, patch);
    },
    async insertReport(r) {
      s.reports.push(r);
    },
  };
}

/* ---------------- postgres ---------------- */

async function pgRepo(url: string): Promise<Repo> {
  const { default: pg } = await import('pg');
  const g = globalThis as any;
  const pool: import('pg').Pool = (g.__scenePool ||= new pg.Pool({ connectionString: url, max: 3 }));
  const q = async <T = any>(sql: string, args: unknown[] = []) => (await pool.query(sql, args)).rows as T[];
  await (g.__sceneSchema ||= ensureSchema(pool));
  const cols = (o: Record<string, unknown>) => Object.keys(o);
  const json = (v: unknown) => (v !== null && typeof v === 'object' && !Array.isArray(v) ? JSON.stringify(v) : Array.isArray(v) && v.length && typeof v[0] === 'object' ? JSON.stringify(v) : v);
  const insert = async <T>(table: string, row: Record<string, unknown>) => {
    const k = cols(row);
    const rows = await q<T>(`INSERT INTO ${table} (${k.join(',')}) VALUES (${k.map((_, i) => `$${i + 1}`).join(',')}) RETURNING *`, k.map((x) => json(row[x])));
    return rows[0];
  };
  const update = async <T>(table: string, id: string, patch: Record<string, unknown>) => {
    const k = cols(patch).filter((x) => x !== 'id');
    if (!k.length) return (await q<T>(`SELECT * FROM ${table} WHERE id=$1`, [id]))[0] || null;
    const rows = await q<T>(`UPDATE ${table} SET ${k.map((x, i) => `${x}=$${i + 2}`).join(',')} WHERE id=$1 RETURNING *`, [id, ...k.map((x) => json(patch[x]))]);
    return rows[0] || null;
  };
  // drop the generated tsvector column; normalise numeric/timestamp types
  const clip = ({ search: _search, ...r }: any): Clip => ({ ...r, duration_s: Number(r.duration_s), created_at: new Date(r.created_at).toISOString() });

  return {
    durable: true,
    async listClips(viewer) {
      return (await q(`SELECT * FROM clips WHERE visibility='public' OR owner_id=$1`, [viewer])).map(clip);
    },
    async getClip(id) {
      const r = (await q(`SELECT * FROM clips WHERE id=$1`, [id]))[0];
      return r ? clip(r) : null;
    },
    async insertClip(c) {
      return clip(await insert('clips', c as any));
    },
    async updateClip(id, patch) {
      const r = await update<any>('clips', id, patch as any);
      return r ? clip(r) : null;
    },
    async toggleLike(id, user) {
      const del = await q(`DELETE FROM clip_likes WHERE clip_id=$1 AND user_id=$2 RETURNING 1`, [id, user]);
      if (!del.length) await q(`INSERT INTO clip_likes (clip_id,user_id) VALUES ($1,$2) ON CONFLICT DO NOTHING`, [id, user]);
      const r = (await q(`UPDATE clips SET like_count = like_count + $2 WHERE id=$1 RETURNING *`, [id, del.length ? -1 : 1]))[0];
      return r ? clip(r) : null;
    },
    async isBlocked(sha) {
      return (await q(`SELECT 1 FROM blocked_content WHERE sha256=$1`, [sha])).length > 0;
    },
    async listCollections(owner) {
      return q(`SELECT * FROM collections WHERE owner_id=$1 ORDER BY position, created_at`, [owner]);
    },
    async upsertCollection(c) {
      const exists = (await q(`SELECT 1 FROM collections WHERE id=$1`, [c.id])).length;
      return exists ? (await update<Collection>('collections', c.id, c as any))! : insert<Collection>('collections', c as any);
    },
    async deleteCollection(id, owner) {
      await q(`DELETE FROM collections WHERE id=$1 AND owner_id=$2`, [id, owner]);
    },
    async listRemixes(user) {
      return q(`SELECT * FROM remixes WHERE user_id=$1 ORDER BY created_at DESC LIMIT 200`, [user]);
    },
    async getRemix(id) {
      return (await q<Remix>(`SELECT * FROM remixes WHERE id=$1`, [id]))[0] || null;
    },
    async insertRemix(r) {
      const row = await insert<Remix>('remixes', r as any);
      await q(`UPDATE clips SET remix_count = remix_count + 1 WHERE id=$1`, [r.clip_id]);
      return row;
    },
    async updateRemix(id, patch) {
      await update('remixes', id, patch as any);
    },
    async insertReport(r) {
      await insert('reports', r as any);
    },
  };
}

/**
 * Self-provisioning: if the clips table is missing, apply the migration and seed the presets.
 * An advisory lock keeps concurrent cold starts from racing. Safe to run against an existing DB.
 */
async function ensureSchema(pool: import('pg').Pool) {
  const c = await pool.connect();
  try {
    await c.query('SELECT pg_advisory_lock(727001)');
    const exists = (await c.query("SELECT to_regclass('public.clips') AS t")).rows[0].t;
    if (!exists) {
      await c.query(schemaSql);
      console.log('[scenes] schema created');
    }
    // Presets mirror db/seed/preset-clips.json: insert any new ones, retire ones that were removed
    // (hidden, not deleted, so existing remixes of them keep working).
    const seed = presetClips as unknown as Clip[];
    {
      for (const p of seed) {
        await c.query(
          `INSERT INTO clips (id,title,source,owner_id,storage_url,poster_url,duration_s,aspect,genre,mood,setting,
             people_count,people,transcript,tags,license_note,visibility,remix_count,like_count,created_at)
           VALUES ($1,$2,'preset','platform',$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,'public',$15,$16,$17)
           ON CONFLICT (id) DO NOTHING`,
          [p.id, p.title, p.storage_url, p.poster_url, p.duration_s, p.aspect, p.genre, p.mood, p.setting,
           p.people_count, JSON.stringify(p.people), p.transcript, p.tags, p.license_note, p.remix_count, p.like_count, p.created_at]
        );
      }
      const retired = await c.query(
        `UPDATE clips SET visibility='removed'
           WHERE source='preset' AND visibility <> 'removed' AND NOT (id = ANY($1::text[]))`,
        [seed.map((p) => p.id)]
      );
      if (retired.rowCount) console.log(`[scenes] retired ${retired.rowCount} preset clips`);
    }
  } finally {
    await c.query('SELECT pg_advisory_unlock(727001)').catch(() => {});
    c.release();
  }
}

let cached: Promise<Repo> | null = null;
export function repo(): Promise<Repo> {
  const url = process.env.DATABASE_URL;
  cached ||= (url ? pgRepo(url) : Promise.resolve(memoryRepo())).catch((e) => {
    cached = null;
    (globalThis as any).__sceneSchema = undefined;
    throw e;
  });
  return cached;
}
