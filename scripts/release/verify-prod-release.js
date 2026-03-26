#!/usr/bin/env node
/**
 * Purpose:
 * - Enforce a no-green-no-done production release gate for a specific prod SHA.
 * Architectural role:
 * - Blocks release completion until matching prod CI and Deploy Pages succeed, then validates live production URLs.
 * Dependencies:
 * - Node.js built-ins, scripts/release/watch-ci-run.js, scripts/qa/verify-live-production.js.
 * Security/CSP considerations:
 * - Read-only GitHub API usage plus read-only HTTP checks against the production domain.
 * Migration considerations:
 * - Update workflow names if GitHub Actions workflow labels change.
 */

const https = require('https');
const fs = require('fs');
const os = require('os');
const path = require('path');
const { spawnSync } = require('child_process');

function parseArgs(argv) {
  const args = {};
  for (let i = 2; i < argv.length; i += 1) {
    const token = argv[i];
    if (!token.startsWith('--')) {
      continue;
    }
    const key = token.slice(2);
    const value = argv[i + 1];
    if (value && !value.startsWith('--')) {
      args[key] = value;
      i += 1;
    } else {
      args[key] = 'true';
    }
  }
  return args;
}

function runNode(scriptArgs, env = process.env) {
  const result = spawnSync(process.execPath, scriptArgs, {
    stdio: 'inherit',
    env
  });
  if (result.status !== 0) {
    process.exit(result.status || 1);
  }
}

function lockPathFor(branch, sha) {
  const safeBranch = String(branch || 'prod').replace(/[^a-zA-Z0-9._-]/g, '_');
  const safeSha = String(sha || 'unknown').replace(/[^a-zA-Z0-9._-]/g, '_');
  return path.join(os.tmpdir(), `romanbediner-release-verify-${safeBranch}-${safeSha}.lock`);
}

function tryReadJson(filePath) {
  try {
    const raw = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function isPidAlive(pid) {
  if (!Number.isInteger(pid) || pid <= 0) {
    return false;
  }
  try {
    process.kill(pid, 0);
    return true;
  } catch {
    return false;
  }
}

function acquireLock(lockPath, context) {
  const existing = tryReadJson(lockPath);
  if (existing && isPidAlive(Number(existing.pid))) {
    throw new Error(
      `release:verify-prod already running for this SHA (pid=${existing.pid}, started=${existing.startedAt}).`
    );
  }

  if (existing) {
    fs.unlinkSync(lockPath);
  }

  fs.writeFileSync(
    lockPath,
    `${JSON.stringify(
      {
        pid: process.pid,
        startedAt: new Date().toISOString(),
        ...context
      },
      null,
      2
    )}\n`,
    'utf8'
  );
}

function releaseLock(lockPath) {
  try {
    if (fs.existsSync(lockPath)) {
      const payload = tryReadJson(lockPath);
      if (!payload || payload.pid === process.pid) {
        fs.unlinkSync(lockPath);
      }
    }
  } catch {
    // Best-effort cleanup only.
  }
}

function requestJson(pathname, repo, token) {
  const headers = {
    'User-Agent': 'romanbediner-release-verify',
    Accept: 'application/vnd.github+json'
  };
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  return new Promise((resolve, reject) => {
    const req = https.request(
      {
        hostname: 'api.github.com',
        path: pathname,
        method: 'GET',
        headers
      },
      (res) => {
        let body = '';
        res.on('data', (chunk) => {
          body += chunk;
        });
        res.on('end', () => {
          if (res.statusCode < 200 || res.statusCode >= 300) {
            return reject(new Error(`GitHub API ${res.statusCode} for ${pathname}: ${body.slice(0, 220)}`));
          }
          try {
            resolve(JSON.parse(body));
          } catch (error) {
            reject(new Error(`Failed to parse GitHub API JSON for ${pathname}: ${error.message}`));
          }
        });
      }
    );
    req.on('error', reject);
    req.end();
  });
}

async function getRunUrl(repo, branch, sha, workflowName, token) {
  const payload = await requestJson(
    `/repos/${repo}/actions/runs?branch=${encodeURIComponent(branch)}&per_page=30`,
    repo,
    token
  );
  const runs = (payload.workflow_runs || [])
    .filter((run) => run.head_sha === sha && run.name === workflowName)
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  return runs[0] ? runs[0].html_url : '';
}

async function main() {
  const args = parseArgs(process.argv);
  const repo = args.repo || process.env.GITHUB_REPOSITORY || 'rbediner/romanbediner.com';
  const branch = args.branch || 'prod';
  const sha = args.sha;
  const timeout = args.timeout || '3600';
  const interval = args.interval || '15';
  const runDiscoveryTimeout = args['run-discovery-timeout'] || '900';

  if (!sha) {
    process.stderr.write('FAIL: Missing required --sha for release verification.\n');
    process.exit(2);
  }

  const lockPath = lockPathFor(branch, sha);
  acquireLock(lockPath, { branch, sha, repo });

  process.on('exit', () => releaseLock(lockPath));
  process.on('SIGINT', () => {
    releaseLock(lockPath);
    process.exit(130);
  });
  process.on('SIGTERM', () => {
    releaseLock(lockPath);
    process.exit(143);
  });

  process.stdout.write(
    `[release-verify] Verifying prod release for sha=${sha} on branch=${branch} (run-discovery-timeout=${runDiscoveryTimeout}s)\n`
  );

  runNode([
    'scripts/release/watch-ci-run.js',
    '--repo',
    repo,
    '--branch',
    branch,
    '--sha',
    sha,
    '--workflow',
    'CI',
    '--timeout',
    timeout,
    '--interval',
    interval,
    '--require-run-within',
    runDiscoveryTimeout
  ]);

  runNode([
    'scripts/release/watch-ci-run.js',
    '--repo',
    repo,
    '--branch',
    branch,
    '--sha',
    sha,
    '--workflow',
    'Deploy Pages',
    '--timeout',
    timeout,
    '--interval',
    interval,
    '--require-run-within',
    runDiscoveryTimeout
  ]);

  runNode(['scripts/qa/verify-live-production.js']);

  const token = process.env.GITHUB_TOKEN || process.env.GH_TOKEN || '';
  const ciUrl = await getRunUrl(repo, branch, sha, 'CI', token);
  const deployUrl = await getRunUrl(repo, branch, sha, 'Deploy Pages', token);

  process.stdout.write(
    [
      'PASS: Production release verification complete.',
      `- SHA: ${sha}`,
      `- CI run: ${ciUrl || 'not available'}`,
      `- Deploy run: ${deployUrl || 'not available'}`,
      '- Live smoke: https://romanbediner.com/ and critical routes validated'
    ].join('\n') + '\n'
  );
}

main().catch((error) => {
  process.stderr.write(`FAIL: ${error.message}\n`);
  process.exit(1);
});
