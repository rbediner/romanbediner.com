#!/usr/bin/env node
/**
 * Test: canonical URLs match expected clean page paths and GA4 config is present once.
 */
const fs = require('fs');
const path = require('path');

const checks = [
  { file: 'index.html', canonical: 'https://romanbediner.com/' },
  { file: 'about/index.html', canonical: 'https://romanbediner.com/about/' },
  { file: 'services/index.html', canonical: 'https://romanbediner.com/services/' },
  // Refactor assertion: /connect/ is now the only canonical contact route.
  { file: 'connect/index.html', canonical: 'https://romanbediner.com/connect/' },
  // Route refactor: Insights canonical is under About.
  { file: 'about/insights/index.html', canonical: 'https://romanbediner.com/about/insights/' }
];
const measurementId = 'G-DVHD0KL633';

let failures = 0;
for (const check of checks) {
  const file = path.resolve(__dirname, '..', check.file);
  const html = fs.readFileSync(file, 'utf8');
  const match = html.match(/<link rel="canonical" href="([^"]+)"\s*\/>/i);
  if (!match || match[1] !== check.canonical) {
    failures += 1;
    console.error(`FAIL: canonical mismatch in ${check.file} (expected ${check.canonical})`);
  }
  // SEO consistency: og:url must mirror canonical URL.
  const ogUrlMatch = html.match(/<meta property="og:url" content="([^"]+)"\s*\/>/i);
  if (!ogUrlMatch || ogUrlMatch[1] !== check.canonical) {
    failures += 1;
    console.error(`FAIL: og:url mismatch in ${check.file} (expected ${check.canonical})`);
  }

  // GA4 config assertion: each canonical page has exactly one config entry.
  const gaConfigMatches = html.match(new RegExp(`gtag\\('config', '${measurementId}'\\)`, 'g')) || [];
  if (gaConfigMatches.length !== 1) {
    failures += 1;
    console.error(`FAIL: expected exactly one GA4 config call in ${check.file}`);
  }
}

if (failures > 0) {
  process.exit(1);
}

console.log('PASS: canonical tags match clean URL paths.');
