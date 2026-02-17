#!/usr/bin/env node
/**
 * Favicon references and asset checks on canonical pages.
 */
const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..', '..');
const faviconAssets = [
  'assets/favicon/favicon-16x16.png',
  'assets/favicon/favicon-32x32.png',
  'assets/favicon/apple-touch-icon.png',
  'assets/favicon/favicon.ico'
];

const pageChecks = [
  { file: 'index.html', base: 'assets/favicon/' },
  { file: 'about/index.html', base: '../assets/favicon/' },
  { file: 'services/index.html', base: '../assets/favicon/' },
  { file: 'connect/index.html', base: '../assets/favicon/' },
  { file: 'insights/index.html', base: '../assets/favicon/' }
];

let failures = 0;

for (const asset of faviconAssets) {
  if (!fs.existsSync(path.join(root, asset))) {
    failures += 1;
    console.error(`FAIL: missing favicon asset ${asset}`);
  }
}

for (const { file, base } of pageChecks) {
  const html = fs.readFileSync(path.join(root, file), 'utf8');
  const expected = [
    `href="${base}favicon-32x32.png"`,
    `href="${base}favicon-16x16.png"`,
    `href="${base}apple-touch-icon.png"`,
    `href="${base}favicon.ico"`
  ];

  for (const fragment of expected) {
    if (!html.includes(fragment)) {
      failures += 1;
      console.error(`FAIL: ${file} missing favicon reference ${fragment}`);
    }
  }
}

if (failures > 0) {
  process.exit(1);
}

console.log('PASS: favicon assets exist and are linked on canonical pages.');
