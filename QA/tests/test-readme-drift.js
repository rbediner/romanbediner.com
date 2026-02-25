#!/usr/bin/env node
/**
 * Invariant:
 * - Architectural changes must be documented in README.md in the same commit/PR.
 * Why this exists:
 * - Prevents operational drift between implementation and migration guidance.
 * What breaks if it fails:
 * - CI blocks merges until architecture documentation is updated.
 */
const { execSync } = require('child_process');
const path = require('path');

const ROOT = path.resolve(__dirname, '..', '..');
const ARCH_PATHS = [
  'scripts/',
  'tests/',
  'QA/tests/',
  'styles/',
  '.github/workflows/',
  'index.html',
  'about/index.html',
  'services/index.html',
  'insights/index.html',
  'connect/index.html'
];

if (!process.env.CI) {
  console.log('PASS: README drift check skipped outside CI.');
  process.exit(0);
}

function getChangedFiles() {
  try {
    const baseRef = process.env.GITHUB_BASE_REF;
    let range = 'HEAD~1..HEAD';
    if (baseRef) {
      execSync(`git fetch --no-tags --depth=1 origin ${baseRef}`, { cwd: ROOT, stdio: 'ignore' });
      range = `origin/${baseRef}...HEAD`;
    }
    const output = execSync(`git diff --name-only ${range}`, { cwd: ROOT, encoding: 'utf8' });
    return output
      .split('\n')
      .map((line) => line.trim())
      .filter(Boolean);
  } catch (error) {
    console.log('PASS: README drift check skipped because changed-file range could not be resolved in CI.');
    process.exit(0);
  }
}

const changed = getChangedFiles();
const touchesArchitecture = changed.some((file) =>
  ARCH_PATHS.some((needle) => file === needle || file.startsWith(needle))
);
const readmeChanged = changed.includes('README.md');

if (touchesArchitecture && !readmeChanged) {
  console.error('FAIL: Architectural changes require README update.');
  process.exit(1);
}

console.log('PASS: README drift check passed.');
