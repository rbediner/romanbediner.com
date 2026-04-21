# Cross-Machine Handoff (Latest)

- Handoff Sequence: 184
- Updated At (UTC): 2026-04-21T13:00:00Z
- Source Branch: staging
- Source Commit: 353efd0 (local) — pending remote CI

## Session Summary (2026-04-21)

Claude session completed all remaining dashboard migration phases on staging:

1. Flipped `/resources/` dashboard card from Coming Soon to launched state (`Available Now` badge, real `<a>` link)
2. Updated `test-resources-phase1.js` to assert launched card state; coming-soon/disabled assertions removed
3. Created Phase 7 sync workflow (`.github/workflows/sync-dashboard-public.yml`)
4. Fixed bullet schema on dashboard resource page: `resource-dashboard-screen-story` now uses canonical site orb bullets (`service-list` class) instead of custom CSS circles
5. Repositioned top CTA (View Source Code) to appear after the blue callout rather than between the two intro callout boxes — reduces visual clutter in the header area
6. Updated CSS comment to reflect new top CTA position
7. Updated handoff (this file) with all required documentation

## Dashboard Migration Phases Status

- **Phase 2** — Dashboard resource page at `/resources/ai-enabled-operations-dashboard/` — complete, all locked copy ✓
- **Phase 3** — Public repo renamed to `rbediner/ai-enabled-operations-dashboard`, Canopy refs scrubbed — complete ✓
- **Phase 4** — Dashboard source imported into `ai-enabled-operations-dashboard/` with committed `dist/` build output — complete ✓
- **Phase 5** — Live iframe wired in resource page, mobile screenshot asset added — complete ✓
- **Phase 6** — Artifact packaging updated, QA guardrails added — complete ✓
- **Phase 7** — GitHub Action sync workflow created — complete ✓ (see Phase 7 section below)
- **Phase 8** — Docs update (this file) — complete ✓

## Integration Architecture: Why iframe is the Final Choice

The dashboard at `/resources/ai-enabled-operations-dashboard/` embeds the live dashboard via an `<iframe src="/ai-enabled-operations-dashboard/">`. This is the **final static-site integration architecture**, not a temporary placeholder.

**Why iframe:**
- The dashboard is a Vite/React SPA. GitHub Pages serves static files only — there is no server-side composition or SSI available.
- The only way to render a live React app inside a parent static HTML page is to embed it via iframe (same-origin, no cross-origin friction).
- The iframe is same-origin so the dashboard's own fullscreen control, 16:9 scaling behavior, and internal JS all function exactly as in standalone mode.
- This satisfies the spec requirements: preserve built-in fullscreen behavior, preserve internal 16:9 behavior, render immediately on page load.
- No second external fullscreen control is added — the dashboard's native control is used.

**This is not a fallback.** It is the correct architecture for static-site embedded SPA delivery.

## Route Architecture: Two Paths, One Dashboard

| URL | Role |
|---|---|
| `/resources/ai-enabled-operations-dashboard/` | Public-facing resource page — all locked copy, CTAs, intro, mobile fallback, page nav |
| `/ai-enabled-operations-dashboard/` | Dashboard artifact route — Vite/React build output, the actual SPA being embedded |

The resource page is what visitors land on and bookmark. The artifact route is what the iframe `src` points to. The artifact route is not a standalone human-facing page — it is the embedded experience powering the iframe.

Visitors never navigate directly to `/ai-enabled-operations-dashboard/` intentionally. The sitemap and canonical URL are both on the `/resources/` route.

## Phase 7: Public Repo Sync Workflow

**File:** `.github/workflows/sync-dashboard-public.yml`

**Triggers:**
- Push to `staging` branch when any file under `ai-enabled-operations-dashboard/**` changes
- Manual `workflow_dispatch`

**What it does:**
- Checks out `romanbediner.com` (source) and `rbediner/ai-enabled-operations-dashboard` (public target)
- Clears all tracked files from the public repo, copies the dashboard source directory, and commits + pushes if anything changed
- Commit message includes the short SHA from `romanbediner.com` for traceability

**Required secret:** `DASHBOARD_REPO_TOKEN`
- Must be added to `rbediner/romanbediner.com` → Settings → Secrets → Actions
- Must be a fine-grained personal access token (or classic token) with `contents: write` permission scoped to `rbediner/ai-enabled-operations-dashboard` only
- The workflow reads this secret via `${{ secrets.DASHBOARD_REPO_TOKEN }}` — no other configuration needed

## Resources Card State

The dashboard card on `/resources/` now shows `Available Now` with `href="/resources/ai-enabled-operations-dashboard/"`. Coming-soon/disabled state removed. This is **staging-only** — prod still has the old coming-soon state since dashboard phases have not been promoted to prod.

## Branch / Release State

- `staging`: green at `353efd0` (local) — remote at `2f569f8`, UX fix push pending
- `prod`: dashboard phases NOT on prod — only the connect divider fix was cherry-picked to prod
- Public dashboard repo: `rbediner/ai-enabled-operations-dashboard` — clean, no Canopy refs

## Staging Preview URL

`https://rbediner.github.io/romanbediner-preview/resources/ai-enabled-operations-dashboard/`

## QA Contract (test-resources-phase1.js)

Test asserts launched state. Key assertions:
- `class="resource-meta">Available Now<` — must be present
- `href="/resources/ai-enabled-operations-dashboard/"` — must be present as real link
- `is-coming-soon` — must NOT be present
- `class="resource-primary-cta is-disabled"` — must NOT be present

## UX/UI Changes This Session

1. **Bullet schema fixed** — `resource-dashboard-screen-story` (In This Dashboard) now uses site-canonical orb bullets via `service-list` class. Custom blue CSS circle `::before` removed.
2. **Top CTA repositioned** — `View Source Code` now appears after the blue callout ("Designed as a shareable...") rather than sandwiched between the two intro callout boxes. This removes the clutter of a floating button between two identical-looking callout blocks.
3. All three bullet lists on the page now use consistent orb bullets: `What This Dashboard Helps Answer`, `In This Dashboard`, `Operating Principles`.

## Release Watcher Hygiene

- Use `npm run release:watchers:status` and `npm run release:watchers:cleanup`
- Do not use ad-hoc shell polling loops

## PRD Status

- PRD update still pending — Google Doc: `https://docs.google.com/document/d/15WTgARcQl8jlKuqYtQdxBucWjEsXvrxnGNqbB0xTbE8/edit`
