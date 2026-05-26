/**
 * Invariant: Dashboard "View Source Code" links emit dedicated GA telemetry.
 * Why this exists: Prevents silent loss of source-link click visibility in GA4.
 * What breaks if it fails: Operators lose trustworthy source-code CTA click counts.
 */
const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..', '..', '..');
const dashboardHtml = fs.readFileSync(
  path.join(root, 'resources', 'ai-enabled-operations-dashboard', 'index.html'),
  'utf8'
);
const resourcesAnalytics = fs.readFileSync(path.join(root, 'scripts', 'runtime', 'resources-analytics.js'), 'utf8');

describe('Dashboard source code analytics contract', () => {
  test('dashboard page marks one source-code CTA with explicit tracking hooks', () => {
    const markerMatches = dashboardHtml.match(/data-track-dashboard-source-code/g) || [];
    expect(markerMatches.length).toBe(1);
  });

  test('resources analytics emits the dedicated source-code event with destination payload', () => {
    expect(resourcesAnalytics).toContain("trackEvent('resource_source_code_click'");
    expect(resourcesAnalytics).toContain('destination');
    expect(resourcesAnalytics).toContain('cta_label');
    expect(resourcesAnalytics).toContain("querySelectorAll('[data-track-dashboard-source-code]')");
  });
});
