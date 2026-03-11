#!/usr/bin/env node
/**
 * Invariant:
 * - Regression guardrails for test-operating-philosophy.js.
 * Why this exists:
 * - Prevents architectural drift in routing, analytics, CSP, metadata, or shared UI contracts.
 * What breaks if it fails:
 * - CI blocks deployment to prevent production regressions.
 */
/**
 * Test: About Operating Philosophy structure and styling refinements.
 */
const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..', '..');
const aboutHtml = fs.readFileSync(path.join(root, 'about/index.html'), 'utf8');
const aboutCss = fs.readFileSync(path.join(root, 'styles/about.css'), 'utf8');
const siteCss = fs.readFileSync(path.join(root, 'styles/site.css'), 'utf8');

let failures = 0;

// Test 1: ensure unified philosophy card exists.
if (!/class="[^"]*\bcard-philosophy\b[^"]*"/.test(aboutHtml)) {
  failures += 1;
  console.error('FAIL: .card-philosophy container is missing in About page.');
}
if (!aboutHtml.includes('class="philosophy-card-title"')) {
  failures += 1;
  console.error('FAIL: Operating Philosophy title is missing from inside the unified card.');
}

// Test 2: ensure card hover elevation transform exists.
if (!/\.card-philosophy:hover\s*\{[^}]*transform:\s*translateY\(-3px\);/s.test(aboutCss)) {
  failures += 1;
  console.error('FAIL: .card-philosophy hover transform is missing.');
}

// Test 3: ensure philosophy dividers are removed in favor of stacked layout.
const dividerCount = (aboutHtml.match(/class="philosophy-divider"/g) || []).length;
if (dividerCount !== 0) {
  failures += 1;
  console.error(`FAIL: expected 0 philosophy dividers after stack refactor, found ${dividerCount}.`);
}
if (!aboutHtml.includes('class="philosophy-stack"')) {
  failures += 1;
  console.error('FAIL: philosophy-stack container is missing.');
}
if ((aboutHtml.match(/class="philosophy-item"/g) || []).length !== 2) {
  failures += 1;
  console.error('FAIL: expected exactly 2 philosophy items in the stack.');
}

// Test 4: ensure orb bullets use /assets/icons/bullet.png and 8px sizing globally.
if (!/\.service-list li::before\s*\{[^}]*width:\s*8px;[^}]*height:\s*8px;[^}]*margin-right:\s*14px;[^}]*background-image:\s*url\("\/assets\/icons\/bullet\.png"\);/s.test(siteCss)) {
  failures += 1;
  console.error('FAIL: service-list orb bullet spec does not match required /assets/icons/bullet.png and 8px sizing.');
}

// Test 5: ensure standardized About transition CTA routes to /services/.
if (
  !/<section[^>]*class="[^"]*\bnext-page-nav\b[^"]*"/.test(aboutHtml) ||
  !/<a[^>]*href="\/services\/"[^>]*class="nav-anchor"/.test(aboutHtml) ||
  !/THE OPERATING MODEL/.test(aboutHtml) ||
  !/class="nav-title sr-only">Transition to Strategic Services</.test(aboutHtml)
) {
  failures += 1;
  console.error('FAIL: About transition CTA is missing or incorrectly routed.');
}

if (failures > 0) {
  process.exit(1);
}

console.log('PASS: operating philosophy structure and styling checks passed.');
