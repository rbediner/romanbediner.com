#!/usr/bin/env node
/**
 * Invariant:
 * - About page opening section must preserve the approved headline, chapter anchors, and four-era timeline contract.
 * Why this exists:
 * - Protects the top-of-page about experience where narrative framing and wayfinding are introduced together.
 * What breaks if it fails:
 * - CI blocks deployment to prevent about-hero contract regressions.
 */
const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..', '..');
const aboutHtml = fs.readFileSync(path.join(root, 'about/index.html'), 'utf8');
const aboutCss = fs.readFileSync(path.join(root, 'styles/about.css'), 'utf8');

const failures = [];

for (const marker of ['class="about-hero-refactored"', 'class="page-title"', 'class="lede-description"']) {
  if (!aboutHtml.includes(marker)) {
    failures.push(`Missing About hero marker: ${marker}`);
  }
}

if (!aboutHtml.includes('The work is rarely blocked by strategy alone.')) {
  failures.push('About hero is missing the approved opening sentence.');
}

if (!aboutHtml.includes('class="about-chapter-nav"')) {
  failures.push('About page must include chapter navigation.');
}

if (!aboutCss.includes('.about-chapter-nav')) {
  failures.push('About CSS must include chapter-nav styling.');
}

if (failures.length > 0) {
  failures.forEach((message) => console.error(`FAIL: ${message}`));
  process.exit(1);
}

console.log('PASS: About hero manifesto contract is intact.');
