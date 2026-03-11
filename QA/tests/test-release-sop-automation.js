#!/usr/bin/env node
/**
 * Invariant:
 * - Deployment automation scripts and pre-push QA gate must exist and reference required commands.
 * Why this exists:
 * - Prevents accidental pushes that skip CI-parity and staging->prod promotion discipline.
 * What breaks if it fails:
 * - CI blocks until deployment SOP automation files are restored and wired correctly.
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..', '..');
const packagePath = path.join(ROOT, 'package.json');
const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));

function assert(condition, message) {
  if (!condition) {
    console.error(`FAIL: ${message}`);
    process.exit(1);
  }
}

const requiredScripts = {
  'qa:ci-parity': 'bash scripts/run-ci-parity.sh',
  'ci:monitor': 'node scripts/monitor-ci-run.js',
  'release:staging-prod': 'bash scripts/release-staging-to-prod.sh',
  'prepare': 'node scripts/prepare-husky.js'
};

for (const [name, value] of Object.entries(requiredScripts)) {
  assert(packageJson.scripts[name] === value, `package.json script ${name} must equal "${value}"`);
}

const ciParityPath = path.join(ROOT, 'scripts', 'run-ci-parity.sh');
const ciParityText = fs.readFileSync(ciParityPath, 'utf8');
assert(ciParityText.includes('CI=1 npm run test:node'), 'run-ci-parity.sh missing CI node test gate');
assert(ciParityText.includes('CI=1 npm run test:jest'), 'run-ci-parity.sh missing CI jest test gate');
assert(ciParityText.includes('npm run test:python'), 'run-ci-parity.sh missing python test gate');
assert(ciParityText.includes('npm run test:playwright -- --workers=3'), 'run-ci-parity.sh missing playwright test gate');
assert(ciParityText.includes('npm run test:visual'), 'run-ci-parity.sh missing visual test gate');

const releasePath = path.join(ROOT, 'scripts', 'release-staging-to-prod.sh');
const releaseText = fs.readFileSync(releasePath, 'utf8');
assert(releaseText.includes('bash scripts/run-ci-parity.sh'), 'release script must run CI parity before push');
assert(releaseText.includes('git push origin staging'), 'release script must push staging');
assert(releaseText.includes('node scripts/monitor-ci-run.js --branch staging'), 'release script must monitor staging CI');
assert(releaseText.includes('git merge --ff-only "${STAGING_SHA}"'), 'release script must fast-forward prod from tested SHA');
assert(releaseText.includes('node scripts/monitor-ci-run.js --branch prod'), 'release script must monitor prod CI');

const monitorPath = path.join(ROOT, 'scripts', 'monitor-ci-run.js');
const monitorText = fs.readFileSync(monitorPath, 'utf8');
assert(monitorText.includes('/actions/runs?branch='), 'monitor script must poll Actions runs by branch');
assert(monitorText.includes('/check-runs/'), 'monitor script must attempt failed-job annotation lookup');

const ciWorkflowPath = path.join(ROOT, '.github', 'workflows', 'ci.yml');
const ciWorkflowText = fs.readFileSync(ciWorkflowPath, 'utf8');
assert(ciWorkflowText.includes('npm run test:playwright -- --workers=3'), 'ci.yml must run Playwright with at least 3 workers');

const huskyPrePushPath = path.join(ROOT, '.husky', 'pre-push');
assert(fs.existsSync(huskyPrePushPath), '.husky/pre-push must exist');
const huskyText = fs.readFileSync(huskyPrePushPath, 'utf8');
assert(huskyText.includes('SKIP_PREPUSH_QA'), 'pre-push must include documented bypass variable');
assert(huskyText.includes('npm run qa:ci-parity'), 'pre-push must run CI-parity script');

const prepareHuskyPath = path.join(ROOT, 'scripts', 'prepare-husky.js');
assert(fs.existsSync(prepareHuskyPath), 'scripts/prepare-husky.js must exist');
const prepareHuskyText = fs.readFileSync(prepareHuskyPath, 'utf8');
assert(prepareHuskyText.includes("process.env.CI === '1'") || prepareHuskyText.includes("process.env.CI === 'true'"), 'prepare-husky script must skip hook installation in CI');
assert(prepareHuskyText.includes("No .git directory detected"), 'prepare-husky script must skip hook installation outside Git checkouts');

console.log('PASS: deployment SOP automation guardrails are in place.');
