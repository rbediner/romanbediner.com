#!/usr/bin/env node
/**
 * Purpose:
 * - Run the smallest responsible static contract suite for a selective QA gate.
 *
 * Architectural role:
 * - Gives localized-page, shared-ui, and release-infra profiles purpose-built
 *   Node/Jest coverage so the selective gate names match their actual runtime cost.
 *
 * Dependencies:
 * - Node.js built-ins, local QA test files, and the shared Jest runner.
 *
 * Security/CSP considerations:
 * - Read-only QA orchestration only; no network mutation and no production writes.
 *
 * Migration considerations:
 * - Keep route-to-test ownership aligned with page contracts, GA coverage,
 *   mobile/browser smoke scopes, and release workflow responsibilities.
 */

const { execSync } = require('child_process');
const path = require('path');

const ROOT = path.resolve(__dirname, '..', '..');
const CANONICAL_SCOPES = ['home', 'about', 'services', 'framework', 'connect'];

// These tests protect shared contracts that can break even when a single route
// changes: metadata wiring, nav continuity, page-top rhythm, and GA bootstrap.
const LOCALIZED_NODE_BASE = [
  'QA/tests/test-route-metadata-parity.js',
  'QA/tests/test-metadata-consistency.js',
  'QA/tests/test-ga4-installation.js',
  'QA/tests/test-header-nav.js',
  'QA/tests/test-page-top-spacing.js',
  'QA/tests/test-nav-links-contract.js'
];

const LOCALIZED_NODE_BY_SCOPE = {
  home: [
    'QA/tests/test-home-hero-layout.js',
    'QA/tests/test-home-hero-image-optimization.js',
    'QA/tests/test-home-spacing-contract.js',
    'QA/tests/test-og-homepage.js'
  ],
  about: [
    'QA/tests/test-about-redesign.js',
    'QA/tests/test-about-hero-contract.js',
    'QA/tests/test-footer-quote.js',
    'QA/tests/test-operating-philosophy.js'
  ],
  services: [
    'QA/tests/test-transition-blocks.js',
    'QA/tests/test-shared-design-system.js'
  ],
  framework: [
    'QA/tests/test-framework-cache-bust.js',
    'QA/tests/test-no-legacy-references.js'
  ],
  connect: ['QA/tests/test-connect-page.js']
};

// Browser smoke is the main UX/runtime layer, but these small Jest guards keep
// route-specific static behavior in scope without replaying the whole policy suite.
const LOCALIZED_JEST_BASE = ['QA/tests/jest/browser_smoke_contract.test.js'];
const LOCALIZED_JEST_BY_SCOPE = {
  home: [],
  about: ['QA/tests/jest/typography-regression.test.js'],
  services: ['QA/tests/jest/typography-regression.test.js'],
  framework: ['QA/tests/jest/insights-analytics.test.js'],
  connect: ['QA/tests/jest/contact-form-antiabuse.test.js']
};

// Shared UI changes can ripple across canonical routes, layout contracts, icon
// spacing, list bullets, and shared runtime behavior, so this suite stays broad
// on product-facing checks while skipping release/doc-only automation tests.
const SHARED_UI_NODE_TESTS = [
  'QA/tests/test-clean-urls.js',
  'QA/tests/test-canonical.js',
  'QA/tests/test-route-metadata-parity.js',
  'QA/tests/test-metadata-consistency.js',
  'QA/tests/test-ga4-installation.js',
  'QA/tests/test-header-nav.js',
  'QA/tests/test-home-hero-layout.js',
  'QA/tests/test-home-spacing-contract.js',
  'QA/tests/test-page-top-spacing.js',
  'QA/tests/test-nav-links-contract.js',
  'QA/tests/test-og-homepage.js',
  'QA/tests/test-og-route-metadata.js',
  'QA/tests/test-about-redesign.js',
  'QA/tests/test-about-hero-contract.js',
  'QA/tests/test-footer-quote.js',
  'QA/tests/test-shared-design-system.js',
  'QA/tests/test-transition-blocks.js',
  'QA/tests/test-operating-philosophy.js',
  'QA/tests/test-connect-page.js',
  'QA/tests/test-framework-cache-bust.js',
  'QA/tests/test-no-legacy-references.js',
  'QA/tests/test-favicon-contract.js'
];

const SHARED_UI_JEST_TESTS = [
  'QA/tests/jest/browser_smoke_contract.test.js',
  'QA/tests/jest/typography-regression.test.js',
  'QA/tests/jest/insights-analytics.test.js',
  'QA/tests/jest/contact-form-antiabuse.test.js'
];

// Release-infra changes should prove workflow/release/test wiring plus docs/SOP
// integrity, but they should not pay for unrelated product layout checks.
const RELEASE_INFRA_NODE_TESTS = [
  'QA/tests/test-link-validation-config.js',
  'QA/tests/test-framework-artifact-packaging.js',
  'QA/tests/test-qa-runner-script.js',
  'QA/tests/test-release-sop-automation.js',
  'QA/tests/test-prod-release-verification-automation.js',
  'QA/tests/test-ci-gate-profile-automation.js',
  'QA/tests/test-session-readiness-automation.js',
  'QA/tests/test-repo-contract-automation.js',
  'QA/tests/test-workflow-integrity-automation.js',
  'QA/tests/test-artifact-integrity-automation.js',
  'QA/tests/test-staging-preview-automation.js',
  'QA/tests/test-lighthouse-gate-automation.js',
  'QA/tests/test-live-deploy-validation-automation.js'
];

