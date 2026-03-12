/**
 * Invariant:
 * - Session-readiness helpers must detect node-version drift and duplicate sync artifacts deterministically.
 * Why this exists:
 * - Prevents the startup preflight from silently accepting broken local setups.
 * What breaks if it fails:
 * - Operators may begin work from the wrong runtime or a cloud-corrupted checkout.
 */
const path = require('path');

const SCRIPT_PATH = path.resolve(
  __dirname,
  '..',
  '..',
  '..',
  'scripts',
  'qa',
  'verify-session-readiness.js'
);

const {
  formatGitStatus,
  getRequiredBranch,
  getTopLevelDuplicateArtifacts,
  parseExpectedNodeMajor
} = require(SCRIPT_PATH);

describe('Session readiness helpers', () => {
  test('parses the pinned Node major from .nvmrc text', () => {
    expect(parseExpectedNodeMajor('20\n')).toBe('20');
    expect(parseExpectedNodeMajor('v20')).toBe('20');
  });

  test('extracts the required branch from the handoff file', () => {
    const handoffText = [
      '# Cross-Machine Handoff (Latest)',
      '- Source Branch: staging',
      '- Source Commit: abcdef1234567890abcdef1234567890abcdef12'
    ].join('\n');

    expect(getRequiredBranch(handoffText)).toBe('staging');
  });

  test('detects top-level cloud-sync duplicates only when a canonical entry exists', () => {
    const duplicates = getTopLevelDuplicateArtifacts(
      ['AGENTS.md', 'AGENTS 2.md', 'scripts', 'scripts 2', 'notes 2.md'],
      new Set(['AGENTS.md', 'scripts', 'notes.md'])
    );

    expect(duplicates).toEqual([
      { artifactName: 'AGENTS 2.md', canonicalName: 'AGENTS.md' },
      { artifactName: 'scripts 2', canonicalName: 'scripts' },
      { artifactName: 'notes 2.md', canonicalName: 'notes.md' }
    ]);
  });

  test('detects conflicted-copy duplicate artifacts', () => {
    const duplicates = getTopLevelDuplicateArtifacts(
      ['scripts', 'scripts (conflicted copy 2026-03-12 from Roman Mac).js'],
      new Set(['scripts.js'])
    );

    expect(duplicates).toEqual([
      {
        artifactName: 'scripts (conflicted copy 2026-03-12 from Roman Mac).js',
        canonicalName: 'scripts.js'
      }
    ]);
  });

  test('trims noisy git status lines down to a readable preview', () => {
    expect(formatGitStatus(' D scripts/qa/run-ci-parity.sh\n?? scripts 2/\n')).toEqual([
      ' D scripts/qa/run-ci-parity.sh',
      '?? scripts 2/'
    ]);
  });
});
