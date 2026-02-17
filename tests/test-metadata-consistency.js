#!/usr/bin/env node
/**
 * Test: enforce metadata consistency for homepage and insights,
 * prevent title collisions, ban em dashes in HTML, and require
 * exactly one canonical URL declaration per HTML page.
 */
const fs = require('fs');
const path = require('path');

const homepagePath = path.resolve(__dirname, '..', 'index.html');
const insightsPath = path.resolve(__dirname, '..', 'about', 'insights', 'index.html');

const expectedHomepageTitle = 'Roman Bediner | Operations & AI Transformation Leader';
const expectedInsightsTitle = 'Insights on AI-Enabled Operations | Roman Bediner';

// Canonical HTML pages used by this static site.
const htmlPages = [
  'index.html',
  'about/index.html',
  'services/index.html',
  'connect/index.html',
  'about/insights/index.html',
  'home/index.html'
];

function extractSingle(matchRegex, html, label, file, failures) {
  const matches = [...html.matchAll(matchRegex)].map((m) => m[1].trim());
  if (matches.length !== 1) {
    failures.count += 1;
    console.error(`FAIL: expected exactly one ${label} in ${file}`);
    return null;
  }
  return matches[0];
}

let failures = { count: 0 };

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

// Ensure no other page reuses the homepage title string.
for (const relPath of htmlPages) {
  const filePath = path.resolve(__dirname, '..', relPath);
  const html = fs.readFileSync(filePath, 'utf8');
  const title = extractSingle(/<title>([^<]+)<\/title>/gi, html, 'title', relPath, failures);
  if (relPath !== 'index.html' && title === expectedHomepageTitle) {
    failures.count += 1;
    console.error(`FAIL: ${relPath} duplicates homepage title`);
  }
}

// Enforce one canonical declaration and no em dashes for all HTML pages.
for (const relPath of htmlPages) {
  const filePath = path.resolve(__dirname, '..', relPath);
  const html = fs.readFileSync(filePath, 'utf8');

  const canonicalMatches = html.match(/<link rel="canonical" href="[^"]+"\s*\/>/gi) || [];
  if (canonicalMatches.length !== 1) {
    failures.count += 1;
    console.error(`FAIL: expected exactly one canonical tag in ${relPath}`);
  }

  if (/—/.test(html)) {
    failures.count += 1;
    console.error(`FAIL: em dash found in ${relPath}`);
  }
}

if (failures.count > 0) {
  process.exit(1);
}

console.log('PASS: metadata consistency checks passed.');
