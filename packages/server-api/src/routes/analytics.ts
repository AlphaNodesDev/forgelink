import { Router } from 'express';
import { z } from 'zod';
import type { ForgeLinkDatabase } from '../db/database.js';
import { asyncRoute } from '../middleware/errors.js';

/**
 * Analytics ingestion. The launcher posts anonymous events (install downloads,
 * update outcomes, mod downloads, crash reports, launches). No PII is required
 * — the client id is a random per-install UUID the launcher generates.
 */
export function analyticsRouter(db: ForgeLinkDatabase): Router {
  const router = Router();

  const eventSchema = z.object({
    serverId: z.string().min(1),
    eventType: z.enum(['download', 'update_success', 'update_fail', 'mod_download', 'crash', 'launch']),
    clientId: z.string().max(128).optional(),
    bytes: z.number().int().nonnegative().optional(),
    metadata: z.record(z.unknown()).optional(),
  });

  router.post(
    '/event',
    asyncRoute(async (req, res) => {
      const body = eventSchema.parse(req.body);
      db.recordEvent(body);
      res.json({ ok: true });
    }),
  );

  return router;
}
