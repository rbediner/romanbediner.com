/**
 * Invariant: PasteFlow external resource CTAs emit dedicated GA telemetry.
 * Why this exists: Prevents silent loss of Add to Chrome click visibility.
 * What breaks if it fails: Operators lose trustworthy external CTA conversion counts.
 */
const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..', '..', '..');
const pasteflowHtml = fs.readFileSync(
  path.join(root, 'resources', 'pasteflow', 'index.html'),
  'utf8'
);
const resourcesAnalytics = fs.readFileSync(path.join(root, 'scripts', 'runtime', 'resources-analytics.js'), 'utf8');

describe('PasteFlow external CTA analytics contract', () => {
  test('pasteflow page marks external CTAs with explicit tracking hooks', () => {
    const markerMatches = pasteflowHtml.match(/data-track-resource-external-cta/g) || [];
    expect(markerMatches.length).toBeGreaterThanOrEqual(2);
    expect(pasteflowHtml).toContain('data-resource-cta-label="add_to_chrome"');
    expect(pasteflowHtml).toContain('data-resource-external-url-type="chrome_web_store"');
  });

  test('resources analytics emits resource_external_cta_click payload', () => {
    expect(resourcesAnalytics).toContain("trackEvent('resource_external_cta_click'");
    expect(resourcesAnalytics).toContain('destination');
    expect(resourcesAnalytics).toContain('cta_label');
    expect(resourcesAnalytics).toContain('external_url_type');
    expect(resourcesAnalytics).toContain("querySelectorAll('[data-track-resource-external-cta]')");
  });
});
