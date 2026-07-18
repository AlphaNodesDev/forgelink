import type { Manifest, ModFileEntry } from './types.js';
import { manifestSchema } from './schemas.js';
import { signPayload, verifyPayload } from './crypto.js';
import type { GameId } from './games.js';

/**
 * Manifest utilities: build, canonicalize, sign, verify and diff mod manifests.
 * The launcher and builder both depend on the diff being deterministic, so file
 * lists are always sorted by path before hashing or signing.
 */

/** Produce the exact byte string that gets signed. Excludes the signature itself. */
export function canonicalizeManifest(manifest: Manifest): string {
  const sortedFiles = [...manifest.files].sort((a, b) => a.path.localeCompare(b.path));
  const canonical = {
    schemaVersion: manifest.schemaVersion,
    gameId: manifest.gameId,
    version: manifest.version,
    generatedAt: manifest.generatedAt,
    totalSize: manifest.totalSize,
    files: sortedFiles,
  };
  return JSON.stringify(canonical);
}

export interface BuildManifestInput {
  gameId: GameId;
  version: string;
  files: ModFileEntry[];
  /** Optional PEM private key; when provided the manifest is signed. */
  privateKeyPem?: string;
}

/** Build a fully-formed, optionally-signed manifest from a list of file entries. */
export function buildManifest(input: BuildManifestInput): Manifest {
  const files = [...input.files].sort((a, b) => a.path.localeCompare(b.path));
  const totalSize = files.reduce((sum, f) => sum + f.size, 0);

  const base: Manifest = manifestSchema.parse({
    schemaVersion: 1,
    gameId: input.gameId,
    version: input.version,
    generatedAt: new Date().toISOString(),
    totalSize,
    files,
  });

  if (input.privateKeyPem) {
    base.signature = signPayload(canonicalizeManifest(base), input.privateKeyPem);
  }
  return base;
}

/** Verify a manifest's detached signature against a public key. */
export function verifyManifest(manifest: Manifest, publicKeyPem: string): boolean {
  if (!manifest.signature) return false;
  return verifyPayload(canonicalizeManifest(manifest), manifest.signature, publicKeyPem);
}

export interface ManifestDiff {
  /** Files present remotely but missing/changed locally — need downloading. */
  toDownload: ModFileEntry[];
  /** Files present locally but no longer in the remote manifest — should be deleted. */
  toDelete: string[];
  /** Files that already match by hash — nothing to do. */
  unchanged: ModFileEntry[];
  /** Total bytes that must be downloaded to become up to date. */
  downloadSize: number;
}

/**
 * Compute what the launcher must do to move from its `local` state to the
 * `remote` manifest. `local` is a map of relative path -> sha256 as observed on
 * the player's disk.
 */
export function diffManifest(remote: Manifest, local: Map<string, string>): ManifestDiff {
  const toDownload: ModFileEntry[] = [];
  const unchanged: ModFileEntry[] = [];
  const remotePaths = new Set<string>();

  for (const file of remote.files) {
    remotePaths.add(file.path);
    const localHash = local.get(file.path);
    if (localHash && localHash === file.sha256) {
      unchanged.push(file);
    } else {
      toDownload.push(file);
    }
  }

  const toDelete: string[] = [];
  for (const localPath of local.keys()) {
    if (!remotePaths.has(localPath)) toDelete.push(localPath);
  }

  const downloadSize = toDownload.reduce((sum, f) => sum + f.size, 0);
  return { toDownload, toDelete, unchanged, downloadSize };
}
