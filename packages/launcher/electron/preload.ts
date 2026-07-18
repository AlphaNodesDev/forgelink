import { contextBridge, ipcRenderer } from 'electron';
import type { LauncherApi } from './ipc-contract.js';
import { IPC } from './ipc-contract.js';
import type { SyncProgress } from './services/mod-sync.js';

/** Typed, isolated bridge exposing `window.launcher` to the renderer. */
const api: LauncherApi = {
  getConfig: () => ipcRenderer.invoke(IPC.getConfig),
  getStatus: () => ipcRenderer.invoke(IPC.getStatus),
  getNews: () => ipcRenderer.invoke(IPC.getNews),
  sync: (repair: boolean) => ipcRenderer.invoke(IPC.sync, repair),
  checkUpdate: () => ipcRenderer.invoke(IPC.checkUpdate),
  applyUpdate: () => ipcRenderer.invoke(IPC.applyUpdate),
  play: () => ipcRenderer.invoke(IPC.play),
  openExternal: (url: string) => ipcRenderer.invoke(IPC.openExternal, url),
  onSyncProgress: (handler: (p: SyncProgress) => void) => {
    const listener = (_e: unknown, p: SyncProgress): void => handler(p);
    ipcRenderer.on(IPC.syncProgress, listener);
    return () => ipcRenderer.removeListener(IPC.syncProgress, listener);
  },
  onUpdateProgress: (handler: (bytes: number, total: number) => void) => {
    const listener = (_e: unknown, bytes: number, total: number): void => handler(bytes, total);
    ipcRenderer.on(IPC.updateProgress, listener);
    return () => ipcRenderer.removeListener(IPC.updateProgress, listener);
  },
};

contextBridge.exposeInMainWorld('launcher', api);
