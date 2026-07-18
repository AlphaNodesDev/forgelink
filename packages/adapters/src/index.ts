/**
 * Public surface of @forgelink/adapters.
 *
 * The default registry is populated here with every shipping adapter. Games
 * whose adapters are not yet implemented are simply absent from the registry;
 * the Builder disables them in the UI using GAME_CATALOG.implemented.
 *
 * To add a game: create `src/games/<game>.ts` implementing GameAdapter, import
 * its instance below, and register it. No other package needs changing.
 */
export * from './adapter.js';
export * from './registry.js';
export * from './fs-utils.js';

import { defaultRegistry } from './registry.js';
import { sevenDaysToDieAdapter, SevenDaysToDieAdapter } from './games/seven-days-to-die.js';
import { minecraftAdapter, MinecraftAdapter } from './games/minecraft.js';

export { SevenDaysToDieAdapter, sevenDaysToDieAdapter };
export { MinecraftAdapter, minecraftAdapter };

// --- Adapter registration (the plugin manifest) ---
defaultRegistry.register(sevenDaysToDieAdapter);
defaultRegistry.register(minecraftAdapter);
