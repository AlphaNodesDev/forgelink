#!/usr/bin/env node
import { mkdirSync } from 'node:fs';
import { loadConfig } from './config.js';
import { buildApp } from './app.js';

/**
 * ForgeLink Server API entry point. Loads config from the environment, ensures
 * storage/data directories exist, starts the HTTP server and wires graceful
 * shutdown for PM2/systemd.
 */
function main(): void {
  const config = loadConfig();
  mkdirSync(config.dataDir, { recursive: true });
  mkdirSync(config.storageDir, { recursive: true });

  const { app, db, logger } = buildApp(config);

  const server = app.listen(config.port, config.host, () => {
    logger.info('ForgeLink Server API listening', {
      host: config.host,
      port: config.port,
      publicUrl: config.publicUrl,
    });
  });

  const shutdown = (signal: string): void => {
    logger.info('Shutting down', { signal });
    server.close(() => {
      db.close();
      process.exit(0);
    });
    // Force-exit if connections don't drain in time.
    setTimeout(() => process.exit(1), 10_000).unref();
  };

  process.on('SIGINT', () => shutdown('SIGINT'));
  process.on('SIGTERM', () => shutdown('SIGTERM'));
}

main();
