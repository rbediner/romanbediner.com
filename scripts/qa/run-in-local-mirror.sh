#!/usr/bin/env bash
set -euo pipefail

# Mirrors the repository to /tmp and executes a command there to avoid
# filesystem timeouts from cloud-synced workspace paths.

if [[ "$#" -eq 0 ]]; then
  echo "[local-mirror] Usage: bash scripts/qa/run-in-local-mirror.sh <command> [args...]"
  exit 2
fi

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "$SCRIPT_DIR/../.." && pwd)"
TMP_ROOT="${TMPDIR:-/tmp}/rb-local-runtime"
RUN_DIR="$TMP_ROOT/run"

has_git_history() {
  git -C "$ROOT_DIR" rev-parse --verify HEAD >/dev/null 2>&1
}

overlay_worktree() {
  if command -v rsync >/dev/null 2>&1; then
    rsync -a --delete \
      --exclude ".git" \
      --exclude "node_modules" \
      --exclude "QA/results/playwright" \
      --exclude "QA/results/h1-calibration" \
      "$ROOT_DIR/" "$RUN_DIR/"
  else
    cp -R "$ROOT_DIR"/. "$RUN_DIR"/
    rm -rf "$RUN_DIR/.git" "$RUN_DIR/node_modules"
  fi
}

rm -rf "$RUN_DIR"
mkdir -p "$RUN_DIR"

if has_git_history; then
  git -C "$ROOT_DIR" archive HEAD | tar -xf - -C "$RUN_DIR"
else
  overlay_worktree
fi

cd "$RUN_DIR"
git init -q
git config user.name "Codex Mirror"
git config user.email "codex-mirror@example.com"
git add -A
git commit -qm "Mirror baseline"
BASE_SHA="$(git rev-parse HEAD)"

overlay_worktree
git add -A
git commit --allow-empty -qm "Mirror overlay"

if has_git_history; then
  git update-ref refs/remotes/origin/main "$BASE_SHA"
  git update-ref refs/remotes/origin/staging "$BASE_SHA"
fi

echo "[local-mirror] Running npm ci in $RUN_DIR"
npm ci

echo "[local-mirror] Executing: $*"
RB_LOCAL_MIRROR_ACTIVE=1 "$@"
