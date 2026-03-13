/**
 * Invariant:
 * - The local mirror runner must use an isolated temp directory per invocation.
 * Why this exists:
 * - A fixed temp path can collide with stale/concurrent processes and block pre-push validation.
 * What breaks if it fails:
 * - Husky pre-push can fail before tests run, forcing unsafe --no-verify pushes.
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '../../..');
const RUNNER = path.join(ROOT, 'scripts', 'qa', 'run-in-local-mirror.sh');

describe('local mirror runner isolation', () => {
  const script = fs.readFileSync(RUNNER, 'utf8');

  test('creates a unique temp root using mktemp', () => {
    expect(script).toMatch(/mktemp -d/);
    expect(script).toMatch(/rb-local-runtime\.[X]{6}/);
  });

  test('does not rely on legacy fixed run directory path', () => {
    expect(script).not.toMatch(/rb-local-runtime\/run/);
  });

  test('registers cleanup trap for temp mirror directory', () => {
    expect(script).toMatch(/trap cleanup EXIT/);
  });
});
