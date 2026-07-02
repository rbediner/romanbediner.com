/**
 * Invariant: Framework brief scroll telemetry must use the shared GA4 field names.
 * Why this exists: Prevents Looker Studio and GA4 custom dimensions from degrading to "(not set)".
 * What breaks if it fails: Framework brief engagement becomes unreliable in reports.
 */
const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..', '..', '..');
const frameworkAnalytics = fs.readFileSync(
  path.join(root, 'scripts', 'runtime', 'framework-brief-analytics.js'),
  'utf8'
);

describe('Framework brief analytics contract', () => {
  test('scroll_depth payload uses percent_scrolled and not the legacy scroll_percent key', () => {
    expect(frameworkAnalytics).toContain('percent_scrolled');
    expect(frameworkAnalytics).not.toContain('scroll_percent');
  });

  test('scroll_depth payload still carries the framework brief context fields', () => {
    expect(frameworkAnalytics).toContain("page_type: 'framework_brief'");
    expect(frameworkAnalytics).toContain('page_path');
    expect(frameworkAnalytics).toContain("safeTrack('scroll_depth'");
  });
});
