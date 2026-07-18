import type { DetectionResult, Project, ProjectMeta } from '@forgelink/shared';
import type { BuildProgress } from './services/build-pipeline.js';

export type { BuildProgress } from './services/build-pipeline.js';

/**
 * The IPC contract between the Electron main process and the React renderer.
 * Keeping it in one typed file means the preload bridge and the renderer share
 * exactly the same types — invalid calls fail at compile time.
 */
export interface BuilderApi {
  listProjects(): Promise<Project[]>;
  getProject(id: string): Promise<Project | null>;
  createProject(meta: ProjectMeta): Promise<Project>;
  saveProject(project: Project): Promise<Project>;

  /** Open a native folder picker; returns the chosen path or null. */
  pickFolder(): Promise<string | null>;
  /** Open a native file picker filtered to images; returns path or null. */
  pickImage(): Promise<string | null>;

  /** Run adapter detection against a folder for the given game. */
  detectServer(gameId: string, folder: string): Promise<DetectionResult>;
  /** Read game-specific server config (e.g. serverconfig.xml) as key/value. */
  readServerConfig(gameId: string, folder: string): Promise<Record<string, string>>;

  /** Run the full build pipeline. Progress is delivered via onBuildProgress. */
  build(projectId: string): Promise<{ outputDir: string; artifacts: string[] }>;
  /** Publish generated content to a live Server API. */
  publish(projectId: string, apiBase: string, apiKey: string): Promise<{ ok: true }>;

  /** Reveal the output directory in the OS file explorer. */
  openOutput(projectId: string): Promise<void>;

  /** Subscribe to build progress events. Returns an unsubscribe function. */
  onBuildProgress(handler: (progress: BuildProgress) => void): () => void;

  /** List which games have working adapters. */
  supportedGames(): Promise<string[]>;
}

/** Channel names used across the IPC bridge. */
export const IPC = {
  listProjects: 'projects:list',
  getProject: 'projects:get',
  createProject: 'projects:create',
  saveProject: 'projects:save',
  pickFolder: 'dialog:pickFolder',
  pickImage: 'dialog:pickImage',
  detectServer: 'server:detect',
  readServerConfig: 'server:readConfig',
  build: 'build:run',
  publish: 'publish:run',
  openOutput: 'output:open',
  buildProgress: 'build:progress',
  supportedGames: 'games:supported',
} as const;
