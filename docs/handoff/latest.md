# Cross-Machine Handoff (Latest)

- Handoff Sequence: 189
- Updated At (UTC): 2026-04-21T18:00:00Z
- Source Branch: staging
- Source Commit: 873a1ce (full SHA pending push confirmation)
- Active Agent: No active agent — staging complete and verified, awaiting owner review

## Current State

All work complete on staging (`873a1ce`). CI passed, Deploy Staging succeeded. Phase 7 sync confirmed working.

**Critical fix landed**: dashboard iframe was rendering in the lower-right corner instead of centered/filling the frame. Root cause: `.app-shell` used `width: 100vw; height: 100vh` — inside an iframe, `100vh` resolves to the parent page height, not the iframe's height. Fixed to `width: 100%; height: 100%` in both the dashboard source CSS and the compiled dist asset.

Staging preview: `https://rbediner.github.io/romanbediner-preview/resources/ai-enabled-operations-dashboard/`

Prod has NONE of the dashboard work. Do not promote to prod until explicitly instructed.

## What Was Completed This Full Session

### Commits on staging this session:
- `1535157` — UX Pass 1 (iframe raised, single callout, source card redesign, nav-anchor bottom)
- `3b82521` — Handoff seq 185
- `38e275c` — Fix em dashes in HTML comments (CI guardrail)
- `7dbd554` — Wireframe tile + modal (main feature work)
- `b97972c` — Handoff seq 186
- `928b631` — UX Pass 2 (view cards, conversation card, spacing, README)

### Full Feature Set Now Live on Staging

**resources/ai-enabled-operations-dashboard/index.html**
- Single intro callout (shelf-callout pattern), prose lede below
- Iframe raised to immediately follow intro lede
- Browser-chrome header on iframe frame shell (dark bar, three dots, label)
- "What This Dashboard Helps Answer" and "In This Dashboard" sections below iframe
- Core Dashboard Views, Operating Principles sections
- Source callout card with blue left border — mentions dashboard source, wireframe, and PRD
- Wireframe tile section (eyebrow, title, copy, dark framed button tile)
- Wireframe modal (role=dialog, aria-modal, backdrop, close, Escape key, lazy iframe)
- Conversational close with top divider separator, flex row layout (CTA right-aligned desktop)
- Page nav: "Back to Resources Hub" (left arrow) + "Explore the Full Framework" (right arrow)

**styles/resources.css**
- View block cards: tighter padding (18/20/20), 4px title gap, blue 2px top border anchor
- Conversation card: increased padding (32/36/34), flex row desktop, top border divider
- Post-iframe section spacing: 44px → 36px
- Source callout closing-zone margin: 48px → 56px
- Wireframe tile CSS: dark card, chrome bar, preview area, CTA label strip
- Wireframe modal CSS: backdrop, centered inner, close button, mobile responsive
- Mobile: conversation card stacks vertically

**scripts/runtime/dashboard-wireframe-modal.js (NEW)**
- CSP-safe external IIFE
- Lazy iframe src injection on first open
- Escape key, backdrop click, close button handlers
- aria-hidden toggle, scroll-lock body class, focus return

**assets/resources/ai-enabled-operations-dashboard/wireframe-prototype.html (NEW)**
- Copied from Canopy Management design directory
- Served as same-origin static asset for modal iframe

**ai-enabled-operations-dashboard/README.md**
- Added "What Is Included" table listing src, design/wireframe-prototype.html, docs/PRD.md, docs/HANDOFF-SOP.md

**QA/tests/test-resources-phase1.js**
- Updated source callout assertion to match new copy
- Added: wireframe tile position/content assertions, modal role/aria/attrs/JS behavior, wireframe asset on disk

## Architecture Notes

- Dashboard iframe: `src="/ai-enabled-operations-dashboard/"` — final static-site architecture
- `/resources/ai-enabled-operations-dashboard/` = human-facing page
- `/ai-enabled-operations-dashboard/` = Vite/React artifact route (iframe src only)
- Wireframe modal iframe: `src="/assets/resources/ai-enabled-operations-dashboard/wireframe-prototype.html"` (same-origin, lazy-loaded)
- Phase 7 sync: `.github/workflows/sync-dashboard-public.yml` — triggers on staging push when `ai-enabled-operations-dashboard/**` changes; `DASHBOARD_REPO_TOKEN` secret is set and confirmed working (first successful sync 2026-04-21)
- Public repo: `https://github.com/rbediner/ai-enabled-operations-dashboard`
- PRD: `ai-enabled-operations-dashboard/docs/PRD.md` in main repo, synced to public repo via Phase 7

## Release Watcher Hygiene

Keep release watcher hygiene in place for this repo.
- Use `npm run release:watchers:status` and `npm run release:watchers:cleanup`
- Do not use ad-hoc shell polling loops for CI or preview monitoring.

## PRD Status

- PRD update still pending — Google Doc: `https://docs.google.com/document/d/15WTgARcQl8jlKuqYtQdxBucWjEsXvrxnGNqbB0xTbE8/edit`
