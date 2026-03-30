# Cross-Machine Handoff (Latest)

- Handoff Sequence: 145
- Updated At (UTC): 2026-03-30T23:10:00Z
- Source Branch: staging
- Source Commit: d3d3972323e3f1b6d0abef07c46ef5ec41cbef49

## Current State
- `staging` and `prod` are aligned on the same shipped commit:
  - `d3d3972323e3f1b6d0abef07c46ef5ec41cbef49`
- The current work in progress is release-flow optimization only:
  - reduce duplicate full local CI-parity runs when promoting the exact already-tested staging SHA to `prod`
- The isolated staging preview remains available for future visual review at:
  - `https://rbediner.github.io/romanbediner-preview/`

## What Changed In This Session
1. Added a dedicated prod-promotion verifier:
   - `scripts/qa/verify-prod-promotion-candidate.js`
   - confirms `prod` HEAD matches `origin/staging`
   - confirms the push is still a fast-forward from `origin/prod`
   - confirms staging `CI` is already green for that SHA before allowing the fast prod path
2. Expanded the smart pre-push gate:
   - docs-only changes still use the lightweight docs gate
   - exact `staging -> prod` promotions now use the new prod-promotion verifier
   - all other code/runtime pushes still use full `qa:ci-parity`
3. Added release-guardrail coverage:
   - Jest tests for prod promotion candidate logic
   - automation contract tests for the new gate script and package script wiring
4. Updated operator documentation:
   - `README.md`
   - this handoff file
5. Hardened GitHub Actions monitoring auth:
   - `scripts/release/watch-ci-run.js` now reuses the existing `git` credential helper token for `github.com` when shell env tokens are missing
   - this prevents unauthenticated GitHub API rate-limit failures during local release verification on fresh shells

## Validation Performed
- Pending in this session after code edits:
  - `npm run test:jest`
  - `npm run test:node`
  - release-flow sanity check from `staging`

## Operator Notes
- Expected outcome after this change:
  - heavy local CI-parity runs still happen on `staging`
  - the matching `prod` promotion of that same SHA becomes much faster
- This is a release-flow / developer-experience improvement, not a product feature change.
- PRD note:
  - no PRD update is needed unless this session expands into user-facing behavior changes

## Fresh Machine Prerequisites (Operator Quick List)
1. Install `git`
2. Install Node `20.x` and `npm`
3. Install `python3`
4. Run:
```bash
nvm use
npm ci
python3 -m playwright install chromium
npm run session:ready
```

## URLs
- Staging preview base:
  - `https://rbediner.github.io/romanbediner-preview/`
- Production:
  - `https://romanbediner.com/`

## Startup Reminder For Future Codex Sessions
Before making changes, read in order:
1. `/README.md`
2. `/docs/handoff/latest.md`
3. `/docs/architecture/repo-contract.json`

Operator shortcut prompt:
- `session:start — read README + docs/handoff/latest, run session readiness, then verify staging/prod branch alignment and give me the current staging preview URL if preview work is involved.`
