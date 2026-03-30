#!/usr/bin/env node
/**
 * Purpose:
 * - Select the appropriate local pre-push QA profile based on changed files.
 *
 * Architectural role:
 * - Keeps full CI-parity protection for code/runtime changes while allowing
 *   faster docs-only pushes.
 *
 * Dependencies:
 * - Node.js built-ins and npm scripts from package.json.
 *
 * Security/CSP considerations:
 * - Local-only helper, no browser/runtime behavior impact.
 *
 * Migration considerations:
 * - Keep docs-only allowlist aligned with README drift policy.
 */
const { execSync } = require('child_process');
const {
  DOCS_ONLY_PATTERNS,
  classifyChangedFiles,
  isDocsOnlyChangeSet
} = require('./resolve-gate-profile');
const PROD_BRANCH = 'prod';
const STAGING_BRANCH = 'staging';

function run(command) {
  execSync(command, {
    stdio: 'inherit',
    env: process.env
  });
}

function getUpstreamRef() {
  try {
    return execSync('git rev-parse --abbrev-ref --symbolic-full-name @{u}', {
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore']
    }).trim();
  } catch (_error) {
    return '';
  }
}

function getChangedFiles() {
  const upstream = getUpstreamRef();
  const ranges = [];
  if (upstream) {
    ranges.push(`${upstream}...HEAD`);
  }
  ranges.push('HEAD~1..HEAD');

  for (const range of ranges) {
    try {
      const output = execSync(`git diff --name-only ${range}`, { encoding: 'utf8' });
      const changed = output
        .split('\n')
        .map((line) => line.trim())
        .filter(Boolean);
      if (changed.length > 0) {
        return changed;
      }
    } catch (_error) {
      // Continue to next fallback range when local history shape differs.
    }
  }

  try {
    const output = execSync('git diff --cached --name-only', { encoding: 'utf8' });
    return output
      .split('\n')
      .map((line) => line.trim())
      .filter(Boolean);
  } catch (_error) {
    return [];
  }
}

function getCurrentBranch() {
  try {
    return execSync('git branch --show-current', {
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore']
    }).trim();
  } catch (_error) {
    return '';
  }
}

function getRefSha(refName) {
  try {
    return execSync(`git rev-parse ${refName}`, {
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore']
    }).trim();
  } catch (_error) {
    return '';
  }
}

function isProdPromotionCandidate({ currentBranch, headSha, stagingSha }) {
  return currentBranch === PROD_BRANCH && Boolean(headSha) && headSha === stagingSha;
}

function runProdPromotionGate() {
  process.stdout.write(
    '[husky pre-push] Prod promotion candidate detected. Reusing the already-tested staging SHA and validating remote staging CI.\n'
  );
  run('node scripts/qa/verify-prod-promotion-candidate.js');
}

function main() {
  const changedFiles = getChangedFiles();
  const currentBranch = getCurrentBranch();
  const headSha = getRefSha('HEAD');
  const stagingSha = getRefSha(`origin/${STAGING_BRANCH}`);

  if (isProdPromotionCandidate({ currentBranch, headSha, stagingSha })) {
    runProdPromotionGate();
    return;
  }

  const profileResult = classifyChangedFiles(changedFiles);
  if (isDocsOnlyChangeSet(changedFiles)) {
    process.stdout.write(
      '[husky pre-push] Docs-only change detected. Running lightweight integrity gate.\n'
    );
  } else {
    process.stdout.write(
      `[husky pre-push] ${profileResult.profile} change detected. ${profileResult.reason}\n`
    );
  }
  run(`node scripts/qa/run-selective-gate.js --profile ${profileResult.profile} --changed-files "${changedFiles.join(',')}" --reason "${profileResult.reason.replace(/"/g, '\\"')}"`);
}

if (require.main === module) {
  main();
}

module.exports = {
  DOCS_ONLY_PATTERNS,
  PROD_BRANCH,
  STAGING_BRANCH,
  getChangedFiles,
  getCurrentBranch,
  getUpstreamRef,
  getRefSha,
  isDocsOnlyChangeSet,
  isProdPromotionCandidate
};
