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
  'session:ready': 'node scripts/qa/verify-session-readiness.js',
  'qa:prepush-gate': 'node scripts/qa/run-prepush-gate.js',
  'qa:ci-parity': 'bash scripts/qa/run-ci-parity.sh',
  'ci:monitor': 'node scripts/release/watch-ci-run.js',
  'release:verify-prod': 'node scripts/release/verify-prod-release.js',
  'release:staging-prod': 'bash scripts/release/promote-tested-staging-to-prod.sh',
  'prepare': 'node scripts/release/install-local-husky-hooks.js'
};

for (const [name, value] of Object.entries(requiredScripts)) {
  assert(packageJson.scripts[name] === value, `package.json script ${name} must equal "${value}"`);
}

const ciParityPath = path.join(ROOT, 'scripts', 'qa', 'run-ci-parity.sh');
const ciParityText = fs.readFileSync(ciParityPath, 'utf8');
assert(ciParityText.includes('CI=1 npm run test:node'), 'run-ci-parity.sh missing CI node test gate');
assert(ciParityText.includes('CI=1 npm run test:jest'), 'run-ci-parity.sh missing CI jest test gate');
assert(ciParityText.includes('npm run test:python'), 'run-ci-parity.sh missing python test gate');
assert(ciParityText.includes('npm run test:playwright -- --workers=3'), 'run-ci-parity.sh missing playwright test gate');
assert(ciParityText.includes('npm run test:visual'), 'run-ci-parity.sh missing visual test gate');

const releasePath = path.join(ROOT, 'scripts', 'release', 'promote-tested-staging-to-prod.sh');
const releaseText = fs.readFileSync(releasePath, 'utf8');
assert(releaseText.includes('bash scripts/qa/run-ci-parity.sh'), 'release script must run CI parity before push');
assert(releaseText.includes('git push origin staging'), 'release script must push staging');
assert(releaseText.includes('git pull --ff-only origin staging'), 'release script must fast-forward pull staging');
assert(releaseText.includes('node scripts/release/watch-ci-run.js --branch staging'), 'release script must monitor staging CI');
assert(releaseText.includes('git pull --ff-only origin prod'), 'release script must fast-forward pull prod');
assert(releaseText.includes('git merge --ff-only "${STAGING_SHA}"'), 'release script must fast-forward prod from tested SHA');
assert(releaseText.includes('node scripts/release/verify-prod-release.js --branch prod --sha "${STAGING_SHA}"'), 'release script must run unified prod verification gate for tested SHA');

const monitorPath = path.join(ROOT, 'scripts', 'release', 'watch-ci-run.js');
const monitorText = fs.readFileSync(monitorPath, 'utf8');
assert(monitorText.includes('/actions/runs?branch='), 'monitor script must poll Actions runs by branch');
assert(monitorText.includes('/check-runs/'), 'monitor script must attempt failed-job annotation lookup');
assert(monitorText.includes('requestJsonWithRetry('), 'monitor script must use retry wrapper for transient API failures');
assert(monitorText.includes('RETRIABLE_NETWORK_ERRORS'), 'monitor script must define retriable network error codes');
assert(monitorText.includes('--api-retries'), 'monitor script usage must document api retry tuning');
assert(monitorText.includes('--workflow "Workflow Name"'), 'monitor script usage must document workflow-name filter');

const ciWorkflowPath = path.join(ROOT, '.github', 'workflows', 'ci.yml');
const ciWorkflowText = fs.readFileSync(ciWorkflowPath, 'utf8');
assert(ciWorkflowText.includes('npm run test:playwright -- --workers=3'), 'ci.yml must run Playwright with at least 3 workers');

const nvmrcPath = path.join(ROOT, '.nvmrc');
assert(fs.existsSync(nvmrcPath), '.nvmrc must exist to align local Node with CI');
const nvmrcVersion = fs.readFileSync(nvmrcPath, 'utf8').trim();
assert(nvmrcVersion === '20', '.nvmrc must pin Node 20 to match CI');
assert(ciWorkflowText.includes("node-version: '20'"), 'ci.yml must pin Node 20');

const huskyPrePushPath = path.join(ROOT, '.husky', 'pre-push');
assert(fs.existsSync(huskyPrePushPath), '.husky/pre-push must exist');
const huskyText = fs.readFileSync(huskyPrePushPath, 'utf8');
assert(huskyText.includes('SKIP_PREPUSH_QA'), 'pre-push must include documented bypass variable');
assert(huskyText.includes('npm run qa:prepush-gate'), 'pre-push must run smart pre-push gate script');

const prepushGatePath = path.join(ROOT, 'scripts', 'qa', 'run-prepush-gate.js');
assert(fs.existsSync(prepushGatePath), 'scripts/qa/run-prepush-gate.js must exist');
const prepushGateText = fs.readFileSync(prepushGatePath, 'utf8');
assert(prepushGateText.includes('DOCS_ONLY_PATTERNS'), 'pre-push gate must define docs-only path policy');
assert(prepushGateText.includes('npm run qa:ci-parity'), 'pre-push gate must preserve full CI parity for non-doc changes');
assert(prepushGateText.includes('npm run docs:verify'), 'pre-push gate must run docs verify for docs-only changes');
assert(prepushGateText.includes('npm run test:node'), 'pre-push gate must run node policy tests for docs-only changes');
assert(prepushGateText.includes('npm run test:jest'), 'pre-push gate must run jest policy tests for docs-only changes');

const prepareHuskyPath = path.join(ROOT, 'scripts', 'release', 'install-local-husky-hooks.js');
assert(fs.existsSync(prepareHuskyPath), 'scripts/release/install-local-husky-hooks.js must exist');
const prepareHuskyText = fs.readFileSync(prepareHuskyPath, 'utf8');
assert(prepareHuskyText.includes("process.env.CI === '1'") || prepareHuskyText.includes("process.env.CI === 'true'"), 'prepare-husky script must skip hook installation in CI');
assert(prepareHuskyText.includes("No .git directory detected"), 'prepare-husky script must skip hook installation outside Git checkouts');

console.log('PASS: deployment SOP automation guardrails are in place.');
