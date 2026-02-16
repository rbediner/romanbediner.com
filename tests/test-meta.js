#!/usr/bin/env node
/**
 * Test: key pages have unique titles, normalized metadata descriptions, and correct GA4 settings.
 */
const fs = require('fs');
const path = require('path');

const pages = [
  'index.html',
  'about/index.html',
  'services/index.html',
  'connect/index.html',
  'about/insights/index.html'
];

const seenTitles = new Set();
let failures = 0;
const phrase = 'Productizing operations for modern, AI-enabled work';
const measurementId = 'G-DVHD0KL633';

for (const rel of pages) {
  const file = path.resolve(__dirname, '..', rel);
  const html = fs.readFileSync(file, 'utf8');
  const titleMatch = html.match(/<title>([^<]+)<\/title>/i);
  const descMatch = html.match(/<meta name="description" content="([^"]+)"\s*\/>/i);
  const ogDescMatch = html.match(/<meta property="og:description" content="([^"]+)"\s*\/>/i);
  const twDescMatch = html.match(/<meta name="twitter:description" content="([^"]+)"\s*\/>/i);
  const gaSourceMatches = html.match(new RegExp(`https://www\\.googletagmanager\\.com/gtag/js\\?id=${measurementId}`, 'g')) || [];
  const gaConfigMatches = html.match(new RegExp(`gtag\\('config', '${measurementId}'\\)`, 'g')) || [];

  if (!titleMatch || !descMatch) {
    failures += 1;
    console.error(`FAIL: missing title or description in ${rel}`);
    continue;
  }

  const title = titleMatch[1].trim();
  const description = descMatch[1].trim();

  if (seenTitles.has(title)) {
    failures += 1;
    console.error(`FAIL: duplicate title detected in ${rel}`);
  }
  // Insights has its own page-specific description; all other primary pages should include the core phrase.
  if (!rel.includes('about/insights') && !description.includes(phrase)) {
    failures += 1;
    console.error(`FAIL: normalized core phrase missing in description for ${rel}`);
  }

  // Refactor assertion: metadata must not mention removed /contact route.
  if (/\/contact\//i.test(description)) {
    failures += 1;
    console.error(`FAIL: metadata still references /contact in ${rel}`);
  }

  if (!ogDescMatch || !twDescMatch) {
    failures += 1;
    console.error(`FAIL: missing OG or Twitter description in ${rel}`);
    continue;
  }

  if (ogDescMatch[1].trim() !== description || twDescMatch[1].trim() !== description) {
    failures += 1;
    console.error(`FAIL: OG/Twitter descriptions do not match meta description in ${rel}`);
  }

  // GA4 assertions: source/config present once, privacy and transport options set.
  if (gaSourceMatches.length !== 1) {
    failures += 1;
    console.error(`FAIL: GA4 source script missing or duplicated in ${rel}`);
  }
  if (gaConfigMatches.length !== 1) {
    failures += 1;
    console.error(`FAIL: GA4 config call missing or duplicated in ${rel}`);
  }
  const allMeasurementIds = html.match(/G-[A-Z0-9]{6,}/gi) || [];
  const unexpectedMeasurementIds = allMeasurementIds.filter((id) => id !== measurementId);
  if (unexpectedMeasurementIds.length > 0) {
    failures += 1;
    console.error(`FAIL: unexpected analytics identifier(s) found in ${rel}: ${unexpectedMeasurementIds.join(', ')}`);
  }

  seenTitles.add(title);
}

if (failures > 0) {
  process.exit(1);
}

console.log('PASS: normalized metadata descriptions and unique titles.');
