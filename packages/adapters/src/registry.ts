import type { GameId } from '@forgelink/shared';
import type { GameAdapter } from './adapter.js';

/**
 * The adapter registry is the plugin system's runtime. Adapters register
 * themselves here (or are registered at bootstrap). Consumers look adapters up
 * by GameId. This indirection is what keeps game-specific logic isolated: the
 * rest of the platform only ever asks the registry for "the adapter for game X".
 */
export class AdapterRegistry {
  private readonly adapters = new Map<GameId, GameAdapter>();

  /** Register an adapter. Throws if one is already registered for the game. */
  register(adapter: GameAdapter): void {
    if (this.adapters.has(adapter.id)) {
      throw new Error(`An adapter for "${adapter.id}" is already registered.`);
    }
    this.adapters.set(adapter.id, adapter);
  }

  /** Register or replace an adapter (used in tests and hot-reload scenarios). */
  registerOrReplace(adapter: GameAdapter): void {
    this.adapters.set(adapter.id, adapter);
  }

  has(id: GameId): boolean {
    return this.adapters.has(id);
  }

  /** Get an adapter or throw a descriptive error if none is registered. */
  get(id: GameId): GameAdapter {
    const adapter = this.adapters.get(id);
    if (!adapter) {
      throw new Error(
        `No game adapter registered for "${id}". ` +
          `Implemented games: ${this.list().map((a) => a.id).join(', ') || '(none)'}.`,
      );
    }
    return adapter;
  }

  /** Non-throwing lookup. */
  tryGet(id: GameId): GameAdapter | undefined {
    return this.adapters.get(id);
  }

  /** All registered adapters. */
  list(): GameAdapter[] {
    return [...this.adapters.values()];
  }

  /** All GameIds that currently have a working adapter. */
  supportedGames(): GameId[] {
    return [...this.adapters.keys()];
  }
}

/**
 * A shared, process-wide default registry. Most callers can import this and the
 * pre-registered adapters from `./index`. Tests can construct their own
 * `new AdapterRegistry()` for isolation.
 */
export const defaultRegistry = new AdapterRegistry();
