#!/usr/bin/env node
/**
 * Home spacing contract test.
 * Locks the single-direction section padding model to prevent additive-gap regressions.
 */
const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..', '..');
const homeCssPath = path.join(root, 'styles', 'home.css');
const css = fs.readFileSync(homeCssPath, 'utf8');

const failures = [];

function assertMatches(regex, message) {
  if (!regex.test(css)) {
    failures.push(message);
  }
}

// Desktop padding contract.
assertMatches(
  /\.page-main\s*\{[\s\S]*?padding:\s*72px\s+0\s+56px\s+0\s*;/i,
  'Expected ".page-main" desktop padding to be "72px 0 56px 0".'
);
assertMatches(
  /\.section\s*\{[\s\S]*?padding:\s*56px\s+0\s+0\s+0\s*;/i,
  'Expected base ".section" padding to be top-only "56px 0 0 0".'
);

// Mobile padding contract.
const mobileBlockMatch = css.match(/@media\s*\(max-width:\s*768px\)\s*\{([\s\S]*?)\n\}/i);
if (!mobileBlockMatch) {
  failures.push('Expected "@media (max-width: 768px)" block in styles/home.css.');
} else {
  const mobileBlock = mobileBlockMatch[1];

  if (!/\.page-main\s*\{[\s\S]*?padding:\s*48px\s+0\s+40px\s+0\s*;/i.test(mobileBlock)) {
    failures.push('Expected mobile ".page-main" padding to be "48px 0 40px 0".');
  }

  if (!/\.section\s*\{[\s\S]*?padding:\s*40px\s+0\s+0\s+0\s*;/i.test(mobileBlock)) {
    failures.push('Expected mobile ".section" padding to be top-only "40px 0 0 0".');
  }
}

if (failures.length > 0) {
  failures.forEach((message) => console.error(`FAIL: ${message}`));
  process.exit(1);
}

console.log('PASS: home spacing contract checks passed.');
