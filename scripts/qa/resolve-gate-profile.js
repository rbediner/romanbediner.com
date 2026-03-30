#!/usr/bin/env node
/**
 * Purpose:
 * - Classify a change set into the smallest responsible QA gate profile.
 *
 * Architectural role:
 * - Central decision-maker for local pre-push and CI selective validation.
 *
 * Dependencies:
 * - Node.js built-ins and local git metadata when resolving changed files.
 *
 * Security/CSP considerations:
 * - Read-only classifier; no network mutation and no browser/runtime impact.
 *
 * Migration considerations:
 * - Update file-pattern ownership when routes, shared assets, or release paths move.
 */

const { execSync } = require('child_process');

const PROFILE_ORDER = [
  'docs-only',
  'localized-page',
  'shared-ui',
  'release-infra',
  'full-regression'
];

const DOCS_ONLY_PATTERNS = [/^README\.md$/, /^docs\//, /^AGENTS\.md$/];

const RELEASE_INFRA_PATTERNS = [
  /^\.github\/workflows\//,
  /^scripts\/qa\//,
  /^scripts\/release\//,
  /^scripts\/build\//,
  /^docs\/architecture\//,
  /^package\.json$/,
  /^package-lock\.json$/,
  /^\.nvmrc$/
];

const SHARED_UI_PATTERNS = [
  /^styles\/site\.css$/,
  /^styles\/services\.css$/,
  /^styles\/framework\.css$/,
  /^assets\/logo\//,
  /^assets\/icons\/home\/bullet\.png$/,
  /^scripts\/runtime\/site-navigation\.js$/,
  /^scripts\/runtime\/ga4-bootstrap\.js$/
];

const ROUTE_SCOPES = {
  home: [
    /^index\.html$/,
    /^styles\/home\.css$/,
    /^assets\/images\/website-photo\./,
    /^assets\/icons\/home\//
  ],
  about: [/^about\//, /^styles\/about\.css$/, /^assets\/icons\/about\//],
  services: [/^services\//, /^assets\/icons\/services\//],
  framework: [
    /^framework\//,
    /^assets\/icons\/framework\//,
    /^scripts\/runtime\/framework-/
  ],
  connect: [
    /^connect\//,
    /^styles\/connect\.css$/,
    /^assets\/icons\/connect\//,
    /^scripts\/runtime\/contact-form-emailjs\.js$/
  ]
};

const PROFILE_SETTINGS = {
  'docs-only': {
    runUnitTests: true,
    runRegressionTests: true,
    runLinkValidation: false,
    runBrowserTests: false,
    runQaTests: false,
    runLighthouseValidation: false,
    runBuildArtifact: false,
    localCommands: ['npm run docs:verify', 'npm run test:node', 'npm run test:jest']
  },
  'localized-page': {
    runUnitTests: true,
    runRegressionTests: true,
    runLinkValidation: true,
    runBrowserTests: false,
    runQaTests: false,
    runLighthouseValidation: false,
    runBuildArtifact: false,
    localCommands: ['npm run test:node', 'npm run test:jest', 'npm run test:links']
  },
  'shared-ui': {
    runUnitTests: true,
    runRegressionTests: true,
    runLinkValidation: true,
    runBrowserTests: true,
    runQaTests: false,
    runLighthouseValidation: true,
    runBuildArtifact: false,
    localCommands: [
      'npm run test:node',
      'npm run test:jest',
      'npm run test:links',
      'npm run test:playwright -- --workers=3',
      'npm run test:lighthouse'
    ]
  },
  'release-infra': {
    runUnitTests: true,
    runRegressionTests: true,
    runLinkValidation: true,
    runBrowserTests: false,
    runQaTests: false,
    runLighthouseValidation: false,
    runBuildArtifact: true,
    localCommands: [
      'npm run verify:repo-contract',
      'npm run verify:workflow-integrity',
      'npm run test:node',
      'npm run test:jest',
      'node scripts/build/create-artifact.js --out /tmp/rb-selective-artifact && node scripts/qa/verify-artifact-integrity.js --artifact /tmp/rb-selective-artifact --expect-commit $(git rev-parse HEAD)'
    ]
  },
  'full-regression': {
    runUnitTests: true,
    runRegressionTests: true,
    runLinkValidation: true,
    runBrowserTests: true,
    runQaTests: true,
    runLighthouseValidation: true,
    runBuildArtifact: true,
    localCommands: ['npm run qa:ci-parity']
  }
};

function matchesAny(filePath, patterns) {
  return patterns.some((pattern) => pattern.test(filePath));
}

function isDocsOnlyChangeSet(changedFiles) {
  return Array.isArray(changedFiles) && changedFiles.length > 0
    ? changedFiles.every((filePath) => matchesAny(filePath, DOCS_ONLY_PATTERNS))
    : false;
}

function detectRouteScopes(changedFiles) {
  const scopes = new Set();
  for (const filePath of changedFiles) {
    for (const [scopeName, patterns] of Object.entries(ROUTE_SCOPES)) {
      if (matchesAny(filePath, patterns)) {
        scopes.add(scopeName);
      }
    }
  }
  return scopes;
}

function buildProfile(profile, reason, changedFiles, routeScopes) {
  return {
    profile,
    reason,
    changedFiles,
    routeScopes: Array.from(routeScopes),
    settings: PROFILE_SETTINGS[profile]
  };
}

function classifyChangedFiles(changedFiles) {
  if (!Array.isArray(changedFiles) || changedFiles.length === 0) {
    return buildProfile(
      'full-regression',
      'No changed files could be resolved safely, so full regression is required.',
      [],
      new Set()
    );
  }

  if (isDocsOnlyChangeSet(changedFiles)) {
    return buildProfile(
      'docs-only',
      'Only docs, README, or AGENTS files changed.',
      changedFiles,
      new Set()
    );
  }

  const releaseInfraFiles = changedFiles.filter((filePath) =>
    matchesAny(filePath, RELEASE_INFRA_PATTERNS)
  );
  const sharedUiFiles = changedFiles.filter((filePath) =>
    matchesAny(filePath, SHARED_UI_PATTERNS)
  );
  const routeScopes = detectRouteScopes(changedFiles);

  const knownFiles = new Set([
    ...releaseInfraFiles,
    ...sharedUiFiles,
    ...changedFiles.filter((filePath) =>
      Object.values(ROUTE_SCOPES).some((patterns) => matchesAny(filePath, patterns))
    ),
    ...changedFiles.filter((filePath) => matchesAny(filePath, DOCS_ONLY_PATTERNS))
  ]);

  const unknownFiles = changedFiles.filter((filePath) => !knownFiles.has(filePath));

  if (releaseInfraFiles.length > 0) {
    if (sharedUiFiles.length > 0 || routeScopes.size > 0 || unknownFiles.length > 0) {
      return buildProfile(
        'full-regression',
        'Release/CI files changed alongside product/runtime files, so the change is treated as cross-cutting.',
        changedFiles,
        routeScopes
      );
    }
    return buildProfile(
      'release-infra',
      'Only release, QA, workflow, or architecture control files changed.',
      changedFiles,
      routeScopes
    );
  }

  if (unknownFiles.length > 0) {
    return buildProfile(
      'full-regression',
      'At least one changed file is not mapped to a safe selective gate profile.',
      changedFiles,
      routeScopes
    );
  }

  if (sharedUiFiles.length > 0 || routeScopes.size > 1) {
    return buildProfile(
      'shared-ui',
      sharedUiFiles.length > 0
        ? 'Shared UI assets or shared runtime files changed.'
        : 'Multiple route scopes changed, so broader shared-UI validation is required.',
      changedFiles,
      routeScopes
    );
  }

  if (routeScopes.size === 1) {
    return buildProfile(
      'localized-page',
      `Only the ${Array.from(routeScopes)[0]} route scope changed.`,
      changedFiles,
      routeScopes
    );
  }

  return buildProfile(
    'full-regression',
    'Change set could not be classified safely, so full regression is required.',
    changedFiles,
    routeScopes
  );
}

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

function parseChangedFilesArg(rawValue) {
  if (!rawValue) {
    return [];
  }
  return rawValue
    .split(',')
    .map((entry) => entry.trim())
    .filter(Boolean);
}

function runGitCommand(command) {
  return execSync(command, {
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'ignore']
  }).trim();
}

function getChangedFilesFromRefs(baseRef, headRef) {
  try {
    if (baseRef && headRef && !/^0+$/.test(baseRef)) {
      const diff = runGitCommand(`git diff --name-only ${baseRef}..${headRef}`);
      if (diff) {
        return diff.split('\n').map((line) => line.trim()).filter(Boolean);
      }
    }
  } catch (_error) {
    // Fallback to head-only file listing when branch history shape differs.
  }

  try {
    if (headRef) {
      const files = runGitCommand(`git show --pretty="" --name-only ${headRef}`);
      if (files) {
        return files.split('\n').map((line) => line.trim()).filter(Boolean);
      }
    }
  } catch (_error) {
    return [];
  }

  return [];
}

function resolveChangedFilesForCli(args) {
  if (args['changed-files']) {
    return parseChangedFilesArg(args['changed-files']);
  }
  return getChangedFilesFromRefs(args['base-sha'], args['head-sha']);
}

function formatAsGitHubOutput(profileResult) {
  const lines = [
    `profile=${profileResult.profile}`,
    `reason=${profileResult.reason}`,
    `route_scopes=${profileResult.routeScopes.join(',')}`,
    `run_unit_tests=${String(profileResult.settings.runUnitTests)}`,
    `run_regression_tests=${String(profileResult.settings.runRegressionTests)}`,
    `run_link_validation=${String(profileResult.settings.runLinkValidation)}`,
    `run_browser_tests=${String(profileResult.settings.runBrowserTests)}`,
    `run_qa_tests=${String(profileResult.settings.runQaTests)}`,
    `run_lighthouse_validation=${String(profileResult.settings.runLighthouseValidation)}`,
    `run_build_artifact=${String(profileResult.settings.runBuildArtifact)}`
  ];
  return `${lines.join('\n')}\n`;
}

function formatAsHuman(profileResult) {
  return [
    `QA gate profile: ${profileResult.profile}`,
    `Reason: ${profileResult.reason}`,
    `Route scopes: ${profileResult.routeScopes.length ? profileResult.routeScopes.join(', ') : 'none'}`,
    `Changed files: ${profileResult.changedFiles.length}`
  ].join('\n');
}

function main() {
  const args = parseArgs(process.argv);
  const format = args.format || 'human';
  const changedFiles = resolveChangedFilesForCli(args);
  const profileResult = classifyChangedFiles(changedFiles);

  if (format === 'json') {
    process.stdout.write(`${JSON.stringify(profileResult, null, 2)}\n`);
    return;
  }

  if (format === 'github-output') {
    process.stdout.write(formatAsGitHubOutput(profileResult));
    return;
  }

  process.stdout.write(`${formatAsHuman(profileResult)}\n`);
}

if (require.main === module) {
  main();
}

module.exports = {
  DOCS_ONLY_PATTERNS,
  PROFILE_ORDER,
  PROFILE_SETTINGS,
  RELEASE_INFRA_PATTERNS,
  ROUTE_SCOPES,
  SHARED_UI_PATTERNS,
  classifyChangedFiles,
  detectRouteScopes,
  getChangedFilesFromRefs,
  isDocsOnlyChangeSet,
  parseChangedFilesArg,
  resolveChangedFilesForCli
};
