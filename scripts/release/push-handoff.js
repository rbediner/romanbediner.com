#!/usr/bin/env node
/**
 * Purpose:
 * - Commit and push docs/handoff/latest.md in isolation so it always gets the
 *   docs-only gate profile (~10s) rather than escalating to full-regression.
 * Architectural role:
 * - Thin wrapper around update-handoff-latest.js + isolated git commit/push.
 *   Separating the handoff commit from code commits is the key invariant: the
 *   gate classifier sees only docs/ in the changeset and routes to docs-only.
 * Dependencies:
 * - Node.js built-ins only (child_process); delegates metadata update to
 *   scripts/release/update-handoff-latest.js.
 * Security/CSP considerations:
 * - Local git operations only; pushes to origin using existing credentials.
 * Migration considerations:
 * - If HANDOFF_PATH moves, update the git add path below to match.
 */
const { execFileSync } = require('child_process');
const path = require('path');

const ROOT = path.resolve(__dirname, '..', '..');
const HANDOFF_PATH = 'docs/handoff/latest.md';

/* Use argv-based execution so repo/script paths with spaces are handled safely. */
function run(command, args = [], opts = {}) {
  return execFileSync(command, args, { cwd: ROOT, stdio: 'inherit', ...opts });
}

function runCapture(command, args = []) {
  return execFileSync(command, args, { cwd: ROOT, stdio: ['ignore', 'pipe', 'ignore'] }).toString().trim();
}

function main() {
  const branch = runCapture('git', ['branch', '--show-current']);
  if (!branch) {
    throw new Error('[handoff:push] Could not determine current branch.');
  }

  console.log(`[handoff:push] Branch: ${branch}`);
  console.log('[handoff:push] Refreshing handoff metadata...');
  run('node', [path.join(__dirname, 'update-handoff-latest.js')]);

  const status = runCapture('git', ['status', '--porcelain', '--', HANDOFF_PATH]);
  if (!status) {
    console.log('[handoff:push] No changes to handoff file — nothing to commit.');
    return;
  }

  run('git', ['add', HANDOFF_PATH]);

  const sequence = (() => {
    try {
      const text = require('fs').readFileSync(path.join(ROOT, HANDOFF_PATH), 'utf8');
      const m = text.match(/Handoff Sequence:\s*(\d+)/);
      return m ? m[1] : '?';
    } catch (_) {
      return '?';
    }
  })();

  run('git', ['commit', '-m', `handoff: update sequence ${sequence} [docs-only]`]);
  console.log(`[handoff:push] Pushing isolated handoff commit to origin/${branch}...`);
  run('git', ['push', 'origin', branch]);
  console.log('[handoff:push] Done. Gate ran docs-only profile (~10s).');
}

main();
