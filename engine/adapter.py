"""
Halal Fans remix engine: a headless API around the Genjustsu open-source workflow.

Runs on Railway. The site never shows Genjustsu's UI; it calls this API instead.

  GET  /health
  POST /v1/jobs                multipart: token, video, refs (JSON list of image URLs), title
                               token = short-lived single-use ticket signed by the site (/api/engine)
  GET  /v1/jobs/{id}           status + draft/hd URLs (the 32-hex id is the capability)
  POST /v1/jobs/{id}/hd        upgrade an accepted draft to 1080p
  GET  /files/{id}/{name}      finished videos (draft / hd)
  GET  /media/{key}/{name}     inputs for Enhancor to download (unguessable key)
  POST /callback/{secret}      Enhancor webhook (acknowledged; polling stays authoritative)

Masks are auto-approved (platform decision). Paid requests are never retried automatically.
"""
from __future__ import annotations

import base64
import hashlib
import hmac
import io
import json
import os
import secrets
import shutil
import sys
import threading
import time
import uuid
from datetime import datetime, timezone
from pathlib import Path
from urllib.parse import urlparse

import requests
from fastapi import FastAPI, File, Form, HTTPException, Request, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, JSONResponse

# ---------- configuration ----------

GENJUTSU = Path(os.getenv('GENJUTSU_DIR', '/app/genjutsu'))
sys.path.insert(0, str(GENJUTSU))

DATA = Path(os.getenv('DATA_DIR', '/data'))
RUNS = DATA / 'runs'
MEDIA = DATA / 'media'
for d in (RUNS, MEDIA):
    d.mkdir(parents=True, exist_ok=True)

SIGNING_SECRET = os.getenv('ENGINE_SIGNING_SECRET', '')
_domain = os.getenv('RAILWAY_PUBLIC_DOMAIN', '')
PUBLIC_URL = (os.getenv('PUBLIC_URL') or (f'https://{_domain}' if _domain else '')).rstrip('/')
ALLOWED_ORIGINS = [o.strip() for o in os.getenv('ALLOWED_ORIGINS', 'https://halalfans.me,https://www.halalfans.me').split(',') if o.strip()]
ALLOWED_REF_HOSTS = {h.strip() for h in os.getenv('ALLOWED_REF_HOSTS', 'halalfans.me,www.halalfans.me').split(',') if h.strip()}
DAILY_JOB_LIMIT = int(os.getenv('DAILY_JOB_LIMIT', '20'))
DAILY_HD_LIMIT = int(os.getenv('DAILY_HD_LIMIT', '10'))
MAX_ACTIVE = int(os.getenv('MAX_ACTIVE_JOBS', '2'))
MAX_UPLOAD_MB = int(os.getenv('MAX_UPLOAD_MB', '150'))

WEBHOOK_SECRET = hashlib.sha256((SIGNING_SECRET + ':webhook').encode()).hexdigest()[:32] if SIGNING_SECRET else ''
if PUBLIC_URL and WEBHOOK_SECRET:
    # Genjustsu reads this setting; a fixed public callback replaces its cloudflared tunnel.
    os.environ['ENHANCOR_WEBHOOK_URL'] = f'{PUBLIC_URL}/callback/{WEBHOOK_SECRET}'
os.environ.setdefault('MEDIA_HOST', 'tmpfiles')  # unused: uploads are served from this service (see local_upload)

app = FastAPI(title='Halal Fans remix engine', docs_url=None, redoc_url=None)
app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_methods=['GET', 'POST'],
    allow_headers=['content-type'],
)

lock = threading.Lock()
slots = threading.Semaphore(MAX_ACTIVE)

# ---------- helpers ----------


def now() -> str:
    return datetime.now(timezone.utc).isoformat()


def valid_id(ident: str) -> bool:
    return len(ident) == 32 and all(c in '0123456789abcdef' for c in ident)


def job_dir(ident: str) -> Path:
    if not valid_id(ident) or not (RUNS / ident / 'job.json').exists():
        raise HTTPException(404, 'Unknown job')
    return RUNS / ident


def read_job(folder: Path) -> dict:
    return json.loads((folder / 'job.json').read_text())


