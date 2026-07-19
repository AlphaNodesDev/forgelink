import { Router } from 'express';
import { createReadStream, existsSync, statSync } from 'node:fs';
import path from 'node:path';
import { defaultRegistry } from '@forgelink/adapters';
import { isGameId, type ServerStatus } from '@forgelink/shared';
import type { ForgeLinkDatabase } from '../db/database.js';
import type { AppConfig } from '../config.js';
import { asyncRoute, HttpError } from '../middleware/errors.js';
import type { Logger } from '@forgelink/shared';

/**
 * Public, unauthenticated read routes consumed by the launcher and website:
 *   GET /api/status        live status + player count (cached)
 *   GET /api/news          news feed
 *   GET /api/version       latest launcher version (auto-update descriptor)
 *   GET /api/mods          current mod manifest
 *   GET /api/changelog     alias to news, newest first
 *   GET /api/playercount   compact player count
 *   GET /api/download      byte-range (resumable) download of launcher/mod files
 *   GET /api/launcher      redirects to the latest launcher installer download
 */
export function publicRouter(db: ForgeLinkDatabase, config: AppConfig, logger: Logger): Router {
  const router = Router();

  /** Resolve the primary server or 404. */
  const primary = () => {
    const server = db.getPrimaryServer();
    if (!server) throw new HttpError(404, 'No server has been published yet');
    return server;
  };

  router.get(
    '/status',
    asyncRoute(async (_req, res) => {
      const server = primary();
      const cached = db.getStatus(server.id);
      const fresh =
        cached && Date.now() - new Date(cached.checkedAt).getTime() < 30_000 ? cached : null;

      let status: ServerStatus;
      if (fresh) {
        status = fresh;
      } else if (isGameId(server.game_id) && defaultRegistry.has(server.game_id)) {
        const adapter = defaultRegistry.get(server.game_id);
        status = await adapter.queryStatus({
          installPath: '',
          server: {
            serverIp: server.server_ip,
            port: config.port,
            gamePort: server.game_port,
            queryPort: server.query_port,
            region: 'NA',
            serverPassword: '',
            adminPassword: '',
            visibility: 'public',
            website: server.website,
            discord: server.discord,
            rules: [],
          },
        });
        db.putStatus(server.id, status);
      } else {
        status = {
          online: false,
          playersOnline: 0,
          playersMax: 0,
          pingMs: null,
          version: null,
          checkedAt: new Date().toISOString(),
        };
      }
      res.json(status);
    }),
  );

  router.get('/playercount', (_req, res) => {
    const server = primary();
    const status = db.getStatus(server.id);
    res.json({
      online: status?.online ?? false,
      playersOnline: status?.playersOnline ?? 0,
      playersMax: status?.playersMax ?? 0,
    });
  });

  // Launcher branding + auto-join config. A generic launcher .exe fetches this
  // at startup so it can be fully branded per server without a rebuild.
  router.get('/config', (_req, res) => {
    const cfg = db.getSiteConfig();
    if (!cfg) throw new HttpError(404, 'No launcher config has been published yet');
    res.json(cfg);
  });

  router.get('/news', (_req, res) => {
    const server = primary();
    res.json({ news: db.listNews(server.id) });
  });

  router.get('/changelog', (_req, res) => {
    const server = primary();
    res.json({ changelog: db.listNews(server.id) });
  });

  router.get('/version', (_req, res) => {
    const server = primary();
    const latest = db.getLatestLauncherVersion(server.id);
    if (!latest) throw new HttpError(404, 'No launcher version published');
    latest.url = `${config.publicUrl}/api/download?type=launcher&version=${encodeURIComponent(latest.version)}`;
    res.json(latest);
  });

  router.get('/mods', (_req, res) => {
    const server = primary();
    const manifest = db.getManifest(server.id);
    if (!manifest) throw new HttpError(404, 'No mod manifest published');
    res.json(manifest);
  });

  router.get('/launcher', (_req, res) => {
    const server = primary();
    const latest = db.getLatestLauncherVersion(server.id);
    if (!latest) throw new HttpError(404, 'No launcher published');
    res.redirect(
      302,
      `${config.publicUrl}/api/download?type=launcher&version=${encodeURIComponent(latest.version)}`,
    );
  });

  /**
   * Resumable download endpoint. Supports HTTP Range requests so interrupted
   * mod/launcher downloads can resume. `type` selects launcher installer vs a
   * mod file (path relative to the server's storage mods dir).
   */
  router.get(
    '/download',
    asyncRoute(async (req, res) => {
      const server = primary();
      const type = String(req.query.type ?? '');
      let absolutePath: string;

      if (type === 'launcher') {
        const version = String(req.query.version ?? '');
        const rel = db.getLauncherFilePath(server.id, version);
        if (!rel) throw new HttpError(404, 'Launcher version not found');
        absolutePath = path.join(config.storageDir, rel);
        db.recordEvent({ serverId: server.id, eventType: 'download', clientId: clientId(req) });
      } else if (type === 'mod') {
        const rel = String(req.query.path ?? '');
        // Prevent path traversal: resolve and confirm the result stays inside.
        const modsRoot = path.join(config.storageDir, server.id, 'mods');
        absolutePath = path.resolve(modsRoot, rel);
        if (!absolutePath.startsWith(path.resolve(modsRoot) + path.sep)) {
          throw new HttpError(400, 'Invalid mod path');
        }
        db.recordEvent({ serverId: server.id, eventType: 'mod_download', clientId: clientId(req) });
      } else {
        throw new HttpError(400, 'Unknown download type');
      }

      if (!existsSync(absolutePath)) throw new HttpError(404, 'File not found');
      streamWithRange(req, res, absolutePath, db, server.id, logger);
    }),
  );

  return router;
}

function clientId(req: import('express').Request): string | undefined {
  const id = req.header('x-client-id');
  return id && id.length <= 128 ? id : undefined;
}

/** Stream a file honouring the Range header for resumable downloads. */
function streamWithRange(
  req: import('express').Request,
  res: import('express').Response,
  filePath: string,
  db: ForgeLinkDatabase,
  serverId: string,
  logger: Logger,
): void {
  const stat = statSync(filePath);
  const total = stat.size;
  const range = req.header('range');

  res.setHeader('Accept-Ranges', 'bytes');
  res.setHeader('Content-Type', 'application/octet-stream');

  if (!range) {
    res.setHeader('Content-Length', total);
    const stream = createReadStream(filePath);
    stream.on('end', () => db.recordEvent({ serverId, eventType: 'bandwidth', bytes: total }));
    stream.on('error', (e) => logger.error('Download stream error', { error: e.message }));
    stream.pipe(res);
    return;
  }

  const match = /bytes=(\d*)-(\d*)/.exec(range);
  if (!match) {
    res.status(416).setHeader('Content-Range', `bytes */${total}`).end();
    return;
  }
  const start = match[1] ? parseInt(match[1], 10) : 0;
  const end = match[2] ? parseInt(match[2], 10) : total - 1;
  if (start >= total || end >= total || start > end) {
    res.status(416).setHeader('Content-Range', `bytes */${total}`).end();
    return;
  }
  const chunkSize = end - start + 1;
  res.status(206);
  res.setHeader('Content-Range', `bytes ${start}-${end}/${total}`);
  res.setHeader('Content-Length', chunkSize);
  const stream = createReadStream(filePath, { start, end });
  stream.on('end', () => db.recordEvent({ serverId, eventType: 'bandwidth', bytes: chunkSize }));
  stream.on('error', (e) => logger.error('Range stream error', { error: e.message }));
  stream.pipe(res);
}
