import type { Project } from '@forgelink/shared';

/**
 * Deployment artifact generators. Each function is pure — it takes a project and
 * returns file content as a string — so the build pipeline can write them out
 * and the whole set is trivially testable. Generated files target a Linux host
 * running the ForgeLink Server API behind Nginx or Apache with PM2 + systemd.
 */

/** Fully-qualified public host (subdomain.domain or domain), or the raw IP. */
export function resolveHost(project: Project): string {
  const { domain } = project;
  if (domain.ownsDomain && domain.domain) {
    return domain.subdomain ? `${domain.subdomain}.${domain.domain}` : domain.domain;
  }
  return project.server.serverIp;
}

/** Slug safe for filenames, service names and PM2 app names. */
export function projectSlug(project: Project): string {
  return (
    project.meta.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '') || 'forgelink'
  );
}

export function generatePm2Config(project: Project): string {
  const slug = projectSlug(project);
  return `// PM2 ecosystem file for ${project.meta.name}
// Start:   pm2 start ecosystem.config.cjs
// Save:    pm2 save && pm2 startup
module.exports = {
  apps: [
    {
      name: '${slug}-api',
      script: 'dist/index.js',
      cwd: '/opt/forgelink/${slug}',
      instances: 1,
      exec_mode: 'fork',
      max_memory_restart: '512M',
      env: {
        NODE_ENV: 'production',
        FORGELINK_PORT: '8080',
        FORGELINK_HOST: '127.0.0.1',
        FORGELINK_DATA_DIR: '/opt/forgelink/${slug}/data',
        FORGELINK_STORAGE_DIR: '/opt/forgelink/${slug}/storage',
        FORGELINK_PUBLIC_URL: '${project.domain.useHttps ? 'https' : 'http'}://${resolveHost(project)}',
        FORGELINK_RATE_LIMIT_PER_MIN: '${project.security.rateLimitPerMinute}'
      }
    }
  ]
};
`;
}

export function generateSystemdService(project: Project): string {
  const slug = projectSlug(project);
  return `[Unit]
Description=ForgeLink Server API (${project.meta.name})
After=network.target

[Service]
Type=simple
User=forgelink
WorkingDirectory=/opt/forgelink/${slug}
ExecStart=/usr/bin/node dist/index.js
Restart=on-failure
RestartSec=5
Environment=NODE_ENV=production
Environment=FORGELINK_PORT=8080
Environment=FORGELINK_HOST=127.0.0.1
Environment=FORGELINK_DATA_DIR=/opt/forgelink/${slug}/data
Environment=FORGELINK_STORAGE_DIR=/opt/forgelink/${slug}/storage
Environment=FORGELINK_PUBLIC_URL=${project.domain.useHttps ? 'https' : 'http'}://${resolveHost(project)}
Environment=FORGELINK_RATE_LIMIT_PER_MIN=${project.security.rateLimitPerMinute}

[Install]
WantedBy=multi-user.target
`;
}

export function generateNginxConfig(project: Project): string {
  const host = resolveHost(project);
  const useHttps = project.domain.useHttps;
  const httpsBlock = useHttps
    ? `
server {
    listen 443 ssl http2;
    server_name ${host};

    ssl_certificate     /etc/letsencrypt/live/${host}/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/${host}/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;

    client_max_body_size 512M;

    # Website / web panel (static export).
    root /opt/forgelink/${projectSlug(project)}/website;
    index index.html;

    location /api/ {
        proxy_pass http://127.0.0.1:8080;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        # Allow large, resumable downloads to stream.
        proxy_buffering off;
        proxy_request_buffering off;
    }

    location / {
        try_files $uri $uri/ /index.html;
    }
}
`
    : '';

  const httpServer = useHttps
    ? `# Redirect all HTTP to HTTPS.
server {
    listen 80;
    server_name ${host};
    location /.well-known/acme-challenge/ { root /var/www/certbot; }
    location / { return 301 https://$host$request_uri; }
}`
    : `server {
    listen 80;
    server_name ${host};
    root /opt/forgelink/${projectSlug(project)}/website;
    index index.html;

    location /api/ {
        proxy_pass http://127.0.0.1:8080;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_buffering off;
    }
    location / { try_files $uri $uri/ /index.html; }
}`;

  return `# Nginx site for ${project.meta.name}
# Install: copy to /etc/nginx/sites-available/${projectSlug(project)}.conf
#          ln -s to sites-enabled, then: nginx -t && systemctl reload nginx
${httpServer}
${httpsBlock}`;
}

