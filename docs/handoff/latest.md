# Cross-Machine Handoff (Latest)

- Handoff Sequence: 8
- Updated At (UTC): 2026-03-12T00:51:48Z
- Source Branch: staging
- Source Commit: ec240e9dcda7d3c225c1f53065c62969d270a641 (pre-handoff baseline)

## What Changed Most Recently
- Added automated startup preflight command `npm run session:ready`.
- The preflight now checks Node version vs `.nvmrc`, handoff branch alignment, clean working tree, remote branch parity, and cloud-sync duplicate artifacts such as `scripts 2/`.
- README bootstrap instructions now recommend NVM and point operators to `npm run session:ready` before running full QA.
- Installed NVM on this machine, installed Node `20.20.1`, and configured login shells to source the NVM-managed runtime automatically.
- Removed duplicate Google Drive artifacts that had been created in the workspace (`AGENTS 2.md`, `scripts 2/`, `scripts 3/`, `scripts 4/`).
- Committed the startup automation as `ec240e9` (`Automate session readiness preflight`) and fast-forwarded local `staging`, local `prod`, `origin/staging`, and `origin/prod` to the same tested commit.
- Script layout remains intent-based and must stay as:
  - `/scripts/runtime`
  - `/scripts/qa`
  - `/scripts/release`
  - `/scripts/content`
  - `/scripts/diagnostics`

## Validation Status
- `node QA/tests/test-session-readiness-automation.js`: passed
- `node QA/tests/test-release-sop-automation.js`: passed
- `./node_modules/.bin/jest QA/tests/jest/session_readiness.test.js QA/tests/jest/deployment_sop.test.js QA/tests/jest/handoff_latest_contract.test.js --runInBand`: passed
- `npm run qa:ci-parity`: passed under Node `20.20.1` after rerunning with elevated permissions for local Playwright socket binding
- `zsh -lc 'node -v && npm -v'`: passed (`v20.20.1`, `10.8.2`)
- `npm run session:ready`: passed before commit for environment checks, and would now pass on a clean checkout of commit `ec240e9`

## Operator Checklist (Next Machine)
1. `git fetch origin --prune`
2. `git checkout staging && git pull --ff-only origin staging`
3. `nvm use` (Node 20 per `.nvmrc`), or install NVM first if it is missing
4. Run `npm run session:ready` and resolve any reported startup blockers before edits
5. Read `/README.md` and this file before edits
6. After changes, overwrite this file with new latest state and increment `Handoff Sequence`

## Notes
- This file must contain only the latest handoff state. Do not append historical logs here.
- This file is not updated automatically by the release script. Run `npm run handoff:update` or update it explicitly before ending a change session.
- Use Git commit history for older context; do not depend on release notes for current operator state.
