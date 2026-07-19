#!/usr/bin/env bash
#
# ForgeLink interactive setup wizard (Ubuntu/Debian).
#
# A guided, question-and-answer installer that:
#   1. checks & installs prerequisites (git, Node.js 20+, build tools)
#   2. finds your 7 Days to Die dedicated server folder (you enter it, or it
#      auto-searches; if none exists it can install one via SteamCMD)
#   3. builds & runs the ForgeLink Server API as a systemd service
#   4. optionally hosts a download website on your domain with free SSL
#   5. resolves the public address players connect to (domain or public IP)
#
# Run it (works piped or from a clone):
#   curl -fsSL https://raw.githubusercontent.com/AlphaNodesDev/forgelink/main/scripts/setup-wizard.sh | sudo bash
#
set -uo pipefail

# ---------------------------------------------------------------------------
# Config / constants
# ---------------------------------------------------------------------------
REPO="${FORGELINK_REPO:-https://github.com/AlphaNodesDev/forgelink.git}"
REF="${FORGELINK_REF:-main}"
APP_DIR="${FORGELINK_APP_DIR:-/opt/forgelink/app}"
DATA_DIR="/opt/forgelink/data"
STORAGE_DIR="/opt/forgelink/storage"
WEBSITE_DIR="/opt/forgelink/website"
SERVICE_USER="forgelink"
SERVICE_NAME="forgelink-api"
PORT="${FORGELINK_PORT:-8080}"
SEVEN_DTD_APPID="294420"        # 7 Days to Die Dedicated Server (SteamCMD)
TTY="/dev/tty"

# ---------------------------------------------------------------------------
# Pretty output
# ---------------------------------------------------------------------------
c_reset='\033[0m'; c_bold='\033[1m'; c_cyan='\033[36m'; c_green='\033[32m'
c_yellow='\033[33m'; c_red='\033[31m'
bold()  { printf "${c_bold}%s${c_reset}\n" "$*"; }
info()  { printf "${c_cyan}==>${c_reset} %s\n" "$*"; }
ok()    { printf "${c_green}✓${c_reset} %s\n" "$*"; }
warn()  { printf "${c_yellow}!${c_reset} %s\n" "$*"; }
die()   { printf "${c_red}✗ %s${c_reset}\n" "$*" >&2; exit 1; }
hr()    { printf '%s\n' "----------------------------------------------------------------"; }

# ---------------------------------------------------------------------------
# Interactive prompts (read from the terminal so it works under `curl | bash`)
# ---------------------------------------------------------------------------
ask() {                          # ask "Prompt: " VARNAME [default]
  local prompt="$1" __var="$2" default="${3:-}" ans
  if [ -n "$default" ]; then prompt="$prompt [$default]"; fi
  printf "%s " "$prompt" > "$TTY"
  read -r ans < "$TTY" || ans=""
  [ -z "$ans" ] && ans="$default"
  printf -v "$__var" '%s' "$ans"
}

ask_yn() {                       # ask_yn "Question?" default(y/n) ; returns 0 for yes
  local prompt="$1" default="${2:-n}" ans
  local hint="[y/N]"; [ "$default" = "y" ] && hint="[Y/n]"
  while true; do
    printf "%s %s " "$prompt" "$hint" > "$TTY"
    read -r ans < "$TTY" || ans=""
    [ -z "$ans" ] && ans="$default"
    case "${ans,,}" in
      y|yes) return 0 ;;
      n|no)  return 1 ;;
      *) printf "Please answer y or n.\n" > "$TTY" ;;
    esac
  done
}

# ---------------------------------------------------------------------------
# Pre-flight
# ---------------------------------------------------------------------------
[ "$(id -u)" -eq 0 ] || die "Please run as root (use sudo)."
[ -e "$TTY" ] || die "This wizard needs an interactive terminal. Run it directly, not in a pipeline without a TTY."

clear || true
bold "======================================================"
bold "        ForgeLink Setup Wizard for 7 Days to Die       "
bold "======================================================"
echo
echo "This wizard will guide you through installing ForgeLink,"
echo "locating your game server, and (optionally) publishing a"
echo "download website with HTTPS."
echo

