# Cross-Machine Handoff (Latest)

- Handoff Sequence: 28
- Updated At (UTC): 2026-03-13T02:13:17Z
- Source Branch: staging
- Source Commit: 91e76255a9fadb81c8235cfdfeaf0400bd7c87dc

## What Changed Most Recently
- Fixed staging preview branch creation edge case:
  - `scripts/release/publish-preview-repo.js` now pushes `staging-preview` even when preview content has no diff against preview repo default branch.
  - Prevents successful deploy runs from leaving preview repo without the `staging-preview` branch.
- Added/updated guardrails:
  - `QA/tests/test-staging-preview-automation.js` now enforces hard-locked `PREVIEW_BRANCH: staging-preview` and branch-creation fallback logic in preview publisher.
- README staging preview section updated to document this behavior.

## Validation Status
- Validation checks in this step:
  - `node QA/tests/test-staging-preview-automation.js`: passed
  - `npm run verify:workflow-integrity`: passed
  - `npm run test:jest -- readme_structure.test.js readme_integrity.test.js`: passed

## Operator Checklist (Next Machine)
1. `git fetch origin --prune`
2. `git checkout staging && git pull --ff-only origin staging`
3. `nvm use` (Node 20 per `.nvmrc`)
4. Run `npm run session:ready`
5. For release flow: do not provide preview URL before all tests pass.
6. Read in order before architecture changes:
   - `/README.md`
   - `/docs/handoff/latest.md`
   - `/docs/architecture/repo-contract.json`
7. Before promoting: ensure `prod` fast-forwards to the exact tested staging commit only.

## Notes
- This file must contain only the latest handoff state; do not append logs.
- This file is intentionally updated by hand at session end after code/test changes.
- Staging preview uses separate preview repository publication and does not share production Pages deployment state.
- `romanbediner.com` repo has no `main` branch; only `staging` and `prod` are active release branches.
