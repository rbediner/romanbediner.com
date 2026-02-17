#!/usr/bin/env node
/**
 * Validates canonical page links, route policy, shared CSS usage, and GA bootstrap policy.
 */
const fs = require('fs');
const path = require('path');

const pages = [
  path.resolve(__dirname, '..', 'index.html'),
  path.resolve(__dirname, '..', 'about', 'index.html'),
  path.resolve(__dirname, '..', 'services', 'index.html'),
  path.resolve(__dirname, '..', 'connect', 'index.html'),
  path.resolve(__dirname, '..', 'about', 'insights', 'index.html')
];

const measurementId = 'G-DVHD0KL633';
const disallowed = [/href="[^\"]*\.html"/i, /href="\/contact\//i, /href="\/insights\//i];
let hasError = false;

for (const page of pages) {
  const html = fs.readFileSync(page, 'utf8');

  for (const pattern of disallowed) {
    if (pattern.test(html)) {
      hasError = true;
      console.error(`Disallowed link pattern found in ${page}: ${pattern}`);
    }
  }

  if (!html.includes('href="/styles/site.css"')) {
    hasError = true;
    console.error(`Missing shared stylesheet include in ${page}`);
  }

  const gaMetaCount = (html.match(new RegExp(`<meta name="ga4-measurement-id" content="${measurementId}" \/>`, 'g')) || []).length;
  const gaScriptCount = (html.match(/<script src="\/scripts\/ga4\.js" defer><\/script>/g) || []).length;
  const inlineConfigCount = (html.match(/gtag\('config'/g) || []).length;
  if (gaMetaCount !== 1 || gaScriptCount !== 1 || inlineConfigCount !== 0) {
    hasError = true;
    console.error(`GA policy invalid in ${page} (meta=${gaMetaCount}, bootstrap=${gaScriptCount}, inlineConfig=${inlineConfigCount})`);
  }

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

console.log('Navigation and GA policy validation passed.');
