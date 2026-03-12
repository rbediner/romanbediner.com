#!/usr/bin/env node
/**
 * Invariant:
 * - Artifact creation and integrity verification scripts must exist.
 * Why this exists:
 * - Keeps deploy workflows bound to checksum-verified artifacts.
 * What breaks if it fails:
 * - CI should block merges until artifact guardrails are restored.
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..', '..');
const CREATE_SCRIPT = path.join(ROOT, 'scripts', 'build', 'create-artifact.js');
const VERIFY_SCRIPT = path.join(ROOT, 'scripts', 'qa', 'verify-artifact-integrity.js');

function assert(condition, message) {
  if (!condition) {
    console.error(`FAIL: ${message}`);
    process.exit(1);
  }
}

assert(fs.existsSync(CREATE_SCRIPT), 'scripts/build/create-artifact.js must exist');
assert(fs.existsSync(VERIFY_SCRIPT), 'scripts/qa/verify-artifact-integrity.js must exist');

const createText = fs.readFileSync(CREATE_SCRIPT, 'utf8');
const verifyText = fs.readFileSync(VERIFY_SCRIPT, 'utf8');

assert(createText.includes('artifact-manifest.json'), 'artifact builder must emit artifact-manifest.json');
assert(createText.includes('checksum'), 'artifact builder must generate checksum metadata');
assert(verifyText.includes('Checksum mismatch'), 'artifact verifier must fail on checksum mismatch');

console.log('PASS: artifact integrity automation guardrails are in place.');
