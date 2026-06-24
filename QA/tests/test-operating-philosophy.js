#!/usr/bin/env node
/**
 * Invariant:
 * - About page operating-philosophy close must remain in its simplified approved form.
 * Why this exists:
 * - Protects the new closing section from drifting back toward the removed card-based layout.
 * What breaks if it fails:
 * - CI blocks deployment to prevent operating-philosophy structure or styling regressions.
 */
const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..', '..');
const aboutHtml = fs.readFileSync(path.join(root, 'about/index.html'), 'utf8');
const aboutCss = fs.readFileSync(path.join(root, 'styles/about.css'), 'utf8');

const failures = [];

if (!aboutHtml.includes('id="operating-philosophy"')) {
  failures.push('About page is missing the operating-philosophy section.');
}

for (const phrase of [
  'The strongest operating systems make execution visible.',
  'They clarify how work enters the organization, where ownership changes, which decisions require human judgment, what signals matter, and where coordination repeatedly breaks down.',
  'The objective is not more process. It is a durable operating system that reduces dependence on heroics, strengthens accountability, and allows the organization to scale with greater clarity and control.'
]) {
  if (!aboutHtml.includes(phrase)) {
    failures.push(`Operating Philosophy missing required copy: ${phrase}`);
  }
}

if (!aboutCss.includes('.about-philosophy-copy h2')) {
  failures.push('About CSS must style the new Operating Philosophy heading.');
}

if (failures.length > 0) {
  failures.forEach((message) => console.error(`FAIL: ${message}`));
  process.exit(1);
}

console.log('PASS: operating philosophy structure and styling checks passed.');
