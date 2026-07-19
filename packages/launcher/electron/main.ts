import { app, BrowserWindow, ipcMain, shell } from 'electron';
import path from 'node:path';
import os from 'node:os';
import { randomUUID } from 'node:crypto';
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { createLogger } from '@forgelink/shared';
import { loadLauncherConfig, type LauncherConfig } from './services/launcher-config.js';
import { ApiClient } from './services/api-client.js';
import { synchronizeMods } from './services/mod-sync.js';
import { checkForUpdate, downloadUpdate } from './services/updater.js';
import { launchAndJoin } from './services/game-launcher.js';
import { IPC } from './ipc-contract.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const logger = createLogger('launcher:main');

let mainWindow: BrowserWindow | null = null;
let config: LauncherConfig;
let api: ApiClient;
let clientId: string;

/** Stable per-install anonymous id for analytics. */
function resolveClientId(): string {
  const file = path.join(app.getPath('userData'), 'client-id');
  if (existsSync(file)) return readFileSync(file, 'utf8').trim();
  const id = randomUUID();
  writeFileSync(file, id);
  return id;
}

/** Where downloaded mods live for this launcher install. */
function modsDir(): string {
  return path.join(app.getPath('userData'), 'mods');
}

function createWindow(): void {
  mainWindow = new BrowserWindow({
    width: 1100,
    height: 720,
    minWidth: 900,
    minHeight: 640,
    backgroundColor: '#0b0b12',
    frame: true,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false,
    },
  });

  const devUrl = process.env.VITE_DEV_SERVER_URL;
  if (devUrl) {
    void mainWindow.loadURL(devUrl);
  } else {
    void mainWindow.loadFile(path.join(__dirname, '..', 'dist', 'index.html'));
  }
}

function registerIpc(): void {
  ipcMain.handle(IPC.getConfig, () => config);

  ipcMain.handle(IPC.getStatus, () => api.getStatus());
  ipcMain.handle(IPC.getNews, () => api.getNews());

  ipcMain.handle(IPC.sync, async (_e, _repair: boolean) => {
    const manifest = await api.getManifest();
    const result = await synchronizeMods({
      modsDir: modsDir(),
      manifest,
      api,
      publicKeyPem: config.verifySignatures ? config.publicKey : undefined,
      onProgress: (p) => mainWindow?.webContents.send(IPC.syncProgress, p),
    });
    await api.track(config.serverId, 'update_success', { metadata: { downloaded: result.downloaded } });
    return { downloaded: result.downloaded, deleted: result.deleted, unchanged: result.unchanged };
  });

  ipcMain.handle(IPC.checkUpdate, async () => {
    const descriptor = await api.getLatestVersion();
    const { updateAvailable } = checkForUpdate(descriptor, app.getVersion());
    return { updateAvailable, version: descriptor?.version ?? null };
  });

  ipcMain.handle(IPC.applyUpdate, async () => {
    const descriptor = await api.getLatestVersion();
    if (!descriptor) return { ok: false };
    const installerPath = await downloadUpdate(
      descriptor,
      path.join(os.tmpdir(), 'forgelink-update'),
      config.verifySignatures ? config.publicKey : undefined,
      (bytes, total) => mainWindow?.webContents.send(IPC.updateProgress, bytes, total),
    );
    // Run the installer and quit so it can replace the running app.
    await shell.openPath(installerPath);
    setTimeout(() => app.quit(), 1500);
    return { ok: true };
  });

  ipcMain.handle(IPC.play, async () => {
    await api.track(config.serverId, 'launch');
    return launchAndJoin(config);
  });

  ipcMain.handle(IPC.openExternal, (_e, url: string) => shell.openExternal(url));
}

/**
 * Merge server-published config over the bundled config so branding, server
 * name and auto-join can be updated from the server without a new build.
 */
async function applyRemoteConfig(): Promise<void> {
  const remote = await api.getRemoteConfig();
  if (!remote) return;
  if (typeof remote.serverName === 'string') config.serverName = remote.serverName;
  const rb = remote.branding as Record<string, string> | undefined;
  if (rb) {
    if (rb.logoUrl) config.branding.serverLogo = rb.logoUrl;
    if (rb.backgroundUrl) config.branding.backgroundImage = rb.backgroundUrl;
    if (rb.primaryColor) config.branding.primaryColor = rb.primaryColor;
    if (rb.accentColor) config.branding.accentColor = rb.accentColor;
    if (rb.website) config.website = rb.website;
    if (rb.discord) config.discord = rb.discord;
  }
  const aj = remote.autoJoin as { serverIp?: string; gamePort?: number; password?: string } | undefined;
  if (aj) {
    if (aj.serverIp) config.autoJoin.serverIp = aj.serverIp;
    if (typeof aj.gamePort === 'number') config.autoJoin.gamePort = aj.gamePort;
    if (typeof aj.password === 'string') config.autoJoin.password = aj.password;
  }
  logger.info('Applied server-published config', { server: config.serverName });
}

app.whenReady().then(async () => {
  clientId = resolveClientId();
  config = loadLauncherConfig(path.dirname(app.getPath('exe')));
  api = new ApiClient(config.apiBase.replace(/\/$/, ''), clientId);
  logger.info('Launcher starting', { server: config.serverName, apiBase: config.apiBase });

  // Pull live branding/auto-join from the server (best-effort).
  await applyRemoteConfig();

  // Record the install/first-launch download event once.
  void api.track(config.serverId, 'download');

  registerIpc();
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

// Report uncaught crashes to analytics.
process.on('uncaughtException', (err) => {
  logger.error('Uncaught exception', { error: err.message });
  void api?.track(config.serverId, 'crash', { metadata: { message: err.message } });
});
