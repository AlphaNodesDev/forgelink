import { createWriteStream } from 'node:fs';
import { mkdir, rm } from 'node:fs/promises';
import path from 'node:path';
import { Readable } from 'node:stream';
import { pipeline } from 'node:stream/promises';
import { sha256File, verifyPayload, createLogger, type UpdateDescriptor } from '@forgelink/shared';

/**
 * Launcher self-update. Compares the running version against the descriptor
 * served at /api/version. When a newer build exists it downloads the installer,
 * verifies checksum (and optional signature), and hands the path back so the
 * main process can run it and quit — a standard download/replace/restart flow.
 */
const logger = createLogger('launcher:updater');

/** Semver-ish comparison sufficient for x.y.z version strings. */
export function isNewer(remote: string, current: string): boolean {
  const parse = (v: string): number[] => v.split(/[.\-+]/).map((n) => parseInt(n, 10) || 0);
  const a = parse(remote);
  const b = parse(current);
  const len = Math.max(a.length, b.length);
  for (let i = 0; i < len; i++) {
    const x = a[i] ?? 0;
    const y = b[i] ?? 0;
    if (x > y) return true;
    if (x < y) return false;
  }
  return false;
}

export interface UpdateCheckResult {
  updateAvailable: boolean;
  descriptor: UpdateDescriptor | null;
}

export function checkForUpdate(
  descriptor: UpdateDescriptor | null,
  currentVersion: string,
): UpdateCheckResult {
  if (!descriptor) return { updateAvailable: false, descriptor: null };
  return { updateAvailable: isNewer(descriptor.version, currentVersion), descriptor };
}

/**
 * Download the update installer to a temp dir, verifying integrity. Returns the
 * absolute path to the downloaded installer.
 */
export async function downloadUpdate(
  descriptor: UpdateDescriptor,
  destDir: string,
  publicKeyPem: string | undefined,
  onProgress?: (bytes: number, total: number) => void,
): Promise<string> {
  await mkdir(destDir, { recursive: true });
  const fileName = `update-${descriptor.version}.exe`;
  const destPath = path.join(destDir, fileName);

  const res = await fetch(descriptor.url);
  if (!res.ok || !res.body) throw new Error(`Update download failed: ${res.status}`);

  let received = 0;
  const stream = Readable.fromWeb(res.body as import('stream/web').ReadableStream);
  stream.on('data', (chunk: Buffer) => {
    received += chunk.length;
    onProgress?.(received, descriptor.size);
  });
  await pipeline(stream, createWriteStream(destPath));

  // Integrity checks: checksum first, then optional signature over the descriptor.
  const actual = await sha256File(destPath);
  if (actual !== descriptor.sha256) {
    await rm(destPath, { force: true });
    throw new Error('Update checksum mismatch — aborting.');
  }
  if (publicKeyPem && descriptor.signature) {
    const payload = `${descriptor.version}:${descriptor.sha256}:${descriptor.size}`;
    if (!verifyPayload(payload, descriptor.signature, publicKeyPem)) {
      await rm(destPath, { force: true });
      throw new Error('Update signature verification failed — aborting.');
    }
  }

  logger.info('Update downloaded and verified', { version: descriptor.version, path: destPath });
  return destPath;
}
