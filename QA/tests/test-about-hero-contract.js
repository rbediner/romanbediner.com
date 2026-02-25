#!/usr/bin/env node
/**
 * Invariant:
 * - Regression guardrails for test-about-hero-contract.js.
 * Why this exists:
 * - Prevents architectural drift in routing, analytics, CSP, metadata, or shared UI contracts.
 * What breaks if it fails:
 * - CI blocks deployment to prevent production regressions.
 */
/**
 * Guardrail: About hero must keep the manifesto-only contract.
 * This prevents regressions that reintroduce legacy headings or profile photos.
 */
const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..', '..');
const aboutHtml = fs.readFileSync(path.join(root, 'about/index.html'), 'utf8');
const aboutCss = fs.readFileSync(path.join(root, 'styles/about.css'), 'utf8');
const siteCss = fs.readFileSync(path.join(root, 'styles/site.css'), 'utf8');

const failures = [];

for (const required of [
  'class="container"',
  'class="about-hero-refactored"',
  'class="page-title"',
  'class="shelf-callout"',
  'class="shelf-border"',
  'class="shelf-content"'
]) {
  if (!aboutHtml.includes(required)) {
    failures.push(`Missing About hero contract marker: ${required}`);
  }
}

if (aboutHtml.includes('class="about-photo-wrapper"') || aboutHtml.includes('class="hero-photo"')) {
  failures.push('About hero must not include a profile photo.');
}

if (aboutHtml.includes('About Roman Bediner')) {
  failures.push('Legacy About heading copy should not appear in the manifesto hero.');
}

for (const cssNeedle of ['.about-hero-refactored', '.about-timeline', '.philosophy-stack']) {
  if (!aboutCss.includes(cssNeedle)) {
    failures.push(`Missing About CSS guardrail: ${cssNeedle}`);
  }
}

for (const sharedNeedle of [
  '.container,\n.about-container',
  '.page-title',
  '.shelf-callout',
  '.shelf-border',
  '.shelf-content',
  '.lede-description',
  '.section-divider'
]) {
  if (!siteCss.includes(sharedNeedle)) {
    failures.push(`Missing shared CSS guardrail in site.css: ${sharedNeedle}`);
  }
}

if (failures.length > 0) {
  for (const failure of failures) {
    console.error(`FAIL: ${failure}`);
  }
  process.exit(1);
}

console.log('PASS: About hero manifesto contract is intact.');