# ---------------------------------------------------------------------------
# Step 1 — Dependencies
# ---------------------------------------------------------------------------
step_dependencies() {
  hr; bold "Step 1/5 · Checking dependencies"; hr

  info "Updating package lists"
  apt-get update -y >/dev/null 2>&1 || warn "apt-get update reported issues (continuing)."

  # Base tools needed to build native modules (better-sqlite3) and clone.
  local base_pkgs=(curl git ca-certificates build-essential python3)
  local missing=()
  for pkg in "${base_pkgs[@]}"; do
    dpkg -s "$pkg" >/dev/null 2>&1 || missing+=("$pkg")
  done
  if [ "${#missing[@]}" -gt 0 ]; then
    info "Installing: ${missing[*]}"
    apt-get install -y "${missing[@]}" >/dev/null 2>&1 || die "Failed to install base packages."
  fi
  ok "Base tools present (curl, git, build-essential, python3)"

  # Node.js 20+
  if command -v node >/dev/null 2>&1 && [ "$(node -p 'process.versions.node.split(".")[0]' 2>/dev/null || echo 0)" -ge 20 ]; then
    ok "Node.js $(node -v) already installed"
  else
    info "Installing Node.js 20 LTS"
    curl -fsSL https://deb.nodesource.com/setup_20.x | bash - >/dev/null 2>&1
    apt-get install -y nodejs >/dev/null 2>&1 || die "Failed to install Node.js."
    ok "Node.js $(node -v) installed"
  fi

  command -v npm >/dev/null 2>&1 || die "npm is missing after Node install."
  ok "npm $(npm -v) ready"
}

# ---------------------------------------------------------------------------
# Step 2 — Locate or install the 7 Days to Die server
# ---------------------------------------------------------------------------
SERVER_PATH=""

# Validate a folder looks like a 7DTD dedicated server.
is_valid_7dtd() {
  local dir="$1"
  [ -d "$dir" ] || return 1
  [ -f "$dir/serverconfig.xml" ] || \
  [ -f "$dir/7DaysToDieServer.x86_64" ] || \
  [ -f "$dir/startserver.sh" ] || return 1
  return 0
}

# Show a quick summary of what we detected inside the folder.
show_server_summary() {
  local dir="$1"
  echo "  Folder: $dir"
  [ -f "$dir/serverconfig.xml" ] && echo "    ✓ serverconfig.xml found"
  [ -d "$dir/Mods" ] && echo "    ✓ Mods/ found ($(find "$dir/Mods" -maxdepth 1 -mindepth 1 -type d 2>/dev/null | wc -l) mod folders)"
  [ -d "$dir/Saves" ] && echo "    ✓ Saves/ found"
}

auto_search_server() {
  info "Auto-searching for a 7 Days to Die server (this can take 1-2 minutes)..." >&2
  # Common install locations first (fast), then a broad search (slower).
  local candidates
  candidates="$(find /home /opt /srv /root -maxdepth 6 -name 'serverconfig.xml' 2>/dev/null | head -n 20)"
  printf '%s\n' "$candidates"
}

step_locate_server() {
  hr; bold "Step 2/5 · Your 7 Days to Die server"; hr
  echo
  echo "ForgeLink needs your existing dedicated server folder."
  echo "It will NOT overwrite it — it only reads config and mods."
  echo

  if ask_yn "Do you already know your server folder location?" "y"; then
    # User-provided path, with re-prompt on invalid.
    while true; do
      ask "Enter the full path to your 7DTD server folder:" SERVER_PATH ""
      if [ -z "$SERVER_PATH" ]; then warn "Path cannot be empty."; continue; fi
      if is_valid_7dtd "$SERVER_PATH"; then
        ok "Valid 7 Days to Die server detected:"
        show_server_summary "$SERVER_PATH"
        if ask_yn "Is this the correct server?" "y"; then break; fi
      else
        warn "That folder doesn't look like a 7DTD server (no serverconfig.xml / server binary)."
        ask_yn "Try a different path?" "y" || break
      fi
    done
  else
    # Offer auto-search.
    if ask_yn "Auto-search the disk for a server? (may take 1-2 minutes)" "y"; then
      mapfile -t found < <(auto_search_server)
      if [ "${#found[@]}" -gt 0 ] && [ -n "${found[0]}" ]; then
        echo "Found possible server(s):"
        local i=1
        for f in "${found[@]}"; do echo "  $i) $(dirname "$f")"; i=$((i+1)); done
        ask "Pick a number (or press Enter to skip):" pick ""
        if [ -n "$pick" ] && [ "$pick" -ge 1 ] 2>/dev/null && [ "$pick" -le "${#found[@]}" ]; then
          SERVER_PATH="$(dirname "${found[$((pick-1))]}")"
          ok "Selected: $SERVER_PATH"
          show_server_summary "$SERVER_PATH"
        fi
      else
        warn "No existing 7DTD server found on disk."
      fi
    fi
  fi

  # If still no server, offer to install one via SteamCMD.
  if [ -z "$SERVER_PATH" ] || ! is_valid_7dtd "$SERVER_PATH"; then
    echo
    warn "No valid server selected."
    if ask_yn "Install a fresh 7 Days to Die dedicated server now (via SteamCMD)?" "n"; then
      install_7dtd_server
    else
      warn "Continuing without a game server. You can add one later and re-run this wizard."
      SERVER_PATH=""
    fi
  fi
}

