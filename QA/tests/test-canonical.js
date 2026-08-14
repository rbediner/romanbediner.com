#!/usr/bin/env node
/**
 * Invariant:
 * - Regression guardrails for test-canonical.js.
 * Why this exists:
 * - Prevents architectural drift in routing, analytics, CSP, metadata, or shared UI contracts.
 * What breaks if it fails:
 * - CI blocks deployment to prevent production regressions.
 */
/**
 * Canonical and OG URL alignment checks.
 */
const fs = require('fs');
const path = require('path');

const checks = [
  { file: 'index.html', canonical: 'https://romanbediner.com/' },
  { file: 'about/index.html', canonical: 'https://romanbediner.com/about/' },
  { file: 'services/index.html', canonical: 'https://romanbediner.com/services/' },
  { file: 'connect/index.html', canonical: 'https://romanbediner.com/connect/' },
  { file: 'framework/index.html', canonical: 'https://romanbediner.com/framework/' },
  { file: 'resources/index.html', canonical: 'https://romanbediner.com/resources/' },
  { file: 'resources/ai-project-manager/index.html', canonical: 'https://romanbediner.com/resources/ai-project-manager/' },
  { file: 'resources/ai-enabled-operations-framework-summary/index.html', canonical: 'https://romanbediner.com/resources/ai-enabled-operations-framework-summary/' },
  { file: 'resources/ai-enabled-operations-dashboard/index.html', canonical: 'https://romanbediner.com/resources/ai-enabled-operations-dashboard/' },
  { file: 'resources/pasteflow/index.html', canonical: 'https://romanbediner.com/resources/pasteflow/' }
];

let failures = 0;
for (const check of checks) {
  const html = fs.readFileSync(path.resolve(__dirname, '..', '..', check.file), 'utf8');

  const canonical = html.match(/<link rel="canonical" href="([^"]+)"\s*\/>/i);
  const ogUrl = html.match(/<meta property="og:url" content="([^"]+)"\s*\/>/i);

  if (!canonical || canonical[1] !== check.canonical) {
    failures += 1;
    console.error(`FAIL: canonical mismatch in ${check.file}`);
  }
  if (!ogUrl || ogUrl[1] !== check.canonical) {
    failures += 1;
    console.error(`FAIL: og:url mismatch in ${check.file}`);
  }

  // CSP policy check: script-src must not include unsafe-inline.
  const csp = html.match(/<meta http-equiv="Content-Security-Policy" content="([^"]+)"\s*>/i);
  if (!csp) {
    failures += 1;
    console.error(`FAIL: missing CSP meta in ${check.file}`);
  } else {
    const scriptSrc = csp[1].match(/script-src\s+([^;]+)/i);
    if (!scriptSrc) {
      failures += 1;
      console.error(`FAIL: missing script-src directive in ${check.file}`);
    } else if (/unsafe-inline/i.test(scriptSrc[1])) {
      failures += 1;
      console.error(`FAIL: script-src contains unsafe-inline in ${check.file}`);
    }
  }
}

if (failures > 0) {
  process.exit(1);
}

console.log('PASS: canonical, og:url, and CSP checks passed.');
