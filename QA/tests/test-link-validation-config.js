#!/usr/bin/env node
/**
 * Invariant:
 * - Link validation must not fail staging/local runs by checking canonical production URLs.
 * Why this exists:
 * - Route migrations can be valid in staging before production catches up.
 * What breaks if it fails:
 * - CI `link-validation` blocks healthy staging commits due to expected prod/staging divergence.
 */
const path = require('path');

const script = require(path.resolve(__dirname, '..', '..', 'scripts', 'qa', 'run-link-check.js'));

function assert(condition, message) {
  if (!condition) {
    console.error(`FAIL: ${message}`);
    process.exit(1);
  }
}

const localSkip = script.buildSkipPattern('http://127.0.0.1:4173', 'romanbediner.com');
assert(
  /https\?:\/\/\(www\\\.\)\?romanbediner\\\.com\/\.\*/.test(localSkip),
  'Local link validation must skip canonical production URLs.'
);

const prodSkip = script.buildSkipPattern('https://romanbediner.com', 'romanbediner.com');
assert(
  !/romanbediner\\\.com/.test(prodSkip.replace('mailto:.*,tel:.*', '')),
  'Production link validation must not skip canonical domain checks.'
);

console.log('PASS: link-validation skip-pattern configuration checks passed.');
