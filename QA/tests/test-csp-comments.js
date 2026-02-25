#!/usr/bin/env node
/**
 * Invariant:
 * - Canonical pages must document CSP intent next to the CSP meta tag.
 * Why this exists:
 * - Prevents accidental policy weakening during edits and reinforces CI enforcement behavior.
 * What breaks if it fails:
 * - CI blocks merges where CSP rationale is missing from canonical page templates.
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..', '..');
const pages = [
  path.join(ROOT, 'index.html'),
  path.join(ROOT, 'about', 'index.html'),
  path.join(ROOT, 'services', 'index.html'),
  path.join(ROOT, 'insights', 'index.html'),
  path.join(ROOT, 'connect', 'index.html')
];

let hasError = false;
for (const page of pages) {
  const html = fs.readFileSync(page, 'utf8');
  const hasComment = /CSP architecture:[\s\S]*inline scripts are forbidden[\s\S]*CI fails on CSP runtime violations/i.test(html);
  const hasMeta = /<meta http-equiv="Content-Security-Policy"/i.test(html);
  if (!hasMeta) {
    hasError = true;
    console.error(`FAIL: missing CSP meta tag in ${path.relative(ROOT, page)}`);
  }
  if (!hasComment) {
    hasError = true;
    console.error(`FAIL: missing CSP rationale comment in ${path.relative(ROOT, page)}`);
  }
}

if (hasError) {
  process.exit(1);
}

console.log('PASS: CSP rationale comments are present on canonical pages.');
