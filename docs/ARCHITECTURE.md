# ForgeLink Architecture

ForgeLink is a **launcher builder and deployment platform for game servers**. It is
not a game and not a game server. It is composed of three applications plus a shared
core, all organized around a **game adapter/plugin system**.

## High-level picture

```
                        ┌──────────────────────────────┐
                        │       @forgelink/shared        │
                        │  types · schemas · crypto ·    │
                        │  manifest · config-crypto · log│
                        └──────────────┬─────────────────┘
                                       │
                        ┌──────────────▼─────────────────┐
                        │      @forgelink/adapters         │
                        │  GameAdapter interface +         │
                        │  AdapterRegistry (plugin system) │
                        │  7DTD · Minecraft · ...          │
                        └───┬───────────┬─────────────┬───┘
                            │           │             │
            ┌───────────────▼─┐   ┌─────▼──────┐   ┌──▼───────────────┐
            │ ForgeLink        │   │ ForgeLink  │   │ ForgeLink        │
            │ Builder (Electron)│  │ Server API │   │ Launcher (Electron)│
            │ React + Tailwind │   │ Express +  │   │ React + Tailwind  │
            │                  │   │ SQLite     │   │                   │
            └──────────────────┘   └────────────┘   └───────────────────┘
                    │                    ▲                    │
                    │ Build ── output ──▶│◀── read (status,   │
                    │ Publish ──────────▶│    news, version,  │
                    │                    │    mods, download)  │
                    └────────────────────┴─────────────────────┘
```

## Packages

| Package | Runtime | Responsibility |
| --- | --- | --- |
| `@forgelink/shared` | Node / browser-safe subset | Domain types (Zod-inferred), SHA-256 + RSA signing, manifest build/diff/verify, AES-256-GCM config encryption, structured logging. |
| `@forgelink/adapters` | Node | The `GameAdapter` interface and `AdapterRegistry`. Ships the 7 Days To Die adapter and a reference Minecraft adapter. |
| `@forgelink/server-api` | Linux (Node) | Express + SQLite backend serving status, news, version, mods, downloads and analytics; publish routes protected by API keys/JWT. |
| `@forgelink/builder` | Windows desktop (Electron) | The dashboard where an owner configures a project and clicks **Build** / **Publish**. Main-process services run detection, the build pipeline and the publisher. |
| `@forgelink/launcher` | Windows desktop (Electron) | The branded, generated launcher. Syncs mods, self-updates, shows status/news, and launches + auto-joins the game. |

## Data flow

### Build time (Builder)
1. Owner creates a **Project** (name, game, server name, version, owner).
2. **Server Discovery**: the Builder calls `adapter.detect(folder)` — it never installs
   or downloads a server. Detection reads `serverconfig.xml`, finds `Mods/`, `Saves/`
   and a version.
3. Owner configures server connection, domain/reverse-proxy, branding, and security.
4. **Build** runs the pipeline:
   - `adapter.scanMods()` hashes every mod file (SHA-256) → signed `manifest.json`
   - deployment package (PM2, systemd, Nginx/Apache, Certbot, firewall, deploy.sh)
   - static website / web panel
   - installer (NSIS + electron-builder config)
   - launcher runtime config (embeds the public key for signature verification)
   - encrypted secrets (AES-256-GCM)
5. **Publish** pushes the server identity, manifest and news to a live Server API using
   the project API key.

### Run time (Launcher)
1. Reads `launcher-config.json` (shipped in the installer): API base, server id, game
   id, branding, public key, auto-join details.
2. Fetches `/api/status` and `/api/news` for the dashboard; polls status every 30s.
3. On **Play** (or **Repair**): fetches `/api/mods`, verifies the manifest signature,
   diffs against local files, downloads only what changed (resumable), verifies each
   file's checksum, repairs corrupt files, deletes removed mods.
4. `adapter.buildLaunchPlan()` produces a connect URI; the launcher opens it to start
   the game and auto-join.
5. Checks `/api/version`; if newer, downloads + verifies + runs the installer and quits.
6. Posts anonymous analytics events (download, update outcome, mod download, crash).

## Why an adapter registry

The registry (`AdapterRegistry`) is the seam that keeps game-specific logic isolated.
The Builder, Launcher and Server API never branch on "which game" — they ask the
registry for the adapter and call the interface. Adding a game is a single new file plus
one `register()` call. See [`ADAPTERS.md`](ADAPTERS.md).

## Module boundaries and dependencies

- `shared` depends on nothing but `zod` and Node core.
- `adapters` depends on `shared`.
- `server-api`, `builder`, `launcher` depend on `shared` and `adapters`.
- The Electron **renderers** (React) never import Node or adapter code directly — they
  talk to the main process through a typed preload bridge (`window.forgelink` /
  `window.launcher`). This preserves context isolation and keeps the security boundary
  clear.
