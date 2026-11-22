# Remix engine (Railway)

Headless API around the open-source **Genjustsu** workflow (MIT, pinned in `Dockerfile`).
Scene Remix → Generate uploads the clip here; the engine prepares it (vocals, depth, SAM 3 masks),
**auto-approves the mask**, renders a Seedance draft through Enhancor, restores the original audio,
and can upgrade the draft to 1080p. Genjustsu's own UI is never used.

## Deploy on Railway (one time)

1. **New Project → Deploy from GitHub repo** → `369cv/higgsfield-instant-replica`.
2. Service **Settings**:
   - **Root Directory:** `engine`
   - **Watch Paths:** `/engine/**` (so site-only pushes don't rebuild the engine)
3. **Add a Volume** to the service, mount path **`/data`** (jobs and videos live here).
4. **Networking → Generate Domain** (e.g. `remix-engine-production.up.railway.app`).
5. **Variables:**

   | Name | Value |
   |---|---|
   | `ENHANCOR_API_KEY` | your Enhancor key |
   | `REPLICATE_API_TOKEN` | your Replicate token |
   | `ENGINE_SIGNING_SECRET` | a long random string, e.g. output of `openssl rand -hex 32` |
   | `DAILY_JOB_LIMIT` | optional, default `20` drafts/day |
   | `DAILY_HD_LIMIT` | optional, default `10` 1080p upgrades/day |
   | `ALLOWED_ORIGINS` | optional, default `https://halalfans.me,https://www.halalfans.me` |

6. Open `https://<your-domain>/health`. It should say `"configured": true`.

## Connect the site (Vercel)

Vercel → project → Settings → Environment Variables (Production), then redeploy:

| Name | Value |
|---|---|
| `ENGINE_URL` | `https://<your-railway-domain>` |
| `ENGINE_SIGNING_SECRET` | the **same** value as on Railway |

## How it works

- The site's `/api/engine` signs a 5-minute, single-use upload ticket; the browser uploads the clip
  straight to the engine (no Vercel size limit).
- Clips: 4–30 s, must have an audio track, up to 150 MB. Up to 2 people recast per clip.
- Inputs for Enhancor are served from this service at unguessable URLs (no public file hosts).
- Enhancor's webhook goes to `/callback/<derived secret>`; polling stays authoritative.
- Paid requests are never retried automatically. After a restart the engine resumes *collecting*
  saved renders; jobs interrupted during preparation are marked failed.
- Daily caps protect your credits until login/paywall is in place.

## API

| Method | Path | Notes |
|---|---|---|
| GET | `/health` | `configured` true when keys + secret + domain are set |
| POST | `/v1/jobs` | multipart: `token`, `video`, `refs` (JSON URLs), `names` (JSON), `title` |
| GET | `/v1/jobs/{id}` | `state` queued/preparing/rendering/done/error, `stage`, `draft_url`, `hd` |
| POST | `/v1/jobs/{id}/hd` | upgrade a finished draft to 1080p |
| GET | `/files/{id}/draft.mp4`, `/files/{id}/hd.mp4` | results |
