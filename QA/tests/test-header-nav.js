#!/usr/bin/env node
/**
 * Invariant:
 * - Regression guardrails for test-header-nav.js.
 * Why this exists:
 * - Prevents architectural drift in routing, analytics, CSP, metadata, or shared UI contracts.
 * What breaks if it fails:
 * - CI blocks deployment to prevent production regressions.
 */
/**
 * Header and navigation structure consistency checks.
 */
const fs = require('fs');
const path = require('path');

const pages = [
  'index.html',
  'about/index.html',
  'services/index.html',
  'connect/index.html',
  'framework/index.html',
  'resources/index.html',
  'resources/ai-enabled-operations-framework-summary/index.html',
  'resources/pasteflow/index.html'
];

// Home removed from nav (logo serves as home link); Connect is a CTA button (cta:true).
const navModel = [
  { label: 'About', href: '/about/' },
  { label: 'Framework', href: '/framework/' },
  { label: 'Resources', href: '/resources/' },
  { label: 'Services', href: '/services/' },
  { label: 'Connect', href: '/connect/' }
];

const navScript = fs.readFileSync(path.resolve(__dirname, '..', '..', 'scripts/runtime/site-navigation.js'), 'utf8');

function normalizeHeader(html) {
  const headerMatch = html.match(/<header class="site-header">([\s\S]*?)<\/header>/i);
  if (!headerMatch) {
    return null;
  }

  return headerMatch[0]
    .replace(/src="[^"]+mainlogo-blue-white\.jpg"/g, 'src="LOGO"')
    .replace(/\s+/g, ' ')
    .trim();
}

let failures = 0;
let baseline = null;

for (const rel of pages) {
  const html = fs.readFileSync(path.resolve(__dirname, '..', '..', rel), 'utf8');
  const normalized = normalizeHeader(html);
  // Accept optional cache-busting query params on the shared nav runtime script.
  const scriptIncludeRegex = /<script src="(?:\.\.\/){0,2}scripts\/runtime\/site-navigation\.js(?:\?[^"]+)?"><\/script>/i;

  if (!normalized) {
    failures += 1;
    console.error(`FAIL: missing site header in ${rel}`);
    continue;
  }

  if (!html.includes('class="site-nav" aria-label="Primary"')) {
    failures += 1;
    console.error(`FAIL: desktop nav aria label mismatch in ${rel}`);
  }
  if (!/<a class="brand" href="\/" aria-label="Roman Bediner home">/i.test(html)) {
    failures += 1;
    console.error(`FAIL: brand lockup must link to home in ${rel}`);
  }
  if (!html.includes('id="mobile-nav" class="mobile-nav" aria-label="Mobile navigation"')) {
    failures += 1;
    console.error(`FAIL: mobile nav aria label mismatch in ${rel}`);
  }
  if (!/<nav class="site-nav" aria-label="Primary"><\/nav>/i.test(html)) {
    failures += 1;
    console.error(`FAIL: desktop nav must be rendered from shared component in ${rel}`);
  }
  if (!/<nav id="mobile-nav" class="mobile-nav" aria-label="Mobile navigation"><\/nav>/i.test(html)) {
    failures += 1;
    console.error(`FAIL: mobile nav must be rendered from shared component in ${rel}`);
  }
  if (!scriptIncludeRegex.test(html)) {
    failures += 1;
    console.error(`FAIL: shared navigation script include missing in ${rel}`);
  }

  if (!baseline) {
    baseline = normalized;
  } else if (baseline !== normalized) {
    failures += 1;
    console.error(`FAIL: header structure drift detected in ${rel}`);
  }
}

if (!/const NAV_LINKS = \[/s.test(navScript)) {
  failures += 1;
  console.error('FAIL: shared NAV_LINKS model missing in scripts/runtime/site-navigation.js.');
}

for (const link of navModel) {
  const escapedHref = link.href.replace(/\//g, '\\/');
  const regex = new RegExp(`\\{\\s*label:\\s*['"]${link.label}['"],\\s*href:\\s*['"]${escapedHref}['"][^}]*\\}`);
  if (!regex.test(navScript)) {
    failures += 1;
    console.error(`FAIL: NAV_LINKS missing entry ${link.label} (${link.href}).`);
  }

  const target = link.href === '/' ? 'index.html' : path.join(link.href.slice(1), 'index.html');
  if (!fs.existsSync(path.resolve(__dirname, '..', '..', target))) {
    failures += 1;
    console.error(`FAIL: NAV_LINKS route target missing for ${link.href}`);
  }
}

if (failures > 0) {
  process.exit(1);
}

console.log('PASS: header and navigation structure are consistent.');
