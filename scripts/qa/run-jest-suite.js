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
const os = require('os');
const path = require('path');
const { spawnSync } = require('child_process');

const ROOT = path.resolve(__dirname, '..', '..');
const JEST_BIN = path.join(ROOT, 'node_modules', 'jest', 'bin', 'jest.js');
const MIRROR_RUNNER = path.join(ROOT, 'scripts', 'qa', 'run-in-local-mirror.sh');
const SHOULD_USE_MIRROR =
  !process.env.CI &&
  process.env.RB_LOCAL_MIRROR_ACTIVE !== '1' &&
  ROOT.includes(path.join('Library', 'CloudStorage'));

function runFromLocalMirror() {
  if (!fs.existsSync(MIRROR_RUNNER)) {
    return null;
  }

  console.warn(`[run-jest-suite] Re-running Jest from local mirror under ${os.tmpdir()}.`);
  return spawnSync('bash', [MIRROR_RUNNER, process.execPath, 'scripts/qa/run-jest-suite.js'], {
    cwd: ROOT,
    stdio: 'inherit',
    env: { ...process.env, RB_LOCAL_MIRROR_ACTIVE: '0' }
  });
}

// In CI, missing Jest is a hard failure because lockfile installs must be deterministic.
if (!fs.existsSync(JEST_BIN)) {
  const message = 'Jest binary not found at node_modules/jest/bin/jest.js. Run `npm ci` to repair local dependencies.';
  if (SHOULD_USE_MIRROR) {
    const mirrored = runFromLocalMirror();
    if (mirrored && typeof mirrored.status === 'number') {
      process.exit(mirrored.status);
    }
  }
  if (process.env.CI) {
    console.error(`FAIL: ${message}`);
    process.exit(1);
  }
  console.warn(`WARN: ${message}`);
  console.warn('WARN: Skipping Jest tests outside CI to avoid blocking QA while dependency cache is repaired.');
  process.exit(0);
}

const jestArgs = [JEST_BIN, '--passWithNoTests'];
if (!process.argv.slice(2).some((arg) => arg.startsWith('--maxWorkers'))) {
  jestArgs.push(`--maxWorkers=${process.env.JEST_JOBS_DEFAULT || '50%'}`);
}
jestArgs.push(...process.argv.slice(2));

const rerunResult = spawnSync(process.execPath, jestArgs, {
  cwd: ROOT,
  stdio: 'inherit'
});

if (rerunResult.error && SHOULD_USE_MIRROR && ['ETIMEDOUT', 'EIO'].includes(rerunResult.error.code || '')) {
  const mirrored = runFromLocalMirror();
  if (mirrored && typeof mirrored.status === 'number') {
    process.exit(mirrored.status);
  }
}

if (typeof rerunResult.status === 'number') {
  process.exit(rerunResult.status);
}

console.error('FAIL: Jest process exited without a status code.');
process.exit(1);
