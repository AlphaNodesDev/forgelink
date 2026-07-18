import path from 'node:path';
import { z } from 'zod';

/**
 * Runtime configuration for the Server API, loaded from environment variables.
 * Every value has a safe default so `npm run dev` works out of the box, while
 * production deployments override via the generated systemd/PM2 environment.
 */

const envSchema = z.object({
  FORGELINK_PORT: z.coerce.number().int().min(1).max(65535).default(8080),
  FORGELINK_HOST: z.string().default('0.0.0.0'),
  FORGELINK_DATA_DIR: z.string().default(path.resolve(process.cwd(), 'data')),
  /** Directory that holds distributable artifacts (launcher installers, mod files). */
  FORGELINK_STORAGE_DIR: z.string().default(path.resolve(process.cwd(), 'storage')),
  /** Secret used to sign JWTs. MUST be overridden in production. */
  FORGELINK_JWT_SECRET: z.string().min(16).default('change-me-in-production-please-32chars'),
  FORGELINK_JWT_TTL: z.string().default('12h'),
  /** Comma-separated list of valid API keys for privileged/publish routes. */
  FORGELINK_API_KEYS: z.string().default(''),
  FORGELINK_RATE_LIMIT_PER_MIN: z.coerce.number().int().min(1).default(120),
  /** Comma-separated CORS allow-list. '*' allows all (dev only). */
  FORGELINK_CORS_ORIGINS: z.string().default('*'),
  FORGELINK_LOG_LEVEL: z.enum(['debug', 'info', 'warn', 'error']).default('info'),
  /** Public base URL the API is reachable at, used to build download links. */
  FORGELINK_PUBLIC_URL: z.string().default('http://localhost:8080'),
});

export type AppConfig = {
  port: number;
  host: string;
  dataDir: string;
  storageDir: string;
  dbPath: string;
  jwtSecret: string;
  jwtTtl: string;
  apiKeys: string[];
  rateLimitPerMin: number;
  corsOrigins: string[];
  logLevel: 'debug' | 'info' | 'warn' | 'error';
  publicUrl: string;
};

export function loadConfig(env: NodeJS.ProcessEnv = process.env): AppConfig {
  const parsed = envSchema.parse(env);
  return {
    port: parsed.FORGELINK_PORT,
    host: parsed.FORGELINK_HOST,
    dataDir: parsed.FORGELINK_DATA_DIR,
    storageDir: parsed.FORGELINK_STORAGE_DIR,
    dbPath: path.join(parsed.FORGELINK_DATA_DIR, 'forgelink.db'),
    jwtSecret: parsed.FORGELINK_JWT_SECRET,
    jwtTtl: parsed.FORGELINK_JWT_TTL,
    apiKeys: parsed.FORGELINK_API_KEYS.split(',').map((k) => k.trim()).filter(Boolean),
    rateLimitPerMin: parsed.FORGELINK_RATE_LIMIT_PER_MIN,
    corsOrigins: parsed.FORGELINK_CORS_ORIGINS.split(',').map((o) => o.trim()).filter(Boolean),
    logLevel: parsed.FORGELINK_LOG_LEVEL,
    publicUrl: parsed.FORGELINK_PUBLIC_URL.replace(/\/$/, ''),
  };
}
