import type { LauncherApi } from '../electron/ipc-contract';

declare global {
  interface Window {
    launcher: LauncherApi;
  }
}

export {};
