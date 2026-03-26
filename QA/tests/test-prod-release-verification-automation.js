#!/usr/bin/env node
/**
 * Invariant:
 * - Production release automation must enforce CI success, Deploy Pages success, and live production checks before completion.
 * Why this exists:
 * - Prevents false "release complete" reports when prod deploy or post-deploy health checks are still failing.
 * What breaks if it fails:
 * - CI blocks until no-green-no-done release verification guardrails are restored.
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..', '..');

function assert(condition, message) {
  if (!condition) {
    console.error(`FAIL: ${message}`);
    process.exit(1);
  }
}

const packageJson = JSON.parse(fs.readFileSync(path.join(ROOT, 'package.json'), 'utf8'));
assert(
  packageJson.scripts['release:verify-prod'] === 'node scripts/release/verify-prod-release.js',
  'package.json must expose release:verify-prod automation script.'
);

const verifyScriptPath = path.join(ROOT, 'scripts', 'release', 'verify-prod-release.js');
assert(fs.existsSync(verifyScriptPath), 'scripts/release/verify-prod-release.js must exist.');
const verifyScript = fs.readFileSync(verifyScriptPath, 'utf8');

assert(
  verifyScript.includes('scripts/release/watch-ci-run.js'),
  'verify-prod-release.js must invoke watch-ci-run.js for CI/Deploy workflow monitoring.'
);
assert(
  verifyScript.includes('--require-run-within'),
  'verify-prod-release.js must enforce fail-fast run discovery for CI/Deploy monitoring.'
);
assert(
  verifyScript.includes("'CI'"),
  'verify-prod-release.js must enforce CI workflow success.'
);
assert(
  verifyScript.includes("'Deploy Pages'"),
  'verify-prod-release.js must enforce Deploy Pages workflow success.'
);
assert(
  verifyScript.includes('scripts/qa/verify-live-production.js'),
  'verify-prod-release.js must run live production validation before passing.'
);
assert(
  verifyScript.includes('PASS: Production release verification complete.'),
  'verify-prod-release.js must emit explicit completion summary output.'
);
assert(
  verifyScript.includes('acquireLock(') && verifyScript.includes('releaseLock('),
  'verify-prod-release.js must enforce single-run lock lifecycle to prevent duplicate monitors.'
);

const promoteScript = fs.readFileSync(
  path.join(ROOT, 'scripts', 'release', 'promote-tested-staging-to-prod.sh'),
  'utf8'
);
assert(
  promoteScript.includes('node scripts/release/verify-prod-release.js --branch prod --sha "${STAGING_SHA}"'),
  'promote-tested-staging-to-prod.sh must call verify-prod-release.js for final release gating.'
);

console.log('PASS: prod release verification automation guardrails are in place.');
