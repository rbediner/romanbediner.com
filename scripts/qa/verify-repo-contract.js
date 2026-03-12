#!/usr/bin/env node
/**
 * Purpose:
 * - Enforce the repository architecture contract required for safe CI/CD operations.
 * Architectural role:
 * - Fails fast when critical files, protected paths, or required npm scripts are missing.
 * Dependencies:
 * - Node.js built-ins only.
 * Security/CSP considerations:
 * - Static filesystem and package metadata checks only; no runtime/browser impact.
 * Migration considerations:
 * - Update docs/architecture/repo-contract.json when architecture contracts evolve.
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..', '..');
const CONTRACT_PATH = path.join(ROOT, 'docs', 'architecture', 'repo-contract.json');
const PACKAGE_PATH = path.join(ROOT, 'package.json');

function fail(message) {
  process.stderr.write(`FAIL: ${message}\n`);
  process.exit(1);
}

function readJson(filePath) {
  try {
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
  } catch (error) {
    fail(`Unable to parse JSON at ${path.relative(ROOT, filePath)}: ${error.message}`);
  }
}

function ensureArray(value, label) {
  if (!Array.isArray(value)) {
    fail(`${label} must be an array in ${path.relative(ROOT, CONTRACT_PATH)}`);
  }
}

function main() {
  if (!fs.existsSync(CONTRACT_PATH)) {
    fail(`Missing repository contract file: ${path.relative(ROOT, CONTRACT_PATH)}`);
  }

  if (!fs.existsSync(PACKAGE_PATH)) {
    fail('Missing package.json required for script contract checks');
  }

  const contract = readJson(CONTRACT_PATH);
  const packageJson = readJson(PACKAGE_PATH);

  ensureArray(contract.critical_files, 'critical_files');
  ensureArray(contract.protected_paths, 'protected_paths');
  ensureArray(contract.required_scripts, 'required_scripts');

  for (const relativeFile of contract.critical_files) {
    const fullPath = path.join(ROOT, relativeFile);
    if (!fs.existsSync(fullPath)) {
      fail(`Critical file is missing: ${relativeFile}`);
    }
  }

  for (const relativePath of contract.protected_paths) {
    const fullPath = path.join(ROOT, relativePath);
    if (!fs.existsSync(fullPath)) {
      fail(`Protected path is missing: ${relativePath}`);
    }
  }

  const scripts = packageJson.scripts || {};
  for (const scriptName of contract.required_scripts) {
    if (!Object.prototype.hasOwnProperty.call(scripts, scriptName)) {
      fail(`Required npm script is missing: ${scriptName}`);
    }
  }

  process.stdout.write('PASS: repository contract verification passed.\n');
}

if (require.main === module) {
  main();
}

module.exports = {
  main
};
