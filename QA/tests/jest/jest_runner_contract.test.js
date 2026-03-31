/**
 * Invariant:
 * - The Jest wrapper must not force worker-pool flags when serial execution is requested.
 * Why this exists:
 * - Targeted suites like docs-only validation intentionally use --runInBand
 *   and would fail if the wrapper also injects --maxWorkers.
 * What breaks if it fails:
 * - Lightweight targeted gates become unusable and regress back toward
 *   heavyweight test bundles.
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..', '..', '..');
const RUNNER_PATH = path.join(ROOT, 'scripts', 'qa', 'run-jest-suite.js');

describe('jest runner contract', () => {
  const runnerText = fs.readFileSync(RUNNER_PATH, 'utf8');

  test('detects explicit serial execution flags', () => {
    expect(runnerText).toContain("requestedArgs.includes('--runInBand')");
    expect(runnerText).toContain("requestedArgs.includes('-i')");
  });

  test('skips maxWorkers injection for serial execution', () => {
    expect(runnerText).toContain('const forcesSingleProcess');
    expect(runnerText).toContain('!forcesSingleProcess && !requestedArgs.some');
  });
});