const RELEASE_INFRA_JEST_TESTS = [
  'QA/tests/jest/prepush_gate.test.js',
  'QA/tests/jest/selective_gate_runner.test.js',
  'QA/tests/jest/prod_promotion_gate.test.js',
  'QA/tests/jest/session_readiness.test.js',
  'QA/tests/jest/jest_runner_contract.test.js',
  'QA/tests/jest/local_mirror_runner.test.js',
  'QA/tests/jest/scripts_comment_headers.test.js',
  'QA/tests/jest/readme_integrity.test.js',
  'QA/tests/jest/readme_structure.test.js',
  'QA/tests/jest/handoff_latest_contract.test.js',
  'QA/tests/jest/deployment_sop.test.js'
];

function parseArgs(argv) {
  const args = {};
  for (let index = 2; index < argv.length; index += 1) {
    const token = argv[index];
    if (!token.startsWith('--')) {
      continue;
    }
    const key = token.slice(2);
    const next = argv[index + 1];
    if (next && !next.startsWith('--')) {
      args[key] = next;
      index += 1;
    } else {
      args[key] = 'true';
    }
  }
  return args;
}

function parseScopes(rawScopes) {
  if (!rawScopes || rawScopes === 'all') {
    return [...CANONICAL_SCOPES];
  }

  const scopes = rawScopes
    .split(',')
    .map((value) => value.trim())
    .filter(Boolean);

  for (const scope of scopes) {
    if (!CANONICAL_SCOPES.includes(scope)) {
      throw new Error(`Unknown route scope: ${scope}`);
    }
  }

  return [...new Set(scopes)];
}

function dedupe(list) {
  return [...new Set(list)];
}

function resolveNodeTests(profile, scopes) {
  if (profile === 'localized-page') {
    const scopedTests = scopes.flatMap((scope) => LOCALIZED_NODE_BY_SCOPE[scope] || []);
    return dedupe([...LOCALIZED_NODE_BASE, ...scopedTests]);
  }

  if (profile === 'shared-ui') {
    return [...SHARED_UI_NODE_TESTS];
  }

  if (profile === 'release-infra') {
    return [...RELEASE_INFRA_NODE_TESTS];
  }

  throw new Error(`Static node suite does not support profile: ${profile}`);
}

function resolveJestTests(profile, scopes) {
  if (profile === 'localized-page') {
    const scopedTests = scopes.flatMap((scope) => LOCALIZED_JEST_BY_SCOPE[scope] || []);
    return dedupe([...LOCALIZED_JEST_BASE, ...scopedTests]);
  }

  if (profile === 'shared-ui') {
    return [...SHARED_UI_JEST_TESTS];
  }

  if (profile === 'release-infra') {
    return [...RELEASE_INFRA_JEST_TESTS];
  }

  throw new Error(`Static Jest suite does not support profile: ${profile}`);
}

function buildCommands(profile, mode, scopes) {
  if (mode === 'node') {
    const tests = resolveNodeTests(profile, scopes);
    const commands = [];

    if (profile === 'localized-page' || profile === 'shared-ui') {
      commands.push('npm run generate:insight-links');
    }

    if (profile === 'release-infra') {
      commands.push('npm run docs:verify');
    }

    return [...commands, ...tests.map((testPath) => `node ${testPath}`)];
  }

  if (mode === 'jest') {
    const tests = resolveJestTests(profile, scopes);
    return [
      [
        'node scripts/qa/run-jest-suite.js',
        ...tests,
        '--runInBand'
      ].join(' ')
    ];
  }

  throw new Error(`Unsupported suite mode: ${mode}`);
}

function run(command) {
  execSync(command, {
    cwd: ROOT,
    env: process.env,
    stdio: 'inherit'
  });
}

function main() {
  const args = parseArgs(process.argv);
  const profile = args.profile;
  const mode = args.mode;
  const scopes = parseScopes(args.scopes);

  if (!profile || !mode) {
    throw new Error('Expected --profile <profile> and --mode <node|jest>.');
  }

  const commands = buildCommands(profile, mode, scopes);
  for (const command of commands) {
    run(command);
  }

  process.stdout.write(
    [
      'PASS: selective static contract suite passed.',
      `- Profile: ${profile}`,
      `- Mode: ${mode}`,
      `- Route scopes: ${scopes.join(',')}`,
      `- Commands: ${commands.length}`
    ].join('\n') + '\n'
  );
}

if (require.main === module) {
  try {
    main();
  } catch (error) {
    process.stderr.write(`FAIL: ${error.message}\n`);
    process.exit(1);
  }
}

module.exports = {
  CANONICAL_SCOPES,
  LOCALIZED_JEST_BY_SCOPE,
  LOCALIZED_JEST_BASE,
  LOCALIZED_NODE_BASE,
  LOCALIZED_NODE_BY_SCOPE,
  RELEASE_INFRA_JEST_TESTS,
  RELEASE_INFRA_NODE_TESTS,
  SHARED_UI_JEST_TESTS,
  SHARED_UI_NODE_TESTS,
  buildCommands,
  parseScopes,
  resolveJestTests,
  resolveNodeTests
};
