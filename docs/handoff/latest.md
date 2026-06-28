# Cross-Machine Handoff (Latest)

- Handoff Sequence: 263
- Updated At (UTC): 2026-06-28T20:36:58Z
- Source Branch: staging
- Source Commit: f4776e7187de3b3bf25cc34c2d35a17e2640a50f (pre-handoff baseline)
- Active Agent: Claude (Opus)

## Current State

`staging` head is `f4776e7` — committed and **pushed**, all workflows green for that SHA: `CI` (success, 3m23s), `Docs Sync` (success), and `Deploy Staging` (the push-triggered run was concurrency-canceled as expected; the post-CI `workflow_run` succeeded).

Two code commits this session sit on top of seq-261's `b0d937d` (the Claude-Design fleet diagrams):
- `10ba2e4` — **Uppercase About + Framework-hub page titles** (Roman's request: make Home/About/Framework match the all-caps Services/Resources page titles).
- `f4776e7` — **Refresh stale `/insights/` visual baselines** (pre-existing cross-machine drift; see below).

Staging preview: https://rbediner.github.io/romanbediner-preview/
Prod: https://romanbediner.com/

This session is staging-only. No prod promotion attempted.

## Implemented Changes (this session, on top of 261)

- **All-caps page titles extended to About + Framework hub (`10ba2e4`).** Applied via `text-transform: uppercase` (rendering only — source copy unchanged), mirroring the existing `.resources-main h1` / Services treatment:
  - About: `.about-hero-refactored .page-title` → "EXECUTION IS THE STRATEGY".
  - Framework hub: **`.framework-main:not(.framework-brief-main) h1`** → "THE AI-ENABLED OPERATIONS FRAMEWORK". The `:not()` guard is **load-bearing**: framework **brief** detail pages carry BOTH `.framework-main` and `.framework-brief-main` on `<main>`, so a bare `.framework-main h1` rule leaked onto them and uppercased their long sentence-style H1s (caught during preview verification and fixed). Brief H1s must stay title case.
  - **Home was deliberately left title case.** Decided with Roman after a live A/B on the preview: the Home H1 is a 6-word value-proposition sentence (+ comma), not a short label — in all-caps it overflowed the line, read shouty, and clashed with the all-caps eyebrow directly above it. The all-caps treatment is reserved for short, label-like titles (Services, Resources, About, Framework hub).
  - `about.css` cache-bust token bumped `r3 → r7` (about.css is page-specific, NOT a deploy-time auto-busted shared asset). `framework.css` token left unchanged: it is auto-busted at deploy (shared asset in `create-artifact.js`) and the framework cache-bust contract only requires uniformity, which is preserved.
  - About hero visual baselines regenerated for the new caps render (`about--desktop-fold/full`, `about--mobile-full`); committed in `10ba2e4`.
  - README typography section updated to document the extended all-caps treatment, the brief-page exclusion, and why Home stays title case.

- **`/insights/` visual baselines refreshed (`f4776e7`).** While pushing `10ba2e4`, the local pre-push gate failed deterministically on `insights--desktop-fold/full` (~7.8%, a ~57px vertical reflow vs the `641e1fb` baselines). Root cause: **pre-existing cross-machine rendering drift, NOT this change** — `/insights/` loads only `site.css` (untouched) and has no `.page-title`, so the header edits cannot affect it; the diff reproduced identically against fresh CSS (not the intermittent stale-mirror phantom). Because the **visual regression suite is enforced only by the local pre-push gate** (no `RUN_VISUAL_TESTS` in any GitHub workflow — remote CI skips it), refreshing the three `insights--*` baselines to this machine's render unblocks the gate with zero CI impact. Committed separately with a full explanation.

## Files Changed

- `10ba2e4`: `styles/about.css`, `styles/framework.css`, `about/index.html` (about.css token), `README.md`, `QA/tests/visual-baselines/about--desktop-fold.png` + `about--desktop-full.png` + `about--mobile-full.png`
- `f4776e7`: `QA/tests/visual-baselines/insights--desktop-fold.png` + `insights--desktop-full.png` + `insights--mobile-full.png`

## QA Summary

All green and pushed:
- Local full-regression pre-push gate (`qa:ci-parity`) — PASS (142s), visual suite 8/8 against refreshed baselines
- `RUN_VISUAL_TESTS=1 npm run test:visual` (direct, fresh CSS) — 8/8 PASS after the insights baseline refresh
- Remote `CI` — success (3m23s) on `f4776e7`; `Docs Sync` — success; `Deploy Staging` `workflow_run` — success
- Live-preview verified (Claude-in-Chrome, 1440px): About "EXECUTION IS THE STRATEGY" uppercase; Framework hub "THE AI-ENABLED OPERATIONS FRAMEWORK" uppercase; Framework **brief** H1 title case (guard held); Home H1 title case (unchanged). about.css served fresh via `?v=r7`.

## Environment / Reliability Notes

- **Visual regression is local-gate-only.** No workflow sets `RUN_VISUAL_TESTS=1`; remote CI's python suite skips the visual tests (opt-in). The committed baselines are the local gate's reference and are inherently machine-sensitive — hence `PER_FILE_THRESHOLDS` (insights--mobile-full at 0.02) and the recurring phantom diffs.
- **Phantom vs real visual diffs:** the documented `home--mobile-full` ~7.5% phantom is **intermittent** (stale CSS pulled into the gate's `/tmp` mirror off the Drive mount) → retry passes. The `insights--desktop-fold/full` ~7.8% this session was **deterministic** (reproduced against fresh CSS) → a genuinely stale baseline needing regeneration. Distinguish them by running `RUN_VISUAL_TESTS=1 npm run test:visual` directly in the workspace: if it still fails, the baseline is stale; if it passes, the gate failure was the stale-mirror phantom (just `git push` again).
- Google Drive File Stream mount: still slow / occasionally stale; `git` HEAD is source of truth; `session:ready` still hangs (do not block on it). The Launch preview MCP reads `.claude/launch.json` from the **session root** (parent `RB Website` dir); an `rb-site` serve config (serving `romanbediner.com/` on :8799) was added there for local verification.

## Open Items / Follow-ups

1. **Roman to review** the live staging preview — the new fleet diagrams on `/resources/agentic-ai-employees/` (from seq 261), and the all-caps About + Framework-hub titles. Allow GitHub Pages CDN propagation; hard-refresh for stale CSS.
2. **When promoting to prod** (only when Roman explicitly approves; fast-forward only, exact tested staging HEAD `f4776e7`): **immediately re-submit `sitemap.xml` in Google Search Console** (GSC last auto-read it Feb 18; manual re-submit forced discovery 5 → 15 earlier this cycle). After prod, run `node scripts/qa/verify-live-production.js` (or `npm run release:verify-prod -- --sha <prod-sha>`).
3. **Known CI nuisance:** the pre-push visual gate can deterministically fail ~first attempt with the phantom `home--mobile-full` ~7.5% diff (stale `home.css` in the gate's Drive-mount temp copy). The committed baseline is correct — **just `git push` again.** If a *different* baseline fails repeatably, verify with a direct `test:visual` run before regenerating (see Environment notes).
4. Backlog (deferred; copy-sensitive, Roman supplies copy): About-timeline mobile progressive disclosure; metric-backed proof points on About/Home; an FAQ/Q&A block for answer-engine retrieval; unified eyebrow atop Resources/Services; richer OG share image. Do not revive `/insights/` (intentional empty noindex stub; the real briefs are indexable).
5. PRD: the header all-caps change is a typography/rendering decision; the insights baseline refresh is QA maintenance. Neither changes site behavior/IA/metadata, so no `SEO Authority PRD` update was required. (The seq-261 agentic-resource diagrams were also visual-only.)

## Release Watcher Hygiene

Keep release watcher hygiene in place for this repo.
- Use `npm run release:watchers:status` and `npm run release:watchers:cleanup`
- Do not use ad-hoc shell polling loops for CI or preview monitoring.