install_7dtd_server() {
  local target="/opt/7dtd-server"
  info "Installing SteamCMD and the 7DTD dedicated server into $target"
  dpkg --add-architecture i386 >/dev/null 2>&1 || true
  apt-get update -y >/dev/null 2>&1 || true
  # steamcmd requires accepting the Steam license; DEBIAN_FRONTEND avoids prompts.
  echo steam steam/question select "I AGREE" | debconf-set-selections
  echo steam steam/license note '' | debconf-set-selections
  DEBIAN_FRONTEND=noninteractive apt-get install -y steamcmd lib32gcc-s1 >/dev/null 2>&1 \
    || warn "Could not install steamcmd from apt; you may need to enable multiverse."
  mkdir -p "$target"
  if command -v steamcmd >/dev/null 2>&1; then
    info "Downloading 7DTD server files (large download, please wait)..."
    steamcmd +force_install_dir "$target" +login anonymous +app_update "$SEVEN_DTD_APPID" validate +quit \
      || warn "SteamCMD reported an issue; check output above."
    if is_valid_7dtd "$target"; then
      SERVER_PATH="$target"
      ok "7DTD server installed at $SERVER_PATH"
    else
      warn "Install finished but server files weren't detected at $target."
    fi
  else
    warn "steamcmd not available; skipping automatic server install."
  fi
}

# ---------------------------------------------------------------------------
# Step 3 — Install & run the ForgeLink Server API
# ---------------------------------------------------------------------------
PUBLIC_ADDRESS=""      # what players connect to (domain or IP)
API_KEY=""

detect_public_ip() {
  # Try common metadata/echo services; fall back to first global IP.
  local ip
  ip="$(curl -fsS --max-time 5 https://api.ipify.org 2>/dev/null)" \
    || ip="$(curl -fsS --max-time 5 https://ifconfig.me 2>/dev/null)" \
    || ip="$(hostname -I 2>/dev/null | awk '{print $1}')"
  printf '%s' "$ip"
}

# Read ServerName/Port etc. from serverconfig.xml if we have a server.
read_server_config_value() {
  local key="$1" file="$SERVER_PATH/serverconfig.xml"
  [ -f "$file" ] || return 1
  grep -oP "<property\s+name=\"$key\"\s+value=\"\K[^\"]*" "$file" 2>/dev/null | head -n1
}

step_resolve_address() {
  hr; bold "Step 4/5 · Server address players will connect to"; hr
  echo
  echo "Players' launchers need an address to reach your server."
  echo

  local cfg_ip=""
  if [ -n "$SERVER_PATH" ]; then
    cfg_ip="$(read_server_config_value ServerName || true)"
  fi

  if ask_yn "Do you have a domain name for this server?" "n"; then
    ask "Enter your domain (e.g. play.myserver.com):" PUBLIC_ADDRESS "$cfg_ip"
  else
    local detected; detected="$(detect_public_ip)"
    echo "Detected public IP: ${detected:-unknown}"
    ask "Use this public IP, or enter another address:" PUBLIC_ADDRESS "$detected"
  fi
  [ -z "$PUBLIC_ADDRESS" ] && PUBLIC_ADDRESS="$(detect_public_ip)"
  ok "Server address set to: $PUBLIC_ADDRESS"
}

