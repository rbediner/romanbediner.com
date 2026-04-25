# Cross-Machine Handoff (Latest)

- Handoff Sequence: 224
- Updated At (UTC): 2026-04-25T11:55:06Z
- Source Branch: staging
- Source Commit: bd41fdde690e6e64960fc87e985e1ef242f43eda (pre-handoff baseline)
- Active Agent: No active agent — all session fixes on prod, live verification passed

## Current State

**staging and prod are in sync** at `bd41fdd`. The full 2026 redesign plus all session polish is live on prod.

**Live verification passed** — 14 routes checked, all 200. https://romanbediner.com is live.

Staging preview: https://rbediner.github.io/romanbediner-preview/
Prod: https://romanbediner.com/

---

## Visual QA Results (Prod vs Staging) — COMPLETE

Full prod vs staging comparison run at 390px mobile and 1440px desktop across all canonical routes and brief pages.

### Desktop (1440px) — All Clear ✅

| Page | Result |
|------|--------|
| Home `/` | ✅ No regression — credential eyebrow, serif H1, DM Sans body are redesign changes |
| About `/about/` | ✅ No regression — 2-col philosophy grid confirmed |
| Framework `/framework/` | ✅ No regression — serif H3s, section cards |
| Services `/services/` | ✅ No regression — numbered .svc-entry layout (01–05) is intentional redesign |
| Connect `/connect/` | ✅ No regression — DM Sans now correct, form/LinkedIn block intact |
| Resources `/resources/` | ✅ No regression |
| Insights `/insights/` | ✅ No regression — redirects correctly |
| All 6 brief pages | ✅ No regression — serif H2/H3 weight 400, pill strip |

### Mobile (390px) — All Clear ✅

| Page | Result |
|------|--------|
| Home `/` | ✅ No regression |
| About `/about/` | ✅ Single-col on mobile (correct — grid collapses ≤768px) |
| Framework `/framework/` | ✅ No regression — stage cards stack cleanly |
| Services `/services/` | ✅ No regression — numbered entries stack |
| Connect `/connect/` | ✅ No regression — form + LinkedIn block stacked |
| Resources `/resources/` | ✅ No regression — both resource cards present |
| Brief page (Opportunity) | ✅ Pills confirmed scrollable: scrollWidth 614 / clientWidth 326, overflow:auto |

**All differences between prod and staging are intentional 2026 redesign improvements. Zero regressions.**

---

## 2026 Redesign Work Completed (staging only)

### Typography & Design System (site.css)
- **DM Sans** loaded via `@import` in `site.css` — all pages inherit, no per-page `<link>` needed
- **H1/H2**: always `var(--font-serif)` (Cormorant Garamond) via `!important` rule in site.css
- **Editorial serif selector group** added: `.framework-section h3`, `.svc-h3`, `.svc-num`, `.brief-section h2`, `.brief-section .brief-section-heading` → `font-family: var(--font-serif)`
- **Nav**: Connect promoted to `.nav-cta` blue pill button; core links reduced to About, Framework, Resources, Services

### Home (index.html + styles/home.css)
- Credential eyebrow added above H1: "THE WALT DISNEY COMPANY · AMAZON WEB SERVICES" via `.credential-eyebrow`

### Services (services/index.html + styles/services.css)
- Full restructure from `.service-stack`/`.service-card` to numbered `.svc-list`/`.svc-entry` layout
- 5 entries (01–05) with: large serif number, icon+label eyebrow, serif H3, bullet list, `.svc-impact` tan box
- **Services is NOT a 2-col grid** — numbered list is the correct mockup design

### About (about/index.html + styles/about.css)
- `.philosophy-stack` changed to `display: grid; grid-template-columns: 1fr 1fr; gap: 48px` on desktop
- Collapses to single column at ≤768px
- `about.css` cache-busted at `?v=20260424a` — required to bust browser cache of old single-col CSS

### Framework (styles/framework.css + all brief pages)
- `.framework-section h3`: `font-family: var(--font-serif); font-weight: 400` (was DM Sans bold)
- `.brief-section h2` and `.brief-section-heading`: `font-weight: 400`, serif — brief pages no longer bold
- Mobile pills: `.framework-progress-markers` uses `overflow-x: auto` + `flex-wrap: nowrap` + `scrollbar-width: thin` — all 5 stage pills scroll horizontally with a visible thin scrollbar
- `.framework-progress-line { display: none }` on mobile prevents progress-line viewport bleed
- Framework CSS cache-bust: `?v=20260424c` across all 7 framework HTML pages

### Connect (connect/index.html + styles/connect.css)
- `connect.css` rewritten: removed ~165 lines of duplicate site-level CSS that was forcing old `-apple-system` font stack over DM Sans
- Page-specific styles now use 2026 tokens: `--text-primary`, `--text-secondary`, `--accent-blue`
- Ambient orb gradient, form card, LinkedIn block, mobile stacking — all preserved
- `connect.css` cache-busted at `?v=20260424a`
- **Note**: user reviewed Connect on staging and said "whatever, let's leave it" — further visual polish deferred

### Test Infrastructure
- `QA/tests/test_visual_regression_playwright.py`: added `PER_FILE_THRESHOLDS` dict with `insights--mobile-full.png` raised to `0.02` — absorbs DM Sans sub-pixel kerning variance in headless Chromium without masking structural regressions

