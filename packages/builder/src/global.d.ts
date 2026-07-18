import type { BuilderApi } from '../electron/ipc-contract';

/**
 * Ambient declaration for the preload-exposed API. This is what makes
 * `window.forgelink.*` fully typed in the renderer.
 */
declare global {
  interface Window {
    forgelink: BuilderApi;
  }
}

export {};
