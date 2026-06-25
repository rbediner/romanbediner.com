#!/usr/bin/env node
/**
 * Invariant:
 * - Mobile framework stage pills must keep horizontal breathing room so the last pill is not clipped.
 * Why this exists:
 * - Protects the approved mobile framework navigation from edge-clipping regressions.
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

  if (!/\.framework-progress-markers\s*\{[\s\S]*?padding:\s*0\s+20px\s+8px\s+0\s*;/i.test(mobileBlock)) {
    failures.push('Expected mobile ".framework-progress-markers" to reserve right padding for the final stage pill.');
  }

  if (!/\.framework-progress-markers\s*\{[\s\S]*?scroll-padding-right:\s*20px\s*;/i.test(mobileBlock)) {
    failures.push('Expected mobile ".framework-progress-markers" to define scroll-padding-right.');
  }

  if (!/\.framework-progress-marker:last-child\s*\{[\s\S]*?margin-right:\s*6px\s*;/i.test(mobileBlock)) {
    failures.push('Expected the final mobile framework progress marker to keep a small trailing margin.');
  }
}

if (failures.length > 0) {
  failures.forEach((message) => console.error(`FAIL: ${message}`));
  process.exit(1);
}

console.log('PASS: framework mobile progress guardrails passed.');
