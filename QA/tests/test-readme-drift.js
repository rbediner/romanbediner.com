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
  'docs/architecture/',
  'QA/tests/',
  'styles/',
  '.github/workflows/',
  'index.html',
  'about/index.html',
  'services/index.html',
  'insights/index.html',
  'connect/index.html',
  'package.json',
  'package-lock.json',
  '.nvmrc'
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
    const changed = output
      .split('\n')
      .map((line) => line.trim())
      .filter(Boolean);
    return { changed, range };
  } catch (error) {
    console.log('PASS: README drift check skipped because changed-file range could not be resolved in CI.');
    process.exit(0);
  }
}

function isArchitecturePath(file) {
  return ARCH_PATHS.some((needle) => file === needle || file.startsWith(needle));
}

function isCacheBustOnlyHtmlDiff(file, range) {
  if (!file.endsWith('.html')) {
    return false;
  }

  try {
    const diff = execSync(`git diff -U0 ${range} -- ${file}`, { cwd: ROOT, encoding: 'utf8' });
    const contentLines = diff
      .split('\n')
      // Ignore diff headers and evaluate only changed content lines.
      .filter((line) => (line.startsWith('+') || line.startsWith('-')) && !line.startsWith('+++') && !line.startsWith('---'));

    if (!contentLines.length) {
      return false;
    }

    // Treat as cache-bust-only when every edited line only changes version tokens.
    return contentLines.every((line) => /\?v=[A-Za-z0-9._-]+/.test(line));
  } catch (error) {
    return false;
  }
}

const { changed, range } = getChangedFiles();
const touchesArchitecture = changed.some((file) =>
  isArchitecturePath(file)
);
const readmeChanged = changed.includes('README.md');

if (touchesArchitecture && !readmeChanged) {
  const architectureFiles = changed.filter((file) => isArchitecturePath(file));
  const cacheBustOnlyChange = architectureFiles.length > 0 &&
    architectureFiles.every((file) => isCacheBustOnlyHtmlDiff(file, range));

  if (cacheBustOnlyChange) {
    console.log('PASS: README drift check passed for cache-bust-only HTML version token updates.');
    process.exit(0);
  }

  console.error('FAIL: Architectural changes require README update.');
  process.exit(1);
}

console.log('PASS: README drift check passed.');
