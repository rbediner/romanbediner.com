# Cross-Machine Handoff (Latest)

- Handoff Sequence: 277
- Updated At (UTC): 2026-06-28T23:33:50Z
- Source Branch: staging
- Source Commit: 27c28ad66ec9b72729950d220f3cbb5433b6d9fa (pre-handoff baseline)
- Active Agent: Claude (Opus)

## Current State — 🚀 LIVE ON PROD (both branches at `27c28ad`)

**`prod` and `staging` are both at `27c28ad`.** Latest release (`27c28ad`): the agentic page eyebrow changed **"REFERENCE ARCHITECTURE" → "AVAILABLE NOW"** (availability badge; `.resources-label`, still blue/uppercase). FF-promoted to prod; prod `CI` ✓ (3m7s), `Deploy Pages` ✓ (5m13s), `verify-live-production.js` ✓ (homepage/sitemap 200, 16 routes); live-verified in Chrome (eyebrow reads "AVAILABLE NOW"). **GSC sitemap re-submission still pending Roman (manual).**

Prior release this session (the big one):
**`prod` and `staging` were brought to `1af606b`** (fast-forward promotion). This session's entire body of work is now **LIVE on https://romanbediner.com**. Prod workflows all green for `1af606b`: `CI` (3m17s), `Deploy Pages` (5m19s, post-deploy validation incl.), `Docs Sync`. `node scripts/qa/verify-live-production.js` PASS (homepage 200, sitemap 200, 16 routes OK). **Live-verified in Chrome:** home navy-ink logos; About chips removed + floating "On this page" + era colors (blue function / gray company); agentic page roster-first + "A human is always in charge" callout + 6 all-caps pills; Framework H1 one line (48px).

**⚠️ ACTION FOR ROMAN (manual, I can't access GSC):** re-submit `sitemap.xml` in Google Search Console now that prod has new/changed pages — that's what forces Google to re-crawl (GSC last auto-read it Feb 18). This is the documented post-prod step.

**Prod divergence reconciled:** prod had an out-of-band hotfix `56f910f fix: include 404.html in build artifact` (added `'404.html'` to `INCLUDE_PATHS` in `create-artifact.js` + a README note) that was never on staging. A clean `git merge origin/prod` into staging (commit `1af606b`, auto-merged, no conflicts) brought that fix back so prod was fast-forward-able and the branded 404 page keeps deploying. Going forward staging ⊇ prod again; future promotions are clean FF.

**This-session final UI change before promo:** About visible chapter-nav chips **removed** (`e3ad826`) — redundant with the always-visible floating control; `.about-chapter-nav` markup kept but `.sr-only` so it remains the `[data-section-nav]` source + an SR landmark. (Home logos: the navy-ink + color-on-hover from `df29f9a` was kept — judged premium, not reverted.)

### Prior (seq 273, staging-only) — head was `df29f9a` — `Home logos: premium single-ink monochrome + color-on-hover`. **Home-logos item RESOLVED.** The faded grayscale (opacity 0.6) is replaced with a crisp **single-ink monochrome**: each mark recolored to the brand **deep-navy** at full strength via a CSS filter (`brightness(0) invert(13%) sepia(46%) saturate(1700%) hue-rotate(196deg) brightness(95%) contrast(95%)`) — uniform, premium, not faded/gray/black. On **hover** the real brand color blooms back in (`filter:none`) with a subtle lift. CSS-only on `styles/home.css` (no asset/markup changes, kept current size + position); home.css token r7→r8; 4 home visual baselines refreshed. All green; verified live in Chrome (navy at rest; AWS orange returned on hover). Rejected: Variant A solid-black (Roman: "back where we were"), faded grayscale (washed/cheap). True per-brand monochrome SVG swap was deemed unnecessary — the navy-ink filter + color-hover achieves the premium look with zero markup/asset risk.

### Prior — `staging` head was `0970d0b` — `Agentic page: lead with the roster + add human-in-charge framing`. On the `/resources/agentic-ai-employees/` page: the **roster** ("Two doers and an operator") now leads (moved to directly after the overview pills); the "How they relate" box was lightly reworded to stand alone at the top (dropped the forward-reference to "the brain" → "a shared library"); and a **human-oversight** point was added so the page doesn't read as job replacement — a lede sentence ("A person stays in charge of the fleet…") + a callout after the roster ("A human is always in charge" — agents as human-directed **direct reports**, "nothing consequential ships without a human's green light"; positive/non-defensive framing). Evergreen (no models/costs/tools-by-name). README updated. All green for `0970d0b`; verified live in Chrome.

**OPEN — home logos still pending Roman's pick.** The faded grayscale (opacity 0.6) was the wrong call (looked washed-out/cheap; hover-reveal is undiscoverable). Prototyped two crisp full-strength options at the current size/position on the preview: **A** = uniform solid-black monochrome (`grayscale(1) brightness(0)`, opacity 1, no hover) — cohesive, premium; **B** = real logos in full color (`filter:none`, opacity 1) — recognizable but mixed (AWS orange vs Disney black; Laser reads light). Roman to pick A vs B (or true monochrome brand assets, which would need sourcing official one-color AWS/Laser/Agentic marks). Nothing committed for logos yet — `styles/home.css` still has the opacity-0.6 fade from seq-265 that Roman dislikes; revert/replace once he picks.

### Prior (seq 269) — `staging` head was `b4514c0` — `Section nav: show "On this page" from page load (not only after scroll)`. The floating control's "appear after scrolling past the inline anchors" gating was removed; it is now visible immediately on About + Services (desktop + mobile), discoverable without scrolling. Active-section highlighting still tracks via IntersectionObserver. `section-nav.js` token a→b; about/services baselines refreshed (FAB now renders in-frame). All workflows green for `b4514c0`; verified live in Chrome (FAB visible at scroll 0 once CDN propagated).

### Prior (seq 267) — `staging` head was `b2435bd` — `About chapter-nav: 3-column grid on desktop (tidy 3x2)`, on top of `9a0141e`. All workflows green for `b2435bd` (CI 3m21s, Docs Sync, Deploy Staging workflow_run). Two follow-ups this turn:
- **About chapter-nav → 3×2 grid (`b2435bd`).** The five chips wrapped as a ragged 4 + 1 at the 1100px container (one line not achievable with these label lengths), so `.about-chapter-nav` is now a uniform 3-column CSS grid on desktop (rows of 3 + 2); mobile keeps the content-hugging flex wrap. `styles/about.css` token r8→r9; about--desktop-fold/full baselines refreshed.
- **"Where's the floating nav?" — it was browser HTML cache, not a bug.** The section nav IS deployed and works: verified live in Chrome that the canonical `/about/` served a stale (pre-deploy) `index.html` from the browser cache (no script tag), while `?cb=`/hard-refresh (Cmd+Shift+R) loads the fresh HTML with the FAB present and functioning. GitHub Pages caches HTML; returning visitors must hard-refresh the preview to pick up HTML changes (asset CSS/JS changes are `?v=`-busted, but the HTML page itself is not). This applies to all HTML-structure changes on the preview.

### Prior (seq 265) — `staging` head was `9a0141e` — committed and **pushed**, all workflows green for that SHA: `CI` (success, 3m26s), `Docs Sync` (success), `Deploy Staging` (`workflow_run`) success (the push-triggered Deploy run was concurrency-cancelled, as expected). Full-regression pre-push gate passed (visual 8/8, no phantom this push).

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
