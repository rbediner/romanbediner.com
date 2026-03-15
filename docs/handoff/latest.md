# Cross-Machine Handoff (Latest)

- Handoff Sequence: 86
- Updated At (UTC): 2026-03-15T20:44:04Z
- Source Branch: staging
- Source Commit: e025995d4c4f504a734b8299c18c7f98dbc55b1a

## Current State
- Remote branches are intentionally divergent:
  - `origin/staging` -> `e025995d4c4f504a734b8299c18c7f98dbc55b1a`
  - `origin/prod` -> `26dff0971f79dab8cd691cf6c1fde5bec69f452e`
- Local branch: `staging`
- Local/remote staging alignment: clean (`staging` == `origin/staging`).
- Production remains unchanged in this session.

## What Changed
1. Framework anchor landing + smooth scrolling refinement:
   - added `html { scroll-behavior: smooth; }` in `styles/framework.css`
   - added `.framework-card { scroll-margin-top: 160px; }` so sticky framework diagram no longer obscures card headings on stage-pill anchor jumps
2. Existing framework interactions preserved:
   - sticky diagram
   - stage-pill anchor navigation
   - active-stage tracking

## Validation Performed
- `node QA/tests/test-insights-layout.js` (pass)
- `python3 -m unittest QA.tests.test_insights_layout -v` (pass)
- pre-push CI parity (`npm run qa:ci-parity`) (pass)

## Commits Pushed This Session
- `e025995` — Adjust framework anchor offset and smooth scrolling

## URLs
- Staging preview base:
  - `https://rbediner.github.io/romanbediner-preview/`
- Production:
  - `https://romanbediner.com/`

## Operator Notes
- User requested only anchor-offset and smooth-scroll correction; implemented as CSS-only change in framework stylesheet.
- Next operator step: user preview verification before any prod promotion.
