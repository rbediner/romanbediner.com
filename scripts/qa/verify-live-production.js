#!/usr/bin/env node
/**
 * Purpose:
 * - Validate critical production deployment invariants against the live domain.
 * Architectural role:
 * - Acts as a post-deploy smoke gate for prod branch releases.
 * Dependencies:
 * - Node.js runtime with global fetch (Node 20+).
 * Security/CSP considerations:
 * - Read-only HTTP checks against production pages.
 * Migration considerations:
 * - Update required route/content assertions if canonical pages or scripts change.
 */

const BASE_URL = process.env.RB_LIVE_URL || 'https://romanbediner.com';

async function fetchText(pathname) {
  const response = await fetch(`${BASE_URL}${pathname}`, { redirect: 'follow' });
  const text = await response.text();
  return { response, text };
}

function requireCondition(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

async function main() {
  const homepage = await fetchText('/');
  requireCondition(homepage.response.ok, `Homepage failed with status ${homepage.response.status}`);
  requireCondition(homepage.text.includes('/about/'), 'Homepage navigation is missing /about/ link');
  requireCondition(homepage.text.includes('/services/'), 'Homepage navigation is missing /services/ link');
  requireCondition(homepage.text.includes('/insights/'), 'Homepage navigation is missing /insights/ link');
  requireCondition(homepage.text.includes('/connect/'), 'Homepage navigation is missing /connect/ link');
  requireCondition(homepage.text.includes('application/ld+json'), 'Homepage structured data JSON-LD was not found');
  requireCondition(homepage.text.includes('Content-Security-Policy'), 'Homepage CSP meta policy was not found');
  requireCondition(homepage.text.includes('/scripts/runtime/ga4-bootstrap.js'), 'Homepage GA bootstrap script reference was not found');

  const sitemap = await fetchText('/sitemap.xml');
  requireCondition(sitemap.response.ok, `Sitemap failed with status ${sitemap.response.status}`);
  requireCondition(sitemap.text.includes('<urlset'), 'Sitemap XML content is invalid: missing <urlset>');

  process.stdout.write(
    [
      'PASS: production live-site validation passed.',
      `- Base URL: ${BASE_URL}`,
      `- Homepage status: ${homepage.response.status}`,
      `- Sitemap status: ${sitemap.response.status}`
    ].join('\n') + '\n'
  );
}

if (require.main === module) {
  main().catch((error) => {
    process.stderr.write(`FAIL: ${error.message}\n`);
    process.exit(1);
  });
}
