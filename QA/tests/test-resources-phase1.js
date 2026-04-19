#!/usr/bin/env node
/**
 * Invariant:
 * - Website V2 Phase 1 resource routes must ship with the expected route, CTA,
 *   and asset contracts.
 * Why this exists:
 * - Prevents partial launches where nav changes land without the summary page,
 *   PDF asset, or slide preview system.
 * What breaks if it fails:
 * - CI blocks deployment to prevent incomplete resource rollouts.
 */
const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..', '..');
const resourcesHtml = fs.readFileSync(path.join(root, 'resources', 'index.html'), 'utf8');
const summaryHtml = fs.readFileSync(
  path.join(root, 'resources', 'ai-enabled-operations-framework-summary', 'index.html'),
  'utf8'
);

const requiredFiles = [
  'assets/resources/framework-summary/ai-enabled-operations-framework-summary.pdf',
  'assets/resources/framework-summary/slides/slide-01.png',
  'assets/resources/framework-summary/slides/slide-08.png',
  'styles/resources.css',
  'scripts/runtime/resources-carousel.js'
];

let failures = 0;

for (const rel of requiredFiles) {
  if (!fs.existsSync(path.join(root, rel))) {
    failures += 1;
    console.error(`FAIL: missing required Website V2 Phase 1 asset ${rel}`);
  }
}

if (!resourcesHtml.includes('href="/resources/ai-enabled-operations-framework-summary/"')) {
  failures += 1;
  console.error('FAIL: /resources/ must link to the framework summary page.');
}

if (!summaryHtml.includes('Download PDF')) {
  failures += 1;
  console.error('FAIL: framework summary page is missing the Download PDF CTA.');
}

if (!summaryHtml.includes('Explore the Full Framework')) {
  failures += 1;
  console.error('FAIL: framework summary page is missing the Explore the Full Framework CTA.');
}

if (!summaryHtml.includes('href="/framework/"')) {
  failures += 1;
  console.error('FAIL: framework summary page must preserve a path back to /framework/.');
}

if (!summaryHtml.includes('href="/connect/"')) {
  failures += 1;
  console.error('FAIL: framework summary page must preserve a path to /connect/.');
}

if (!summaryHtml.includes('data-resource-carousel')) {
  failures += 1;
  console.error('FAIL: framework summary page is missing the slide carousel shell.');
}

const slideMatches = summaryHtml.match(/assets\/resources\/framework-summary\/slides\/slide-\d{2}\.png/g) || [];
if (slideMatches.length !== 8) {
  failures += 1;
  console.error('FAIL: framework summary page must reference exactly 8 slide preview images.');
}

if (failures > 0) {
  process.exit(1);
}

console.log('PASS: Website V2 Phase 1 resource route contract checks passed.');
