import type {
  DetectionResult,
  GameId,
  ModFileEntry,
  ServerConfig,
  ServerStatus,
} from '@forgelink/shared';

/**
 * The GameAdapter interface is the ONLY contract game-specific code must fulfil.
 * The Builder, Launcher and Server API interact with games exclusively through
 * this interface, so adding a new game (Minecraft, Rust, Valheim, ...) means
 * implementing this once and registering it — nothing else changes.
 */

/** Context describing where the server lives and how it's configured. */
export interface AdapterContext {
  /** Absolute path to the dedicated-server installation folder. */
  installPath: string;
  /** The resolved server configuration for this project. */
  server: ServerConfig;
}

/** How the launcher should start the game and auto-join the server. */
export interface LaunchPlan {
  /** Absolute path or steam:// URI / executable to run. */
  target: string;
  /** Command-line arguments to pass, already ordered. */
  args: string[];
  /**
   * When true, `target` is a protocol URI (e.g. steam://) that should be opened
   * via the OS shell rather than spawned as a child process.
   */
  useShell: boolean;
  /** Human-readable description of what will happen, shown in the launcher. */
  description: string;
}

export interface GameAdapter {
  /** The game this adapter serves; must be one of the catalogued GameIds. */
  readonly id: GameId;

  /** Display name used where the adapter needs to speak for itself. */
  readonly displayName: string;

  /**
   * Files/folders that, when present, strongly indicate a valid installation of
   * this game's dedicated server. Used for a fast pre-check before deep detect.
   */
  readonly signatureFiles: string[];

  /**
   * Inspect `installPath` and decide whether it is a valid dedicated-server
   * installation for this game. Must be non-destructive and read-only.
   */
  detect(installPath: string): Promise<DetectionResult>;

  /**
   * Enumerate mod files under the installation, returning entries relative to
   * the mods root. Implementations compute SHA-256 for each file.
   */
  scanMods(installPath: string): Promise<ModFileEntry[]>;

  /**
   * Resolve the absolute mods directory for the installation, creating nothing.
   * Returns null when the game has no mod concept or none is present.
   */
  resolveModsPath(installPath: string): Promise<string | null>;

  /**
   * Produce a plan the launcher can execute to start the game and connect to
   * the configured server (auto-join).
   */
  buildLaunchPlan(context: AdapterContext): LaunchPlan;

  /**
   * Query live server status (online, player count, ping, version). Runs from
   * the Server API and/or the launcher. Must never throw — return an offline
   * status on failure.
   */
  queryStatus(context: AdapterContext): Promise<ServerStatus>;

  /**
   * Read game-specific configuration (e.g. serverconfig.xml) into a flat map of
   * key -> value for display/editing. Returns an empty map when unsupported.
   */
  readServerConfig(installPath: string): Promise<Record<string, string>>;
}
