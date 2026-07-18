import express, { type Express } from 'express';
import helmet from 'helmet';
import cors from 'cors';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import { createLogger, type Logger } from '@forgelink/shared';
import type { AppConfig } from './config.js';
import { ForgeLinkDatabase } from './db/database.js';
import { publicRouter } from './routes/public.js';
import { adminRouter } from './routes/admin.js';
import { analyticsRouter } from './routes/analytics.js';
import { errorHandler, notFoundHandler } from './middleware/errors.js';

/**
 * Assembles the Express application: security headers, CORS, compression, rate
 * limiting, JSON parsing, then the route groups. Returned alongside the db and
 * logger so callers (server bootstrap, tests) control the lifecycle.
 */
export interface BuiltApp {
  app: Express;
  db: ForgeLinkDatabase;
  logger: Logger;
}

export function buildApp(config: AppConfig): BuiltApp {
  const logger = createLogger('server-api', { minLevel: config.logLevel });
  const db = new ForgeLinkDatabase(config.dbPath);
  const app = express();

  app.disable('x-powered-by');
  app.set('trust proxy', 1); // Behind Nginx/Apache reverse proxy.

  app.use(helmet());
  app.use(
    cors({
      origin: config.corsOrigins.includes('*') ? true : config.corsOrigins,
      credentials: true,
    }),
  );
  app.use(compression());
  app.use(express.json({ limit: '5mb' }));

  const limiter = rateLimit({
    windowMs: 60_000,
    max: config.rateLimitPerMin,
    standardHeaders: true,
    legacyHeaders: false,
  });
  app.use('/api', limiter);

  // Health check for load balancers / PM2 / systemd watchdog.
  app.get('/healthz', (_req, res) => res.json({ status: 'ok', uptime: process.uptime() }));

  app.use('/api', publicRouter(db, config, logger));
  app.use('/api/admin', adminRouter(db, config));
  app.use('/api/analytics', analyticsRouter(db));

  app.use(notFoundHandler);
  app.use(errorHandler(logger));

  return { app, db, logger };
}
