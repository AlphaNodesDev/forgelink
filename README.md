# ForgeLink

**ForgeLink is a launcher builder and deployment platform for game servers.**

ForgeLink is *not* a game and *not* a game server. It lets a server owner point at an
existing dedicated-server installation, configure everything through a desktop Builder,
and press **Build** to receive a complete, brandable distribution:

- A custom **Launcher** (Windows desktop app) branded with the owner's logo
- An **Installer**
- A **Server API** (Linux, behind Nginx/Apache)
- A **Linux deployment package** (PM2, systemd, Nginx/Apache, Certbot, firewall)
- An **auto updater**
- A **mod synchronizer** (SHA-256, incremental, resumable)
- A **website / web panel**

Players only need the generated launcher. It downloads and updates mods, verifies and
repairs files, shows news and live player count, and auto-joins the server.

The first supported game is **7 Days To Die**. The architecture is built around a
**game adapter/plugin system** so that Minecraft, Project Zomboid, ARK, Rust, Valheim,
Palworld, Terraria and Sons of the Forest can be added by writing a plugin — with no
redesign of the platform.

---

## Repository layout

This is an npm-workspaces monorepo.

```
forgelink/
├── packages/
│   ├── shared/        @forgelink/shared     Types, schemas, crypto, manifest, logging
│   ├── adapters/      @forgelink/adapters   Game adapter interface + plugin registry
│   ├── server-api/    @forgelink/server-api Express + SQLite server (Linux)
│   ├── builder/       @forgelink/builder    Electron + React + Tailwind desktop app
│   └── launcher/      @forgelink/launcher   Electron + React + Tailwind desktop app
├── scripts/           Repo maintenance scripts
├── docs/              Architecture, adapters, deployment, security docs
└── package.json       Workspace root
```

## The game adapter architecture

Every game-specific behaviour lives behind a single interface (`GameAdapter`) defined in
`@forgelink/adapters`. An adapter defines:

- **detect** — how to find and validate a server installation on disk
- **launch/connect** — how to start the game and auto-join the server
- **mods** — where mods live and how they are packaged
- **status** — how to query live server status and player count
- **config** — how to read and write game-specific configuration

Adding a new game means adding one file that implements `GameAdapter` and registering it.
Nothing else in the Builder, Launcher or Server API needs to change. See
[`docs/ADAPTERS.md`](docs/ADAPTERS.md).

## Getting started

### One-command install

Once the repo is published to GitHub, anyone can install with a single command
(clones, installs deps, builds the backend):

```bash
curl -fsSL https://raw.githubusercontent.com/<owner>/<repo>/main/install.sh | bash
```

Add `--with-apps` to also build the Builder and Launcher desktop apps:

```bash
curl -fsSL https://raw.githubusercontent.com/<owner>/<repo>/main/install.sh | bash -s -- --with-apps
```

To stand up the Server API as a running systemd service on a fresh Linux host:

```bash
curl -fsSL https://raw.githubusercontent.com/<owner>/<repo>/main/scripts/server-setup.sh | sudo bash
```

> Replace `<owner>/<repo>` with your GitHub path and set the `REPO` value inside
> `install.sh` / `scripts/server-setup.sh` after publishing. See
> [PUBLISHING.md](PUBLISHING.md).

### Manual install (from a clone)

```bash
git clone https://github.com/<owner>/<repo>.git forgelink
cd forgelink
npm install
npm run build           # builds shared + adapters + server-api
npm run dev:server      # runs the Server API in watch mode
npm run dev:builder     # runs the Builder desktop app (Electron + Vite)
npm run dev:launcher    # runs the Launcher desktop app (Electron + Vite)
```

Requirements: Node.js >= 20, npm >= 10.

## Documentation

| Document | Purpose |
| --- | --- |
| [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) | System overview, data flow, module boundaries |
| [`docs/ADAPTERS.md`](docs/ADAPTERS.md) | How to write a new game adapter |
| [`docs/DEPLOYMENT.md`](docs/DEPLOYMENT.md) | Linux deployment package and generated configs |
| [`docs/SECURITY.md`](docs/SECURITY.md) | Auth, signing, checksums, encrypted config |
| [`docs/API.md`](docs/API.md) | Server API reference |

## License

Commercial. See [`LICENSE`](LICENSE).
