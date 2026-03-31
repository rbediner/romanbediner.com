/**
 * Invariant:
 * - Release watcher hygiene must only target repo-owned GitHub polling loops and must clean them predictably.
 * Why this exists:
 * - Prevents future sessions from leaving orphaned terminal watcher jobs behind after release verification.
 * What breaks if it fails:
 * - Repo-owned watcher loops can accumulate silently and confuse operators about what is still running.
 */

const path = require('path');

const ROOT = path.resolve(__dirname, '..', '..', '..');
const WATCHER_MANAGER_PATH = path.join(ROOT, 'scripts', 'release', 'manage-release-watchers.js');

describe('release watcher hygiene', () => {
  beforeEach(() => {
    jest.resetModules();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('detects repo-owned gh run list loops but ignores unrelated gh usage', () => {
    jest.doMock('child_process', () => ({
      execFileSync: jest.fn((command, args) => {
        if (command === 'ps') {
          return [
            " 101 1 /bin/zsh -lc while true; do gh run list --branch staging; sleep 15; done",
            " 202 1 /bin/zsh -lc gh run list --branch prod --limit 1",
            " 303 1 /bin/zsh -lc while true; do gh run list --branch prod; sleep 30; done"
          ].join('\n');
        }

        if (command === 'lsof' && args[2] === '101') {
          return `pcwd\nn${ROOT}\n`;
        }

        if (command === 'lsof' && args[2] === '303') {
          return 'pcwd\nn/Users/roman.bediner/Desktop/other-project\n';
        }

        return '';
      }),
      spawnSync: jest.fn(() => ({ status: 0 }))
    }));

    const watcherManager = require(WATCHER_MANAGER_PATH);
    const watchers = watcherManager.listRepoOwnedWatchers();

    expect(watchers).toHaveLength(1);
    expect(watchers[0].pid).toBe(101);
    expect(watchers[0].kind).toBe('gh-run-list-loop');
  });

  test('cleanup terminates detected repo-owned watcher loops', () => {
    const spawnSync = jest.fn(() => ({ status: 0 }));
    let psCalls = 0;

    jest.doMock('child_process', () => ({
      execFileSync: jest.fn((command, args) => {
        if (command === 'ps') {
          psCalls += 1;
          if (psCalls === 1) {
            return " 101 1 /bin/zsh -lc while true; do gh run list --branch staging; sleep 15; done\n";
          }
          return '';
        }

        if (command === 'lsof' && args[2] === '101') {
          return `pcwd\nn${ROOT}\n`;
        }

        return '';
      }),
      spawnSync
    }));

    const watcherManager = require(WATCHER_MANAGER_PATH);
    const result = watcherManager.cleanupWatchers(undefined, { timeoutMs: 10 });

    expect(result.killed).toHaveLength(1);
    expect(result.killed[0].pid).toBe(101);
    expect(spawnSync).toHaveBeenCalledWith('kill', ['-TERM', '101'], { stdio: 'ignore' });
  });
});
