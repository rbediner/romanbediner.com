#!/usr/bin/env node
/**
 * Purpose:
 * - Fail fast when a local machine is not ready to work on this repository safely.
 * Architectural role:
 * - Converts the human startup checklist into an enforced local preflight.
 * Dependencies:
 * - Node.js built-ins only (fs, path, child_process, os); no third-party packages.
 * Security/CSP considerations:
 * - Reads local git/filesystem state only; no browser/runtime impact.
 * Migration considerations:
 * - Keep README, package.json, and QA contracts aligned if startup rules change.
 */
const fs = require('fs');
const os = require('os');
const path = require('path');
const { execSync } = require('child_process');

const ROOT = path.resolve(__dirname, '..', '..');
const IS_CI = process.env.CI === 'true' || process.env.CI === '1';
const README_PATH = path.join(ROOT, 'README.md');
const HANDOFF_PATH = path.join(ROOT, 'docs', 'handoff', 'latest.md');
const NVMRC_PATH = path.join(ROOT, '.nvmrc');

function readText(filePath) {
  return fs.readFileSync(filePath, 'utf8');
}

function parseExpectedNodeMajor(versionText) {
  const match = versionText.trim().match(/^v?(\d+)$/);
  if (!match) {
    throw new Error(`Unsupported .nvmrc version format: ${versionText.trim()}`);
  }
  return match[1];
}

function getGitValue(command, fallback = '') {
  try {
    return execSync(command, { cwd: ROOT, stdio: ['ignore', 'pipe', 'ignore'] }).toString().trim();
  } catch (_) {
    return fallback;
  }
}

function getTopLevelDuplicateArtifacts(entryNames, canonicalNames) {
  return entryNames
    .map((entryName) => {
      // Detect the two most common cloud-sync duplicate shapes:
      // 1) "scripts 2" / "notes 2.md"
      // 2) "file (conflicted copy ...)".
      const numberSuffixMatch = entryName.match(/^(.*) (\d+)(\.[^./]+)?$/);
      const conflictedCopyMatch = entryName.match(/^(.*) \(conflicted copy.*\)(\.[^./]+)?$/i);

      const match = numberSuffixMatch || conflictedCopyMatch;
      if (!match) return null;

      const baseName = match[1];
      const extension = numberSuffixMatch ? (numberSuffixMatch[3] || '') : (conflictedCopyMatch[2] || '');
      const canonicalName = `${baseName}${extension}`;
      if (!canonicalNames.has(canonicalName)) {
        return null;
      }

      return {
        artifactName: entryName,
        canonicalName
      };
    })
    .filter(Boolean);
}

function getRequiredBranch(handoffText) {
  const match = handoffText.match(/- Source Branch:\s*([^\n]+)/);
  return match ? match[1].trim() : '';
}

function formatGitStatus(statusText) {
  return statusText
    .split('\n')
    .map((line) => line.trimEnd())
    .filter(Boolean)
    .slice(0, 8);
}

function buildFailureMessages() {
  const failures = [];

  if (!fs.existsSync(README_PATH)) {
    failures.push(`Missing required operator guide: ${path.relative(ROOT, README_PATH)}`);
  }

  if (!fs.existsSync(HANDOFF_PATH)) {
    failures.push(`Missing required handoff file: ${path.relative(ROOT, HANDOFF_PATH)}`);
  }

  if (!fs.existsSync(NVMRC_PATH)) {
    failures.push('Missing .nvmrc, so local Node cannot be aligned to CI.');
    return failures;
  }

  const expectedNodeMajor = parseExpectedNodeMajor(readText(NVMRC_PATH));
  const currentNodeMajor = process.versions.node.split('.')[0];
  if (currentNodeMajor !== expectedNodeMajor) {
    const nvmInstalled = fs.existsSync(path.join(os.homedir(), '.nvm', 'nvm.sh'));
    const fixHint = nvmInstalled
      ? 'Run `nvm use` (or `nvm install && nvm use` if Node 20 is not installed yet).'
      : 'Install NVM, then run `nvm install` and `nvm use`.';
    failures.push(
      `Node ${process.versions.node} is active but Node ${expectedNodeMajor}.x is required by .nvmrc. ${fixHint}`
    );
  }

  const handoffText = readText(HANDOFF_PATH);
  const requiredBranch = getRequiredBranch(handoffText);
  const currentBranch = getGitValue('git branch --show-current', 'unknown');
  if (!IS_CI && requiredBranch && currentBranch !== requiredBranch) {
    failures.push(`Current branch is ${currentBranch}, but the latest handoff expects ${requiredBranch}.`);
  }

  const workingTreeStatus = getGitValue('git status --porcelain', '');
  if (!IS_CI && workingTreeStatus) {
    failures.push(
      `Working tree is not clean:\n${formatGitStatus(workingTreeStatus).join('\n')}`
    );
  }

  const localSha = getGitValue('git rev-parse HEAD', '');
  const remoteSha = requiredBranch ? getGitValue(`git rev-parse origin/${requiredBranch}`, '') : '';
  if (!IS_CI && requiredBranch && localSha && remoteSha && localSha !== remoteSha) {
    failures.push(
      `Local HEAD ${localSha} does not match origin/${requiredBranch} ${remoteSha}. Pull the latest staging state before editing.`
    );
  }

  const topLevelEntries = fs.readdirSync(ROOT);
  const trackedTopLevelEntries = new Set(getGitValue('git ls-tree --name-only HEAD', '').split('\n').filter(Boolean));
  const duplicateArtifacts = getTopLevelDuplicateArtifacts(topLevelEntries, trackedTopLevelEntries);
  if (duplicateArtifacts.length > 0) {
    const details = duplicateArtifacts.map(
      ({ artifactName, canonicalName }) => `- ${artifactName} duplicates canonical ${canonicalName}`
    );
    failures.push(
      `Cloud-sync duplicate artifacts detected:\n${details.join('\n')}`
    );
  }

  return failures;
}

function main() {
  const failures = buildFailureMessages();
  if (failures.length > 0) {
    process.stderr.write('[session:ready] FAIL\n');
    for (const failure of failures) {
      process.stderr.write(`- ${failure}\n`);
    }
    process.exit(1);
  }

  const branch = getGitValue('git branch --show-current', 'unknown');
  const sha = getGitValue('git rev-parse HEAD', 'unknown');
  process.stdout.write(
    [
      '[session:ready] PASS',
      `- README checked: ${path.relative(ROOT, README_PATH)}`,
      `- Handoff checked: ${path.relative(ROOT, HANDOFF_PATH)}`,
      `- Branch: ${branch}`,
      `- Commit: ${sha}`,
      `- Node: ${process.versions.node}`
    ].join('\n') + '\n'
  );
}

if (require.main === module) {
  main();
}

module.exports = {
  buildFailureMessages,
  formatGitStatus,
  getRequiredBranch,
  getTopLevelDuplicateArtifacts,
  parseExpectedNodeMajor
};
