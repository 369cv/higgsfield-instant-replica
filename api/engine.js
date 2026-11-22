// Issues a short-lived, single-use upload ticket for the remix engine (Railway).
// The browser then uploads the clip straight to the engine, so large videos never pass through Vercel.
// Env: ENGINE_URL (https://<service>.up.railway.app), ENGINE_SIGNING_SECRET (same value as on the engine).
import crypto from 'crypto';

const b64url = (buf) => Buffer.from(buf).toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');

export default function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  res.setHeader('Content-Type', 'application/json');
  const url = (process.env.ENGINE_URL || '').replace(/\/+$/, '');
  const secret = process.env.ENGINE_SIGNING_SECRET || '';
  if (req.method !== 'POST') {
    res.statusCode = 405;
    return res.end(JSON.stringify({ error: 'method_not_allowed' }));
  }
  if (!url || !secret) {
    res.statusCode = 503;
    return res.end(JSON.stringify({ error: 'engine_not_connected' }));
  }
  const body = b64url(JSON.stringify({ exp: Math.floor(Date.now() / 1000) + 300, nonce: crypto.randomBytes(12).toString('hex') }));
  const sig = b64url(crypto.createHmac('sha256', secret).update(body).digest());
  res.statusCode = 200;
  return res.end(JSON.stringify({ engine_url: url, ticket: `${body}.${sig}` }));
}
