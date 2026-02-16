#!/usr/bin/env node
/**
 * GA4 installation validation for canonical pages.
 * Enforces production measurement ID and required config options.
 */
const fs = require('fs');
const path = require('path');

const MEASUREMENT_ID = 'G-DVHD0KL633';
const CANONICAL_PAGES = [
  'index.html',
  'about/index.html',
  'services/index.html',
  'connect/index.html',
  'about/insights/index.html'
];

let failures = 0;

for (const rel of CANONICAL_PAGES) {
  const file = path.resolve(__dirname, '..', rel);
  const html = fs.readFileSync(file, 'utf8');

  const sourceMatches = html.match(new RegExp(`https://www\\.googletagmanager\\.com/gtag/js\\?id=${MEASUREMENT_ID}`, 'g')) || [];
  const configMatches = html.match(new RegExp(`gtag\\('config', '${MEASUREMENT_ID}'`, 'g')) || [];

  if (sourceMatches.length !== 1) {
    failures += 1;
    console.error(`FAIL: expected exactly one GA source include in ${rel}`);
  }
  if (configMatches.length !== 1) {
    failures += 1;
    console.error(`FAIL: expected exactly one GA config call in ${rel}`);
  }

  // Legacy/alternate GA IDs are rejected by allowing only the target GA4 measurement ID.
  const otherMeasurementIds = html.match(/G-[A-Z0-9]{6,}/gi) || [];
  const unexpectedIds = otherMeasurementIds.filter((id) => id.toUpperCase() !== MEASUREMENT_ID);
  if (unexpectedIds.length > 0) {
    failures += 1;
    console.error(`FAIL: unexpected analytics IDs in ${rel}: ${unexpectedIds.join(', ')}`);
  }
}

if (failures > 0) {
  process.exit(1);
}

console.log('PASS: GA4 installation verified on all canonical pages.');
