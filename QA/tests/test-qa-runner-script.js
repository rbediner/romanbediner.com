#!/usr/bin/env node
/**
 * Invariant:
 * - A single-command QA runner script must exist for non-engineering local usage.
 * Why this exists:
 * - Prevents command drift and reduces operator error from running tests in the wrong directory.
 * What breaks if it fails:
 * - CI/local QA must block until `/scripts/run-all-qa.sh` remains present and points to required commands.
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..', '..');
const scriptPath = path.join(ROOT, 'scripts', 'run-all-qa.sh');

if (!fs.existsSync(scriptPath)) {
  console.error('FAIL: missing scripts/run-all-qa.sh');
  process.exit(1);
}

const text = fs.readFileSync(scriptPath, 'utf8');

const requiredSnippets = [
  '#!/usr/bin/env bash',
  'npm run test:qa-full',
  'RUN_VISUAL_TESTS=1 python3 -m unittest discover -s QA/tests -p test_visual_regression_playwright.py -v'
];

for (const snippet of requiredSnippets) {
  if (!text.includes(snippet)) {
    console.error(`FAIL: scripts/run-all-qa.sh missing required snippet: ${snippet}`);
    process.exit(1);
  }
}

console.log('PASS: scripts/run-all-qa.sh exists and includes required QA commands.');
