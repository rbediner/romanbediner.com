#!/usr/bin/env node
/**
 * Test: no .html references remain in primary page navigation, no /contact route references exist,
 * and canonical pages include exactly one GA4 script include.
 */
const fs = require('fs');
const path = require('path');

const pages = [
  path.resolve(__dirname, '..', 'index.html'),
  path.resolve(__dirname, '..', 'about', 'index.html'),
  path.resolve(__dirname, '..', 'services', 'index.html'),
  path.resolve(__dirname, '..', 'connect', 'index.html'),
  path.resolve(__dirname, '..', 'insights', 'index.html')
];

let failures = 0;
for (const page of pages) {
  const html = fs.readFileSync(page, 'utf8');
  // GA4 include check at page level.
  const gaScriptMatches = html.match(/https:\/\/www\.googletagmanager\.com\/gtag\/js\?id=G-7LM57EMR6Y/g) || [];
  if (gaScriptMatches.length !== 1) {
    failures += 1;
    console.error(`FAIL: expected exactly one GA4 script include in ${page}`);
  }

  const navMatches = html.match(/<nav[\s\S]*?<\/nav>/gi) || [];
  for (const block of navMatches) {
    if (/href="[^"]*\.html"/i.test(block)) {
      failures += 1;
      console.error(`FAIL: .html nav link found in ${page}`);
    }
    // Refactor assertion: legacy /contact route must not appear in any nav block.
    if (/\/contact\//i.test(block)) {
      failures += 1;
      console.error(`FAIL: legacy /contact nav link found in ${page}`);
    }
  }
}

if (failures > 0) {
  process.exit(1);
}

console.log('PASS: clean URL navigation links.');
