# Cross-Machine Handoff (Latest)

- Handoff Sequence: 89
- Updated At (UTC): 2026-03-15T21:28:53Z
- Source Branch: staging
- Source Commit: 0e90c667f1f19fede6c1d65f4a596f22b3ad8195

## Current State
- Remote branches currently remain at the prior aligned commit:
  - `origin/staging` -> `7bad14da7312081156f5d4513c5b918b76dd6a31`
  - `origin/prod` -> `7bad14da7312081156f5d4513c5b918b76dd6a31`
- Local branch: `staging`
- Local staging is ahead with three commits in this session:
  - `07e5c7f` remove duplicate framework stage labels in cards
  - `83d44df` handoff update for the card header cleanup
  - `0e90c66` refresh framework visual baselines after intended visual change

## What Changed
1. Framework hub card header cleanup:
   - removed redundant uppercase stage label lines from all six cards
   - card header now renders as icon + stage pill + title only
2. Stage pill/title spacing refinement:
   - reduced vertical spacing between pill row and title while preserving icon offsets
   - removed obsolete `.framework-stage-label` selectors in `styles/framework.css`
3. Visual baseline refresh:
   - updated `QA/tests/visual-baselines/insights--desktop-full.png`
   - updated `QA/tests/visual-baselines/insights--desktop-fold.png`
   - updated `QA/tests/visual-baselines/insights--mobile-full.png`

## Validation Performed
- `node QA/tests/test-insights-layout.js` (pass)
- `python3 -m unittest QA.tests.test_insights_layout -v` (pass)
- `RUN_VISUAL_TESTS=1 UPDATE_VISUAL_BASELINES=1 python3 -m unittest discover -s QA/tests -p test_visual_regression_playwright.py -v` (pass; baseline refresh)
- `RUN_VISUAL_TESTS=1 python3 -m unittest discover -s QA/tests -p test_visual_regression_playwright.py -v` (pass; strict compare)

## URLs
- Staging preview base:
  - `https://rbediner.github.io/romanbediner-preview/`
- Production:
  - `https://romanbediner.com/`

## Operator Notes
- Husky pre-push failed initially due expected visual diff after intentional framework header adjustments.
- Baselines were refreshed and strict visual compare now passes.
