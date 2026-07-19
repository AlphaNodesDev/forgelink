import Database from 'better-sqlite3';
import { readFileSync, mkdirSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import type { Manifest, NewsEntry, ServerStatus, UpdateDescriptor } from '@forgelink/shared';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/**
 * Thin, typed data-access layer over better-sqlite3. All queries are prepared
 * statements bound with parameters — no string interpolation of user input —
 * which eliminates SQL injection by construction.
 *
 * The class exposes intention-revealing methods rather than a generic query
 * runner so the rest of the API never touches raw SQL.
 */
export class ForgeLinkDatabase {
  private readonly db: Database.Database;

  constructor(dbPath: string) {
    mkdirSync(path.dirname(dbPath), { recursive: true });
    this.db = new Database(dbPath);
    this.db.pragma('journal_mode = WAL');
    this.db.pragma('foreign_keys = ON');
    this.migrate();
  }

  /** Apply the schema idempotently. */
  private migrate(): void {
    const schema = readFileSync(path.join(__dirname, 'schema.sql'), 'utf8');
    this.db.exec(schema);
  }

  close(): void {
    this.db.close();
  }

  // ---- Servers ----

  upsertServer(row: {
    id: string;
    gameId: string;
    name: string;
    description: string;
    serverIp: string;
    gamePort: number;
    queryPort: number;
    website: string;
    discord: string;
  }): void {
    const now = new Date().toISOString();
    this.db
      .prepare(
        `INSERT INTO servers (id, game_id, name, description, server_ip, game_port, query_port, website, discord, created_at, updated_at)
         VALUES (@id, @gameId, @name, @description, @serverIp, @gamePort, @queryPort, @website, @discord, @now, @now)
         ON CONFLICT(id) DO UPDATE SET
           game_id=excluded.game_id, name=excluded.name, description=excluded.description,
           server_ip=excluded.server_ip, game_port=excluded.game_port, query_port=excluded.query_port,
           website=excluded.website, discord=excluded.discord, updated_at=excluded.updated_at`,
      )
      .run({ ...row, now });
  }

  getServer(id: string):
    | {
        id: string;
        game_id: string;
        name: string;
        description: string;
        server_ip: string;
        game_port: number;
        query_port: number;
        website: string;
        discord: string;
      }
    | undefined {
    return this.db.prepare('SELECT * FROM servers WHERE id = ?').get(id) as never;
  }

  getPrimaryServer(): ReturnType<ForgeLinkDatabase['getServer']> {
    return this.db.prepare('SELECT * FROM servers ORDER BY created_at ASC LIMIT 1').get() as never;
  }

  // ---- Site config (launcher branding + auto-join) ----

  /** Store the launcher config document (branding, serverName, autoJoin). */
  putSiteConfig(document: Record<string, unknown>): void {
    this.db
      .prepare(
        `INSERT INTO site_config (id, document, updated_at)
         VALUES ('primary', @document, @now)
         ON CONFLICT(id) DO UPDATE SET document=excluded.document, updated_at=excluded.updated_at`,
      )
      .run({ document: JSON.stringify(document), now: new Date().toISOString() });
  }

  /** Read the launcher config document, or undefined if not published yet. */
  getSiteConfig(): Record<string, unknown> | undefined {
    const row = this.db.prepare("SELECT document FROM site_config WHERE id = 'primary'").get() as
      | { document: string }
      | undefined;
    return row ? (JSON.parse(row.document) as Record<string, unknown>) : undefined;
  }

  // ---- Launcher versions ----

  addLauncherVersion(serverId: string, d: UpdateDescriptor, filePath: string): void {
    this.db
      .prepare(
        `INSERT INTO launcher_versions (server_id, version, released_at, file_path, sha256, size, mandatory, notes, signature)
         VALUES (@serverId, @version, @releasedAt, @filePath, @sha256, @size, @mandatory, @notes, @signature)
         ON CONFLICT(server_id, version) DO UPDATE SET
           released_at=excluded.released_at, file_path=excluded.file_path, sha256=excluded.sha256,
           size=excluded.size, mandatory=excluded.mandatory, notes=excluded.notes, signature=excluded.signature`,
      )
      .run({
        serverId,
        version: d.version,
        releasedAt: d.releasedAt,
        filePath,
        sha256: d.sha256,
        size: d.size,
        mandatory: d.mandatory ? 1 : 0,
        notes: d.notes,
        signature: d.signature ?? null,
      });
  }

  getLatestLauncherVersion(serverId: string): UpdateDescriptor | undefined {
    const row = this.db
      .prepare('SELECT * FROM launcher_versions WHERE server_id = ? ORDER BY id DESC LIMIT 1')
      .get(serverId) as
      | {
          version: string;
          released_at: string;
          file_path: string;
          sha256: string;
          size: number;
          mandatory: number;
          notes: string;
          signature: string | null;
        }
      | undefined;
    if (!row) return undefined;
    return {
      version: row.version,
      releasedAt: row.released_at,
      url: '', // filled in by the route using the public URL + download endpoint
      sha256: row.sha256,
      size: row.size,
      mandatory: row.mandatory === 1,
      notes: row.notes,
      signature: row.signature ?? undefined,
    };
  }

  getLauncherFilePath(serverId: string, version: string): string | undefined {
    const row = this.db
      .prepare('SELECT file_path FROM launcher_versions WHERE server_id = ? AND version = ?')
      .get(serverId, version) as { file_path: string } | undefined;
    return row?.file_path;
  }

  // ---- Manifests ----

  putManifest(serverId: string, manifest: Manifest): void {
    this.db
      .prepare(
        `INSERT INTO manifests (server_id, version, generated_at, total_size, document, signature)
         VALUES (@serverId, @version, @generatedAt, @totalSize, @document, @signature)
         ON CONFLICT(server_id) DO UPDATE SET
           version=excluded.version, generated_at=excluded.generated_at,
           total_size=excluded.total_size, document=excluded.document, signature=excluded.signature`,
      )
      .run({
        serverId,
        version: manifest.version,
        generatedAt: manifest.generatedAt,
        totalSize: manifest.totalSize,
        document: JSON.stringify(manifest),
        signature: manifest.signature ?? null,
      });
  }

  getManifest(serverId: string): Manifest | undefined {
    const row = this.db.prepare('SELECT document FROM manifests WHERE server_id = ?').get(serverId) as
      | { document: string }
      | undefined;
    return row ? (JSON.parse(row.document) as Manifest) : undefined;
  }

  // ---- News ----

  replaceNews(serverId: string, entries: NewsEntry[]): void {
    const tx = this.db.transaction((items: NewsEntry[]) => {
      this.db.prepare('DELETE FROM news WHERE server_id = ?').run(serverId);
      const stmt = this.db.prepare(
        `INSERT INTO news (id, server_id, title, body, author, published_at, pinned)
         VALUES (@id, @serverId, @title, @body, @author, @publishedAt, @pinned)`,
      );
      for (const n of items) {
        stmt.run({
          id: n.id,
          serverId,
          title: n.title,
          body: n.body,
          author: n.author,
          publishedAt: n.publishedAt,
          pinned: n.pinned ? 1 : 0,
        });
      }
    });
    tx(entries);
  }

  listNews(serverId: string, limit = 50): NewsEntry[] {
    const rows = this.db
      .prepare(
        'SELECT * FROM news WHERE server_id = ? ORDER BY pinned DESC, published_at DESC LIMIT ?',
      )
      .all(serverId, limit) as Array<{
      id: string;
      title: string;
      body: string;
      author: string;
      published_at: string;
      pinned: number;
    }>;
    return rows.map((r) => ({
      id: r.id,
      title: r.title,
      body: r.body,
      author: r.author,
      publishedAt: r.published_at,
      pinned: r.pinned === 1,
    }));
  }

  // ---- Status cache ----

  putStatus(serverId: string, status: ServerStatus): void {
    this.db
      .prepare(
        `INSERT INTO status_cache (server_id, online, players_online, players_max, ping_ms, version, checked_at)
         VALUES (@serverId, @online, @playersOnline, @playersMax, @pingMs, @version, @checkedAt)
         ON CONFLICT(server_id) DO UPDATE SET
           online=excluded.online, players_online=excluded.players_online, players_max=excluded.players_max,
           ping_ms=excluded.ping_ms, version=excluded.version, checked_at=excluded.checked_at`,
      )
      .run({
        serverId,
        online: status.online ? 1 : 0,
        playersOnline: status.playersOnline,
        playersMax: status.playersMax,
        pingMs: status.pingMs,
        version: status.version,
        checkedAt: status.checkedAt,
      });
  }

  getStatus(serverId: string): ServerStatus | undefined {
    const row = this.db.prepare('SELECT * FROM status_cache WHERE server_id = ?').get(serverId) as
      | {
          online: number;
          players_online: number;
          players_max: number;
          ping_ms: number | null;
          version: string | null;
          checked_at: string;
        }
      | undefined;
    if (!row) return undefined;
    return {
      online: row.online === 1,
      playersOnline: row.players_online,
      playersMax: row.players_max,
      pingMs: row.ping_ms,
      version: row.version,
      checkedAt: row.checked_at,
    };
  }

  // ---- Analytics ----

  recordEvent(e: {
    serverId: string;
    eventType: string;
    clientId?: string;
    bytes?: number;
    metadata?: Record<string, unknown>;
  }): void {
    this.db
      .prepare(
        `INSERT INTO analytics_events (server_id, event_type, client_id, bytes, metadata, created_at)
         VALUES (@serverId, @eventType, @clientId, @bytes, @metadata, @createdAt)`,
      )
      .run({
        serverId: e.serverId,
        eventType: e.eventType,
        clientId: e.clientId ?? null,
        bytes: e.bytes ?? 0,
        metadata: JSON.stringify(e.metadata ?? {}),
        createdAt: new Date().toISOString(),
      });
  }

  analyticsSummary(serverId: string): {
    downloads: number;
    uniquePlayers: number;
    updateSuccess: number;
    updateFail: number;
    crashes: number;
    modDownloads: number;
    bandwidthBytes: number;
  } {
    const count = (eventType: string): number =>
      (this.db
        .prepare('SELECT COUNT(*) AS c FROM analytics_events WHERE server_id = ? AND event_type = ?')
        .get(serverId, eventType) as { c: number }).c;

    const uniquePlayers = (
      this.db
        .prepare(
          'SELECT COUNT(DISTINCT client_id) AS c FROM analytics_events WHERE server_id = ? AND client_id IS NOT NULL',
        )
        .get(serverId) as { c: number }
    ).c;

    const bandwidthBytes = (
      this.db
        .prepare('SELECT COALESCE(SUM(bytes),0) AS s FROM analytics_events WHERE server_id = ?')
        .get(serverId) as { s: number }
    ).s;

    return {
      downloads: count('download'),
      uniquePlayers,
      updateSuccess: count('update_success'),
      updateFail: count('update_fail'),
      crashes: count('crash'),
      modDownloads: count('mod_download'),
      bandwidthBytes,
    };
  }

  // ---- API keys ----

  addApiKey(label: string, keyHash: string): void {
    this.db
      .prepare('INSERT INTO api_keys (label, key_hash, created_at) VALUES (?, ?, ?)')
      .run(label, keyHash, new Date().toISOString());
  }

  isApiKeyValid(keyHash: string): boolean {
    const row = this.db
      .prepare('SELECT id FROM api_keys WHERE key_hash = ? AND revoked = 0')
      .get(keyHash) as { id: number } | undefined;
    if (row) {
      this.db.prepare('UPDATE api_keys SET last_used_at = ? WHERE id = ?').run(new Date().toISOString(), row.id);
      return true;
    }
    return false;
  }
}
