# Cross-Machine Handoff (Latest)

- Handoff Sequence: 35
- Updated At (UTC): 2026-03-13T18:05:22Z
- Source Branch: staging
- Source Commit: 8aa30654ec2f5ccab408711617a9a2c57e1d4389

## What Changed Most Recently
- Refined `/framework/` content and presentation without changing page architecture:
  - preserved vertical section flow, anchor navigation, and six-stage section model
  - upgraded stage hierarchy to `H2` (stage) + `H3` (full framework title)
  - updated stage copy so every section now contains exactly five bullets
  - updated bottom transition to Services (`THE EXECUTION LAYER`, `Transition to Services →`, `/services/`)
- Refined framework visual contracts in `/styles/framework.css`:
  - stage line: `3px` at `0.35` opacity
  - marker dots: `10px`
  - section cards: white + `#e5e7eb` border + subtle hover polish
  - intro box de-emphasis with lighter tint/border/padding
  - refined arrow styling and stage pill spacing/weight
- Replaced all framework icons under `/assets/icons/framework/` with structural black stroke + single blue-node accent style.
- Updated QA contracts to enforce the new requirements:
  - `/QA/tests/test-insights-layout.js`
  - `/QA/tests/test_insights_layout.py`
  - `/QA/tests/test-transition-blocks.js`
- README auto-generated framework stage links updated by QA runner to match stage headings.

## Validation Status
- Focused framework checks passed:
  - `node QA/tests/test-insights-layout.js`
  - `node QA/tests/test-transition-blocks.js`
  - `python3 -m unittest QA.tests.test_insights_layout -v`
- Full Node QA suite passed:
  - `npm run -s test:node`

## Branch Alignment
- `staging`: contains framework refinement changes and passing local QA.
- `prod`: not yet promoted with this refinement set.

## Operator Checklist (Next Machine)
1. `git fetch origin --prune`
2. `git checkout staging && git pull --ff-only origin staging`
3. Run:
   - `npm run -s test:node`
   - `python3 -m unittest QA.tests.test_insights_layout -v`
4. Push to `staging`.
5. Confirm CI and Deploy Staging are green.
6. Validate preview:
   - `https://rbediner.github.io/romanbediner-preview/framework/`
7. Promote to `prod` only after visual approval on preview.

## Notes
- Keep using `staging` for validation and `prod` for deployment.
- If workflows stall, re-run from CLI with `gh` first.
