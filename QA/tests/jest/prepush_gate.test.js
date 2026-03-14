/**
 * Invariant:
 * - Docs-only changes should use the lightweight pre-push gate path.
 * Why this exists:
 * - Avoids unnecessary visual-regression runtime for documentation-only pushes.
 * What breaks if it fails:
 * - Local pre-push may regress to always running full CI parity.
 */
const path = require('path');

const ROOT = path.resolve(__dirname, '..', '..', '..');
const {
  isDocsOnlyChangeSet,
  DOCS_ONLY_PATTERNS
} = require(path.join(ROOT, 'scripts', 'qa', 'run-prepush-gate.js'));

describe('pre-push gate docs-only policy', () => {
  test('treats docs files as docs-only change set', () => {
    const changed = ['README.md', 'docs/handoff/latest.md', 'docs/architecture/environment-model.json'];
    expect(isDocsOnlyChangeSet(changed)).toBe(true);
  });

  test('treats runtime script edits as non-doc changes', () => {
    const changed = ['README.md', 'scripts/runtime/site-navigation.js'];
    expect(isDocsOnlyChangeSet(changed)).toBe(false);
  });

  test('returns false for empty change list', () => {
    expect(isDocsOnlyChangeSet([])).toBe(false);
  });

  test('keeps explicit docs-only pattern set', () => {
    const serialized = DOCS_ONLY_PATTERNS.map((pattern) => pattern.toString()).join('\n');
    expect(serialized).toContain('README');
    expect(serialized).toContain('docs');
  });
});
