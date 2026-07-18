#!/usr/bin/env bash
#
# ForgeLink Server API provisioning script (Linux, Debian/Ubuntu).
#
# For a fresh server where you want the ForgeLink Server API running as a
# systemd service behind a reverse proxy. This installs Node.js if missing,
# clones/builds the repo, creates a service user, and starts the API.
#
# Usage (as a sudo-capable user):
#   curl -fsSL https://raw.githubusercontent.com/<owner>/<repo>/main/scripts/server-setup.sh | sudo bash
#
# or from a clone:
#   sudo bash scripts/server-setup.sh
#
# Environment overrides:
#   FORGELINK_REPO         Git URL           (default baked in below)
#   FORGELINK_REF          Branch/tag        (default: main)
#   FORGELINK_APP_DIR      Install location  (default: /opt/forgelink/app)
#   FORGELINK_PORT         API port          (default: 8080)
#   FORGELINK_PUBLIC_URL   Public base URL   (default: http://localhost:8080)
#   FORGELINK_API_KEYS     Comma-separated publish keys (default: generated)
#
set -euo pipefail

REPO="${FORGELINK_REPO:-https://github.com/your-org/forgelink.git}"
REF="${FORGELINK_REF:-main}"
APP_DIR="${FORGELINK_APP_DIR:-/opt/forgelink/app}"
PORT="${FORGELINK_PORT:-8080}"
PUBLIC_URL="${FORGELINK_PUBLIC_URL:-http://localhost:8080}"
SERVICE_USER="forgelink"
SERVICE_NAME="forgelink-api"

info() { printf '\033[36m==>\033[0m %s\n' "$*"; }
ok()   { printf '\033[32m✓\033[0m %s\n' "$*"; }
die()  { printf '\033[31m✗ %s\033[0m\n' "$*" >&2; exit 1; }

[ "$(id -u)" -eq 0 ] || die "Please run as root (use sudo)."

info "Installing system prerequisites"
apt-get update -y
apt-get install -y curl git ca-certificates build-essential python3

if ! command -v node >/dev/null 2>&1 || [ "$(node -p 'process.versions.node.split(".")[0]')" -lt 20 ]; then
  info "Installing Node.js 20 LTS"
  curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
  apt-get install -y nodejs
fi
ok "node $(node -v), npm $(npm -v)"

info "Creating service user '$SERVICE_USER'"
id "$SERVICE_USER" >/dev/null 2>&1 || useradd --system --create-home --home-dir /opt/forgelink --shell /usr/sbin/nologin "$SERVICE_USER"

info "Fetching ForgeLink into $APP_DIR"
mkdir -p "$APP_DIR"
if [ -d "$APP_DIR/.git" ]; then
  git -C "$APP_DIR" fetch --depth 1 origin "$REF"
  git -C "$APP_DIR" checkout "$REF"
  git -C "$APP_DIR" pull --ff-only origin "$REF" || true
else
  git clone --depth 1 --branch "$REF" "$REPO" "$APP_DIR"
fi

info "Installing dependencies and building"
cd "$APP_DIR"
npm install
npm run build
ok "Build complete"

# Generate an API key if none provided so publishing works out of the box.
API_KEYS="${FORGELINK_API_KEYS:-}"
if [ -z "$API_KEYS" ]; then
  API_KEYS="$(node -e 'console.log(require("crypto").randomBytes(24).toString("hex"))')"
  info "Generated API key (save this — needed for the Builder's Publish):"
  printf '    \033[1m%s\033[0m\n' "$API_KEYS"
fi

DATA_DIR="/opt/forgelink/data"
STORAGE_DIR="/opt/forgelink/storage"
JWT_SECRET="$(node -e 'console.log(require("crypto").randomBytes(32).toString("hex"))')"
mkdir -p "$DATA_DIR" "$STORAGE_DIR"
chown -R "$SERVICE_USER:$SERVICE_USER" /opt/forgelink

info "Writing systemd service '$SERVICE_NAME'"
cat > "/etc/systemd/system/${SERVICE_NAME}.service" <<UNIT
[Unit]
Description=ForgeLink Server API
After=network.target

[Service]
Type=simple
User=${SERVICE_USER}
WorkingDirectory=${APP_DIR}/packages/server-api
ExecStart=/usr/bin/node dist/index.js
Restart=on-failure
RestartSec=5
Environment=NODE_ENV=production
Environment=FORGELINK_PORT=${PORT}
Environment=FORGELINK_HOST=127.0.0.1
Environment=FORGELINK_DATA_DIR=${DATA_DIR}
Environment=FORGELINK_STORAGE_DIR=${STORAGE_DIR}
Environment=FORGELINK_PUBLIC_URL=${PUBLIC_URL}
Environment=FORGELINK_JWT_SECRET=${JWT_SECRET}
Environment=FORGELINK_API_KEYS=${API_KEYS}

[Install]
WantedBy=multi-user.target
UNIT

systemctl daemon-reload
systemctl enable --now "$SERVICE_NAME"

sleep 2
info "Health check"
if curl -fsS "http://127.0.0.1:${PORT}/healthz" >/dev/null; then
  ok "ForgeLink Server API is running on port ${PORT}."
else
  die "Service did not respond. Check: journalctl -u ${SERVICE_NAME} -e"
fi

echo ""
echo "Service:   systemctl status ${SERVICE_NAME}"
echo "Logs:      journalctl -u ${SERVICE_NAME} -f"
echo "Health:    curl http://127.0.0.1:${PORT}/healthz"
echo ""
echo "Set up a reverse proxy (Nginx/Apache) + TLS using the deployment package"
echo "the Builder produces, or see docs/DEPLOYMENT.md."
