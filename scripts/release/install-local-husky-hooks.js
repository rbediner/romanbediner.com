#!/usr/bin/env node
/**
 * Purpose:
 * - Install local Husky hooks only in developer environments where Git metadata is present.
 *
 * Architectural role:
 * - Keeps local pre-push QA enforcement enabled without breaking CI dependency installation.
 *
 * Dependencies:
 * - Node.js filesystem/process APIs and the locally installed Husky package binary.
 *
 * Security/CSP considerations:
 * - Runs only during package install/prepare; does not ship to the browser or affect runtime policy.
 *
 * Migration considerations:
 * - Update the binary path if Husky changes its published executable layout in a future major version.
 */
const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

const ROOT = path.resolve(__dirname, '..', '..');
const gitDir = path.join(ROOT, '.git');
const huskyBin = path.join(ROOT, 'node_modules', '.bin', process.platform === 'win32' ? 'husky.cmd' : 'husky');

// CI should validate code, not mutate local Git hooks.
if (process.env.CI === '1' || process.env.CI === 'true') {
  console.log('[install-local-husky-hooks] CI detected. Skipping Husky hook installation.');
  process.exit(0);
}

// Package installs outside a Git checkout should remain installable.
if (!fs.existsSync(gitDir)) {
  console.log('[install-local-husky-hooks] No .git directory detected. Skipping Husky hook installation.');
  process.exit(0);
}

if (!fs.existsSync(huskyBin)) {
  console.log('[install-local-husky-hooks] Husky binary is unavailable. Skipping hook installation.');
  process.exit(0);
}

const result = spawnSync(huskyBin, { cwd: ROOT, stdio: 'inherit' });

if (result.error) {
  console.error(`[install-local-husky-hooks] Failed to launch Husky: ${result.error.message}`);
  process.exit(1);
}

process.exit(result.status ?? 0);
