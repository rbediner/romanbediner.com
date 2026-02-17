# QA Test Results

Date: 2026-02-17

## Automated Results

1. `python3 -m unittest discover -s QA/tests -v`
- Result: PASS
- Output summary: 20 tests run, 0 failures, 3 skipped in this local environment.
- Skips: Playwright runtime suites require local socket bind in this sandbox.

2. `UPDATE_VISUAL_BASELINES=1 python3 -m unittest discover -s QA/tests -p test_visual_regression_playwright.py -v`
- Result: PASS
- Output summary: 8 visual/layout integrity tests run, 0 failures.
- Baselines refreshed and committed in `QA/tests/visual-baselines/`.

3. `npm run test:node`
- Result: NOT RUN LOCALLY
- Reason: `node` runtime is not available in this machine.
- CI expectation: run in GitHub Actions (`.github/workflows/ci.yml`) with Node 20.

## Cohesion Notes

- Test suite path migration finalized: `tests/` -> `QA/tests/`.
- Package scripts, QA docs, and baseline paths are now aligned to `QA/tests`.
- Insights expand behavior now uses smooth `max-height` + `opacity` animation and is validated by both static and visual tests.
- GA events validated for both `insight_expand` and `insight_collapse`, with warning behavior when `gtag` is unavailable.

## Build Policy Confirmation

- Visual and layout integrity checks are wired to fail on regression conditions.
- Baseline snapshots for all critical routes are present:
  - Home, About, Services, Insights, Connect
  - Desktop full page, desktop fold, mobile full page
  - Additional state baselines for Insights expand and Operating Philosophy normal/hover.
