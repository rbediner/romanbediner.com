#!/usr/bin/env node
/**
 * Invariant:
 * - The repository must expose a canonical local session-readiness command and script.
 * Why this exists:
 * - Keeps startup validation automated instead of relying on memory.
 * What breaks if it fails:
 * - Operators can start from the wrong branch/runtime or a cloud-corrupted checkout.
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..', '..');
const PACKAGE_PATH = path.join(ROOT, 'package.json');
const README_PATH = path.join(ROOT, 'README.md');
const SCRIPT_PATH = path.join(ROOT, 'scripts', 'qa', 'verify-session-readiness.js');

function assert(condition, message) {
  if (!condition) {
    console.error(`FAIL: ${message}`);
    process.exit(1);
  }
}

const packageJson = JSON.parse(fs.readFileSync(PACKAGE_PATH, 'utf8'));
assert(
  packageJson.scripts['session:ready'] === 'node scripts/qa/verify-session-readiness.js',
  'package.json must expose session:ready startup automation'
);
assert(fs.existsSync(SCRIPT_PATH), 'scripts/qa/verify-session-readiness.js must exist');

const scriptText = fs.readFileSync(SCRIPT_PATH, 'utf8');
assert(scriptText.includes(".nvmrc"), 'session readiness script must verify .nvmrc');
assert(scriptText.includes('git status --porcelain'), 'session readiness script must verify a clean working tree');
assert(scriptText.includes('HANDOFF_PATH'), 'session readiness script must enforce the handoff file');
assert(scriptText.includes('latest.md'), 'session readiness script must target the canonical latest handoff file');
assert(scriptText.includes('origin/${requiredBranch}'), 'session readiness script must compare local HEAD to the remote branch');
assert(scriptText.includes('Cloud-sync duplicate artifacts detected'), 'session readiness script must flag duplicate sync artifacts');

const readmeText = fs.readFileSync(README_PATH, 'utf8');
assert(readmeText.includes('npm run session:ready'), 'README must document the automated startup preflight');

console.log('PASS: session-readiness automation guardrails are in place.');
