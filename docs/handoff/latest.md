# Cross-Machine Handoff (Latest)

- Handoff Sequence: 254
- Updated At (UTC): 2026-06-28T13:53:26Z
- Source Branch: staging
- Source Commit: e2d7719c5724ef3e068f082a5d221278cbfd615a (pre-handoff baseline)
- Active Agent: Claude

## Current State

`staging` head is `98c6190`: the pre-production polish / SEO / responsive / accessibility pass (`30b8e7c`) plus a series of mobile + desktop UI follow-ups (`a8eaafc`, `43ad325`, `633e79f`, `98c6190`). Each push passed the full-regression pre-push gate; the docs-only handoff commits sit between them. Desktop and mobile viewport audits are complete. Preview re-fetch + CDN propagation lag applies after each push.

Staging preview target (workflow-managed): https://rbediner.github.io/romanbediner-preview/
Prod: https://romanbediner.com/

This session remains staging-only. No prod promotion was attempted.

## Implemented Changes

- Cache-bust tokens (`e2d7719`): `home.css` (20260425b->20260628a) and `framework.css` (20260627a->20260628a) were edited after their last token bump, so the GitHub Pages edge CDN served stale CSS under the unchanged `?v=` URLs (incognito does not bypass the edge cache). Bumping forced fresh fetches; live preview confirmed serving the new eyebrow/logo and framework-nav CSS.
- Eyebrow consistency (`98c6190`): the home `.credential-eyebrow` was the only blue eyebrow and the smallest (11px desktop / 9px mobile). It now matches the shared eyebrow treatment used on About/Resources/Framework — secondary gray, 12px, 0.14em tracking, single line on mobile. NOTE: open follow-up to fully unify eyebrow size/color/weight/tracking across ALL pages (`.credential-eyebrow`, `.section-eyebrow`, `.resources-label`, `.framework-label` still differ in weight/tracking/gray token), pending a blue-vs-gray decision from Roman.
- Mobile logo band v2 (`633e79f`): the "SELECTED OPERATING EXPERIENCE" label inherited 20px from `.master-blurb p` and wrapped to 2-3 lines on mobile; it is now pinned to 13px / one line. Laser Light read too small, so mobile logo max-heights were rebalanced (Laser up 30->42, Disney trimmed 40->36).
- Desktop logo rebalance (`43ad325`): base per-mark heights tuned (Disney up; AWS, Laser, Agentic down) so the desktop operating-experience row reads at even visual weight.
- Mobile follow-up (`a8eaafc`): home logos sized by capped height+width on the two-column mobile grid; framework mobile stage-nav markers `justify-self: stretch` so pills fill their cell and no longer overlap the adjacent column.
- Desktop audit (Playwright @1440px) and mobile audit (@360/390/414px) across all nine main pages: no horizontal overflow; About chapter anchors resolve below the fixed header on both; spacing, CTA hierarchy, resource-detail lede widths all verified.
- Home: removed the logo-band qualifier sentence; added modest hero breathing room; optically normalized operating-experience logos (Laser Light enlarged, Agentic Society reduced).
- About: chapter index items are now functional same-page anchors with fixed-header `scroll-margin-top` and hover/focus states; fixed the timeline label overflow (labels wrap and the `.arc-item` clears the rail so GLOBAL INFRASTRUCTURE ADVISORY no longer crosses it); durable Agentic Society opening wording (the coordinated fleet of agentic AI employees claim is preserved); Operating Philosophy now uses a thin blue left-rule inset; final CTA reads "Explore Service Models" → `/services/`.
- Services: final CTA hierarchy — "Start a Conversation" primary (first), "Explore the Framework" secondary; labels/destinations unchanged.
- Connect: removed the "Email Roman" action card entirely; the contact form is now the only direct contact method and the first action; LinkedIn block + black "Send message" button retained.
- PasteFlow: exact approved opening thesis and "In This Product" copy; single "Add to Chrome"; added a clear hero-to-"Who This Is For" gap.
- Framework: mobile stage nav is now a two-column grid (no horizontal scroll); framework.css cache-bust `?v=20260627a`.
- SEO: approved titles/descriptions across all canonical routes + the six framework detail routes; extended `Person.knowsAbout` and About/Services `WebPage.about` schema with agentic terms; `noindex,follow` added to `/insights/` and all six `/brief/` redirect stubs.
- Tests, visual baselines, and README updated to match.

## Files Changed

- 50 files: page HTML (home, about, services, connect, resources hub, dashboard, pasteflow, framework hub + 6 detail + 6 brief stubs), `styles/home.css`, `styles/about.css`, `styles/services.css`, `styles/resources.css`, `styles/framework.css`, README, and the QA contract tests + refreshed visual baselines.

## QA Summary

Executed and passing in this session:

- `npm run test:node` (full node suite)
- `npm run test:jest`
- `npm run test:python`
- `npm run test:visual:update` then `RUN_VISUAL_TESTS=1` regression (8/8 pass against refreshed baselines)
- `npm run test:docs-gate`
- Husky pre-push full-regression gate passed (`qa:ci-parity` green) on push of `30b8e7c` and again on `a8eaafc`.

## Manual QA Notes

- Local CI-parity green. Live preview re-fetched: home/services/connect/framework-detail titles updated, Email Roman absent on connect, brief stubs `noindex`, PasteFlow single Add-to-Chrome, framework summary "Eight slides".
- Mobile audit (Playwright @390px) across all nine main pages: no horizontal overflow; About chapter anchors land below the fixed header; about timeline collapses; services CTA hierarchy correct; connect form is first action; pasteflow lede full width. Two defects found and fixed in `a8eaafc` (home logo balance, framework nav pill overlap).
- Desktop audit (Playwright @1440px) across all nine main pages complete: clean; only the logo-row balance needed a fix (`43ad325`).
- No production release commands were run.

## Open Items / Follow-ups

1. Roman to review the live staging preview across all pages (desktop + mobile); allow for GitHub Pages CDN propagation after the latest push (`98c6190`) and hard-refresh if a stale build is cached.
2. After approval, promote the exact tested staging HEAD to `prod` (fast-forward only); never promote a different SHA.
3. Do not promote to prod until explicitly approved.

## Release Watcher Hygiene

Keep release watcher hygiene in place for this repo.
- Use `npm run release:watchers:status` and `npm run release:watchers:cleanup`
- Do not use ad-hoc shell polling loops for CI or preview monitoring.
