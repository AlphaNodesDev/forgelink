import { readFileSync, existsSync } from 'node:fs';
import path from 'node:path';
import { z } from 'zod';
import { brandingSchema, gameIdSchema } from '@forgelink/shared';

/**
 * Loads the `launcher-config.json` produced by the Builder and shipped inside
 * the installer. This is the launcher's entire identity: which API to talk to,
 * which server to join, branding, and integrity settings.
 */
export const launcherConfigSchema = z.object({
  apiBase: z.string().url(),
  serverId: z.string(),
  serverName: z.string(),
  gameId: gameIdSchema,
  verifySignatures: z.boolean().default(true),
  verifyChecksums: z.boolean().default(true),
  publicKey: z.string().default(''),
  website: z.string().default(''),
  discord: z.string().default(''),
  branding: brandingSchema,
  autoJoin: z.object({
    serverIp: z.string(),
    gamePort: z.number().int(),
    password: z.string().default(''),
  }),
});

export type LauncherConfig = z.infer<typeof launcherConfigSchema>;

/**
 * Resolve and parse the launcher config. Searches next to the executable first
 * (production install), then falls back to a dev fixture so `npm run dev` works.
 */
export function loadLauncherConfig(baseDir: string): LauncherConfig {
  const candidates = [
    path.join(baseDir, 'launcher-config.json'),
    path.join(baseDir, '..', 'launcher-config.json'),
    path.join(process.cwd(), 'launcher-config.dev.json'),
  ];
  for (const candidate of candidates) {
    if (existsSync(candidate)) {
      return launcherConfigSchema.parse(JSON.parse(readFileSync(candidate, 'utf8')));
    }
  }
  // Safe development default so the UI renders without an installer-provided file.
  return launcherConfigSchema.parse({
    apiBase: 'http://localhost:8080',
    serverId: 'dev-server',
    serverName: 'Dev Server',
    gameId: 'seven-days-to-die',
    verifySignatures: false,
    verifyChecksums: true,
    publicKey: '',
    branding: brandingSchema.parse({}),
    autoJoin: { serverIp: '127.0.0.1', gamePort: 26900, password: '' },
  });
}
