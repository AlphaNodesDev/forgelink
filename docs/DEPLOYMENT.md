# ForgeLink Linux deployment

When you click **Build** in the Builder, the deployment package is written to
`<project>/output/deployment/`. It targets a Debian/Ubuntu host running the ForgeLink
Server API behind Nginx or Apache, managed by systemd (or PM2), with TLS via Certbot.

## Generated files

| File | Purpose |
| --- | --- |
| `deploy.sh` | One-shot deploy script: installs prerequisites, creates the `forgelink` service user, copies the API, installs deps, configures the reverse proxy, installs the systemd unit, applies firewall rules and requests a certificate. |
| `ecosystem.config.cjs` | PM2 process definition (alternative to systemd). |
| `forgelink-<slug>.service` | systemd unit for the API. |
| `nginx.conf` | Nginx site (HTTP→HTTPS redirect, `/api/` proxy, static website root). Only when Nginx is selected. |
| `apache.conf` | Apache vhost equivalent. Only when Apache is selected. |
| `certbot.sh` | Obtains and installs a Let's Encrypt certificate. Only when HTTPS is enabled. |
| `firewall.sh` | UFW rules for SSH, HTTP/S and the game/query ports. |
| `secrets.enc.json` | AES-256-GCM encrypted sensitive config (admin password), when enabled. |

## Deploying

1. Build the Server API and upload it plus the deployment folder to your host:
   ```bash
   # On your build machine
   npm run build:server            # produces packages/server-api/dist
   scp -r packages/server-api user@host:/tmp/server-api
   scp -r output/deployment       user@host:/tmp/deployment
   ```

2. On the host:
   ```bash
   cd /tmp/deployment
   sudo bash deploy.sh
   ```
   `deploy.sh` expects the API to sit at `./server-api` relative to the script; place it
   there or adjust the `cp` line at the top of the script.

3. Point DNS for your domain/subdomain at the host, then (if you skipped it during
   deploy) run:
   ```bash
   sudo bash certbot.sh
   ```

4. Verify:
   ```bash
   curl -fsS http://127.0.0.1:8080/healthz
   systemctl status forgelink-<slug>
   ```

## Runtime configuration

The systemd unit and PM2 config set the environment described in
[`API.md`](API.md#environment-variables). At minimum, set a strong
`FORGELINK_JWT_SECRET` and one or more `FORGELINK_API_KEYS` before publishing.

Edit `/etc/systemd/system/forgelink-<slug>.service` (or `ecosystem.config.cjs`), then:
```bash
sudo systemctl daemon-reload
sudo systemctl restart forgelink-<slug>
```

## Updating content

You do **not** redeploy to update content. From the Builder, click **Publish** to push a
new manifest, news, server info or launcher version to the live API. The website reads
live data and players' launchers pick up changes on next launch.

## Reverse proxy notes

- The generated proxy config disables request/response buffering on `/api/` so large,
  resumable mod downloads stream correctly.
- `client_max_body_size` (Nginx) is set to 512M to allow large launcher installers.
- The static website is served from `/opt/forgelink/<slug>/website` with SPA fallback.
