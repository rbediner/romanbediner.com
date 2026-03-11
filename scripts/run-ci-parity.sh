#!/usr/bin/env bash
# Purpose:
# - Run the exact CI-parity local test sequence before any staging/prod push.
# Architectural role:
# - Enforces deterministic local validation using the same command families as CI.
# Dependencies:
# - bash, node/npm, python3, playwright runtime dependencies.
# Security notes:
# - Executes local tests only; no network mutations and no branch writes.

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "${SCRIPT_DIR}/.." && pwd)"

if [[ "${RB_LOCAL_MIRROR_ACTIVE:-0}" != "1" && "$REPO_ROOT" == *"/Library/CloudStorage/"* ]]; then
  echo "[ci-parity] Cloud-synced workspace detected. Re-running from a local /tmp mirror."
  cd "${REPO_ROOT}"
  bash scripts/run-in-local-mirror.sh bash scripts/run-ci-parity.sh
  exit 0
fi

cd "${REPO_ROOT}"

echo "[ci-parity] Running Node contract suite in CI mode"
CI=1 npm run test:node

echo "[ci-parity] Running Jest policy suite in CI mode"
CI=1 npm run test:jest

echo "[ci-parity] Running Python QA suite"
npm run test:python

echo "[ci-parity] Running Playwright runtime suite with deterministic workers (minimum 3)"
npm run test:playwright -- --workers=3

echo "[ci-parity] Running visual regression suite"
npm run test:visual

echo "[ci-parity] All CI-parity checks passed"
