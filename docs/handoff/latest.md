# Cross-Machine Handoff (Latest)

- Handoff Sequence: 297
- Updated At (UTC): 2026-07-16T11:18:58Z
- Source Branch: staging
- Source Commit: ca226814f8ed314d1020871d6fd75619982cae0e (pre-handoff baseline)
- Active Agent: Claude

## Latest — 2026-07-16: NC Courage crest legibility correction for staging review

The first staging pass exposed a real visual QA failure: CSS recoloring had collapsed the NC Courage crest's internal white lettering and marks into a blank navy shield. This follow-up prepares a legible single-ink version and increases its display scale.

- Replaced the filtered source image in `index.html` with `assets/logos/nc-courage-crest-monochrome.png`.
- Created the prepared asset from the official full-color source while preserving the original at `assets/asset-library/brand-sources/nc-courage/nc-courage-crest-full-color.png`.
- Cropped the transparent source margin so the crest occupies its intended visual box; desktop display is 88px and mobile display is 78px.
- Added regression assertions for the prepared asset path, asset existence, and desktop scale in `QA/tests/test-home-hero-layout.js`.
- Refreshed the Home desktop/mobile visual baselines after inspecting the corrected crest.
- Local verification: hero layout guard passed, visual regression suite passed, and `git diff --check` passed.
- Staging deployment remains pending this commit; after push, run hosted CI, Deploy Staging, preview smoke, and browser/mobile verification before considering this correction accepted.

The prior responsibility-positioning notes remain below as historical context.

This staging change updates the public positioning to include Fractional Integration Officer work for NC Courage while preserving Agentic Society as a primary AI-architecture proof point and Laser Light Communications as current operating-architecture work.

- Homepage: added the NC Courage crest to the selected operating experience band in a CSS-driven monochrome treatment and added neutral current-responsibility copy.
- About: added a fifth arc chapter for Fractional Integration Leadership / NC Courage; preserved the Agentic Society AI-enabled operating systems chapter; added the new chapter to the floating section navigation and timeline orbit system.
- Services: added Fractional Integration Leadership as the first service model and retained the existing AI-enabled operations and operator-development models.
- Framework: added integration-leadership and AI-architecture SEO language plus a public-safe application note connecting the framework to NC Courage, Laser Light Communications, and Agentic Society.
- Connect: added neutral current-responsibility copy naming NC Courage, Laser Light Communications, and Agentic Society.
- SEO: refreshed titles, descriptions, Open Graph/Twitter metadata, homepage Person schema, and page-level structured-data terms for fractional integration leadership, Fractional Integration Officer, AI architecture, technology integration, and vendor evaluation.
- Public boundary: no confidential NC Courage portal findings, vendor judgments, stakeholder names, or internal systems were added to the public site.
- Deferred Phase 2: create a public-safe NC Courage integration resource or case study after approval of the public narrative.
- Required PRD update: the live `romanbediner.com PRD` Google Doc now records the new positioning, public-safety boundary, crest treatment, and SEO vocabulary.

### Resume point

- Hosted CI and Deploy Staging are green for the prior product release; the preview is available at https://rbediner.github.io/romanbediner-preview/.
- Browser verification covered the homepage and canonical About, Services, Framework, Resources, and Connect routes; Computer Use confirmed the desktop Chrome view, navigation, current-work copy, and five-logo experience band.
- Mobile responsive and visual QA passed locally, including the affected Home, About, Services, Framework, and Connect views.
- A live browser check found that Services and Connect had stale `<title>` tags while their Open Graph/Twitter metadata was current. Commit `9dde32b` aligns those titles and adds a regression assertion in `QA/tests/test-og-route-metadata.js`.
- The follow-up commit is local but not yet pushed because the configured GitHub token is invalid (`gh auth status` reports re-authentication required). Resume by authenticating GitHub, pushing `staging`, running the isolated handoff push, then rerunning the hosted staging deploy and live browser verification.

## Latest — 2026-07-05: EBI Round 2 (Looker Studio structure cleanup) + analytics documentation (Claude)

