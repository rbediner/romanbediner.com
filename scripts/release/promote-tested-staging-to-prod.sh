#!/usr/bin/env bash
# Purpose:
# - Execute the canonical release SOP: local CI-parity -> staging CI -> prod promotion.
# Architectural role:
# - Prevents prod drift by promoting only the exact staging commit that passed CI.
# Dependencies:
# - bash, git, node/npm, python3, curl-compatible GitHub API access via monitor script.
# Security notes:
# - Mutates only git branches/remotes configured for this repository.

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "${SCRIPT_DIR}/../.." && pwd)"

cd "${REPO_ROOT}"

if [[ -n "$(git status --porcelain)" ]]; then
  echo "[release] Working tree is not clean. Commit or stash changes first."
  exit 1
fi

echo "[release] Checking out staging and pulling latest"
git checkout staging
git pull --ff-only origin staging

echo "[release] Running full CI-parity checks"
bash scripts/qa/run-ci-parity.sh

echo "[release] Pushing staging"
git push origin staging

STAGING_SHA="$(git rev-parse HEAD)"
echo "[release] Monitoring staging CI for SHA ${STAGING_SHA}"
node scripts/release/watch-ci-run.js --branch staging --sha "${STAGING_SHA}" --timeout 1800 --interval 15

echo "[release] Promoting tested SHA to prod via fast-forward"
git checkout prod
git pull --ff-only origin prod
git merge --ff-only "${STAGING_SHA}"
git push origin prod

echo "[release] Monitoring prod CI for SHA ${STAGING_SHA}"
node scripts/release/watch-ci-run.js --branch prod --sha "${STAGING_SHA}" --timeout 1800 --interval 15

echo "[release] Release complete: staging/prod both green at ${STAGING_SHA}"
