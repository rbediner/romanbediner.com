#!/usr/bin/env node
/**
 * Invariant:
 * - Regression guardrails for test-nav-links-contract.js.
 * Why this exists:
 * - Prevents architectural drift in routing, analytics, CSP, metadata, or shared UI contracts.
 * What breaks if it fails:
 * - CI blocks deployment to prevent production regressions.
 */
/**
 * Navigation link contract checks for canonical pages.
 * Nav links are rendered at runtime from scripts/runtime/site-navigation.js.
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..', '..');
const PAGES = [
  'index.html',
  'about/index.html',
  'services/index.html',
  'framework/index.html',
  'connect/index.html',
  'resources/index.html',
  'resources/ai-enabled-operations-framework-summary/index.html'
];
// Home (/) removed from nav (logo serves as home link); Connect remains as CTA button.
const REQUIRED_HREFS = ['/about/', '/framework/', '/resources/', '/services/', '/connect/'];

function parseNavLinks(navScript) {
  const links = [];
  const entryRegex = /\{\s*label:\s*["']([^"']+)["']\s*,\s*href:\s*["']([^"']+)["'][^}]*\}/g;
  let match;
  while ((match = entryRegex.exec(navScript)) !== null) {
    links.push({ label: match[1], href: match[2] });
  }
  return links;
}

let failures = 0;

const navScript = fs.readFileSync(path.join(ROOT, 'scripts', 'runtime', 'site-navigation.js'), 'utf8');
const navLinks = parseNavLinks(navScript);
const navHrefs = navLinks.map((link) => link.href);

if (!/function resolveBasePath\(\)/.test(navScript)) {
  failures += 1;
  console.error('FAIL: shared nav runtime must expose resolveBasePath() for preview compatibility.');
}

if (!/hostname\.endsWith\("github\.io"\)/.test(navScript)) {
  failures += 1;
  console.error('FAIL: resolveBasePath() must detect GitHub Pages preview hosts.');
}

if (!/function resolveNavHref\(href, basePath\)/.test(navScript)) {
  failures += 1;
  console.error('FAIL: shared nav runtime must expose resolveNavHref(href, basePath).');
}

if (!/return `\$\{basePath\}\/`/.test(navScript) || !/return `\$\{basePath\}\$\{href\}`/.test(navScript)) {
  failures += 1;
  console.error('FAIL: resolveNavHref() must prefix both home and non-home routes when preview base path exists.');
}

if (!/href\.startsWith\(`\$\{basePath\}\/`\)/.test(navScript)) {
  failures += 1;
  console.error('FAIL: resolveNavHref() must skip already-prefixed preview paths to avoid double-prefix links.');
}

for (const href of REQUIRED_HREFS) {
  if (!navHrefs.includes(href)) {
    failures += 1;
    console.error(`FAIL: shared nav model missing href ${href}`);
  }
}

for (const rel of PAGES) {
  const html = fs.readFileSync(path.join(ROOT, rel), 'utf8');
  const hasDesktopPlaceholder = /<nav class="site-nav" aria-label="Primary"><\/nav>/i.test(html);
  const hasMobilePlaceholder = /<nav id="mobile-nav" class="mobile-nav" aria-label="Mobile navigation"><\/nav>/i.test(html);
  // Allow optional cache-busting query params for deterministic nav-cache invalidation.
  const hasSharedScript = /<script src="(?:\.\.\/){0,2}scripts\/runtime\/site-navigation\.js(?:\?[^"]+)?"><\/script>/i.test(html);

  if (!hasDesktopPlaceholder) {
    failures += 1;
    console.error(`FAIL: missing desktop nav placeholder in ${rel}`);
  }
  if (!hasMobilePlaceholder) {
    failures += 1;
    console.error(`FAIL: missing mobile nav placeholder in ${rel}`);
  }
  if (!hasSharedScript) {
    failures += 1;
    console.error(`FAIL: missing shared nav script include in ${rel}`);
  }

  for (const href of REQUIRED_HREFS) {
    if (!navHrefs.includes(href)) {
      failures += 1;
      console.error(`FAIL: ${rel} does not resolve nav href ${href} via shared nav model`);
    }
  }
}

if (failures > 0) {
  process.exit(1);
}

console.log('PASS: canonical pages include shared nav placeholders and required route hrefs.');
