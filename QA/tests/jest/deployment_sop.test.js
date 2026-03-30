/**
 * Invariant:
 * - README must document deployment SOP, bootstrap dependencies, and Codex permission behavior.
 * Why this exists:
 * - Ensures operators can set up a new machine and execute releases without tribal knowledge.
 * What breaks if it fails:
 * - CI blocks until deployment operations documentation is restored.
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..', '..', '..');
const README_PATH = path.join(ROOT, 'README.md');
const README = fs.readFileSync(README_PATH, 'utf8');

describe('Deployment SOP documentation contract', () => {
  test('contains required SOP and bootstrap sections', () => {
    const requiredHeadings = [
      '## New Machine Bootstrap',
      '## Deployment SOP (Standard Operating Procedure)',
      '## Codex Permissions Model'
    ];

    for (const heading of requiredHeadings) {
      expect(README.includes(heading)).toBe(true);
    }
  });

  test('documents required dependency installation commands', () => {
    expect(README.includes('npm ci')).toBe(true);
    expect(README.includes('npx playwright install chromium')).toBe(true);
    expect(README.includes('python3 -m pip install --upgrade pip')).toBe(true);
    expect(README.includes('pip install playwright==1.58.0 pillow==11.3.0')).toBe(true);
    expect(README.includes('npm run session:ready')).toBe(true);
  });

  test('documents pre-push QA gate, release script, and persistent prefix approvals', () => {
    expect(README.includes('npm run qa:ci-parity')).toBe(true);
    expect(README.includes('npm run qa:prod-promotion-gate')).toBe(true);
    expect(README.includes('npm run qa:gate:localized-page')).toBe(true);
    expect(README.includes('npm run qa:gate:shared-ui')).toBe(true);
    expect(README.includes('npm run qa:gate:release-infra')).toBe(true);
    expect(README.includes('npm run qa:gate:full-regression')).toBe(true);
    expect(README.includes('npm run qa:smoke:prod')).toBe(true);
    expect(README.includes('npm run release:staging-prod')).toBe(true);
    expect(README.includes('--workers>=3')).toBe(true);
    expect(README.includes('SKIP_PREPUSH_QA=1')).toBe(true);
    expect(README.includes('approved command prefixes')).toBe(true);
    expect(README.includes('persist approvals beyond a single command')).toBe(true);
  });
});