def write_job(folder: Path, **patch) -> dict:
    with lock:
        path = folder / 'job.json'
        data = json.loads(path.read_text()) if path.exists() else {}
        data.update(patch, updated_at=now())
        tmp = path.with_suffix('.tmp')
        tmp.write_text(json.dumps(data, indent=2))
        tmp.replace(path)
        return data


def counter(kind: str, limit: int) -> None:
    """Persisted daily cap so a leaked ticket or a bug can't drain provider credits."""
    path = DATA / 'usage.json'
    day = datetime.now(timezone.utc).strftime('%Y-%m-%d')
    with lock:
        usage = json.loads(path.read_text()) if path.exists() else {}
        today = usage.get(day, {})
        if today.get(kind, 0) >= limit:
            raise HTTPException(429, f'Daily {kind} limit reached. Try again tomorrow.')
        today[kind] = today.get(kind, 0) + 1
        path.write_text(json.dumps({day: today}))


def verify_ticket(token: str) -> None:
    """Ticket = b64url(json{exp,nonce}).b64url(hmac_sha256). Single use."""
    if not SIGNING_SECRET:
        raise HTTPException(503, 'Engine not configured')
    try:
        body, sig = token.split('.', 1)
        expected = base64.urlsafe_b64encode(hmac.new(SIGNING_SECRET.encode(), body.encode(), hashlib.sha256).digest()).decode().rstrip('=')
        if not hmac.compare_digest(sig, expected):
            raise ValueError
        payload = json.loads(base64.urlsafe_b64decode(body + '=' * (-len(body) % 4)))
    except (ValueError, json.JSONDecodeError):
        raise HTTPException(401, 'Invalid ticket')
    if payload.get('exp', 0) < time.time():
        raise HTTPException(401, 'Ticket expired')
    nonce = str(payload.get('nonce', ''))
    path = DATA / 'nonces.json'
    with lock:
        seen = json.loads(path.read_text()) if path.exists() else {}
        seen = {k: v for k, v in seen.items() if v > time.time()}
        if not nonce or nonce in seen:
            raise HTTPException(401, 'Ticket already used')
        seen[nonce] = payload['exp']
        path.write_text(json.dumps(seen))


def local_upload(path) -> str:
    """Serve inputs from this service at an unguessable URL instead of public file hosts."""
    path = Path(path)
    key = secrets.token_urlsafe(24)
    (MEDIA / key).mkdir(parents=True)
    shutil.copy2(path, MEDIA / key / path.name)
    return f'{PUBLIC_URL}/media/{key}/{path.name}'


def fetch_reference(url: str, dest: Path) -> Path:
    host = urlparse(url).hostname or ''
    if urlparse(url).scheme != 'https' or host not in ALLOWED_REF_HOSTS:
        raise HTTPException(400, 'Reference must be a character sheet from the site')
    r = requests.get(url, timeout=30)
    r.raise_for_status()
    from PIL import Image

    img = Image.open(io.BytesIO(r.content)).convert('RGB')
    out = dest.with_suffix('.png')
    img.save(out, 'PNG')
    return out


def build_prompt(names: list[str]) -> str:
    sheet = 'a character sheet: face close-up on the left, full body on the right'
    if len(names) == 1:
        who = f'Replace the person in @Video1 with {names[0]} from @Image1 ({sheet}).'
    else:
        who = (
            f'Replace the main person in @Video1 with {names[0]} from @Image1 and the second person with {names[1]} from @Image2 '
            f'(each image is {sheet}).'
        )
    return (
        who
        + ' Match each face, skin tone, hair and body exactly. Keep the original camera framing, background, lighting,'
        ' motion, gestures and timing. Photorealistic. No depth colours, outlines or text in the output.'
    )


# ---------- job runner ----------


