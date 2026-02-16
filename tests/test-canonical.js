#!/usr/bin/env node
/**
 * Test: canonical URLs match expected clean page paths.
 */
const fs = require('fs');
const path = require('path');

const checks = [
  { file: 'index.html', canonical: 'https://romanbediner.com/' },
  { file: 'about/index.html', canonical: 'https://romanbediner.com/about' },
  { file: 'services/index.html', canonical: 'https://romanbediner.com/services' },
  { file: 'connect/index.html', canonical: 'https://romanbediner.com/contact' },
  { file: 'contact/index.html', canonical: 'https://romanbediner.com/contact' },
  { file: 'insights/index.html', canonical: 'https://romanbediner.com/insights' }
];

let failures = 0;
for (const check of checks) {
  const file = path.resolve(__dirname, '..', check.file);
  const html = fs.readFileSync(file, 'utf8');
  const match = html.match(/<link rel="canonical" href="([^"]+)"\s*\/>/i);
  if (!match || match[1] !== check.canonical) {
    failures += 1;
    console.error(`FAIL: canonical mismatch in ${check.file} (expected ${check.canonical})`);
  }
}

if (failures > 0) {
  process.exit(1);
}

console.log('PASS: canonical tags match clean URL paths.');
