#!/usr/bin/env node
/**
 * Invariant:
 * - On mobile, the six framework stages render as a two-column index (no horizontal scroll),
 *   so no stage pill is clipped and tap targets stay usable.
 * Why this exists:
 * - Protects the approved mobile framework navigation from edge-clipping / compressed-rail regressions.
 * What breaks if it fails:
 * - CI blocks deployment to prevent mobile framework navigation regressions.
 */
const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..', '..');
const css = fs.readFileSync(path.join(root, 'styles', 'framework.css'), 'utf8');

const mobileBlockMatch = css.match(/@media\s*\(max-width:\s*768px\)\s*\{([\s\S]*?)\n\}/i);
const failures = [];

if (!mobileBlockMatch) {
  failures.push('Expected "@media (max-width: 768px)" block in styles/framework.css.');
} else {
  const mobileBlock = mobileBlockMatch[1];

  if (!/\.framework-progress-markers\s*\{[\s\S]*?display:\s*grid\s*;/i.test(mobileBlock)) {
    failures.push('Expected mobile ".framework-progress-markers" to use a grid (two-column stage index).');
  }

  if (!/\.framework-progress-markers\s*\{[\s\S]*?grid-template-columns:\s*repeat\(2,/i.test(mobileBlock)) {
    failures.push('Expected mobile ".framework-progress-markers" to use two columns.');
  }

  // Must not reintroduce the horizontally scrolling rail on mobile.
  if (/\.framework-progress-markers\s*\{[\s\S]*?overflow-x:\s*auto\s*;/i.test(mobileBlock)) {
    failures.push('Mobile ".framework-progress-markers" must not horizontally scroll (overflow-x: auto).');
  }
}

if (failures.length > 0) {
  failures.forEach((message) => console.error(`FAIL: ${message}`));
  process.exit(1);
}

console.log('PASS: framework mobile progress guardrails passed.');
