# Writing a ForgeLink game adapter

A **game adapter** is the only game-specific code in ForgeLink. Implement one interface,
register it, and the Builder, Launcher and Server API all support the new game — no other
changes required.

## The interface

Defined in `packages/adapters/src/adapter.ts`:

```ts
interface GameAdapter {
  readonly id: GameId;              // one of the catalogued ids in shared/games.ts
  readonly displayName: string;
  readonly signatureFiles: string[]; // files that indicate a valid install

  detect(installPath: string): Promise<DetectionResult>;
  scanMods(installPath: string): Promise<ModFileEntry[]>;
  resolveModsPath(installPath: string): Promise<string | null>;
  buildLaunchPlan(context: AdapterContext): LaunchPlan;
  queryStatus(context: AdapterContext): Promise<ServerStatus>;
  readServerConfig(installPath: string): Promise<Record<string, string>>;
}
```

### Method contracts

- **detect** — read-only, non-destructive. Return `valid: true` only when the folder is a
  real dedicated-server install for this game. Populate `notes` (what was found) and
  `errors` (why it's invalid).
- **scanMods** — return entries relative to the mods root, each with a SHA-256 and size.
  Use the shared `scanDirectoryToEntries` helper unless the game needs special handling.
- **resolveModsPath** — return the absolute mods dir or `null`. Create nothing.
- **buildLaunchPlan** — produce a `LaunchPlan`. Set `useShell: true` for protocol URIs
  (e.g. `steam://`), or `false` with a `target` executable + `args` to spawn directly.
- **queryStatus** — never throw. Return an offline status on failure. Report player count
  when the game exposes one; otherwise report reachability + ping and configured max.
- **readServerConfig** — parse the game's config file into a flat `key -> value` map, or
  return `{}` when unsupported.

## Steps to add a game

1. **Reserve an id.** Add an entry to `GAME_IDS` and `GAME_CATALOG` in
   `packages/shared/src/games.ts`. Set `implemented: true` once your adapter works.

2. **Create the adapter.** Add `packages/adapters/src/games/<your-game>.ts` implementing
   `GameAdapter`. Reuse `fs-utils.ts` (`isDirectory`, `anySignaturePresent`,
   `scanDirectoryToEntries`).

3. **Register it.** In `packages/adapters/src/index.ts`:
   ```ts
   import { yourGameAdapter } from './games/your-game.js';
   defaultRegistry.register(yourGameAdapter);
   ```

4. **Test it.** Add cases to `packages/adapters/src/adapters.test.ts` using a temporary
   fake server folder (see the 7DTD tests for the pattern). Run `npm test` in the
   adapters package.

That's it. The Builder's game dropdown, the mod scanner, the launcher's launch/auto-join
and the Server API's status query all pick up the new adapter automatically.

## Reference implementations

- `games/seven-days-to-die.ts` — full implementation: `serverconfig.xml` parsing, `Mods/`
  scanning, TCP ping probe, `steam://run/251570//+connect_to_ip` auto-join.
- `games/minecraft.ts` — a second, complete adapter (server.properties, `mods/`, TCP
  probe) that demonstrates how little code a new game needs.

## Example skeleton

```ts
import type { DetectionResult, ModFileEntry, ServerStatus } from '@forgelink/shared';
import type { AdapterContext, GameAdapter, LaunchPlan } from '../adapter.js';
import { anySignaturePresent, isDirectory, scanDirectoryToEntries } from '../fs-utils.js';
import path from 'node:path';

const SIGNATURE_FILES = ['<game-signature-file>'];

export class MyGameAdapter implements GameAdapter {
  readonly id = 'my-game' as const;
  readonly displayName = 'My Game';
  readonly signatureFiles = SIGNATURE_FILES;

  async detect(installPath: string): Promise<DetectionResult> {
    if (!(await isDirectory(installPath))) {
      return { valid: false, detectedVersion: null, modsPath: null, notes: [], errors: ['Not a directory'] };
    }
    const valid = anySignaturePresent(installPath, SIGNATURE_FILES);
    return {
      valid,
      detectedVersion: null,
      modsPath: await this.resolveModsPath(installPath),
      notes: valid ? ['Detected server files.'] : [],
      errors: valid ? [] : ['No signature files found.'],
    };
  }

  async resolveModsPath(installPath: string): Promise<string | null> {
    const p = path.join(installPath, 'mods');
    return (await isDirectory(p)) ? p : null;
  }

  async scanMods(installPath: string): Promise<ModFileEntry[]> {
    const mods = await this.resolveModsPath(installPath);
    return mods ? scanDirectoryToEntries(mods) : [];
  }

  buildLaunchPlan(context: AdapterContext): LaunchPlan {
    const { server } = context;
    return {
      target: `mygame://connect/${server.serverIp}:${server.gamePort}`,
      args: [],
      useShell: true,
      description: `Connect to ${server.serverIp}:${server.gamePort}.`,
    };
  }

  async queryStatus(_context: AdapterContext): Promise<ServerStatus> {
    return { online: false, playersOnline: 0, playersMax: 0, pingMs: null, version: null, checkedAt: new Date().toISOString() };
  }

  async readServerConfig(_installPath: string): Promise<Record<string, string>> {
    return {};
  }
}

export const myGameAdapter = new MyGameAdapter();
```