def run_job(ident: str) -> None:
    folder = RUNS / ident
    job = read_job(folder)
    with slots:
        try:
            from pipeline import run as prepare

            write_job(folder, state='preparing', stage='Preparing your scene')
            prepare(folder / 'upload.mp4', folder, 'person', 'replicate', status=lambda s: write_job(folder, stage=s))

            from mask_review import fingerprint, review

            review(folder, True, 'Auto-approved by platform', fingerprint(folder))

            import seedance_bridge

            seedance_bridge.upload = local_upload
            refs = [Path(p) for p in job['refs']]
            write_job(folder, state='rendering', stage='Submitting to Seedance')
            request_id = seedance_bridge.submit(folder, build_prompt(job['names']), refs[0], refs[1] if len(refs) > 1 else None, status=lambda s: write_job(folder, stage=s))
            write_job(folder, request_id=request_id, stage='Rendering draft')
            seedance_bridge.wait_and_finish(folder, request_id, status=lambda s: write_job(folder, stage=s))
            write_job(folder, state='done', stage='Draft ready')
        except Exception as e:  # surfaced to the user; paid steps are never auto-retried
            write_job(folder, state='error', stage='Failed', error=str(e)[:400])


def run_hd(ident: str) -> None:
    folder = RUNS / ident
    import seedance_bridge

    try:
        request_id = seedance_bridge.submit_hd(folder)
        write_job(folder, hd={'state': 'running', 'stage': 'Rendering 1080p', 'request_id': request_id})
        seedance_bridge.wait_and_finish(folder / 'hd', request_id, status=lambda s: write_job(folder, hd={'state': 'running', 'stage': s, 'request_id': request_id}))
        write_job(folder, hd={'state': 'done', 'stage': '1080p ready', 'request_id': request_id})
    except Exception as e:
        write_job(folder, hd={'state': 'error', 'stage': 'Failed', 'error': str(e)[:400]})


@app.on_event('startup')
def resume() -> None:
    """Resume collection only for saved provider requests; never re-submit a paid request."""
    import seedance_bridge

    for folder in RUNS.iterdir():
        if not (folder / 'job.json').exists():
            continue
        job = read_job(folder)
        if job.get('state') in ('preparing',):
            write_job(folder, state='error', stage='Interrupted', error='The server restarted during preparation. Start a new remix.')
        elif job.get('state') == 'rendering' and job.get('request_id') and not (folder / 'final-preview.mp4').exists():
            def collect(folder=folder, rid=job['request_id']):
                try:
                    seedance_bridge.wait_and_finish(folder, rid, status=lambda s: write_job(folder, stage=s))
                    write_job(folder, state='done', stage='Draft ready')
                except Exception as e:
                    write_job(folder, state='error', stage='Failed', error=str(e)[:400])

            threading.Thread(target=collect, daemon=True).start()
        hd = job.get('hd') or {}
        if hd.get('state') == 'running' and hd.get('request_id') and not (folder / 'hd' / 'final-preview.mp4').exists():
            def collect_hd(folder=folder, rid=hd['request_id']):
                try:
                    seedance_bridge.wait_and_finish(folder / 'hd', rid)
                    write_job(folder, hd={'state': 'done', 'stage': '1080p ready', 'request_id': rid})
                except Exception as e:
                    write_job(folder, hd={'state': 'error', 'stage': 'Failed', 'error': str(e)[:400]})

            threading.Thread(target=collect_hd, daemon=True).start()


# ---------- routes ----------


@app.get('/health')
def health():
    keys = all(os.getenv(k) for k in ('ENHANCOR_API_KEY', 'REPLICATE_API_TOKEN'))
    return {'status': 'ok', 'configured': bool(SIGNING_SECRET and PUBLIC_URL and keys)}