**Committed and pushed to `origin/staging` at `463d3c9`.** This entry supersedes the "Looker Studio report finalized" one directly below for anything related to filter count, page names, or the Traffic Sources page layout -- that entry is now partially stale (see specifics below) and kept only for its account-boundary/setup history, which is still accurate.

1. **Looker Studio structure cleanup (EBI Round 2, all live edits, no local files):**
   - **Filter audit:** found 16 total filters existed (up from the 3 real ones documented in the previous entry) -- 11 were dead (0 charts using them, leftover from earlier iteration) and 1 was broken beyond repair (`Event = (page|screen)_view`, field showing "Missing," every field-picker option showing "Invalid," Save permanently disabled even after a valid Name-only edit). All 12 deleted. Final state: **exactly 4 filters** -- `Page path filter` (7 charts), `Exclude passive & legacy events` (3 charts), `Event = resource_pdf_download` (1 chart), `Event = resource_preview_expand` (1 chart).
   - **Removed an unused blended data source** ("BL: eComm Funnel," confirmed 0 charts referencing it via Resource → Manage blends before deletion) that was cluttering the Data panel's field picker with eCommerce fields (`add_to_cart`, `purchase`, etc.) romanbediner.com has never used.
   - **Redid the "Top Events" table removal** on the Traffic Sources & Landing Pages page (table + trend chart + title + container rectangle, 4 individual deletions) -- this was a byte-for-byte redundant duplicate of the Key Actions page's event breakdown, with none of that page's filtering context. Left a cosmetic gap rather than repositioning the Landing Pages block below it.
   - **⚠️ New Looker Studio failure mode discovered and recovered from:** bulk arrow-key repositioning (100x `Up` presses on a multi-selected group, attempting to close the same layout gap on a first attempt) corrupted the ENTIRE page's rendering to a blank white canvas -- including completely untouched charts -- reproducibly across reload, View mode, and a brand-new browser tab (proving server-side saved-state corruption, not a client glitch; the underlying data model stayed intact per the accessibility tree). Recovered via `File → Version history → See version history`: bisected timestamped snapshots to find the last-good version (2:38 PM), restored it, then verified via Manage Filters that the filter cleanup above (which happened before the break) survived the restore while only the risky move sequence was rolled back. **Lesson applied on retry:** redid the Top Events deletion without any bulk repositioning at all -- verified each of the 4 deletions individually via screenshot before proceeding, then confirmed the whole page via reload and View mode. Full writeup of this gotcha is in the `project-romanbediner-analytics` memory and `analytics-digest/docs/analytics-scope.md`.
   - Page 5 renamed **"Conversions & Top Pages" → "Top Pages"** (the Conversions table was already removed in Round 1; the name just hadn't caught up).

2. **Two new documentation deliverables, per explicit request** ("document analytics scope... same with interpretation/analysis method... so if I want to replicate it for another property, we don't reinvent the wheel... point an agent to a file and say replicate this"):
   - **`analytics-digest/docs/analytics-scope.md`** -- what's tracked: GA4 property, both traffic exclusions, full event taxonomy (passive/excluded vs. real interaction vs. watched-for-zero-volume), the `(not set)` bucket explanation, the current 4-filter inventory, and what's explicitly out of scope (eCommerce fields, the EmailJS contact form).
   - **`analytics-digest/docs/replication-guide.md`** -- a property-agnostic runbook: GA4 service-account setup, the Looker Studio dashboard blueprint (including every structural lesson learned the hard way this session, so a future rebuild doesn't repeat them), the Worker scaffold with file-by-file guidance, and the insight-generation methodology/rationale (why 7-day-trailing not day-over-day, why a 25% notable threshold, why templated/condition-gated recommendations only). Written so an agent can be pointed at this single file and asked to rebuild the whole stack for a different property.
   - Both READMEs (`analytics-digest/README.md` and the root `README.md`) now link to these two docs instead of duplicating filter/page detail inline, and the stale "Conversions & Top Pages" reference plus the Worker's architecture diagram (missing `/preview`, `/trigger`, and the failure-alert path added in Round 1) were fixed in the same pass.
   - Confirmed via `npm test` (15/15 pass) and `npm run typecheck` (clean) before pushing -- no code changes in this round, docs/Looker-Studio-only, but ran the full check anyway since the Worker's README changed.

3. **Digest cadence confirmed unchanged:** user confirmed once-a-day is exactly right ("I only need that email once a day") -- no code change needed, the existing 8am America/New_York cron already satisfies this.

## Latest — 2026-07-05: Looker Studio report finalized + new analytics-digest Worker built (Claude)

**Two systems.** The Cloudflare Worker + doc updates below are committed and pushed to `origin/staging` (commit `354e597`, merged with concurrent origin changes at `9efc5de`). The Looker Studio changes have no local files — they're live edits in the Looker Studio UI itself, nothing to commit.

1. **Looker Studio dashboard fixes** (all done live in the Looker Studio UI, no local files):
   - 10 EBI-approved improvements shipped across all 5 report pages (legacy-event stripping, zero-volume-event surfacing, Conversions page repointed from a broken "Conversions" metric to `Event count` + event filter, vs-previous-period deltas, Daily Briefing block, 7-day trailing default comparison, page reorder, per-page captions, interactive-only element audit, mobile-render check).
   - **Report-wide `localhost` traffic pollution fixed:** the compound "Page path filter" (7 charts) now excludes both `Page path Contains "romanbediner-preview"` AND `Session source Contains "localhost"` (2 AND'd Exclude clauses -- De Morgan's law: NOT(A OR B) = NOT A AND NOT B). Verified live: `localhost:4321` no longer appears in the Traffic Sources & Landing Pages page's Top Traffic Sources table.
   - **Three ambiguous, identically-named "Event name filter" entries renamed** to `Exclude passive & legacy events` (5 charts), `Event = resource_pdf_download` (1 chart), `Event = resource_preview_expand` (1 chart).
   - **Bonus bug caught while renaming:** the last two filters above had **no value set at all** (`Equal to (=)` with an empty condition) -- meaning the "PDF Downloads" and "Resource Preview Expands" scorecards were showing "0" from a broken filter matching nothing, not necessarily from real zero activity. Root cause: Looker Studio silently saves an "Equal to" filter with an empty value when "Show suggested values while typing" is on and the typed value has zero historical occurrences in the selected date range (true for these two genuinely-never-fired events). Fixed by toggling that switch off before entering the value, confirmed correct against the site's own tracking source (`scripts/runtime/resources-analytics.js`, `resources-carousel.js`). Both scorecards still show `0` -- now a real zero, backed by a working filter. **If a similar "0" scorecard ever looks suspicious, check Resource → Manage filters and confirm the value column actually shows a value, not just the condition type.**

2. **New Cloudflare Worker: `analytics-digest/`** (deployed, partially wired) -- a separate daily narrative-insights email companion to the Looker Studio PDF. Full architecture, account/secret inventory, and setup steps are documented in `analytics-digest/README.md` -- read that file in full before touching this system, it is the single source of truth. Summary:
   - Own Cloudflare account (`a00e5c592f3d32a0258528122cecde89`, `Rbediner@gmail.com`'s Account -- same account as the DNS zone, deliberately **separate** from `pasteflow-growth-engine`'s account), own GA4 service account (`romanbediner-analytics-digest@gen-lang-client-0482186037.iam.gserviceaccount.com`, Viewer role on GA4 property `524954289`), own Resend API key.
   - Deployed and confirmed live: `https://romanbediner-analytics-digest.rbediner.workers.dev`, cron `0 * * * *` (hourly, self-gates to 8am America/New_York in the handler so it survives DST without a static UTC value).
   - **⚠️ ACTION FOR ROMAN (manual, credential-handling — no agent should do this):** `GA4_SERVICE_ACCOUNT_JSON` secret is **not set**. The key file downloaded during an earlier session's browser automation landed in that browser's sandbox, not on this Mac (confirmed absent from `~/Downloads`, `~/Desktop`, `~/Documents`). Fix: generate a *new* key for the same service account from Google Cloud Console (IAM & Admin → Service Accounts → that account → Keys → Add key → JSON), then `npx wrangler secret put GA4_SERVICE_ACCOUNT_JSON < ~/Downloads/<file>.json` from `analytics-digest/`. Full steps in `analytics-digest/README.md` under "Known gap." `RESEND_API_KEY` and `DIGEST_TRIGGER_TOKEN` are already set. Verify via `curl https://romanbediner-analytics-digest.rbediner.workers.dev/` -- should read `"ga4":true` once fixed (currently `false`).
   - `analytics-digest/` is now **tracked and pushed** (`origin/staging`, commit `354e597`). Roman granted standing permission this session to commit/push to this repo's `staging` branch without asking first (does not extend to promoting `staging` → `prod`, which still follows the documented Release Flow).

3. **EBI Round 1 (9 items) implemented on both systems, pushed at `40125f2`:**
   - `analytics-digest/`: `excludeLocalhostFilter()` added to `ga4.ts` so the Worker's traffic exclusion now matches the Looker Studio filter exactly (previously the Worker only excluded preview-path traffic, not `localhost`); `runDigest()` now catches its own errors and emails a `-- FAILED` alert via Resend instead of only logging; `GET /preview` renders the digest from a shared synthetic fixture (`src/mock-data.ts`) with no secrets needed; `/trigger` bearer check is now constant-time; a cross-reference comment links `EXCLUDED_EVENT_NAMES` to the Looker "Exclude passive & legacy events" filter (two independently-maintained lists, drift risk flagged). Added `vitest` + 15 tests for `insights.ts`'s threshold logic (`npm test`). Redeployed and verified live (`curl .../` and `curl .../preview`).
   - Looker Studio: added a caption to Executive Summary explaining the ~99% "New User %" is a GA4 heuristic on low-traffic sites, not literally zero repeat visitors; added a caption to Audience & Devices explaining the "(not set)" country bucket; **retired the redundant "Conversions" table** on the former "Conversions & Top Pages" page (it was a byte-for-byte duplicate of the Key Actions page's events under a misleading label — "no official GA4 key events are configured yet") and **renamed the page to "Top Pages"**, now pointing readers to the Key Actions page for the full event breakdown.
   - EBI Round 2 requested next — if you're picking this up mid-round, check the conversation for what Round 2 proposed before assuming Round 1 is the latest state.

## Latest — 2026-07-02: Drive-workspace I/O fix + verify-prod-release follow-up (Claude)

**Root cause of the "stuck" background commands (`npm run release:verify-prod`, test runs) from earlier tonight:** the Google Drive-mounted checkout at `.../My Drive/AI/Projects/RB Website/romanbediner.com` was under heavy on-demand file-materialization I/O contention — `verify-prod-release` and a Growth Engine test run both stalled for 15-20+ minutes with near-zero CPU usage (confirms I/O wait, not a real hang, deadlock, or infinite loop). This is separate from the `.git` conflict-copy corruption already documented below — a second, distinct Drive-caused failure mode.

**Fix that works:** clone the repo to a fast local path once per session and run all heavy commands (`npm install`, test runs, release scripts) from there instead of the Drive-mounted folder:
```bash
mkdir -p ~/.local-repos && cd ~/.local-repos && rm -rf romanbediner.com
git clone --branch staging https://github.com/rbediner/romanbediner.com.git
```
Commit and push from the local clone; GitHub is the source of truth, so the Drive-mounted folder simply becomes a viewer/editor copy that a plain `git pull` brings current. Never run two heavy processes against the Drive folder concurrently — that measurably worsens the contention.

**`npm run release:verify-prod -- --sha 1d76a00` follow-up:** the script's CI-run-discovery step (`scripts/release/watch-ci-run.js`, `workflow="CI"`) gave up after 900s with "No matching run discovered," even though `CI` for that exact SHA on `prod` had already completed successfully (confirmed independently multiple ways — see below). This looks like a pre-existing edge case in the run-matching logic under `scripts/release/watch-ci-run.js` (~line 238), not a real release failure; worth a maintainer look but not urgent, since the actual deployment is unambiguously verified:
- `gh run list --branch prod` — `CI` success, `Deploy Pages` success, both SHA `1d76a00`
- GitHub Deployments API — SHA `1d76a00`, environment `github-pages`, state `success`
- Live smoke — `https://romanbediner.com/` 200, correct `percent_scrolled` content

## Latest — 2026-07-02: seq-285 fix promoted to prod, both branches in parity (Claude)

**Promoted `1d76a00` (the `deploy-pages` 30-min timeout fix) from `staging` to `prod`** via fast-forward push, per the Operator Release Workflow. `1d76a00` already had green `CI` and `Deploy Staging` on staging before promotion, so no additional staging validation was needed.

**Prod result, all green:**
- `CI` (prod, SHA `1d76a00`): success
- `Deploy Pages` (prod, SHA `1d76a00`): success — and notably this run itself validated the fix, since the confirmation step took long enough that it would have false-failed under the old 10-minute default.
- GitHub Deployments API independently confirms: SHA `1d76a00`, environment `github-pages`, state `success`.
- Live smoke: `https://romanbediner.com/` returns 200; `framework-brief-analytics.js` confirmed serving `percent_scrolled` (not the retired `scroll_percent`).

**Docs-only commit `755dcdb` (README note about the timeout fix) fast-forwarded to `prod` immediately after** for branch parity — this is a `paths-ignore` commit for both `CI` and `Deploy Pages`, so it did not trigger new runs by design (same pattern already proven safe on staging).

**Formal gate:** `npm run release:verify-prod -- --sha 1d76a00` was run; if its output isn't reflected here yet, the workspace's Google Drive I/O was under heavy contention from concurrent multi-repo work at the time and the check was still finishing. Re-run it directly if you want the printed confirmation: `npm run release:verify-prod -- --sha 1d76a00`.

**prod and staging are now in parity at `755dcdb`.**

## Latest — 2026-07-02: Pages deploy false-failure fixed (Claude)

**Symptom:** the prod `Deploy Pages` run for seq-284 showed a red failure ("Timeout reached, aborting!" on the `Deploy to GitHub Pages` step), making it look like the GA4 `percent_scrolled` fix never shipped.

**Root cause:** the deploy actually **published** (live site was already serving `percent_scrolled`). `actions/deploy-pages@v5` uses a 10-minute default timeout waiting for GitHub to *confirm* the deployment; a transient Pages stall exceeded it and reported a false failure. Re-running made it worse — a re-run uploads a second `github-pages` artifact and the deploy step hard-fails with "Multiple artifacts named github-pages... Artifact count is 2."

**Resolution:**
- Cleared the failed state with a **fresh** `workflow_dispatch` run of `deploy-pages.yml` (new run id, clean artifact set) — went green in 22s; `post-deploy-validation` and `release-tag` (`v2026.07.02`) both ran.
- **Durable fix:** bumped the `Deploy to GitHub Pages` step to `timeout: 1800000` (30 min) so a slow-but-successful Pages confirmation no longer false-fails. Operational rule recorded in-workflow: if a run ever times out, trigger a fresh run — never re-run the failed one.

**Note:** the Google Drive-backed workspace git index was corrupted again (only 4 of 332 files tracked, broken refs); repaired by reconciling 18 `.git` conflict-copies and hard-resetting to `origin/staging`.

## Current State — 🚀 LIVE ON PROD (both branches at `ae87b62`)

**New staging release candidate:** `staging` now contains `26d6b59` (`fix: align framework scroll depth analytics`). This repairs a GA4/Looker contract mismatch on framework brief `scroll_depth` events: the runtime had been sending `scroll_percent`, while the registered GA4 custom dimension and shared site contract use `percent_scrolled`. The fix updates `/scripts/runtime/framework-brief-analytics.js` to emit `percent_scrolled` and adds QA guards in `QA/tests/test-ga4-installation.js` plus `QA/tests/jest/framework-brief-analytics-contract.test.js` so the legacy key cannot silently return.

**Verification completed for the release candidate:** `node QA/tests/test-ga4-installation.js` PASS, `node scripts/qa/verify-ga4-installation.js` PASS, and the targeted Jest suite for the new contract test PASSed in a clean local clone (`node scripts/qa/run-jest-suite.js QA/tests/jest/framework-brief-analytics-contract.test.js --runInBand`). The original Google Drive-backed workspace had git/ref and Jest-runner instability, so the release work moved to a clean local clone where git operations behaved normally.

**PRD updated in the same release cycle:** the live `romanbediner.com PRD` / `SEO Authority PRD` now explicitly states that framework brief `scroll_depth` must use `percent_scrolled` and must not use `scroll_percent`.

**`prod` and `staging` are both at `ae87b62`.** A long autonomous session shipped **four prod releases** tonight (all FF-promoted from staging, all `verify-prod-release.js` green):
- `edf1f16` — OG share-card overhaul + site-wide metadata unification (detail below).
- `fdc466a` — **share-card coverage completed**: `insights/` → `summary_large_image` + card (item C); the `/ai-enabled-operations-dashboard/` app page got full `canonical`/`og`/`twitter` on **both** the Vite source template and the deployed `dist/index.html` (item D, distinct app-focused title/description, no em dash); `404.html` carded so broken-link shares aren't blank.
- `c867994` — **GA4 event instrumentation**: `fleet-diagram-zoom.js` now emits `fleet_diagram_fullscreen` + `fleet_diagram_zoom` (`{diagram_index, diagram_label}`); `site-navigation.js` emits **site-wide `scroll_depth`** at 25/50/75/100% (`{percent_scrolled, page_path}`, rAF-throttled, self-detaches at 100%). README taxonomy updated.
- `ae87b62` — **scroll-depth load-order fix**: `site-navigation.js` (non-deferred) runs before the deferred `ga4-bootstrap.js`, so the initial `evaluate()` marked already-visible thresholds as fired while `trackEvent` was still a no-op → those events were lost (every threshold on short pages). Now defers start until analytics is ready. **Found via live-Chrome verification** (dataLayer had zero scroll_depth pushes).

**Verified live on prod (Chrome browser mode):** agentic page renders correctly (6 pills 2×3, roster with correct names, lightbox opens/zooms); `fleet_diagram_fullscreen` + `fleet_diagram_zoom` confirmed **arriving in GA4 Realtime**; no console errors; homepage GA4 env=production, fresh JS cache tokens, og:image v5.

**GA4 setup done in-UI (Roman's account):** 7 event-scoped **custom dimensions** registered — `resource_slug` (Resource Slug), `resource_title` (Resource Title), `diagram_label` (Diagram Label), `percent_scrolled` (Scroll Percent), `link_type` (Link Type) + legacy `insight_slug`/`insight_title`. A native **Exploration "RB — Events & Engagement"** created under Explore (events by name × users; custom events populate as data accrues). GA4 Home/Reports/Realtime also serve as live dashboards.

### OG overhaul detail (`65eb36c` / `edf1f16`):
- New **lean share card** replaces the prior gradient card: name eyebrow (ROMAN BEDINER), a single Cormorant Garamond headline ("Productizing Operations for Modern, AI-Enabled Work"), the nested-square brand mark + glossy orb top-right, and `romanbediner.com`, on deep navy `#0d1530`. Saved as `assets/og-logo/og-final.png` (1200×630, ~108 KB). The earlier busy version (subhead sentence + "Disney · AWS · Agentic Society" credit line) was dropped — too cluttered at feed size.
- **One default card site-wide:** `og:image` + `twitter:image` bumped `?v=4 → ?v=5` on all 16 routes; the separate `assets/og/framework-preview.png` was **retired** — the six framework detail routes now use the shared card (old asset returns 404).
- `og:image:alt` refreshed (dropped stale "editorial gradient background" wording); **`twitter:image:alt` added** on all 16 routes (mirrors og alt; both locked into `test-og-route-metadata.js`).
- **Preview-build fix — `scripts/build/create-preview-artifact.js`:** absolute `https://romanbediner.com/...` og:image/twitter:image URLs are now rewritten to the preview origin (`https://rbediner.github.io/romanbediner-preview/...`) so OG validators (Orca Scan) reflect the *staged* card, not the live prod image. `canonical`/`og:url` intentionally left on prod. Durable for all future OG previews; covered by existing preview/artifact guard tests.
- **QA:** full-regression pre-push gate green on both SHAs; 4 OG/insights metadata tests + README updated to match. Prod `CI` ✓, `Deploy Pages` ✓, `verify-prod-release.js` ✓ (homepage/sitemap 200, 16 routes). Verified live: prod `og:image` = `.../og-final.png?v=5` (200, image/png, 108285 B); `framework-preview.png` → 404.
- **Validated in Orca Scan** (preview URL): Facebook / LinkedIn / Slack / WhatsApp render the full card cleanly. Orca's "Twitter" panel shows a legacy *summary* (square) crop — an Orca mock limitation, **not** a tag issue (`twitter:card=summary_large_image` is correct, verified); real X renders the large card. Orca's "missing `og:logo`" is also a non-issue (`og:logo` is not in the Open Graph spec; identity lives in the page's `Person`/`WebSite` JSON-LD).

Prior release (`63c2f88`): agentic-page roster card names corrected to the agents' actual names — **Agent — Project Manager**, **Agent — Chief of Staff**, **Agent — Orchestration Director** (em-dash to match page typography); README roster mention updated. FF-promoted to prod; prod `CI` ✓ (3m11s), `Deploy Pages` ✓ (5m32s); live-verified in Chrome.

Prior release (`27c28ad`): agentic eyebrow → "AVAILABLE NOW".
Prior release (`1af606b`, the big one):
**`prod` and `staging` were brought to `27c28ad`.** Latest release (`27c28ad`): the agentic page eyebrow changed **"REFERENCE ARCHITECTURE" → "AVAILABLE NOW"** (availability badge; `.resources-label`, still blue/uppercase). FF-promoted to prod; prod `CI` ✓ (3m7s), `Deploy Pages` ✓ (5m13s), `verify-live-production.js` ✓ (homepage/sitemap 200, 16 routes); live-verified in Chrome (eyebrow reads "AVAILABLE NOW"). **GSC sitemap re-submission still pending Roman (manual).**

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
7. **OG hygiene C + D — ✅ DONE** (`fdc466a`): insights now `summary_large_image` + card; dashboard app page + 404 fully carded. Optional real-X confirmation: drop `https://romanbediner.com/` into a tweet/DM (prod is robots-allowed, unlike the noindex preview).
8. **⚠️ DAILY EMAIL — needs Roman's one OAuth click (blocked for the agent).** GA4 has **no native scheduled-email**; the only path is **Looker Studio**, which on first use shows an "Authorize Data Studio API to access your account" consent. Granting OAuth is outside the agent's autonomous authority, so it was **not** clicked. To finish: open https://lookerstudio.google.com → click **Continue/Authorize** → Create report → add a **Google Analytics** data source (property `romanbediner.com`, a384780622p524954289) → build charts (suggested: Events by event name + count; resource_card_click by `Resource Title`; `scroll_depth` by `Scroll Percent` + page path; sessions by source/medium; engagement time by page) → **Share ▸ Schedule email delivery** → daily → `roman@romanbediner.com`. The custom dimensions registered tonight make all those breakdowns available in Looker.
9. **⚠️ GA4 KEY EVENTS mismatch (recommend reconciling).** The property's Key events are placeholder lead-funnel names (`close_convert_lead`, `qualify_lead`, `purchase`) that the site does **not** emit (all "No stream data"). The site's real high-intent signal is **`connect_intent`** (Connect CTA). Recommend: Admin → Events → mark `connect_intent` (and optionally `resource_card_click`) as a key event once it appears under Recent events, or create a "Create event" rule mapping it to a lead key event. This makes the Key events / conversions reports meaningful.
10. **GA4 reporting foundation (done tonight):** 7 custom dimensions + the "RB — Events & Engagement" exploration. Enhanced Measurement was not explicitly re-verified — worth a glance (Admin → Data Streams → Enhanced measurement) to confirm scroll/outbound/site-search auto-events are on (custom `scroll_depth` supplements but does not replace them).
11. PRD: the OG/metadata change is share-CTA/legibility, not a ranking lever, and analytics added event coverage — consider a brief `SEO Authority PRD` note for the analytics-contract extension (new events + custom dimensions) per the repo's "meaningful product change" rule.

## Release Watcher Hygiene

Keep release watcher hygiene in place for this repo.
- Use `npm run release:watchers:status` and `npm run release:watchers:cleanup`
- Do not use ad-hoc shell polling loops for CI or preview monitoring.
