# Cross-Machine Handoff (Latest)

- Handoff Sequence: 12
- Updated At (UTC): 2026-03-12T22:28:38Z
- Source Branch: staging
- Source Commit: ea08e3206059a226d0107457b3410b7d5347092c (pre-fix baseline)

## What Changed Most Recently
- Fixed prod-only Jest drift-check fragility in shallow CI clones:
  - `QA/tests/jest/readme_integrity.test.js` now falls back to `git show --pretty="" --name-only HEAD` when branch-range and `HEAD~1` diffs are unavailable in CI.
- Updated README documentation to reflect CI drift-check fallback behavior.

## Validation Status
- `CI=true npm run test:jest -- --maxWorkers=50%`: passed
- `npm run test:node`: passed

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
- If true staging live preview is required in future, use a separate Pages target (repo/project) instead of reusing production Pages configuration.
