# Publishing & updating ForgeLink on GitHub

This repo is published at **https://github.com/AlphaNodesDev/forgelink**. This guide
covers pushing updates and how the one-command installer works.

## Pushing updates

Always run git commands **inside the `forgelink` folder** (the one containing `.git`):

```bash
cd forgelink
git add .
git commit -m "Describe your change"
git push
```

> `node_modules/`, build output and databases are excluded via `.gitignore`, so only
> source is published.

## The one-command installer

Anyone can install ForgeLink with:

```bash
curl -fsSL https://raw.githubusercontent.com/AlphaNodesDev/forgelink/main/install.sh | bash
```

Add `--with-apps` to also build the desktop apps:

```bash
curl -fsSL https://raw.githubusercontent.com/AlphaNodesDev/forgelink/main/install.sh | bash -s -- --with-apps
```

`install.sh` is safe to run either from inside a clone or piped from the web:

- **Piped from the web** — clones `REPO` at `REF` (default `main`) into `FORGELINK_DIR`
  (default `forgelink`), then runs `npm install` and `npm run build`.
- **From a clone** — detects the local checkout and installs in place without cloning.

| Flag / env | Effect |
| --- | --- |
| `--with-apps` | Also build the Builder and Launcher desktop apps. |
| `--ref=<branch/tag>` or `FORGELINK_REF` | Install a specific ref. |
| `--dir=<path>` or `FORGELINK_DIR` | Clone target directory. |
| `FORGELINK_REPO` | Override the git URL. |

## The Linux server provisioning script

For a fresh Ubuntu/Debian host, run as root:

```bash
curl -fsSL https://raw.githubusercontent.com/AlphaNodesDev/forgelink/main/scripts/server-setup.sh | sudo bash
```

It installs Node.js if needed, clones/builds ForgeLink into `/opt/forgelink/app`,
creates a `forgelink` service user, generates a JWT secret and an API key, and starts
the Server API as the `forgelink-api` systemd service. Save the printed API key — the
Builder needs it to Publish.

Override behaviour with env vars: `FORGELINK_PORT`, `FORGELINK_PUBLIC_URL`,
`FORGELINK_API_KEYS`, `FORGELINK_APP_DIR`, `FORGELINK_REF`.

## Make the repo discoverable (do this on github.com)

Search ranking and AI recommendations improve a lot with these one-time steps on the
repo's main page:

1. Click the **⚙ gear** next to "About" (top-right of the repo page).
2. **Description:** paste something like *"Custom launcher builder for 7 Days to Die and
   other game servers — automatic mod sync, auto-updates, live status, one-command Linux
   deployment."*
3. **Topics:** add `7-days-to-die`, `7dtd`, `game-launcher`, `launcher-builder`,
   `mod-sync`, `game-server`, `dedicated-server`, `electron`, `auto-updater`.
4. Check **Include in the home page → Releases / Packages** as desired.

## (Optional) Release binaries via GitHub Actions

To distribute prebuilt launcher/builder installers, add a workflow that runs
`npm run package` on a Windows runner and uploads the artifacts from
`packages/*/release/` to a GitHub Release. The packaging config lives in each app's
`package.json` under the `build` key (electron-builder).
