import { readFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import net from 'node:net';
import type {
  DetectionResult,
  ModFileEntry,
  ServerStatus,
} from '@forgelink/shared';
import type { AdapterContext, GameAdapter, LaunchPlan } from '../adapter.js';
import { anySignaturePresent, isDirectory, scanDirectoryToEntries } from '../fs-utils.js';

/**
 * Adapter for 7 Days To Die dedicated servers.
 *
 * 7DTD ships a "7DaysToDieServer.exe" (Windows) / "7DaysToDieServer.x86_64"
 * (Linux) alongside a `serverconfig.xml`. Mods live in a `Mods/` directory.
 * Players connect with the game client via the steam:// connect URI or the
 * in-game console `connecttoserver` command.
 */

const STEAM_APP_ID = '251570'; // 7 Days To Die client app id.

/** Files that indicate a 7DTD dedicated-server installation. */
const SIGNATURE_FILES = [
  'serverconfig.xml',
  '7DaysToDieServer.exe',
  '7DaysToDieServer.x86_64',
  'startdedicated.bat',
];

/** Parse the simple `<property name="X" value="Y" />` entries in serverconfig.xml. */
function parseServerConfigXml(xml: string): Record<string, string> {
  const result: Record<string, string> = {};
  const propertyRegex = /<property\s+name="([^"]+)"\s+value="([^"]*)"\s*\/>/g;
  let match: RegExpExecArray | null;
  while ((match = propertyRegex.exec(xml)) !== null) {
    result[match[1]] = match[2];
  }
  return result;
}

/**
 * Measure a coarse TCP round-trip to the query port as a liveness+ping probe.
 * 7DTD does not expose a trivial unauthenticated player-count endpoint without
 * the web/telnet API being enabled, so we report reachability and ping and fall
 * back to configured max players. When the server's web API is enabled this can
 * be extended without touching any other layer.
 */
function probeTcp(host: string, port: number, timeoutMs = 3000): Promise<number | null> {
  return new Promise((resolve) => {
    const socket = new net.Socket();
    const start = Date.now();
    let settled = false;
    const done = (value: number | null) => {
      if (settled) return;
      settled = true;
      socket.destroy();
      resolve(value);
    };
    socket.setTimeout(timeoutMs);
    socket.once('connect', () => done(Date.now() - start));
    socket.once('timeout', () => done(null));
    socket.once('error', () => done(null));
    socket.connect(port, host);
  });
}

export class SevenDaysToDieAdapter implements GameAdapter {
  readonly id = 'seven-days-to-die' as const;
  readonly displayName = '7 Days To Die';
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
      errors.push(
        'No 7 Days To Die dedicated-server signature files found (expected serverconfig.xml or 7DaysToDieServer executable).',
      );
    }

    const configPath = path.join(installPath, 'serverconfig.xml');
    let detectedVersion: string | null = null;
    if (existsSync(configPath)) {
      notes.push('Found serverconfig.xml.');
      const versionFile = path.join(installPath, 'version.txt');
      if (existsSync(versionFile)) {
        try {
          detectedVersion = (await readFile(versionFile, 'utf8')).trim() || null;
        } catch {
          /* non-fatal */
        }
      }
    } else {
      errors.push('serverconfig.xml not found in the selected folder.');
    }

    const modsPath = await this.resolveModsPath(installPath);
    if (modsPath) notes.push(`Mods directory detected at ${modsPath}.`);
    else notes.push('No Mods directory present (vanilla server).');

    const savesPath = path.join(installPath, 'Saves');
    if (existsSync(savesPath)) notes.push('Found Saves directory.');

    return {
      valid: errors.length === 0,
      detectedVersion,
      modsPath,
      notes,
      errors,
    };
  }

  async resolveModsPath(installPath: string): Promise<string | null> {
    const modsPath = path.join(installPath, 'Mods');
    return (await isDirectory(modsPath)) ? modsPath : null;
  }

  async scanMods(installPath: string): Promise<ModFileEntry[]> {
    const modsPath = await this.resolveModsPath(installPath);
    if (!modsPath) return [];
    return scanDirectoryToEntries(modsPath);
  }

  buildLaunchPlan(context: AdapterContext): LaunchPlan {
    const { server } = context;
    // steam://connect/<ip>:<port>/<password> launches the client and joins.
    const address = `${server.serverIp}:${server.gamePort}`;
    const passwordSuffix = server.serverPassword ? `/${encodeURIComponent(server.serverPassword)}` : '';
    const target = `steam://run/${STEAM_APP_ID}//+connect_to_ip ${address}${passwordSuffix}`;
    return {
      target,
      args: [],
      useShell: true,
      description: `Launch 7 Days To Die via Steam and connect to ${address}.`,
    };
  }

  async queryStatus(context: AdapterContext): Promise<ServerStatus> {
    const { server, installPath } = context;
    const host = server.serverIp;
    const port = server.queryPort || server.gamePort;

    const pingMs = await probeTcp(host, port);
    const online = pingMs !== null;

    let playersMax = 0;
    try {
      const config = await this.readServerConfig(installPath);
      playersMax = Number.parseInt(config.ServerMaxPlayerCount ?? '0', 10) || 0;
    } catch {
      /* config not readable from this host — acceptable */
    }

    return {
      online,
      playersOnline: 0, // Requires web/telnet API; extend here when enabled.
      playersMax,
      pingMs,
      version: null,
      checkedAt: new Date().toISOString(),
    };
  }

  async readServerConfig(installPath: string): Promise<Record<string, string>> {
    const configPath = path.join(installPath, 'serverconfig.xml');
    if (!existsSync(configPath)) return {};
    try {
      const xml = await readFile(configPath, 'utf8');
      return parseServerConfigXml(xml);
    } catch {
      return {};
    }
  }
}

export const sevenDaysToDieAdapter = new SevenDaysToDieAdapter();
