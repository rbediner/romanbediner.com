#!/usr/bin/env node
/**
 * Additional metadata guardrails.
 */
const fs = require('fs');
const path = require('path');

const homepagePath = path.resolve(__dirname, '..', 'index.html');
const insightsPath = path.resolve(__dirname, '..', 'about', 'insights', 'index.html');

const expectedHomepageTitle = 'Roman Bediner | Operations & AI Transformation Leader';
const expectedInsightsTitle = 'Insights on AI-Enabled Operations | Roman Bediner';

const htmlPages = [
  'index.html',
  'about/index.html',
  'services/index.html',
  'connect/index.html',
  'about/insights/index.html'
];

function extractSingle(regex, html, label, file, failures) {
  const matches = [...html.matchAll(regex)].map((m) => m[1].trim());
  if (matches.length !== 1) {
    failures.count += 1;
    console.error(`FAIL: expected exactly one ${label} in ${file}`);
    return null;
  }
  return matches[0];
}

const failures = { count: 0 };

const homepageHtml = fs.readFileSync(homepagePath, 'utf8');
const insightsHtml = fs.readFileSync(insightsPath, 'utf8');

const homepageTitle = extractSingle(/<title>([^<]+)<\/title>/gi, homepageHtml, 'title', 'index.html', failures);
const insightsTitle = extractSingle(/<title>([^<]+)<\/title>/gi, insightsHtml, 'title', 'about/insights/index.html', failures);

if (homepageTitle && homepageTitle !== expectedHomepageTitle) {
  failures.count += 1;
  console.error(`FAIL: homepage title mismatch. Expected "${expectedHomepageTitle}"`);
}
if (insightsTitle && insightsTitle !== expectedInsightsTitle) {
  failures.count += 1;
  console.error(`FAIL: insights title mismatch. Expected "${expectedInsightsTitle}"`);
}

for (const rel of htmlPages) {
  const html = fs.readFileSync(path.resolve(__dirname, '..', rel), 'utf8');
  const title = extractSingle(/<title>([^<]+)<\/title>/gi, html, 'title', rel, failures);
  if (rel !== 'index.html' && title === expectedHomepageTitle) {
    failures.count += 1;
    console.error(`FAIL: ${rel} duplicates homepage title`);
  }

  const canonicalMatches = html.match(/<link rel="canonical" href="[^"]+"\s*\/>/gi) || [];
  if (canonicalMatches.length !== 1) {
    failures.count += 1;
    console.error(`FAIL: expected exactly one canonical tag in ${rel}`);
  }

  if (/–|—/.test(html)) {
    failures.count += 1;
    console.error(`FAIL: en dash or em dash found in ${rel}`);
  }
}

if (failures.count > 0) {
  process.exit(1);
}

console.log('PASS: metadata consistency checks passed.');
