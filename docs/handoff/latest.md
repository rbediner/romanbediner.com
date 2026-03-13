# Cross-Machine Handoff (Latest)

- Handoff Sequence: 26
- Updated At (UTC): 2026-03-13T03:25:00Z
- Source Branch: prod
- Source Commit: 17bfa8aafe4e4c5781d723c50f9b02360cc9b811

## What Changed Most Recently
- Footer quote refinement is live on production (`92781f5`) and anti-stall CI monitor retries are live (`93602a1`).
- README now explicitly codifies operator release order:
  1. push to `staging`
  2. run/await all tests
  3. only then share staging preview link
  4. promote the exact approved commit to `prod`
- README cross-machine section now requires handoff entries for branch alignment, staging preview state, CI lane status, and current blockers/manual steps.
- Staging deploy workflow now hard-locks preview publication branch to `staging-preview` (removed branch variable override path) to avoid accidental writes to preview `main`.
- Synced README machine-readable deployment section with source model (`docs/architecture/environment-model.json`) so docs automation/tests stay green.

## Validation Status
- Documentation integrity checks in this session:
  - `npm run docs:generate`: passed
  - `npm run docs:verify`: passed
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
