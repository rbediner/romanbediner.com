#!/usr/bin/env node
/**
 * Purpose:
 * - Detect and clean repo-owned GitHub release watcher processes so terminal polling loops do not get stranded.
 * Architectural role:
 * - Enforces release-monitor hygiene before and after staging/prod verification without adding heavy QA cost.
 * Dependencies:
 * - Node.js built-ins plus macOS/Linux process utilities (`ps`, `lsof`, `kill`) when available.
 * Security/CSP considerations:
 * - Reads local process metadata only and sends SIGTERM/SIGKILL only to repo-owned watcher processes.
 * Migration considerations:
 * - If release monitoring moves away from GitHub CLI polling, update the watcher-pattern rules below.
 */

const path = require('path');
const { execFileSync, spawnSync } = require('child_process');

const ROOT = path.resolve(__dirname, '..', '..');
const WATCHER_PATTERNS = [
  {
    name: 'gh-run-list-loop',
    matches(command) {
      return command.includes('while true') && command.includes('gh run list');
    }
  },
  {
    name: 'gh-run-watch',
    matches(command) {
      return command.includes('gh run watch');
    }
  }
];

function parseArgs(argv) {
  const args = { _: [] };
  for (let index = 2; index < argv.length; index += 1) {
    const token = argv[index];
    if (!token.startsWith('--')) {
      args._.push(token);
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

function shellEscape(value) {
  return String(value).replace(/'/g, `'\\''`);
}

function runCommand(command, commandArgs, options = {}) {
  try {
    return execFileSync(command, commandArgs, {
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'pipe'],
      ...options
    });
  } catch (error) {
    if (options.allowFailure) {
      return '';
    }
    throw error;
  }
}

function safeReadCommandLines() {
  const output = runCommand('ps', ['-axo', 'pid=,ppid=,command='], { allowFailure: true });
  if (!output) {
    return [];
  }

  return output
    .split('\n')
    .map((line) => line.trimEnd())
    .filter(Boolean)
    .map((line) => {
      const match = line.match(/^\s*(\d+)\s+(\d+)\s+(.*)$/);
      if (!match) {
        return null;
      }
      return {
        pid: Number(match[1]),
        ppid: Number(match[2]),
        command: match[3]
      };
    })
    .filter(Boolean);
}

function sleepMs(durationMs) {
  Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, durationMs);
}

function detectWatcherKind(command) {
  for (const pattern of WATCHER_PATTERNS) {
    if (pattern.matches(command)) {
      return pattern.name;
    }
  }
  return '';
}

function cwdForPid(pid) {
  const output = runCommand('lsof', ['-a', '-p', String(pid), '-d', 'cwd', '-Fn'], { allowFailure: true });
  const cwdLine = output
    .split('\n')
    .find((line) => line.startsWith('n'));
  return cwdLine ? cwdLine.slice(1) : '';
}

function isRepoOwnedWatcher(processInfo, repoRoot = ROOT) {
  if (!processInfo || !processInfo.command || processInfo.pid === process.pid) {
    return false;
  }

  const watcherKind = detectWatcherKind(processInfo.command);
  if (!watcherKind) {
    return false;
  }

  const cwd = cwdForPid(processInfo.pid);
  if (!cwd) {
    return false;
  }

  const resolvedCwd = path.resolve(cwd);
  const resolvedRoot = path.resolve(repoRoot);
  return resolvedCwd === resolvedRoot || resolvedCwd.startsWith(`${resolvedRoot}${path.sep}`);
}

function listRepoOwnedWatchers(repoRoot = ROOT) {
  return safeReadCommandLines()
    .filter((processInfo) => isRepoOwnedWatcher(processInfo, repoRoot))
    .map((processInfo) => ({
      ...processInfo,
      kind: detectWatcherKind(processInfo.command),
      cwd: cwdForPid(processInfo.pid)
    }));
}

function killWatcher(pid, signal) {
  const result = spawnSync('kill', [`-${signal}`, String(pid)], {
    stdio: 'ignore'
  });
  return result.status === 0;
}

function pidIsAlive(pid) {
  try {
    process.kill(pid, 0);
    return true;
  } catch {
    return false;
  }
}

function cleanupWatchers(repoRoot = ROOT, options = {}) {
  const timeoutMs = Number(options.timeoutMs || 1800);
  const initialWatchers = listRepoOwnedWatchers(repoRoot);
  const killed = [];

  for (const watcher of initialWatchers) {
    // SIGTERM first so shell loops and gh watchers can exit cleanly.
    killWatcher(watcher.pid, 'TERM');
    killed.push({ ...watcher, signal: 'TERM' });
  }

  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    const remaining = listRepoOwnedWatchers(repoRoot)
      .filter((watcher) => initialWatchers.some((candidate) => candidate.pid === watcher.pid));
    if (!remaining.length) {
      return { killed, escalated: [] };
    }
    sleepMs(125);
  }

  const escalated = [];
  for (const watcher of listRepoOwnedWatchers(repoRoot)) {
    if (!initialWatchers.some((candidate) => candidate.pid === watcher.pid)) {
      continue;
    }
    if (!pidIsAlive(watcher.pid)) {
      continue;
    }
    killWatcher(watcher.pid, 'KILL');
    escalated.push({ ...watcher, signal: 'KILL' });
  }

  return { killed, escalated };
}

function printWatchers(watchers) {
  if (!watchers.length) {
    console.log('PASS: No repo-owned release watcher processes are active.');
    return;
  }

  console.log('ACTIVE: Repo-owned release watcher processes detected:');
  for (const watcher of watchers) {
    console.log(
      `- pid=${watcher.pid} kind=${watcher.kind} cwd=${watcher.cwd}\n  command=${watcher.command}`
    );
  }
}

function printCleanupSummary(result) {
  const total = result.killed.length + result.escalated.length;
  if (total === 0) {
    console.log('PASS: No stale repo-owned release watchers needed cleanup.');
    return;
  }

  console.log(`PASS: Cleaned ${total} repo-owned release watcher process(es).`);
  for (const watcher of [...result.killed, ...result.escalated]) {
    console.log(`- pid=${watcher.pid} signal=${watcher.signal} kind=${watcher.kind}`);
  }
}

function printUsage() {
  console.log(
    [
      'Usage:',
      '  node scripts/release/manage-release-watchers.js status',
      '  node scripts/release/manage-release-watchers.js cleanup',
      '',
      'Notes:',
      '  - Only repo-owned watcher loops are targeted.',
      `  - Repo root: '${shellEscape(ROOT)}'`
    ].join('\n')
  );
}

function main() {
  const args = parseArgs(process.argv);
  const command = args._[0] || 'status';

  if (command === 'status') {
    const watchers = listRepoOwnedWatchers();
    printWatchers(watchers);
    process.exit(watchers.length ? 1 : 0);
  }

  if (command === 'cleanup') {
    const result = cleanupWatchers(ROOT, { timeoutMs: args.timeoutMs });
    printCleanupSummary(result);
    const remaining = listRepoOwnedWatchers();
    if (remaining.length) {
      printWatchers(remaining);
      process.exit(1);
    }
    process.exit(0);
  }

  printUsage();
  process.exit(2);
}

if (require.main === module) {
  main();
}

module.exports = {
  ROOT,
  WATCHER_PATTERNS,
  parseArgs,
  safeReadCommandLines,
  detectWatcherKind,
  isRepoOwnedWatcher,
  listRepoOwnedWatchers,
  cleanupWatchers
};
