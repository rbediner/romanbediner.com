# Cross-Machine Handoff (Latest)

- Handoff Sequence: 147
- Updated At (UTC): 2026-03-30T22:46:30Z
- Source Branch: staging
- Source Commit: eb7055665ff816321f6183cc1cc4b4ab4187155f

## Current State
- This session implements the first full selective QA gate model for review on `staging`.
- The old blunt `fast/full` CI language has been replaced in code/docs with five explicit gate profiles:
  - `docs-only`
  - `localized-page`
  - `shared-ui`
  - `release-infra`
  - `full-regression`
- Production smoke remains a separate post-deploy verification step through:
  - `/Users/roman.bediner/Library/CloudStorage/GoogleDrive-rbediner@gmail.com/My Drive/AI/Codex/romanbediner.com/scripts/qa/verify-live-production.js`
  - npm alias: `npm run qa:smoke:prod`
- Review document created for next-day operator review:
  - `/Users/roman.bediner/Library/CloudStorage/GoogleDrive-rbediner@gmail.com/My Drive/AI/Codex/romanbediner.com/docs/qa/selective-gate-review-2026-03-30.md`

## What Changed In This Session
1. Added a shared selective-gate classifier:
   - `/Users/roman.bediner/Library/CloudStorage/GoogleDrive-rbediner@gmail.com/My Drive/AI/Codex/romanbediner.com/scripts/qa/resolve-gate-profile.js`
   - classifies changed files into the five gate profiles
   - includes route-scope mapping for `home`, `about`, `services`, `framework`, and `connect`
2. Added a measurable selective local gate runner:
   - `/Users/roman.bediner/Library/CloudStorage/GoogleDrive-rbediner@gmail.com/My Drive/AI/Codex/romanbediner.com/scripts/qa/run-selective-gate.js`
   - runs the exact local commands for the selected gate
   - writes timing metrics to:
     - `/Users/roman.bediner/Library/CloudStorage/GoogleDrive-rbediner@gmail.com/My Drive/AI/Codex/romanbediner.com/QA/results/gate-metrics/latest-local-gate.json`
3. Expanded local npm entrypoints:
   - `qa:gate:resolve`
   - `qa:gate:run`
   - `qa:gate:docs-only`
   - `qa:gate:localized-page`
   - `qa:gate:shared-ui`
   - `qa:gate:release-infra`
   - `qa:gate:full-regression`
   - `qa:smoke:prod`
   - `qa:smoke:preview`
4. Upgraded CI gate selection:
   - `/Users/roman.bediner/Library/CloudStorage/GoogleDrive-rbediner@gmail.com/My Drive/AI/Codex/romanbediner.com/.github/workflows/ci.yml`
   - CI now resolves the selective gate profile through the shared classifier
   - CI job summary now prints the selected profile and which validations are enabled
   - expensive jobs (`qa-tests`, `browser-tests`, `lighthouse-validation`, `build-artifact`) are now driven by explicit profile outputs instead of old `full_gate` logic
5. Updated tests for the new model:
   - `/Users/roman.bediner/Library/CloudStorage/GoogleDrive-rbediner@gmail.com/My Drive/AI/Codex/romanbediner.com/QA/tests/jest/prepush_gate.test.js`
   - `/Users/roman.bediner/Library/CloudStorage/GoogleDrive-rbediner@gmail.com/My Drive/AI/Codex/romanbediner.com/QA/tests/jest/selective_gate_runner.test.js`
   - `/Users/roman.bediner/Library/CloudStorage/GoogleDrive-rbediner@gmail.com/My Drive/AI/Codex/romanbediner.com/QA/tests/jest/deployment_sop.test.js`
   - `/Users/roman.bediner/Library/CloudStorage/GoogleDrive-rbediner@gmail.com/My Drive/AI/Codex/romanbediner.com/QA/tests/test-ci-gate-profile-automation.js`
   - `/Users/roman.bediner/Library/CloudStorage/GoogleDrive-rbediner@gmail.com/My Drive/AI/Codex/romanbediner.com/QA/tests/test-release-sop-automation.js`
6. Updated docs and machine-readable architecture:
   - `/Users/roman.bediner/Library/CloudStorage/GoogleDrive-rbediner@gmail.com/My Drive/AI/Codex/romanbediner.com/README.md`
   - `/Users/roman.bediner/Library/CloudStorage/GoogleDrive-rbediner@gmail.com/My Drive/AI/Codex/romanbediner.com/docs/architecture/environment-model.json`
   - this handoff file

## Validation Performed
- Local:
  - `npm run test:jest`
  - `npm run test:node`
  - `npm run qa:gate:release-infra`
  - `npm run qa:smoke:prod`
- Selective gate measurement sample captured:
  - profile: `release-infra`
  - total duration: `5383ms`
  - metrics file:
    - `/Users/roman.bediner/Library/CloudStorage/GoogleDrive-rbediner@gmail.com/My Drive/AI/Codex/romanbediner.com/QA/results/gate-metrics/latest-local-gate.json`

## Operator Notes
- This is not yet a product/UX change; it is QA/release architecture work.
- The intended operating model after review is:
  1. `staging` remains the proving ground
  2. the classifier chooses the smallest responsible gate
  3. `prod` promotion still uses the already-tested staging SHA when eligible
  4. `qa:smoke:prod` remains mandatory after deploy
- Google Analytics is explicitly accounted for in the gate design and in the production smoke gate.
- The review document for tomorrow is the best place to start if the goal is to discuss what each gate should include/exclude.

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
- `session:start — read README + docs/handoff/latest, run session readiness, then verify staging/prod branch alignment and tell me the current staging preview URL if preview work is involved.`
