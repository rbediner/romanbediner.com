#!/usr/bin/env node
/**
 * Invariant:
 * - CI must auto-select fast vs full gate profile by branch/event.
 * Why this exists:
 * - Prevents accidental return to always-full validation that slows staging previews.
 * What breaks if it fails:
 * - CI blocks until gate-profile automation and prod full-gate wiring are restored.
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..', '..');
const CI_WORKFLOW = path.join(ROOT, '.github', 'workflows', 'ci.yml');
const DEPLOY_PAGES_WORKFLOW = path.join(ROOT, '.github', 'workflows', 'deploy-pages.yml');

function assert(condition, message) {
  if (!condition) {
    console.error(`FAIL: ${message}`);
    process.exit(1);
  }
}

const ciText = fs.readFileSync(CI_WORKFLOW, 'utf8');
const deployPagesText = fs.readFileSync(DEPLOY_PAGES_WORKFLOW, 'utf8');

assert(ciText.includes('gate-profile:'), 'ci.yml must define gate-profile job');
assert(
  ciText.includes('CI gate profile: ${PROFILE}'),
  'ci.yml gate-profile job must print selected profile'
);
assert(
  ciText.includes('if [ "${GITHUB_REF}" = "refs/heads/prod" ]'),
  'ci.yml must force full gate on prod branch'
);
assert(
  ciText.includes('if: needs.gate-profile.outputs.full_gate == \'true\''),
  'ci.yml must guard full-gate jobs with gate-profile output'
);

assert(
  deployPagesText.includes('push:'),
  'deploy-pages.yml must trigger from push events'
);
assert(
  deployPagesText.includes('branches:\n      - prod'),
  'deploy-pages.yml push trigger must remain branch-isolated to prod'
);
assert(
  deployPagesText.includes('Wait for matching prod CI success'),
  'deploy-pages.yml must explicitly wait for matching prod CI success'
);
assert(
  deployPagesText.includes('watch-ci-run.js --branch prod --sha'),
  'deploy-pages.yml must gate deploy on the exact prod SHA CI run'
);

console.log('PASS: CI gate profile automation checks passed.');
