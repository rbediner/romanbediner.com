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
const MAX_ATTEMPTS = Number(process.env.RB_LIVE_MAX_ATTEMPTS || 8);
const RETRY_DELAY_MS = Number(process.env.RB_LIVE_RETRY_DELAY_MS || 15000);

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

function validateHomepage(homepage) {
  requireCondition(homepage.response.ok, `Homepage failed with status ${homepage.response.status}`);
  requireCondition(homepage.text.includes('/about/'), 'Homepage navigation is missing /about/ link');
  requireCondition(homepage.text.includes('application/ld+json'), 'Homepage structured data JSON-LD was not found');
  requireCondition(homepage.text.includes('Content-Security-Policy'), 'Homepage CSP meta policy was not found');
  requireCondition(homepage.text.includes('/scripts/runtime/ga4-bootstrap.js'), 'Homepage GA bootstrap script reference was not found');
}

function validateSitemap(sitemap) {
  requireCondition(sitemap.response.ok, `Sitemap failed with status ${sitemap.response.status}`);
  requireCondition(sitemap.text.includes('<urlset'), 'Sitemap XML content is invalid: missing <urlset>');
}

async function validateLiveDeployment() {
  const homepage = await fetchText('/');
  validateHomepage(homepage);

  // Canonical routes are validated directly rather than assuming they are all
  // present in a single homepage navigation block.
  const canonicalRoutes = ['/about/', '/services/', '/insights/', '/connect/'];
  for (const route of canonicalRoutes) {
    const routeResponse = await fetchText(route);
    requireCondition(routeResponse.response.ok, `Canonical route failed with status ${routeResponse.response.status}: ${route}`);
  }

  const sitemap = await fetchText('/sitemap.xml');
  validateSitemap(sitemap);

  return { homepage, sitemap };
}

function sleep(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

async function main() {
  let lastError = null;
  let attempt = 0;
  let result = null;

  while (attempt < MAX_ATTEMPTS) {
    attempt += 1;
    try {
      result = await validateLiveDeployment();
      break;
    } catch (error) {
      lastError = error;
      if (attempt < MAX_ATTEMPTS) {
        await sleep(RETRY_DELAY_MS);
      }
    }
  }

  if (!result) {
    throw new Error(
      `live deployment validation failed after ${MAX_ATTEMPTS} attempts: ${lastError ? lastError.message : 'unknown error'}`
    );
  }

  process.stdout.write(
    [
      'PASS: production live-site validation passed.',
      `- Base URL: ${BASE_URL}`,
      `- Homepage status: ${result.homepage.response.status}`,
      `- Sitemap status: ${result.sitemap.response.status}`,
      `- Attempts used: ${attempt}/${MAX_ATTEMPTS}`
    ].join('\n') + '\n'
  );
}

if (require.main === module) {
  main().catch((error) => {
    process.stderr.write(`FAIL: ${error.message}\n`);
    process.exit(1);
  });
}

module.exports = {
  validateHomepage,
  validateSitemap
};
