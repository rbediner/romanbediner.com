# Cross-Machine Handoff (Latest)

- Handoff Sequence: 164
- Updated At (UTC): 2026-04-19T19:00:00Z
- Source Branch: staging
- Source Commit: ff6fb25766f9115aa657d434ab26239124bdc181

## Current State
- Website V2 Phase 1 is now the active product state in the working tree:
  - top-level `Resources` nav entry is part of the shared shell
  - `/resources/` is the new curated artifact landing page
  - `/resources/ai-enabled-operations-framework-summary/` is the new framework summary resource route with slide-preview carousel and PDF download
  - `/framework/` remains the authority hub and now links out to the summary route instead of absorbing artifact delivery directly
- Dashboard work remains deferred beyond this pass:
  - `/resources/ai-enabled-operations-dashboard/` is documented in the PRD but not implemented on-site yet
  - later migration must still move the standalone dashboard into the website repo/deploy model while preserving isolated code ownership and a dashboard-specific GitHub code path
- Node 24 migration is now complete for all directly-controlled workflow actions. The remaining warning (`actions/upload-pages-artifact@v4` internally calling `upload-artifact@v4.6.2`, Node 20) is handled by `FORCE_JAVASCRIPT_ACTIONS_TO_NODE24: 'true'` set at the job level on `deploy-pages` and `rollback-deploy`. GitHub's annotation will continue to say "being forced to run on Node.js 24" until `upload-pages-artifact@v5` ships. Remove the env var then and bump the action version.
- Deadline for forced cutover: June 2, 2026.
- The previous session upgraded the selective QA system from the first gate draft to a more efficient `v1.2` model while keeping the protective `v1.1` browser/mobile/nav/GA coverage intact.
- The old blunt `fast/full` CI language has been replaced in code/docs with five explicit gate profiles:
  - `docs-only`
  - `localized-page`
  - `shared-ui`
  - `release-infra`
  - `full-regression`
- Production smoke remains a separate post-deploy verification step and now includes a lightweight live browser pass through:
  - `/Users/roman.bediner/Library/CloudStorage/GoogleDrive-rbediner@gmail.com/My Drive/AI/Projects/RB Website/romanbediner.com/scripts/qa/verify-live-production.js`
  - `/Users/roman.bediner/Library/CloudStorage/GoogleDrive-rbediner@gmail.com/My Drive/AI/Projects/RB Website/romanbediner.com/scripts/qa/verify-live-browser-smoke.js`
  - npm alias: `npm run qa:smoke:prod`
- Release-pipeline correction completed:
  - the first prod rollout after browser smoke integration exposed a workflow bug: `post-deploy-validation` installed Chromium but did not run `npm ci`, so live smoke failed with `Cannot find module 'playwright'` after the site had already deployed
  - the immediate rerun fixed that dependency gap, but then surfaced a second issue: live browser smoke treated a CSP-blocked `static.cloudflareinsights.com` beacon attempt as an app runtime failure
  - the follow-up prod release fixed both gaps and completed successfully end-to-end:
    - `/Users/roman.bediner/Library/CloudStorage/GoogleDrive-rbediner@gmail.com/My Drive/AI/Projects/RB Website/romanbediner.com/.github/workflows/deploy-pages.yml` now installs Node dependencies before browser smoke
    - `/Users/roman.bediner/Library/CloudStorage/GoogleDrive-rbediner@gmail.com/My Drive/AI/Projects/RB Website/romanbediner.com/scripts/qa/run-browser-smoke.js` now ignores only that known non-app CSP-blocked beacon noise while keeping real runtime errors release-blocking
    - new automation guardrail coverage was added before re-driving the fix through `staging` and `prod`
- Operator release rule is now explicit in docs:
  - stay with the release until the final remote workflow for that environment has concluded
  - do not report completion for `staging`, preview publication, or `prod` while any deploy or validation job is still running
- Release watcher hygiene is now part of the operational SOP:
  - release watcher hygiene is mandatory for staging/prod verification sessions
  - do not use ad-hoc shell polling loops like `while true; do gh run list ...; done`
  - use `node scripts/release/watch-ci-run.js` or the managed release automation only
  - before or after release work, use:
    - `npm run release:watchers:status`
    - `npm run release:watchers:cleanup`
  - canonical release helpers now auto-clean repo-owned watcher loops on entry and exit so stale terminal monitors do not accumulate across sessions
