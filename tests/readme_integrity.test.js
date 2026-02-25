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

const ROOT = path.resolve(__dirname, '..');

const ARCHITECTURE_PATH_MATCHERS = [
  (file) => file.startsWith('scripts/'),
  (file) => file.startsWith('tests/'),
  (file) => file.startsWith('styles/'),
  (file) => file.startsWith('.github/workflows/'),
  (file) => file === 'index.html',
  (file) => file === 'about/index.html',
  (file) => file === 'services/index.html',
  (file) => file === 'connect/index.html',
  (file) => file === 'about/insights/index.html',
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

function resolveChangedFiles() {
  const primary = tryDiff('git diff --name-only origin/main...HEAD');
  if (primary.ok) {
    return primary.files;
  }

  const fallback = tryDiff('git diff --name-only HEAD~1...HEAD');
  if (fallback.ok) {
    return fallback.files;
  }

  if (process.env.CI) {
    throw new Error(
      `Unable to determine changed files in CI. origin/main diff error: ${primary.error}; HEAD~1 fallback error: ${fallback.error}`
    );
  }

  return null;
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
