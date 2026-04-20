#!/usr/bin/env node
/**
 * Invariant:
 * - Regression guardrails for test-route-metadata-parity.js.
 * Why this exists:
 * - Prevents architectural drift in routing, analytics, CSP, metadata, or shared UI contracts.
 * What breaks if it fails:
 * - CI blocks deployment to prevent production regressions.
 */
/**
 * Metadata consistency checks.
 */
const fs = require('fs');
const path = require('path');

const pages = [
  'index.html',
  'about/index.html',
  'services/index.html',
  'connect/index.html',
  'framework/index.html',
  'resources/index.html',
  'resources/ai-enabled-operations-framework-summary/index.html',
  'resources/ai-enabled-operations-dashboard/index.html'
];

const seenTitles = new Set();
let failures = 0;

for (const rel of pages) {
  const html = fs.readFileSync(path.resolve(__dirname, '..', '..', rel), 'utf8');

  const titleMatch = html.match(/<title>([^<]+)<\/title>/i);
  const descMatch = html.match(/<meta name="description" content="([^"]+)"\s*\/>/i);
  const ogDescMatch = html.match(/<meta property="og:description" content="([^"]+)"\s*\/>/i);
  const twDescMatch = html.match(/<meta name="twitter:description" content="([^"]+)"\s*\/>/i);

  if (!titleMatch || !descMatch || !ogDescMatch || !twDescMatch) {
    failures += 1;
    console.error(`FAIL: missing metadata tags in ${rel}`);
    continue;
  }

  const title = titleMatch[1].trim();
  const description = descMatch[1].trim();

  if (seenTitles.has(title)) {
    failures += 1;
    console.error(`FAIL: duplicate title in ${rel}`);
  }
  seenTitles.add(title);

  if (description.length < 40) {
    failures += 1;
    console.error(`FAIL: description appears too short in ${rel}`);
  }

  if (description !== ogDescMatch[1].trim() || description !== twDescMatch[1].trim()) {
    failures += 1;
    console.error(`FAIL: description mismatch across meta/OG/Twitter in ${rel}`);
  }

  // Policy checks.
  if (/\/contact\//i.test(description)) {
    failures += 1;
    console.error(`FAIL: metadata references /contact/ in ${rel}`);
  }
  const htmlWithoutAllowedFooterDash = html.replace(
    '<p class="footer-quote-author">— Walt Disney</p>',
    ""
  );
  if (/–|—/.test(htmlWithoutAllowedFooterDash)) {
    failures += 1;
    console.error(`FAIL: en dash or em dash found in ${rel}`);
  }
}

if (failures > 0) {
  process.exit(1);
}

console.log('PASS: metadata consistency checks passed.');
