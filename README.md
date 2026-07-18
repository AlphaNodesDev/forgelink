<div align="center">

# ForgeLink

### The custom launcher builder and deployment platform for game servers

**Turn your existing 7 Days to Die dedicated server into a branded, auto-updating game launcher your players just click and play — with automatic mod downloads, file verification, live server status, and one-command Linux deployment.**

[Features](#-features) · [How it works](#-how-it-works) · [Install](#-installation) · [Supported games](#-supported-games) · [FAQ](#-faq) · [Docs](#-documentation)

</div>

---

## What is ForgeLink?

**ForgeLink is a launcher builder for game server owners.** You point it at your
existing dedicated server folder, configure everything in a clean desktop app, click
**Build**, and you get a complete, ready-to-distribute package:

- 🎮 A **custom branded launcher** (Windows) with your logo, colors and background
- 📦 A Windows **installer** for that launcher
- 🌐 A **website / web panel** showing live player count and news
- 🖥️ A **Server API** + full **Linux deployment package** (Nginx/Apache, PM2, systemd, Certbot, firewall)
- 🔄 An **auto-updater** and a **mod synchronizer**

Your players install one launcher. It **downloads the exact mods your server runs,
keeps them updated, verifies and repairs broken files, shows server news and the live
online player count, and auto-joins your server** when they hit Play.

> **ForgeLink is not a game and not a game server.** It's the tool that packages your
> server into a professional launcher — like having your own studio-grade launcher
> without hiring a developer.

If you run a **7 Days to Die** community, a modpack server, or any dedicated server and
you're tired of telling players "download these 40 mods manually and put them in this
folder," ForgeLink is built for you.

---

## 🎯 Who is this for?

- **7 Days to Die server owners** running modded servers who want players on the correct mods automatically
- **Modpack communities** that need every player synced to the exact same files
- **Server hosting providers** who want to offer branded launchers to their customers
- **Discord communities** that want a "Download our launcher" button instead of a mod-install tutorial
- Anyone who wants a **professional, auto-updating game launcher** without writing one from scratch

---

## ✨ Features

### For server owners (the Builder app)
- **Beautiful desktop dashboard** — dark & light mode, glassmorphism, sidebar navigation
- **Server auto-detection** — browse to your existing dedicated server folder; ForgeLink reads `serverconfig.xml`, finds your `Mods/`, `Saves/` and version. **It never installs or downloads a game server** — it uses what you already have.
- **Full server configuration** — IP, ports, region, passwords, visibility, website, Discord, rules, news feed
- **Domain & reverse proxy setup** — bring your own domain, pick Nginx or Apache, toggle HTTPS; ForgeLink generates all the config
- **Custom branding** — launcher icon, background, banner, logo, splash screen, colors, fonts, custom CSS
- **One-click Build** — produces the launcher, installer, website, Server API, deployment scripts, signed mod manifest and branding assets
- **Publish button** — pushes updated mods, news and versions to your live server; players get them on next launch

### For players (the generated Launcher)
- **Live server status, online player count and ping**
- **Latest news and changelog** straight from your server
- **Automatic mod sync** — downloads only what changed (SHA-256), resumes interrupted downloads, repairs corrupted files, deletes removed mods
- **One-click Play** — syncs, launches the game, and **auto-joins your server** with the right IP, port and password
- **Auto-update** — the launcher updates itself when you publish a new version
- **Website & Discord buttons** built in

### For deployment (Server API + Linux package)
- **Node.js + Express + SQLite** backend (optional PostgreSQL)
- **Resumable downloads** via HTTP range requests
- **Generated Linux deployment**: PM2 config, systemd service, Nginx/Apache site, Certbot TLS script, UFW firewall rules, and a one-shot `deploy.sh`
- **Security built in**: HTTPS, JWT, API keys, rate limiting, input validation, SHA-256 checksums, RSA digital signatures, AES-256-GCM encrypted config

---

## 🧩 Built for every game (adapter architecture)

ForgeLink is designed around a **game adapter/plugin system**. Game-specific logic
(how to detect a server, launch it, find its mods, query status) lives behind a single
interface. **7 Days to Die** ships fully supported today, with a reference **Minecraft**
adapter included. Adding a new game is one plugin file — the Builder, Launcher and Server
API don't change.

```
ForgeLink
├── Builder          Desktop app to configure and build launchers
├── Launcher         The branded launcher your players install
├── Server API       Runs on your Linux server behind Nginx/Apache
└── Game Adapters
    ├── 7 Days to Die   ✅ fully supported
    ├── Minecraft       ✅ reference adapter
    ├── Project Zomboid ⏳ planned
    ├── Rust            ⏳ planned
    ├── ARK             ⏳ planned
    ├── Valheim         ⏳ planned
    ├── Palworld        ⏳ planned
    ├── Terraria        ⏳ planned
    └── Sons of the Forest ⏳ planned
```

Each adapter defines: how to detect the server install, how to launch and connect,
where mods are stored, how to query server status, and any game-specific config.

---

## 🔧 How it works

```
┌─────────────┐   Build    ┌──────────────────────────┐
│   BUILDER   │──────────▶ │  Launcher + Installer     │
│ (you, once) │            │  Website + Server API     │
│             │            │  Deployment scripts       │
│             │            │  Signed mod manifest      │
└──────┬──────┘            └──────────────────────────┘
       │ Publish                        │ deploy to Linux
       ▼                                ▼
┌─────────────┐   status/news/mods  ┌──────────────┐
│  SERVER API │◀───────────────────▶│    PLAYER    │
│ (your Linux │   resumable         │   LAUNCHER   │
│    host)    │   downloads         │ sync + play  │
└─────────────┘                     └──────────────┘
```

1. **You** open the Builder, point it at your 7 Days to Die server folder, configure branding and deployment, and click **Build**.
2. You deploy the generated **Server API** to your Linux host (one command — see below).
3. You click **Publish** in the Builder to push your mods, news and launcher version live.
4. **Players** download your branded launcher once. Every time they hit **Play**, it syncs mods, verifies files, and auto-joins your server.

---

## 🚀 Installation

> Requirements: **Node.js 20+** and **npm 10+** (and **git**). Windows for the desktop
> apps; Linux for the Server API.

### Option A — One-command install (recommended)

Installs ForgeLink, its dependencies, and builds the backend in one go:

```bash
curl -fsSL https://raw.githubusercontent.com/YOUR_GITHUB_USERNAME/forgelink/main/install.sh | bash
```

Also build the desktop Builder and Launcher apps:

```bash
curl -fsSL https://raw.githubusercontent.com/YOUR_GITHUB_USERNAME/forgelink/main/install.sh | bash -s -- --with-apps
```

**What `install.sh` does, step by step:**
1. Checks you have git, Node.js 20+ and npm 10+ (fails early with a clear message if not).
2. If run over the web, clones the repo into `./forgelink`. If run from an existing clone, it uses that in place.
3. Runs `npm install` to install all workspace dependencies.
4. Runs `npm run build` to compile the shared core, game adapters and Server API.
5. With `--with-apps`, also bundles the Builder and Launcher desktop apps.
6. Prints the exact next commands to start each app.

### Option B — Deploy the Server API to a Linux server (one command)

On a fresh Ubuntu/Debian host, this installs Node.js if needed, builds ForgeLink,
creates a service user, generates secrets/API keys, and starts the Server API as a
`systemd` service with a health check:

```bash
curl -fsSL https://raw.githubusercontent.com/YOUR_GITHUB_USERNAME/forgelink/main/scripts/server-setup.sh | sudo bash
```

### Option C — Manual install (from a clone)

```bash
git clone https://github.com/YOUR_GITHUB_USERNAME/forgelink.git
cd forgelink
npm install
npm run build          # builds shared + adapters + server-api

npm run dev:server     # start the Server API on http://localhost:8080
npm run dev:builder    # launch the Builder desktop app
npm run dev:launcher   # launch the Launcher desktop app
```

> Replace `YOUR_GITHUB_USERNAME/forgelink` with your actual GitHub path everywhere
> above and inside `install.sh` / `scripts/server-setup.sh` after you publish. See
> [PUBLISHING.md](PUBLISHING.md).

---

## ⚡ Quick start for 7 Days to Die server owners

1. **Install ForgeLink** (Option A above) and run `npm run dev:builder`.
2. **New Project** → pick *7 Days to Die*, name your server.
3. **Launcher & Server** → *Browse to Existing Server Folder* → select your 7DTD dedicated server directory. ForgeLink detects `serverconfig.xml` and your mods automatically.
4. **Deployment** → enter your domain, pick Nginx, enable HTTPS.
5. **Branding** → upload your logo and pick your colors.
6. Click **Build**. Deploy the Server API to your Linux host with `server-setup.sh`.
7. Click **Publish**. Share your launcher installer and your new website. Done.

---

## 🎮 Supported games

| Game | Status | Notes |
| --- | --- | --- |
| **7 Days to Die** | ✅ Full support | Detects `serverconfig.xml`, scans `Mods/`, Steam auto-join |
| Minecraft (Java) | ✅ Reference adapter | `server.properties`, `mods/` folder |
| Project Zomboid | ⏳ Planned | Adapter interface ready |
| Rust | ⏳ Planned | Adapter interface ready |
| ARK: Survival | ⏳ Planned | Adapter interface ready |
| Valheim | ⏳ Planned | Adapter interface ready |
| Palworld | ⏳ Planned | Adapter interface ready |
| Terraria | ⏳ Planned | Adapter interface ready |
| Sons of the Forest | ⏳ Planned | Adapter interface ready |

Want a game added? Adapters are small and self-contained — see
[docs/ADAPTERS.md](docs/ADAPTERS.md) or open an issue.

---

## 🛠️ Tech stack

- **Builder & Launcher:** Electron, React, TypeScript, TailwindCSS, Vite
- **Server API:** Node.js, Express, TypeScript, SQLite (optional PostgreSQL)
- **Deployment:** PM2, systemd, Nginx / Apache, Certbot, UFW
- **Mod sync & integrity:** SHA-256 checksums, RSA-2048 signatures, resumable HTTP downloads
- **Security:** HTTPS, JWT, API keys, rate limiting, AES-256-GCM encrypted config

---

## ❓ FAQ

**Does ForgeLink host or run my game server?**
No. ForgeLink does not install, download or run a game server. You keep running your
dedicated server however you already do — ForgeLink builds the *launcher* and
supporting website/API around it.

**How do players get my mods?**
Your launcher reads a signed manifest of every mod file (with SHA-256 hashes) from your
Server API and downloads only the files a player is missing or that changed. Downloads
resume if interrupted, and corrupted files are automatically repaired.

**Do players need to configure anything?**
No. They install your launcher and click Play. It syncs mods and auto-joins your server
with the correct IP, port and password.

**Is it safe? Can mods be tampered with?**
Manifests and updates are signed with a per-project RSA key; the launcher verifies the
signature and every file checksum before installing. Sensitive config is encrypted with
AES-256-GCM.

**What does it cost to run?**
The Server API is a lightweight Node.js + SQLite service that runs comfortably on a
small VPS behind Nginx.

**Can I brand it as my own?**
Yes — logo, background, banner, splash, colors, fonts and custom CSS. The generated
launcher and website are fully yours to distribute.

**Which operating systems are supported?**
The Builder and Launcher are Windows desktop apps. The Server API runs on Linux
(Debian/Ubuntu deployment scripts included).

---

## 📚 Documentation

| Document | What's inside |
| --- | --- |
| [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) | System overview, data flow, module boundaries |
| [docs/ADAPTERS.md](docs/ADAPTERS.md) | How to add support for a new game |
| [docs/API.md](docs/API.md) | Server API reference (`/api/status`, `/mods`, `/version`, ...) |
| [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md) | Linux deployment package and generated configs |
| [docs/SECURITY.md](docs/SECURITY.md) | Auth, signing, checksums, encrypted config |
| [PUBLISHING.md](PUBLISHING.md) | Publish to GitHub and wire up the one-command installer |

---

## 🗺️ Repository layout

```
forgelink/
├── install.sh                One-command installer
├── scripts/server-setup.sh   Linux Server API provisioner (systemd)
├── packages/
│   ├── shared/       Types, schemas, crypto, manifest, logging
│   ├── adapters/     Game adapter interface + registry (7DTD, Minecraft)
│   ├── server-api/   Express + SQLite backend
│   ├── builder/      Electron + React desktop app (build launchers)
│   └── launcher/     Electron + React desktop app (the player launcher)
└── docs/             Architecture, adapters, API, deployment, security
```

---

## 🤝 Contributing

Contributions are welcome — especially new game adapters. Adapters are small,
self-contained files (see [docs/ADAPTERS.md](docs/ADAPTERS.md)). Open an issue to
discuss a feature or report a bug.

## ⭐ Support the project

If ForgeLink saves you time, **star the repo** — it helps other server owners find it.

## 📄 License

Commercial license — see [LICENSE](LICENSE). Launchers, installers, websites and
deployment artifacts you generate with the Builder are yours to distribute to your
players.

---

<div align="center">

**Keywords:** 7 Days to Die launcher · 7DTD custom launcher · game server launcher builder ·
dedicated server mod sync · auto mod downloader · Minecraft modpack launcher ·
server auto-updater · game launcher generator · 7 Days to Die server tools ·
custom game launcher creator

</div>
