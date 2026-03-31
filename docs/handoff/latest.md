# Cross-Machine Handoff (Latest)

- Handoff Sequence: 153
- Updated At (UTC): 2026-03-31T23:32:00Z
- Source Branch: prod
- Source Commit: a9822c3ec5b9f1e65dff82c91c18ae35b2227d7b (docs-only gate optimization ready for promotion)

## Current State
- This session upgrades the selective QA system from the first gate draft to a more protective `v1.1` model on `staging`.
- The old blunt `fast/full` CI language has been replaced in code/docs with five explicit gate profiles:
  - `docs-only`
  - `localized-page`
  - `shared-ui`
  - `release-infra`
  - `full-regression`
- Production smoke remains a separate post-deploy verification step and now includes a lightweight live browser pass through:
  - `/Users/roman.bediner/Library/CloudStorage/GoogleDrive-rbediner@gmail.com/My Drive/AI/Codex/romanbediner.com/scripts/qa/verify-live-production.js`
  - `/Users/roman.bediner/Library/CloudStorage/GoogleDrive-rbediner@gmail.com/My Drive/AI/Codex/romanbediner.com/scripts/qa/verify-live-browser-smoke.js`
  - npm alias: `npm run qa:smoke:prod`
- Release-pipeline correction completed:
  - the first prod rollout after browser smoke integration exposed a workflow bug: `post-deploy-validation` installed Chromium but did not run `npm ci`, so live smoke failed with `Cannot find module 'playwright'` after the site had already deployed
  - the immediate rerun fixed that dependency gap, but then surfaced a second issue: live browser smoke treated a CSP-blocked `static.cloudflareinsights.com` beacon attempt as an app runtime failure
  - the follow-up prod release fixed both gaps and completed successfully end-to-end:
    - `/Users/roman.bediner/Library/CloudStorage/GoogleDrive-rbediner@gmail.com/My Drive/AI/Codex/romanbediner.com/.github/workflows/deploy-pages.yml` now installs Node dependencies before browser smoke
    - `/Users/roman.bediner/Library/CloudStorage/GoogleDrive-rbediner@gmail.com/My Drive/AI/Codex/romanbediner.com/scripts/qa/run-browser-smoke.js` now ignores only that known non-app CSP-blocked beacon noise while keeping real runtime errors release-blocking
    - new automation guardrail coverage was added before re-driving the fix through `staging` and `prod`
- Operator release rule is now explicit in docs:
  - stay with the release until the final remote workflow for that environment has concluded
  - do not report completion for `staging`, preview publication, or `prod` while any deploy or validation job is still running
- Docs-only local QA was further optimized this session:
  - `scripts/qa/resolve-gate-profile.js` now maps `docs-only` to a single dedicated command:
    - `npm run test:docs-gate`
  - `test:docs-gate` intentionally runs only:
    - `npm run docs:verify`
    - `QA/tests/jest/readme_integrity.test.js`
    - `QA/tests/jest/readme_structure.test.js`
    - `QA/tests/jest/handoff_latest_contract.test.js`
    - `QA/tests/jest/deployment_sop.test.js`
  - this removes the old docs-only dependency on the full `test:node` + full Jest bundle while preserving README, handoff, and SOP safety
  - measured local improvement on this machine:
    - previous docs-only pre-push gate: about `8666ms`
    - optimized docs-only selective gate: about `1954ms`
- Review document created for next-day operator review:
  - `/Users/roman.bediner/Library/CloudStorage/GoogleDrive-rbediner@gmail.com/My Drive/AI/Codex/romanbediner.com/docs/qa/selective-gate-review-2026-03-30.md`

## What Changed In This Session
1. Strengthened the shared selective-gate classifier:
   - `/Users/roman.bediner/Library/CloudStorage/GoogleDrive-rbediner@gmail.com/My Drive/AI/Codex/romanbediner.com/scripts/qa/resolve-gate-profile.js`
   - still classifies changed files into the five gate profiles
   - now emits route-scoped browser commands so `localized-page` and `shared-ui` can run the smallest responsible browser coverage
   - route scopes remain `home`, `about`, `services`, `framework`, and `connect`
2. Updated the measurable selective local gate runner:
   - `/Users/roman.bediner/Library/CloudStorage/GoogleDrive-rbediner@gmail.com/My Drive/AI/Codex/romanbediner.com/scripts/qa/run-selective-gate.js`
   - runs the exact local commands for the selected gate
   - now resolves route placeholders into concrete browser smoke commands before execution
   - writes timing metrics to:
     - `/Users/roman.bediner/Library/CloudStorage/GoogleDrive-rbediner@gmail.com/My Drive/AI/Codex/romanbediner.com/QA/results/gate-metrics/latest-local-gate.json`
3. Added targeted browser smoke tooling:
   - `/Users/roman.bediner/Library/CloudStorage/GoogleDrive-rbediner@gmail.com/My Drive/AI/Codex/romanbediner.com/scripts/qa/run-browser-smoke.js`
   - `/Users/roman.bediner/Library/CloudStorage/GoogleDrive-rbediner@gmail.com/My Drive/AI/Codex/romanbediner.com/scripts/qa/verify-live-browser-smoke.js`
   - browser smoke now explicitly protects:
     - shared nav labels/hrefs on desktop and mobile
     - mobile menu open/close and overflow safety
     - GA bootstrap/runtime availability
     - homepage hero alignment and single-line heading contract
     - framework stage-pill interaction behavior
     - connect form shell rendering
     - orb bullet icon size and spacing contract (`8px` bullet with required margin)
