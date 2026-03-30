# Cross-Machine Handoff (Latest)

- Handoff Sequence: 144
- Updated At (UTC): 2026-03-30T22:20:00Z
- Source Branch: prod
- Source Commit: 35236e9140c8e35e87112fc8906232f296ad7e58

## Current State
- The refined homepage hero optimization has been released successfully.
- `staging` and `prod` are aligned on the same shipped commit:
  - `35236e9140c8e35e87112fc8906232f296ad7e58`
- The isolated staging preview remains available for future visual review at:
  - `https://rbediner.github.io/romanbediner-preview/`
- Production is live and serving the optimized homepage asset from:
  - `https://romanbediner.com/`

## What Changed In This Session
1. Promoted the approved staging optimization commit to `prod`:
   - commit `35236e9140c8e35e87112fc8906232f296ad7e58`
   - commit message: `Refine homepage hero payload for Lighthouse headroom`
2. Shipped the second-pass homepage hero optimization:
   - homepage portrait remains at `assets/images/website-photo.jpg`
   - image dimensions are `541 x 720`
   - asset transfer size is `90,431 bytes`
3. Preserved the supporting performance markup in `index.html`:
   - font preconnect hints remain enabled
   - hero image preload remains enabled
4. Cleaned local machine artifacts after release verification:
   - removed stray `.DS_Store` files from the repo working tree

## Validation Performed
- Local branch state after release:
  - `git status -sb` -> clean
  - local `HEAD`, `origin/staging`, and `origin/prod` all resolve to `35236e9140c8e35e87112fc8906232f296ad7e58`
- Live production HTML verification:
  - `https://romanbediner.com/` now references `assets/images/website-photo.jpg`
  - live markup confirms `width="541"` and `height="720"`
  - live markup confirms font preconnect + hero preload hints are present
- GitHub Actions verification:
  - `CI` run for the release commit completed successfully
  - `Deploy Pages` run for the release commit completed successfully
- Asset performance outcome:
  - original PNG: `2,090,301 bytes`
  - first JPEG pass: `401,406 bytes`
  - shipped second-pass JPEG: `90,431 bytes`
  - total reduction versus original PNG: about `95.7%`

## Operator Notes
- The shipped homepage should look visually unchanged in normal use while loading materially faster.
- The isolated preview repo remains part of the current deployment workflow and should not be removed casually; it is now an active dependency of staging preview publication.
- The preview repo must keep:
  - default branch: `staging-preview`
  - Pages source: `staging-preview` + `/ (root)`
- Main repo Actions settings must keep:
  - repository secret: `PREVIEW_REPO_TOKEN`
  - repository variable: `PREVIEW_REPO=rbediner/romanbediner-preview`
  - repository variable: `PREVIEW_REPO_BRANCH=staging-preview`
- PRD note:
  - the live PRD was not updated in this session because this was a performance-only media optimization and deployment completion pass, not a feature or behavior change

## Fresh Machine Prerequisites (Operator Quick List)
1. Install `git`
2. Install Node `20.x` and `npm`
3. Install `python3`
4. Run:
```bash
nvm use
npm ci
python3 -m playwright install chromium
npm run session:ready
```

## URLs
- Staging preview base:
  - `https://rbediner.github.io/romanbediner-preview/`
- Production:
  - `https://romanbediner.com/`

## Startup Reminder For Future Codex Sessions
Before making changes, read in order:
1. `/README.md`
2. `/docs/handoff/latest.md`
3. `/docs/architecture/repo-contract.json`

Operator shortcut prompt:
- `session:start — read README + docs/handoff/latest, run session readiness, then verify staging/prod branch alignment and give me the current staging preview URL if preview work is involved.`
