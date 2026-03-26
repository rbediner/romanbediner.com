#!/usr/bin/env node
/**
 * Purpose:
 * - Poll GitHub Actions for a branch/SHA and fail fast when any run completes unsuccessfully.
 * Architectural role:
 * - Provides machine-readable release gating for staging->prod promotion automation.
 * Dependencies:
 * - Node.js built-ins only (https, url); no third-party packages.
 * Security/CSP considerations:
 * - Read-only GitHub API access. Honors GITHUB_TOKEN/GH_TOKEN if provided.
 * Migration considerations:
 * - Keep GitHub API endpoint shapes in sync if this repository migrates to GitHub Enterprise or workflow naming changes.
 */
const https = require('https');
const RETRIABLE_NETWORK_ERRORS = new Set(['ENOTFOUND', 'EAI_AGAIN', 'ECONNRESET', 'ETIMEDOUT']);

function parseArgs(argv) {
  const args = {};
  for (let i = 2; i < argv.length; i += 1) {
    const token = argv[i];
    if (token.startsWith('--')) {
      const key = token.slice(2);
      const next = argv[i + 1];
      if (next && !next.startsWith('--')) {
        args[key] = next;
        i += 1;
      } else {
        args[key] = 'true';
      }
    }
  }
  return args;
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function isRetriableApiError(error) {
  if (!error) {
    return false;
  }

  if (error.code && RETRIABLE_NETWORK_ERRORS.has(error.code)) {
    return true;
  }

  if (typeof error.statusCode === 'number' && error.statusCode >= 500) {
    return true;
  }

  return false;
}

function requestJson(path) {
  const token = process.env.GITHUB_TOKEN || process.env.GH_TOKEN;
  const headers = {
    'User-Agent': 'romanbediner-ci-monitor',
    Accept: 'application/vnd.github+json'
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  return new Promise((resolve, reject) => {
    const req = https.request(
      {
        hostname: 'api.github.com',
        path,
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
            const error = new Error(
              `GitHub API request failed (${res.statusCode}) for ${path}: ${body.slice(0, 300)}`
            );
            error.statusCode = res.statusCode;
            return reject(error);
          }
          try {
            resolve(JSON.parse(body));
          } catch (error) {
            reject(new Error(`Failed to parse JSON response for ${path}: ${error.message}`));
          }
        });
      }
    );

    req.on('error', reject);
    req.end();
  });
}

async function requestJsonWithRetry(path, options = {}) {
  const maxAttempts = Number(options.maxAttempts || 4);
  const baseDelayMs = Number(options.baseDelayMs || 1200);

  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    try {
      return await requestJson(path);
    } catch (error) {
      if (!isRetriableApiError(error) || attempt === maxAttempts) {
        throw error;
      }

      const delayMs = baseDelayMs * attempt;
      console.warn(
        `[ci-monitor] Transient API error (${error.code || error.statusCode || error.message}); retry ${attempt}/${maxAttempts} in ${delayMs}ms`
      );
      await sleep(delayMs);
    }
  }

  throw new Error(`Unreachable retry state for ${path}`);
}

function sortByDateDesc(runs) {
  return [...runs].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
}

async function printFailureDetails(ownerRepo, runId) {
  const jobsPayload = await requestJsonWithRetry(`/repos/${ownerRepo}/actions/runs/${runId}/jobs?per_page=100`);
  const failedJobs = (jobsPayload.jobs || []).filter((job) => job.conclusion && job.conclusion !== 'success');

  if (!failedJobs.length) {
    console.error('[ci-monitor] Run failed but no failed jobs were returned by the jobs API.');
    return;
  }

  for (const job of failedJobs) {
    console.error(`[ci-monitor] Failed job: ${job.name} (${job.html_url || 'no-url'})`);
    try {
      // Job IDs map to check-runs IDs in this repository's existing CI tooling.
      const annotations = await requestJsonWithRetry(
        `/repos/${ownerRepo}/check-runs/${job.id}/annotations?per_page=50`
      );
      if (!Array.isArray(annotations) || annotations.length === 0) {
        console.error('[ci-monitor] No annotations returned for failed job.');
        continue;
      }

      for (const annotation of annotations) {
        const path = annotation.path || 'unknown-path';
        const line = annotation.start_line || 1;
        const message = annotation.message || 'No annotation message provided.';
        console.error(`[ci-monitor] Annotation: ${path}:${line} -> ${message}`);
      }
    } catch (error) {
      // Annotation access can be permission-scoped; keep monitoring flow resilient.
      console.error(`[ci-monitor] Annotation lookup skipped: ${error.message}`);
    }
  }
}

