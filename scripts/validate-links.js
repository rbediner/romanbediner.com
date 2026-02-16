#!/usr/bin/env node
/**
 * Validates that navigation links use clean URLs and expected primary paths.
 */
const fs = require('fs');
const path = require('path');

const pages = [
  path.resolve(__dirname, '..', 'index.html'),
  path.resolve(__dirname, '..', 'about', 'index.html'),
  path.resolve(__dirname, '..', 'services', 'index.html'),
  path.resolve(__dirname, '..', 'connect', 'index.html')
];

// Refactor guardrail: reject legacy .html nav links and removed /contact route references.
const disallowed = [/href="[^\"]*\.html"/i, /\/contact\//i];
let hasError = false;

for (const page of pages) {
  const html = fs.readFileSync(page, 'utf8');
  for (const pattern of disallowed) {
    if (pattern.test(html)) {
      hasError = true;
      console.error(`Disallowed link pattern found in ${page}: ${pattern}`);
    }
  }
}

if (hasError) {
  process.exit(1);
}

console.log('Navigation link validation passed.');
