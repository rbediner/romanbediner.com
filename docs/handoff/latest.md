# Cross-Machine Handoff (Latest)

- Handoff Sequence: 69
- Updated At (UTC): 2026-03-13T23:53:01Z
- Source Branch: codex/prod-promote
- Source Commit: 6f2aac3a633e72f26a1cb14f976d5e9fc542665f (pre-handoff baseline)

## Current State
- Remote branches are aligned:
  - `origin/staging` -> `6f2aac3a633e72f26a1cb14f976d5e9fc542665f`
  - `origin/prod` -> `6f2aac3a633e72f26a1cb14f976d5e9fc542665f`
- This session now includes one additional local hotfix commit (not yet pushed at handoff update time):
  - restore deterministic prod deploy triggering by using `push` on `prod` plus explicit CI-success wait for the exact SHA.

## What Changed In This Session
1. CI gate profiles are now automatic by branch/event in `.github/workflows/ci.yml`:
   - `staging` push -> `fast` gate
   - `prod` push -> `full` gate
   - `workflow_dispatch` -> `full` gate
2. Added explicit CI profile resolver job:
   - `gate-profile` job emits `fast` vs `full`.
   - Full-only jobs (`qa-tests`, `browser-tests`, `lighthouse-validation`, `build-artifact`) now run only when profile is `full`.
3. Production deploy now waits for CI completion deterministically:
   - `.github/workflows/deploy-pages.yml` triggers on `push` to `prod`.
   - Deploy step blocks until `CI` is successful for the exact prod SHA via `watch-ci-run.js`.
   - This avoids branch ambiguity when the same commit exists on both `staging` and `prod`.
4. Release automation now waits for deploy completion too:
   - `scripts/release/promote-tested-staging-to-prod.sh` now monitors:
     - `CI` on prod SHA
     - `Deploy Pages` on prod SHA
   - `scripts/release/watch-ci-run.js` now supports optional `--workflow` filter.
5. Guardrail tests/docs updated:
   - Added `QA/tests/test-ci-gate-profile-automation.js`.
   - Updated `QA/tests/test-staging-preview-automation.js`.
   - Updated `QA/tests/test-release-sop-automation.js`.
   - Updated `docs/architecture/workflow-manifest.json`.
   - Updated `docs/architecture/environment-model.json`.
   - Regenerated README architecture diagram/JSON via `npm run docs:generate`.
6. Deploy-pages guardrails and contract updates:
   - Updated `.github/workflows/deploy-pages.yml` so `post-deploy-validation` runs only when `deploy-pages` actually succeeds.
   - Updated `.github/workflows/deploy-pages.yml` so `release-tag` runs only when `deploy-pages` succeeded.
   - Updated `QA/tests/test-staging-preview-automation.js` and `QA/tests/test-ci-gate-profile-automation.js` to enforce the new push+CI-gate deployment model.
   - Updated README and `docs/architecture/environment-model.json` to reflect the new deploy trigger semantics.

## Validation Performed
- `npm run docs:generate` PASS
- `node QA/tests/test-ci-gate-profile-automation.js` PASS
- `node QA/tests/test-staging-preview-automation.js` PASS
- `node QA/tests/test-workflow-integrity-automation.js` PASS
- `node QA/tests/test-release-sop-automation.js` PASS
- `npm run test:node` PASS
- `npm run test:jest` PASS

## Required Startup Order (Next Machine / Next Codex Session)
1. Read `/README.md`
2. Read `/docs/handoff/latest.md`
3. Read `/docs/architecture/repo-contract.json`
4. Run `npm run session:ready`

## Operator Notes
- No CI caching was introduced in this session (per operator preference).
- Staging preview URL remains:
  - `https://rbediner.github.io/romanbediner-preview/`
- Promotion flow remains staging-first with visual sign-off:
  - `staging` fast gate + preview
  - promote exact SHA to `prod`
  - `prod` full gate
  - deploy + post-deploy validation