- Docs-only local QA was optimized in the previous session and remains intact:
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
  - `/Users/roman.bediner/Library/CloudStorage/GoogleDrive-rbediner@gmail.com/My Drive/AI/Projects/RB Website/romanbediner.com/docs/qa/selective-gate-review-2026-03-30.md`
- Current selective-gate improvement in this session:
  - `localized-page`, `shared-ui`, and `release-infra` now use a new purpose-built static suite runner:
    - `/Users/roman.bediner/Library/CloudStorage/GoogleDrive-rbediner@gmail.com/My Drive/AI/Projects/RB Website/romanbediner.com/scripts/qa/run-static-contract-suite.js`
  - this removes the old mismatch where selective gates still replayed the broad `test:node` + `test:jest` bundles underneath
  - CI now consumes resolved `unit_command` and `regression_command` outputs from the shared gate resolver instead of hard-coding broad test commands
  - GitHub-hosted workflow actions were modernized to current upstream majors to clear Node 20 runtime deprecation warnings:
    - `actions/checkout@v6`
    - `actions/setup-node@v6`
    - `actions/setup-python@v6`
    - `actions/upload-artifact@v7`
    - `actions/configure-pages@v6`
    - `actions/upload-pages-artifact@v4`
    - `actions/deploy-pages@v5`

## Continuation Pass: V2 Phase 1 Staging 404 Fix (2026-04-19)

### Root Cause
`resources` was missing from `INCLUDE_PATHS` in `scripts/build/create-artifact.js`. The artifact builder only copies explicitly listed top-level directories into the deploy bundle, so `/resources/` and all sub-routes were never included in staging or production artifacts despite existing in the working tree. Codex's Phase 1 work added the route files but did not register `resources` in the build include list.

A secondary gap: the JS string-literal rewrite regex in `scripts/build/create-preview-artifact.js` also did not include `resources`, meaning preview base-path rewriting would have silently skipped any JS-embedded `/resources/` strings.

### Fix Applied
- `scripts/build/create-artifact.js`: added `'resources'` to `INCLUDE_PATHS` (after `'framework'`)
- `scripts/build/create-preview-artifact.js`: added `resources` to the JS string-literal rewrite regex
- `QA/tests/test-framework-artifact-packaging.js`: updated assertions to guard against future recurrence (checks both `framework` and `resources` are present in INCLUDE_PATHS and in the preview rewrite regex)
- `README.md`: added explicit note about the `INCLUDE_PATHS` packaging contract so future route additions are not silently omitted

### Tests After Fix
- `npm run test:node` — all pass
- `npm run test:jest` — all 17 suites / 67 tests pass

### Staging Deploy Confirmed
- CI run 24634789707 — success
- Deploy Staging run 24634844246 — success
- Staging preview URLs validated (all 200):
  - https://rbediner.github.io/romanbediner-preview/
  - https://rbediner.github.io/romanbediner-preview/resources/
  - https://rbediner.github.io/romanbediner-preview/resources/ai-enabled-operations-framework-summary/
  - https://rbediner.github.io/romanbediner-preview/framework/

### Locked Decisions (unchanged)
All Website V2 Phase 1 locked decisions, copy, and design direction from the prior Codex pass are preserved. No route content, nav, or copy was changed.

### Open Items (unchanged from prior pass)
- `/resources/` intro thesis statement: still a placeholder decision
- exact `/framework/` → summary CTA copy: open
- final `/resources/ai-enabled-operations-dashboard/` copy: open (route deferred)
- exact GA4 event naming for resource interactions: open
- dashboard migration into main repo: deferred beyond Phase 1

## Continuation Pass: V2 Phase 1 UX/Content Refinement (2026-04-19)

### What Changed In This Pass

#### A. Resources hub (`resources/index.html`)
- H1 changed from "Curated Resources" to "Resources"
- Subhead replaced with locked intro paragraph: "A curated set of downloadable and interactive resources focused on practical, tactical ways to implement the operating framework for modern AI-enabled teams."
- Added supporting sentence: "Each resource is designed to make the framework easier to review, apply, and discuss in real operating environments."
- Replaced internal-facing shelf-callout (Phase 1 editorial placeholder) with public-facing entry note: "Start here with a concise summary of the framework, then explore deeper materials and interactive tools as the resource library expands."
- Framework summary card description strengthened to locked two-sentence version
- Removed extra "Return to the Full Framework" secondary CTA from hub card
- Dashboard placeholder card: changed status badge from "Planned Next" to "Coming Soon"; replaced internal-facing description with locked public copy; removed any CTA link
- Added `data-resource-card` attribute to framework summary card for analytics tracking
- Added `resources-analytics.js` script load

