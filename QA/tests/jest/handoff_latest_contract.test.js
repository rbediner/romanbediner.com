/**
 * Invariant:
 * - The repository must expose a single canonical cross-machine handoff file.
 * Why this exists:
 * - Prevents context drift when switching machines and keeps handoff bounded to latest state.
 * What breaks if it fails:
 * - Operators may act on stale assumptions and branch/script mismatches.
 */
const fs = require('fs');
const path = require('path');

// Jest specs are nested under QA/tests/jest, so repository root is three levels up.
const ROOT = path.resolve(__dirname, '..', '..', '..');
const README_PATH = path.join(ROOT, 'README.md');
const HANDOFF_DIR = path.join(ROOT, 'docs', 'handoff');
const LATEST_HANDOFF_PATH = path.join(HANDOFF_DIR, 'latest.md');
const PACKAGE_JSON_PATH = path.join(ROOT, 'package.json');
const HANDOFF_SCRIPT_PATH = path.join(ROOT, 'scripts', 'release', 'update-handoff-latest.js');

describe('Cross-machine handoff contract', () => {
  test('README links the canonical latest handoff file', () => {
    const readmeText = fs.readFileSync(README_PATH, 'utf8');
    expect(readmeText.includes('/docs/handoff/latest.md')).toBe(true);
  });

  test('canonical handoff file exists and contains required metadata', () => {
    expect(fs.existsSync(LATEST_HANDOFF_PATH)).toBe(true);
    const handoffText = fs.readFileSync(LATEST_HANDOFF_PATH, 'utf8');

    expect(handoffText.includes('# Cross-Machine Handoff (Latest)')).toBe(true);
    expect(handoffText).toMatch(/Handoff Sequence:\s*\d+/);
    expect(handoffText).toMatch(/Updated At \(UTC\):\s*\d{4}-\d{2}-\d{2}T/);
    expect(handoffText).toMatch(/Source Branch:\s*[a-zA-Z0-9/_-]+/);
    expect(handoffText).toMatch(/Source Commit:\s*[0-9a-f]{40}/);
  });

  test('handoff directory stays single-entry to avoid unbounded growth', () => {
    const entries = fs
      .readdirSync(HANDOFF_DIR, { withFileTypes: true })
      .filter((entry) => entry.isFile())
      .map((entry) => entry.name)
      .sort();

    expect(entries).toEqual(['latest.md']);
  });

  test('handoff updater command and script exist', () => {
    const packageJson = JSON.parse(fs.readFileSync(PACKAGE_JSON_PATH, 'utf8'));
    expect(packageJson.scripts).toBeDefined();
    expect(packageJson.scripts['handoff:update']).toBe('node scripts/release/update-handoff-latest.js');
    expect(fs.existsSync(HANDOFF_SCRIPT_PATH)).toBe(true);
  });
});
