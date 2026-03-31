#!/usr/bin/env node
/**
 * Invariant:
 * - CI must auto-select one of the documented selective QA gate profiles.
 * Why this exists:
 * - Prevents accidental return to blunt fast/full logic that wastes release time.
 * What breaks if it fails:
 * - CI blocks until selective gate automation and job wiring are restored.
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
assert(ciText.includes('resolve-gate-profile.js'), 'ci.yml must resolve profile through the shared gate classifier');
assert(ciText.includes('--format github-output'), 'ci.yml gate-profile job must emit structured outputs');
assert(ciText.includes('run_unit_tests'), 'ci.yml gate-profile job must expose unit-test gating output');
assert(ciText.includes('run_regression_tests'), 'ci.yml gate-profile job must expose regression-test gating output');
assert(ciText.includes('unit_command'), 'ci.yml gate-profile job must expose unit command output');
assert(ciText.includes('regression_command'), 'ci.yml gate-profile job must expose regression command output');
assert(ciText.includes('run_link_validation'), 'ci.yml gate-profile job must expose link-validation gating output');
assert(ciText.includes('run_browser_tests'), 'ci.yml gate-profile job must expose browser-test gating output');
assert(ciText.includes('browser_command'), 'ci.yml gate-profile job must expose browser command output');
assert(ciText.includes('run_qa_tests'), 'ci.yml gate-profile job must expose python QA gating output');
assert(ciText.includes('run_lighthouse_validation'), 'ci.yml gate-profile job must expose Lighthouse gating output');
assert(ciText.includes('run_build_artifact'), 'ci.yml gate-profile job must expose artifact gating output');
assert(ciText.includes('## CI Gate Profile'), 'ci.yml gate-profile job must publish a readable job summary');

const selectiveJobGuards = [
  "if: needs.gate-profile.outputs.run_unit_tests == 'true'",
  "if: needs.gate-profile.outputs.run_regression_tests == 'true'",
  "if: needs.gate-profile.outputs.run_link_validation == 'true'",
  "if: needs.gate-profile.outputs.run_browser_tests == 'true'",
  "if: needs.gate-profile.outputs.run_qa_tests == 'true'",
  "if: needs.gate-profile.outputs.run_lighthouse_validation == 'true'"
];

for (const guard of selectiveJobGuards) {
  assert(ciText.includes(guard), `ci.yml must include selective guard ${guard}`);
}

assert(
  ciText.includes("needs.gate-profile.outputs.run_build_artifact == 'true'"),
  'ci.yml must guard artifact build with selective gate output'
);
assert(
  ciText.includes('needs.gate-profile.outputs.browser_command'),
  'ci.yml must route browser job execution through the resolved browser command'
);
assert(
  ciText.includes('needs.gate-profile.outputs.unit_command'),
  'ci.yml must route unit-test execution through the resolved unit command'
);
assert(
  ciText.includes('needs.gate-profile.outputs.regression_command'),
  'ci.yml must route regression-test execution through the resolved regression command'
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
assert(
  deployPagesText.includes('GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}'),
  'deploy-pages.yml must pass GITHUB_TOKEN to CI monitor to avoid API rate-limit failures'
);
assert(
  ciText.includes('actions/checkout@v6') &&
    ciText.includes('actions/setup-node@v6') &&
    ciText.includes('actions/upload-artifact@v7'),
  'ci.yml must use modern GitHub-hosted action runtimes for checkout, node setup, and artifact upload'
);
assert(
  deployPagesText.includes('actions/checkout@v6') &&
    deployPagesText.includes('actions/setup-node@v6') &&
    deployPagesText.includes('actions/configure-pages@v6') &&
    deployPagesText.includes('actions/upload-pages-artifact@v4') &&
    deployPagesText.includes('actions/deploy-pages@v5'),
  'deploy-pages.yml must use modern Pages action runtimes'
);

console.log('PASS: CI gate profile automation checks passed.');
