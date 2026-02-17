#!/usr/bin/env node
/**
 * Test: About Operating Philosophy structure and styling refinements.
 */
const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const aboutHtml = fs.readFileSync(path.join(root, 'about/index.html'), 'utf8');
const aboutCss = fs.readFileSync(path.join(root, 'styles/about.css'), 'utf8');
const siteCss = fs.readFileSync(path.join(root, 'styles/site.css'), 'utf8');

let failures = 0;

// Test 1: ensure unified philosophy card exists.
if (!aboutHtml.includes('class="card-philosophy"')) {
  failures += 1;
  console.error('FAIL: .card-philosophy container is missing in About page.');
}

// Test 2: ensure card hover elevation transform exists.
if (!/\.card-philosophy:hover\s*\{[^}]*transform:\s*translateY\(-3px\);/s.test(aboutCss)) {
  failures += 1;
  console.error('FAIL: .card-philosophy hover transform is missing.');
}

// Test 3: ensure exactly two internal dividers are rendered.
const dividerCount = (aboutHtml.match(/class="philosophy-divider"/g) || []).length;
if (dividerCount !== 2) {
  failures += 1;
  console.error(`FAIL: expected 2 philosophy dividers, found ${dividerCount}.`);
}

// Test 4: ensure orb bullets use /icons/bullet.png and 12px sizing globally.
if (!/\.service-list li::before\s*\{[^}]*width:\s*12px;[^}]*height:\s*12px;[^}]*margin-right:\s*10px;[^}]*background-image:\s*url\("\/icons\/bullet\.png"\);/s.test(siteCss)) {
  failures += 1;
  console.error('FAIL: service-list orb bullet spec does not match required /icons/bullet.png and 12px sizing.');
}

// Test 5: ensure Insights micro-link exists and points to /insights/.
if (!/<a[^>]*href="\/insights\/"[^>]*class="philosophy-insights-link"/.test(aboutHtml) || !aboutHtml.includes('Explore related insights →')) {
  failures += 1;
  console.error('FAIL: Insights micro-link is missing or incorrectly routed.');
}

if (failures > 0) {
  process.exit(1);
}

console.log('PASS: operating philosophy structure and styling checks passed.');
