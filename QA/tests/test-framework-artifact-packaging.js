#!/usr/bin/env node
/**
 * Invariant:
 * - Static artifact builders must package framework + dashboard routes and
 *   rewrite those root-prefixed links for preview.
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
const dashboardDistIndex = path.join(ROOT, 'ai-enabled-operations-dashboard', 'dist', 'index.html');

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
  /['"]resources['"]/.test(artifactBuilder),
  'create-artifact.js must include "resources" in INCLUDE_PATHS.'
);

assert(
  /ai-enabled-operations-dashboard/.test(artifactBuilder),
  'create-artifact.js must include dashboard dist packaging + route promotion.'
);

assert(
  fs.existsSync(dashboardDistIndex),
  'dashboard dist index must exist so artifact packaging can publish /ai-enabled-operations-dashboard/.'
);

assert(
  previewBuilder.includes('framework'),
  'create-preview-artifact.js must rewrite absolute /framework/ links for preview base-path mode.'
);

assert(
  previewBuilder.includes('resources'),
  'create-preview-artifact.js must rewrite absolute /resources/ links for preview base-path mode.'
);

assert(
  previewBuilder.includes('ai-enabled-operations-dashboard'),
  'create-preview-artifact.js must rewrite absolute /ai-enabled-operations-dashboard/ links for preview base-path mode.'
);

console.log('PASS: framework/dashboard artifact packaging and preview rewrite contracts passed.');
