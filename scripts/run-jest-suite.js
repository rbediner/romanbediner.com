#!/usr/bin/env node
/**
 * Purpose:
 * - Execute Jest tests from a single descriptive entrypoint.
 * Architectural role:
 * - Keeps package scripts deterministic across local and CI environments.
 * Dependencies:
 * - Node.js runtime
 * - local node_modules installation with jest binary
 * Security/CSP considerations:
 * - No network calls, no dynamic eval, no browser/runtime policy impact.
 * Migration considerations:
 * - If Jest binary path changes, update JEST_BIN resolution in this file only.
 */
const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

const ROOT = path.resolve(__dirname, '..');
const JEST_BIN = path.join(ROOT, 'node_modules', 'jest', 'bin', 'jest.js');

// In CI, missing Jest is a hard failure because lockfile installs must be deterministic.
if (!fs.existsSync(JEST_BIN)) {
  const message = 'Jest binary not found at node_modules/jest/bin/jest.js. Run `npm ci` to repair local dependencies.';
  if (process.env.CI) {
    console.error(`FAIL: ${message}`);
    process.exit(1);
  }
  console.warn(`WARN: ${message}`);
  console.warn('WARN: Skipping Jest tests outside CI to avoid blocking QA while dependency cache is repaired.');
  process.exit(0);
}

const result = spawnSync(process.execPath, [JEST_BIN, '--passWithNoTests'], {
  cwd: ROOT,
  stdio: 'inherit'
});

if (typeof result.status === 'number') {
  process.exit(result.status);
}

console.error('FAIL: Jest process exited without a status code.');
process.exit(1);
