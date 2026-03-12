#!/usr/bin/env node
/**
 * Invariant:
 * - Repository contract files and verifier must exist and remain wired into package scripts.
 * Why this exists:
 * - Prevents silent removal of CI/CD architecture safety contracts.
 * What breaks if it fails:
 * - CI should block merges until contract enforcement is restored.
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..', '..');
const CONTRACT_PATH = path.join(ROOT, 'docs', 'architecture', 'repo-contract.json');
const VERIFY_SCRIPT = path.join(ROOT, 'scripts', 'qa', 'verify-repo-contract.js');
const PACKAGE_JSON = path.join(ROOT, 'package.json');

function assert(condition, message) {
  if (!condition) {
    console.error(`FAIL: ${message}`);
    process.exit(1);
  }
}

assert(fs.existsSync(CONTRACT_PATH), 'docs/architecture/repo-contract.json must exist');
assert(fs.existsSync(VERIFY_SCRIPT), 'scripts/qa/verify-repo-contract.js must exist');

const contract = JSON.parse(fs.readFileSync(CONTRACT_PATH, 'utf8'));
assert(Array.isArray(contract.critical_files), 'repo contract must define critical_files[]');
assert(Array.isArray(contract.protected_paths), 'repo contract must define protected_paths[]');
assert(Array.isArray(contract.required_scripts), 'repo contract must define required_scripts[]');

const packageJson = JSON.parse(fs.readFileSync(PACKAGE_JSON, 'utf8'));
assert(packageJson.scripts['verify:repo-contract'], 'package.json must define verify:repo-contract script');

console.log('PASS: repository contract automation guardrails are in place.');
