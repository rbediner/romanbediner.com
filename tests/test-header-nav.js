#!/usr/bin/env node
/**
 * Header and navigation structure consistency checks.
 */
const fs = require('fs');
const path = require('path');

const pages = [
  'index.html',
  'about/index.html',
  'services/index.html',
  'connect/index.html',
  'insights/index.html'
];

function normalizeHeader(html) {
  const headerMatch = html.match(/<header class="site-header">([\s\S]*?)<\/header>/i);
  if (!headerMatch) {
    return null;
  }

  return headerMatch[0]
    .replace(/src="[^"]+mainlogo-blue-white\.jpg"/g, 'src="LOGO"')
    .replace(/\s+/g, ' ')
    .trim();
}

let failures = 0;
let baseline = null;

for (const rel of pages) {
  const html = fs.readFileSync(path.resolve(__dirname, '..', rel), 'utf8');
  const normalized = normalizeHeader(html);
  const navOrderRegex = /<nav class="site-nav"[^>]*>\s*<a href="\/">Home<\/a>\s*<a href="\/about\/">About<\/a>\s*<a href="\/services\/">Services<\/a>\s*<a href="\/insights\/">Insights<\/a>\s*<a href="\/connect\/">Connect<\/a>\s*<\/nav>/i;

  if (!normalized) {
    failures += 1;
    console.error(`FAIL: missing site header in ${rel}`);
    continue;
  }

  if (!html.includes('class="site-nav" aria-label="Primary"')) {
    failures += 1;
    console.error(`FAIL: desktop nav aria label mismatch in ${rel}`);
  }
  if (!html.includes('id="mobile-nav" class="mobile-nav" aria-label="Mobile navigation"')) {
    failures += 1;
    console.error(`FAIL: mobile nav aria label mismatch in ${rel}`);
  }
  if (!navOrderRegex.test(html)) {
    failures += 1;
    console.error(`FAIL: navigation order must be Home, About, Services, Insights, Connect in ${rel}`);
  }

  if (!baseline) {
    baseline = normalized;
  } else if (baseline !== normalized) {
    failures += 1;
    console.error(`FAIL: header structure drift detected in ${rel}`);
  }
}

if (failures > 0) {
  process.exit(1);
}

console.log('PASS: header and navigation structure are consistent.');
