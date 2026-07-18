import { createWriteStream, existsSync } from 'node:fs';
import { mkdir, rm, stat, rename } from 'node:fs/promises';
import path from 'node:path';
import { Readable } from 'node:stream';
import { pipeline } from 'node:stream/promises';
import {
  diffManifest,
  sha256File,
  verifyManifest,
  createLogger,
  type Manifest,
  type ModFileEntry,
} from '@forgelink/shared';
import { scanDirectoryToEntries } from '@forgelink/adapters';
import type { ApiClient } from './api-client.js';

/**
 * The mod synchronizer. Given a remote manifest and a local mods directory it:
 *   - computes a diff (download / delete / unchanged) via SHA-256
 *   - downloads only missing/changed files
 *   - resumes interrupted downloads using HTTP Range requests
 *   - verifies each downloaded file's checksum and repairs corrupted files
 *   - deletes mods removed from the manifest
 *
 * Progress is streamed to a callback so the renderer can render a live bar.
 */

export interface SyncProgress {
  phase: 'diff' | 'download' | 'verify' | 'cleanup' | 'done';
  file?: string;
  filesCompleted: number;
  filesTotal: number;
  bytesCompleted: number;
  bytesTotal: number;
}

export type SyncProgressReporter = (progress: SyncProgress) => void;

export interface SyncOptions {
  modsDir: string;
  manifest: Manifest;
  api: ApiClient;
  /** When set, verify the manifest signature before applying it. */
  publicKeyPem?: string;
  onProgress?: SyncProgressReporter;
}

export interface SyncResult {
  downloaded: number;
  deleted: number;
  unchanged: number;
  bytes: number;
}

const logger = createLogger('launcher:mod-sync');

/** Build a map of relative path -> sha256 for the local mods directory. */
export async function hashLocalMods(modsDir: string): Promise<Map<string, string>> {
  const map = new Map<string, string>();
  if (!existsSync(modsDir)) return map;
  const entries = await scanDirectoryToEntries(modsDir);
  for (const e of entries) map.set(e.path, e.sha256);
  return map;
}

/** Download a single file with resume support and checksum verification. */
async function downloadFile(
  api: ApiClient,
  modsDir: string,
  entry: ModFileEntry,
  onBytes: (delta: number) => void,
): Promise<void> {
  const destPath = path.join(modsDir, entry.path);
  const partPath = `${destPath}.part`;
  await mkdir(path.dirname(destPath), { recursive: true });

  // Determine how many bytes we already have (resume point).
  let resumeFrom = 0;
  if (existsSync(partPath)) {
    resumeFrom = (await stat(partPath)).size;
    if (resumeFrom > entry.size) {
      // Corrupt/overlong partial — start over.
      await rm(partPath, { force: true });
      resumeFrom = 0;
    }
  }

  const headers: Record<string, string> = {};
  if (resumeFrom > 0) headers.Range = `bytes=${resumeFrom}-`;

  const res = await fetch(api.modDownloadUrl(entry.path), { headers });
  if (!(res.ok || res.status === 206)) {
    throw new Error(`Download failed for ${entry.path}: ${res.status}`);
  }
  if (!res.body) throw new Error(`Empty body for ${entry.path}`);

  // Append when resuming (206), otherwise (re)create the part file.
  const append = res.status === 206 && resumeFrom > 0;
  const fileStream = createWriteStream(partPath, { flags: append ? 'a' : 'w' });

  const nodeStream = Readable.fromWeb(res.body as import('stream/web').ReadableStream);
  nodeStream.on('data', (chunk: Buffer) => onBytes(chunk.length));
  await pipeline(nodeStream, fileStream);

  // Verify checksum; repair by discarding and letting a re-run re-download.
  const actual = await sha256File(partPath);
  if (actual !== entry.sha256) {
    await rm(partPath, { force: true });
    throw new Error(`Checksum mismatch for ${entry.path} (expected ${entry.sha256}, got ${actual})`);
  }

  await rm(destPath, { force: true });
  await rename(partPath, destPath);
}

/** Run a full synchronization pass. */
export async function synchronizeMods(options: SyncOptions): Promise<SyncResult> {
  const { modsDir, manifest, api, publicKeyPem, onProgress } = options;

  if (publicKeyPem) {
    if (!verifyManifest(manifest, publicKeyPem)) {
      throw new Error('Manifest signature verification failed — refusing to sync.');
    }
    logger.info('Manifest signature verified');
  }

  await mkdir(modsDir, { recursive: true });

  onProgress?.({ phase: 'diff', filesCompleted: 0, filesTotal: 0, bytesCompleted: 0, bytesTotal: 0 });
  const local = await hashLocalMods(modsDir);
  const diff = diffManifest(manifest, local);

  const filesTotal = diff.toDownload.length;
  const bytesTotal = diff.downloadSize;
  let filesCompleted = 0;
  let bytesCompleted = 0;

  // Download phase (with per-file retry to repair transient corruption).
  for (const entry of diff.toDownload) {
    onProgress?.({
      phase: 'download',
      file: entry.path,
      filesCompleted,
      filesTotal,
      bytesCompleted,
      bytesTotal,
    });

    let attempt = 0;
    const maxAttempts = 3;
    // Retry loop repairs corrupted/interrupted downloads.
    while (true) {
      try {
        await downloadFile(api, modsDir, entry, (delta) => {
          bytesCompleted += delta;
          onProgress?.({
            phase: 'download',
            file: entry.path,
            filesCompleted,
            filesTotal,
            bytesCompleted,
            bytesTotal,
          });
        });
        break;
      } catch (err) {
        attempt += 1;
        logger.warn('Download attempt failed', { file: entry.path, attempt, error: String(err) });
        if (attempt >= maxAttempts) throw err;
      }
    }
    filesCompleted += 1;
  }

  // Cleanup phase: delete mods no longer in the manifest.
  onProgress?.({ phase: 'cleanup', filesCompleted, filesTotal, bytesCompleted, bytesTotal });
  for (const relative of diff.toDelete) {
    await rm(path.join(modsDir, relative), { force: true });
  }

  onProgress?.({ phase: 'done', filesCompleted, filesTotal, bytesCompleted, bytesTotal });
  await api.track(manifest.gameId /* placeholder serverId set by caller */, 'mod_download', {
    bytes: bytesCompleted,
    metadata: { downloaded: diff.toDownload.length, deleted: diff.toDelete.length },
  });

  return {
    downloaded: diff.toDownload.length,
    deleted: diff.toDelete.length,
    unchanged: diff.unchanged.length,
    bytes: bytesCompleted,
  };
}
