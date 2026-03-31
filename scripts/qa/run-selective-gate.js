#!/usr/bin/env node
/**
 * Purpose:
 * - Run the exact local QA commands for a resolved selective gate profile.
 *
 * Architectural role:
 * - Provides a measurable local runner that keeps selective QA behavior
 *   consistent between hand-triggered commands and Husky pre-push automation.
 *
 * Dependencies:
 * - Node.js built-ins, npm scripts from package.json, and Python for local
 *   static server support on profiles that run links/Lighthouse.
 *
 * Security/CSP considerations:
 * - Local-only QA orchestration with no production mutation.
 *
 * Migration considerations:
 * - Keep profile command lists aligned with README gate matrix and CI job policy.
 */

const fs = require('fs');
const path = require('path');
const { execSync, spawn } = require('child_process');
const {
  PROFILE_SETTINGS,
  applyCommandPlaceholders,
  classifyChangedFiles,
  parseChangedFilesArg
} = require('./resolve-gate-profile');

const ROOT = path.resolve(__dirname, '..', '..');
const RESULTS_DIR = path.join(ROOT, 'QA', 'results', 'gate-metrics');
const RESULTS_PATH = path.join(RESULTS_DIR, 'latest-local-gate.json');
const STATIC_SERVER_PORT = 4173;

function parseArgs(argv) {
  const args = {};
  for (let index = 2; index < argv.length; index += 1) {
    const token = argv[index];
    if (!token.startsWith('--')) {
      continue;
    }
    const key = token.slice(2);
    const next = argv[index + 1];
    if (next && !next.startsWith('--')) {
      args[key] = next;
      index += 1;
    } else {
      args[key] = 'true';
    }
  }
  return args;
}

function runCommand(command) {
  const startedAt = Date.now();
  execSync(command, {
    stdio: 'inherit',
    env: process.env,
    cwd: ROOT
  });
  return {
    command,
    durationMs: Date.now() - startedAt
  };
}

function startStaticServer() {
  const child = spawn('python3', ['-m', 'http.server', String(STATIC_SERVER_PORT)], {
    cwd: ROOT,
    stdio: 'ignore',
    detached: process.platform !== 'win32'
  });
  return child;
}

async function waitForServer() {
  const deadline = Date.now() + 30000;
  while (Date.now() < deadline) {
    try {
      const response = await fetch(`http://127.0.0.1:${STATIC_SERVER_PORT}/`, {
        redirect: 'follow'
      });
      if (response.ok) {
        return;
      }
    } catch (_error) {
      // Continue polling until the local static server is reachable.
    }
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }
  throw new Error('Local static server did not become ready within 30 seconds.');
}

function stopStaticServer(child) {
  if (!child || child.killed) {
    return;
  }

  try {
    if (process.platform === 'win32') {
      child.kill();
    } else {
      process.kill(-child.pid, 'SIGTERM');
    }
  } catch (_error) {
    // Best-effort local cleanup only.
  }
}

function profileNeedsStaticServer(profileSettings) {
  return profileSettings.localCommands.some((command) =>
    command.includes('npm run test:links') ||
    command.includes('npm run test:lighthouse')
  );
}

function writeMetrics(payload) {
  fs.mkdirSync(RESULTS_DIR, { recursive: true });
  fs.writeFileSync(RESULTS_PATH, `${JSON.stringify(payload, null, 2)}\n`, 'utf8');
}

async function main() {
  const args = parseArgs(process.argv);
  const changedFiles = parseChangedFilesArg(args['changed-files']);
  const profileResult = args.profile
    ? {
        profile: args.profile,
        reason: args.reason || 'Profile provided explicitly.',
        changedFiles,
        routeScopes: [],
        settings: PROFILE_SETTINGS[args.profile]
      }
    : classifyChangedFiles(changedFiles);

  if (!profileResult.settings) {
    throw new Error(`Unknown gate profile: ${profileResult.profile}`);
  }

  const startedAt = new Date().toISOString();
  const commandResults = [];
  const shouldStartServer = profileNeedsStaticServer(profileResult.settings);
  let serverProcess = null;

  try {
    if (shouldStartServer) {
      process.stdout.write(
        `[selective-gate] Starting local static server for ${profileResult.profile} checks.\n`
      );
      serverProcess = startStaticServer();
      await waitForServer();
    }

    process.stdout.write(
      `[selective-gate] Running ${profileResult.profile} gate. Reason: ${profileResult.reason}\n`
    );

    for (const command of profileResult.settings.localCommands) {
      const resolvedCommand = applyCommandPlaceholders(command, profileResult.routeScopes);
      commandResults.push(runCommand(resolvedCommand));
    }
  } finally {
    stopStaticServer(serverProcess);
  }

  const payload = {
    startedAt,
    finishedAt: new Date().toISOString(),
    profile: profileResult.profile,
    reason: profileResult.reason,
    routeScopes: profileResult.routeScopes,
    changedFiles: profileResult.changedFiles,
    totalDurationMs: commandResults.reduce((sum, result) => sum + result.durationMs, 0),
    commands: commandResults
  };

  writeMetrics(payload);

  process.stdout.write(
    [
      'PASS: selective local QA gate passed.',
      `- Profile: ${payload.profile}`,
      `- Commands: ${payload.commands.length}`,
      `- Total duration: ${payload.totalDurationMs}ms`,
      `- Metrics file: ${RESULTS_PATH}`
    ].join('\n') + '\n'
  );
}

if (require.main === module) {
  main().catch((error) => {
    process.stderr.write(`FAIL: ${error.message}\n`);
    process.exit(1);
  });
}
