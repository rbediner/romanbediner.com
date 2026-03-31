/**
 * Invariant:
 * - Selective browser smoke must protect nav, mobile, GA, and interaction hotspots.
 * Why this exists:
 * - Prevents the lightweight browser layer from drifting back into a generic
 *   load test that misses the regressions operators actually worry about.
 * What breaks if it fails:
 * - CI blocks until browser smoke coverage is restored.
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..', '..', '..');
const BROWSER_SMOKE_PATH = path.join(ROOT, 'scripts', 'qa', 'run-browser-smoke.js');
const LIVE_BROWSER_SMOKE_PATH = path.join(ROOT, 'scripts', 'qa', 'verify-live-browser-smoke.js');

describe('browser smoke contract', () => {
  const browserSmokeText = fs.readFileSync(BROWSER_SMOKE_PATH, 'utf8');
  const liveBrowserSmokeText = fs.readFileSync(LIVE_BROWSER_SMOKE_PATH, 'utf8');

  test('defines all canonical route scopes', () => {
    expect(browserSmokeText).toContain('home:');
    expect(browserSmokeText).toContain('about:');
    expect(browserSmokeText).toContain('services:');
    expect(browserSmokeText).toContain('framework:');
    expect(browserSmokeText).toContain('connect:');
  });

  test('checks navigation, mobile, analytics, and interaction hotspots', () => {
    expect(browserSmokeText).toContain('assertNavContract');
    expect(browserSmokeText).toContain('assertMobileContract');
    expect(browserSmokeText).toContain('assertGaBootstrap');
    expect(browserSmokeText).toContain('assertFrameworkContract');
    expect(browserSmokeText).toContain('assertConnectContract');
    expect(browserSmokeText).toContain('assertServiceBulletContract');
  });

  test('keeps a live browser smoke wrapper for production', () => {
    expect(liveBrowserSmokeText).toContain('RB_LIVE_URL');
    expect(liveBrowserSmokeText).toContain('RB_LIVE_BROWSER_SCOPES');
    expect(liveBrowserSmokeText).toContain('run-browser-smoke.js');
  });
});
