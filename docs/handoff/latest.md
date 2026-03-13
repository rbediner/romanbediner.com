# Cross-Machine Handoff (Latest)

- Handoff Sequence: 65
- Updated At (UTC): 2026-03-14T00:05:00Z
- Source Branch: codex/prod-promote
- Source Commit: 79ecfa6322331fde0e47ec14c622b1a566bf4019

## Current State
- Local, `staging`, and `prod` were synchronized at `79ecfa6322331fde0e47ec14c622b1a566bf4019` before this final CI lane fix.
- One follow-up commit in this session updates Python QA contract parity for framework card-body width.

## What Changed In This Session
1. Restored missing handoff file and refreshed cross-machine setup guidance in `README.md`.
2. Updated framework width contract in Node QA:
   - `QA/tests/test-insights-layout.js`
   - Expected `.card-body max-width` changed from `760px` to `none`.
3. Updated matching framework width contract in Python QA:
   - `QA/tests/test_insights_layout.py`
   - Expected `.card-body max-width` changed from `760px` to `none`.

## Validation Performed
- `npm run docs:verify` PASS
- `node QA/tests/test-repo-hygiene.js` PASS
- `node QA/tests/test-insights-layout.js` PASS
- `python3 -m unittest QA.tests.test_insights_layout -v` PASS

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
