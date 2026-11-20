"""Generate wardrobe looks with the Gemini image API (no Higgsfield).

For each job in docs/wardrobe/assignments.json:
  character sheet (local webp) + outfit reference (vault image) + prompt -> Gemini -> PNG
PNGs land in an inbox folder named {character}__{look}.png; then ingest_looks.py cuts
them out, registers them on the stage and wires them into the Wardrobe.

Auth: x-goog-api-key header. Uses $GEMINI_API_KEY if set; otherwise sends a placeholder
that the environment's network secret replaces.

Usage:
  python3 scripts/wardrobe/generate_looks.py --dry-run            # list what would run
  python3 scripts/wardrobe/generate_looks.py --limit 4            # small test
  python3 scripts/wardrobe/generate_looks.py --only chloe-tan     # one character
  python3 scripts/wardrobe/generate_looks.py                      # everything missing
  python3 scripts/wardrobe/generate_looks.py --ingest             # then ingest automatically
Options: --model gemini-2.5-flash-image  --workers 4  --inbox <dir>  --force
"""
import argparse, base64, io, json, os, subprocess, sys, time, urllib.error, urllib.request
from concurrent.futures import ThreadPoolExecutor, as_completed
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
API = 'https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent'
REF_CACHE = ROOT / '.cache/wardrobe-refs'


def http(url, data=None, headers=None, timeout=180):
    req = urllib.request.Request(url, data=data, headers=headers or {}, method='POST' if data else 'GET')
    with urllib.request.urlopen(req, timeout=timeout) as r:
        return r.read()


def as_png_b64(raw: bytes, max_side=1536) -> str:
    from PIL import Image
    im = Image.open(io.BytesIO(raw)).convert('RGB')
    im.thumbnail((max_side, max_side))
    buf = io.BytesIO()
    im.save(buf, 'PNG')
    return base64.b64encode(buf.getvalue()).decode()


def outfit_ref(url: str) -> bytes:
    REF_CACHE.mkdir(parents=True, exist_ok=True)
    f = REF_CACHE / url.rsplit('/', 1)[-1]
    if not f.exists():
        f.write_bytes(http(url))
    return f.read_bytes()


def generate(job, model, key):
    sheet = (ROOT / 'public/influencer/characters' / f"{job['character']}.webp").read_bytes()
    parts = [{'text': 'Character sheet (Image A):'}, {'inline_data': {'mime_type': 'image/png', 'data': as_png_b64(sheet)}}]
    if job.get('outfit_ref'):
        parts += [{'text': 'Outfit reference (Image B), use only the clothing:'},
                  {'inline_data': {'mime_type': 'image/png', 'data': as_png_b64(outfit_ref(job['outfit_ref']))}}]
    parts.append({'text': job['prompt']})
    body = json.dumps({
        'contents': [{'role': 'user', 'parts': parts}],
        'generationConfig': {'responseModalities': ['IMAGE'], 'imageConfig': {'aspectRatio': '2:3'}},
    }).encode()
    headers = {'Content-Type': 'application/json', 'x-goog-api-key': key}
    for attempt in range(5):
        try:
            res = json.loads(http(API.format(model=model), body, headers))
            for c in res.get('candidates', []):
                for p in c.get('content', {}).get('parts', []):
                    d = p.get('inlineData') or p.get('inline_data')
                    if d and d.get('data'):
                        return base64.b64decode(d['data'])
            reason = (res.get('candidates') or [{}])[0].get('finishReason') or res.get('promptFeedback')
            raise RuntimeError(f'no image returned ({reason})')
        except urllib.error.HTTPError as e:
            msg = e.read()[:300].decode(errors='replace')
            if e.code in (429, 500, 502, 503, 504) and attempt < 4:
                time.sleep(8 * (attempt + 1)); continue
            raise RuntimeError(f'HTTP {e.code}: {msg}')
        except (urllib.error.URLError, TimeoutError) as e:
            if attempt < 4:
                time.sleep(5 * (attempt + 1)); continue
            raise RuntimeError(str(e))


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--model', default=os.environ.get('WARDROBE_MODEL', 'gemini-2.5-flash-image'))
    ap.add_argument('--inbox', default=str(ROOT / '.cache/wardrobe-inbox'))
    ap.add_argument('--workers', type=int, default=4)
    ap.add_argument('--limit', type=int, default=0)
    ap.add_argument('--only', action='append', help='character id (repeatable)')
    ap.add_argument('--look', action='append', help='look id (repeatable; "base" = signature)')
    ap.add_argument('--force', action='store_true', help='regenerate even if already generated/ingested')
    ap.add_argument('--dry-run', action='store_true')
    ap.add_argument('--ingest', action='store_true', help='run ingest_looks.py afterwards')
    a = ap.parse_args()

    jobs = json.loads((ROOT / 'docs/wardrobe/assignments.json').read_text())
    if a.only:
        jobs = [j for j in jobs if j['character'] in a.only]
    if a.look:
        jobs = [j for j in jobs if j['look'] in a.look]
    inbox = Path(a.inbox); inbox.mkdir(parents=True, exist_ok=True)
    if not a.force:
        jobs = [j for j in jobs if not (inbox / j['file']).exists()
                and not (ROOT / 'public/influencer/looks' / j['character'] / f"{j['look']}.webp").exists()]
    if a.limit:
        jobs = jobs[:a.limit]
    print(f'{len(jobs)} images to generate with {a.model} -> {inbox}')
    if a.dry_run:
        for j in jobs: print('  ', j['file'])
        return
    key = os.environ.get('GEMINI_API_KEY', 'placeholder-replaced-by-network-secret')
    ok = fail = 0
    with ThreadPoolExecutor(a.workers) as ex:
        futs = {ex.submit(generate, j, a.model, key): j for j in jobs}
        for f in as_completed(futs):
            j = futs[f]
            try:
                (inbox / j['file']).write_bytes(f.result()); ok += 1
                print(f'ok   {j["file"]}', flush=True)
            except Exception as e:
                fail += 1
                print(f'FAIL {j["file"]}: {e}', flush=True)
    print(f'done: {ok} ok, {fail} failed')
    if a.ingest and ok:
        subprocess.run([sys.executable, str(ROOT / 'scripts/wardrobe/ingest_looks.py'), str(inbox)], check=False)


if __name__ == '__main__':
    main()
