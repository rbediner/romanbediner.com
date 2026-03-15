#!/usr/bin/env node
/**
 * Purpose:
 * - Validate staging preview deployment route availability for all sitemap routes.
 * Architectural role:
 * - Confirms preview environment mirrors routable pages before visual approval.
 * Dependencies:
 * - Node.js runtime with global fetch (Node 20+).
 * Security/CSP considerations:
 * - Read-only HTTP checks against preview deployment URL.
 * Migration considerations:
 * - Keep preview URL/base-path mapping aligned with preview repo pages model.
 */

const {
  extractRoutePathnames,
  fetchText,
  requireCondition,
  validateRouteStatuses
} = require('./route-health');

const BASE_URL = process.env.RB_PREVIEW_URL;

function requirePreviewUrl(url) {
  requireCondition(Boolean(url), 'RB_PREVIEW_URL is required for preview deployment validation.');
  let parsed;
  try {
    parsed = new URL(url);
  } catch (error) {
    throw new Error(`RB_PREVIEW_URL is invalid: ${url}`);
  }

  requireCondition(parsed.protocol === 'https:' || parsed.protocol === 'http:', 'RB_PREVIEW_URL must use http/https.');
}

async function validateLivePreview() {
  requirePreviewUrl(BASE_URL);

  const homepage = await fetchText(BASE_URL, '/');
  requireCondition(homepage.response.ok, `Preview homepage failed with status ${homepage.response.status}`);

  const sitemap = await fetchText(BASE_URL, '/sitemap.xml');
  requireCondition(sitemap.response.ok, `Preview sitemap failed with status ${sitemap.response.status}`);
  requireCondition(sitemap.text.includes('<urlset'), 'Preview sitemap XML is invalid: missing <urlset>');

  const canonicalRoutes = extractRoutePathnames(sitemap.text);
  const routeResults = await validateRouteStatuses(BASE_URL, canonicalRoutes);

  return { homepage, sitemap, routeResults, canonicalRoutes };
}

async function main() {
  try {
    const result = await validateLivePreview();
    process.stdout.write(
      [
        'PASS: staging preview live-site validation passed.',
        `- Base URL: ${BASE_URL}`,
        `- Homepage status: ${result.homepage.response.status}`,
        `- Sitemap status: ${result.sitemap.response.status}`,
        `- Route checks: ${result.routeResults.length}`
      ].join('\n') + '\n'
    );
  } catch (error) {
    process.stderr.write(`FAIL: ${error.message}\n`);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = {
  requirePreviewUrl,
  validateLivePreview
};
