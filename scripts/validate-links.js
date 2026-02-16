#!/usr/bin/env node
/**
 * Validates that navigation links use clean URLs and expected primary paths.
 * Also validates GA4 installation consistency on canonical pages.
 */
const fs = require('fs');
const path = require('path');

const pages = [
  path.resolve(__dirname, '..', 'index.html'),
  path.resolve(__dirname, '..', 'about', 'index.html'),
  path.resolve(__dirname, '..', 'services', 'index.html'),
  path.resolve(__dirname, '..', 'connect', 'index.html'),
  // Route refactor: canonical insights page moved under /about/insights/.
  path.resolve(__dirname, '..', 'about', 'insights', 'index.html')
];

const measurementId = 'G-DVHD0KL633';
// Refactor guardrails: reject legacy .html links, removed /contact/ route, and removed root /insights/ route.
const disallowed = [/href="[^\"]*\.html"/i, /\/contact\//i, /href="\/insights\/"/i];
let hasError = false;

for (const page of pages) {
  const html = fs.readFileSync(page, 'utf8');
  for (const pattern of disallowed) {
    if (pattern.test(html)) {
      hasError = true;
      console.error(`Disallowed link pattern found in ${page}: ${pattern}`);
    }
  }

  // GA4 validation: source and config should appear exactly once on canonical pages.
  const gaSourceCount = (html.match(new RegExp(`https://www\\.googletagmanager\\.com/gtag/js\\?id=${measurementId}`, 'g')) || []).length;
  const gaConfigCount = (html.match(new RegExp(`gtag\\('config', '${measurementId}'\\)`, 'g')) || []).length;
  if (gaSourceCount !== 1 || gaConfigCount !== 1) {
    hasError = true;
    console.error(`GA4 source/config count invalid in ${page} (source=${gaSourceCount}, config=${gaConfigCount})`);
  }

  // Legacy analytics identifiers must not appear.
  const allMeasurementIds = html.match(/G-[A-Z0-9]{6,}/gi) || [];
  const unexpectedMeasurementIds = allMeasurementIds.filter((id) => id !== measurementId);
  if (unexpectedMeasurementIds.length > 0) {
    hasError = true;
    console.error(`Unexpected analytics identifier(s) found in ${page}: ${unexpectedMeasurementIds.join(', ')}`);
  }
}

if (hasError) {
  process.exit(1);
}

console.log('Navigation link validation passed.');
