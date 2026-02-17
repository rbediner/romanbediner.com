#!/usr/bin/env node
/**
 * GA4 architecture checks.
 * Enforces meta-based measurement ID + shared /scripts/ga4.js bootstrap.
 */
const fs = require('fs');
const path = require('path');

const MEASUREMENT_ID = 'G-DVHD0KL633';
const PAGES = [
  'index.html',
  'about/index.html',
  'services/index.html',
  'connect/index.html',
  'about/insights/index.html'
];

let failures = 0;

for (const rel of PAGES) {
  const html = fs.readFileSync(path.resolve(__dirname, '..', rel), 'utf8');

  const metaMatches = html.match(new RegExp(`<meta name="ga4-measurement-id" content="${MEASUREMENT_ID}" \/>`, 'g')) || [];
  const bootstrapMatches = html.match(/<script src="\/scripts\/ga4\.js" defer><\/script>/g) || [];
  const inlineConfigMatches = html.match(/gtag\('config'/g) || [];
  const inlineDataLayerMatches = html.match(/window\.dataLayer\s*=\s*window\.dataLayer/g) || [];

  if (metaMatches.length !== 1) {
    failures += 1;
    console.error(`FAIL: expected one ga4-measurement-id meta tag in ${rel}`);
  }
  if (bootstrapMatches.length !== 1) {
    failures += 1;
    console.error(`FAIL: expected one /scripts/ga4.js include in ${rel}`);
  }
  if (inlineConfigMatches.length > 0 || inlineDataLayerMatches.length > 0) {
    failures += 1;
    console.error(`FAIL: inline GA config/dataLayer script found in ${rel}`);
  }

  const allMeasurementIds = html.match(/G-[A-Z0-9]{6,}/gi) || [];
  const unexpectedIds = allMeasurementIds.filter((id) => id.toUpperCase() !== MEASUREMENT_ID);
  if (unexpectedIds.length > 0) {
    failures += 1;
    console.error(`FAIL: unexpected GA IDs in ${rel}: ${unexpectedIds.join(', ')}`);
  }
}

if (failures > 0) {
  process.exit(1);
}

console.log('PASS: GA4 meta/bootstrap architecture checks passed.');
