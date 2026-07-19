import { Router } from 'express';
import { z } from 'zod';
import {
  manifestSchema,
  newsEntrySchema,
  serverConfigSchema,
  updateDescriptorSchema,
  gameIdSchema,
} from '@forgelink/shared';
import type { ForgeLinkDatabase } from '../db/database.js';
import type { AppConfig } from '../config.js';
import { requireApiKey, type AuthedRequest } from '../middleware/security.js';
import { asyncRoute } from '../middleware/errors.js';

/**
 * Privileged routes used by the Builder when the owner clicks "Publish".
 * All routes require a valid API key. Every body is validated with Zod before
 * it touches the database.
 */
export function adminRouter(db: ForgeLinkDatabase, config: AppConfig): Router {
  const router = Router();
  const guard = requireApiKey(config, (hash) => db.isApiKeyValid(hash));

  const publishServerSchema = z.object({
    id: z.string().min(1),
    gameId: gameIdSchema,
    name: z.string().min(1),
    description: z.string().default(''),
    server: serverConfigSchema,
  });

  // Publish / update the server identity + connection info.
  router.post(
    '/publish/server',
    guard,
    asyncRoute(async (req: AuthedRequest, res) => {
      const body = publishServerSchema.parse(req.body);
      db.upsertServer({
        id: body.id,
        gameId: body.gameId,
        name: body.name,
        description: body.description,
        serverIp: body.server.serverIp,
        gamePort: body.server.gamePort,
        queryPort: body.server.queryPort,
        website: body.server.website,
        discord: body.server.discord,
      });
      res.json({ ok: true });
    }),
  );

  // Publish a launcher version (auto-update chain).
  router.post(
    '/publish/version',
    guard,
    asyncRoute(async (req: AuthedRequest, res) => {
      const body = z
        .object({ serverId: z.string().min(1), descriptor: updateDescriptorSchema, filePath: z.string().min(1) })
        .parse(req.body);
      db.addLauncherVersion(body.serverId, body.descriptor, body.filePath);
      res.json({ ok: true });
    }),
  );

  // Publish the current mod manifest.
  router.post(
    '/publish/manifest',
    guard,
    asyncRoute(async (req: AuthedRequest, res) => {
      const body = z.object({ serverId: z.string().min(1), manifest: manifestSchema }).parse(req.body);
      db.putManifest(body.serverId, body.manifest);
      res.json({ ok: true });
    }),
  );

  // Publish the news feed (replaces existing).
  router.post(
    '/publish/news',
    guard,
    asyncRoute(async (req: AuthedRequest, res) => {
      const body = z
        .object({ serverId: z.string().min(1), news: z.array(newsEntrySchema) })
        .parse(req.body);
      db.replaceNews(body.serverId, body.news);
      res.json({ ok: true });
    }),
  );

  // Publish the launcher branding + auto-join config (served at /api/config).
  router.post(
    '/publish/config',
    guard,
    asyncRoute(async (req: AuthedRequest, res) => {
      const body = z
        .object({
          serverName: z.string().min(1),
          autoJoin: z.object({
            serverIp: z.string().min(1),
            gamePort: z.number().int(),
            password: z.string().default(''),
          }),
          branding: z
            .object({
              logoUrl: z.string().default(''),
              backgroundUrl: z.string().default(''),
              primaryColor: z.string().default('#6d28d9'),
              accentColor: z.string().default('#22d3ee'),
              website: z.string().default(''),
              discord: z.string().default(''),
            })
            .default({}),
        })
        .parse(req.body);
      db.putSiteConfig(body);
      res.json({ ok: true });
    }),
  );

  // Analytics summary for the owner dashboard.
  router.get(
    '/analytics/:serverId',
    guard,
    asyncRoute(async (req: AuthedRequest, res) => {
      res.json(db.analyticsSummary(req.params.serverId));
    }),
  );

  return router;
}
