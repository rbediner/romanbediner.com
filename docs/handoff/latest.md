# Cross-Machine Handoff (Latest)

- Handoff Sequence: 142
- Updated At (UTC): 2026-03-30T17:01:48Z
- Source Branch: staging
- Source Commit: 9a85e3a5bdc34cd4794f418d57aa257eac015a6e

## Current State
- This session optimized the homepage portrait payload before the next staging preview review.
- Intended promotion flow remains: `staging` preview first, then `prod` only after visual sign-off.
- Preview URL to verify after staging deploy:
  - `https://rbediner.github.io/romanbediner-preview/`

## What Changed In This Session
1. Replaced the homepage hero portrait asset:
   - removed legacy `assets/images/website-photo.png`
   - added optimized `assets/images/website-photo.jpg`
2. Updated homepage markup in `index.html`:
   - switched the portrait source to the new JPEG
   - kept explicit intrinsic dimensions (`1022 x 1360`)
   - added `decoding="async"` and `fetchpriority="high"` for above-the-fold loading stability
3. Added a dedicated regression guardrail:
   - `QA/tests/test-home-hero-image-optimization.js`
   - enforces JPEG usage, prevents the PNG from reappearing, and keeps the image performance attributes intact
4. Updated `README.md` Technical Specification:
   - documented the homepage hero media performance contract so future sessions know the portrait optimization is intentional

## Validation Performed
- Live production measurement before change:
  - homepage HTML payload about `11.9 KB`
  - typical homepage response about `80-116 ms`
  - major weight contributor identified as `assets/images/website-photo.png` at `2,090,301 bytes`
- Optimized asset result:
  - new `assets/images/website-photo.jpg` is `401,406 bytes`
  - payload reduction is about `80.8%` for the homepage portrait asset
- Local regression validation:
  - `node QA/tests/test-home-hero-layout.js` -> PASS
  - `node QA/tests/test-home-hero-image-optimization.js` -> PASS
  - `npm run test:node` -> PASS

## Operator Notes
- The expected user-visible result is the same portrait composition with a materially smaller transfer size.
- Because this is a lossy conversion, visual sign-off on staging is still required before promotion to `prod`.
- If the preview shows noticeable quality loss, revert by comparing against commit history before promotion.

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
- `session:start — read README + docs/handoff/latest, run session readiness, then run/verify staging deploy and give me the Staging Preview Ready URL.`
