# Scene Remix — backend

## Setup

1. Provision Postgres 14+ and set `DATABASE_URL` in Vercel (Production + Preview).
2. Apply the schema and seed the 12 placeholder preset clips:

```bash
psql "$DATABASE_URL" -f db/migrations/001_scene_remix.sql
```

```bash
DATABASE_URL=... node db/seed/seed.mjs
```

Without `DATABASE_URL` the API serves the seed from memory. That mode isn't durable, so use it for previews only.

## Environment

| Variable | Purpose | If unset |
|---|---|---|
| `DATABASE_URL` | Postgres connection | In-memory seed store |
| `PERSON_DETECTOR_URL` | `POST {video_url}` → `{people:[{x,y}]}` | Annotated points for presets, evenly spaced placeholders for uploads (user can adjust) |
| `REMIX_WORKER_URL` | Receives `{remix, clip}`; renders, burns in the watermark, embeds provenance, updates status | Simulated progress (20s) |

## API — `api/scenes/[...path].ts`

| Method | Path | Notes |
|---|---|---|
| GET | `/api/scenes/clips?q=&genre=&mood=&setting=&people=&duration=&sort=` | Search: title > transcript > tags. Sort: `trending`, `latest`, `most_remixed` |
| POST | `/api/scenes/clips` | User upload. Requires `rights_attestation` (exact statement), MP4/MOV, 4–30s, `content_sha256` checked against `blocked_content`. Created private |
| GET/PATCH/DELETE | `/api/scenes/clips/:id` | `PATCH {visibility:'public'}` sets status to `pending` (review) |
| POST | `/api/scenes/clips/:id/like` | Toggle |
| POST | `/api/scenes/detect` | `{clip_id}` → `{people, method}` |
| POST | `/api/scenes/estimate` | `{clip_id, model, quality, cast, object_refs, styled}` → `{credits}` |
| GET/POST | `/api/scenes/collections` | Plus `PATCH/DELETE /:id` (rename, clip order, share) and `POST /reorder {ids}` |
| GET/POST | `/api/scenes/remixes` | `GET /:id` for status. Rejects incomplete casts and clips without attestation |
| POST | `/api/scenes/reports` | DMCA / likeness / harmful / other |

Identity comes from the `x-user-id` header as a stand-in until auth exists.

## Rules enforced

- **Remixable clips:** only presets, or uploads with `rights_attested_at`. This is a DB check constraint as well as an API rule.
- **Uploads:** private by default; publishing goes through `review_queue`.
- **Casting:** only the user's own AI influencers. `influencers.is_synthetic` is forced true.
- **Outputs:** every remix stores `watermarked` and a `provenance` manifest.
