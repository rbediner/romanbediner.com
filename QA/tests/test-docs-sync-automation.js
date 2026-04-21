#!/usr/bin/env node
/**
 * Invariant:
 * - Docs workflow must stay lightweight, always-on, and handoff-enforced.
 * Why this exists:
 * - Preserves multi-agent handoff consistency without triggering full deploy flows.
 * What breaks if it fails:
 * - CI should block until docs/source-of-truth automation is restored.
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..', '..');
const DOCS_WORKFLOW = path.join(ROOT, '.github', 'workflows', 'docs-sync.yml');
const CI_WORKFLOW = path.join(ROOT, '.github', 'workflows', 'ci.yml');
const STAGING_WORKFLOW = path.join(ROOT, '.github', 'workflows', 'deploy-staging.yml');
const PROD_WORKFLOW = path.join(ROOT, '.github', 'workflows', 'deploy-pages.yml');
const HANDOFF_SYNC_SCRIPT = path.join(ROOT, 'scripts', 'qa', 'verify-handoff-sync.js');

function assert(condition, message) {
  if (!condition) {
    console.error(`FAIL: ${message}`);
    process.exit(1);
  }
}

assert(fs.existsSync(DOCS_WORKFLOW), 'docs-sync workflow must exist');
assert(fs.existsSync(HANDOFF_SYNC_SCRIPT), 'verify-handoff-sync script must exist');

const docsWorkflowText = fs.readFileSync(DOCS_WORKFLOW, 'utf8');
const ciWorkflowText = fs.readFileSync(CI_WORKFLOW, 'utf8');
const stagingWorkflowText = fs.readFileSync(STAGING_WORKFLOW, 'utf8');
const prodWorkflowText = fs.readFileSync(PROD_WORKFLOW, 'utf8');
const handoffScriptText = fs.readFileSync(HANDOFF_SYNC_SCRIPT, 'utf8');

assert(docsWorkflowText.includes('name: Docs Sync'), 'docs-sync workflow must keep explicit name');
assert(docsWorkflowText.includes('node scripts/qa/verify-handoff-sync.js'), 'docs-sync workflow must enforce handoff sync');
assert(docsWorkflowText.includes('npm run test:docs-gate'), 'docs-sync workflow must run docs gate');

assert(ciWorkflowText.includes('paths-ignore:'), 'ci workflow must support docs-only skip path');
assert(ciWorkflowText.includes("node scripts/qa/verify-handoff-sync.js"), 'ci workflow must enforce handoff sync before full jobs');

assert(stagingWorkflowText.includes('paths-ignore:'), 'deploy-staging workflow must skip docs-only pushes');
assert(prodWorkflowText.includes('paths-ignore:'), 'deploy-pages workflow must skip docs-only pushes');

assert(
  handoffScriptText.includes("const HANDOFF_PATH = 'docs/handoff/latest.md'"),
  'handoff sync script must pin canonical handoff path'
);
assert(
  handoffScriptText.includes('Non-doc changes require an updated'),
  'handoff sync script must fail when code changes do not update handoff'
);

console.log('PASS: docs sync automation guardrails are in place.');
