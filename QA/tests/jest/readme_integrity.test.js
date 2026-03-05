/**
 * Invariant:
 * - Architectural changes must include README updates in the same diff.
 * Why this exists:
 * - Prevents architecture/documentation drift that causes migration and operational ambiguity.
 * What breaks if it fails:
 * - CI blocks merges until README reflects architectural changes.
 */
const { execSync } = require('child_process');
const path = require('path');

// Jest specs are nested under QA/tests/jest, so repository root is three levels up.
const ROOT = path.resolve(__dirname, '..', '..', '..');

const ARCHITECTURE_PATH_MATCHERS = [
  (file) => file.startsWith('scripts/'),
  (file) => file.startsWith('QA/tests/'),
  (file) => file.startsWith('styles/'),
  (file) => file.startsWith('.github/workflows/'),
  (file) => file === 'index.html',
  (file) => file === 'about/index.html',
  (file) => file === 'services/index.html',
  (file) => file === 'connect/index.html',
  (file) => file === 'insights/index.html',
  (file) => file === 'package.json',
  (file) => file === 'package-lock.json'
];

function tryDiff(command) {
  try {
    const output = execSync(command, {
      cwd: ROOT,
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'pipe']
    });
    const files = output
      .split('\n')
      .map((line) => line.trim())
      .filter(Boolean);
    return { ok: true, files };
  } catch (error) {
    return {
      ok: false,
      error: error.stderr ? String(error.stderr) : error.message
    };
  }
}

function hasCommitHistory() {
  try {
    execSync('git rev-parse --verify HEAD', {
      cwd: ROOT,
      stdio: ['ignore', 'ignore', 'ignore']
    });
    return true;
  } catch (_error) {
    return false;
  }
}

function resolveChangedFiles() {
  const preferredBase = process.env.GITHUB_REF_NAME === 'prod' ? 'origin/staging' : 'origin/main';
  const primary = tryDiff(`git diff --name-only ${preferredBase}...HEAD`);
  const secondary = tryDiff(
    preferredBase === 'origin/staging'
      ? 'git diff --name-only origin/main...HEAD'
      : 'git diff --name-only origin/staging...HEAD'
  );
  const fallback = tryDiff('git diff --name-only HEAD~1...HEAD');
  const hasHistory = hasCommitHistory();

  if (process.env.CI) {
    if (primary.ok) {
      return primary.files;
    }
    if (secondary.ok) {
      return secondary.files;
    }
    if (fallback.ok) {
      return fallback.files;
    }
    throw new Error(
      `Unable to determine changed files in CI. primary diff error: ${primary.error}; secondary diff error: ${secondary.error}; HEAD~1 fallback error: ${fallback.error}`
    );
  }

  if (!hasHistory) {
    return null;
  }

  // Local strict mode:
  // 1) Use branch-aware diff when available.
  // 2) Always merge working-tree diff so unstaged/staged local architectural edits are enforced.
  const rangeFiles = primary.ok
    ? primary.files
    : secondary.ok
      ? secondary.files
      : fallback.ok
        ? fallback.files
        : [];
  const workingTree = tryDiff('git diff --name-only HEAD');

  if (!primary.ok && !secondary.ok && !fallback.ok && !workingTree.ok) {
    return null;
  }

  const merged = new Set(rangeFiles);
  if (workingTree.ok) {
    for (const file of workingTree.files) {
      merged.add(file);
    }
  }
  return Array.from(merged);
}

describe('README integrity for architectural changes', () => {
  test('requires README.md update when architectural files change', () => {
    const changedFiles = resolveChangedFiles();

    if (changedFiles === null) {
      console.warn('Skipping README integrity test locally: git diff range unavailable.');
      return;
    }

    const hasArchitecturalChange = changedFiles.some((file) =>
      ARCHITECTURE_PATH_MATCHERS.some((matches) => matches(file))
    );

    if (!hasArchitecturalChange) {
      return;
    }

    const readmeChanged = changedFiles.includes('README.md');
    if (!readmeChanged) {
      throw new Error('Architectural change detected without README update.');
    }
  });
});
