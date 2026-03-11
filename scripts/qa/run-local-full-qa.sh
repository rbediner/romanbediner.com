#!/usr/bin/env bash
# Purpose:
# - Run the complete local QA workflow from any current directory.
# Architectural role:
# - Provides one descriptive operator entrypoint that covers contract, runtime, and visual QA.
# Dependencies:
# - bash, node/npm, python3, repository dev dependencies installed via npm ci.
# Security/CSP considerations:
# - Executes local test commands only; no elevated privileges or production mutations.
# Migration considerations:
# - If test command names change in package.json, update the commands below in the same commit.

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "${SCRIPT_DIR}/../.." && pwd)"

cd "${REPO_ROOT}"

echo "[run-local-full-qa] running npm run test:qa-full"
npm run test:qa-full

echo "[run-local-full-qa] running Playwright runtime suite"
npm run test:playwright

echo "[run-local-full-qa] running visual regression suite"
npm run test:visual

echo "[run-local-full-qa] all checks completed successfully"
