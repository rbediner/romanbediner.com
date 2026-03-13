# Cross-Machine Handoff (Latest)

- Handoff Sequence: 64
- Updated At (UTC): 2026-03-13T23:58:00Z
- Source Branch: codex/prod-promote
- Source Commit: 263ab4b00bf61bbfa71d567233f2f3bbd4f199af

## Current State
- `origin/prod`, `origin/staging`, and local baseline were previously aligned at:
  - `c501ae0b98cd78b974a4bffd4b73d8721583d352`
- New pending commit set adds CI guardrail consistency fix for framework text-width contract.

## What Changed In This Session
1. Restored missing handoff file and refreshed cross-machine setup guidance in `README.md`.
2. Synced staging branch to production baseline commit before follow-up fix.
3. Fixed CI parity failure root cause:
   - Updated `QA/tests/test-insights-layout.js`
   - Contract changed from `.card-body max-width: 760px` to `.card-body max-width: none`
   - This matches current framework production behavior that prevents premature Integration bullet wrapping.

## Validation Performed
- `npm run docs:verify` PASS
- `node QA/tests/test-repo-hygiene.js` PASS
- `node QA/tests/test-insights-layout.js` PASS (after contract update)

## Tooling + Access Contract (Next Machine)
1. Use Node 20 (`nvm use`).
2. Install dependencies with `npm ci`.
3. Ensure GitHub CLI is installed and on PATH:
   - Preferred: `brew install gh`
   - Fallback: local install in `~/.local/bin` (documented in README)
4. Authenticate GitHub CLI with required scopes:
   - `gh auth login --web --scopes repo,workflow`
5. Verify environment before release operations:
   - `gh --version`
   - `gh auth status`
   - `npm test`

## Release Flow Reminder
- Required path: `staging` -> tests green -> staging preview verification -> promote exact commit to `prod`.
- If Actions stall/cancel due to queue contention, re-run jobs for the same commit.
