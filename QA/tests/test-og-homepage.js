#!/usr/bin/env node
/**
 * Homepage Open Graph and Twitter image metadata contract check.
 */
const fs = require('fs');
const path = require('path');

const html = fs.readFileSync(path.resolve(__dirname, '..', '..', 'index.html'), 'utf8');
let failures = 0;

function getMetaByProperty(property) {
  const escaped = property.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const regex = new RegExp(`<meta\\s+property="${escaped}"\\s+content="([^"]+)"\\s*\\/?>`, 'i');
  const match = html.match(regex);
  return match ? match[1] : null;
}

function getMetaByName(name) {
  const escaped = name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const regex = new RegExp(`<meta\\s+name="${escaped}"\\s+content="([^"]+)"\\s*\\/?>`, 'i');
  const match = html.match(regex);
  return match ? match[1] : null;
}

const requiredPropertyTags = [
  'og:image',
  'og:logo',
  'og:image:width',
  'og:image:height',
  'og:image:type',
  'og:image:alt'
];

for (const tag of requiredPropertyTags) {
  if (!getMetaByProperty(tag)) {
    failures += 1;
    console.error(`FAIL: missing ${tag} on homepage`);
  }
}

if (!getMetaByName('twitter:card')) {
  failures += 1;
  console.error('FAIL: missing twitter:card on homepage');
}

const expectedImage = 'https://romanbediner.com/assets/og-logo/og-final.png?v=4';
const expectedLogo = 'https://romanbediner.com/assets/og-logo/og.png';
const expectedWidth = '1200';
const expectedHeight = '630';

if (getMetaByProperty('og:image') !== expectedImage) {
  failures += 1;
  console.error(`FAIL: og:image must be ${expectedImage}`);
}
if (getMetaByProperty('og:logo') !== expectedLogo) {
  failures += 1;
  console.error(`FAIL: og:logo must be ${expectedLogo}`);
}
if (getMetaByProperty('og:image:width') !== expectedWidth) {
  failures += 1;
  console.error(`FAIL: og:image:width must be ${expectedWidth}`);
}
if (getMetaByProperty('og:image:height') !== expectedHeight) {
  failures += 1;
  console.error(`FAIL: og:image:height must be ${expectedHeight}`);
}

if (failures > 0) {
  process.exit(1);
}

console.log('PASS: homepage OG/Twitter image metadata is complete and valid.');
