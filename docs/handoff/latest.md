# Cross-Machine Handoff (Latest)

- Handoff Sequence: 70
- Updated At (UTC): 2026-03-13T23:58:12Z
- Source Branch: codex/prod-promote
- Source Commit: a85fb753dc0046689693945de02e715df7fbd764 (pre-handoff baseline)

## Current State
- Remote branches are aligned:
  - `origin/staging` -> `a85fb753dc0046689693945de02e715df7fbd764`
  - `origin/prod` -> `a85fb753dc0046689693945de02e715df7fbd764`
- Local session includes one additional unpushed hotfix commit at handoff update time:
  - `deploy-pages.yml` now passes `GITHUB_TOKEN` into the CI-watch step to avoid unauthenticated API rate-limit failures during prod deployment.

## What Changed In This Session
1. Production deploy trigger model was hardened:
   - `/.github/workflows/deploy-pages.yml` now triggers on `push` to `prod`.
   - Deploy waits for matching `CI` success on the same SHA using `scripts/release/watch-ci-run.js`.
2. Eliminated branch ambiguity from `workflow_run.head_branch`:
   - Prevents skipped/misdirected deploy behavior when the same SHA exists on both `staging` and `prod`.
3. Updated guardrail tests to match deployment contract:
   - `/QA/tests/test-ci-gate-profile-automation.js`
   - `/QA/tests/test-staging-preview-automation.js`
4. Updated architecture docs:
   - `/README.md` deployment section now describes `push:prod + SHA-matched CI gate`.
   - `/docs/architecture/environment-model.json` deploy trigger updated accordingly.

## Validation Performed
- `npm run docs:generate` PASS
- `npm run test:node` PASS
- `npm run test:jest` PASS
- Staging verification for `a85fb753dc0046689693945de02e715df7fbd764`:
  - CI success: https://github.com/rbediner/romanbediner.com/actions/runs/23075272201
  - Deploy Staging success: https://github.com/rbediner/romanbediner.com/actions/runs/23075290686

## Required Startup Order (Next Machine / Next Codex Session)
1. Read `/README.md`
2. Read `/docs/handoff/latest.md`
3. Read `/docs/architecture/repo-contract.json`
4. Run `npm run session:ready`

## Operator Notes
- Staging preview URL:
  - `https://rbediner.github.io/romanbediner-preview/`
- Promotion flow remains staging-first:
  - `staging` fast gate + preview review
  - promote exact approved SHA to `prod`
  - `prod` full gate + deploy + post-deploy validation
- No CI caching was introduced (per operator preference).
