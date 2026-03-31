/**
 * Invariant:
 * - Selective gate runner must persist measurable output for future efficiency review.
 * Why this exists:
 * - Prevents selective QA from becoming opaque or impossible to benchmark.
 * What breaks if it fails:
 * - Engineers lose the ability to prove that gate selection is saving time.
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..', '..', '..');
const RUNNER_PATH = path.join(ROOT, 'scripts', 'qa', 'run-selective-gate.js');

describe('selective gate runner contract', () => {
  const runnerText = fs.readFileSync(RUNNER_PATH, 'utf8');

  test('writes local metrics snapshot to QA results', () => {
    expect(runnerText).toContain("path.join(ROOT, 'QA', 'results', 'gate-metrics')");
    expect(runnerText).toContain('latest-local-gate.json');
  });

  test('starts a local server only for profiles that need links or Lighthouse', () => {
    expect(runnerText).toContain("command.includes('npm run test:links')");
    expect(runnerText).toContain("command.includes('npm run test:lighthouse')");
    expect(runnerText).toContain("spawn('python3', ['-m', 'http.server'");
  });

  test('resolves route-scope placeholders before executing commands', () => {
    expect(runnerText).toContain('applyCommandPlaceholders');
    expect(runnerText).toContain('profileResult.routeScopes');
  });

  test('prints a human-readable success summary', () => {
    expect(runnerText).toContain('PASS: selective local QA gate passed.');
    expect(runnerText).toContain('Metrics file:');
  });
});