@app.post('/v1/jobs')
async def create_job(token: str = Form(...), video: UploadFile = File(...), refs: str = Form(...), names: str = Form('[]'), title: str = Form('Scene')):
    verify_ticket(token)
    try:
        ref_urls = [u for u in json.loads(refs) if isinstance(u, str)][:2]
        ref_names = [str(n)[:60] for n in json.loads(names)][:2]
    except json.JSONDecodeError:
        raise HTTPException(400, 'Bad refs')
    if not ref_urls:
        raise HTTPException(400, 'Cast at least one influencer')

    ident = uuid.uuid4().hex
    folder = RUNS / ident
    folder.mkdir()
    src = folder / 'upload.mp4'
    size = 0
    with src.open('wb') as out:
        while chunk := await video.read(1024 * 1024):
            size += len(chunk)
            if size > MAX_UPLOAD_MB * 1024 * 1024:
                shutil.rmtree(folder, ignore_errors=True)
                raise HTTPException(413, f'Clip is larger than {MAX_UPLOAD_MB} MB')
            out.write(chunk)

    import av

    try:
        with av.open(str(src)) as c:
            seconds = float(c.duration / av.time_base) if c.duration else 0
            has_audio = bool(c.streams.audio)
            if not c.streams.video:
                raise ValueError
    except Exception:
        shutil.rmtree(folder, ignore_errors=True)
        raise HTTPException(400, 'Could not read that video')
    if not has_audio:
        shutil.rmtree(folder, ignore_errors=True)
        raise HTTPException(400, 'The clip needs an audio track')
    if not 4 <= seconds <= 30:
        shutil.rmtree(folder, ignore_errors=True)
        raise HTTPException(400, 'Clips must be 4–30 seconds')

    try:
        ref_paths = [str(fetch_reference(u, folder / f'reference-{i + 1}')) for i, u in enumerate(ref_urls)]
        counter('jobs', DAILY_JOB_LIMIT)  # only count clips that passed every check
    except Exception:
        shutil.rmtree(folder, ignore_errors=True)
        raise
    names_final = ref_names + [f'the character in @Image{i + 1}' for i in range(len(ref_names), len(ref_paths))]
    write_job(folder, id=ident, title=title[:120], state='queued', stage='Queued', created_at=now(), seconds=round(seconds, 2), refs=ref_paths, names=names_final)
    threading.Thread(target=run_job, args=(ident,), daemon=True).start()
    return {'id': ident, 'state': 'queued'}


def public_job(folder: Path) -> dict:
    job = read_job(folder)
    ident = job['id']
    hd = job.get('hd') or {'state': 'idle'}
    progress = {'queued': 2, 'preparing': 30, 'rendering': 70, 'done': 100, 'error': 100}.get(job.get('state'), 0)
    return {
        'id': ident,
        'state': job.get('state'),
        'stage': job.get('stage'),
        'progress': progress,
        'error': job.get('error'),
        'draft_url': f'{PUBLIC_URL}/files/{ident}/draft.mp4' if (folder / 'final-preview.mp4').exists() else None,
        'hd': {
            'state': hd.get('state', 'idle'),
            'stage': hd.get('stage'),
            'error': hd.get('error'),
            'url': f'{PUBLIC_URL}/files/{ident}/hd.mp4' if (folder / 'hd' / 'final-preview.mp4').exists() else None,
        },
    }


@app.get('/v1/jobs/{ident}')
def get_job(ident: str):
    return public_job(job_dir(ident))


@app.post('/v1/jobs/{ident}/hd')
def upgrade(ident: str):
    folder = job_dir(ident)
    job = read_job(folder)
    if (job.get('hd') or {}).get('state') in ('running', 'done'):
        return public_job(folder)
    if job.get('state') != 'done' or not (folder / 'final-preview.mp4').exists():
        raise HTTPException(409, 'The draft has to finish first')
    counter('hd', DAILY_HD_LIMIT)
    write_job(folder, hd={'state': 'running', 'stage': 'Submitting 1080p'})
    threading.Thread(target=run_hd, args=(ident,), daemon=True).start()
    return public_job(folder)


@app.get('/files/{ident}/{name}')
def files(ident: str, name: str):
    folder = job_dir(ident)
    path = {'draft.mp4': folder / 'final-preview.mp4', 'hd.mp4': folder / 'hd' / 'final-preview.mp4'}.get(name)
    if not path or not path.exists():
        raise HTTPException(404)
    return FileResponse(path, media_type='video/mp4', filename=f'{ident[:8]}-{name}')


@app.get('/media/{key}/{name}')
def media(key: str, name: str):
    path = (MEDIA / key / name).resolve()
    if MEDIA.resolve() not in path.parents or not path.is_file():
        raise HTTPException(404)
    return FileResponse(path)


@app.post('/callback/{secret}')
async def callback(secret: str, request: Request):
    if not WEBHOOK_SECRET or not hmac.compare_digest(secret, WEBHOOK_SECRET):
        raise HTTPException(404)
    await request.body()
    return JSONResponse({'received': True})
