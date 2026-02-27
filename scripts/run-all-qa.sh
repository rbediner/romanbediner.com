#!/usr/bin/env bash
# Purpose:
# - Run the full local QA workflow from any current directory.
# Architectural role:
# - Provides one deterministic entrypoint for non-engineering operators to run all core checks.
# Dependencies:
# - bash, node/npm, python3, repository dev dependencies installed via npm ci.
# Security/CSP considerations:
# - Executes local test commands only; no elevated privileges or production mutations.
# Migration considerations:
# - If test command names change in package.json, update the commands below in the same commit.

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "${SCRIPT_DIR}/.." && pwd)"

cd "${REPO_ROOT}"

echo "[run-all-qa] running npm run test:qa-full"
npm run test:qa-full

echo "[run-all-qa] running visual regression suite"
RUN_VISUAL_TESTS=1 python3 -m unittest discover -s QA/tests -p test_visual_regression_playwright.py -v

echo "[run-all-qa] all checks completed successfully"
