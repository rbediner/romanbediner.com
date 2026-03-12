#!/usr/bin/env node
/**
 * Invariant:
 * - Lighthouse gate logic must evaluate median scores across attempts.
 * Why this exists:
 * - Reduces one-off CI flake while preserving threshold enforcement.
 * What breaks if it fails:
 * - CI can regress into noisy failures or weak threshold checks.
 */
const path = require('path');

const script = require(path.resolve(__dirname, '..', '..', 'scripts', 'qa', 'run-lighthouse-check.js'));

function assert(condition, message) {
  if (!condition) {
    console.error(`FAIL: ${message}`);
    process.exit(1);
  }
}

assert(typeof script.median === 'function', 'run-lighthouse-check.js must export median');
assert(typeof script.evaluateScores === 'function', 'run-lighthouse-check.js must export evaluateScores');

const median = script.median([100, 80, 90]);
assert(median === 90, `median should be 90, got ${median}`);

const passResult = script.evaluateScores(
  [
    { performance: 88, accessibility: 91 },
    { performance: 87, accessibility: 92 },
    { performance: 89, accessibility: 90 }
  ],
  { minPerformance: 85, minAccessibility: 90 }
);
assert(passResult.pass === true, 'scores above thresholds should pass');

const failResult = script.evaluateScores(
  [
    { performance: 78, accessibility: 91 },
    { performance: 79, accessibility: 90 },
    { performance: 80, accessibility: 92 }
  ],
  { minPerformance: 85, minAccessibility: 90 }
);
assert(failResult.pass === false, 'scores below performance threshold should fail');

console.log('PASS: lighthouse gate automation checks passed.');
