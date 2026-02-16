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
  path.resolve(__dirname, '..', 'insights', 'index.html')
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

  // GA4 validation: source and config should appear exactly once on canonical pages.
  const gaSourceCount = (html.match(/https:\/\/www\.googletagmanager\.com\/gtag\/js\?id=G-7LM57EMR6Y/g) || []).length;
  const gaConfigCount = (html.match(/gtag\('config', 'G-7LM57EMR6Y', \{/g) || []).length;
  if (gaSourceCount !== 1 || gaConfigCount !== 1) {
    hasError = true;
    console.error(`GA4 source/config count invalid in ${page} (source=${gaSourceCount}, config=${gaConfigCount})`);
  }

  // GA4 configuration requirements: privacy and transport settings must be present.
  if (!/anonymize_ip:\s*true/.test(html) || !/transport_type:\s*'beacon'/.test(html)) {
    hasError = true;
    console.error(`GA4 config missing anonymize_ip or beacon transport in ${page}`);
  }

  // Legacy analytics identifiers must not appear.
  const allMeasurementIds = html.match(/G-[A-Z0-9]{6,}/gi) || [];
  const unexpectedMeasurementIds = allMeasurementIds.filter((id) => id !== 'G-7LM57EMR6Y');
  if (unexpectedMeasurementIds.length > 0) {
    hasError = true;
    console.error(`Unexpected analytics identifier(s) found in ${page}: ${unexpectedMeasurementIds.join(', ')}`);
  }
}

if (hasError) {
  process.exit(1);
}

console.log('Navigation link validation passed.');
