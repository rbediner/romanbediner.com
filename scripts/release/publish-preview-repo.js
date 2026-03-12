#!/usr/bin/env node
/**
 * Purpose:
 * - Publish a verified preview artifact to an isolated preview repository branch.
 * Architectural role:
 * - Keeps staging preview deployment isolated from production repo Pages state.
 * Dependencies:
 * - Node.js built-ins plus git available in CI runner.
 * Security/CSP considerations:
 * - Uses token-authenticated remote URL from environment; never prints token.
 * Migration considerations:
 * - Update URL computation if preview repo/owner naming conventions change.
 */
const fs = require('fs');
const path = require('path');
const os = require('os');
const { execFileSync } = require('child_process');

function parseArgs(argv) {
  const args = {
    artifact: '',
    repo: '',
    branch: 'staging-preview',
    sourceSha: '',
    sourceBranch: 'staging'
  };

  for (let i = 0; i < argv.length; i += 1) {
    const token = argv[i];
    if (token === '--artifact' && argv[i + 1]) {
      args.artifact = path.resolve(argv[i + 1]);
      i += 1;
    } else if (token === '--repo' && argv[i + 1]) {
      args.repo = argv[i + 1];
      i += 1;
    } else if (token === '--branch' && argv[i + 1]) {
      args.branch = argv[i + 1];
      i += 1;
    } else if (token === '--source-sha' && argv[i + 1]) {
      args.sourceSha = argv[i + 1];
      i += 1;
    } else if (token === '--source-branch' && argv[i + 1]) {
      args.sourceBranch = argv[i + 1];
      i += 1;
    }
  }

  return args;
}

function fail(message) {
  process.stderr.write(`FAIL: ${message}\n`);
  process.exit(1);
}

function runGit(args, cwd, extraEnv = {}) {
  return execFileSync('git', args, {
    cwd,
    stdio: 'pipe',
    env: { ...process.env, ...extraEnv }
  }).toString();
}

function wipeRepoContent(repoDir) {
  for (const entry of fs.readdirSync(repoDir)) {
    if (entry === '.git') {
      continue;
    }
    fs.rmSync(path.join(repoDir, entry), { recursive: true, force: true });
  }
}

function computePreviewUrl(repo) {
  const [owner, name] = repo.split('/');
  if (!owner || !name) {
    return '';
  }
  return `https://${owner}.github.io/${name}/`;
}

function writeGithubOutput(values) {
  const outputPath = process.env.GITHUB_OUTPUT;
  if (!outputPath) {
    return;
  }
  const lines = Object.entries(values).map(([key, value]) => `${key}=${value}`);
  fs.appendFileSync(outputPath, `${lines.join('\n')}\n`);
}

function main() {
  const args = parseArgs(process.argv.slice(2));
  const token = process.env.PREVIEW_REPO_TOKEN;

  if (!args.artifact) {
    fail('Missing --artifact argument');
  }
  if (!args.repo) {
    fail('Missing --repo argument (format: owner/repo)');
  }
  if (!token) {
    fail('Missing PREVIEW_REPO_TOKEN environment variable');
  }

  const siteDir = path.join(args.artifact, 'site');
  if (!fs.existsSync(siteDir)) {
    fail(`Preview site directory does not exist: ${siteDir}`);
  }

  const workDir = fs.mkdtempSync(path.join(os.tmpdir(), 'rb-preview-publish-'));
  const repoDir = path.join(workDir, 'repo');
  const remoteUrl = `https://x-access-token:${token}@github.com/${args.repo}.git`;
  const sourceSha = args.sourceSha || 'unknown';

  try {
    runGit(['clone', remoteUrl, repoDir], workDir);
    runGit(['checkout', '-B', args.branch], repoDir);
    wipeRepoContent(repoDir);
    fs.cpSync(siteDir, repoDir, { recursive: true });

    runGit(['add', '--all'], repoDir);

    const stagedDiff = runGit(['status', '--porcelain'], repoDir).trim();
    if (!stagedDiff) {
      process.stdout.write('INFO: preview repository already up to date; no commit created.\n');
    } else {
      runGit(
        [
          '-c',
          'user.name=github-actions[bot]',
          '-c',
          'user.email=github-actions[bot]@users.noreply.github.com',
          'commit',
          '-m',
          `Publish preview for ${args.sourceBranch}@${sourceSha.slice(0, 12)}`
        ],
        repoDir
      );
      runGit(['push', 'origin', args.branch, '--force-with-lease'], repoDir);
    }
  } catch (error) {
    const stderr = error && error.stderr ? String(error.stderr) : '';
    const detail = stderr.trim() ? ` | ${stderr.trim()}` : '';
    fail(`Failed to publish preview repository: ${error.message}${detail}`);
  } finally {
    fs.rmSync(workDir, { recursive: true, force: true });
  }

  const previewUrl = computePreviewUrl(args.repo);
  writeGithubOutput({ preview_url: previewUrl, preview_repo: args.repo, preview_branch: args.branch });
  process.stdout.write(
    [
      'PASS: preview repository publication completed.',
      `- Preview repository: ${args.repo}`,
      `- Preview branch: ${args.branch}`,
      `- Preview URL: ${previewUrl}`
    ].join('\n') + '\n'
  );
}

if (require.main === module) {
  main();
}

module.exports = {
  computePreviewUrl,
  parseArgs
};
