#!/usr/bin/env node
/**
 * Guardrail: About hero must keep the manifesto-only contract.
 * This prevents regressions that reintroduce legacy headings or profile photos.
 */
const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..', '..');
const aboutHtml = fs.readFileSync(path.join(root, 'about/index.html'), 'utf8');
const aboutCss = fs.readFileSync(path.join(root, 'styles/about.css'), 'utf8');

const failures = [];

for (const required of [
  'class="about-container"',
  'class="about-hero"',
  'class="about-text-content"',
  'class="manifesto-h1"'
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

for (const cssNeedle of [
  'body .about-container',
  '.about-hero',
  'display: block !important',
  '.about-timeline',
  '.about-main .section:has(> #professional-arc:first-child)'
]) {
  if (!aboutCss.includes(cssNeedle)) {
    failures.push(`Missing About CSS guardrail: ${cssNeedle}`);
  }
}

if (failures.length > 0) {
  for (const failure of failures) {
    console.error(`FAIL: ${failure}`);
  }
  process.exit(1);
}

console.log('PASS: About hero manifesto contract is intact.');
