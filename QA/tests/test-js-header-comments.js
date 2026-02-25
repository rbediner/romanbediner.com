#!/usr/bin/env node
/**
 * Invariant:
 * - Every JS file under /scripts and JS test files must start with a descriptive header comment.
 * Why this exists:
 * - Architectural/security behavior must remain understandable during maintenance and migration.
 * What breaks if it fails:
 * - CI blocks changes that reduce codebase explainability and increase regression risk.
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..', '..');
const SCRIPT_DIR = path.join(ROOT, 'scripts');
const TEST_DIRS = [path.join(ROOT, 'QA', 'tests'), path.join(ROOT, 'tests')];

const failures = [];

function hasHeaderComment(contents) {
  const lines = contents.split('\n');
  let idx = 0;
  if (lines[0] && lines[0].startsWith('#!')) {
    idx = 1;
  }
  while (idx < lines.length && lines[idx].trim() === '') {
    idx += 1;
  }
  const first = (lines[idx] || '').trimStart();
  return first.startsWith('/**') || first.startsWith('/*') || first.startsWith('//');
}

function walk(dir, validator) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name === 'node_modules' || entry.name === '.git') {
      continue;
    }
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walk(full);
      continue;
    }
    if (!entry.isFile()) {
      continue;
    }
    if (!entry.name.endsWith('.js') && !entry.name.endsWith('.mjs')) {
      continue;
    }
    const contents = fs.readFileSync(full, 'utf8');
    validator(contents, full);
  }
}

function validateScriptHeader(contents, full) {
  const rel = path.relative(ROOT, full);
  if (!hasHeaderComment(contents)) {
    failures.push(`Missing header comment: ${rel}`);
    return;
  }
  const top = contents.split('\n').slice(0, 40).join('\n');
  const required = ['Purpose:', 'Architectural role:', 'Dependencies:', 'Migration considerations:'];
  for (const marker of required) {
    if (!top.includes(marker)) {
      failures.push(`Incomplete script header (${marker}) in ${rel}`);
    }
  }
}

function validateTestHeader(contents, full) {
  const rel = path.relative(ROOT, full);
  if (!hasHeaderComment(contents)) {
    failures.push(`Missing header comment: ${rel}`);
    return;
  }
  const top = contents.split('\n').slice(0, 30).join('\n');
  const required = ['Invariant:', 'Why this exists:', 'What breaks if it fails:'];
  for (const marker of required) {
    if (!top.includes(marker)) {
      failures.push(`Incomplete test header (${marker}) in ${rel}`);
    }
  }
}

if (fs.existsSync(SCRIPT_DIR)) {
  walk(SCRIPT_DIR, validateScriptHeader);
}
for (const dir of TEST_DIRS) {
  if (fs.existsSync(dir)) {
    walk(dir, validateTestHeader);
  }
}

if (failures.length) {
  failures.forEach((f) => console.error(`FAIL: ${f}`));
  process.exit(1);
}

console.log('PASS: JS header comment coverage is enforced.');