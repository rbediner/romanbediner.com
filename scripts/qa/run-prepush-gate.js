#!/usr/bin/env node
/**
 * Purpose:
 * - Select the appropriate local pre-push QA profile based on changed files.
 *
 * Architectural role:
 * - Keeps full CI-parity protection for code/runtime changes while allowing
 *   faster docs-only pushes.
 *
 * Dependencies:
 * - Node.js built-ins and npm scripts from package.json.
 *
 * Security/CSP considerations:
 * - Local-only helper, no browser/runtime behavior impact.
 *
 * Migration considerations:
 * - Keep docs-only allowlist aligned with README drift policy.
 */
const { execSync } = require('child_process');

const DOCS_ONLY_PATTERNS = [
  /^README\.md$/,
  /^docs\//,
  /^AGENTS\.md$/
];

function run(command) {
  execSync(command, {
    stdio: 'inherit',
    env: process.env
  });
}

function getUpstreamRef() {
  try {
    return execSync('git rev-parse --abbrev-ref --symbolic-full-name @{u}', {
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore']
    }).trim();
  } catch (_error) {
    return '';
  }
}

function getChangedFiles() {
  const upstream = getUpstreamRef();
  const ranges = [];
  if (upstream) {
    ranges.push(`${upstream}...HEAD`);
  }
  ranges.push('HEAD~1..HEAD');

  for (const range of ranges) {
    try {
      const output = execSync(`git diff --name-only ${range}`, { encoding: 'utf8' });
      const changed = output
        .split('\n')
        .map((line) => line.trim())
        .filter(Boolean);
      if (changed.length > 0) {
        return changed;
      }
    } catch (_error) {
      // Continue to next fallback range when local history shape differs.
    }
  }

  try {
    const output = execSync('git diff --cached --name-only', { encoding: 'utf8' });
    return output
      .split('\n')
      .map((line) => line.trim())
      .filter(Boolean);
  } catch (_error) {
    return [];
  }
}

function isDocsOnlyChangeSet(changedFiles) {
  if (!Array.isArray(changedFiles) || changedFiles.length === 0) {
    return false;
  }

  return changedFiles.every((filePath) =>
    DOCS_ONLY_PATTERNS.some((pattern) => pattern.test(filePath))
  );
}

function runDocsOnlyGate() {
  process.stdout.write('[husky pre-push] Docs-only change detected. Running lightweight integrity gate.\n');
  run('npm run docs:verify');
  run('npm run test:node');
  run('npm run test:jest');
}

function runFullGate() {
  process.stdout.write('[husky pre-push] Code/runtime change detected. Running full CI-parity gate.\n');
  run('npm run qa:ci-parity');
}

function main() {
  const changedFiles = getChangedFiles();
  if (isDocsOnlyChangeSet(changedFiles)) {
    runDocsOnlyGate();
    return;
  }
  runFullGate();
}

if (require.main === module) {
  main();
}

module.exports = {
  DOCS_ONLY_PATTERNS,
  getChangedFiles,
  getUpstreamRef,
  isDocsOnlyChangeSet
};
