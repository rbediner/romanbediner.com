# Cross-Machine Handoff (Latest)

- Handoff Sequence: 31
- Updated At (UTC): 2026-03-13T16:36:00Z
- Source Branch: staging
- Source Commit: 60208c0fe2e7372fc733df4a1028f96ca328af1c

## What Changed Most Recently
- Fixed CI `link-validation` false-failure on staging framework rollout:
  - Root cause: crawler validated canonical production URL `https://romanbediner.com/framework/` during staging/local runs.
  - Added environment-aware skip behavior in `/scripts/qa/run-link-check.js`:
    - local/staging crawls skip canonical production-domain links
    - production crawls continue validating canonical domain links
  - Added guard test: `/QA/tests/test-link-validation-config.js`.
  - Documented behavior in `README.md`.
- Migrated Insights into a dedicated Framework route:
  - Added `/framework/index.html` with six-stage AI-Enabled Operations Framework narrative.
  - Added `/styles/framework.css`.
  - Added six framework icons under `/assets/icons/framework/`.
- Converted legacy `/insights/` to redirect:
  - `/insights/index.html` now redirects to `/framework/` and preserves canonical continuity.
- Updated global navigation labels/order and route targets:
  - `Home`, `About`, `Framework`, `Services`, `Connect`.
  - Shared nav model updated in `/scripts/runtime/site-navigation.js`.
- Updated sitemap/content tooling and diagnostics for `/framework/` route:
  - `generate-insight-links`, sitemap generation, metadata/link diagnostics, and route checks.
- Refactored QA/test contracts from old Insights toggle model to Framework-stage model:
  - Node tests, Python tests, Playwright route checks, metadata checks, and nav consistency checks.

## Validation Status
- Local full regression completed on staging branch commit lineage:
  - `npm test` passed (Node + Python + Jest + Playwright runtime suite).
  - `npm run test:links` now passes in CI-parity local server mode.
  - Visual regression suite remains opt-in and was skipped by default contract (`RUN_VISUAL_TESTS=1` not set).
- Staging preview publication is currently stale and not reflecting commit `2de2c30`:
  - Preview URL: `https://rbediner.github.io/romanbediner-preview/`
  - Observed state during polling:
    - `/framework/` => HTTP 404
    - root `Last-Modified` stayed at `Fri, 13 Mar 2026 01:13:38 GMT`
  - Two empty retrigger commits were pushed to `staging` to force workflow reruns:
    - `27dae0e` and `2de2c30`
  - Preview still served old artifact after both retriggers.

## Branch Alignment
- `staging` HEAD: `60208c0`
- `prod` HEAD: `718b649` (contains framework migration commit without retrigger commits)
- Branches are intentionally divergent due staging-only retrigger commits.

## Operator Checklist (Next Machine)
1. `git fetch origin --prune`
2. `git checkout staging && git pull --ff-only origin staging`
3. Validate latest CI runs for commit `60208c0` in GitHub Actions UI.
4. Validate staging preview publish:
   - Confirm `https://rbediner.github.io/romanbediner-preview/framework/` returns HTTP 200.
   - Confirm `/insights/` preview route redirects to `/framework/`.
5. Only after staging preview/CI are green, promote to `prod` using fast-forward-only release flow.
6. Re-run post-promotion production checks and update this handoff file again.

## Notes
- This file intentionally stores only the latest state.
- If preview remains stale, investigate Deploy Staging workflow permissions/preview-repo write token and environment rules before promoting to prod.
