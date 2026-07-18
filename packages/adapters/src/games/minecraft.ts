import { readFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import net from 'node:net';
import type { DetectionResult, ModFileEntry, ServerStatus } from '@forgelink/shared';
import type { AdapterContext, GameAdapter, LaunchPlan } from '../adapter.js';
import { anySignaturePresent, isDirectory, scanDirectoryToEntries } from '../fs-utils.js';

/**
 * Reference adapter for Minecraft (Java Edition) dedicated servers.
 *
 * This demonstrates how little is required to add a second game: implement the
 * same `GameAdapter` interface. It is intentionally complete enough to detect a
 * server, scan a `mods/` folder (Forge/Fabric), plan a connect and probe the
 * port. Register it in `index.ts` to make Minecraft a first-class game.
 */

const SIGNATURE_FILES = ['server.properties', 'server.jar', 'eula.txt'];

function parseProperties(text: string): Record<string, string> {
  const out: Record<string, string> = {};
  for (const rawLine of text.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith('#')) continue;
    const eq = line.indexOf('=');
    if (eq === -1) continue;
    out[line.slice(0, eq).trim()] = line.slice(eq + 1).trim();
  }
  return out;
}

function probeTcp(host: string, port: number, timeoutMs = 3000): Promise<number | null> {
  return new Promise((resolve) => {
    const socket = new net.Socket();
    const start = Date.now();
    let settled = false;
    const done = (v: number | null) => {
      if (settled) return;
      settled = true;
      socket.destroy();
      resolve(v);
    };
    socket.setTimeout(timeoutMs);
    socket.once('connect', () => done(Date.now() - start));
    socket.once('timeout', () => done(null));
    socket.once('error', () => done(null));
    socket.connect(port, host);
  });
}

export class MinecraftAdapter implements GameAdapter {
  readonly id = 'minecraft' as const;
  readonly displayName = 'Minecraft';
  readonly signatureFiles = SIGNATURE_FILES;

  async detect(installPath: string): Promise<DetectionResult> {
    const notes: string[] = [];
    const errors: string[] = [];

    if (!(await isDirectory(installPath))) {
      return {
        valid: false,
        detectedVersion: null,
        modsPath: null,
        notes,
        errors: [`Path does not exist or is not a directory: ${installPath}`],
      };
    }
    if (!anySignaturePresent(installPath, SIGNATURE_FILES)) {
      errors.push('No Minecraft server signature files found (expected server.properties or server.jar).');
    } else {
      notes.push('Found Minecraft server files.');
    }

    const modsPath = await this.resolveModsPath(installPath);
    if (modsPath) notes.push(`Mods directory detected at ${modsPath}.`);

    return { valid: errors.length === 0, detectedVersion: null, modsPath, notes, errors };
  }

  async resolveModsPath(installPath: string): Promise<string | null> {
    const modsPath = path.join(installPath, 'mods');
    return (await isDirectory(modsPath)) ? modsPath : null;
  }

  async scanMods(installPath: string): Promise<ModFileEntry[]> {
    const modsPath = await this.resolveModsPath(installPath);
    if (!modsPath) return [];
    return scanDirectoryToEntries(modsPath);
  }

  buildLaunchPlan(context: AdapterContext): LaunchPlan {
    const { server } = context;
    const address = `${server.serverIp}:${server.gamePort}`;
    return {
      target: `minecraft://connect/${address}`,
      args: [],
      useShell: true,
      description: `Open Minecraft and connect to ${address}.`,
    };
  }

  async queryStatus(context: AdapterContext): Promise<ServerStatus> {
    const { server, installPath } = context;
    const port = server.gamePort || 25565;
    const pingMs = await probeTcp(server.serverIp, port);
    let playersMax = 0;
    try {
      const cfg = await this.readServerConfig(installPath);
      playersMax = Number.parseInt(cfg['max-players'] ?? '0', 10) || 0;
    } catch {
      /* ignore */
    }
    return {
      online: pingMs !== null,
      playersOnline: 0,
      playersMax,
      pingMs,
      version: null,
      checkedAt: new Date().toISOString(),
    };
  }

  async readServerConfig(installPath: string): Promise<Record<string, string>> {
    const p = path.join(installPath, 'server.properties');
    if (!existsSync(p)) return {};
    try {
      return parseProperties(await readFile(p, 'utf8'));
    } catch {
      return {};
    }
  }
}

export const minecraftAdapter = new MinecraftAdapter();
