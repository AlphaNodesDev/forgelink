import type { z } from 'zod';
import type {
  brandingSchema,
  databaseKindSchema,
  domainConfigSchema,
  manifestSchema,
  modFileEntrySchema,
  newsEntrySchema,
  projectMetaSchema,
  projectSchema,
  reverseProxySchema,
  securityConfigSchema,
  serverConfigSchema,
  serverInstallationSchema,
  serverVisibilitySchema,
  themeModeSchema,
  updateDescriptorSchema,
} from './schemas.js';

/**
 * All domain types are inferred from the Zod schemas so validation and typing
 * stay in lockstep. Import these types anywhere; import the schemas only where
 * you actually need to parse/validate untrusted input.
 */

export type ServerVisibility = z.infer<typeof serverVisibilitySchema>;
export type ReverseProxy = z.infer<typeof reverseProxySchema>;
export type ThemeMode = z.infer<typeof themeModeSchema>;
export type DatabaseKind = z.infer<typeof databaseKindSchema>;

export type ProjectMeta = z.infer<typeof projectMetaSchema>;
export type ServerConfig = z.infer<typeof serverConfigSchema>;
export type DomainConfig = z.infer<typeof domainConfigSchema>;
export type Branding = z.infer<typeof brandingSchema>;
export type SecurityConfig = z.infer<typeof securityConfigSchema>;
export type ServerInstallation = z.infer<typeof serverInstallationSchema>;
export type NewsEntry = z.infer<typeof newsEntrySchema>;
export type Project = z.infer<typeof projectSchema>;

export type ModFileEntry = z.infer<typeof modFileEntrySchema>;
export type Manifest = z.infer<typeof manifestSchema>;
export type UpdateDescriptor = z.infer<typeof updateDescriptorSchema>;

/** Live server status returned by an adapter's status query. */
export interface ServerStatus {
  online: boolean;
  playersOnline: number;
  playersMax: number;
  /** Round-trip latency in milliseconds, if measurable. */
  pingMs: number | null;
  /** Adapter-reported game version, if available. */
  version: string | null;
  /** ISO-8601 timestamp the status was captured. */
  checkedAt: string;
}

/** Result of an adapter validating a server installation folder. */
export interface DetectionResult {
  valid: boolean;
  detectedVersion: string | null;
  /** Absolute path to the mods directory, if one exists. */
  modsPath: string | null;
  /** Human-readable notes: what was found, what was missing. */
  notes: string[];
  /** Populated when `valid` is false. */
  errors: string[];
}
