# Cross-Machine Handoff (Latest)

- Handoff Sequence: 15
- Updated At (UTC): 2026-03-12T23:24:05Z
- Source Branch: staging
- Source Commit: 82e78d6790d05296e0501024f3de222c800a9851 (pre-handoff baseline)

## What Changed Most Recently
- Implemented safe isolated staging preview deployment for `staging` using preview repo publication.
- Added preview artifact builder and verifier:
  - `scripts/build/create-preview-artifact.js`
  - `scripts/qa/verify-preview-artifact.js`
- Added preview repo publisher:
  - `scripts/release/publish-preview-repo.js`
- Refactored `.github/workflows/deploy-staging.yml` to:
  - trigger from successful `CI` completion on `staging`
  - build + verify preview artifact
  - publish preview artifact to isolated preview repo branch
  - emit clickable preview URL in logs and `$GITHUB_STEP_SUMMARY`
  - fail explicitly with summary when preview publish fails
- Updated deployment architecture docs:
  - `docs/architecture/environment-model.json`
  - `docs/architecture/workflow-manifest.json`
  - `docs/architecture/repo-contract.json`
  - `README.md` (new `Staging Preview` section + token rotation procedure)
- Added staging preview automation guardrail test:
  - `QA/tests/test-staging-preview-automation.js`
- Extended artifact automation guardrail test for preview artifact scripts:
  - `QA/tests/test-artifact-integrity-automation.js`

## Validation Status
- `npm run test:node`: passed
- `npm run test:jest`: passed
- `npm run test:qa-full`: passed
  - Python suite skipped local socket-bind/browser server tests in this runtime sandbox (`Operation not permitted`)
  - visual regression tests remained opt-in and were skipped without `RUN_VISUAL_TESTS=1`

## Operator Checklist (Next Machine)
1. `git fetch origin --prune`
2. `git checkout staging && git pull --ff-only origin staging`
3. `nvm use` (Node 20 per `.nvmrc`)
4. Run `npm run session:ready`
5. Read in order before architecture changes:
   - `/README.md`
   - `/docs/handoff/latest.md`
   - `/docs/architecture/repo-contract.json`

## Notes
- This file must contain only the latest handoff state; do not append logs.
- This file is intentionally updated by hand at session end after code/test changes.
- Staging preview now uses separate preview repository publication and does not share production Pages deployment state.
