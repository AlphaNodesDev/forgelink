import { app, BrowserWindow, ipcMain, dialog, shell } from 'electron';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { isGameId, createLogger, type ProjectMeta, type Project } from '@forgelink/shared';
import { defaultRegistry } from '@forgelink/adapters';
import { ProjectStore } from './services/project-store.js';
import { BuildPipeline } from './services/build-pipeline.js';
import { Publisher } from './services/publisher.js';
import { IPC } from './ipc-contract.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const logger = createLogger('builder:main');

/** Workspace where projects are stored (per-user app data). */
const workspaceDir = path.join(app.getPath('userData'), 'projects');
const store = new ProjectStore(workspaceDir);
const pipeline = new BuildPipeline(store);

let mainWindow: BrowserWindow | null = null;

function createWindow(): void {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 820,
    minWidth: 1024,
    minHeight: 700,
    backgroundColor: '#0b0b12',
    titleBarStyle: 'hiddenInset',
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
    mainWindow.webContents.openDevTools({ mode: 'detach' });
  } else {
    void mainWindow.loadFile(path.join(__dirname, '..', 'dist', 'index.html'));
  }
}

function registerIpc(): void {
  ipcMain.handle(IPC.listProjects, () => store.list());
  ipcMain.handle(IPC.getProject, (_e, id: string) => store.get(id));
  ipcMain.handle(IPC.createProject, (_e, meta: ProjectMeta) => store.create(meta));
  ipcMain.handle(IPC.saveProject, (_e, project: Project) => store.save(project));

  ipcMain.handle(IPC.pickFolder, async () => {
    const result = await dialog.showOpenDialog(mainWindow!, { properties: ['openDirectory'] });
    return result.canceled ? null : result.filePaths[0];
  });

  ipcMain.handle(IPC.pickImage, async () => {
    const result = await dialog.showOpenDialog(mainWindow!, {
      properties: ['openFile'],
      filters: [{ name: 'Images', extensions: ['png', 'jpg', 'jpeg', 'svg', 'ico', 'webp'] }],
    });
    return result.canceled ? null : result.filePaths[0];
  });

  ipcMain.handle(IPC.detectServer, async (_e, gameId: string, folder: string) => {
    if (!isGameId(gameId) || !defaultRegistry.has(gameId)) {
      return { valid: false, detectedVersion: null, modsPath: null, notes: [], errors: [`No adapter for ${gameId}`] };
    }
    return defaultRegistry.get(gameId).detect(folder);
  });

  ipcMain.handle(IPC.readServerConfig, async (_e, gameId: string, folder: string) => {
    if (!isGameId(gameId) || !defaultRegistry.has(gameId)) return {};
    return defaultRegistry.get(gameId).readServerConfig(folder);
  });

  ipcMain.handle(IPC.build, async (_e, projectId: string) => {
    const project = store.get(projectId);
    if (!project) throw new Error('Project not found');
    const result = await pipeline.run(project, (progress) => {
      mainWindow?.webContents.send(IPC.buildProgress, progress);
    });
    return { outputDir: result.outputDir, artifacts: result.artifacts };
  });

  ipcMain.handle(IPC.publish, async (_e, projectId: string, apiBase: string, apiKey: string) => {
    const project = store.get(projectId);
    if (!project) throw new Error('Project not found');
    const publisher = new Publisher(apiBase.replace(/\/$/, ''), apiKey);
    await publisher.publishAll(project, store.outputDir(projectId));
    return { ok: true as const };
  });

  ipcMain.handle(IPC.openOutput, async (_e, projectId: string) => {
    await shell.openPath(store.outputDir(projectId));
  });

  ipcMain.handle(IPC.supportedGames, () => defaultRegistry.supportedGames());
}

app.whenReady().then(() => {
  logger.info('Builder starting', { workspaceDir });
  registerIpc();
  createWindow();
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
