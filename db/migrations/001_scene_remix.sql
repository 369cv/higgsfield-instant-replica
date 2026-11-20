-- Scene Remix schema (Postgres 14+)
-- Apply: psql "$DATABASE_URL" -f db/migrations/001_scene_remix.sql
BEGIN;

CREATE TYPE clip_source AS ENUM ('preset', 'user_upload');
CREATE TYPE clip_visibility AS ENUM ('private', 'pending', 'public', 'removed');
CREATE TYPE remix_status AS ENUM ('queued', 'running', 'done', 'failed');

-- array_to_string is STABLE; generated columns need IMMUTABLE.
CREATE FUNCTION immutable_tags_text(text[]) RETURNS text
  LANGUAGE sql IMMUTABLE PARALLEL SAFE AS $$ SELECT array_to_string($1, ' ') $$;

CREATE TABLE clips (
  id                  text PRIMARY KEY,
  title               text NOT NULL,
  source              clip_source NOT NULL,
  owner_id            text NOT NULL,                 -- 'platform' for presets
  storage_url         text,                          -- our own media storage only
  poster_url          text,
  duration_s          numeric(5,2) NOT NULL CHECK (duration_s BETWEEN 4 AND 30),
  aspect              text NOT NULL DEFAULT '9:16',
  genre               text[] NOT NULL DEFAULT '{}',
  mood                text[] NOT NULL DEFAULT '{}',
  setting             text[] NOT NULL DEFAULT '{}',
  people_count        smallint NOT NULL DEFAULT 1 CHECK (people_count BETWEEN 0 AND 12),
  people              jsonb NOT NULL DEFAULT '[]',    -- [{index,x,y}] normalised detection points
  transcript          text,
  tags                text[] NOT NULL DEFAULT '{}',
  license_note        text,
  content_sha256      text,                          -- for duplicate / blocklist checks
  rights_attested_at  timestamptz,
  rights_attestation  text,                          -- exact statement the user ticked
  visibility          clip_visibility NOT NULL DEFAULT 'private',
  remix_count         integer NOT NULL DEFAULT 0,
  like_count          integer NOT NULL DEFAULT 0,
  created_at          timestamptz NOT NULL DEFAULT now(),
  search              tsvector GENERATED ALWAYS AS (
    setweight(to_tsvector('english', coalesce(title, '')), 'A') ||
    setweight(to_tsvector('english', coalesce(transcript, '')), 'B') ||
    setweight(to_tsvector('english', immutable_tags_text(tags)), 'C')
  ) STORED,
  -- Rule: a user upload can only exist with a rights attestation.
  CONSTRAINT upload_requires_attestation CHECK (source = 'preset' OR rights_attested_at IS NOT NULL)
);
CREATE INDEX clips_search_idx ON clips USING gin (search);
CREATE INDEX clips_genre_idx ON clips USING gin (genre);
CREATE INDEX clips_visibility_idx ON clips (visibility, created_at DESC);
CREATE INDEX clips_owner_idx ON clips (owner_id);

CREATE TABLE clip_likes (
  clip_id    text REFERENCES clips(id) ON DELETE CASCADE,
  user_id    text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (clip_id, user_id)
);

CREATE TABLE collections (
  id             text PRIMARY KEY,
  owner_id       text NOT NULL,
  name           text NOT NULL,
  description    text NOT NULL DEFAULT '',
  cover_clip_id  text REFERENCES clips(id) ON DELETE SET NULL,
  clip_ids       text[] NOT NULL DEFAULT '{}',        -- ordered
  visibility     text NOT NULL DEFAULT 'private' CHECK (visibility IN ('private', 'public')),
  position       integer NOT NULL DEFAULT 0,           -- user's ordering of collections
  share_token    text UNIQUE,
  created_at     timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX collections_owner_idx ON collections (owner_id, position);

CREATE TABLE remixes (
  id               text PRIMARY KEY,
  user_id          text NOT NULL,
  clip_id          text NOT NULL REFERENCES clips(id),
  character_map    jsonb NOT NULL,                     -- [{person_index, influencer_id|null, keep:boolean}]
  object_refs      text[] NOT NULL DEFAULT '{}',
  style            text,
  prompt           text NOT NULL DEFAULT '',
  model            text NOT NULL,
  quality          text NOT NULL CHECK (quality IN ('480p', '720p', '1080p')),
  status           remix_status NOT NULL DEFAULT 'queued',
  progress         smallint NOT NULL DEFAULT 0,
  output_url       text,
  watermarked      boolean NOT NULL DEFAULT true,
  provenance       jsonb NOT NULL DEFAULT '{}',        -- C2PA-style manifest: generator, model, inputs, created_at
  credits          integer NOT NULL,
  parent_remix_id  text REFERENCES remixes(id),
  failure_reason   text,
  created_at       timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX remixes_user_idx ON remixes (user_id, created_at DESC);

-- Character replacement is limited to the user's own AI influencers.
CREATE TABLE influencers (
  id         text PRIMARY KEY,
  owner_id   text NOT NULL,                            -- 'platform' for stock presets anyone may use
  name       text NOT NULL,
  sheet_url  text NOT NULL,
  is_synthetic boolean NOT NULL DEFAULT true CHECK (is_synthetic),
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Known-copyrighted fingerprints (exact hash today; perceptual hash when a provider is wired in).
CREATE TABLE blocked_content (
  sha256     text PRIMARY KEY,
  reason     text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- DMCA / abuse reports on public clips and remixes.
CREATE TABLE reports (
  id            text PRIMARY KEY,
  target_type   text NOT NULL CHECK (target_type IN ('clip', 'remix')),
  target_id     text NOT NULL,
  reason        text NOT NULL CHECK (reason IN ('copyright', 'likeness', 'harmful', 'other')),
  details       text NOT NULL DEFAULT '',
  reporter_email text,
  status        text NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'actioned', 'dismissed')),
  created_at    timestamptz NOT NULL DEFAULT now()
);

-- Publishing a user upload goes through review.
CREATE TABLE review_queue (
  clip_id     text PRIMARY KEY REFERENCES clips(id) ON DELETE CASCADE,
  requested_at timestamptz NOT NULL DEFAULT now(),
  decided_at  timestamptz,
  decision    text CHECK (decision IN ('approved', 'rejected')),
  notes       text
);

COMMIT;
