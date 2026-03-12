#!/usr/bin/env node
/**
 * Invariant:
 * - Staging preview deploy must stay isolated from production deployment state.
 * Why this exists:
 * - Prevents accidental production domain takeover by staging artifacts.
 * What breaks if it fails:
 * - CI should block merges until staging/prod deployment isolation is restored.
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..', '..');
const STAGING_WORKFLOW = path.join(ROOT, '.github', 'workflows', 'deploy-staging.yml');
const PROD_WORKFLOW = path.join(ROOT, '.github', 'workflows', 'deploy-pages.yml');
const PREVIEW_BUILD_SCRIPT = path.join(ROOT, 'scripts', 'build', 'create-preview-artifact.js');
const PREVIEW_VERIFY_SCRIPT = path.join(ROOT, 'scripts', 'qa', 'verify-preview-artifact.js');
const PREVIEW_PUBLISH_SCRIPT = path.join(ROOT, 'scripts', 'release', 'publish-preview-repo.js');

function assert(condition, message) {
  if (!condition) {
    console.error(`FAIL: ${message}`);
    process.exit(1);
  }
}

assert(fs.existsSync(STAGING_WORKFLOW), 'deploy-staging workflow must exist');
assert(fs.existsSync(PROD_WORKFLOW), 'deploy-pages workflow must exist');
assert(fs.existsSync(PREVIEW_BUILD_SCRIPT), 'create-preview-artifact script must exist');
assert(fs.existsSync(PREVIEW_VERIFY_SCRIPT), 'verify-preview-artifact script must exist');
assert(fs.existsSync(PREVIEW_PUBLISH_SCRIPT), 'publish-preview-repo script must exist');

const stagingWorkflowText = fs.readFileSync(STAGING_WORKFLOW, 'utf8');
const prodWorkflowText = fs.readFileSync(PROD_WORKFLOW, 'utf8');
const previewBuildText = fs.readFileSync(PREVIEW_BUILD_SCRIPT, 'utf8');
const previewVerifyText = fs.readFileSync(PREVIEW_VERIFY_SCRIPT, 'utf8');
const previewPublishText = fs.readFileSync(PREVIEW_PUBLISH_SCRIPT, 'utf8');

assert(stagingWorkflowText.includes('workflow_run:'), 'staging workflow must use workflow_run trigger');
assert(stagingWorkflowText.includes('workflows:\n      - CI'), 'staging workflow must require CI workflow completion');
assert(stagingWorkflowText.includes('branches:\n      - staging'), 'staging workflow must be branch-isolated to staging');
assert(stagingWorkflowText.includes('create-preview-artifact.js'), 'staging workflow must build preview artifact');
assert(stagingWorkflowText.includes('verify-preview-artifact.js'), 'staging workflow must verify preview artifact');
assert(stagingWorkflowText.includes('publish-preview-repo.js'), 'staging workflow must publish to preview repository');
assert(stagingWorkflowText.includes('continue-on-error: true'), 'staging workflow must handle preview publish failures explicitly');
assert(stagingWorkflowText.includes('Staging Preview Failed'), 'staging workflow must emit explicit failure summary');
assert(stagingWorkflowText.includes('Staging Preview Ready'), 'staging workflow must emit explicit success summary');
assert(stagingWorkflowText.includes('Preview URL:'), 'staging workflow must log a preview URL');
assert(stagingWorkflowText.includes('$GITHUB_STEP_SUMMARY'), 'staging workflow must publish preview URL in job summary');

assert(prodWorkflowText.includes('branches:\n      - prod'), 'production workflow must be branch-isolated to prod');
assert(prodWorkflowText.includes('Ensure production CNAME exists'), 'production workflow must enforce CNAME presence');
assert(prodWorkflowText.includes('test -f /tmp/rb-site-artifact/site/CNAME'), 'production workflow must fail when CNAME is missing');

assert(previewBuildText.includes('fs.rmSync(cnamePath'), 'preview artifact builder must strip CNAME');
assert(previewBuildText.includes("Disallow: /"), 'preview artifact builder must enforce no-index robots policy');
assert(previewVerifyText.includes('must not contain CNAME'), 'preview verifier must block CNAME in preview artifact');
assert(previewVerifyText.includes('Disallow: /'), 'preview verifier must require no-index robots policy');
assert(previewPublishText.includes('PREVIEW_REPO_TOKEN'), 'preview publish script must use dedicated preview token');
assert(previewPublishText.includes('https://${owner}.github.io/${name}/'), 'preview publish script must compute clickable preview URL');

console.log('PASS: staging preview automation guardrails are in place.');
