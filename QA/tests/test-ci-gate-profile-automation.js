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
  deployPagesText.includes('workflow_run:'),
  'deploy-pages.yml must trigger from workflow_run so deploy waits for CI completion'
);
assert(
  deployPagesText.includes('workflows:\n      - CI'),
  'deploy-pages.yml must chain from CI workflow'
);
assert(
  deployPagesText.includes("github.event.workflow_run.conclusion == 'success'"),
  'deploy-pages.yml must require successful CI conclusion before deploy'
);
assert(
  deployPagesText.includes("github.event.workflow_run.head_branch == 'prod'"),
  'deploy-pages.yml must require prod branch when triggered by workflow_run'
);

console.log('PASS: CI gate profile automation checks passed.');
