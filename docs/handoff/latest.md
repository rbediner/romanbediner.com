# Cross-Machine Handoff (Latest)

- Handoff Sequence: 68
- Updated At (UTC): 2026-03-13T23:37:21Z
- Source Branch: codex/prod-promote
- Source Commit: 419333e4b30766d317f17f0bc479adaddecaf5ba (pre-handoff baseline)

## Current State
- Remote branches are aligned:
  - `origin/staging` -> `685f7c90f55330cf2864c4f448534cc15503ee33`
  - `origin/prod` -> `685f7c90f55330cf2864c4f448534cc15503ee33`
- This session now includes one additional local hotfix commit (not yet pushed at handoff update time):
  - guard downstream `Deploy Pages` jobs so non-prod `workflow_run` invocations are skipped safely instead of failing.

## What Changed In This Session
1. CI gate profiles are now automatic by branch/event in `.github/workflows/ci.yml`:
   - `staging` push -> `fast` gate
   - `prod` push -> `full` gate
   - `workflow_dispatch` -> `full` gate
2. Added explicit CI profile resolver job:
   - `gate-profile` job emits `fast` vs `full`.
   - Full-only jobs (`qa-tests`, `browser-tests`, `lighthouse-validation`, `build-artifact`) now run only when profile is `full`.
3. Production deploy now waits for CI completion:
   - `.github/workflows/deploy-pages.yml` now triggers from `workflow_run` of `CI` on `prod`.
   - Deploy checks out `workflow_run.head_sha` to ensure deployment of the tested commit.
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
6. Deploy-pages non-prod skip hardening:
   - Updated `.github/workflows/deploy-pages.yml` so `post-deploy-validation` runs only when `deploy-pages` actually succeeds.
   - Updated `.github/workflows/deploy-pages.yml` so `release-tag` runs only when `deploy-pages` succeeded on `prod`.
   - Updated README deployment notes to document this guard explicitly.

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
