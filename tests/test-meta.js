#!/usr/bin/env node
/**
 * Test: key pages have unique titles and normalized metadata descriptions.
 */
const fs = require('fs');
const path = require('path');

const pages = [
  'index.html',
  'about/index.html',
  'services/index.html',
  'connect/index.html',
  'contact/index.html',
  'insights/index.html'
];

const seenTitles = new Set();
let failures = 0;
const phrase = 'Productizing operations for modern, AI-enabled work';

for (const rel of pages) {
  const file = path.resolve(__dirname, '..', rel);
  const html = fs.readFileSync(file, 'utf8');
  const titleMatch = html.match(/<title>([^<]+)<\/title>/i);
  const descMatch = html.match(/<meta name="description" content="([^"]+)"\s*\/>/i);
  const ogDescMatch = html.match(/<meta property="og:description" content="([^"]+)"\s*\/>/i);
  const twDescMatch = html.match(/<meta name="twitter:description" content="([^"]+)"\s*\/>/i);

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
  if (!description.includes(phrase)) {
    failures += 1;
    console.error(`FAIL: normalized core phrase missing in description for ${rel}`);
  }

  // Redirect-only support page intentionally does not include OG/Twitter tags.
  if (rel !== 'contact/index.html') {
    if (!ogDescMatch || !twDescMatch) {
      failures += 1;
      console.error(`FAIL: missing OG or Twitter description in ${rel}`);
      continue;
    }

    if (ogDescMatch[1].trim() !== description || twDescMatch[1].trim() !== description) {
      failures += 1;
      console.error(`FAIL: OG/Twitter descriptions do not match meta description in ${rel}`);
    }
  }

  seenTitles.add(title);
}

if (failures > 0) {
  process.exit(1);
}

console.log('PASS: normalized metadata descriptions and unique titles.');