#### B. Framework summary page (`resources/ai-enabled-operations-framework-summary/index.html`)
- Section order restructured to locked flow: header → subhead → shelf-callout (hero para) → Who This Is For (blue box) → In This Summary → slide preview → CTA cluster → conversational close → dual nav
- Removed top CTA cluster (previously sat between shelf-callout and In This Summary)
- Added "Expand Preview" button to carousel header (`data-carousel-expand`)
- Fixed download filename: both Download PDF links now use `download="AI-Enabled-Operations-Framework-Summary.pdf"`
- Added utility line "Six slides. Fast review. Easy to share." below download CTA
- Added conversational close section with framework link-back and locked conversational paragraph + "Reach Out for a Chat" CTA
- Replaced single "Continue the Conversation" bottom nav with dual nav: Back to Resources (←) | Reach Out for a Chat (→)
- Added `data-track-pdf-download` attribute to Download PDF links
- Added `resources-analytics.js` script load

#### C. Framework page (`framework/index.html`)
- Removed mid-page shelf-callout ("Framework Summary" blue box) that sat between intro and stage pills — was an interruption to the page rhythm
- Added subtle bottom CTA after Evolution card and before "Explore Service Models" nav: quiet text + arrow link to `/resources/ai-enabled-operations-framework-summary/`
- **NOTE: Bottom CTA copy is still open. Current placeholder:** "For a faster overview of the six stages, the downloadable summary is a good starting point." + "Explore the Full Framework Summary →"

#### D. CSS (`styles/resources.css`)
- Added: `.resource-meta.is-coming-soon` — muted gray badge
- Added: `.resource-expand-preview` — text-link button style
- Added: `.resource-preview-modal` and inner elements — lightbox overlay styles
- Added: `.resource-utility-line` — small muted text
- Added: `.resource-conversational-close` — section separator
- Added: `.resource-framework-linkback` — secondary link paragraph
- Added: `.resource-dual-nav`, `.resource-dual-nav-item`, `.resource-dual-nav-arrow` — bottom dual nav
- Added: `.resources-intro-support`, `.resources-entry-note` — hub intro text layers
- Added: `.framework-summary-cta`, `.framework-summary-cta-copy` — framework page bottom CTA (minimal, unboxed)

#### E. JS — Carousel (`scripts/runtime/resources-carousel.js`)
- Added Expand Preview lightbox: builds modal on first open, shows current slide enlarged, closes on Escape or click-outside
- Fires `resource_preview_expand` GA event via `window.__rbAnalytics.trackEvent()` on open

#### F. JS — Analytics (`scripts/runtime/resources-analytics.js`) — NEW FILE
- Tracks `resource_pdf_download` on all `[data-track-pdf-download]` link clicks
- Tracks `resource_card_click` on hub card primary CTA clicks (via `[data-resource-card]` attribute)
- Follows same convention as `framework-brief-analytics.js`; uses `window.__rbAnalytics.trackEvent()`
- Loaded on both `/resources/` and `/resources/ai-enabled-operations-framework-summary/`

### Analytics Events Added
| Event | Trigger | Parameters |
|-------|---------|-----------|
| `resource_pdf_download` | Click Download PDF | `source_page`, `resource_name` |
| `resource_card_click` | Click hub card → summary page | `source_page`, `target_page`, `resource_name` |
| `resource_preview_expand` | Click Expand Preview | `source_page`, `slide_index`, `slide_total` |

### Validation
- `node QA/tests/test-resources-phase1.js` — PASS (all phase 1 contracts intact)
- `scripts/runtime` directory is in `INCLUDE_PATHS` — `resources-analytics.js` auto-included in build artifact

### PRD / README / Docs
- PRD: No material change to product/UX contract; copy and design decisions already locked in prior pass. No PRD update required.
- README: No structural or behavioral documentation change. No README update required.
- Handoff: Updated (this section)

### Open Items After This Pass
- Exact final `/framework/` → summary CTA copy: using placeholder, needs approval
- Final copy for `/resources/ai-enabled-operations-dashboard/`: deferred
- Dashboard migration into main repo: deferred
- Staging deploy: PENDING — see next handoff update after push

