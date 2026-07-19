-- ForgeLink Server API database schema (SQLite dialect).
-- The same logical schema applies to PostgreSQL; type affinities are chosen to
-- be compatible with both. Migrations run idempotently at startup.

PRAGMA journal_mode = WAL;
PRAGMA foreign_keys = ON;

-- Launcher branding + runtime config, served to the launcher at startup.
-- A single row (id='primary') holds the JSON document the launcher reads so a
-- generic launcher .exe can be fully branded per server without a rebuild.
CREATE TABLE IF NOT EXISTS site_config (
  id          TEXT PRIMARY KEY,
  document    TEXT NOT NULL,       -- JSON: branding + autoJoin + serverName
  updated_at  TEXT NOT NULL
);

-- A published server "site". A single API instance serves one primary site but
-- the table allows multiple for future multi-tenant hosting.
CREATE TABLE IF NOT EXISTS servers (
  id            TEXT PRIMARY KEY,
  game_id       TEXT NOT NULL,
  name          TEXT NOT NULL,
  description   TEXT NOT NULL DEFAULT '',
  server_ip     TEXT NOT NULL,
  game_port     INTEGER NOT NULL,
  query_port    INTEGER NOT NULL,
  website       TEXT NOT NULL DEFAULT '',
  discord       TEXT NOT NULL DEFAULT '',
  created_at    TEXT NOT NULL,
  updated_at    TEXT NOT NULL
);

-- Published launcher versions (auto-update chain). The newest row per server is
-- the current release.
CREATE TABLE IF NOT EXISTS launcher_versions (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  server_id     TEXT NOT NULL REFERENCES servers(id) ON DELETE CASCADE,
  version       TEXT NOT NULL,
  released_at   TEXT NOT NULL,
  file_path     TEXT NOT NULL,      -- relative to storage dir
  sha256        TEXT NOT NULL,
  size          INTEGER NOT NULL,
  mandatory     INTEGER NOT NULL DEFAULT 0,
  notes         TEXT NOT NULL DEFAULT '',
  signature     TEXT,
  UNIQUE (server_id, version)
);

-- The current mod manifest per server (stored as canonical JSON).
CREATE TABLE IF NOT EXISTS manifests (
  server_id     TEXT PRIMARY KEY REFERENCES servers(id) ON DELETE CASCADE,
  version       TEXT NOT NULL,
  generated_at  TEXT NOT NULL,
  total_size    INTEGER NOT NULL,
  document      TEXT NOT NULL,      -- full manifest JSON
  signature     TEXT
);

-- News / changelog entries.
CREATE TABLE IF NOT EXISTS news (
  id            TEXT PRIMARY KEY,
  server_id     TEXT NOT NULL REFERENCES servers(id) ON DELETE CASCADE,
  title         TEXT NOT NULL,
  body          TEXT NOT NULL,
  author        TEXT NOT NULL DEFAULT '',
  published_at  TEXT NOT NULL,
  pinned        INTEGER NOT NULL DEFAULT 0
);
CREATE INDEX IF NOT EXISTS idx_news_server ON news(server_id, published_at DESC);

-- Cached server status snapshots (avoids hammering the game server).
CREATE TABLE IF NOT EXISTS status_cache (
  server_id      TEXT PRIMARY KEY REFERENCES servers(id) ON DELETE CASCADE,
  online         INTEGER NOT NULL,
  players_online INTEGER NOT NULL,
  players_max    INTEGER NOT NULL,
  ping_ms        INTEGER,
  version        TEXT,
  checked_at     TEXT NOT NULL
);

-- Analytics event stream (launcher downloads, updates, mod downloads, crashes).
CREATE TABLE IF NOT EXISTS analytics_events (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  server_id     TEXT NOT NULL,
  event_type    TEXT NOT NULL,      -- download|update_success|update_fail|mod_download|crash|launch
  client_id     TEXT,               -- anonymous per-install id
  bytes         INTEGER NOT NULL DEFAULT 0,
  metadata      TEXT NOT NULL DEFAULT '{}',
  created_at    TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_analytics_server_type ON analytics_events(server_id, event_type, created_at);

-- API keys issued for privileged operations (publishing).
CREATE TABLE IF NOT EXISTS api_keys (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  label         TEXT NOT NULL,
  key_hash      TEXT NOT NULL UNIQUE,  -- sha256 of the raw key
  created_at    TEXT NOT NULL,
  last_used_at  TEXT,
  revoked       INTEGER NOT NULL DEFAULT 0
);
