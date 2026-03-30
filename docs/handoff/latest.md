# Cross-Machine Handoff (Latest)

- Handoff Sequence: 146
- Updated At (UTC): 2026-03-30T18:08:48Z
- Source Branch: prod
- Source Commit: 91353b4c0e5a8264c0dffa10b99bd0f4d0aaa2fe

## Current State
- `staging` and `prod` are functionally aligned on the release-flow optimization commit:
  - `91353b4c0e5a8264c0dffa10b99bd0f4d0aaa2fe`
- This session shipped a release-flow improvement only:
  - exact `staging -> prod` promotions no longer replay the full local `qa:ci-parity` gate
  - `prod` now reuses the already-tested `staging` SHA after validating remote staging `CI`
- The isolated staging preview remains available for future visual review at:
  - `https://rbediner.github.io/romanbediner-preview/`

## What Changed In This Session
1. Added a dedicated prod-promotion verifier:
   - `/Users/roman.bediner/Library/CloudStorage/GoogleDrive-rbediner@gmail.com/My Drive/AI/Codex/romanbediner.com/scripts/qa/verify-prod-promotion-candidate.js`
   - verifies `prod` HEAD matches `origin/staging`
   - verifies the push remains a fast-forward from `origin/prod`
   - verifies staging `CI` is already green for that SHA before allowing the fast prod path
2. Expanded the smart pre-push gate:
   - `/Users/roman.bediner/Library/CloudStorage/GoogleDrive-rbediner@gmail.com/My Drive/AI/Codex/romanbediner.com/scripts/qa/run-prepush-gate.js`
   - docs-only changes still use the lightweight docs gate
   - exact `staging -> prod` promotions now use the new prod-promotion verifier
   - all other code/runtime pushes still use full `qa:ci-parity`
3. Added release guardrail coverage:
   - `/Users/roman.bediner/Library/CloudStorage/GoogleDrive-rbediner@gmail.com/My Drive/AI/Codex/romanbediner.com/QA/tests/jest/prod_promotion_gate.test.js`
   - expanded `/Users/roman.bediner/Library/CloudStorage/GoogleDrive-rbediner@gmail.com/My Drive/AI/Codex/romanbediner.com/QA/tests/jest/prepush_gate.test.js`
   - expanded `/Users/roman.bediner/Library/CloudStorage/GoogleDrive-rbediner@gmail.com/My Drive/AI/Codex/romanbediner.com/QA/tests/test-release-sop-automation.js`
4. Hardened GitHub Actions monitoring auth:
   - `/Users/roman.bediner/Library/CloudStorage/GoogleDrive-rbediner@gmail.com/My Drive/AI/Codex/romanbediner.com/scripts/release/watch-ci-run.js`
   - monitoring now checks `GITHUB_TOKEN`, then `GH_TOKEN`, then falls back to the existing `git credential` helper token for `github.com`
   - this prevents fresh-shell GitHub API rate-limit failures during local release verification
5. Updated operator documentation:
   - `/Users/roman.bediner/Library/CloudStorage/GoogleDrive-rbediner@gmail.com/My Drive/AI/Codex/romanbediner.com/README.md`
   - this handoff file

## Validation Performed
- Local:
  - `npm run test:jest`
  - `npm run test:node`
  - full local `qa:ci-parity` passed before the final `staging` push of `91353b4`
- Remote on `staging` for `91353b4`:
  - `CI` completed successfully
  - `Deploy Staging` completed successfully
- Promotion behavior check:
  - pushing `prod` for the same SHA used the new fast gate instead of rerunning the full local parity suite
  - the fast gate successfully verified remote staging `CI` and allowed the promotion
- Remote on `prod` for `91353b4`:
  - GitHub Actions runs were started from the promotion push
  - if a future session starts before they are manually rechecked, inspect `CI` and `Deploy Pages` for this SHA first

## Operator Notes
- This is a release-flow / developer-experience improvement, not a product feature change.
- Expected release behavior now:
  1. push code/runtime changes to `staging`
  2. let full local parity + remote staging `CI` run there
  3. promote the exact tested SHA to `prod`
  4. local pre-push on `prod` uses the fast promotion gate instead of replaying full local parity
- Best practice:
  - keep `staging` as the place where the heavy gate runs
  - keep `prod` promotion limited to the exact already-green staging SHA
- PRD note:
  - no PRD update is needed unless a future session changes user-facing behavior

## Fresh Machine Prerequisites (Operator Quick List)
1. Install `git`
2. Install Node `20.x` and `npm`
3. Install `python3`
4. Run:
```bash
nvm use
npm ci
python3 -m playwright install chromium
npm run session:ready
```
5. Optional but recommended:
   - install `gh` for easier GitHub Actions inspection on fresh machines

## URLs
- Staging preview base:
  - `https://rbediner.github.io/romanbediner-preview/`
- Production:
  - `https://romanbediner.com/`

## Startup Reminder For Future Codex Sessions
Before making changes, read in order:
1. `/README.md`
2. `/docs/handoff/latest.md`
3. `/docs/architecture/repo-contract.json`

Operator shortcut prompt:
- `session:start — read README + docs/handoff/latest, run session readiness, then verify staging/prod branch alignment and give me the current staging preview URL if preview work is involved.`