## What Changed In This Session
1. Added Website V2 Phase 1 resources architecture and assets:
   - `/Users/roman.bediner/Library/CloudStorage/GoogleDrive-rbediner@gmail.com/My Drive/AI/Projects/RB Website/romanbediner.com/resources/index.html`
   - `/Users/roman.bediner/Library/CloudStorage/GoogleDrive-rbediner@gmail.com/My Drive/AI/Projects/RB Website/romanbediner.com/resources/ai-enabled-operations-framework-summary/index.html`
   - `/Users/roman.bediner/Library/CloudStorage/GoogleDrive-rbediner@gmail.com/My Drive/AI/Projects/RB Website/romanbediner.com/styles/resources.css`
   - `/Users/roman.bediner/Library/CloudStorage/GoogleDrive-rbediner@gmail.com/My Drive/AI/Projects/RB Website/romanbediner.com/scripts/runtime/resources-carousel.js`
   - `/Users/roman.bediner/Library/CloudStorage/GoogleDrive-rbediner@gmail.com/My Drive/AI/Projects/RB Website/romanbediner.com/assets/resources/framework-summary/ai-enabled-operations-framework-summary.pdf`
   - `/Users/roman.bediner/Library/CloudStorage/GoogleDrive-rbediner@gmail.com/My Drive/AI/Projects/RB Website/romanbediner.com/assets/resources/framework-summary/slides/`
2. Updated shared navigation, framework link-out, README, sitemap, and route metadata to reflect the new Resources IA while keeping `/framework/` as the authority hub.
3. Added targeted Phase 1 regression coverage for nav, routes, metadata, assets, and the summary resource contract; fixed shared-nav active-state behavior so nested resource routes correctly highlight `Resources`.
4. Strengthened the shared selective-gate classifier:
   - `/Users/roman.bediner/Library/CloudStorage/GoogleDrive-rbediner@gmail.com/My Drive/AI/Projects/RB Website/romanbediner.com/scripts/qa/resolve-gate-profile.js`
   - still classifies changed files into the five gate profiles
   - now emits route-scoped `unit_command`, `regression_command`, and browser commands so CI and local gates run the smallest responsible suite for each profile
   - route scopes remain `home`, `about`, `services`, `framework`, and `connect`
5. Added the purpose-built static suite runner:
   - `/Users/roman.bediner/Library/CloudStorage/GoogleDrive-rbediner@gmail.com/My Drive/AI/Projects/RB Website/romanbediner.com/scripts/qa/run-static-contract-suite.js`
   - owns the route-to-test mapping for:
     - `localized-page`
     - `shared-ui`
     - `release-infra`
   - keeps localized route checks, shared shell checks, and release/doc automation checks separate instead of replaying broad whole-site Node/Jest bundles
6. Updated the measurable selective local gate runner:
   - `/Users/roman.bediner/Library/CloudStorage/GoogleDrive-rbediner@gmail.com/My Drive/AI/Projects/RB Website/romanbediner.com/scripts/qa/run-selective-gate.js`
   - runs the exact local commands for the selected gate
   - now resolves route placeholders into concrete browser smoke commands before execution
   - writes timing metrics to:
     - `/Users/roman.bediner/Library/CloudStorage/GoogleDrive-rbediner@gmail.com/My Drive/AI/Projects/RB Website/romanbediner.com/QA/results/gate-metrics/latest-local-gate.json`
7. Added targeted browser smoke tooling:
   - `/Users/roman.bediner/Library/CloudStorage/GoogleDrive-rbediner@gmail.com/My Drive/AI/Projects/RB Website/romanbediner.com/scripts/qa/run-browser-smoke.js`
   - `/Users/roman.bediner/Library/CloudStorage/GoogleDrive-rbediner@gmail.com/My Drive/AI/Projects/RB Website/romanbediner.com/scripts/qa/verify-live-browser-smoke.js`
   - browser smoke now explicitly protects:
     - shared nav labels/hrefs on desktop and mobile
     - mobile menu open/close and overflow safety
     - GA bootstrap/runtime availability
     - homepage hero alignment and single-line heading contract
     - framework stage-pill interaction behavior
     - connect form shell rendering
     - orb bullet icon size and spacing contract (`8px` bullet with required margin)
8. Expanded local npm entrypoints:
   - `qa:gate:resolve`
   - `qa:gate:run`
   - `qa:gate:docs-only`
   - `qa:gate:localized-page`
   - `qa:gate:shared-ui`
   - `qa:gate:release-infra`
   - `qa:gate:full-regression`
   - `qa:browser:smoke`
   - `qa:static-contracts`
   - `qa:smoke:prod`
   - `qa:smoke:prod:fetch`
   - `qa:smoke:prod:browser`
   - `qa:smoke:preview`
