#!/usr/bin/env node
/**
 * Purpose:
 * - Confirm that a prod push is promoting the exact commit already validated on staging.
 *
 * Architectural role:
 * - Lets the local pre-push hook avoid rerunning full CI-parity for safe
 *   staging->prod fast-forward promotions while still enforcing staging CI success.
 *
 * Dependencies:
 * - Node.js built-ins only plus the existing release monitor script.
 *
 * Security/CSP considerations:
 * - Read-only local git inspection and read-only GitHub Actions monitoring.
 *
 * Migration considerations:
 * - If branch names or workflow names change, update the constants below and
 *   the matching README / QA guardrails in the same commit.
 */
const { execFileSync, execSync } = require('child_process');
const path = require('path');

const STAGING_BRANCH = 'staging';
const PROD_BRANCH = 'prod';
const STAGING_CI_WORKFLOW_NAME = 'CI';
const STAGING_CI_TIMEOUT_SECONDS = 1800;
const STAGING_CI_POLL_INTERVAL_SECONDS = 15;
const STAGING_CI_DISCOVERY_TIMEOUT_SECONDS = 900;

function runGit(commandArgs, options = {}) {
  return execFileSync('git', commandArgs, {
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
    ...options
  }).trim();
}

function getCurrentBranch() {
  return runGit(['branch', '--show-current']);
}

function getRefSha(refName) {
  try {
    return runGit(['rev-parse', refName]);
  } catch (_error) {
    return '';
  }
}

function assertOriginProdIsAncestor() {
  execFileSync('git', ['merge-base', '--is-ancestor', `origin/${PROD_BRANCH}`, 'HEAD'], {
    stdio: 'ignore'
  });
}

function assertFastForwardPromotionShape(
  { currentBranch, headSha, stagingSha, prodSha },
  options = {}
) {
  const fastForwardCheck = options.fastForwardCheck || assertOriginProdIsAncestor;

  if (currentBranch !== PROD_BRANCH) {
    throw new Error(`Prod promotion gate only applies on ${PROD_BRANCH}; current branch is ${currentBranch || 'unknown'}.`);
  }

  if (!headSha || !stagingSha || !prodSha) {
    throw new Error('Missing git refs required for prod promotion validation.');
  }

  if (headSha !== stagingSha) {
    throw new Error(
      `Prod HEAD (${headSha}) does not match origin/${STAGING_BRANCH} (${stagingSha}); refusing promotion fast path.`
    );
  }

  try {
    fastForwardCheck();
  } catch (_error) {
    throw new Error('Prod push is not a fast-forward from origin/prod; refusing promotion fast path.');
  }
}

function waitForStagingCiSuccess(headSha) {
  const monitorScriptPath = path.join(__dirname, '..', 'release', 'watch-ci-run.js');
  execFileSync(
    'node',
    [
      monitorScriptPath,
      '--branch',
      STAGING_BRANCH,
      '--sha',
      headSha,
      '--workflow',
      STAGING_CI_WORKFLOW_NAME,
      '--timeout',
      String(STAGING_CI_TIMEOUT_SECONDS),
      '--interval',
      String(STAGING_CI_POLL_INTERVAL_SECONDS),
      '--require-run-within',
      String(STAGING_CI_DISCOVERY_TIMEOUT_SECONDS)
    ],
    {
      stdio: 'inherit',
      env: process.env
    }
  );
}

function main() {
  const currentBranch = getCurrentBranch();
  const headSha = getRefSha('HEAD');
  const stagingSha = getRefSha(`origin/${STAGING_BRANCH}`);
  const prodSha = getRefSha(`origin/${PROD_BRANCH}`);

  assertFastForwardPromotionShape({
    currentBranch,
    headSha,
    stagingSha,
    prodSha
  });

  process.stdout.write(
    `[prod-promotion-gate] Verified ${PROD_BRANCH} HEAD matches origin/${STAGING_BRANCH}. Checking staging CI for ${headSha}.\n`
  );
  waitForStagingCiSuccess(headSha);
  process.stdout.write('[prod-promotion-gate] Staging CI already passed for this promotion commit.\n');
}

if (require.main === module) {
  main();
}

module.exports = {
  PROD_BRANCH,
  STAGING_BRANCH,
  STAGING_CI_WORKFLOW_NAME,
  assertOriginProdIsAncestor,
  assertFastForwardPromotionShape
};
