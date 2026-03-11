#!/usr/bin/env bash
set -euo pipefail

# Runs Playwright tests from a local /tmp mirror to avoid cloud-backed FS timeouts
# when reading node_modules in synced workspace paths.

PLAYWRIGHT_VERSION="1.58.2"
PLAYWRIGHT_DEFAULT_WORKERS="${PLAYWRIGHT_DEFAULT_WORKERS:-50%}"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
TMP_ROOT="${TMPDIR:-/tmp}/rb-playwright-runtime"
PKG_ROOT="$TMP_ROOT/packages"
RUN_DIR="$TMP_ROOT/run"

mkdir -p "$PKG_ROOT"

declare -a PLAYWRIGHT_ARGS=("$@")
HAS_WORKERS_FLAG=0
for arg in "${PLAYWRIGHT_ARGS[@]-}"; do
  if [[ "$arg" == "--workers" || "$arg" == --workers=* ]]; then
    HAS_WORKERS_FLAG=1
    break
  fi
done
if [[ "$HAS_WORKERS_FLAG" -eq 0 ]]; then
  PLAYWRIGHT_ARGS+=("--workers=$PLAYWRIGHT_DEFAULT_WORKERS")
fi

if [[ "${RB_LOCAL_MIRROR_ACTIVE:-0}" == "1" && -f "$ROOT_DIR/node_modules/playwright/cli.js" ]]; then
  cd "$ROOT_DIR"
  node node_modules/playwright/cli.js test "${PLAYWRIGHT_ARGS[@]}"
  exit 0
fi

download_pkg_tgz() {
  local pkg="$1"
  local tgz="$PKG_ROOT/${pkg}-${PLAYWRIGHT_VERSION}.tgz"
  local url="https://registry.npmjs.org/${pkg}/-/${pkg}-${PLAYWRIGHT_VERSION}.tgz"
  if [[ -f "$tgz" ]]; then
    return 0
  fi

  curl -fsSL "$url" -o "$tgz" \
    || curl --resolve "registry.npmjs.org:443:104.16.6.34" -fsSL "$url" -o "$tgz" \
    || curl --resolve "registry.npmjs.org:443:104.16.9.34" -fsSL "$url" -o "$tgz"
}

extract_pkg() {
  local pkg="$1"
  local target="$PKG_ROOT/$pkg"
  if [[ -f "$target/package/package.json" ]]; then
    return 0
  fi

  download_pkg_tgz "$pkg"
  rm -rf "$target"
  mkdir -p "$target"
  tar -xzf "$PKG_ROOT/${pkg}-${PLAYWRIGHT_VERSION}.tgz" -C "$target"
}

extract_pkg "playwright"
extract_pkg "playwright-core"

rm -rf "$RUN_DIR"
mkdir -p "$RUN_DIR"

if command -v rsync >/dev/null 2>&1; then
  rsync -a --delete --exclude ".git" --exclude "node_modules" "$ROOT_DIR/" "$RUN_DIR/"
else
  cp -R "$ROOT_DIR"/. "$RUN_DIR"/
  rm -rf "$RUN_DIR/.git" "$RUN_DIR/node_modules"
fi

mkdir -p "$RUN_DIR/node_modules"
ln -sfn "$PKG_ROOT/playwright/package" "$RUN_DIR/node_modules/playwright"
ln -sfn "$PKG_ROOT/playwright-core/package" "$RUN_DIR/node_modules/playwright-core"

cd "$RUN_DIR"
node --preserve-symlinks --preserve-symlinks-main node_modules/playwright/cli.js test "${PLAYWRIGHT_ARGS[@]}"
