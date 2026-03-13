# Cross-Machine Handoff (Latest)

- Handoff Sequence: 38
- Updated At (UTC): 2026-03-13T18:52:58Z
- Source Branch: staging
- Source Commit: 65b0d8ca8fbf7fb57f561d15369635d8398242de

## What Changed Most Recently
- Framework refinement patch is on `staging` (commit `7c5a040`) and staging preview deployment succeeded.
- Follow-up nav runtime patch is now committed locally for preview correctness:
  - `scripts/runtime/site-navigation.js`
  - `QA/tests/test-nav-links-contract.js`
- Preview routing logic now:
  - prefixes canonical nav links on `*.github.io` using active repo base path
  - skips already-prefixed preview hrefs to prevent double-prefix paths like `/romanbediner-preview/romanbediner-preview/...`
- README updated to document both behaviors under CI/preview architecture notes.

## Validation Status
- Local validation for follow-up fix:
  - `node QA/tests/test-nav-links-contract.js` ✅
  - `npm run -s test:node` ✅
- Last remote green status before follow-up push:
  - CI run `23065652684` ✅ success
  - Deploy Staging run `23065731349` ✅ success

## Branch Alignment
- `staging`: contains framework refinement commit and is receiving preview-nav double-prefix safeguard commit.
- `prod`: behind staging; do not promote until preview visual verification confirms nav works from all primary links.

## Operator Checklist (Next Machine)
1. `git fetch origin --prune`
2. `git checkout staging && git pull --ff-only origin staging`
3. If local changes exist, run:
   - `node QA/tests/test-nav-links-contract.js`
   - `npm run -s test:node`
4. Push to `staging` and wait for CI + Deploy Staging green.
5. Validate preview links:
   - `https://rbediner.github.io/romanbediner-preview/`
   - `https://rbediner.github.io/romanbediner-preview/framework/`
6. Click nav links in preview and verify no `/romanbediner-preview/romanbediner-preview/` URLs.
7. Promote to `prod` only after explicit visual approval.

## Notes
- If workflows stall, re-run using `gh` CLI before manual UI intervention.
- Preview publication target remains hard-locked to `rbediner/romanbediner-preview:staging-preview`.