9. Upgraded CI gate selection:
   - `/Users/roman.bediner/Library/CloudStorage/GoogleDrive-rbediner@gmail.com/My Drive/AI/Projects/RB Website/romanbediner.com/.github/workflows/ci.yml`
   - CI now resolves the selective gate profile through the shared classifier
   - CI job summary now prints the selected profile and which validations are enabled
   - expensive jobs (`qa-tests`, `browser-tests`, `lighthouse-validation`, `build-artifact`) are now driven by explicit profile outputs instead of old `full_gate` logic
   - `unit-tests` and `regression-tests` now execute the resolved selective command outputs instead of always replaying `test:node` and `test:jest`
   - browser job now runs the resolved browser command, which means:
     - `localized-page` gets targeted browser smoke
     - `shared-ui` gets browser smoke across canonical routes
     - `full-regression` still uses the full 3-worker Playwright suite
10. Modernized workflow action runtimes:
   - `/Users/roman.bediner/Library/CloudStorage/GoogleDrive-rbediner@gmail.com/My Drive/AI/Projects/RB Website/romanbediner.com/.github/workflows/ci.yml`
   - `/Users/roman.bediner/Library/CloudStorage/GoogleDrive-rbediner@gmail.com/My Drive/AI/Projects/RB Website/romanbediner.com/.github/workflows/deploy-pages.yml`
   - `/Users/roman.bediner/Library/CloudStorage/GoogleDrive-rbediner@gmail.com/My Drive/AI/Projects/RB Website/romanbediner.com/.github/workflows/deploy-staging.yml`
   - `/Users/roman.bediner/Library/CloudStorage/GoogleDrive-rbediner@gmail.com/My Drive/AI/Projects/RB Website/romanbediner.com/.github/workflows/rollback.yml`
   - now pinned to current upstream majors that run on the modern Node 24-based action runtime
11. Upgraded production post-deploy smoke:
   - `/Users/roman.bediner/Library/CloudStorage/GoogleDrive-rbediner@gmail.com/My Drive/AI/Projects/RB Website/romanbediner.com/.github/workflows/deploy-pages.yml`
   - prod validation now installs Chromium and runs:
     - `npm run qa:smoke:prod`
   - this now combines fetch-based live checks with lightweight live browser smoke
12. Updated tests for the v1.2 model:
   - `/Users/roman.bediner/Library/CloudStorage/GoogleDrive-rbediner@gmail.com/My Drive/AI/Projects/RB Website/romanbediner.com/QA/tests/jest/prepush_gate.test.js`
   - `/Users/roman.bediner/Library/CloudStorage/GoogleDrive-rbediner@gmail.com/My Drive/AI/Projects/RB Website/romanbediner.com/QA/tests/jest/static_contract_suite.test.js`
   - `/Users/roman.bediner/Library/CloudStorage/GoogleDrive-rbediner@gmail.com/My Drive/AI/Projects/RB Website/romanbediner.com/QA/tests/jest/selective_gate_runner.test.js`
   - `/Users/roman.bediner/Library/CloudStorage/GoogleDrive-rbediner@gmail.com/My Drive/AI/Projects/RB Website/romanbediner.com/QA/tests/jest/deployment_sop.test.js`
   - `/Users/roman.bediner/Library/CloudStorage/GoogleDrive-rbediner@gmail.com/My Drive/AI/Projects/RB Website/romanbediner.com/QA/tests/jest/browser_smoke_contract.test.js`
   - `/Users/roman.bediner/Library/CloudStorage/GoogleDrive-rbediner@gmail.com/My Drive/AI/Projects/RB Website/romanbediner.com/QA/tests/test-ci-gate-profile-automation.js`
   - `/Users/roman.bediner/Library/CloudStorage/GoogleDrive-rbediner@gmail.com/My Drive/AI/Projects/RB Website/romanbediner.com/QA/tests/test-release-sop-automation.js`
   - `/Users/roman.bediner/Library/CloudStorage/GoogleDrive-rbediner@gmail.com/My Drive/AI/Projects/RB Website/romanbediner.com/QA/tests/test-live-deploy-validation-automation.js`
