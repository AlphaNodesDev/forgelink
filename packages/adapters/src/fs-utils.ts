import { readdir, stat } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { sha256File, type ModFileEntry } from '@forgelink/shared';

/**
 * Filesystem helpers shared by adapters. Kept generic so any adapter can reuse
 * them regardless of how a specific game lays out its files.
 */

/** True if a path exists and is a directory. */
export async function isDirectory(p: string): Promise<boolean> {
  try {
    return (await stat(p)).isDirectory();
  } catch {
    return false;
  }
}

/** True if any of the given relative paths exist under `root`. */
export function anySignaturePresent(root: string, signatures: string[]): boolean {
  return signatures.some((sig) => existsSync(path.join(root, sig)));
}

/** Recursively collect absolute file paths under `dir`. */
export async function walkFiles(dir: string): Promise<string[]> {
  const results: string[] = [];
  async function recurse(current: string): Promise<void> {
    let entries;
    try {
      entries = await readdir(current, { withFileTypes: true });
    } catch {
      return; // Unreadable directory — skip rather than fail the whole scan.
    }
    for (const entry of entries) {
      const full = path.join(current, entry.name);
      if (entry.isDirectory()) {
        await recurse(full);
      } else if (entry.isFile()) {
        results.push(full);
      }
    }
  }
  await recurse(dir);
  return results;
}

/**
 * Scan a mods root into hashed manifest entries. Paths are normalised to
 * POSIX-style and made relative to `modsRoot` so manifests are portable across
 * operating systems.
 */
export async function scanDirectoryToEntries(modsRoot: string): Promise<ModFileEntry[]> {
  if (!(await isDirectory(modsRoot))) return [];
  const files = await walkFiles(modsRoot);
  const entries: ModFileEntry[] = [];
  for (const file of files) {
    const [hash, info] = await Promise.all([sha256File(file), stat(file)]);
    const relative = path.relative(modsRoot, file).split(path.sep).join('/');
    entries.push({ path: relative, sha256: hash, size: info.size });
  }
  entries.sort((a, b) => a.path.localeCompare(b.path));
  return entries;
}
