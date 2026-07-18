import { z } from 'zod';
import { GAME_IDS } from './games.js';

/**
 * Zod schemas are the single source of truth for the shape of a ForgeLink
 * project. TypeScript types are inferred from them (see `types.ts`) so the
 * runtime validation and the compile-time types can never drift apart.
 */

export const gameIdSchema = z.enum(GAME_IDS);

export const serverVisibilitySchema = z.enum(['public', 'private']);
export const reverseProxySchema = z.enum(['nginx', 'apache', 'none']);
export const themeModeSchema = z.enum(['dark', 'light']);
export const databaseKindSchema = z.enum(['sqlite', 'postgres']);

/** Basic project identity captured on creation. */
export const projectMetaSchema = z.object({
  name: z.string().min(1, 'Project name is required').max(120),
  gameId: gameIdSchema,
  serverName: z.string().min(1, 'Server name is required').max(120),
  description: z.string().max(2000).default(''),
  version: z.string().min(1).default('1.0.0'),
  owner: z.string().min(1, 'Owner is required').max(120),
});

/** Server connection + presentation configuration. */
export const serverConfigSchema = z.object({
  serverIp: z.string().min(1, 'Server IP or hostname is required'),
  /** API/web port. */
  port: z.number().int().min(1).max(65535).default(443),
  /** Game traffic port. */
  gamePort: z.number().int().min(1).max(65535).default(26900),
  queryPort: z.number().int().min(1).max(65535).default(26900),
  region: z.string().default('NA'),
  serverPassword: z.string().default(''),
  adminPassword: z.string().default(''),
  visibility: serverVisibilitySchema.default('public'),
  website: z.string().url().or(z.literal('')).default(''),
  discord: z.string().url().or(z.literal('')).default(''),
  rules: z.array(z.string()).default([]),
});

/** Domain / reverse-proxy configuration used to generate deployment configs. */
export const domainConfigSchema = z.object({
  ownsDomain: z.boolean().default(false),
  domain: z.string().default(''),
  subdomain: z.string().default(''),
  useHttps: z.boolean().default(true),
  reverseProxy: reverseProxySchema.default('nginx'),
  /** Email used by Certbot for Let's Encrypt registration. */
  certbotEmail: z.string().email().or(z.literal('')).default(''),
});

/** Branding assets and theme. Asset fields hold repo-relative paths. */
export const brandingSchema = z.object({
  launcherIcon: z.string().default(''),
  backgroundImage: z.string().default(''),
  banner: z.string().default(''),
  serverLogo: z.string().default(''),
  splashScreen: z.string().default(''),
  primaryColor: z.string().regex(/^#([0-9a-fA-F]{6})$/).default('#6d28d9'),
  accentColor: z.string().regex(/^#([0-9a-fA-F]{6})$/).default('#22d3ee'),
  fontFamily: z.string().default('Inter'),
  themeMode: themeModeSchema.default('dark'),
  customCss: z.string().default(''),
});

/** Security-related switches for the generated distribution. */
export const securityConfigSchema = z.object({
  enforceHttps: z.boolean().default(true),
  jwtEnabled: z.boolean().default(true),
  apiKeyEnabled: z.boolean().default(true),
  rateLimitPerMinute: z.number().int().min(1).max(100000).default(120),
  verifyChecksums: z.boolean().default(true),
  verifySignatures: z.boolean().default(true),
  encryptConfig: z.boolean().default(true),
});

/** Where the server installation lives on the owner's machine. */
export const serverInstallationSchema = z.object({
  path: z.string().min(1, 'Server folder path is required'),
  detectedVersion: z.string().default(''),
  /** Relative sub-path to the mods directory within the installation. */
  modsPath: z.string().default('Mods'),
  valid: z.boolean().default(false),
});

/** A single news / changelog entry surfaced by the launcher and website. */
export const newsEntrySchema = z.object({
  id: z.string(),
  title: z.string().min(1).max(200),
  body: z.string().max(10000),
  author: z.string().default(''),
  publishedAt: z.string(), // ISO-8601
  pinned: z.boolean().default(false),
});

/** Full project document persisted by the Builder. */
export const projectSchema = z.object({
  schemaVersion: z.literal(1).default(1),
  id: z.string(),
  createdAt: z.string(),
  updatedAt: z.string(),
  meta: projectMetaSchema,
  installation: serverInstallationSchema,
  server: serverConfigSchema,
  domain: domainConfigSchema,
  branding: brandingSchema,
  security: securityConfigSchema,
  database: databaseKindSchema.default('sqlite'),
  news: z.array(newsEntrySchema).default([]),
});

/** ---- Mod synchronization manifest ---- */

export const modFileEntrySchema = z.object({
  /** POSIX-style path relative to the mods root. */
  path: z.string(),
  sha256: z.string().length(64),
  size: z.number().int().nonnegative(),
});

export const manifestSchema = z.object({
  schemaVersion: z.literal(1).default(1),
  gameId: gameIdSchema,
  /** Manifest version, bumped whenever any file changes. */
  version: z.string(),
  generatedAt: z.string(),
  /** Total byte size of all files. */
  totalSize: z.number().int().nonnegative(),
  files: z.array(modFileEntrySchema),
  /** Optional detached signature over the canonicalized file list. */
  signature: z.string().optional(),
});

/** Launcher auto-update descriptor (version.json). */
export const updateDescriptorSchema = z.object({
  version: z.string(),
  releasedAt: z.string(),
  url: z.string().url(),
  sha256: z.string().length(64),
  size: z.number().int().nonnegative(),
  mandatory: z.boolean().default(false),
  notes: z.string().default(''),
  signature: z.string().optional(),
});
