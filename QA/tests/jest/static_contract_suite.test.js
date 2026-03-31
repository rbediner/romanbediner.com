/**
 * Invariant:
 * - Selective static suites must stay intentionally scoped by route and by responsibility.
 * Why this exists:
 * - Prevents "localized" and "shared-ui" gates from silently drifting back to
 *   broad full-site checks or losing key route-specific coverage.
 * What breaks if it fails:
 * - CI blocks until selective suite ownership is restored.
 */
const path = require('path');

const ROOT = path.resolve(__dirname, '..', '..', '..');
const {
  CANONICAL_SCOPES,
  buildCommands,
  parseScopes,
  resolveJestTests,
  resolveNodeTests
} = require(path.join(ROOT, 'scripts', 'qa', 'run-static-contract-suite.js'));

describe('selective static contract suite', () => {
  test('parses all route scopes when given "all"', () => {
    expect(parseScopes('all')).toEqual(CANONICAL_SCOPES);
  });

  test('localized home node suite stays route-focused', () => {
    const tests = resolveNodeTests('localized-page', ['home']);
    expect(tests).toContain('QA/tests/test-home-hero-layout.js');
    expect(tests).toContain('QA/tests/test-home-spacing-contract.js');
    expect(tests).not.toContain('QA/tests/test-connect-page.js');
  });

  test('localized connect jest suite keeps contact anti-abuse coverage', () => {
    const tests = resolveJestTests('localized-page', ['connect']);
    expect(tests).toContain('QA/tests/jest/browser_smoke_contract.test.js');
    expect(tests).toContain('QA/tests/jest/contact-form-antiabuse.test.js');
  });

  test('shared-ui suite keeps shared design-system and typography coverage', () => {
    const nodeTests = resolveNodeTests('shared-ui', CANONICAL_SCOPES);
    const jestTests = resolveJestTests('shared-ui', CANONICAL_SCOPES);
    expect(nodeTests).toContain('QA/tests/test-shared-design-system.js');
    expect(nodeTests).toContain('QA/tests/test-header-nav.js');
    expect(jestTests).toContain('QA/tests/jest/typography-regression.test.js');
    expect(jestTests).toContain('QA/tests/jest/browser_smoke_contract.test.js');
  });

  test('release-infra suite keeps README/SOP integrity checks', () => {
    const commands = buildCommands('release-infra', 'jest', ['all']);
    expect(commands[0]).toContain('QA/tests/jest/readme_integrity.test.js');
    expect(commands[0]).toContain('QA/tests/jest/deployment_sop.test.js');
  });
});
