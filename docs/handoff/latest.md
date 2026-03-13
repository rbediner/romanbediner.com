# Cross-Machine Handoff (Latest)

- Handoff Sequence: 33
- Updated At (UTC): 2026-03-13T16:58:00Z
- Source Branch: staging
- Source Commit: c189d1f141e9494b38b098801911a8eda7d63b84

## What Changed Most Recently
- Enabled GitHub CLI automation on this machine:
  - Installed `gh` locally at `~/.local/bin/gh` (v2.88.1).
  - Authenticated as `rbediner` with `repo` and `workflow` scopes.
  - CLI workflow control is now available for reruns/dispatch without manual UI dependency.
- Fixed staging CI `link-validation` false-fail for framework rollout:
  - `scripts/qa/run-link-check.js` now skips canonical production domain links when target host is local/staging.
  - Added `QA/tests/test-link-validation-config.js` and wired it into `test:node`.
- Fixed artifact packaging omission that caused `/framework/` preview 404 despite green deploy jobs:
  - Added `framework` to `scripts/build/create-artifact.js` include paths.
  - Added `framework` route rewriting support in `scripts/build/create-preview-artifact.js`.
  - Added guard test `QA/tests/test-framework-artifact-packaging.js`.
- Updated README with cross-machine CLI bootstrap section (dependencies, auth, verification commands).

## Validation Status
- Local validation after fixes:
  - `npm run test:node` passed.
  - `npm run test:links` passed in local server mode (`http://127.0.0.1:4173`).
- Prior full suite (`npm test`) already passed for framework migration before this patch set.
- Remaining action:
  - wait for CI + Deploy Staging to republish preview artifact with framework folder included.

## Branch Alignment
- `staging`: commit `c189d1f141e9494b38b098801911a8eda7d63b84` pushed and awaiting green CI/deploy confirmation.
- `prod`: remains behind staging; do not promote until staging preview shows `/framework/` live and verified.

## Operator Checklist (Next Machine)
1. `git fetch origin --prune`
2. `git checkout staging && git pull --ff-only origin staging`
3. Confirm `gh auth status` is valid (or re-auth with `gh auth login --web --scopes repo,workflow`).
4. Run:
   - `npm run test:node`
   - `npm run test:links` (with local server if needed)
5. Push staging changes, monitor CI via CLI (`gh run list --workflow ci.yml --branch staging`).
6. Trigger/verify Deploy Staging via CLI (`gh workflow run deploy-staging.yml --ref staging`).
7. Confirm preview:
   - `https://rbediner.github.io/romanbediner-preview/framework/` returns 200 and renders framework page.
8. Only after visual approval, promote tested staging commit to `prod`.

## Notes
- Staging preview publication branch remains `staging-preview` in `rbediner/romanbediner-preview`.
- If any workflow stalls, use CLI rerun first; avoid prolonged manual wait loops.
