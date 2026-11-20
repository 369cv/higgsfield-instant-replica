// Seed the 12 placeholder preset clips.
// Usage: DATABASE_URL=postgres://... node db/seed/seed.mjs
import { readFileSync } from 'fs';
import pg from 'pg';

const clips = JSON.parse(readFileSync(new URL('./preset-clips.json', import.meta.url), 'utf8'));
const client = new pg.Client({ connectionString: process.env.DATABASE_URL });
await client.connect();
for (const c of clips) {
  await client.query(
    `INSERT INTO clips (id,title,source,owner_id,storage_url,poster_url,duration_s,aspect,genre,mood,setting,
       people_count,people,transcript,tags,license_note,visibility,remix_count,like_count,created_at)
     VALUES ($1,$2,'preset','platform',$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,'public',$15,$16,$17)
     ON CONFLICT (id) DO UPDATE SET title=EXCLUDED.title, poster_url=EXCLUDED.poster_url`,
    [c.id, c.title, c.storage_url, c.poster_url, c.duration_s, c.aspect, c.genre, c.mood, c.setting,
     c.people_count, JSON.stringify(c.people), c.transcript, c.tags, c.license_note, c.remix_count, c.like_count, c.created_at]
  );
}
console.log(`Seeded ${clips.length} preset clips`);
await client.end();
