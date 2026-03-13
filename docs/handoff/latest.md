# Cross-Machine Handoff (Latest)

- Handoff Sequence: 63
- Updated At (UTC): 2026-03-13T23:45:00Z
- Source Branch: codex/prod-promote
- Source Commit: c501ae0b98cd78b974a4bffd4b73d8721583d352

## Current State
- Branches are aligned at the same commit:
  - `origin/prod`: `c501ae0b98cd78b974a4bffd4b73d8721583d352`
  - `origin/staging`: `c501ae0b98cd78b974a4bffd4b73d8721583d352`
  - local `HEAD`: `c501ae0b98cd78b974a4bffd4b73d8721583d352`
- Staging preview publication remains sourced from `staging` into preview repo branch `staging-preview`.

## What Changed In This Cleanup Pass
- Restored missing handoff file after accidental deletion.
- Updated `/README.md` for cross-machine reliability:
  - Added explicit `gh` PATH bootstrap for `~/.local/bin`.
  - Added required verification commands (`gh --version`, `gh auth status`).
  - Added framework text-width note for Integration bullet wrapping prevention (`.card-body { max-width: none; }`).

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
