#!/usr/bin/env node
/**
 * Invariant:
 * - Regression guardrails for test-clean-urls.js.
 * Why this exists:
 * - Prevents architectural drift in routing, analytics, CSP, metadata, or shared UI contracts.
 * What breaks if it fails:
 * - CI blocks deployment to prevent production regressions.
 */
/**
 * URL architecture and page policy checks.
 */
const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..', '..');
const LEGACY_HOME_ROUTE = `/${'home'}/`;
const canonicalPages = [
  'index.html',
  'about/index.html',
  'services/index.html',
  'connect/index.html',
  'insights/index.html'
];

let failures = 0;

for (const rel of canonicalPages) {
  const file = path.join(root, rel);
  const html = fs.readFileSync(file, 'utf8');

  // No legacy extension links in navigation.
  const navBlocks = html.match(/<nav[\s\S]*?<\/nav>/gi) || [];
  for (const block of navBlocks) {
    if (/href="[^"]*\.html"/i.test(block)) {
      failures += 1;
      console.error(`FAIL: .html nav link found in ${rel}`);
    }
    if (/href="\/contact\//i.test(block)) {
      failures += 1;
      console.error(`FAIL: legacy nav route found in ${rel}`);
    }
  }

  // Shared style and GA bootstrap must be present.
  if (!html.includes('href="/styles/site.css"')) {
    failures += 1;
    console.error(`FAIL: missing /styles/site.css in ${rel}`);
  }
  if (!html.includes('src="/scripts/ga4.js"')) {
    failures += 1;
    console.error(`FAIL: missing /scripts/ga4.js include in ${rel}`);
  }
  if (/<style>/i.test(html)) {
    failures += 1;
    console.error(`FAIL: inline <style> block found in ${rel}`);
  }
}

// Route existence policy.
if (!fs.existsSync(path.join(root, 'insights', 'index.html'))) {
  failures += 1;
  console.error('FAIL: /insights/ page is missing.');
}
if (fs.existsSync(path.join(root, 'about', 'insights', 'index.html'))) {
  failures += 1;
  console.error('FAIL: legacy /about/insights/ page still exists.');
}
if (fs.existsSync(path.join(root, 'contact', 'index.html'))) {
  failures += 1;
  console.error('FAIL: legacy /contact/ page still exists.');
}
if (fs.existsSync(path.join(root, 'home', 'index.html'))) {
  failures += 1;
  console.error(`FAIL: legacy ${LEGACY_HOME_ROUTE} route still exists.`);
}

// /insights/ must exist in shared navigation model.
const aboutHtml = fs.readFileSync(path.join(root, 'about', 'index.html'), 'utf8');
const navScript = fs.readFileSync(path.join(root, 'scripts', 'site-navigation.js'), 'utf8');
if (!aboutHtml.includes('<nav class="site-nav" aria-label="Primary"></nav>') || !/href:\s*["']\/insights\/["']/.test(navScript)) {
  failures += 1;
  console.error('FAIL: /insights/ is missing from shared navigation model.');
}

if (failures > 0) {
  process.exit(1);
}

console.log('PASS: clean URL and route architecture checks passed.');
