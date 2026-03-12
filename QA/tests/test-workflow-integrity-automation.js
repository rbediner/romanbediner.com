#!/usr/bin/env node
/**
 * Invariant:
 * - Workflow manifest and verifier must remain present and enforceable.
 * Why this exists:
 * - Protects required CI/CD job topology from accidental drift.
 * What breaks if it fails:
 * - CI should block merges until workflow integrity checks are restored.
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..', '..');
const MANIFEST_PATH = path.join(ROOT, 'docs', 'architecture', 'workflow-manifest.json');
const VERIFY_SCRIPT = path.join(ROOT, 'scripts', 'qa', 'verify-workflow-integrity.js');
const PACKAGE_JSON = path.join(ROOT, 'package.json');

function assert(condition, message) {
  if (!condition) {
    console.error(`FAIL: ${message}`);
    process.exit(1);
  }
}

assert(fs.existsSync(MANIFEST_PATH), 'docs/architecture/workflow-manifest.json must exist');
assert(fs.existsSync(VERIFY_SCRIPT), 'scripts/qa/verify-workflow-integrity.js must exist');

const manifest = JSON.parse(fs.readFileSync(MANIFEST_PATH, 'utf8'));
assert(Array.isArray(manifest.required_workflows), 'workflow manifest must define required_workflows[]');
assert(typeof manifest.required_jobs === 'object', 'workflow manifest must define required_jobs map');

const packageJson = JSON.parse(fs.readFileSync(PACKAGE_JSON, 'utf8'));
assert(packageJson.scripts['verify:workflow-integrity'], 'package.json must define verify:workflow-integrity script');

console.log('PASS: workflow integrity automation guardrails are in place.');
