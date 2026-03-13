# Cross-Machine Handoff (Latest)

- Handoff Sequence: 51
- Updated At (UTC): 2026-03-13T21:11:30Z
- Source Branch: staging
- Source Commit: 75aade1f66050ee773de180301dc7c4e02ea3c43

## What Changed Most Recently
- Installed GitHub CLI locally (no-Homebrew path):
  - binary: `~/.local/bin/gh`
  - version: `2.88.1`
  - PATH bootstrap added to `~/.zshrc`
- Applied Framework icon optical alignment refinement:
  - `styles/framework.css` `.framework-icon` uses:
    - `position: relative;`
    - `top: -4px;`
- Added QA contract coverage for the icon offset:
  - `QA/tests/test-insights-layout.js`
  - `QA/tests/test_insights_layout.py`
- Updated README architecture note:
  - Framework icon optical alignment offset is now documented under `Icon Asset Management`.
- Refreshed one stale visual baseline required by pre-push CI parity:
  - `QA/tests/visual-baselines/insights--mobile-full.png`

## Validation Status
- Local targeted checks (pass):
  - `node QA/tests/test-insights-layout.js` ✅
  - `python3 -m unittest QA/tests/test_insights_layout.py -v` ✅
  - `RUN_VISUAL_TESTS=1 python3 -m unittest QA.tests.test_visual_regression_playwright.VisualRegressionPlaywrightTest.test_01_visual_snapshots_for_critical_pages -v` ✅
- Pre-push CI-parity gate (full node + jest + python + visual) passed on push ✅
- GitHub Actions status on `staging` for commit `75aade1`:
  - `CI` ✅
  - `Deploy Staging` ✅

## Branch Alignment
- `staging`: updated to `75aade1` and green.
- `prod`: still at `1f353de` (not yet promoted in this pass).

## Preview Links (Staging)
- Main preview: `https://rbediner.github.io/romanbediner-preview/`
- Framework preview: `https://rbediner.github.io/romanbediner-preview/framework/`

## Operator Notes
- In non-login shells, `gh` may not be on PATH; use full path when needed:
  - `~/.local/bin/gh run list --repo rbediner/romanbediner.com --branch staging --limit 5`
- Workflow remains:
  1. push to `staging`
  2. wait for all tests + deploy green
  3. share preview link for visual sign-off
  4. promote exact commit to `prod`