4. Expanded local npm entrypoints:
   - `qa:gate:resolve`
   - `qa:gate:run`
   - `qa:gate:docs-only`
   - `qa:gate:localized-page`
   - `qa:gate:shared-ui`
   - `qa:gate:release-infra`
   - `qa:gate:full-regression`
   - `qa:browser:smoke`
   - `qa:smoke:prod`
   - `qa:smoke:prod:fetch`
   - `qa:smoke:prod:browser`
   - `qa:smoke:preview`
5. Upgraded CI gate selection:
   - `/Users/roman.bediner/Library/CloudStorage/GoogleDrive-rbediner@gmail.com/My Drive/AI/Codex/romanbediner.com/.github/workflows/ci.yml`
   - CI now resolves the selective gate profile through the shared classifier
   - CI job summary now prints the selected profile and which validations are enabled
   - expensive jobs (`qa-tests`, `browser-tests`, `lighthouse-validation`, `build-artifact`) are now driven by explicit profile outputs instead of old `full_gate` logic
   - browser job now runs the resolved browser command, which means:
     - `localized-page` gets targeted browser smoke
     - `shared-ui` gets browser smoke across canonical routes
     - `full-regression` still uses the full 3-worker Playwright suite
6. Upgraded production post-deploy smoke:
   - `/Users/roman.bediner/Library/CloudStorage/GoogleDrive-rbediner@gmail.com/My Drive/AI/Codex/romanbediner.com/.github/workflows/deploy-pages.yml`
   - prod validation now installs Chromium and runs:
     - `npm run qa:smoke:prod`
   - this now combines fetch-based live checks with lightweight live browser smoke
7. Updated tests for the v1.1 model:
   - `/Users/roman.bediner/Library/CloudStorage/GoogleDrive-rbediner@gmail.com/My Drive/AI/Codex/romanbediner.com/QA/tests/jest/prepush_gate.test.js`
   - `/Users/roman.bediner/Library/CloudStorage/GoogleDrive-rbediner@gmail.com/My Drive/AI/Codex/romanbediner.com/QA/tests/jest/selective_gate_runner.test.js`
   - `/Users/roman.bediner/Library/CloudStorage/GoogleDrive-rbediner@gmail.com/My Drive/AI/Codex/romanbediner.com/QA/tests/jest/deployment_sop.test.js`
   - `/Users/roman.bediner/Library/CloudStorage/GoogleDrive-rbediner@gmail.com/My Drive/AI/Codex/romanbediner.com/QA/tests/jest/browser_smoke_contract.test.js`
   - `/Users/roman.bediner/Library/CloudStorage/GoogleDrive-rbediner@gmail.com/My Drive/AI/Codex/romanbediner.com/QA/tests/test-ci-gate-profile-automation.js`
   - `/Users/roman.bediner/Library/CloudStorage/GoogleDrive-rbediner@gmail.com/My Drive/AI/Codex/romanbediner.com/QA/tests/test-release-sop-automation.js`
   - `/Users/roman.bediner/Library/CloudStorage/GoogleDrive-rbediner@gmail.com/My Drive/AI/Codex/romanbediner.com/QA/tests/test-live-deploy-validation-automation.js`
8. Updated docs and machine-readable architecture:
   - `/Users/roman.bediner/Library/CloudStorage/GoogleDrive-rbediner@gmail.com/My Drive/AI/Codex/romanbediner.com/README.md`
   - `/Users/roman.bediner/Library/CloudStorage/GoogleDrive-rbediner@gmail.com/My Drive/AI/Codex/romanbediner.com/docs/architecture/environment-model.json`
   - `/Users/roman.bediner/Library/CloudStorage/GoogleDrive-rbediner@gmail.com/My Drive/AI/Codex/romanbediner.com/docs/qa/selective-gate-review-2026-03-30.md`
   - this handoff file

## Validation Performed
- Local:
  - `npm run docs:generate`
  - `npm run test:jest`
  - `npm run test:node`
  - `node scripts/qa/run-browser-smoke.js --scopes home,framework,connect`
- Selective browser smoke sample captured:
  - scopes: `home,framework,connect`
  - result: pass
- Selective gate measurement sample captured from prior rollout remains available:
  - profile: `release-infra`
  - total duration: `5383ms`
  - metrics file:
    - `/Users/roman.bediner/Library/CloudStorage/GoogleDrive-rbediner@gmail.com/My Drive/AI/Codex/romanbediner.com/QA/results/gate-metrics/latest-local-gate.json`

## Operator Notes
- This is still QA/release architecture work, not a product copy or layout redesign.
- The intended operating model after review is:
  1. `staging` remains the proving ground
  2. the classifier chooses the smallest responsible gate
  3. `localized-page` includes a cheap but real desktop/mobile browser pass by default
  4. `shared-ui` covers cross-route nav/mobile/layout-sensitive browser smoke
  5. `prod` promotion still uses the already-tested staging SHA when eligible
  6. `qa:smoke:prod` remains mandatory after deploy
- Google Analytics is explicitly accounted for in the gate design and in the production smoke gate.
- Layout-sensitive UI contracts are now first-class concerns in the docs and browser smoke model. The current system explicitly guards against drift in:
  - hero/header alignment
  - bullet icon size and spacing
  - nav rendering
  - mobile overflow
  - framework stage-pill interaction
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
