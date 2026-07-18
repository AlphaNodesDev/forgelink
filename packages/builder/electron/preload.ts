import { contextBridge, ipcRenderer } from 'electron';
import type { DetectionResult, Project, ProjectMeta } from '@forgelink/shared';
import type { BuilderApi } from './ipc-contract.js';
import { IPC } from './ipc-contract.js';
import type { BuildProgress } from './services/build-pipeline.js';

/**
 * Preload bridge. Exposes a typed, minimal `window.forgelink` API to the
 * renderer with context isolation on — the renderer never touches Node or IPC
 * directly, only these vetted methods.
 */
const api: BuilderApi = {
  listProjects: () => ipcRenderer.invoke(IPC.listProjects),
  getProject: (id) => ipcRenderer.invoke(IPC.getProject, id),
  createProject: (meta: ProjectMeta) => ipcRenderer.invoke(IPC.createProject, meta),
  saveProject: (project: Project) => ipcRenderer.invoke(IPC.saveProject, project),
  pickFolder: () => ipcRenderer.invoke(IPC.pickFolder),
  pickImage: () => ipcRenderer.invoke(IPC.pickImage),
  detectServer: (gameId, folder): Promise<DetectionResult> =>
    ipcRenderer.invoke(IPC.detectServer, gameId, folder),
  readServerConfig: (gameId, folder) => ipcRenderer.invoke(IPC.readServerConfig, gameId, folder),
  build: (projectId) => ipcRenderer.invoke(IPC.build, projectId),
  publish: (projectId, apiBase, apiKey) => ipcRenderer.invoke(IPC.publish, projectId, apiBase, apiKey),
  openOutput: (projectId) => ipcRenderer.invoke(IPC.openOutput, projectId),
  supportedGames: () => ipcRenderer.invoke(IPC.supportedGames),
  onBuildProgress: (handler: (progress: BuildProgress) => void) => {
    const listener = (_e: unknown, progress: BuildProgress): void => handler(progress);
    ipcRenderer.on(IPC.buildProgress, listener);
    return () => ipcRenderer.removeListener(IPC.buildProgress, listener);
  },
};

contextBridge.exposeInMainWorld('forgelink', api);
