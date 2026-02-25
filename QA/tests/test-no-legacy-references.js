#!/usr/bin/env node
/**
 * Guardrail: block reintroduction of references to legacy files removed from the project.
 * This keeps build/runtime paths clean after static asset and script cleanup.
 */
const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..', '..');
const scanExtensions = new Set(['.html', '.css', '.js', '.md', '.xml', '.txt', '.sh', '.py']);
const forbiddenNeedles = [
  'styles.css',
  'assets/icons/LinkedIn.png',
  'assets/icons/platform-rollout-enablement.png',
  'assets/logo/favicon.png',
  'scripts/insights-briefs.js'
];
const allowedFiles = new Set([
  // This test file documents the forbidden list itself.
  path.join('QA', 'tests', 'test-no-legacy-references.js')
]);

const failures = [];

function walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name === '.git' || entry.name === 'node_modules') {
      continue;
    }
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walk(fullPath);
      continue;
    }
    if (!scanExtensions.has(path.extname(entry.name))) {
      continue;
    }
    const relPath = path.relative(root, fullPath);
    if (allowedFiles.has(relPath)) {
      continue;
    }
    const content = fs.readFileSync(fullPath, 'utf8');
    for (const needle of forbiddenNeedles) {
      if (content.includes(needle)) {
        failures.push(`${relPath} still references forbidden path "${needle}".`);
      }
    }
  }
}

walk(root);

if (failures.length > 0) {
  for (const failure of failures) {
    console.error(`FAIL: ${failure}`);
  }
  process.exit(1);
}

console.log('PASS: no legacy references found.');
