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
  'qa:gate:resolve': 'node scripts/qa/resolve-gate-profile.js',
  'qa:gate:run': 'node scripts/qa/run-selective-gate.js',
  'qa:gate:docs-only': 'node scripts/qa/run-selective-gate.js --profile docs-only',
  'qa:gate:localized-page': 'node scripts/qa/run-selective-gate.js --profile localized-page',
  'qa:gate:shared-ui': 'node scripts/qa/run-selective-gate.js --profile shared-ui',
  'qa:gate:release-infra': 'node scripts/qa/run-selective-gate.js --profile release-infra',
  'qa:gate:full-regression': 'node scripts/qa/run-selective-gate.js --profile full-regression',
  'qa:browser:smoke': 'node scripts/qa/run-browser-smoke.js',
  'qa:prepush-gate': 'node scripts/qa/run-prepush-gate.js',
  'qa:prod-promotion-gate': 'node scripts/qa/verify-prod-promotion-candidate.js',
  'qa:smoke:prod': 'node scripts/qa/verify-live-production.js && node scripts/qa/verify-live-browser-smoke.js',
  'qa:smoke:prod:fetch': 'node scripts/qa/verify-live-production.js',
  'qa:smoke:prod:browser': 'node scripts/qa/verify-live-browser-smoke.js',
  'qa:smoke:preview': 'node scripts/qa/verify-live-preview.js',
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

const artifactBuilderPath = path.join(ROOT, 'scripts', 'build', 'create-artifact.js');
const artifactBuilderText = fs.readFileSync(artifactBuilderPath, 'utf8');
assert(artifactBuilderText.includes('RELEASE_CACHE_BUST_PATHS'), 'create-artifact.js must define release cache-bust asset targets');
assert(artifactBuilderText.includes('applyReleaseCacheBust(siteDir, commit)'), 'create-artifact.js must apply release cache-busting during artifact build');
assert(artifactBuilderText.includes('/styles/framework.css'), 'release cache-bust must include framework.css');
assert(artifactBuilderText.includes('/scripts/runtime/site-navigation.js'), 'release cache-bust must include shared nav runtime script');

const monitorPath = path.join(ROOT, 'scripts', 'release', 'watch-ci-run.js');
const monitorText = fs.readFileSync(monitorPath, 'utf8');
assert(monitorText.includes('/actions/runs?branch='), 'monitor script must poll Actions runs by branch');
assert(monitorText.includes('/check-runs/'), 'monitor script must attempt failed-job annotation lookup');
assert(monitorText.includes('requestJsonWithRetry('), 'monitor script must use retry wrapper for transient API failures');
assert(monitorText.includes('RETRIABLE_NETWORK_ERRORS'), 'monitor script must define retriable network error codes');
assert(monitorText.includes("['credential', 'fill']"), 'monitor script must reuse git credential auth when GH_TOKEN is absent');
assert(monitorText.includes('password='), 'monitor script must parse git credential tokens for authenticated API access');
assert(monitorText.includes('--api-retries'), 'monitor script usage must document api retry tuning');
assert(monitorText.includes('--workflow "Workflow Name"'), 'monitor script usage must document workflow-name filter');
assert(monitorText.includes('--require-run-within 900'), 'monitor script usage must document fail-fast run discovery timeout');
assert(monitorText.includes('No matching run discovered within'), 'monitor script must fail fast when run discovery timeout is exceeded');

const ciWorkflowPath = path.join(ROOT, '.github', 'workflows', 'ci.yml');
const ciWorkflowText = fs.readFileSync(ciWorkflowPath, 'utf8');
assert(
  ciWorkflowText.includes('needs.gate-profile.outputs.browser_command'),
  'ci.yml must run browser coverage through the resolved selective browser command'
);

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
assert(prepushGateText.includes('classifyChangedFiles(changedFiles)'), 'pre-push gate must classify changed files through the shared resolver');
assert(prepushGateText.includes('run-selective-gate.js --profile'), 'pre-push gate must call the selective gate runner');
assert(prepushGateText.includes('verify-prod-promotion-candidate.js'), 'pre-push gate must use the prod promotion verifier for already-tested staging SHAs');

