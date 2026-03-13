#!/usr/bin/env node
/**
 * Invariant:
 * - Static artifact builders must package the /framework route and rewrite framework-prefixed links for preview.
 * Why this exists:
 * - Deploy workflows can report success while shipping artifacts missing /framework/ if include/rewrite lists drift.
 * What breaks if it fails:
 * - Staging preview/prod deployments return 404 for /framework/ despite green CI.
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..', '..');
const artifactBuilder = fs.readFileSync(path.join(ROOT, 'scripts', 'build', 'create-artifact.js'), 'utf8');
const previewBuilder = fs.readFileSync(path.join(ROOT, 'scripts', 'build', 'create-preview-artifact.js'), 'utf8');

function assert(condition, message) {
  if (!condition) {
    console.error(`FAIL: ${message}`);
    process.exit(1);
  }
}

assert(
  /['"]framework['"]/.test(artifactBuilder),
  'create-artifact.js must include "framework" in INCLUDE_PATHS.'
);

assert(
  previewBuilder.includes('(assets|styles|scripts|about|services|framework|insights|connect)'),
  'create-preview-artifact.js must rewrite absolute /framework/ links for preview base-path mode.'
);

console.log('PASS: framework artifact packaging and preview rewrite contracts passed.');
