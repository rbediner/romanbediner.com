#!/usr/bin/env node
/**
 * URL architecture and page policy checks.
 */
const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const canonicalPages = [
  'index.html',
  'about/index.html',
  'services/index.html',
  'connect/index.html',
  'about/insights/index.html'
];

let failures = 0;

for (const rel of canonicalPages) {
  const file = path.join(root, rel);
  const html = fs.readFileSync(file, 'utf8');

  // No legacy extension links in navigation.
  const navBlocks = html.match(/<nav[\s\S]*?<\/nav>/gi) || [];
  for (const block of navBlocks) {
    if (/href="[^"]*\.html"/i.test(block)) {
      failures += 1;
      console.error(`FAIL: .html nav link found in ${rel}`);
    }
    if (/href="\/contact\//i.test(block) || /href="\/insights\//i.test(block)) {
      failures += 1;
      console.error(`FAIL: legacy nav route found in ${rel}`);
    }
  }

  // Shared style and GA bootstrap must be present.
  if (!html.includes('href="/styles/site.css"')) {
    failures += 1;
    console.error(`FAIL: missing /styles/site.css in ${rel}`);
  }
  if (!html.includes('src="/scripts/ga4.js"')) {
    failures += 1;
    console.error(`FAIL: missing /scripts/ga4.js include in ${rel}`);
  }
  if (/<style>/i.test(html)) {
    failures += 1;
    console.error(`FAIL: inline <style> block found in ${rel}`);
  }
}

// Route existence policy.
if (!fs.existsSync(path.join(root, 'about', 'insights', 'index.html'))) {
  failures += 1;
  console.error('FAIL: /about/insights/ page is missing.');
}
if (fs.existsSync(path.join(root, 'insights', 'index.html'))) {
  failures += 1;
  console.error('FAIL: legacy /insights/ root page still exists.');
}
if (fs.existsSync(path.join(root, 'contact', 'index.html'))) {
  failures += 1;
  console.error('FAIL: legacy /contact/ page still exists.');
}
if (fs.existsSync(path.join(root, 'home', 'index.html'))) {
  failures += 1;
  console.error('FAIL: legacy /home/ route still exists.');
}

// /about/insights/ must not appear in main desktop navigation.
const aboutHtml = fs.readFileSync(path.join(root, 'about', 'index.html'), 'utf8');
const desktopNavMatch = aboutHtml.match(/<nav class="site-nav"[^>]*>([\s\S]*?)<\/nav>/i);
if (desktopNavMatch && /\/about\/insights\//.test(desktopNavMatch[1])) {
  failures += 1;
  console.error('FAIL: /about/insights/ appears in main navigation.');
}

if (failures > 0) {
  process.exit(1);
}

console.log('PASS: clean URL and route architecture checks passed.');
