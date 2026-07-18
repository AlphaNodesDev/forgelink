import { spawn } from 'node:child_process';
import { shell } from 'electron';
import { defaultRegistry } from '@forgelink/adapters';
import { createLogger, type GameId, type ServerConfig } from '@forgelink/shared';
import type { LauncherConfig } from './launcher-config.js';

/**
 * Launches the game and auto-joins the configured server using the game adapter
 * for this launcher. The adapter produces a LaunchPlan; we either open a
 * protocol URI via the OS shell (steam:// etc.) or spawn an executable.
 */
const logger = createLogger('launcher:game');

export interface LaunchResult {
  started: boolean;
  description: string;
}

export async function launchAndJoin(config: LauncherConfig): Promise<LaunchResult> {
  const gameId = config.gameId as GameId;
  if (!defaultRegistry.has(gameId)) {
    throw new Error(`No adapter available for game "${gameId}"`);
  }
  const adapter = defaultRegistry.get(gameId);

  // Build a minimal ServerConfig from the launcher's auto-join settings.
  const server: ServerConfig = {
    serverIp: config.autoJoin.serverIp,
    port: 443,
    gamePort: config.autoJoin.gamePort,
    queryPort: config.autoJoin.gamePort,
    region: 'NA',
    serverPassword: config.autoJoin.password,
    adminPassword: '',
    visibility: 'public',
    website: '',
    discord: '',
    rules: [],
  };

  const plan = adapter.buildLaunchPlan({ installPath: '', server });
  logger.info('Launching game', { description: plan.description, target: plan.target });

  if (plan.useShell) {
    await shell.openExternal(plan.target);
  } else {
    const child = spawn(plan.target, plan.args, { detached: true, stdio: 'ignore' });
    child.unref();
  }

  return { started: true, description: plan.description };
}
