#!/usr/bin/env node
/**
 * Invariant:
 * - Repository must not accumulate hidden macOS files, nested git repos, or legacy home-route references.
 * Why this exists:
 * - Hygiene regressions cause flaky CI behavior, broken deploy assumptions, and route confusion.
 * What breaks if it fails:
 * - CI blocks merges until repository integrity is restored.
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..', '..');
const failures = [];
const LEGACY_HOME_ROUTE = `/${'home'}/`;

function walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    const rel = path.relative(ROOT, full);

    if (entry.name === '.git' && rel !== '.git') {
      failures.push(`Nested git directory detected: ${rel}`);
      continue;
    }
    if (entry.name === '.DS_Store') {
      failures.push(`macOS artifact committed: ${rel}`);
      continue;
    }
    if (entry.isDirectory()) {
      if (entry.name === 'node_modules') {
        continue;
      }
      walk(full);
    }
  }
}

function scanForLegacyHomeRoute() {
  const files = [];
  const roots = [
    path.join(ROOT, 'index.html'),
    path.join(ROOT, 'about'),
    path.join(ROOT, 'services'),
    path.join(ROOT, 'insights'),
    path.join(ROOT, 'connect'),
    path.join(ROOT, 'scripts'),
    path.join(ROOT, 'styles'),
    path.join(ROOT, 'QA', 'tests')
  ];
  for (const root of roots) {
    if (!fs.existsSync(root)) continue;
    const stat = fs.statSync(root);
    if (stat.isFile()) {
      files.push(root);
      continue;
    }
    const stack = [root];
    while (stack.length) {
      const next = stack.pop();
      for (const entry of fs.readdirSync(next, { withFileTypes: true })) {
        const full = path.join(next, entry.name);
        if (entry.isDirectory()) {
          if (entry.name === 'node_modules' || entry.name === '.git') continue;
          stack.push(full);
        } else if (entry.isFile()) {
          files.push(full);
        }
      }
    }
  }
  for (const file of files) {
    const text = fs.readFileSync(file, 'utf8');
    if (text.includes(LEGACY_HOME_ROUTE)) {
      failures.push(`Legacy ${LEGACY_HOME_ROUTE} reference found in ${path.relative(ROOT, file)}`);
    }
  }
}

function scanForLegacyRootFolders() {
  // Keep root directories purpose-driven and prevent reintroducing migrated folders.
  const disallowedRootDirs = ['analytics', 'icons', 'artifacts', 'test-results', 'test-results (1)'];
  for (const dirName of disallowedRootDirs) {
    const candidate = path.join(ROOT, dirName);
    if (fs.existsSync(candidate)) {
      failures.push(`Legacy root folder must not exist: ${dirName}`);
    }
  }
}

walk(ROOT);
scanForLegacyHomeRoute();
scanForLegacyRootFolders();

if (failures.length) {
  failures.forEach((f) => console.error(`FAIL: ${f}`));
  process.exit(1);
}

console.log('PASS: repository hygiene checks passed.');