async function main() {
  const args = parseArgs(process.argv);
  if (args.help === 'true') {
    console.log(
      'Usage: node scripts/release/watch-ci-run.js --branch <branch> --sha <commit-sha> [--workflow "Workflow Name"] [--repo owner/repo] [--timeout 1800] [--interval 15] [--api-retries 4] [--require-run-within 900]'
    );
    process.exit(0);
  }

  const repo = args.repo || process.env.GITHUB_REPOSITORY || 'rbediner/romanbediner.com';
  const branch = args.branch;
  const sha = args.sha;
  const workflowName = args.workflow;
  const timeoutSeconds = Number(args.timeout || 1800);
  const pollIntervalSeconds = Number(args.interval || 15);
  const apiRetries = Number(args['api-retries'] || 4);
  const requireRunWithinSeconds = Number(args['require-run-within'] || 0);

  if (!branch || !sha) {
    console.error('Missing required args: --branch and --sha');
    process.exit(2);
  }

  const started = Date.now();
  console.log(`[ci-monitor] Watching ${repo} branch=${branch} sha=${sha}`);
  if (workflowName) {
    console.log(`[ci-monitor] Filtering workflow name: ${workflowName}`);
  }
  if (requireRunWithinSeconds > 0) {
    console.log(
      `[ci-monitor] Require matching run discovery within ${requireRunWithinSeconds}s or fail fast.`
    );
  }

  let noRunPollCount = 0;

  while (true) {
    const elapsedSeconds = (Date.now() - started) / 1000;
    if (elapsedSeconds > timeoutSeconds) {
      console.error(`[ci-monitor] Timeout after ${timeoutSeconds}s while waiting for CI completion.`);
      process.exit(1);
    }

    const runsPayload = await requestJsonWithRetry(
      `/repos/${repo}/actions/runs?branch=${encodeURIComponent(branch)}&per_page=30`,
      { maxAttempts: apiRetries }
    );
    const runs = sortByDateDesc(
      (runsPayload.workflow_runs || []).filter((run) => {
        if (run.head_sha !== sha) {
          return false;
        }
        if (!workflowName) {
          return true;
        }
        return run.name === workflowName;
      })
    );

    if (!runs.length) {
      noRunPollCount += 1;
      if (requireRunWithinSeconds > 0 && elapsedSeconds > requireRunWithinSeconds) {
        console.error(
          `[ci-monitor] No matching run discovered within ${requireRunWithinSeconds}s for workflow="${workflowName || 'any'}" sha=${sha}.`
        );
        console.error('[ci-monitor] Fail-fast triggered. Re-check workflow trigger and branch/SHA alignment.');
        process.exit(1);
      }

      console.log(
        `[ci-monitor] No matching run yet; polling... (attempt ${noRunPollCount}, elapsed ${Math.floor(
          elapsedSeconds
        )}s)`
      );
      await sleep(pollIntervalSeconds * 1000);
      continue;
    }

    const latest = runs[0];
    console.log(`[ci-monitor] Run ${latest.id} status=${latest.status} conclusion=${latest.conclusion || 'pending'}`);

    if (latest.status !== 'completed') {
      await sleep(pollIntervalSeconds * 1000);
      continue;
    }

    if (latest.conclusion === 'success') {
      console.log(`[ci-monitor] Run succeeded: ${latest.html_url}`);
      process.exit(0);
    }

    console.error(`[ci-monitor] Run failed: ${latest.html_url}`);
    await printFailureDetails(repo, latest.id);
    process.exit(1);
  }
}

main().catch((error) => {
  console.error(`[ci-monitor] Fatal error: ${error.message}`);
  process.exit(1);
});
