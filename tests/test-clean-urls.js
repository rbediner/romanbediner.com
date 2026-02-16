#!/usr/bin/env node
/**
 * Test: no legacy route references remain in navigation, clean URLs are enforced,
 * About links to /about/insights/ in content, and canonical pages include one GA4 snippet.
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

let failures = 0;
for (const page of pages) {
  const html = fs.readFileSync(page, 'utf8');
  // GA4 include check at page level.
  const gaScriptMatches = html.match(new RegExp(`https://www\\.googletagmanager\\.com/gtag/js\\?id=${measurementId}`, 'g')) || [];
  if (gaScriptMatches.length !== 1) {
    failures += 1;
    console.error(`FAIL: expected exactly one GA4 script include in ${page}`);
  }

  const navMatches = html.match(/<nav[\s\S]*?<\/nav>/gi) || [];
  for (const block of navMatches) {
    if (/href="[^"]*\.html"/i.test(block)) {
      failures += 1;
      console.error(`FAIL: .html nav link found in ${page}`);
    }
    // Route guardrails: /contact/ and root /insights/ should never appear in nav.
    if (/\/contact\//i.test(block) || /href="\/insights\/"/i.test(block)) {
      failures += 1;
      console.error(`FAIL: legacy nav route found in ${page}`);
    }
  }
}

// Route existence checks (static equivalent of 200/404 expectations).
const insightsPage = path.resolve(__dirname, '..', 'about', 'insights', 'index.html');
const removedInsightsRoot = path.resolve(__dirname, '..', 'insights', 'index.html');
const removedContact = path.resolve(__dirname, '..', 'contact', 'index.html');
if (!fs.existsSync(insightsPage)) {
  failures += 1;
  console.error('FAIL: /about/insights/ page is missing.');
}
if (fs.existsSync(removedInsightsRoot)) {
  failures += 1;
  console.error('FAIL: legacy /insights/ root page still exists.');
}
if (fs.existsSync(removedContact)) {
  failures += 1;
  console.error('FAIL: legacy /contact/ page still exists.');
}

// About content must include the insights link.
const aboutHtml = fs.readFileSync(path.resolve(__dirname, '..', 'about', 'index.html'), 'utf8');
if (!/href="\/about\/insights\/"/.test(aboutHtml)) {
  failures += 1;
  console.error('FAIL: About page does not link to /about/insights/.');
}
// Insights should not be in main desktop nav.
const desktopNavMatch = aboutHtml.match(/<nav class="site-nav">([\s\S]*?)<\/nav>/i);
if (desktopNavMatch && /\/about\/insights\//.test(desktopNavMatch[1])) {
  failures += 1;
  console.error('FAIL: /about/insights/ appears in main navigation.');
}

if (failures > 0) {
  process.exit(1);
}

console.log('PASS: clean URL navigation links.');
