import type { NewsEntry, ServerStatus } from '@forgelink/shared';
import type { LauncherConfig } from './services/launcher-config.js';
import type { SyncProgress } from './services/mod-sync.js';

/** Typed IPC contract between the Launcher main process and its renderer. */
export interface LauncherApi {
  getConfig(): Promise<LauncherConfig>;
  getStatus(): Promise<ServerStatus | null>;
  getNews(): Promise<NewsEntry[]>;

  /** Run mod synchronization (repair = force full re-verify). */
  sync(repair: boolean): Promise<{ downloaded: number; deleted: number; unchanged: number }>;

  /** Check for a launcher self-update. */
  checkUpdate(): Promise<{ updateAvailable: boolean; version: string | null }>;
  /** Download and apply the update, then relaunch. */
  applyUpdate(): Promise<{ ok: boolean }>;

  /** Launch the game and auto-join the server. */
  play(): Promise<{ started: boolean; description: string }>;

  /** Open an external URL (website/discord) in the default browser. */
  openExternal(url: string): Promise<void>;

  onSyncProgress(handler: (p: SyncProgress) => void): () => void;
  onUpdateProgress(handler: (bytes: number, total: number) => void): () => void;
}

export const IPC = {
  getConfig: 'launcher:getConfig',
  getStatus: 'launcher:getStatus',
  getNews: 'launcher:getNews',
  sync: 'launcher:sync',
  checkUpdate: 'launcher:checkUpdate',
  applyUpdate: 'launcher:applyUpdate',
  play: 'launcher:play',
  openExternal: 'launcher:openExternal',
  syncProgress: 'launcher:syncProgress',
  updateProgress: 'launcher:updateProgress',
} as const;
