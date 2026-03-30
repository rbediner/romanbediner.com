# Cross-Machine Handoff (Latest)

- Handoff Sequence: 143
- Updated At (UTC): 2026-03-30T17:27:00Z
- Source Branch: staging
- Source Commit: 2d754b90dd26b22b879c7a1cef3809dae8a5ee3f

## Current State
- This follow-up session is preparing a second-pass homepage portrait optimization for staging preview after a `prod` CI Lighthouse failure on the prior image-only optimization commit.
- Intended promotion flow remains: `staging` preview first, then `prod` only after visual sign-off.
- Preview URL to verify after staging deploy:
  - `https://rbediner.github.io/romanbediner-preview/`

## What Changed In This Session
1. Tightened the homepage hero portrait payload again:
   - replaced the first optimized JPEG with a smaller follow-up JPEG at `90,431 bytes`
   - source dimensions are now `541 x 720`
2. Updated homepage markup in `index.html`:
   - kept the same hero composition and image path
   - aligned explicit intrinsic dimensions to the actual optimized source (`541 x 720`)
   - retained `decoding="async"` and `fetchpriority="high"`
   - retained the homepage hero preload plus font preconnect hints used to preserve Lighthouse margin
3. Expanded the regression guardrail in `QA/tests/test-home-hero-image-optimization.js`:
   - enforces the JPEG path
   - blocks the legacy PNG from reappearing
   - enforces the `120 KB` byte ceiling
   - enforces the preload + preconnect hints
4. Updated `README.md` Technical Specification:
   - documented the refined hero media performance contract and the preload/preconnect requirements

## Validation Performed
- Live production measurement before this second pass:
  - homepage HTML payload about `11.9 KB`
  - prior optimized JPEG was `401,406 bytes`
  - `prod` CI for commit `2d754b90dd26b22b879c7a1cef3809dae8a5ee3f` failed on `lighthouse-validation`, so more headroom was required
- Second-pass optimized asset result:
  - current `assets/images/website-photo.jpg` is `90,431 bytes`
  - reduction from the original PNG (`2,090,301 bytes`) is about `95.7%`
  - reduction from the first JPEG pass (`401,406 bytes`) is about `77.5%`
- Local regression validation:
  - `node QA/tests/test-home-hero-image-optimization.js` -> PASS
  - local Lighthouse rerun -> PASS with performance median `92` and accessibility median `95`

## Operator Notes
- The expected user-visible result is the same portrait composition with a materially smaller transfer size.
- Because this is still a lossy JPEG optimization, visual sign-off on staging is required before promotion to `prod`.
- If the preview shows noticeable quality loss, compare against commit history before promotion.

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