step_install_api() {
  hr; bold "Step 3/5 · Installing the ForgeLink Server API"; hr

  id "$SERVICE_USER" >/dev/null 2>&1 || \
    useradd --system --create-home --home-dir /opt/forgelink --shell /usr/sbin/nologin "$SERVICE_USER"

  info "Fetching ForgeLink into $APP_DIR"
  mkdir -p "$APP_DIR"
  if [ -d "$APP_DIR/.git" ]; then
    git -C "$APP_DIR" fetch --depth 1 origin "$REF" >/dev/null 2>&1 || true
    git -C "$APP_DIR" checkout "$REF" >/dev/null 2>&1 || true
    git -C "$APP_DIR" pull --ff-only origin "$REF" >/dev/null 2>&1 || true
  else
    git clone --depth 1 --branch "$REF" "$REPO" "$APP_DIR" >/dev/null 2>&1 || die "Clone failed."
  fi

  info "Installing dependencies and building (a few minutes)..."
  ( cd "$APP_DIR" && npm install >/dev/null 2>&1 && npm run build >/dev/null 2>&1 ) \
    || die "Build failed. Run 'cd $APP_DIR && npm install && npm run build' to see the error."
  ok "ForgeLink built"

  API_KEY="$(node -e 'console.log(require("crypto").randomBytes(24).toString("hex"))')"
  local jwt_secret; jwt_secret="$(node -e 'console.log(require("crypto").randomBytes(32).toString("hex"))')"
  mkdir -p "$DATA_DIR" "$STORAGE_DIR" "$WEBSITE_DIR"
  chown -R "$SERVICE_USER:$SERVICE_USER" /opt/forgelink

  local scheme="http"; # becomes https after the website/SSL step if chosen
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
Environment=FORGELINK_PUBLIC_URL=${scheme}://${PUBLIC_ADDRESS}
Environment=FORGELINK_JWT_SECRET=${jwt_secret}
Environment=FORGELINK_API_KEYS=${API_KEY}

[Install]
WantedBy=multi-user.target
UNIT

  systemctl daemon-reload
  systemctl enable --now "$SERVICE_NAME" >/dev/null 2>&1
  sleep 2
  if curl -fsS "http://127.0.0.1:${PORT}/healthz" >/dev/null 2>&1; then
    ok "ForgeLink Server API is running on port ${PORT}"
  else
    warn "API did not respond yet. Check: journalctl -u ${SERVICE_NAME} -e"
  fi
}

# ---------------------------------------------------------------------------
# Step 5 — Optional: host a download website with a domain + HTTPS
# ---------------------------------------------------------------------------
WEBSITE_URL=""

