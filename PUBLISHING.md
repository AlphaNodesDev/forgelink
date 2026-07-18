# Publishing ForgeLink to GitHub

This guide walks through pushing the repo to GitHub and wiring up the one-command
installer so others can install ForgeLink with `curl ... | bash`.

## 1. Point the scripts at your repo

Before publishing, set your GitHub path in two places (or override at runtime with
the `FORGELINK_REPO` environment variable):

- `install.sh` → `REPO="https://github.com/<owner>/<repo>.git"`
- `scripts/server-setup.sh` → `REPO="https://github.com/<owner>/<repo>.git"`

Also update the `<owner>/<repo>` placeholders in `README.md`.

## 2. Create the repository and push

```bash
cd forgelink

# Initialise git (skip if already a repo)
git init
git add .
git commit -m "Initial commit: ForgeLink platform"

# Create the GitHub repo. Easiest with the GitHub CLI:
#   gh repo create <owner>/<repo> --private --source=. --remote=origin --push
# Or manually create it on github.com, then:
git branch -M main
git remote add origin https://github.com/<owner>/<repo>.git
git push -u origin main
```

> `node_modules/`, build output and databases are already excluded via
> `.gitignore`, so only source is published.

## 3. Verify the one-liner

On any machine with git + Node 20+:

```bash
curl -fsSL https://raw.githubusercontent.com/<owner>/<repo>/main/install.sh | bash
```

This clones the repo into `./forgelink`, runs `npm install`, and builds the
backend. Add `-s -- --with-apps` to also build the desktop apps.

## 4. How the installer works

`install.sh` is safe to run either from inside a clone or piped from the web:

- **Piped from the web** — it clones `REPO` at `REF` (default `main`) into
  `FORGELINK_DIR` (default `forgelink`), then installs and builds.
- **From a clone** — it detects the local checkout (finds the `forgelink`
  workspace `package.json` next to itself) and installs in place without cloning.

Options:

| Flag / env | Effect |
| --- | --- |
| `--with-apps` | Also build the Builder and Launcher desktop apps. |
| `--ref=<branch/tag>` or `FORGELINK_REF` | Install a specific ref. |
| `--dir=<path>` or `FORGELINK_DIR` | Clone target directory. |
| `FORGELINK_REPO` | Override the git URL. |

## 5. Server provisioning script

`scripts/server-setup.sh` is for a fresh Linux host. Run as root:

```bash
curl -fsSL https://raw.githubusercontent.com/<owner>/<repo>/main/scripts/server-setup.sh | sudo bash
```

It installs Node.js if needed, clones/builds ForgeLink into `/opt/forgelink/app`,
creates a `forgelink` service user, generates a JWT secret and an API key, and
starts the Server API as the `forgelink-api` systemd service. Save the printed API
key — the Builder needs it to Publish.

Override behaviour with env vars: `FORGELINK_PORT`, `FORGELINK_PUBLIC_URL`,
`FORGELINK_API_KEYS`, `FORGELINK_APP_DIR`, `FORGELINK_REF`.

## 6. (Optional) Release binaries via GitHub Actions

To distribute prebuilt launcher/builder installers, add a workflow that runs
`npm run package` on a Windows runner and uploads the artifacts from
`packages/*/release/` to a GitHub Release. The desktop packaging config lives in
each app's `package.json` under the `build` key (electron-builder).
