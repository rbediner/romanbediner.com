# Cross-Machine Handoff (Latest)

- Handoff Sequence: 265
- Updated At (UTC): 2026-06-28T21:29:32Z
- Source Branch: staging
- Source Commit: 9a0141ec7addf692c51cb5e30a234e549cf64fe4 (pre-handoff baseline)
- Active Agent: Claude (Opus)

## Current State

`staging` head is `9a0141e` — committed and **pushed**, all workflows green for that SHA: `CI` (success, 3m26s), `Docs Sync` (success), `Deploy Staging` (`workflow_run`) success (the push-triggered Deploy run was concurrency-cancelled, as expected). Full-regression pre-push gate passed (visual 8/8, no phantom this push).

This session shipped a six-part front-end polish pass (Roman's punch list), plus a brittle-test fix and a flaky-baseline refresh.

Staging preview: https://rbediner.github.io/romanbediner-preview/
Prod: https://romanbediner.com/

Staging-only. No prod promotion attempted.

## Implemented Changes (this session, on top of 263)

Three commits (`57278e5` feature, `13cf4d7` baselines, `9a0141e` test fix):

1. **About era headers** — `.era-title` (function/role) stays brand-blue; `.era-sub` (company) is now muted gray (`--text-secondary`) for a two-tier label. (`styles/about.css`, token r7→r8.)
2. **Framework hub H1 one line** — `@media (min-width:769px) .framework-main:not(.framework-brief-main) h1 { font-size: 48px }` so the all-caps title fits one line on desktop (54px wrapped); mobile + brief pages unchanged. (`styles/framework.css`, auto-busted at deploy.)
3. **Agentic AI Employees pills** — `.fleet-pillrow` is now an all-caps CSS grid (3 cols desktop / 2×3 mobile) with a **6th** property pill, **"Human-in-the-loop"**. (`resources/agentic-ai-employees/index.html` + `styles/resources.css`, token r6→r7.)
4. **Agentic diagram lightbox** — NEW `scripts/runtime/fleet-diagram-zoom.js`: each `.fleet-diagram` gets a pinned "⛶ Full screen" button opening a native `<dialog>` lightbox (clones the inline SVG so DM Sans is preserved, dark scrim + white card, fit/zoom toggle, Escape/backdrop/close). CSP-safe (external module from 'self', DOM-only, no inline). Best-UX mobile zoom (Roman: "best UX wins"). CSS in `resources.css`.
5. **Home operating-experience logos** — uniform soft-graphite monochrome (`grayscale(1) brightness(0)`, opacity 0.6, was 0.88 pure-ish black), wider column spacing (gap 26px 48px), subtle hover lift to full ink. Chose this (clean Stripe/Apple-style row) over hairline separators after prototyping both on the preview. (`styles/home.css`, token r3→r7.)
6. **Floating "On this page" section nav (About + Services)** — NEW `scripts/runtime/section-nav.js`: reads an inline `[data-section-nav]` list, surfaces a floating control that appears once that list scrolls out of view (IntersectionObserver), opening a sheet of the same anchors with live active-section highlighting. Progressive enhancement (inline anchors work without JS; control simply never appears if JS/IO absent → no broken state). About reads its visible `.about-chapter-nav`; Services got 4 `.svc-entry` `id`s + `scroll-margin-top` + a visually-hidden `[data-section-nav]` source. Styles (`.section-nav-fab` / `.section-nav-sheet`) in `styles/site.css` (auto-busted at deploy). Desktop gutter-spine was rejected: the 1100px container leaves no room for a left rail on typical laptops without overlapping content — the floating control is the robust answer for all sizes.

Supporting:
- `9a0141e`: `QA/tests/test_services_stack.py` — the `test_four_service_entries_exist` assertion did an exact `count('<div class="svc-entry">')` which returned 0 after the `id`s were added; changed to match `class="svc-entry"` (contract intent unchanged).
- `13cf4d7`: refreshed connect/insights/services visual baselines (unchanged pages) to the current headless render — a bimodal DM Sans font-loading race in the visual harness (insights--desktop-full ~7.8% / ~57px reflow that flips between runs). Visual suite is local-gate-only, so this is zero-CI-impact gate maintenance.

## Files Changed
- New: `scripts/runtime/fleet-diagram-zoom.js`, `scripts/runtime/section-nav.js`
- HTML: `index.html`, `about/index.html`, `services/index.html`, `resources/agentic-ai-employees/index.html` + the 4 other resource pages (resources.css token bump only)
- CSS: `styles/about.css`, `framework.css`, `home.css`, `resources.css`, `services.css`, `site.css`
- Tests/docs: `QA/tests/test_services_stack.py`, `README.md`, home/about + connect/insights/services visual baselines

## QA Summary
- Local full-regression pre-push gate (`qa:ci-parity`) — PASS; `RUN_VISUAL_TESTS=1 test:visual` 8/8 PASS.
- `test-js-header-comments`, `test-csp-comments`, `test-repo-hygiene`, `test_services_stack` — PASS.
- Remote `CI` success (3m26s) on `9a0141e`; `Docs Sync` success; `Deploy Staging` `workflow_run` success.
- **Live-Chrome verification** (`?cb=` to bypass CDN lag): About + Services floating "On this page" controls appear on scroll, open the sheet, and highlight the active section (IntersectionObserver confirmed working on real Chrome); era headers two-tone; agentic pills all-caps 3×2 with 6th pill; framework H1 one line; diagram lightbox opens/zooms/closes; home logos refined.

## Environment / Reliability Notes
- **IntersectionObserver does NOT fire in the local Claude Preview (headless) environment** — even for in-view elements. So IO-dependent features (the section nav) cannot be verified on the local preview; verify on the live preview in Chrome instead. The non-IO lightbox verified fine locally.
- **Visual regression is local-gate-only** (no `RUN_VISUAL_TESTS` in any workflow; CI skips it). Baselines are machine-sensitive. Two failure classes: the documented `home--mobile-full` ~7.5% **intermittent** phantom (stale CSS in the gate's /tmp mirror → retry passes), and a **deterministic-per-run** bimodal DM Sans reflow on `insights--desktop-full`/`-fold` (~7.8%) that flips between runs. Distinguish with a direct `RUN_VISUAL_TESTS=1 npm run test:visual`; if a non-changed page fails repeatably, refresh its baseline to current render (as done in `13cf4d7`).
- Google Drive mount: `git` HEAD is source of truth; `session:ready` hangs (skip it). Launch-preview reads `.claude/launch.json` from the session root (parent dir); `rb-site` serve config (`romanbediner.com/` on :8799) added there for local verification.
- After editing a page-specific stylesheet (about/home/resources/services), bump its `?v=` token (these are NOT auto-busted). `site.css`, `framework.css`, `site-navigation.js` ARE auto-busted at deploy by `create-artifact.js`.

## Open Items / Follow-ups
1. **Roman to review** the live staging preview (hard-refresh / allow CDN propagation): seq-261 fleet diagrams, seq-263 About/Framework all-caps, and this session's six changes — especially the floating "On this page" nav on About + Services and the diagram lightbox on mobile.
2. **When promoting to prod** (only on Roman's explicit approval; fast-forward only, exact tested staging HEAD `9a0141e`): **immediately re-submit `sitemap.xml` in Google Search Console**, then run `node scripts/qa/verify-live-production.js` (or `npm run release:verify-prod -- --sha <prod-sha>`).
3. **Known CI nuisance:** pre-push visual gate can fail on the `home--mobile-full` phantom — just `git push` again. For a *different* baseline failing repeatably, verify with a direct `test:visual` run before refreshing (see Environment notes).
4. Possible polish follow-ups (Roman's call): a visible chip nav on Services (currently the nav source is visually hidden — only the floating control shows); tuning the FAB position/label.
5. Backlog (copy-sensitive, Roman supplies copy): About-timeline mobile progressive disclosure; metric proof points; FAQ/Q&A block; richer OG image. Do not revive `/insights/`.
6. PRD: this was visual/interaction polish (no behavior/IA/metadata/analytics change), so no `SEO Authority PRD` update required.

## Release Watcher Hygiene

Keep release watcher hygiene in place for this repo.
- Use `npm run release:watchers:status` and `npm run release:watchers:cleanup`
- Do not use ad-hoc shell polling loops for CI or preview monitoring.
