#!/usr/bin/env node
/**
 * Home spacing contract test.
 * Locks master-grid geometry values to prevent whitespace regressions.
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

// Base page padding contract.
assertMatches(
  /\.page-main\s*\{[\s\S]*?padding:\s*72px\s+0\s+56px\s+0\s*;/i,
  'Expected ".page-main" desktop padding to be "72px 0 56px 0".'
);

// Master grid desktop geometry contract.
assertMatches(
  /\.master-layout-grid\s*\{[\s\S]*?grid-template-columns:\s*minmax\(0,\s*1fr\)\s+360px\s*;/i,
  'Expected ".master-layout-grid" columns to be "minmax(0, 1fr) 360px".'
);
assertMatches(
  /\.master-layout-grid\s*\{[\s\S]*?row-gap:\s*56px\s*;/i,
  'Expected ".master-layout-grid" row-gap to stay at 56px.'
);
assertMatches(
  /\.master-head\s*\{[\s\S]*?grid-column:\s*1\s*\/\s*-1\s*;/i,
  'Expected ".master-head" to span both grid columns.'
);
assertMatches(
  /\.master-photo\s*\{[\s\S]*?grid-row:\s*2\s*\/\s*span\s*4\s*;/i,
  'Expected ".master-photo" to start at row 2 and span rows.'
);
assertMatches(
  /\.master-blurb\s*\{[\s\S]*?grid-row:\s*2\s*;/i,
  'Expected ".master-blurb" to start at row 2.'
);
assertMatches(
  /#experience\.master-section\s*\{[\s\S]*?grid-column:\s*1\s*;/i,
  'Expected "#experience.master-section" to remain in left column.'
);
assertMatches(
  /#areas-of-focus\.master-section\s*\{[\s\S]*?grid-column:\s*1\s*;/i,
  'Expected "#areas-of-focus.master-section" to remain in left column.'
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

  if (!/\.master-layout-grid\s*\{[\s\S]*?grid-template-columns:\s*1fr\s*;/i.test(mobileBlock)) {
    failures.push('Expected mobile ".master-layout-grid" to collapse to one column.');
  }

  if (!/\.master-layout-grid\s*\{[\s\S]*?row-gap:\s*40px\s*;/i.test(mobileBlock)) {
    failures.push('Expected mobile ".master-layout-grid" row-gap to be 40px.');
  }

  if (!/\.master-photo\s*\{[\s\S]*?grid-row:\s*3\s*;/i.test(mobileBlock)) {
    failures.push('Expected mobile ".master-photo" to move to row 3.');
  }
}

if (failures.length > 0) {
  failures.forEach((message) => console.error(`FAIL: ${message}`));
  process.exit(1);
}

console.log('PASS: home spacing contract checks passed.');
