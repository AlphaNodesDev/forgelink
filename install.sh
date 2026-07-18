#!/usr/bin/env bash
#
# ForgeLink installer.
#
# Two ways to use it:
#
#   1) Remote one-liner (clones the repo, then installs):
#        curl -fsSL https://raw.githubusercontent.com/<owner>/<repo>/main/install.sh | bash
#
#   2) From an existing clone:
#        git clone https://github.com/<owner>/<repo>.git
#        cd <repo>
#        bash install.sh
#
# What it does:
#   - checks prerequisites (git, node >= 20, npm >= 10)
#   - clones the repo if the script is run outside of it
#   - installs workspace dependencies (npm install)
#   - builds the backend packages (shared, adapters, server-api)
#   - optionally builds the desktop apps (Builder / Launcher) with --with-apps
#
# Environment overrides:
#   FORGELINK_REPO   Git URL to clone      (default: the URL baked in below)
#   FORGELINK_REF    Branch/tag to check out (default: main)
#   FORGELINK_DIR    Target directory      (default: forgelink)
#
set -euo pipefail

# --- Configuration (edit REPO after you publish) ---------------------------
REPO="${FORGELINK_REPO:-https://github.com/your-org/forgelink.git}"
REF="${FORGELINK_REF:-main}"
TARGET_DIR="${FORGELINK_DIR:-forgelink}"
WITH_APPS=0

for arg in "$@"; do
  case "$arg" in
    --with-apps) WITH_APPS=1 ;;
    --ref=*)     REF="${arg#*=}" ;;
    --dir=*)     TARGET_DIR="${arg#*=}" ;;
    -h|--help)
      grep '^#' "$0" | sed 's/^# \{0,1\}//' | sed '1d'
      exit 0
      ;;
    *) echo "Unknown option: $arg" >&2; exit 1 ;;
  esac
done

# --- Pretty output helpers -------------------------------------------------
bold()  { printf '\033[1m%s\033[0m\n' "$*"; }
info()  { printf '\033[36m==>\033[0m %s\n' "$*"; }
ok()    { printf '\033[32m✓\033[0m %s\n' "$*"; }
warn()  { printf '\033[33m! \033[0m%s\n' "$*"; }
die()   { printf '\033[31m✗ %s\033[0m\n' "$*" >&2; exit 1; }

# --- Prerequisite checks ---------------------------------------------------
check_prereqs() {
  info "Checking prerequisites"
  command -v git >/dev/null 2>&1 || die "git is required but not installed."
  command -v node >/dev/null 2>&1 || die "Node.js >= 20 is required. Install from https://nodejs.org"
  command -v npm  >/dev/null 2>&1 || die "npm >= 10 is required (ships with Node.js)."

  local node_major
  node_major="$(node -p 'process.versions.node.split(".")[0]')"
  [ "$node_major" -ge 20 ] || die "Node.js >= 20 required; found $(node -v)."
  ok "git $(git --version | awk '{print $3}'), node $(node -v), npm $(npm -v)"
}

# --- Resolve the source directory ------------------------------------------
# If we're already inside the repo (package.json with the forgelink workspace
# exists next to this script), use it. Otherwise clone.
resolve_source() {
  local script_dir
  script_dir="$(cd "$(dirname "${BASH_SOURCE[0]:-$0}")" 2>/dev/null && pwd || echo '')"

  if [ -n "$script_dir" ] && [ -f "$script_dir/package.json" ] \
     && grep -q '"name": "forgelink"' "$script_dir/package.json" 2>/dev/null; then
    SRC_DIR="$script_dir"
    info "Using existing checkout at $SRC_DIR"
  else
    info "Cloning $REPO (ref: $REF) into $TARGET_DIR"
    if [ -d "$TARGET_DIR/.git" ]; then
      warn "$TARGET_DIR already exists — pulling latest instead of cloning."
      git -C "$TARGET_DIR" fetch --depth 1 origin "$REF"
      git -C "$TARGET_DIR" checkout "$REF"
      git -C "$TARGET_DIR" pull --ff-only origin "$REF" || true
    else
      git clone --depth 1 --branch "$REF" "$REPO" "$TARGET_DIR"
    fi
    SRC_DIR="$(cd "$TARGET_DIR" && pwd)"
  fi
  ok "Source ready at $SRC_DIR"
}

# --- Install + build -------------------------------------------------------
install_and_build() {
  cd "$SRC_DIR"

  info "Installing dependencies (this can take a few minutes)"
  npm install
  ok "Dependencies installed"

  info "Building backend (shared, adapters, server-api)"
  npm run build
  ok "Backend built"

  if [ "$WITH_APPS" -eq 1 ]; then
    info "Building desktop apps (Builder + Launcher)"
    npm run build --workspace=@forgelink/builder
    npm run build --workspace=@forgelink/launcher
    ok "Desktop apps built"
  else
    warn "Skipped desktop app builds. Re-run with --with-apps to build them."
  fi
}

# --- Done ------------------------------------------------------------------
print_next_steps() {
  echo ""
  bold "ForgeLink is installed."
  echo ""
  echo "Next steps:"
  echo "  cd $SRC_DIR"
  echo "  npm run dev:server      # start the Server API (http://localhost:8080)"
  echo "  npm run dev:builder     # launch the Builder desktop app"
  echo "  npm run dev:launcher    # launch the Launcher desktop app"
  echo ""
  echo "To deploy the Server API to a Linux host, see docs/DEPLOYMENT.md"
  echo "and use the deployment package produced by the Builder's Build step."
  echo ""
}

main() {
  bold "ForgeLink installer"
  check_prereqs
  resolve_source
  install_and_build
  print_next_steps
}

main
