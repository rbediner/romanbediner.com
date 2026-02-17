#!/usr/bin/env node
/**
 * Test: favicon files generated from bullet.png exist and each page references them with correct relative paths.
 */
const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');

// Expected favicon assets that should be present for browser and device coverage.
const faviconAssets = [
  'assets/favicon/favicon-16x16.png',
  'assets/favicon/favicon-32x32.png',
  'assets/favicon/apple-touch-icon.png',
  'assets/favicon/favicon.ico'
];

// Per-page relative paths ensure references resolve correctly from nested routes.
const pageChecks = [
  { file: 'index.html', base: 'assets/favicon/' },
  { file: 'home/index.html', base: '../assets/favicon/' },
  { file: 'about/index.html', base: '../assets/favicon/' },
  { file: 'services/index.html', base: '../assets/favicon/' },
  { file: 'connect/index.html', base: '../assets/favicon/' },
  { file: 'about/insights/index.html', base: '../../assets/favicon/' }
];

let failures = 0;

for (const asset of faviconAssets) {
  const absolute = path.join(root, asset);
  if (!fs.existsSync(absolute)) {
    failures += 1;
    console.error(`FAIL: missing favicon asset ${asset}`);
  }
}

for (const { file, base } of pageChecks) {
  const absolute = path.join(root, file);
  const html = fs.readFileSync(absolute, 'utf8');
  const expectedFragments = [
    `href="${base}favicon-32x32.png"`,
    `href="${base}favicon-16x16.png"`,
    `href="${base}apple-touch-icon.png"`,
    `href="${base}favicon.ico"`
  ];

  for (const fragment of expectedFragments) {
    if (!html.includes(fragment)) {
      failures += 1;
      console.error(`FAIL: ${file} is missing favicon reference ${fragment}`);
    }
  }
}

if (failures > 0) {
  process.exit(1);
}

console.log('PASS: favicon assets exist and are linked across pages.');
