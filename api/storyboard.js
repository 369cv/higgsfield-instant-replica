// Storyboard generation proxy -> self-hosted open-source video engine.
// Contract: docs/scenes/storyboard-engine.md
//   POST /api/storyboard            body: job payload       -> { job_id }
//   GET  /api/storyboard?id=<job>                            -> { status, progress, output_url, poster_url, error }
// Env (Vercel project settings):
//   STORYBOARD_ENGINE_URL    base URL of the engine, e.g. https://gpu.example.com
//   STORYBOARD_ENGINE_TOKEN  optional bearer token the engine expects

const MAX_BODY = 64 * 1024;

function json(res, status, body) {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Cache-Control', 'no-store');
  res.end(JSON.stringify(body));
}

async function readBody(req) {
  if (req.body && typeof req.body === 'object') return req.body;
  let raw = '';
  for await (const chunk of req) {
    raw += chunk;
    if (raw.length > MAX_BODY) throw new Error('too_large');
  }
  return raw ? JSON.parse(raw) : {};
}

function validJob(b) {
  return (
    b &&
    typeof b.storyboard_id === 'string' &&
    Array.isArray(b.shots) &&
    b.shots.length > 0 &&
    b.shots.length <= 8 &&
    b.shots.every((s) => typeof s.prompt === 'string' && s.prompt.length < 2000 && typeof s.seconds === 'number') &&
    Array.isArray(b.cast) &&
    b.cast.length <= 6
  );
}

export default async function handler(req, res) {
  const base = (process.env.STORYBOARD_ENGINE_URL || '').replace(/\/+$/, '');
  if (!base) return json(res, 503, { error: 'engine_not_connected' });
  const headers = { 'Content-Type': 'application/json' };
  if (process.env.STORYBOARD_ENGINE_TOKEN) headers.Authorization = `Bearer ${process.env.STORYBOARD_ENGINE_TOKEN}`;

  try {
    if (req.method === 'POST') {
      let body;
      try {
        body = await readBody(req);
      } catch {
        return json(res, 400, { error: 'invalid_body' });
      }
      if (!validJob(body)) return json(res, 400, { error: 'invalid_job' });
      const r = await fetch(`${base}/jobs`, { method: 'POST', headers, body: JSON.stringify(body) });
      const data = await r.json().catch(() => ({}));
      if (!r.ok || !data.job_id) return json(res, 502, { error: 'engine_error', detail: data.error || r.status });
      return json(res, 200, { job_id: String(data.job_id) });
    }
    if (req.method === 'GET') {
      const id = String((req.query && req.query.id) || new URL(req.url, 'http://x').searchParams.get('id') || '');
      if (!/^[\w-]{1,128}$/.test(id)) return json(res, 400, { error: 'invalid_id' });
      const r = await fetch(`${base}/jobs/${encodeURIComponent(id)}`, { headers });
      const data = await r.json().catch(() => ({}));
      if (!r.ok) return json(res, 502, { error: 'engine_error', detail: data.error || r.status });
      const { status, progress, output_url, poster_url, error } = data;
      return json(res, 200, { status, progress, output_url, poster_url, error });
    }
    res.setHeader('Allow', 'GET, POST');
    return json(res, 405, { error: 'method_not_allowed' });
  } catch {
    return json(res, 502, { error: 'engine_unreachable' });
  }
}