const gateResolverPath = path.join(ROOT, 'scripts', 'qa', 'resolve-gate-profile.js');
assert(fs.existsSync(gateResolverPath), 'scripts/qa/resolve-gate-profile.js must exist');
const gateResolverText = fs.readFileSync(gateResolverPath, 'utf8');
assert(gateResolverText.includes("'docs-only'"), 'gate resolver must define docs-only profile');
assert(gateResolverText.includes("'localized-page'"), 'gate resolver must define localized-page profile');
assert(gateResolverText.includes("'shared-ui'"), 'gate resolver must define shared-ui profile');
assert(gateResolverText.includes("'release-infra'"), 'gate resolver must define release-infra profile');
assert(gateResolverText.includes("'full-regression'"), 'gate resolver must define full-regression profile');
assert(gateResolverText.includes('run_link_validation'), 'gate resolver must define selective link-validation behavior');
assert(gateResolverText.includes('run_lighthouse_validation'), 'gate resolver must define selective Lighthouse behavior');
assert(gateResolverText.includes('run_build_artifact'), 'gate resolver must define selective artifact behavior');
assert(gateResolverText.includes('browserCommandTemplate'), 'gate resolver must define browser command templates');
assert(gateResolverText.includes('run-browser-smoke.js --scopes {routeScopesCsv}'), 'localized-page gate must use targeted browser smoke');
assert(
  gateResolverText.includes("browserCommandTemplate: 'npm run test:playwright -- --workers=3'"),
  'full-regression gate must still retain the 3-worker Playwright command'
);

const selectiveGateRunnerPath = path.join(ROOT, 'scripts', 'qa', 'run-selective-gate.js');
assert(fs.existsSync(selectiveGateRunnerPath), 'scripts/qa/run-selective-gate.js must exist');
const selectiveGateRunnerText = fs.readFileSync(selectiveGateRunnerPath, 'utf8');
assert(selectiveGateRunnerText.includes('latest-local-gate.json'), 'selective gate runner must emit metrics output');
assert(selectiveGateRunnerText.includes('http.server'), 'selective gate runner must start a local server for links/Lighthouse when needed');
assert(selectiveGateRunnerText.includes('PASS: selective local QA gate passed.'), 'selective gate runner must report successful gate execution');
assert(selectiveGateRunnerText.includes('applyCommandPlaceholders'), 'selective gate runner must resolve route-scoped browser smoke commands');

const browserSmokePath = path.join(ROOT, 'scripts', 'qa', 'run-browser-smoke.js');
assert(fs.existsSync(browserSmokePath), 'scripts/qa/run-browser-smoke.js must exist');
const browserSmokeText = fs.readFileSync(browserSmokePath, 'utf8');
assert(browserSmokeText.includes('assertMobileContract'), 'browser smoke must protect mobile behavior');
assert(browserSmokeText.includes('assertNavContract'), 'browser smoke must protect navigation');
assert(browserSmokeText.includes('assertGaBootstrap'), 'browser smoke must protect GA bootstrap runtime');
assert(browserSmokeText.includes('assertFrameworkContract'), 'browser smoke must protect framework JS hotspot behavior');
assert(browserSmokeText.includes('assertServiceBulletContract'), 'browser smoke must protect visual bullet spacing contract');

const prodPromotionGatePath = path.join(ROOT, 'scripts', 'qa', 'verify-prod-promotion-candidate.js');
assert(fs.existsSync(prodPromotionGatePath), 'scripts/qa/verify-prod-promotion-candidate.js must exist');
const prodPromotionGateText = fs.readFileSync(prodPromotionGatePath, 'utf8');
assert(prodPromotionGateText.includes("const STAGING_BRANCH = 'staging'"), 'prod promotion gate must pin staging branch');
assert(prodPromotionGateText.includes("const PROD_BRANCH = 'prod'"), 'prod promotion gate must pin prod branch');
assert(prodPromotionGateText.includes("const STAGING_CI_WORKFLOW_NAME = 'CI'"), 'prod promotion gate must validate the staging CI workflow');
assert(prodPromotionGateText.includes('watch-ci-run.js'), 'prod promotion gate must monitor existing staging CI status before prod push');

const prepareHuskyPath = path.join(ROOT, 'scripts', 'release', 'install-local-husky-hooks.js');
assert(fs.existsSync(prepareHuskyPath), 'scripts/release/install-local-husky-hooks.js must exist');
const prepareHuskyText = fs.readFileSync(prepareHuskyPath, 'utf8');
assert(prepareHuskyText.includes("process.env.CI === '1'") || prepareHuskyText.includes("process.env.CI === 'true'"), 'prepare-husky script must skip hook installation in CI');
assert(prepareHuskyText.includes("No .git directory detected"), 'prepare-husky script must skip hook installation outside Git checkouts');

console.log('PASS: deployment SOP automation guardrails are in place.');
