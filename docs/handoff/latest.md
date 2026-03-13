# Cross-Machine Handoff (Latest)

- Handoff Sequence: 21
- Updated At (UTC): 2026-03-13T01:08:53Z
- Source Branch: staging
- Source Commit: 3aa5e218fa6b3bccf0000f8cba731543e809fa02 (pre-handoff baseline)

## What Changed Most Recently
- Clarified and hardened release-process documentation contract:
  - assistant pushes to `staging` automatically only after local required QA passes
  - assistant waits for `staging` CI/tests to pass
  - assistant then provides explicit pass confirmation plus staging preview URL for visual inspection
  - `prod` promotion remains blocked until visual approval
- Updated machine-readable architecture docs to encode this release gate behavior:
  - `docs/architecture/environment-model.json` now includes staging preview `release_gate` invariants
  - `docs/architecture/repo-contract.json` now includes `release_policy` invariants
- Regenerated README architecture diagram/JSON section from environment model to keep docs synchronized.

## Validation Status
- `npm run docs:generate`: passed
- `npm run test:node`: passed
- `npm run test:jest -- --maxWorkers=50%`: passed

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
- Staging preview uses separate preview repository publication and does not share production Pages deployment state.