13. Updated docs and machine-readable architecture:
   - `/Users/roman.bediner/Library/CloudStorage/GoogleDrive-rbediner@gmail.com/My Drive/AI/Projects/RB Website/romanbediner.com/README.md`
   - `/Users/roman.bediner/Library/CloudStorage/GoogleDrive-rbediner@gmail.com/My Drive/AI/Projects/RB Website/romanbediner.com/docs/architecture/environment-model.json`
   - `/Users/roman.bediner/Library/CloudStorage/GoogleDrive-rbediner@gmail.com/My Drive/AI/Projects/RB Website/romanbediner.com/docs/qa/selective-gate-review-2026-03-30.md`
   - this handoff file
14. Added release watcher hygiene automation:
   - `/Users/roman.bediner/Library/CloudStorage/GoogleDrive-rbediner@gmail.com/My Drive/AI/Projects/RB Website/romanbediner.com/scripts/release/manage-release-watchers.js`
   - `/Users/roman.bediner/Library/CloudStorage/GoogleDrive-rbediner@gmail.com/My Drive/AI/Projects/RB Website/romanbediner.com/scripts/release/promote-tested-staging-to-prod.sh`
   - `/Users/roman.bediner/Library/CloudStorage/GoogleDrive-rbediner@gmail.com/My Drive/AI/Projects/RB Website/romanbediner.com/scripts/release/verify-prod-release.js`
   - release helpers now clean repo-owned `gh`/shell watcher loops on entry and exit
   - new operator commands:
     - `npm run release:watchers:status`
     - `npm run release:watchers:cleanup`
   - new Jest/automation coverage protects watcher detection, cleanup wiring, and SOP wording

## Validation Performed
- Local:
  - `npm run test:docs-gate`
  - `npm run test:qa-full`
  - `npm run test:jest`
  - `npm run release:watchers:status`
  - `npm run release:watchers:cleanup`
  - `node scripts/qa/run-static-contract-suite.js --profile localized-page --mode node --scopes home`
  - `node scripts/qa/run-static-contract-suite.js --profile localized-page --mode jest --scopes connect`
  - `node scripts/qa/run-static-contract-suite.js --profile shared-ui --mode jest --scopes all`
  - `node scripts/qa/run-static-contract-suite.js --profile release-infra --mode node --scopes all`
  - `npm run qa:gate:release-infra`
- Selective browser smoke sample captured:
  - scopes: `home,framework,connect`
  - result: pass
- Selective gate measurement sample captured from prior rollout remains available:
  - profile: `release-infra`
  - total duration: `5383ms`
  - metrics file:
    - `/Users/roman.bediner/Library/CloudStorage/GoogleDrive-rbediner@gmail.com/My Drive/AI/Projects/RB Website/romanbediner.com/QA/results/gate-metrics/latest-local-gate.json`

## Operator Notes
- Repository was moved locally from the old `.../My Drive/AI/Codex/...` parent into `.../My Drive/AI/Projects/RB Website/...`; handoff and QA review docs were refreshed so future sessions do not inherit stale local paths.
- No live PRD update was required in this session because there was no product or behavior change, only local path/documentation maintenance plus validation.
- Post-move local validation on the website repo now includes a clean `npm run test:qa-full` pass from the new workspace path.
- This is still QA/release architecture work, not a product copy or layout redesign.
- There was no pending prod release left from the previous docs-only optimization; branches were aligned before this v1.2 work started.
- The intended operating model after review is:
  1. `staging` remains the proving ground
  2. the classifier chooses the smallest responsible gate
  3. `localized-page` includes a cheap but real desktop/mobile browser pass by default
  4. `shared-ui` covers cross-route nav/mobile/layout-sensitive browser smoke
  5. `prod` promotion still uses the already-tested staging SHA when eligible
  6. `qa:smoke:prod` remains mandatory after deploy
- New selective suite expectation:
  - `docs-only` should stay extremely cheap
  - `localized-page` should pay only for route-owned static checks + links + targeted browser smoke
  - `shared-ui` should pay for shared shell contracts + links + browser smoke + Lighthouse
  - `release-infra` should pay for release/doc automation + artifact verification, not page-level product checks
- Google Analytics is explicitly accounted for in the gate design and in the production smoke gate.
- Layout-sensitive UI contracts are now first-class concerns in the docs and browser smoke model. The current system explicitly guards against drift in:
  - hero/header alignment
  - bullet icon size and spacing
  - nav rendering
  - mobile overflow
  - framework stage-pill interaction
- The review document for tomorrow is the best place to start if the goal is to discuss what each gate should include/exclude.
- Release watcher hygiene is now the expected cleanup path whenever a release session starts or ends. This replaced the old informal habit of leaving manual `gh run list` polling loops running in terminal tabs.

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
