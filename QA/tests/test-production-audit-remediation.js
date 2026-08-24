#!/usr/bin/env node
/**
 * Invariant:
 * - Production-audit remediation remains enforced across every canonical HTML surface.
 * Why this exists:
 * - CSP, font-loading, and text-contrast regressions can silently damage trust, analytics, and accessibility.
 * What breaks if it fails:
 * - CI blocks deployment before audit findings return to production.
 */
const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..', '..');
const htmlFiles = [
  'index.html', '404.html', 'about/index.html', 'connect/index.html', 'privacy/index.html', 'services/index.html',
  'framework/index.html', 'framework/design/operations-as-product/index.html', 'framework/evolution/agentic-guardrails/index.html',
  'framework/execution/operational-lanes/index.html', 'framework/integration/ai-operating-layer/index.html',
  'framework/opportunity/productizing-operations/index.html', 'framework/signals/operational-signals/index.html',
  'resources/index.html', 'resources/ai-project-manager/index.html', 'resources/agentic-ai-employees/index.html', 'resources/ai-enabled-operations-dashboard/index.html',
  'resources/ai-enabled-operations-framework-summary/index.html', 'resources/pasteflow/index.html'
];

const failures = [];
for (const relativePath of htmlFiles) {
  const html = fs.readFileSync(path.join(root, relativePath), 'utf8');
  for (const endpoint of ['https://stats.g.doubleclick.net', 'https://static.cloudflareinsights.com', 'https://cloudflareinsights.com']) {
    if (!html.includes(endpoint)) failures.push(`${relativePath} is missing CSP endpoint ${endpoint}.`);
  }
  if (html.includes('fonts.googleapis.com') || html.includes('fonts.gstatic.com')) failures.push(`${relativePath} must not keep Google Fonts on the critical path.`);
}

const siteCss = fs.readFileSync(path.join(root, 'styles', 'site.css'), 'utf8');
if (siteCss.includes('@import url("https://fonts.googleapis.com')) failures.push('site.css must not delay DM Sans with a nested CSS font import.');
if (!siteCss.includes('url("/assets/fonts/dm-sans-latin.woff2")')) failures.push('site.css must load self-hosted DM Sans.');
if (!siteCss.includes('url("/assets/fonts/cormorant-garamond-latin.woff2")')) failures.push('site.css must load self-hosted Cormorant Garamond.');
if (!siteCss.includes('--accent-blue: #2457d6;')) failures.push('site.css must keep the accessible blue text token.');
if (!siteCss.includes('color: #666666;')) failures.push('site.css must keep the accessible footer attribution color.');

if (failures.length) {
  failures.forEach((failure) => console.error(`FAIL: ${failure}`));
  process.exit(1);
}

console.log('PASS: production audit remediation contracts passed.');
