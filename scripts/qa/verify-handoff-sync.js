#!/usr/bin/env node
/**
 * Purpose:
 * - Enforce handoff synchronization for multi-agent changes across environments.
 *
 * Architectural role:
 * - Fails CI when non-doc code changes are pushed without updating docs/handoff/latest.md.
 *
 * Dependencies:
 * - Node.js built-ins and git CLI availability in the repository workspace.
 *
 * Security/CSP considerations:
 * - Read-only repository inspection; no network writes and no runtime-side effects.
 *
 * Migration considerations:
 * - Keep DOCS_ONLY_PATTERNS sourced from resolve-gate-profile.js to avoid drift.
 */

const { execSync } = require('child_process');
const { DOCS_ONLY_PATTERNS } = require('./resolve-gate-profile');

const HANDOFF_PATH = 'docs/handoff/latest.md';
const ZERO_SHA = '0000000000000000000000000000000000000000';

function fail(message) {
  process.stderr.write(`FAIL: ${message}\n`);
  process.exit(1);
}

function parseArgs(argv) {
  const args = { baseSha: '', headSha: '', allowEmpty: false };
  for (let index = 2; index < argv.length; index += 1) {
    const token = argv[index];
    if (token === '--base-sha') {
      args.baseSha = (argv[index + 1] || '').trim();
      index += 1;
      continue;
    }
    if (token === '--head-sha') {
      args.headSha = (argv[index + 1] || '').trim();
      index += 1;
      continue;
    }
    if (token === '--allow-empty') {
      args.allowEmpty = true;
      continue;
    }
    fail(`Unknown argument: ${token}`);
  }
  return args;
}

function runCapture(command) {
  return execSync(command, {
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'ignore']
  }).trim();
}

function matchesAny(filePath, patterns) {
  return patterns.some((pattern) => pattern.test(filePath));
}

function getChangedFiles(baseSha, headSha) {
  const safeBase = (baseSha || '').trim();
  const safeHead = (headSha || '').trim();

  if (safeBase && safeHead && safeBase !== ZERO_SHA && safeHead !== ZERO_SHA) {
    const output = runCapture(`git diff --name-only ${safeBase}..${safeHead}`);
    return output
      .split('\n')
      .map((line) => line.trim())
      .filter(Boolean);
  }

  // Fallback for manual/workflow_dispatch checks where SHA range may not exist.
  const output = runCapture('git diff --name-only HEAD~1..HEAD');
  return output
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean);
}

function main() {
  const { baseSha, headSha, allowEmpty } = parseArgs(process.argv);
  const changedFiles = getChangedFiles(baseSha, headSha);

  if (changedFiles.length === 0) {
    if (allowEmpty) {
      process.stdout.write('PASS: No changed files resolved; handoff sync check skipped safely.\n');
      return;
    }
    fail('No changed files were resolved. Re-run with --allow-empty for manual workflow checks.');
  }

  const nonDocFiles = changedFiles.filter((filePath) => !matchesAny(filePath, DOCS_ONLY_PATTERNS));
  const handoffUpdated = changedFiles.includes(HANDOFF_PATH);

  if (nonDocFiles.length > 0 && !handoffUpdated) {
    fail(
      `Non-doc changes require an updated ${HANDOFF_PATH}. Missing handoff update for: ${nonDocFiles.join(', ')}`
    );
  }

  process.stdout.write(
    `PASS: Handoff sync verified (changed=${changedFiles.length}, non_docs=${nonDocFiles.length}, handoff_updated=${handoffUpdated}).\n`
  );
}

if (require.main === module) {
  main();
}

module.exports = {
  getChangedFiles,
  matchesAny,
  parseArgs
};