### Post-QA Polish Fixes (staging only)
- **Credential eyebrow mobile**: `.credential-eyebrow` at ≤768px → `font-size: 9px; letter-spacing: 0.12em` — company names now wrap between entries, not mid-name
- **Footer spacing mobile**: `.next-page-nav` at ≤768px → `margin-top: 48px; margin-bottom: 32px` (was 100px/60px) — eliminates excessive whitespace above footer on all pages
- **Integration brief Level 4**: "Adaptive Operations Layer" → "Adaptive Operations" — removes orphaned "Layer" on mobile line break
- **Execution brief Lane Anatomy**: `(Structured View)` wrapped in `white-space:nowrap` span — forces line break before parenthetical rather than inside it
- **Resources hub**: Removed redundant `<p class="resources-label">RESOURCES</p>` above H1 — H1 "Resources" stands alone
- **Dashboard resource page**: question grid 3-col (was 2-col); box border-radius 6px (was 10-12px); quadrant h3 font-weight 600; Core Views `strong` uses `--text-primary` (was `--accent-blue`); source callout padding/radius tightened to match mockup
- Visual baselines refreshed: home/about/services mobile PNGs updated for eyebrow + footer spacing changes
- QA/tests/test-insights-layout.js + test_insights_layout.py: Lane Anatomy heading contract updated to match nowrap span HTML

### Session 219–221 Polish Fixes (now on prod) — commits 12ceb6a, ba93983, 8b22f42
- **Resources hub CTA button**: "Open the Framework Summary" → "Open Framework Summary" — removes "the" so pill fits on one mobile line
- **Framework summary back nav mobile**: added `← Resources Hub` mobile label (`nav-label-mobile`) — matches arrow pattern used on dashboard page; SVG arrow was hidden on mobile via CSS
- **Resource pages mobile footer spacing**: `.resources-main` mobile override adds `padding-bottom: 32px` (was unset, inheriting 72px); `.resource-page-nav` mobile margins reduced (top: 32px, bottom: 20px) — eliminates ~112px dead space above footer across all resource pages on mobile
- **Operating Principles legibility (dashboard page)**: label 13px → 15px desktop / 12px → 13px mobile; row items 12px → 15px desktop (two passes); mobile list view unaffected
- **Mobile footer gap (second pass)**: `.resource-page-nav .page-nav-divider` mobile `margin-bottom` 32px → 14px in site.css — the hidden culprit adding space above nav links
- **CSS cache-bust**: `?v=20260425a` added to site.css and resources.css links on all 3 resource pages; `test-clean-urls.js` contract updated to allow version query params on site.css href

### Session 223 Fixes (now on prod) — commit bd41fdd
- **Footer gap desktop + mobile (root fix)**: `next-page-nav` desktop margins 100px/60px → 60px/36px (site.css); `resources-main` padding-bottom 72px → 40px desktop; `resource-page-nav` desktop margins 54px/40px → 36px/20px
- **Services page legibility**: `svc-label` eyebrow 10px → 12px; `svc-impact-label` 9px → 11px; `svc-impact p` body 14px → 16px
- **CSS cache-bust v2**: `?v=20260425b` on site.css across all 15 HTML pages; resources.css and services.css bumped on their pages
- **QA contract fixes**: `test-clean-urls.js`, `scripts/qa/validate-links.js`, `QA/tests/test_contact_form.py` all updated to allow `?v=` query params on site.css href (three separate exact-match checks)
- **Visual baselines refreshed**: about, insights, services desktop/mobile PNGs updated for nav margin + font size changes

---

## Known Issues / Open Items

- **Connect page visual fidelity**: User acknowledged it doesn't fully match the mockup but explicitly deferred further work. Do not restyle Connect without explicit instruction.
- **PRD update**: Google Doc PRD still needs updating for the dashboard resource page (carried over from previous sessions).
- **prod is now live** at the 2026 redesign SHA. All session polish fixes are included.

---

## CSS Variable Reference (2026 Design Tokens)

| Token | Value | Usage |
|---|---|---|
| `--font-serif` | Cormorant Garamond | H1, H2, `.svc-h3`, `.svc-num`, brief headings |
| `--font-sans` | DM Sans | Body, nav, labels, form fields |
| `--h1-size-desktop` | 54px | H1 on all pages |
| `--h1-size-mobile` | 34px | H1 on mobile |
| `--accent-blue` | #3b6cff | Links, CTAs, nav button, svc-label |
| `--text-primary` | #111111 | Primary text |
| `--text-secondary` | #555555 | Secondary/muted text |
| `--border-color` | #e6e6e6 | Borders, dividers |

**Important**: `--text-color` is NOT defined in `:root` — site.css uses it with inline fallbacks `var(--text-color, #111111)`. Do not add it to `:root`; do not rely on it in new CSS.

---

## Test Infrastructure Notes

- Pre-push hook runs full-regression gate (~140s) before every push
- `typography-regression.test.js`: bars `about.css` and `services.css` from `font-family:` declarations — all serif selector rules must live in `site.css`
- `readme_integrity.test.js`: requires README.md update in same diff as any change to `styles/`, `scripts/`, `QA/tests/`, or canonical HTML files
- Visual baselines: `QA/tests/visual-baselines/` — run `npm run test:visual:update` after intentional layout changes, then commit the updated PNGs
- `PER_FILE_THRESHOLDS` in `test_visual_regression_playwright.py`: per-file threshold overrides for known non-deterministic baselines — add entries here with documented root cause only

---

## Validation

Staging preview: https://rbediner.github.io/romanbediner-preview/
CI actions: https://github.com/rbediner/romanbediner.com/actions

## Release Watcher Hygiene

Maintain release watcher hygiene between sessions:
- Use `npm run release:watchers:status` and `npm run release:watchers:cleanup`
- Do not use ad-hoc shell polling loops for CI or production monitoring