write_download_page() {
  # A simple landing page with a "Download Launcher" button that points at the
  # API's launcher endpoint, plus live status pulled from the API.
  local api_base="$1"
  cat > "$WEBSITE_DIR/index.html" <<HTML
<!DOCTYPE html>
<html lang="en"><head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>Download Launcher</title>
<style>
 body{margin:0;font-family:system-ui,sans-serif;background:#0b0b12;color:#e8e8f0;
      min-height:100vh;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;padding:2rem}
 h1{font-size:clamp(2rem,6vw,3.5rem);margin:0 0 .5rem}
 .sub{opacity:.7;margin-bottom:2rem}
 .btn{display:inline-block;padding:1rem 2.5rem;border-radius:999px;font-weight:800;color:#fff;text-decoration:none;
      background:linear-gradient(135deg,#6d28d9,#22d3ee);box-shadow:0 12px 30px -10px #6d28d9}
 .stats{display:flex;gap:1rem;margin-top:2rem;flex-wrap:wrap;justify-content:center}
 .card{background:rgba(255,255,255,.06);border-radius:16px;padding:1rem 1.5rem;min-width:120px}
 .num{font-size:1.6rem;font-weight:800;color:#22d3ee}
</style></head><body>
 <h1 id="name">Game Server Launcher</h1>
 <div class="sub">Download the launcher, click Play, and you're in.</div>
 <a class="btn" href="${api_base}/api/launcher">⬇ Download Launcher</a>
 <div class="stats">
   <div class="card"><div class="num" id="status">—</div><div>Status</div></div>
   <div class="card"><div class="num" id="players">—</div><div>Players</div></div>
 </div>
<script>
 const API=${api_base@Q};
 fetch(API+'/api/status').then(r=>r.json()).then(s=>{
   document.getElementById('status').textContent=s.online?'Online':'Offline';
   document.getElementById('players').textContent=(s.playersOnline??0)+' / '+(s.playersMax??0);
 }).catch(()=>{});
</script></body></html>
HTML
  chown -R "$SERVICE_USER:$SERVICE_USER" "$WEBSITE_DIR"
}

step_website() {
  hr; bold "Step 5/5 · Download website (optional)"; hr
  echo
  echo "This publishes a web page with a 'Download Launcher' button so your"
  echo "players can grab the launcher .exe from a link."
  echo
  if ! ask_yn "Host a download website now?" "y"; then
    warn "Skipping website. Players can still download from ${PUBLIC_ADDRESS}:${PORT}/api/launcher"
    return
  fi

  local domain use_https="n"
  if ask_yn "Do you have a domain pointing at this server?" "n"; then
    ask "Enter the domain for the website (e.g. play.myserver.com):" domain "$PUBLIC_ADDRESS"
    use_https="y"
  else
    domain="$(detect_public_ip)"
    warn "No domain given — the site will be served on http://$domain (no HTTPS without a domain)."
  fi

  info "Installing and configuring Nginx"
  apt-get install -y nginx >/dev/null 2>&1 || die "Failed to install nginx."

  local scheme="http"
  [ "$use_https" = "y" ] && scheme="https"
  write_download_page "${scheme}://${domain}"

  cat > "/etc/nginx/sites-available/forgelink.conf" <<NGINX
server {
    listen 80;
    server_name ${domain};
    root ${WEBSITE_DIR};
    index index.html;

    location /api/ {
        proxy_pass http://127.0.0.1:${PORT};
        proxy_http_version 1.1;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_buffering off;
    }
    location / { try_files \$uri \$uri/ /index.html; }
}
NGINX
  ln -sf /etc/nginx/sites-available/forgelink.conf /etc/nginx/sites-enabled/forgelink.conf
  rm -f /etc/nginx/sites-enabled/default
  nginx -t >/dev/null 2>&1 && systemctl reload nginx || die "nginx config test failed."
  ok "Website served on http://${domain}"
  WEBSITE_URL="http://${domain}"

  if [ "$use_https" = "y" ]; then
    if ask_yn "Set up free HTTPS (Let's Encrypt) for ${domain} now?" "y"; then
      local email
      ask "Email for Let's Encrypt (renewal notices):" email ""
      info "Installing Certbot and requesting a certificate"
      apt-get install -y certbot python3-certbot-nginx >/dev/null 2>&1 || warn "Certbot install issue."
      if certbot --nginx -n --agree-tos -m "${email:-admin@$domain}" -d "$domain" >/dev/null 2>&1; then
        ok "HTTPS enabled: https://${domain}"
        WEBSITE_URL="https://${domain}"
        # Point the API's public URL at https now.
        sed -i "s#FORGELINK_PUBLIC_URL=.*#FORGELINK_PUBLIC_URL=https://${domain}#" \
          "/etc/systemd/system/${SERVICE_NAME}.service"
        systemctl daemon-reload && systemctl restart "$SERVICE_NAME"
        write_download_page "https://${domain}"
        systemctl reload nginx
      else
        warn "Certbot failed. Common causes: DNS for ${domain} not pointing here yet, or ports 80/443 blocked."
        warn "Fix DNS/firewall, then run: sudo certbot --nginx -d ${domain}"
      fi
    fi
  fi
}

# ---------------------------------------------------------------------------
# Final summary
# ---------------------------------------------------------------------------
final_summary() {
  echo; hr; bold "✓ ForgeLink setup complete"; hr
  echo
  echo "Server API:     http://127.0.0.1:${PORT}  (proxied publicly if you set up the website)"
  [ -n "$SERVER_PATH" ] && echo "Game server:    $SERVER_PATH"
  echo "Players connect to: ${PUBLIC_ADDRESS}"
  [ -n "$WEBSITE_URL" ] && echo "Download page:  $WEBSITE_URL"
  echo
  bold "SAVE YOUR API KEY (needed in the Builder to Publish):"
  printf "    ${c_bold}%s${c_reset}\n" "$API_KEY"
  echo
  echo "Next steps:"
  echo "  1. Open the ForgeLink Builder on your Windows PC."
  echo "  2. Point it at your server, add branding, click Build."
  echo "  3. Publish using the API key above and this address: ${PUBLIC_ADDRESS}"
  [ -n "$WEBSITE_URL" ] && echo "  4. Share $WEBSITE_URL with your players."
  echo
  echo "Manage the service:"
  echo "  systemctl status ${SERVICE_NAME}   |   journalctl -u ${SERVICE_NAME} -f"
  echo
  warn "If this is a cloud VPS (AWS/Azure/GCP), open ports 80, 443 and your game"
  warn "ports (7DTD: 26900 TCP/UDP, 26901-26903 UDP) in the provider's firewall."
}

# ---------------------------------------------------------------------------
# Run
# ---------------------------------------------------------------------------
main() {
  step_dependencies
  step_locate_server
  step_resolve_address
  step_install_api
  step_website
  final_summary
}
main
