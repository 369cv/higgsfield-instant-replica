# Storyboard engine (self-hosted, open source)

Scene Remix → **Storyboards** generates through your own engine (an open-source video model you
host, e.g. on a GPU server), not Higgsfield. The site talks to it through one serverless proxy,
`api/storyboard.js`, so the engine URL and token never reach the browser.

## Connect it

Set these in Vercel → Project → Settings → Environment Variables, then redeploy:

| Variable | Required | Example |
|---|---|---|
| `STORYBOARD_ENGINE_URL` | yes | `https://gpu.example.com` |
| `STORYBOARD_ENGINE_TOKEN` | no | sent as `Authorization: Bearer <token>` |

Until `STORYBOARD_ENGINE_URL` is set, Generate shows "engine isn't connected" and users can still copy the shot prompts.

## Contract the engine must implement

### `POST {ENGINE}/jobs`
Request body (sent as-is from the app):
```json
{
  "storyboard_id": "sb-the-reveal",
  "title": "The Reveal",
  "aspect": "9:16",
  "seconds": 10,
  "setting": "hillside modern villa ...",
  "line": "And this is the backyard.",
  "shots": [{ "index": 0, "seconds": 3, "prompt": "Shot 1/3, 3s. Medium: ..." }],
  "cast": [{ "role": "Agent", "influencer_id": "rhea-malhotra", "name": "Rhea Malhotra",
             "sheet_url": "https://halalfans.me/influencer/characters/rhea-malhotra.webp" }]
}
```
Response: `{ "job_id": "abc123" }`

### `GET {ENGINE}/jobs/{job_id}`
Response: `{ "status": "queued|running|done|failed", "progress": 0-100, "output_url": "https://...mp4", "poster_url": "https://...jpg", "error": "..." }`

The app polls every few seconds (with back-off when the engine is busy), shows progress in
History, and stores `output_url` when `status` is `done`. Unfinished jobs resume polling after a reload.

## How a job maps to a model

- Each shot is one generation using its `prompt`, with the cast `sheet_url`s as identity references.
- Clips are stitched in `index` order into one `seconds`-long video at `aspect`.
- `line` is optional dialogue for a TTS / lip-sync stage, if the engine has one.

## Files

- Storyboard data: `src/features/scenes/storyboards.ts` (add or edit storyboards here)
- UI: `src/features/scenes/StoryboardsTab.tsx`
- Proxy: `api/storyboard.js`
- Job polling: `src/features/remix/store.ts` (`pollEngine`)
