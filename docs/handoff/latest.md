# Cross-Machine Handoff (Latest)

- Handoff Sequence: 182
- Updated At (UTC): 2026-04-21T00:30:00Z
- Source Branch: staging
- Source Commit: f55141b208e8d0a3982f913d3b8bd6fb5964e6bf

## Session Summary (2026-04-21)

Codex completed Phases 4, 5, 6 (dashboard import, iframe wiring, artifact packaging). Claude session did codebase cleanup: removed orphaned `scripts/runtime/insights-toggle.js`.

## Phases Complete (from Codex — see prior handoffs for detail)

- **Phase 4** — Dashboard source imported into `ai-enabled-operations-dashboard/`, built to `dist/`
- **Phase 5** — Live iframe wired in resource page, mobile screenshot asset added
- **Phase 6** — Artifact packaging updated, QA guardrails added
- Staging CI + Deploy Staging both green at `cff6555` (Codex) → now at `f55141b` (post-cleanup)

## Cleanup This Session

- Deleted `scripts/runtime/insights-toggle.js` — confirmed dead code. Framework migration removed it from all HTML pages; a Jest invariant test (`QA/tests/jest/insights-analytics.test.js`) explicitly asserts it must NOT be loaded. File was never referenced by any `<script>` tag.

## Codebase Health Notes (for future cleanup passes)

- **`assets/asset-library/concept-images/`** — 4 PNG/JPG concept images with no HTML/CSS references. Left in place per owner preference (not dead code, may be design references).
- **`assets/asset-library/brand-sources/og-logo-source.psd`** — design source file, no CI/build dependency. Left in place.
- **`scripts/qa/route-health.js`** — shared helper used by `verify-live-preview.js` and `verify-live-production.js`. Not orphaned — leave in place.
- **Gate profile optimization** — `docs/handoff/latest.md` already maps to `docs-only` profile (fast, ~10s). Gate escalates to full-regression when handoff is bundled with code changes. Commit handoff separately from code to keep gate fast.

## Branch / Release State

- `staging`: green, Deploy Staging passing
- `prod`: Codex cherry-picked connect divider fix; Phase 2–6 dashboard NOT yet on prod
- Public dashboard repo: `rbediner/ai-enabled-operations-dashboard` — clean, no Canopy refs
- Promotion of Phase 2–6: not performed

## Staging Preview URL

`https://rbediner.github.io/romanbediner-preview/resources/ai-enabled-operations-dashboard/`

## Remaining Phases

- **Phase 7** — GitHub Action to sync `romanbediner.com/ai-enabled-operations-dashboard/` changes back to `rbediner/ai-enabled-operations-dashboard`
- **Phase 8** — Final docs/report, PRD update (Google Doc link in prior Codex handoff)

## Important Notes for Next Agent

- Dashboard iframe depends on packaged artifact route `/ai-enabled-operations-dashboard/`
- If dashboard source changes, rebuild dist before release
- `resources/ai-enabled-operations-dashboard/index.html` has the live iframe wired — no placeholder
- Spec file: `/Users/roman.bediner/Downloads/dashboard_migration_and_resource_page_spec.md`

## Release Watcher Hygiene

Keep release watcher hygiene in place for this repo.
- Use:
  - `npm run release:watchers:status`
  - `npm run release:watchers:cleanup`
- Do not use ad-hoc shell polling loops for CI or preview monitoring.

## PRD Status

- PRD update still pending — Google Doc: `https://docs.google.com/document/d/15WTgARcQl8jlKuqYtQdxBucWjEsXvrxnGNqbB0xTbE8/edit`
