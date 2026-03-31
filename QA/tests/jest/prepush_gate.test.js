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
  DOCS_ONLY_PATTERNS,
  isProdPromotionCandidate
} = require(path.join(ROOT, 'scripts', 'qa', 'run-prepush-gate.js'));
const {
  PROFILE_SETTINGS,
  classifyChangedFiles,
  isDocsOnlyChangeSet
} = require(path.join(ROOT, 'scripts', 'qa', 'resolve-gate-profile.js'));

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

  test('detects exact staging sha promotions on prod', () => {
    expect(
      isProdPromotionCandidate({
        currentBranch: 'prod',
        headSha: 'abc123',
        stagingSha: 'abc123'
      })
    ).toBe(true);
  });

  test('rejects prod promotions when staging sha differs', () => {
    expect(
      isProdPromotionCandidate({
        currentBranch: 'prod',
        headSha: 'abc123',
        stagingSha: 'def456'
      })
    ).toBe(false);
  });

  test('classifies a single route asset swap as localized-page', () => {
    const result = classifyChangedFiles(['assets/images/website-photo.jpg']);
    expect(result.profile).toBe('localized-page');
    expect(result.routeScopes).toEqual(['home']);
    expect(result.settings.runBrowserTests).toBe(true);
    expect(result.unitCommand).toContain('run-static-contract-suite.js --profile localized-page --mode node');
    expect(result.regressionCommand).toContain(
      'run-static-contract-suite.js --profile localized-page --mode jest'
    );
    expect(result.browserCommand).toContain('--scopes home');
  });

  test('classifies shared shell changes as shared-ui', () => {
    const result = classifyChangedFiles(['styles/site.css']);
    expect(result.profile).toBe('shared-ui');
    expect(result.settings.runBrowserTests).toBe(true);
    expect(result.settings.runLighthouseValidation).toBe(true);
    expect(result.unitCommand).toContain('run-static-contract-suite.js --profile shared-ui --mode node');
    expect(result.regressionCommand).toContain(
      'run-static-contract-suite.js --profile shared-ui --mode jest'
    );
    expect(result.browserCommand).toContain('--scopes all');
  });

  test('classifies workflow-only edits as release-infra', () => {
    const result = classifyChangedFiles(['.github/workflows/ci.yml']);
    expect(result.profile).toBe('release-infra');
    expect(result.settings.runBuildArtifact).toBe(true);
    expect(result.unitCommand).toContain('run-static-contract-suite.js --profile release-infra --mode node');
    expect(result.regressionCommand).toContain(
      'run-static-contract-suite.js --profile release-infra --mode jest'
    );
  });

  test('falls back to full-regression for unknown files', () => {
    const result = classifyChangedFiles(['unknown/new-area.txt']);
    expect(result.profile).toBe('full-regression');
  });

  test('documents all five selective profile settings', () => {
    expect(Object.keys(PROFILE_SETTINGS)).toEqual([
      'docs-only',
      'localized-page',
      'shared-ui',
      'release-infra',
      'full-regression'
    ]);
  });

  test('keeps docs-only local gate bound to the dedicated docs suite', () => {
    expect(PROFILE_SETTINGS['docs-only'].localCommands).toEqual(['npm run test:docs-gate']);
    expect(PROFILE_SETTINGS['docs-only'].runRegressionTests).toBe(false);
  });
});
