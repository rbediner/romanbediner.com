# Cross-Machine Handoff (Latest)

- Handoff Sequence: 141
- Updated At (UTC): 2026-03-27T14:36:48Z
- Source Branch: prod
- Source Commit: acd1712458b23167f8d927a167d421b3176a48ac (release baseline)

## Current State
- Remote branch heads:
  - `origin/prod` -> `acd1712458b23167f8d927a167d421b3176a48ac`
  - `origin/staging` -> `acd1712458b23167f8d927a167d421b3176a48ac`
- Local branch: `prod`
- Branch alignment:
  - `staging` and `prod` are aligned at `acd1712`
  - working tree currently includes only this handoff file update

## What Changed In This Session
1. Released staged changes to production:
   - promoted tested SHA `acd1712458b23167f8d927a167d421b3176a48ac` from `staging` to `prod`
2. Verified production release for exact SHA:
   - CI run passed: `https://github.com/rbediner/romanbediner.com/actions/runs/23651363123`
   - Deploy Pages run passed: `https://github.com/rbediner/romanbediner.com/actions/runs/23651363127`
   - Live smoke checks passed on `https://romanbediner.com/`
3. Regression coverage executed during release flow:
   - Node contracts + Jest + Python QA + Playwright runtime + visual regression
   - one intermittent Playwright `networkidle` timeout occurred in pre-push hook on `/connect/`; immediate targeted rerun passed (`QA/tests/test_ga_runtime_playwright.py`)

## Validation Performed
- `npm run release:staging-prod` (completed through promotion sequence; pre-push retry showed flaky timeout in one rerun)
- `python3 -m unittest QA/tests/test_ga_runtime_playwright.py -v` (PASS on rerun)
- `npm run release:verify-prod -- --sha acd1712458b23167f8d927a167d421b3176a48ac` (PASS)

## Operator Notes
- Production is currently live at SHA `acd1712` and verified.
- CI/Deploy evidence is attached above for release traceability.
- PRD: no new architecture or measurement model changes were introduced in this release session; prior PRD updates from the staged patch remain applicable.

## URLs
- Staging preview base:
  - `https://rbediner.github.io/romanbediner-preview/`
- Production:
  - `https://romanbediner.com/`