export function generateApacheConfig(project: Project): string {
  const host = resolveHost(project);
  const slug = projectSlug(project);
  const useHttps = project.domain.useHttps;
  const httpsVhost = useHttps
    ? `
<VirtualHost *:443>
    ServerName ${host}
    DocumentRoot /opt/forgelink/${slug}/website

    SSLEngine on
    SSLCertificateFile      /etc/letsencrypt/live/${host}/fullchain.pem
    SSLCertificateKeyFile   /etc/letsencrypt/live/${host}/privkey.pem

    ProxyPreserveHost On
    ProxyPass        /api/ http://127.0.0.1:8080/api/
    ProxyPassReverse /api/ http://127.0.0.1:8080/api/

    <Directory /opt/forgelink/${slug}/website>
        Options -Indexes +FollowSymLinks
        AllowOverride All
        Require all granted
        FallbackResource /index.html
    </Directory>
</VirtualHost>
`
    : '';

  return `# Apache vhost for ${project.meta.name}
# Requires: a2enmod proxy proxy_http ssl rewrite
<VirtualHost *:80>
    ServerName ${host}
    ${useHttps ? `Redirect permanent / https://${host}/` : `DocumentRoot /opt/forgelink/${slug}/website
    ProxyPreserveHost On
    ProxyPass        /api/ http://127.0.0.1:8080/api/
    ProxyPassReverse /api/ http://127.0.0.1:8080/api/`}
</VirtualHost>
${httpsVhost}`;
}

export function generateCertbotScript(project: Project): string {
  const host = resolveHost(project);
  const email = project.domain.certbotEmail || 'admin@' + (project.domain.domain || 'example.com');
  const proxy = project.domain.reverseProxy;
  const plugin = proxy === 'apache' ? '--apache' : '--nginx';
  return `#!/usr/bin/env bash
# Obtain and install a Let's Encrypt certificate for ${host}.
set -euo pipefail

if ! command -v certbot >/dev/null 2>&1; then
  echo "Installing certbot..."
  sudo apt-get update
  sudo apt-get install -y certbot ${proxy === 'apache' ? 'python3-certbot-apache' : 'python3-certbot-nginx'}
fi

sudo certbot ${plugin} \\
  --non-interactive --agree-tos \\
  -m "${email}" \\
  -d "${host}"

# Auto-renewal is handled by the certbot systemd timer. Verify with:
#   systemctl list-timers | grep certbot
echo "Certificate installed for ${host}."
`;
}

export function generateFirewallScript(project: Project): string {
  const { gamePort, queryPort } = project.server;
  return `#!/usr/bin/env bash
# UFW firewall rules for ${project.meta.name}.
set -euo pipefail

sudo ufw allow 22/tcp        # SSH
sudo ufw allow 80/tcp        # HTTP
sudo ufw allow 443/tcp       # HTTPS
sudo ufw allow ${gamePort}/tcp   # Game port
sudo ufw allow ${gamePort}/udp   # Game port (UDP)
sudo ufw allow ${queryPort}/udp  # Query port
sudo ufw --force enable
sudo ufw status verbose
`;
}

export function generateDeployScript(project: Project): string {
  const slug = projectSlug(project);
  const proxy = project.domain.reverseProxy;
  return `#!/usr/bin/env bash
# One-shot deploy script for ${project.meta.name}.
# Run on a fresh Ubuntu/Debian host as a sudo-capable user.
set -euo pipefail

APP_DIR=/opt/forgelink/${slug}

echo "==> Installing prerequisites"
sudo apt-get update
sudo apt-get install -y curl git ${proxy === 'apache' ? 'apache2' : proxy === 'nginx' ? 'nginx' : ''} ufw

if ! command -v node >/dev/null 2>&1; then
  echo "==> Installing Node.js 20 LTS"
  curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
  sudo apt-get install -y nodejs
fi

echo "==> Creating service user and directories"
sudo id forgelink >/dev/null 2>&1 || sudo useradd --system --home "$APP_DIR" --shell /usr/sbin/nologin forgelink
sudo mkdir -p "$APP_DIR"/{data,storage,website}
sudo chown -R forgelink:forgelink "$APP_DIR"

echo "==> Deploying API (expects ./server-api to be uploaded alongside this script)"
sudo cp -r ./server-api/* "$APP_DIR"/
sudo chown -R forgelink:forgelink "$APP_DIR"

echo "==> Installing production dependencies"
( cd "$APP_DIR" && sudo -u forgelink npm ci --omit=dev )

echo "==> Configuring reverse proxy (${proxy})"
${
    proxy === 'nginx'
      ? `sudo cp ./nginx.conf /etc/nginx/sites-available/${slug}.conf
sudo ln -sf /etc/nginx/sites-available/${slug}.conf /etc/nginx/sites-enabled/${slug}.conf
sudo nginx -t && sudo systemctl reload nginx`
      : proxy === 'apache'
        ? `sudo a2enmod proxy proxy_http ssl rewrite
sudo cp ./apache.conf /etc/apache2/sites-available/${slug}.conf
sudo a2ensite ${slug}.conf
sudo apache2ctl configtest && sudo systemctl reload apache2`
        : 'echo "No reverse proxy selected; API is exposed directly on port 8080."'
  }

echo "==> Installing systemd service"
sudo cp ./forgelink-${slug}.service /etc/systemd/system/
sudo systemctl daemon-reload
sudo systemctl enable --now forgelink-${slug}

echo "==> Applying firewall rules"
sudo bash ./firewall.sh || true

${
    project.domain.useHttps
      ? `echo "==> Requesting TLS certificate"
sudo bash ./certbot.sh || echo "Certbot step failed; run ./certbot.sh manually once DNS is set."`
      : ''
  }

echo "==> Deploy complete. API health:"
curl -fsS http://127.0.0.1:8080/healthz || true
echo ""
`;
}

export interface DeploymentBundle {
  'ecosystem.config.cjs': string;
  [key: string]: string;
}

/** Generate the full set of deployment files appropriate to the project config. */
export function generateDeploymentBundle(project: Project): Record<string, string> {
  const slug = projectSlug(project);
  const files: Record<string, string> = {
    'ecosystem.config.cjs': generatePm2Config(project),
    [`forgelink-${slug}.service`]: generateSystemdService(project),
    'firewall.sh': generateFirewallScript(project),
    'deploy.sh': generateDeployScript(project),
  };

  if (project.domain.reverseProxy === 'nginx') files['nginx.conf'] = generateNginxConfig(project);
  if (project.domain.reverseProxy === 'apache') files['apache.conf'] = generateApacheConfig(project);
  if (project.domain.useHttps) files['certbot.sh'] = generateCertbotScript(project);

  return files;
}
