# Cross-Machine Handoff (Latest)

- Handoff Sequence: 215
- Updated At (UTC): 2026-04-25T01:35:25Z
- Source Branch: staging
- Source Commit: 7ee51c2543012e1300c0a73554f612fc2f0fe204 (pre-handoff baseline)
- Active Agent: No active agent — redesign pass in progress, staging only

## Current State

**staging** is ahead of **prod** by ~10 commits. prod is still at `8cef5064ef4dec7fde53d8003a80502d67ea991b` (pre-redesign).

Do NOT promote to prod yet. User is conducting visual QA on staging before deciding.

Staging preview: https://rbediner.github.io/romanbediner-preview/
Prod: https://romanbediner.com/

---

## 2026 Redesign Work Completed This Session (staging only)

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

---

## Pending Visual QA (User's Next Step)

User requested a **full prod vs staging comparison** across ALL pages on desktop AND mobile before deciding on promotion. Specific focus:
- Identify regressions (not redesign changes)
- All canonical routes: `/`, `/about/`, `/framework/`, `/services/`, `/connect/`, `/resources/`, `/insights/`
- All brief pages: `/framework/opportunity/productizing-operations/`, `/framework/design/operations-as-product/`, `/framework/integration/ai-operating-layer/`, `/framework/execution/operational-lanes/`, `/framework/signals/operational-signals/`, `/framework/evolution/agentic-guardrails/`
- Resource pages: `/resources/ai-enabled-operations-framework-summary/`, `/resources/ai-enabled-operations-dashboard/`

---

## Known Issues / Open Items

- **insights mobile visual regression**: Playwright's Chromium font rendering is non-deterministic for DM Sans — the insights mobile baseline drifts ~14% between runs even without code changes. Baseline updated twice this session. A spawned task exists to raise the per-page threshold. Do not be alarmed if this fails on the next push — just run `npm run test:visual:update` and commit.
- **Connect page visual fidelity**: User acknowledged it doesn't fully match the mockup but explicitly deferred further work. Do not restyle Connect without explicit instruction.
- **PRD update**: Google Doc PRD still needs updating for the dashboard resource page (carried over from previous session).
- **prod still at pre-redesign SHA**: Do not touch prod until user signs off on staging QA.

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

---

## Validation

Staging SHA `7ee51c2` CI status: check at https://github.com/rbediner/romanbediner.com/actions
Staging preview: https://rbediner.github.io/romanbediner-preview/

## Release Watcher Hygiene

- Use `npm run release:watchers:status` and `npm run release:watchers:cleanup`
- Do not use ad-hoc shell polling loops for CI or production monitoring
