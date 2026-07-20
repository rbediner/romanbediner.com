# Cross-Machine Handoff (Latest)

## Latest: 2026-07-20: Resources hub hierarchy — production release

- Promoted `f7420f6c59fbb69f83818d8c70fec7186d532c9b` to production. CI run `29743204513` and GitHub Pages deployment `29743204509` both passed, followed by the release script's live smoke validation.
- The live `/resources/` hub now gives Agentic AI Employees the single flagship artifact card with its existing inline preview and download. Framework Summary, Dashboard, and PasteFlow use compact horizontal editorial rows on desktop and single-column phone stacks.
- Preview count, canonical PDF target, existing analytics attributes, visual hierarchy, and no-horizontal-overflow behavior are covered by Node and Playwright checks. The supporting-card height contract prevents a return to oversized vertical cards.
- Updated the canonical card-surface guide, README, shared `bediner-site` skill, and live SEO Authority PRD to make the hierarchy durable.

## Latest: 2026-07-20: Production audit remediation and local-font performance hardening — production release

- Promoted the audited staging build to production at `472c4764e58c9b6151b106908216d88f69ba0e7a`. The production CI run `29741556287` and matching GitHub Pages deployment `29741556339` both passed, including the existing Lighthouse gate. The gate was not weakened.
- Browser telemetry now has explicit CSP permission for the GA4 transport and Cloudflare Web Analytics beacon. The browser smoke contract treats CSP errors as release blockers rather than suppressing them.
- Replaced the third-party Google Fonts path with two self-hosted editorial font assets in `assets/fonts/`, declared in shared CSS. Canonical pages no longer load Google Fonts CSS, `@import`s, or font preconnects. The unused below-fold home contact image was removed so it cannot compete with the hero for early bandwidth.
- Added production-audit regression coverage for CSP telemetry, actual GA request behavior, local font delivery, the absence of Google Fonts dependencies, contrast tokens, and home-image loading behavior. Full local CI parity passed before promotion.
- Shared `bediner-site` guidance and the root README now make self-hosted fonts, unchanged Lighthouse thresholds, clean browser consoles, and local rendering-path discipline durable release rules.
- Remaining production configuration is outside this repository: Cloudflare still needs an authenticated owner to disable its managed AI-crawler block and set HSTS, `X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy`, and clickjacking protection at the edge. The repo `robots.txt` itself permits crawling.

## Latest: 2026-07-19: Agentic architecture artifact integrity and card consistency — production candidate

- Moved the Resources hub's architecture preview back inside the Agentic AI Employees card. It is closed by default, appears before the canonical download, uses the card's existing analytics context, and no detached preview section remains.
- Re-rendered all ten preview images directly from `assets/downloads/agentic-operations-architecture-roman-bediner.pdf` and added `assets/resources/agentic-operations-architecture/preview-manifest.json`. The manifest locks the canonical PDF hash and every preview-image hash, so download and preview cannot silently drift apart.
- Standardized resource language on `architecture`: the hub uses `Reference architecture`, `Preview the architecture`, `Download the architecture`, and `Explore the Architecture`. The direct artifact heading now uses the shared Cormorant serif scale rather than its smaller local override.
- Removed the recently added Framework stage icon tiles. Labeled stage pills are the approved hierarchy; the six retired production icon copies were deleted while source-library assets remain intact.
- Aligned About and Services responsibility rows with pipe separators, and aligned Connect's Bediner Advisory treatment with About: black `Bediner`, blue `Advisory`, neutral `LLC`.
- Repository `robots.txt` permits crawling. Live AI-crawler blocks are injected by Cloudflare Managed Content, not the repository. Disable that Cloudflare policy before describing AI-search discovery as enabled.
- Updated README, the card-surface design system, shared `bediner-site` skill, and the live `romanbediner.com PRD`. Local QA passed: `npm run test:node`, `npm run test:playwright` (18/18), diff hygiene, and Drive-drift check.
- Product commit on `staging`: `2281dc7`.

## Latest: 2026-07-19: Services integration-model completion — staging

- Added the missing `Best suited for` close to Fractional Integration Leadership so all five Services models end with the same scannable fit signal.
- The new line targets organizations with cross-functional complexity, fragmented systems or vendors, unclear ownership, or an integration decision that needs operating leadership before further technology investment.
- The Services regression test now requires exactly five best-fit statements. Focused validation, `npm run test:node`, and `npm run test:playwright` (17/17) pass. Product commit: `7a289e2` on `staging`.

## Latest: 2026-07-19: Services current-work hierarchy alignment — staging

- Matched the Services hero's current-responsibilities treatment to the approved About pattern: one label followed by three separately scannable role/company lines, rather than a dense single all-caps paragraph.
- Preserved the existing public copy, blue role emphasis, dark company names, and Bediner Advisory statement. Added the same compact 640px mobile rhythm used on About.
- Added `QA/tests/test-services-responsibility-layout.js`; focused validation, `npm run test:node`, and `npm run test:playwright` (17/17) pass. Product commit: `24ecb54` on `staging`.

## Latest: 2026-07-19: Architecture artifact documentation and reusable-skill alignment — staging docs only

- Codified the approved downloadable-artifact pattern in the repository README, canonical card-surface guide, and shared `bediner-site` skill. A substantial architecture, reference implementation, or case-study follow-along must use a truthful content-led name rather than defaulting to `brief`.
- The documented resource pattern is one unified artifact surface: `Preview` precedes `Download`; the preview remains closed until requested, expands inside the same surface, and renders pages from the exact canonical PDF. Use `Page` for a document and `Slide` only for a presentation deck.
- The contract preserves the existing resource slug, file path, analytics event names/parameters, `data-track-pdf-download`, and `data-file-path` attributes. Required QA is now explicit: at 1440px and 390px, open the preview, advance one page, verify the page label/count and canonical download target, and confirm no horizontal overflow.
- The card-system guidance also confirms that decorative numeric markers are not a default. Icons remain selective: they must be distinct, approved, and meaningful rather than repeated filler.
- No public page behavior or production artifact changed in this documentation session. The already-live Agentic Operations Architecture release remains product SHA `fa8856895c267883241f5329170914fee4fb6b0b`. Documentation source commit on `staging`: `ddaa6aa`.

## Latest: 2026-07-19: Agentic Operations Architecture artifact replacement — production release

- Replaced the downloadable and previewed artifact on `/resources/agentic-ai-employees/` with the supplied ten-page `Agentic Operations Architecture` PDF. The downloadable canonical file is `assets/downloads/agentic-operations-architecture-roman-bediner.pdf`; preview images live under `assets/resources/agentic-operations-architecture/slides/`.
- Retired the inaccurate "brief" language. The resource card now reads `AGENTIC OPERATIONS ARCHITECTURE`, `Take the architecture with you.`, and uses `Preview the architecture` then `Download the architecture` as the two actions.
- Preserved the existing GA download contract and canonical `data-file-path`; the new artifact continues to emit the established resource PDF-download event with its resource context.
- Fixed a real runtime-cache issue by versioning the shared carousel script. Both the direct resource page and Resources hub now show `Page 1 of 10` rather than stale `Slide` copy when fresh artifact markup is deployed.
- Validation passed locally: full CI-parity and Playwright. Staging CI run `29707394188` passed after the permitted single Lighthouse retry; staging deploy `29707541618` passed. Production CI run `29707728558` passed for `fa8856895c267883241f5329170914fee4fb6b0b`; Deploy Pages run `29707728560` is the matching production deployment.
- Direct live production validation at 390 x 844 confirmed the collapsed preview opens, advances from `Page 1 of 10` to `Page 2 of 10`, uses `translateX(-100%)`, and has no horizontal overflow. Desktop and staging checks also found no horizontal overflow.
- Product release SHA: `fa8856895c267883241f5329170914fee4fb6b0b`.

## Latest: 2026-07-19: Visual system and About refinement — production release complete

- Promoted the approved staging state to production at `26955fa5534e474fdff0e925b738cd7ed2a94be0`.
- Production CI and GitHub Pages both passed after the Lighthouse runner’s third clean measurement met the existing quality threshold; the threshold was not changed.
- `npm run release:verify-prod` passed live smoke checks across 16 routes. Direct production visual review of `/about/` passed at 1440px and 390px: three responsibility units, a 32px desktop / 34px mobile Bediner Advisory pause, and no horizontal overflow.

## Latest: 2026-07-19: Homepage headline QA alignment — ready for production

- Aligned the duplicate Python, Playwright, Node browser, and release-smoke guards with the approved homepage layout: the long desktop value proposition wraps naturally inside its reading measure, preventing the earlier 42px viewport overflow.
- The guards now permit the intentional two-line Cormorant heading while rejecting a third line. The Node guard also measures against the current `.master-head` boundary rather than the retired executive callout. Desktop alignment, mobile overflow, and spacing assertions remain intact.
- Focused Playwright (2/2), Node browser alignment, release browser smoke, Python spacing checks (5/5), `git diff --check`, and the Google Drive drift check passed. Product commits `575cba9` and `6146748` follow the visually approved staging state.

## Latest: 2026-07-19: About current-work hierarchy — staging only

- Reframed the About hero’s current-responsibilities copy as a distinct label followed by three role/company reading units. This now has the same intentional rhythm at desktop and phone widths instead of wrapping as a dense all-caps sentence.
- Added a clear 32px desktop / 34px phone pause before the Bediner Advisory relationship statement. The change remains editorial—no additional card or divider was introduced.
- Added a focused About regression test asserting all three responsibility units. Node contracts, focused Playwright, and Python About tests passed.
- Product commit `a3211357729ea31fca0d049df801ced5393357dc`; Deploy Staging run `29705398877` passed. Hosted screenshots at 1440px and 390px confirm three units, no horizontal overflow, and the intended separation.
- Updated the live `romanbediner.com PRD`. This remains staging-only; production and the reusable page-building skill remain untouched pending Roman’s explicit approval.

## Latest: 2026-07-19: Compact Dashboard resource surfaces — staging only

- Kept the approved PasteFlow capability-card treatment unchanged: compact two-column desktop cards, purpose-specific dark-outline icons in quiet blue tiles, blue labels/rules, serif titles, and copy-led height.
- Reduced the Dashboard quadrant and Core Dashboard View cards to the same content-sized density. Core-view icon tiles retain a 20px inset so the smaller treatment does not cling to the rail.
- Replaced the bare Dashboard question rows with six restrained prompt surfaces: enough containment to scan, without restoring decorative numbers or turning the section into a wall of oversized cards.
- Corrected two stale Python QA contracts that were still requiring the decorative About and Services number markers. They now enforce the approved no-number rule instead.
- Product commit `bf4be77ac38a16ebdca919d3cc1b3080110a11fe`; Deploy Staging run `29704689867` passed. A hosted audit rendered all 16 canonical routes at 1440px and 390px (32 renders): no horizontal overflow or filtered resource-icon failures. Direct screenshot review covered Dashboard and PasteFlow at both sizes.
- Updated the live `romanbediner.com PRD`. This remains staging-only: production and the reusable page-building skill are untouched pending Roman’s explicit approval.

## Latest: 2026-07-19: Remove decorative card numbering + About identity refinement — staging only

- Removed decorative numeric markers from every card family: Services entries, About chapters, Framework stage cards, Dashboard questions/quadrants/views, PasteFlow capabilities, and Agentic explanatory cards. Purpose-specific icons, labels, semantic colors, and titles now carry hierarchy. Ordered process/diagram steps remain only where sequence has actual instructional meaning.
- Reworked the About hero’s phone treatment after visual review: the current-responsibility metadata now has a calmer scale, line height, and separation from the relationship line. `Bediner Advisory` now follows the approved wordmark logic—ink-black `Bediner`, blue `Advisory`, restrained `LLC`.
- Updated the card-surface source of truth and regression contracts: no source card-number classes/counters may return, while resource card anatomy continues to verify no pseudo number content at desktop or mobile widths.
- Full Node contract validation and focused Playwright (3/3) passed. Hosted staging deployment `29704203735` passed for product SHA `f6003e43c6d3a71bdf62401775c724c65914418f`; a fresh 16-route desktop/mobile audit (32 renders) found no horizontal overflow or filtered-icon regressions. Hosted visual inspection covered About, Dashboard, PasteFlow, Framework, and Agentic.
- Updated the live `romanbediner.com PRD`. This remains staging-only. Do not promote to `prod` or change the reusable page-building skill until Roman explicitly approves the direction.

## Latest: 2026-07-19: Services mobile density correction — staging only

- Corrected the rejected oversized Services phone composition. Each service now uses a compact icon-and-label row followed by a full-width 29px title, instead of forcing a large title into the narrow space beside an oversized icon. The service number, icon tile, kicker, rule, and opening thesis remain legible without dominating the screen.
- Removed a real grid-spacing defect: desktop top and bottom paragraph margins were accumulating on mobile. Consecutive mobile paragraphs now use one controlled 16px gap, substantially shortening every offering without changing copy.
- Extended the Playwright guard to prevent a return of either issue: the thesis must use normal readable scale with stronger weight, and service body paragraph gaps must remain at or below 18px on a 390px viewport.
- Visually inspected the corrected first offering at 320px, 390px, 768px, and 1440px before release. Hosted staging deployment `29703629350` passed for product SHA `920c9ec347d22ad12e47ba8e4a17dee9117ed829`; the full hosted 32-render route audit again found no horizontal overflow or filtered-icon regressions.
- Updated the live `romanbediner.com PRD`. This remains staging-only. Do not promote to `prod` or update the reusable page-building skill until Roman explicitly approves the final direction.

## Latest: 2026-07-19: Services reading hierarchy refinement — staging only

- Refined the long-form Services offerings without adding more card chrome: each offering now opens with a slightly stronger thesis and closes, where applicable, with a quiet blue `Best suited for` reading landmark. This gives the page a more deliberate editorial scan path while preserving the approved copy and distinct service icons.
- A new Playwright assertion protects that hierarchy at phone width: the thesis remains larger than ordinary service prose and the fit signal retains its slim blue rule. The existing mobile rule remains intact—long-form Services sections use divider-led editorial rhythm rather than oversized boxed cards.
- Local focused Playwright (2/2), the full Node contract suite, `git diff --check`, and Google Drive drift cleanup passed. Hosted staging deployment `29703316019` passed for product SHA `c0fdfff2ddaf01b99af0b17cdf94c84908e10a65`.
- Completed a fresh hosted audit across all 16 canonical routes at desktop and phone widths (32 renders). There was no horizontal overflow and no filtered-icon regression. Direct visual inspection confirmed the new Services composition, Dashboard, and PasteFlow at phone size and Services on desktop.
- Updated the live `romanbediner.com PRD`. This remains staging-only; do not promote to `prod` or update the reusable page-building skill until Roman explicitly approves the final direction.

## Latest: 2026-07-19: Mobile editorial-rhythm refinement — staging only

- A further visual EBI pass kept the compact reference-card anatomy on Dashboard and PasteFlow, but corrected the mobile behavior for truly long-form content. About professional chapters and Services offerings now shed their oversized outer card chrome below 640px and read as numbered editorial sequences with thin separators, comfortable 16px prose, and intact hierarchy.
- Services preserves its five existing unique approved service icons; About preserves its role/company sequence and Operating Philosophy callout. Desktop retains the composed editorial-panel treatment. This avoids making every page use the same generic card pattern.
- Added a focused Playwright contract for this distinction: mobile About and Services chapters must use divider-led editorial rhythm, no box shadow, readable 16px-or-larger prose, and all canonical routes must remain viewport-safe at 1440px and 390px.
- Local focused Playwright (3/3) and full Node contract validation passed. Hosted staging deployment `29702931748` passed for product SHA `f7a196b` and the 32-render hosted audit found no overflow or filtered resource icons.
- Updated the live `romanbediner.com PRD`. This is staging-only; do not promote to `prod` until Roman explicitly approves the direction. Do not update the reusable page-building skill until that approval.

## Latest: 2026-07-19: Site-wide visual QA correction — staging only

- Completed a hosted visual audit of every canonical public route at both 1440px and 390px: Home, About, Resources, all four resource detail pages, Services, Connect, the Framework hub, and all six framework briefs. All 32 rendered route/viewport combinations passed with no page-level horizontal overflow.
- Corrected the Dashboard/PasteFlow resource regression reported in review: resource symbols now use the site’s established dark-outline linework with no CSS filter; Dashboard Core View icon tiles retain a 24px phone inset; the Dashboard closing invitation is two readable paragraphs at a restrained 16px phone scale. The browser QA contract now asserts all of those conditions as well as icon uniqueness and compact card heights.
- The whole-site audit also found and fixed a real homepage defect: the desktop hero was forced onto one line and could exceed the viewport by 42px. Its approved headline now wraps naturally inside the reading container.
- Added a canonical route viewport guard in `QA/tests/playwright/agentic-mobile-layout.spec.js`: every public route is tested at 1440px and 390px for no horizontal overflow. The focused Playwright suite and complete Node contract suite pass.
- The review preserves the site’s deliberately different systems: Dashboard/PasteFlow use the compact reference-card anatomy; Services and About remain long-form editorial chapters; Framework retains semantic stages; Agentic retains its architecture diagrams; Resources remains an artifact hub; Connect remains a form surface. Do not flatten these into one generic card pattern.
- Hosted staging deployment `29702737776` passed for product SHA `755467b08926bfc7ae7d2e8513aa96f170c50470`. The live PRD records the new visual QA rule. This remains staging-only; do not promote to `prod` without Roman’s explicit approval.
- Review staging at:
  - `https://rbediner.github.io/romanbediner-preview/?cb=755467b`
  - `https://rbediner.github.io/romanbediner-preview/resources/ai-enabled-operations-dashboard/?cb=755467b#in-this-dashboard`
  - `https://rbediner.github.io/romanbediner-preview/resources/pasteflow/?cb=755467b#pasteflow-capabilities`

## Latest: 2026-07-19: Reference-card composition correction — staging only

- Corrected the rejected fixed-height gallery treatment on `/resources/ai-enabled-operations-dashboard/` and `/resources/pasteflow/`. The Dashboard operating areas and PasteFlow capabilities now follow the supplied reference composition: purpose-specific icon tile, numbered chip and eyebrow on one header line, serif title, short blue rule, and body copy in normal flow.
- Dashboard prompts are intentionally a compact numbered scan list rather than oversized cards. Core Dashboard Views remain compact informational cards. The card family uses the existing Roman-blue edge wash only; no teal/green, duplicate icon, filler icon, hover affordance, or production promotion was introduced.
- Added a browser QA density guard so desktop resource cards cannot regress into the rejected 330px empty panels. The targeted Playwright test and the full Node contract suite pass.
- Hosted staging deployment `29701977367` passed for product commit `e0a3c324d88dd95ab43d934ed29fd4980185258f`. Hosted visual verification confirmed the `resources.css?v=20260719r13` asset at 1440px and 390px: no horizontal overflow; Dashboard cards are 287px desktop / 229px phone; PasteFlow cards are 253–277px desktop / 229px phone.
- Updated the live `romanbediner.com PRD` with the reference-card correction and staging-only boundary. Do not update the reusable page-building skill until Roman explicitly approves this direction.
- Review only these staging routes before any production decision:
  - `https://rbediner.github.io/romanbediner-preview/resources/ai-enabled-operations-dashboard/?cb=e0a3c32#in-this-dashboard`
  - `https://rbediner.github.io/romanbediner-preview/resources/pasteflow/?cb=e0a3c32#pasteflow-capabilities`

## Latest: 2026-07-19: Canonical contained-surface system — staging only

- Added `docs/design-system/card-surfaces/README.md` as the canonical source for the five surface types, approved visual references, shared tokens, modifier model, accessibility rules, route inventory, exceptions, and icon discipline. The two user-approved PNG references now live beside that guide with durable filenames.
- Applied the system across the priority page families without changing public copy, routes, analytics, architecture semantics, or approved icon assets: About editorial chapters, Framework stage cards, Resources hub, Dashboard scan units, Agentic artifact/audience surfaces, PasteFlow capability and callout units, Insights, and Connect.
- Static surfaces now use quiet containment with no false click affordance. Framework stages retain their existing semantic colors and distinct icons; no new or repeated icons were introduced. The Connect form no longer lifts on hover.
- Added `QA/tests/test-card-surface-system.js` and updated the framework layout contracts so shared surface modifiers remain compatible with the six-stage architecture. Focused contracts, shared-ui gate, link validation, and the 12-test Playwright suite passed locally. The live PRD and shared `bediner-site` skill now record the system and verification rule.
- Real-browser staging inspection was completed on the Dashboard resource at desktop width after the Mac was unlocked. The opening hierarchy, callout, audience surface, and embedded dashboard frame rendered cleanly with no overlap. Validate the full staging page matrix below before requesting any production promotion.
- Product commits: `f25d389`, `cc65562`, and `0b3b2ff` on `staging`. The final replacement CI/deploy is queued at handoff time. An earlier CI caught and corrected an exact-class test regression; its independent Lighthouse job also measured a transient 84 performance median against an 85 threshold.
- This work is staging-only. Do not promote to `prod` until the final staging CI/deploy is green and the named pages receive manual approval.

## Latest: 2026-07-19: About Operating Philosophy rail alignment

- Widened the About Operating Philosophy desktop paragraph measure from 780px to 1010px so its readable right edge aligns with the outer body rail used by the professional-background chapter narratives.
- Preserved the existing mobile `max-width: 100%` fallback. Browser geometry checks at 1440px, 1024px, 768px, 430px, 390px, and 320px showed no horizontal overflow.
- Local About and Operating Philosophy contracts passed. Hosted staging verification passed at 1440px and 390px with the expected paragraph/card alignment and no overflow.
- The live SEO Authority PRD records this UX rule and the staging-to-production acceptance boundary.
- Product commit: `f8d9250` (`Align About philosophy reading rail`), staging CI and Deploy Staging passed for the exact SHA.
- About page production promotion completed for this exact tested SHA: production CI, Deploy Pages, post-deploy smoke, and `release:verify-prod` all passed.
- Production is live at `https://romanbediner.com/about/` on `f8d9250`.
- Documentation is aligned: `README.md` records the 1010px desktop rail and corrected editorial-panel model, and the shared `bediner-site` skill records the About rail/mobile rule and exact-SHA production verification requirement.

## Latest: 2026-07-19: Chief Fractional Integration Officer title alignment

- Updated the public current-role title from `Fractional Integration Officer` to `Chief Fractional Integration Officer` across homepage, About, Services, and Connect visible copy, metadata, and structured data.
- Updated the matching role assertions in the focused LLC, Open Graph, and Connect QA contracts. The generic `Fractional Integration Leadership` service/category language remains unchanged.
- This is a surgical copy and metadata change; no route, analytics, or layout behavior changed.

## Latest: 2026-07-19: About professional-background EBI pass — staging only

- Applied the requested EBI/fresh-eyes pass to `/about/` only. The five professional-background chapters now render as restrained editorial panels with explicit `01`–`05` markers, attached role/company labels, a readable narrative measure, subtle shared-token borders, and a visual current-to-history sequence.
- Removed the obsolete vertical timeline rail, decorative timeline orbs, and the runtime code that positioned them. The approved chapter copy, stable anchor IDs, floating `On this page` source, Operating Philosophy copy/treatment, page metadata/schema/analytics, and Services transition remain intact.
- Kept the narrative as prose; no bullets, fake links, footer CTA, invented facts, hover-only information, fixed heights, or long-heading nowrap rules were introduced. Added reduced-motion behavior and narrow-phone padding safeguards.
- Added focused static assertions for panel structure, chapter markers, copy form, obsolete-orb removal, token usage, wrapping, reduced motion, and Operating Philosophy preservation in `QA/tests/test-about-redesign.js` and `QA/tests/test_about_redesign.py`.
- Visual QA rendered and inspected the full page at 1440x1200, 1280x900, 1024x900, 768x1024, 430x932, 390x844, and 320x800. No horizontal overflow was found. Page heights changed from 4534→4242, 4534→4242, 4871→4439, 4545→4399, 6681→6794, 7237→7467, and 8718→8684 respectively; the mobile increase at 430/390 reflects the added contained panel boundaries while the narrowest 320px version remains slightly shorter.
- Local validation passed: focused About Python tests (6/6), `npm run test:node`, `npm run test:playwright` (12/12), `npm run qa:prepush-gate`, and `npm run qa:ci-parity` (20 Jest suites/73 tests, 46 Python tests, 12 Playwright tests). Baseline image comparisons remain unavailable because Pillow is not installed in this repo environment.
- Updated the live `SEO Authority PRD` with the About EBI decision and staging-only acceptance boundary.
- Product commit: `5f83d39` on `staging`. This is intentionally not promoted to `prod`; staging preview deployment and browser review are the next steps.

## Latest: 2026-07-19: Staging Agentic Operations Architecture artifact integration

- Created the downloadable artifact for `The Agentic Operations Architecture` at `assets/downloads/agentic-operations-architecture-roman-bediner.pdf`.
- Added the commented vector-first generator at `scripts/asset-generation/agentic-operations-architecture/generate_agentic_operations_architecture.py`, the artifact contract test, and the staging integration contract test.
- The PDF is eight pages at 720 x 405 points, with selectable text, embedded metadata, deep navy/white/blue companion styling, and no invented client outcomes or performance claims.
- Revised the artifact into a case-study/architecture follow-along: the actual end-to-end system architecture now leads, the org chart is a dedicated page, autonomy boundaries and brain/body context follow, and the final pages trace one change from queue to verified production.
- Rebuilt the fixed-height compositions with bounded copy after visual QA found text escaping cards in the first draft. The revised eight-page render was inspected at full-page and detail scale.
- Applied the presentation-design skill's narrative and layout guidance in a further design pass: rebalanced the title slide, repaired the process callout padding, simplified the architecture schematic, and rebuilt the closing page as an aligned two-column composition. All eight pages were re-rendered and inspected individually at full size.
- Visual QA rendered all eight pages with Poppler. The artifact contract passed. `git diff --check` is currently blocked by a pre-existing Google Drive Git index/object error (`missing blob cf11ec949caeb38e25fc95e8e86f9c5668773613`), unrelated to the artifact source.
- Staged the artifact preview carousel on `/resources/` and a direct download CTA on `/resources/agentic-ai-employees/`; both use the unique `agentic-operations-architecture` resource context and canonical PDF path.
- Added the agreed collapsed `Slide Preview` disclosure to `/resources/agentic-ai-employees/`, reusing the same eight-slide carousel and fullscreen preview interaction as the Resources hub.
- Lazy-loaded slides 2–8 inside the collapsed preview so the closed-by-default component does not pull every slide into the initial page load; the first slide remains immediate and later slides load as needed.
- Unified the Portable Architecture Brief card and preview disclosure: the closed card now presents `Preview the brief` first and `Download the brief` second, while the opened carousel expands inside the same card and remains responsive on phone widths.
- Updated the shared `bediner-site` skill with the reusable unified artifact-card pattern: preview first, download second, closed by default, full-width expansion inside the same card, and explicit phone-width overflow checks while preserving the existing analytics contract.
- Rewrote the Agentic AI Employees `Who This Is For` card as four practical bullets for founders, CEOs, business owners, operators, AI builders, and implementation partners. The copy emphasizes moving beyond experiments, improving real company work, building useful and bounded agents, and reusing proven workflows.
- Loaded the existing resource analytics runtime on the Agentic AI Employees page. Download links use `resource_pdf_download` with `resource_slug`, `resource_title`, `resource_type`, `resource_location`, and `file_path` context; preview expansion remains covered by the shared carousel runtime.
- Targeted contracts and the full `npm run test:node` suite pass. Browser inspection of both staging pages shows no horizontal overflow at the available viewport, eight preview slides, and one tracked download CTA per surface.
- Fixed a real phone-width regression exposed by Playwright: wide internal SVG diagrams remain scrollable within their frames while page-level overflow is clipped. The full 11-test Playwright suite now passes.
- Updated the live `romanbediner.com PRD` with the artifact, preview, resource slug, analytics event contract, and staging acceptance rule. Live GA4 confirmation should happen after the staging preview is deployed and is the final analytics verification step before production promotion.
- Updated the live PRD with the audience-copy decision. Staging CI passed after one transient Lighthouse performance retry; staging deployment and live preview validation passed for product commit `2e3a732b34a0f358900597cc95b60112038d5a85`. The exact commit was promoted to production; production CI passed in run `29694816334`, Deploy Pages and post-deploy validation passed in run `29694816316`, and `npm run release:verify-prod` passed live smoke checks across 16 routes.

## Latest: 2026-07-19: Agentic resource mobile and evidence-boundary correction

- Removed the page-only multicolor underline and matched the shared solid blue resource accent used across the site.
- Folded the duplicate introductory paragraph into the blue hero callout so the page reaches the architecture sooner and no longer repeats its thesis.
- Changed the resource-hub pill to `AGENTIC AI EMPLOYEES`, with `REFERENCE ARCHITECTURE + BUILD REPORT` retained as supporting classification text.
- Fixed the mobile org chart's intrinsic-width overflow, including the independent Staff Engineer gate, and added word wrapping safeguards for long role labels.
- Kept the floating `On this page` control hidden over the opening content. It appears only after the inline orientation rail has passed, and is right-aligned on mobile.
- Added `QA/tests/playwright/agentic-mobile-layout.spec.js`, covering 390px overflow, card containment, and orientation-control timing. Local full QA passed: 44 Python tests, 20 Jest suites / 73 tests, 11 Playwright tests, Node contracts, focused Agentic contracts, link validation, and live visual review at desktop and mobile widths.
- Staging CI passed in run `29688336386`; staging deployment passed in run `29688439117`. Production CI passed in run `29688479677`; Deploy Pages and live smoke passed in run `29688479647`.
- Production is live at `https://romanbediner.com/resources/agentic-ai-employees/` on product SHA `8c342fda2aa92c9795143277f7ddec2e7fa1640d`.

## Latest — 2026-07-19: Editorial surface elevation, staging only

- Applied the approved reference direction as an adaptation, not a copy: Roman-blue soft edge washes, serif hierarchy, compact markers, restrained borders, and generous whitespace. Teal/green, loud gradients, heavy shadows, new decorative icons, repeated icons, carousel behavior, and dense SaaS-card walls remain out of scope.
- Services now uses five static editorial panels. Each keeps its distinct approved service icon in a compact blue-tinted tile, has a compact numeric marker, and retains the default cursor and no-lift behavior. The AI-Enabled Operating Systems and Applying the Work sections are quiet synthesis surfaces.
- About’s five professional-background panels remain editorial; Operating Philosophy now uses one wider blue-washed callout aligned with the chapter content rail. Framework’s Applying the Framework close uses the matching restrained callout treatment.
- The homepage was intentionally left open and editorial. The Agentic, Dashboard, and PasteFlow resource pages retain their existing distinct resource treatments and pass visual consistency review without copying the Services pattern.
- The shared `bediner-site` skill now includes the editorial-elevation rule: use a limited number of synthesis surfaces, preserve distinct existing icons, remain blue-only, and avoid over-carding the homepage.
- The live `SEO Authority PRD` includes the staging-only visual-direction refinement and its mobile/desktop acceptance criteria.

Validation:
- Local `npm run test:node` passed.
- Local `npm run test:playwright` passed 13/13, including the new 390px Services contract for five icon tiles, default cursors, and zero horizontal overflow.
- Hosted CI for `80a8003a15ccf46bfa67c4bc71261aaaabefa255` passed after a single rerun of the known Lighthouse median flake (first median 84 vs required 85; rerun passed). Hosted Python, browser, unit, link, workflow, and contract checks passed.
- Manual Deploy Staging run `29699816928` succeeded for the exact SHA. Live Chrome visual inspection completed on the staging preview for Home, Services (top and service-panel sections), About (top and Operating Philosophy), Framework close, Agentic AI Employees, AI-Enabled Operations Dashboard, and PasteFlow. No visual clipping, duplicate icons, false-click static panels, or teal/green drift was observed in the inspected desktop surface.
- Mobile acceptance is covered by the new 390px Playwright contract; a manual DevTools phone screenshot was not run in this session.
- Production remains untouched and requires explicit Roman approval.

## Latest: 2026-07-19: Editorial card-system reconstruction — staging only

- Rebuilt the documented card categories as real editorial layouts rather than a superficial border-and-shadow pass. Compact dashboard prompts now use numbered scan markers; Dashboard quadrants and core views, Resources cards, and PasteFlow capabilities now use a marker, serif title, blue rule, explanatory copy, and soft Roman-blue edge wash.
- Services and Framework preserve their distinct existing approved icon assets in compact blue-tinted tiles; no icon was added where there was no meaningful approved source set. About, Insights, and the Agentic resource preserve their established editorial hierarchy while receiving the shared contained-surface treatment. No teal/green palette, repeated icon, false click state, or consumer-app rounding was introduced.
- Product commits: `3a329ad` and `edcdaf6` on `staging`. Hosted CI passed after the known Lighthouse retry; manual Deploy Staging run `29700627150` passed for exact SHA `edcdaf6afb58564662e45bfb8ffd188a73c4f77b`.
- Local verification passed: preview smoke, `npm run test:jest` (20 suites / 73 tests), `npm run test:node`, and `npm run test:playwright` (14/14). The new 390px card-layout contract verifies editorial anatomy and zero page-level horizontal overflow for Dashboard and PasteFlow; Services verifies five unique icon tiles with no phone overflow.
- Chrome visual inspection at desktop width passed for Dashboard, PasteFlow, Services, Framework, About, Agentic AI Employees, and Resources. Inspect `https://rbediner.github.io/romanbediner-preview/?cb=edcdaf6` plus the specific routes below before any production decision. Production remains untouched.
- Updated the live SEO Authority PRD and shared `bediner-site` skill with the explicit card anatomy and icon discipline.

## Latest: 2026-07-19: Reference-card reconstruction with unique iconography — staging only

- Replaced the rejected generic contained-surface treatment on Dashboard, PasteFlow, and Services with the supplied reference-card anatomy: icon tile, numbered chip, uppercase category label, serif title, accent rule, and readable body copy. This is a composition change, not a border/shadow refresh.
- Added thirteen original, purpose-specific resource line icons under `assets/icons/resources/`: six PasteFlow capabilities, four Dashboard operating areas, and three Dashboard lenses. The five Services panels keep their existing unique approved service icons. Browser QA asserts four unique Dashboard operating-area sources and six unique PasteFlow capability sources; no repeated or filler icon is permitted.
- Revised mobile layout preserves the complete card composition at 390px without horizontal overflow. Local visual review captured PasteFlow, Dashboard, and Services at phone width; Chrome hosted staging review confirmed PasteFlow’s deployed desktop render. Local Jest (20/20), Node contracts, and Playwright (14/14) passed.
- Product commit: `bb126be607cee7bf19f1fd73a4806c96c7460383` on `staging`. Hosted CI run `29701492301` and manual Deploy Staging run `29701608416` passed for that exact SHA. Production is untouched pending Roman’s visual approval.
- Updated the live SEO Authority PRD and README. Do not update the reusable page-building skill until this staging direction is explicitly approved as the settled standard.

## Release Watcher Hygiene

Keep release watcher hygiene in place for this repo.
- Use `npm run release:watchers:status` and `npm run release:watchers:cleanup`
- Do not use ad-hoc shell polling loops for CI or preview monitoring.

- Handoff Sequence: 376
- Updated At (UTC): 2026-07-20T12:48:19Z
- Source Branch: staging
- Source Commit: f7420f6c59fbb69f83818d8c70fec7186d532c9b (pre-handoff baseline)
- Active Agent: Codex

## Latest: 2026-07-19: Agentic resource evidence positioning and production release

- Reclassified `/resources/agentic-ai-employees/` as `REFERENCE ARCHITECTURE + BUILD REPORT`, because it documents a first-party system without a named external customer outcome. The resource hub card now uses the same evidence boundary and links to `Explore the Build Report`.
- Preserved the complete public architecture narrative: five-agent organization, model router, code review, pull requests, merges, production shipping, reporting, Anthropic cost visibility, reliability, and self-engineering.
- Added the shared resource banner and `Who This Is For` pattern, all-caps heading treatment, desktop and mobile `On this page` navigation, and a mobile-safe centered orientation control.
- Scoped the mobile orientation rules to `styles/resources.css` so the homepage does not load page-specific navigation rules. Local Lighthouse measured 94 performance and 95 accessibility.
- Updated the reusable `bediner-site` skill and its shared Drive references with the evidence-classification rule, language rules, and mobile guidance.
- Staging CI passed in run `29687215949`; staging deployment passed in run `29687506913`.
- Production CI passed in run `29687545907`; Deploy Pages and live smoke passed in run `29687545924`. Production is live at `https://romanbediner.com`.
- Product release SHA: `c0e0a4dd2f4b54221a06233df8fd1415ecdfe35c`.
- Keep release watcher hygiene in place for this repo.

- Handoff Sequence: 337
- Updated At (UTC): 2026-07-19T12:50:06Z
- Source Branch: staging
- Source Commit: c0e0a4dd2f4b54221a06233df8fd1415ecdfe35c (pre-handoff baseline)
- Active Agent: Codex

## Latest — 2026-07-19: Agentic case study navigation and diagram consistency polish

- Fixed the mobile long-page failure identified in visual review: in-page targets now reserve space below the sticky header, so anchor jumps no longer hide headings or diagram context beneath the mobile header.
- Promoted the Agentic page's inline architecture rail into the shared persistent `On this page` control, with chapter links for Architecture, Proof, People, Router, Reliability, Engineering loop, and Production. This gives the long case study a navigable structure without deleting its depth.
- Added the shared whiteboard frame to the operating-loop diagram and aligned organization-branch accents with the page's semantic behavior/control/authority color language.
- Local mobile and desktop visual checks passed at 390px and 1440px: no horizontal overflow, org-chart content remains inside the phone frame, anchor target lands at 92px below the viewport top, persistent navigation loads, and browser console errors remain at zero.
- Focused Agentic contracts, `npm run test:node`, `npm run test:jest`, Python QA, Playwright runtime QA, and staging push completed. The optional full visual-baseline gate remains blocked by the pre-existing homepage baseline mismatch (`home--desktop-full.png`); the changed files do not load on the homepage.
- Product commit: `ea95d43` on `staging`; no production promotion attempted.
- Keep release watcher hygiene in place for this repo.

## Latest — 2026-07-19: All Agentic AI Employees diagrams made fullscreen-ready

- Completed the mobile diagram quality gate after finding that the first lightbox only covered three inline SVGs and that zoomed SVGs could shrink back to phone width.
- Upgraded the lightbox to cover all ten diagram surfaces: the four-layer architecture, three operating loops, brain/body split, org chart, model router, reliability loop, engineering loop, and three inline SVG diagrams.
- Added real zoom sizing for phone/tablet viewports, touch-scrollable oversized clones, fit/zoom controls, Escape close, and focus restoration to the originating control.
- Added `QA/tests/test-agentic-diagram-zoom.js` and wired it into the Node contract suite. Dynamic browser verification passed all ten diagrams at 390px, 768px, and 1440px with no horizontal page overflow.
- `npm run test:node`, 20 Jest suites / 73 tests, and local Lighthouse passed (94 performance / 95 accessibility).
- Product commit: `3b522ac` on `staging`; no production promotion attempted.
- Staging deployment is pending GitHub Actions completion. Review with `https://rbediner.github.io/romanbediner-preview/resources/agentic-ai-employees/?cb=3b522ac` after the exact-SHA deploy is green.
- Keep release watcher hygiene in place for this repo.

## Latest — 2026-07-19: Agentic AI Employees EBI structure and fresh-eyes pass

- Completed EBI Round 2 (Structure) and a fresh-eyes responsive pass after the ten-item EBI implementation.
- Added a compact “Explore the system” orientation rail linking architecture, proof, organization, router, reliability, engineering loop, and production.
- Reframed the setup section as “A minimal recipe for building one” so the public page explains the transferable architecture without becoming an installation manual.
- Tightened the closing invitation around the case-study insight and corrected the lifecycle copy to describe all seven visible run stages.
- Added a tablet breakpoint for 768–960px widths so loop and proof cards reflow without horizontal page overflow. Verified at 1440px, 1024px, 768px, and 390px.
- Updated the shared `bediner-site` skill in Drive with orientation-rail and tablet-responsive diagram guidance.
- Focused QA, `npm run test:node`, 20 Jest suites / 73 tests, and local Lighthouse passed; current page word count is 5,332 words.
- Product commit: `54b9383` on `staging`; no production promotion attempted.
- Staging deployment is pending GitHub Actions completion. Review with `https://rbediner.github.io/romanbediner-preview/resources/agentic-ai-employees/?cb=54b9383` after the exact-SHA deploy is green.
- Keep release watcher hygiene in place for this repo.

## Latest — 2026-07-19: Agentic AI Employees EBI case-study pass on staging

- Implemented all ten approved EBI improvements for `/resources/agentic-ai-employees/`.
- Reframed the page as an architecture-first case study with a four-layer stack, three closed loops, and a concise proof panel explaining what the inexpensive architecture makes possible.
- Applied the reusable whiteboard treatment across the architecture stack, org chart, router map, engineering loop, reliability loop, and inline SVG diagrams: paper grid, inset frame, blue/red/gold/green semantics, captions, and responsive layouts.
- Made the model router concrete with representative jobs for the mechanical, judgment, and independent merge-gate tiers.
- Added the reliability/reporting loop covering heartbeats, Anthropic cost snapshots, cache savings, deployment status, Director health synthesis, digest/alert, and recovery.
- Tightened repeated working-surface/Slack language, added stronger public-safe autonomy language, and expanded SEO/schema terms for autonomous AI software engineering, AI agents that merge pull requests, model routing, Anthropic cost reporting, and production deployment.
- Added/updated focused QA contracts. `npm run test:node` passed; Jest passed 20 suites / 73 tests; desktop/mobile rendered screenshots passed the no-overflow check at 1440px and 390px.
- Product commit: `b3e1057` on `staging`; no production promotion attempted.
- Reusable `bediner-site` skill created and uploaded to the shared Drive library: `https://drive.google.com/drive/folders/1l6O3RgCX5E3yTTfVLrSS23rka5_A8maJ`.
- Staging preview deployment is pending GitHub Actions completion. Review the route at `https://rbediner.github.io/romanbediner-preview/resources/agentic-ai-employees/?cb=b3e1057` after the exact-SHA deploy is green.
- Keep release watcher hygiene in place for this repo.

## Latest — 2026-07-18: Agentic AI Employees flagship resource rebuilt on staging

- Reframed `/resources/agentic-ai-employees/` as a flagship autonomous-organization page rather than a Slack-centered resource.
- Expanded the public roster to five employees: Project Manager, Chief of Staff, Director of Fleet Orchestration & Engineering, Continuous Improvement Engineer, and independent Staff Engineer.
- Added a premium dark org chart, explicit autonomy matrix, and a self-engineering flow from engineering queue to independently reviewed, verified production.
- Updated the brain/body narrative to distinguish editable cloud behavior from runtime engineering and deployment controls.
- Updated the architecture narrative, operating layer, setup/deploy language, title, meta descriptions, Open Graph/Twitter copy, TechArticle keywords, and `dateModified` for agentic AI employees, autonomous code review, multi-agent orchestration, and production deployment verification.
- Added `QA/tests/test-agentic-ai-employees.js` and wired it into the Node contract suite.
- Product commit: `b89cdbf` on `staging`; no production promotion attempted.
- Preview deployment is pending GitHub Actions completion. Review the staging preview at `https://rbediner.github.io/romanbediner-preview/resources/agentic-ai-employees/` once the deployment is green; use a cache-buster if the bare URL is stale.
- Keep release watcher hygiene in place for this repo.

## Latest — 2026-07-18: NC Courage operating-experience copy promoted to production

- Promoted the tested staging release `fd23b01e19accf403f97537a6ffada23a2546e69` to `prod` by fast-forward.
- Updated the homepage's longer operating-experience paragraph to explicitly name NC Courage's Fractional Integration Officer leadership alongside LaserLight Communications and Agentic Society.
- Added regression coverage in `QA/tests/test-llc-brand-architecture.js`, updated the root README, and recorded the public-safe copy decision in the live SEO Authority PRD.
- Local full gate, staging CI (`29663540327`), staging deployment (`29663772117`), production CI (`29663791858`), Docs Sync (`29663791835`), and Deploy Pages with live smoke (`29663791863`) passed. Lighthouse required retries because the runner initially produced an 84 performance median; the final run passed the existing 85 threshold.
- Production is live at `https://romanbediner.com`. The visible change is on the homepage's operating-experience narrative beneath the current-work callout and above the experience logo band.
- Keep release watcher hygiene in place for this repo.

## Latest — 2026-07-18: Bediner Advisory LLC brand architecture on staging

## Latest — 2026-07-18: Three-role SEO positioning promoted to production

- Promoted the tested staging release `0932314ec471701710fc39d099e5fce554efdc77` to `prod` by fast-forward.
- Updated homepage, About, Services, and Connect visible copy and metadata to consistently name Roman Bediner's current roles: Fractional COO for Agentic Society, Global Operations & Program Strategy Consultant for LaserLight Communications, and Fractional Integration Officer for NC Courage.
- Strengthened homepage Person structured data with `hasOccupation` entries for all three roles, expanded `knowsAbout` terms, added a scoped Bediner Advisory LLC Organization entity, and added About ProfilePage markup while keeping Roman as the primary public person.
- Refreshed title tags, descriptions, Open Graph/Twitter metadata, role vocabulary, sitemap `lastmod` values, README architecture notes, and the live SEO Authority PRD.
- Added regression coverage for the role architecture, organization/profile entities, route metadata, and exact Connect/About role copy.
- Local full regression passed: Node contract suite, 20 Jest suites / 73 tests, 44 Python tests, 10 Playwright tests, and all local release gates. Pillow-based visual comparisons remained skipped because Pillow is not installed.
- Staging CI passed in GitHub Actions run `29661938684`; staging deployment passed in run `29662050442` for the exact release SHA.
- Production CI passed in run `29662068040`; Deploy Pages, post-deploy live smoke, and release tagging passed in run `29662068046`. Explicit live verification passed 16 production route checks with homepage and sitemap HTTP 200.
- Production is live at `https://romanbediner.com`. Handoff remains a docs-only follow-up and must preserve release watcher hygiene.

- Implemented the targeted brand-architecture change on `staging` at product commit `0ebf120d8964d11289ed55ec1540420d48eb240a`.
- Kept Roman Bediner as the visible global brand, header wordmark, author, publisher, primary navigation identity, and site name.
- Added the approved `Advisory services delivered through Bediner Advisory LLC.` identity line to the footer of every full public page, including the six framework briefs and all public resource detail pages. Redirect-only `/insights/` remains unchanged.
- Added the approved founder/principal relationship statement to About, delivery-entity language to Services, and the approved Roman Bediner / Bediner Advisory LLC endorsement to Connect.
- Updated About, Services, and Connect metadata; added LLC Organization relationships to homepage, About, Services, and Connect structured data without replacing Roman as the primary person entity.
- Added `QA/tests/test-llc-brand-architecture.js` and wired it into the Node contract suite. README and the live SEO Authority PRD were updated to record the brand hierarchy and scope.
- Full CI-parity regression passed: Node contracts, 20 Jest suites / 73 tests, 44 Python tests, 10 Playwright tests, and all local release gates. Optional Pillow-based visual comparisons were skipped because Pillow is not installed.
- Staging preview deployment completed successfully in GitHub Actions run `29661082653`; live validation passed 16 routes with homepage and sitemap HTTP 200. Review at `https://rbediner.github.io/romanbediner-preview/`.
- GitHub Pages may serve cached HTML at the bare preview URL; use a cache-busted URL such as `https://rbediner.github.io/romanbediner-preview/?cb=20260718-2111` for the first review. The new LLC content was confirmed on `/`, `/about/`, `/services/`, and `/connect/` with that cache-buster.
- No `prod` promotion was attempted.

## Latest — 2026-07-17: Six-mark experience row promoted to production

- Promoted verified staging release `762fcf8735fbf618a896ff9a9e11dd2e5f18b35e` to `prod`.
- Production CI, Deploy Pages, and Docs Sync completed successfully.
- Deploy Pages live smoke validated the production deployment after propagation, including the six-mark homepage experience row and responsive behavior.
- README now documents the six-mark experience row, the historical user-supplied Omnigon mark, and the mobile row order.
- Google Drive drift check passed before promotion; no conflict-copies were found.

## Latest — 2026-07-16: Six-mark experience row with historical Omnigon mark

- Added the user-supplied historical Omnigon Communications LLC `OG` mark as the sixth homepage experience logo; provenance is explicitly recorded as user-provided in `assets/logos/logo-asset-manifest.json`.
- Kept the requested color treatments: navy Disney+, AWS with orange smile, Laser Light Communications, navy Agentic Society, full-color NC Courage crest, and the red Omnigon square.
- Rebalanced desktop sizing so AWS no longer dominates the six-mark row, while preserving a single equal-cell row with no clipping.
- Reworked mobile into two non-overlapping rows of three: Agentic Society, NC Courage, and Omnigon above; Disney+, AWS, and Laser Light below.
- Refreshed desktop/mobile visual baselines and passed the home guardrail plus full visual regression suite locally; all six logo assets returned HTTP 200 in the browser harness.
- Staging-only; no production promotion.

## Latest — 2026-07-16: Color logo treatments and visible hover states

- Replaced the Disney corporate wordmark in the homepage experience band with the official blue Disney+ app artwork from the App Store listing, matching the requested visual direction.
- Retained the AWS wordmark with its black-and-Amazon-Orange treatment; the larger Amazon Web Services cloud badge was reviewed and rejected for this row because it is a different, more dominant mark.
- Kept Agentic Society's supplied wordmark geometry and applied a restrained navy presentation tint; the source site's standalone SVG is black, so this treatment is documented as a presentation adaptation.
- Strengthened logo hover/focus feedback with a visible lift, scale, and blue halo while preserving non-clipping cells and mobile row spacing.
- Reduced AWS optical width on mobile and desktop after visual QA found it dominating the neighboring marks.
- Refreshed Home desktop/mobile visual baselines and reran the home guardrail, full visual suite, and diff checks successfully.
- Staging-only; no production promotion.

## Release Watcher Hygiene

Keep release watcher hygiene in place for this repo.
- Use `npm run release:watchers:status` and `npm run release:watchers:cleanup`
- Do not use ad-hoc shell polling loops for CI or preview monitoring.

## Latest — 2026-07-16: Homepage mobile current-work row tightening

Follow-up to the successful bottom-row spacing correction: the two current-work marks were still spread across the full three-column width and created too much empty space.

- Switched the mobile band to six internal tracks.
- Kept Disney, AWS, and Laser Light Communications in evenly spaced two-track columns on row two.
- Moved Agentic Society and NC Courage into the centered middle four tracks on row one, bringing the pair closer without changing their scale.
- Refreshed Home visual baselines and reran the home/services guardrails and full visual suite.
- Staging-only; no production promotion.

## Latest — 2026-07-16: Homepage mobile logo spacing refinement

Follow-up to the mobile hierarchy correction: the three operating-background marks were still too close together, especially AWS and Laser Light Communications.

- Changed the mobile logo band to three equal columns with a 24px gutter.
- Kept Agentic Society and NC Courage in the first row, with Disney, AWS, and Laser Light Communications evenly distributed across the second row.
- Reduced the mobile AWS image box to 128px and Laser Light to 90px so each mark stays inside its own visual column.
- Refreshed Home visual baselines and reran the home/services guardrails and full visual suite.
- Staging-only; no production promotion.

## Latest — 2026-07-16: Homepage logo optical rebalance and mobile hierarchy

Follow-up to the prior homepage logo correction: AWS was still optically too dominant on desktop/mobile, the NC Courage crest needed more presence, and the mobile three-across row was too cramped.

- Reduced AWS optical scale to 250px desktop / 150px mobile image-box width while retaining the official source PNG and non-clipping logo cells.
- Increased the NC Courage crest to 112px desktop / 88px mobile.
- Reworked mobile into two intentional rows: Agentic Society + NC Courage lead as the current-work row; Disney + AWS + Laser Light Communications follow as the operating-background row.
- Refreshed Home visual baselines and ran targeted home/services tests plus the full visual suite; mobile overflow remains false and the Services icon is unchanged.
- Staging-only; no production promotion.

## Latest — 2026-07-16: Current-to-history About sequence and distinct Services icons

The About and Services review identified three content and hierarchy issues: the About arc read in historical order instead of current-to-history order, the Services page reused an icon for two different models, and the current NC Courage responsibility was too easy to miss in the opening copy.

- Replaced the fallback AWS artwork with the official AWS brand-marketing asset and replaced the derived crest display with the first-party NC Courage crest artwork sourced from the club's Our Brand page.
- Kept the prior derived monochrome treatment recoverable in Git history; removed its now-unreferenced production-path file so repository hygiene stays clean.
- Added a current-responsibility line to the About and Services openings so the Fractional Integration Officer role is visible without changing the neutral voice.
- Reordered the visible About arc and floating chapter navigation from NC Courage backward through Laser Light Communications, Agentic Society, global delivery, and enterprise scale; section anchors remain stable.
- Added a purpose-built handoff-and-scale SVG icon for Fractional and Embedded Operating Leadership and added a regression test that rejects duplicate service icon paths.
- Cropped the transparent source margin so the crest occupies its intended visual box; desktop display is 88px and mobile display is 64px.
- Removed the shared recoloring filter for the official-mark comparison so supplied logo colors and geometry are shown unchanged.
- Changed the mobile logo row to a six-track grid: three logos fill the first row, while Agentic Society and the crest form a centered second-row pair; desktop remains a balanced five-column row.
- Compared continuous tonal, three-tone, high-contrast, and AI-generated variants. The source-derived tonal version was selected because it preserves the exact original geometry; the AI recreation was rejected because it altered brand geometry despite being visually polished.
- Added regression assertions for the prepared asset path, asset existence, and desktop scale in `QA/tests/test-home-hero-layout.js`.
- Refreshed the Home desktop/mobile visual baselines after inspecting the corrected crest.
- Local verification: hero layout guard passed, visual regression suite passed, and `git diff --check` passed.
- Staging deployment remains pending this final correction; after push, run hosted CI, Deploy Staging, preview smoke, and browser/mobile verification before considering this correction accepted.

The prior responsibility-positioning notes remain below as historical context.

This staging change updates the public positioning to include Fractional Integration Officer work for NC Courage while preserving Agentic Society as a primary AI-architecture proof point and Laser Light Communications as current operating-architecture work.

- Homepage: added the NC Courage crest to the selected operating experience band in a CSS-driven monochrome treatment and added neutral current-responsibility copy.
- About: added a fifth arc chapter for Fractional Integration Leadership / NC Courage; preserved the Agentic Society AI-enabled operating systems chapter; added the new chapter to the floating section navigation and timeline orbit system.
- Services: added Fractional Integration Leadership as the first service model and retained the existing AI-enabled operations and operator-development models.
- Framework: added integration-leadership and AI-architecture SEO language plus a public-safe application note connecting the framework to NC Courage, Laser Light Communications, and Agentic Society.
- Connect: added neutral current-responsibility copy naming NC Courage, Laser Light Communications, and Agentic Society.
- SEO: refreshed titles, descriptions, Open Graph/Twitter metadata, homepage Person schema, and page-level structured-data terms for fractional integration leadership, Fractional Integration Officer, AI architecture, technology integration, and vendor evaluation.
- Public boundary: no confidential NC Courage portal findings, vendor judgments, stakeholder names, or internal systems were added to the public site.
- Deferred Phase 2: create a public-safe NC Courage integration resource or case study after approval of the public narrative.
- Required PRD update: the live `romanbediner.com PRD` Google Doc now records the new positioning, public-safety boundary, crest treatment, and SEO vocabulary.

### Resume point

- Hosted CI and Deploy Staging are green for the prior product release; the preview is available at https://rbediner.github.io/romanbediner-preview/.
- Browser verification covered the homepage and canonical About, Services, Framework, Resources, and Connect routes; Computer Use confirmed the desktop Chrome view, navigation, current-work copy, and five-logo experience band.
- Mobile responsive and visual QA passed locally, including the affected Home, About, Services, Framework, and Connect views.
- A live browser check found that Services and Connect had stale `<title>` tags while their Open Graph/Twitter metadata was current. Commit `9dde32b` aligns those titles and adds a regression assertion in `QA/tests/test-og-route-metadata.js`.
- The follow-up commit is local but not yet pushed because the configured GitHub token is invalid (`gh auth status` reports re-authentication required). Resume by authenticating GitHub, pushing `staging`, running the isolated handoff push, then rerunning the hosted staging deploy and live browser verification.

## Latest — 2026-07-05: EBI Round 2 (Looker Studio structure cleanup) + analytics documentation (Claude)

**Committed and pushed to `origin/staging` at `463d3c9`.** This entry supersedes the "Looker Studio report finalized" one directly below for anything related to filter count, page names, or the Traffic Sources page layout -- that entry is now partially stale (see specifics below) and kept only for its account-boundary/setup history, which is still accurate.

1. **Looker Studio structure cleanup (EBI Round 2, all live edits, no local files):**
   - **Filter audit:** found 16 total filters existed (up from the 3 real ones documented in the previous entry) -- 11 were dead (0 charts using them, leftover from earlier iteration) and 1 was broken beyond repair (`Event = (page|screen)_view`, field showing "Missing," every field-picker option showing "Invalid," Save permanently disabled even after a valid Name-only edit). All 12 deleted. Final state: **exactly 4 filters** -- `Page path filter` (7 charts), `Exclude passive & legacy events` (3 charts), `Event = resource_pdf_download` (1 chart), `Event = resource_preview_expand` (1 chart).
   - **Removed an unused blended data source** ("BL: eComm Funnel," confirmed 0 charts referencing it via Resource → Manage blends before deletion) that was cluttering the Data panel's field picker with eCommerce fields (`add_to_cart`, `purchase`, etc.) romanbediner.com has never used.
   - **Redid the "Top Events" table removal** on the Traffic Sources & Landing Pages page (table + trend chart + title + container rectangle, 4 individual deletions) -- this was a byte-for-byte redundant duplicate of the Key Actions page's event breakdown, with none of that page's filtering context. Left a cosmetic gap rather than repositioning the Landing Pages block below it.
   - **⚠️ New Looker Studio failure mode discovered and recovered from:** bulk arrow-key repositioning (100x `Up` presses on a multi-selected group, attempting to close the same layout gap on a first attempt) corrupted the ENTIRE page's rendering to a blank white canvas -- including completely untouched charts -- reproducibly across reload, View mode, and a brand-new browser tab (proving server-side saved-state corruption, not a client glitch; the underlying data model stayed intact per the accessibility tree). Recovered via `File → Version history → See version history`: bisected timestamped snapshots to find the last-good version (2:38 PM), restored it, then verified via Manage Filters that the filter cleanup above (which happened before the break) survived the restore while only the risky move sequence was rolled back. **Lesson applied on retry:** redid the Top Events deletion without any bulk repositioning at all -- verified each of the 4 deletions individually via screenshot before proceeding, then confirmed the whole page via reload and View mode. Full writeup of this gotcha is in the `project-romanbediner-analytics` memory and `analytics-digest/docs/analytics-scope.md`.
   - Page 5 renamed **"Conversions & Top Pages" → "Top Pages"** (the Conversions table was already removed in Round 1; the name just hadn't caught up).

2. **Two new documentation deliverables, per explicit request** ("document analytics scope... same with interpretation/analysis method... so if I want to replicate it for another property, we don't reinvent the wheel... point an agent to a file and say replicate this"):
   - **`analytics-digest/docs/analytics-scope.md`** -- what's tracked: GA4 property, both traffic exclusions, full event taxonomy (passive/excluded vs. real interaction vs. watched-for-zero-volume), the `(not set)` bucket explanation, the current 4-filter inventory, and what's explicitly out of scope (eCommerce fields, the EmailJS contact form).
   - **`analytics-digest/docs/replication-guide.md`** -- a property-agnostic runbook: GA4 service-account setup, the Looker Studio dashboard blueprint (including every structural lesson learned the hard way this session, so a future rebuild doesn't repeat them), the Worker scaffold with file-by-file guidance, and the insight-generation methodology/rationale (why 7-day-trailing not day-over-day, why a 25% notable threshold, why templated/condition-gated recommendations only). Written so an agent can be pointed at this single file and asked to rebuild the whole stack for a different property.
   - Both READMEs (`analytics-digest/README.md` and the root `README.md`) now link to these two docs instead of duplicating filter/page detail inline, and the stale "Conversions & Top Pages" reference plus the Worker's architecture diagram (missing `/preview`, `/trigger`, and the failure-alert path added in Round 1) were fixed in the same pass.
   - Confirmed via `npm test` (15/15 pass) and `npm run typecheck` (clean) before pushing -- no code changes in this round, docs/Looker-Studio-only, but ran the full check anyway since the Worker's README changed.

3. **Digest cadence confirmed unchanged:** user confirmed once-a-day is exactly right ("I only need that email once a day") -- no code change needed, the existing 8am America/New_York cron already satisfies this.

## Latest — 2026-07-05: Looker Studio report finalized + new analytics-digest Worker built (Claude)

**Two systems.** The Cloudflare Worker + doc updates below are committed and pushed to `origin/staging` (commit `354e597`, merged with concurrent origin changes at `9efc5de`). The Looker Studio changes have no local files — they're live edits in the Looker Studio UI itself, nothing to commit.

1. **Looker Studio dashboard fixes** (all done live in the Looker Studio UI, no local files):
   - 10 EBI-approved improvements shipped across all 5 report pages (legacy-event stripping, zero-volume-event surfacing, Conversions page repointed from a broken "Conversions" metric to `Event count` + event filter, vs-previous-period deltas, Daily Briefing block, 7-day trailing default comparison, page reorder, per-page captions, interactive-only element audit, mobile-render check).
   - **Report-wide `localhost` traffic pollution fixed:** the compound "Page path filter" (7 charts) now excludes both `Page path Contains "romanbediner-preview"` AND `Session source Contains "localhost"` (2 AND'd Exclude clauses -- De Morgan's law: NOT(A OR B) = NOT A AND NOT B). Verified live: `localhost:4321` no longer appears in the Traffic Sources & Landing Pages page's Top Traffic Sources table.
   - **Three ambiguous, identically-named "Event name filter" entries renamed** to `Exclude passive & legacy events` (5 charts), `Event = resource_pdf_download` (1 chart), `Event = resource_preview_expand` (1 chart).
   - **Bonus bug caught while renaming:** the last two filters above had **no value set at all** (`Equal to (=)` with an empty condition) -- meaning the "PDF Downloads" and "Resource Preview Expands" scorecards were showing "0" from a broken filter matching nothing, not necessarily from real zero activity. Root cause: Looker Studio silently saves an "Equal to" filter with an empty value when "Show suggested values while typing" is on and the typed value has zero historical occurrences in the selected date range (true for these two genuinely-never-fired events). Fixed by toggling that switch off before entering the value, confirmed correct against the site's own tracking source (`scripts/runtime/resources-analytics.js`, `resources-carousel.js`). Both scorecards still show `0` -- now a real zero, backed by a working filter. **If a similar "0" scorecard ever looks suspicious, check Resource → Manage filters and confirm the value column actually shows a value, not just the condition type.**

2. **New Cloudflare Worker: `analytics-digest/`** (deployed, partially wired) -- a separate daily narrative-insights email companion to the Looker Studio PDF. Full architecture, account/secret inventory, and setup steps are documented in `analytics-digest/README.md` -- read that file in full before touching this system, it is the single source of truth. Summary:
   - Own Cloudflare account (`a00e5c592f3d32a0258528122cecde89`, `Rbediner@gmail.com`'s Account -- same account as the DNS zone, deliberately **separate** from `pasteflow-growth-engine`'s account), own GA4 service account (`romanbediner-analytics-digest@gen-lang-client-0482186037.iam.gserviceaccount.com`, Viewer role on GA4 property `524954289`), own Resend API key.
   - Deployed and confirmed live: `https://romanbediner-analytics-digest.rbediner.workers.dev`, cron `0 * * * *` (hourly, self-gates to 8am America/New_York in the handler so it survives DST without a static UTC value).
   - **⚠️ ACTION FOR ROMAN (manual, credential-handling — no agent should do this):** `GA4_SERVICE_ACCOUNT_JSON` secret is **not set**. The key file downloaded during an earlier session's browser automation landed in that browser's sandbox, not on this Mac (confirmed absent from `~/Downloads`, `~/Desktop`, `~/Documents`). Fix: generate a *new* key for the same service account from Google Cloud Console (IAM & Admin → Service Accounts → that account → Keys → Add key → JSON), then `npx wrangler secret put GA4_SERVICE_ACCOUNT_JSON < ~/Downloads/<file>.json` from `analytics-digest/`. Full steps in `analytics-digest/README.md` under "Known gap." `RESEND_API_KEY` and `DIGEST_TRIGGER_TOKEN` are already set. Verify via `curl https://romanbediner-analytics-digest.rbediner.workers.dev/` -- should read `"ga4":true` once fixed (currently `false`).
   - `analytics-digest/` is now **tracked and pushed** (`origin/staging`, commit `354e597`). Roman granted standing permission this session to commit/push to this repo's `staging` branch without asking first (does not extend to promoting `staging` → `prod`, which still follows the documented Release Flow).

3. **EBI Round 1 (9 items) implemented on both systems, pushed at `40125f2`:**
   - `analytics-digest/`: `excludeLocalhostFilter()` added to `ga4.ts` so the Worker's traffic exclusion now matches the Looker Studio filter exactly (previously the Worker only excluded preview-path traffic, not `localhost`); `runDigest()` now catches its own errors and emails a `-- FAILED` alert via Resend instead of only logging; `GET /preview` renders the digest from a shared synthetic fixture (`src/mock-data.ts`) with no secrets needed; `/trigger` bearer check is now constant-time; a cross-reference comment links `EXCLUDED_EVENT_NAMES` to the Looker "Exclude passive & legacy events" filter (two independently-maintained lists, drift risk flagged). Added `vitest` + 15 tests for `insights.ts`'s threshold logic (`npm test`). Redeployed and verified live (`curl .../` and `curl .../preview`).
   - Looker Studio: added a caption to Executive Summary explaining the ~99% "New User %" is a GA4 heuristic on low-traffic sites, not literally zero repeat visitors; added a caption to Audience & Devices explaining the "(not set)" country bucket; **retired the redundant "Conversions" table** on the former "Conversions & Top Pages" page (it was a byte-for-byte duplicate of the Key Actions page's events under a misleading label — "no official GA4 key events are configured yet") and **renamed the page to "Top Pages"**, now pointing readers to the Key Actions page for the full event breakdown.
   - EBI Round 2 requested next — if you're picking this up mid-round, check the conversation for what Round 2 proposed before assuming Round 1 is the latest state.

## Latest — 2026-07-02: Drive-workspace I/O fix + verify-prod-release follow-up (Claude)

**Root cause of the "stuck" background commands (`npm run release:verify-prod`, test runs) from earlier tonight:** the Google Drive-mounted checkout at `.../My Drive/AI/Projects/RB Website/romanbediner.com` was under heavy on-demand file-materialization I/O contention — `verify-prod-release` and a Growth Engine test run both stalled for 15-20+ minutes with near-zero CPU usage (confirms I/O wait, not a real hang, deadlock, or infinite loop). This is separate from the `.git` conflict-copy corruption already documented below — a second, distinct Drive-caused failure mode.

**Fix that works:** clone the repo to a fast local path once per session and run all heavy commands (`npm install`, test runs, release scripts) from there instead of the Drive-mounted folder:
```bash
mkdir -p ~/.local-repos && cd ~/.local-repos && rm -rf romanbediner.com
git clone --branch staging https://github.com/rbediner/romanbediner.com.git
```
Commit and push from the local clone; GitHub is the source of truth, so the Drive-mounted folder simply becomes a viewer/editor copy that a plain `git pull` brings current. Never run two heavy processes against the Drive folder concurrently — that measurably worsens the contention.

**`npm run release:verify-prod -- --sha 1d76a00` follow-up:** the script's CI-run-discovery step (`scripts/release/watch-ci-run.js`, `workflow="CI"`) gave up after 900s with "No matching run discovered," even though `CI` for that exact SHA on `prod` had already completed successfully (confirmed independently multiple ways — see below). This looks like a pre-existing edge case in the run-matching logic under `scripts/release/watch-ci-run.js` (~line 238), not a real release failure; worth a maintainer look but not urgent, since the actual deployment is unambiguously verified:
- `gh run list --branch prod` — `CI` success, `Deploy Pages` success, both SHA `1d76a00`
- GitHub Deployments API — SHA `1d76a00`, environment `github-pages`, state `success`
- Live smoke — `https://romanbediner.com/` 200, correct `percent_scrolled` content

## Latest — 2026-07-02: seq-285 fix promoted to prod, both branches in parity (Claude)

**Promoted `1d76a00` (the `deploy-pages` 30-min timeout fix) from `staging` to `prod`** via fast-forward push, per the Operator Release Workflow. `1d76a00` already had green `CI` and `Deploy Staging` on staging before promotion, so no additional staging validation was needed.

**Prod result, all green:**
- `CI` (prod, SHA `1d76a00`): success
- `Deploy Pages` (prod, SHA `1d76a00`): success — and notably this run itself validated the fix, since the confirmation step took long enough that it would have false-failed under the old 10-minute default.
- GitHub Deployments API independently confirms: SHA `1d76a00`, environment `github-pages`, state `success`.
- Live smoke: `https://romanbediner.com/` returns 200; `framework-brief-analytics.js` confirmed serving `percent_scrolled` (not the retired `scroll_percent`).

**Docs-only commit `755dcdb` (README note about the timeout fix) fast-forwarded to `prod` immediately after** for branch parity — this is a `paths-ignore` commit for both `CI` and `Deploy Pages`, so it did not trigger new runs by design (same pattern already proven safe on staging).

**Formal gate:** `npm run release:verify-prod -- --sha 1d76a00` was run; if its output isn't reflected here yet, the workspace's Google Drive I/O was under heavy contention from concurrent multi-repo work at the time and the check was still finishing. Re-run it directly if you want the printed confirmation: `npm run release:verify-prod -- --sha 1d76a00`.

**prod and staging are now in parity at `755dcdb`.**

## Latest — 2026-07-02: Pages deploy false-failure fixed (Claude)

**Symptom:** the prod `Deploy Pages` run for seq-284 showed a red failure ("Timeout reached, aborting!" on the `Deploy to GitHub Pages` step), making it look like the GA4 `percent_scrolled` fix never shipped.

**Root cause:** the deploy actually **published** (live site was already serving `percent_scrolled`). `actions/deploy-pages@v5` uses a 10-minute default timeout waiting for GitHub to *confirm* the deployment; a transient Pages stall exceeded it and reported a false failure. Re-running made it worse — a re-run uploads a second `github-pages` artifact and the deploy step hard-fails with "Multiple artifacts named github-pages... Artifact count is 2."

**Resolution:**
- Cleared the failed state with a **fresh** `workflow_dispatch` run of `deploy-pages.yml` (new run id, clean artifact set) — went green in 22s; `post-deploy-validation` and `release-tag` (`v2026.07.02`) both ran.
- **Durable fix:** bumped the `Deploy to GitHub Pages` step to `timeout: 1800000` (30 min) so a slow-but-successful Pages confirmation no longer false-fails. Operational rule recorded in-workflow: if a run ever times out, trigger a fresh run — never re-run the failed one.

**Note:** the Google Drive-backed workspace git index was corrupted again (only 4 of 332 files tracked, broken refs); repaired by reconciling 18 `.git` conflict-copies and hard-resetting to `origin/staging`.

## Current State — 🚀 LIVE ON PROD (both branches at `ae87b62`)

**New staging release candidate:** `staging` now contains `26d6b59` (`fix: align framework scroll depth analytics`). This repairs a GA4/Looker contract mismatch on framework brief `scroll_depth` events: the runtime had been sending `scroll_percent`, while the registered GA4 custom dimension and shared site contract use `percent_scrolled`. The fix updates `/scripts/runtime/framework-brief-analytics.js` to emit `percent_scrolled` and adds QA guards in `QA/tests/test-ga4-installation.js` plus `QA/tests/jest/framework-brief-analytics-contract.test.js` so the legacy key cannot silently return.

**Verification completed for the release candidate:** `node QA/tests/test-ga4-installation.js` PASS, `node scripts/qa/verify-ga4-installation.js` PASS, and the targeted Jest suite for the new contract test PASSed in a clean local clone (`node scripts/qa/run-jest-suite.js QA/tests/jest/framework-brief-analytics-contract.test.js --runInBand`). The original Google Drive-backed workspace had git/ref and Jest-runner instability, so the release work moved to a clean local clone where git operations behaved normally.

**PRD updated in the same release cycle:** the live `romanbediner.com PRD` / `SEO Authority PRD` now explicitly states that framework brief `scroll_depth` must use `percent_scrolled` and must not use `scroll_percent`.

**`prod` and `staging` are both at `ae87b62`.** A long autonomous session shipped **four prod releases** tonight (all FF-promoted from staging, all `verify-prod-release.js` green):
- `edf1f16` — OG share-card overhaul + site-wide metadata unification (detail below).
- `fdc466a` — **share-card coverage completed**: `insights/` → `summary_large_image` + card (item C); the `/ai-enabled-operations-dashboard/` app page got full `canonical`/`og`/`twitter` on **both** the Vite source template and the deployed `dist/index.html` (item D, distinct app-focused title/description, no em dash); `404.html` carded so broken-link shares aren't blank.
- `c867994` — **GA4 event instrumentation**: `fleet-diagram-zoom.js` now emits `fleet_diagram_fullscreen` + `fleet_diagram_zoom` (`{diagram_index, diagram_label}`); `site-navigation.js` emits **site-wide `scroll_depth`** at 25/50/75/100% (`{percent_scrolled, page_path}`, rAF-throttled, self-detaches at 100%). README taxonomy updated.
- `ae87b62` — **scroll-depth load-order fix**: `site-navigation.js` (non-deferred) runs before the deferred `ga4-bootstrap.js`, so the initial `evaluate()` marked already-visible thresholds as fired while `trackEvent` was still a no-op → those events were lost (every threshold on short pages). Now defers start until analytics is ready. **Found via live-Chrome verification** (dataLayer had zero scroll_depth pushes).

**Verified live on prod (Chrome browser mode):** agentic page renders correctly (6 pills 2×3, roster with correct names, lightbox opens/zooms); `fleet_diagram_fullscreen` + `fleet_diagram_zoom` confirmed **arriving in GA4 Realtime**; no console errors; homepage GA4 env=production, fresh JS cache tokens, og:image v5.

**GA4 setup done in-UI (Roman's account):** 7 event-scoped **custom dimensions** registered — `resource_slug` (Resource Slug), `resource_title` (Resource Title), `diagram_label` (Diagram Label), `percent_scrolled` (Scroll Percent), `link_type` (Link Type) + legacy `insight_slug`/`insight_title`. A native **Exploration "RB — Events & Engagement"** created under Explore (events by name × users; custom events populate as data accrues). GA4 Home/Reports/Realtime also serve as live dashboards.

### OG overhaul detail (`65eb36c` / `edf1f16`):
- New **lean share card** replaces the prior gradient card: name eyebrow (ROMAN BEDINER), a single Cormorant Garamond headline ("Productizing Operations for Modern, AI-Enabled Work"), the nested-square brand mark + glossy orb top-right, and `romanbediner.com`, on deep navy `#0d1530`. Saved as `assets/og-logo/og-final.png` (1200×630, ~108 KB). The earlier busy version (subhead sentence + "Disney · AWS · Agentic Society" credit line) was dropped — too cluttered at feed size.
- **One default card site-wide:** `og:image` + `twitter:image` bumped `?v=4 → ?v=5` on all 16 routes; the separate `assets/og/framework-preview.png` was **retired** — the six framework detail routes now use the shared card (old asset returns 404).
- `og:image:alt` refreshed (dropped stale "editorial gradient background" wording); **`twitter:image:alt` added** on all 16 routes (mirrors og alt; both locked into `test-og-route-metadata.js`).
- **Preview-build fix — `scripts/build/create-preview-artifact.js`:** absolute `https://romanbediner.com/...` og:image/twitter:image URLs are now rewritten to the preview origin (`https://rbediner.github.io/romanbediner-preview/...`) so OG validators (Orca Scan) reflect the *staged* card, not the live prod image. `canonical`/`og:url` intentionally left on prod. Durable for all future OG previews; covered by existing preview/artifact guard tests.
- **QA:** full-regression pre-push gate green on both SHAs; 4 OG/insights metadata tests + README updated to match. Prod `CI` ✓, `Deploy Pages` ✓, `verify-prod-release.js` ✓ (homepage/sitemap 200, 16 routes). Verified live: prod `og:image` = `.../og-final.png?v=5` (200, image/png, 108285 B); `framework-preview.png` → 404.
- **Validated in Orca Scan** (preview URL): Facebook / LinkedIn / Slack / WhatsApp render the full card cleanly. Orca's "Twitter" panel shows a legacy *summary* (square) crop — an Orca mock limitation, **not** a tag issue (`twitter:card=summary_large_image` is correct, verified); real X renders the large card. Orca's "missing `og:logo`" is also a non-issue (`og:logo` is not in the Open Graph spec; identity lives in the page's `Person`/`WebSite` JSON-LD).

Prior release (`63c2f88`): agentic-page roster card names corrected to the agents' actual names — **Agent — Project Manager**, **Agent — Chief of Staff**, **Agent — Orchestration Director** (em-dash to match page typography); README roster mention updated. FF-promoted to prod; prod `CI` ✓ (3m11s), `Deploy Pages` ✓ (5m32s); live-verified in Chrome.

Prior release (`27c28ad`): agentic eyebrow → "AVAILABLE NOW".
Prior release (`1af606b`, the big one):
**`prod` and `staging` were brought to `27c28ad`.** Latest release (`27c28ad`): the agentic page eyebrow changed **"REFERENCE ARCHITECTURE" → "AVAILABLE NOW"** (availability badge; `.resources-label`, still blue/uppercase). FF-promoted to prod; prod `CI` ✓ (3m7s), `Deploy Pages` ✓ (5m13s), `verify-live-production.js` ✓ (homepage/sitemap 200, 16 routes); live-verified in Chrome (eyebrow reads "AVAILABLE NOW"). **GSC sitemap re-submission still pending Roman (manual).**

Prior release this session (the big one):
**`prod` and `staging` were brought to `1af606b`** (fast-forward promotion). This session's entire body of work is now **LIVE on https://romanbediner.com**. Prod workflows all green for `1af606b`: `CI` (3m17s), `Deploy Pages` (5m19s, post-deploy validation incl.), `Docs Sync`. `node scripts/qa/verify-live-production.js` PASS (homepage 200, sitemap 200, 16 routes OK). **Live-verified in Chrome:** home navy-ink logos; About chips removed + floating "On this page" + era colors (blue function / gray company); agentic page roster-first + "A human is always in charge" callout + 6 all-caps pills; Framework H1 one line (48px).

**⚠️ ACTION FOR ROMAN (manual, I can't access GSC):** re-submit `sitemap.xml` in Google Search Console now that prod has new/changed pages — that's what forces Google to re-crawl (GSC last auto-read it Feb 18). This is the documented post-prod step.

**Prod divergence reconciled:** prod had an out-of-band hotfix `56f910f fix: include 404.html in build artifact` (added `'404.html'` to `INCLUDE_PATHS` in `create-artifact.js` + a README note) that was never on staging. A clean `git merge origin/prod` into staging (commit `1af606b`, auto-merged, no conflicts) brought that fix back so prod was fast-forward-able and the branded 404 page keeps deploying. Going forward staging ⊇ prod again; future promotions are clean FF.

**This-session final UI change before promo:** About visible chapter-nav chips **removed** (`e3ad826`) — redundant with the always-visible floating control; `.about-chapter-nav` markup kept but `.sr-only` so it remains the `[data-section-nav]` source + an SR landmark. (Home logos: the navy-ink + color-on-hover from `df29f9a` was kept — judged premium, not reverted.)

### Prior (seq 273, staging-only) — head was `df29f9a` — `Home logos: premium single-ink monochrome + color-on-hover`. **Home-logos item RESOLVED.** The faded grayscale (opacity 0.6) is replaced with a crisp **single-ink monochrome**: each mark recolored to the brand **deep-navy** at full strength via a CSS filter (`brightness(0) invert(13%) sepia(46%) saturate(1700%) hue-rotate(196deg) brightness(95%) contrast(95%)`) — uniform, premium, not faded/gray/black. On **hover** the real brand color blooms back in (`filter:none`) with a subtle lift. CSS-only on `styles/home.css` (no asset/markup changes, kept current size + position); home.css token r7→r8; 4 home visual baselines refreshed. All green; verified live in Chrome (navy at rest; AWS orange returned on hover). Rejected: Variant A solid-black (Roman: "back where we were"), faded grayscale (washed/cheap). True per-brand monochrome SVG swap was deemed unnecessary — the navy-ink filter + color-hover achieves the premium look with zero markup/asset risk.

### Prior — `staging` head was `0970d0b` — `Agentic page: lead with the roster + add human-in-charge framing`. On the `/resources/agentic-ai-employees/` page: the **roster** ("Two doers and an operator") now leads (moved to directly after the overview pills); the "How they relate" box was lightly reworded to stand alone at the top (dropped the forward-reference to "the brain" → "a shared library"); and a **human-oversight** point was added so the page doesn't read as job replacement — a lede sentence ("A person stays in charge of the fleet…") + a callout after the roster ("A human is always in charge" — agents as human-directed **direct reports**, "nothing consequential ships without a human's green light"; positive/non-defensive framing). Evergreen (no models/costs/tools-by-name). README updated. All green for `0970d0b`; verified live in Chrome.

**OPEN — home logos still pending Roman's pick.** The faded grayscale (opacity 0.6) was the wrong call (looked washed-out/cheap; hover-reveal is undiscoverable). Prototyped two crisp full-strength options at the current size/position on the preview: **A** = uniform solid-black monochrome (`grayscale(1) brightness(0)`, opacity 1, no hover) — cohesive, premium; **B** = real logos in full color (`filter:none`, opacity 1) — recognizable but mixed (AWS orange vs Disney black; Laser reads light). Roman to pick A vs B (or true monochrome brand assets, which would need sourcing official one-color AWS/Laser/Agentic marks). Nothing committed for logos yet — `styles/home.css` still has the opacity-0.6 fade from seq-265 that Roman dislikes; revert/replace once he picks.

### Prior (seq 269) — `staging` head was `b4514c0` — `Section nav: show "On this page" from page load (not only after scroll)`. The floating control's "appear after scrolling past the inline anchors" gating was removed; it is now visible immediately on About + Services (desktop + mobile), discoverable without scrolling. Active-section highlighting still tracks via IntersectionObserver. `section-nav.js` token a→b; about/services baselines refreshed (FAB now renders in-frame). All workflows green for `b4514c0`; verified live in Chrome (FAB visible at scroll 0 once CDN propagated).

### Prior (seq 267) — `staging` head was `b2435bd` — `About chapter-nav: 3-column grid on desktop (tidy 3x2)`, on top of `9a0141e`. All workflows green for `b2435bd` (CI 3m21s, Docs Sync, Deploy Staging workflow_run). Two follow-ups this turn:
- **About chapter-nav → 3×2 grid (`b2435bd`).** The five chips wrapped as a ragged 4 + 1 at the 1100px container (one line not achievable with these label lengths), so `.about-chapter-nav` is now a uniform 3-column CSS grid on desktop (rows of 3 + 2); mobile keeps the content-hugging flex wrap. `styles/about.css` token r8→r9; about--desktop-fold/full baselines refreshed.
- **"Where's the floating nav?" — it was browser HTML cache, not a bug.** The section nav IS deployed and works: verified live in Chrome that the canonical `/about/` served a stale (pre-deploy) `index.html` from the browser cache (no script tag), while `?cb=`/hard-refresh (Cmd+Shift+R) loads the fresh HTML with the FAB present and functioning. GitHub Pages caches HTML; returning visitors must hard-refresh the preview to pick up HTML changes (asset CSS/JS changes are `?v=`-busted, but the HTML page itself is not). This applies to all HTML-structure changes on the preview.

### Prior (seq 265) — `staging` head was `9a0141e` — committed and **pushed**, all workflows green for that SHA: `CI` (success, 3m26s), `Docs Sync` (success), `Deploy Staging` (`workflow_run`) success (the push-triggered Deploy run was concurrency-cancelled, as expected). Full-regression pre-push gate passed (visual 8/8, no phantom this push).

This session shipped a six-part front-end polish pass (Roman's punch list), plus a brittle-test fix and a flaky-baseline refresh.

Staging preview: https://rbediner.github.io/romanbediner-preview/
Prod: https://romanbediner.com/

Staging-only. No prod promotion attempted.

## Implemented Changes (this session, on top of 263)

Three commits (`57278e5` feature, `13cf4d7` baselines, `9a0141e` test fix):

1. **About era headers** — `.era-title` (function/role) stays brand-blue; `.era-sub` (company) is now muted gray (`--text-secondary`) for a two-tier label. (`styles/about.css`, token r7→r8.)
2. **Framework hub H1 one line** — `@media (min-width:769px) .framework-main:not(.framework-brief-main) h1 { font-size: 48px }` so the all-caps title fits one line on desktop (54px wrapped); mobile + brief pages unchanged. (`styles/framework.css`, auto-busted at deploy.)
3. **Agentic AI Employees pills** — `.fleet-pillrow` is now an all-caps CSS grid (3 cols desktop / 2×3 mobile) with a **6th** property pill, **"Human-in-the-loop"**. (`resources/agentic-ai-employees/index.html` + `styles/resources.css`, token r6→r7.)
4. **Agentic diagram lightbox** — NEW `scripts/runtime/fleet-diagram-zoom.js`: each `.fleet-diagram` gets a pinned "⛶ Full screen" button opening a native `<dialog>` lightbox (clones the inline SVG so DM Sans is preserved, dark scrim + white card, fit/zoom toggle, Escape/backdrop/close). CSP-safe (external module from 'self', DOM-only, no inline). Best-UX mobile zoom (Roman: "best UX wins"). CSS in `resources.css`.
5. **Home operating-experience logos** — uniform soft-graphite monochrome (`grayscale(1) brightness(0)`, opacity 0.6, was 0.88 pure-ish black), wider column spacing (gap 26px 48px), subtle hover lift to full ink. Chose this (clean Stripe/Apple-style row) over hairline separators after prototyping both on the preview. (`styles/home.css`, token r3→r7.)
6. **Floating "On this page" section nav (About + Services)** — NEW `scripts/runtime/section-nav.js`: reads an inline `[data-section-nav]` list, surfaces a floating control that appears once that list scrolls out of view (IntersectionObserver), opening a sheet of the same anchors with live active-section highlighting. Progressive enhancement (inline anchors work without JS; control simply never appears if JS/IO absent → no broken state). About reads its visible `.about-chapter-nav`; Services got 4 `.svc-entry` `id`s + `scroll-margin-top` + a visually-hidden `[data-section-nav]` source. Styles (`.section-nav-fab` / `.section-nav-sheet`) in `styles/site.css` (auto-busted at deploy). Desktop gutter-spine was rejected: the 1100px container leaves no room for a left rail on typical laptops without overlapping content — the floating control is the robust answer for all sizes.

Supporting:
- `9a0141e`: `QA/tests/test_services_stack.py` — the `test_four_service_entries_exist` assertion did an exact `count('<div class="svc-entry">')` which returned 0 after the `id`s were added; changed to match `class="svc-entry"` (contract intent unchanged).
- `13cf4d7`: refreshed connect/insights/services visual baselines (unchanged pages) to the current headless render — a bimodal DM Sans font-loading race in the visual harness (insights--desktop-full ~7.8% / ~57px reflow that flips between runs). Visual suite is local-gate-only, so this is zero-CI-impact gate maintenance.

## Files Changed
- New: `scripts/runtime/fleet-diagram-zoom.js`, `scripts/runtime/section-nav.js`
- HTML: `index.html`, `about/index.html`, `services/index.html`, `resources/agentic-ai-employees/index.html` + the 4 other resource pages (resources.css token bump only)
- CSS: `styles/about.css`, `framework.css`, `home.css`, `resources.css`, `services.css`, `site.css`
- Tests/docs: `QA/tests/test_services_stack.py`, `README.md`, home/about + connect/insights/services visual baselines

## QA Summary
- Local full-regression pre-push gate (`qa:ci-parity`) — PASS; `RUN_VISUAL_TESTS=1 test:visual` 8/8 PASS.
- `test-js-header-comments`, `test-csp-comments`, `test-repo-hygiene`, `test_services_stack` — PASS.
- Remote `CI` success (3m26s) on `9a0141e`; `Docs Sync` success; `Deploy Staging` `workflow_run` success.
- **Live-Chrome verification** (`?cb=` to bypass CDN lag): About + Services floating "On this page" controls appear on scroll, open the sheet, and highlight the active section (IntersectionObserver confirmed working on real Chrome); era headers two-tone; agentic pills all-caps 3×2 with 6th pill; framework H1 one line; diagram lightbox opens/zooms/closes; home logos refined.

## Environment / Reliability Notes
- **IntersectionObserver does NOT fire in the local Claude Preview (headless) environment** — even for in-view elements. So IO-dependent features (the section nav) cannot be verified on the local preview; verify on the live preview in Chrome instead. The non-IO lightbox verified fine locally.
- **Visual regression is local-gate-only** (no `RUN_VISUAL_TESTS` in any workflow; CI skips it). Baselines are machine-sensitive. Two failure classes: the documented `home--mobile-full` ~7.5% **intermittent** phantom (stale CSS in the gate's /tmp mirror → retry passes), and a **deterministic-per-run** bimodal DM Sans reflow on `insights--desktop-full`/`-fold` (~7.8%) that flips between runs. Distinguish with a direct `RUN_VISUAL_TESTS=1 npm run test:visual`; if a non-changed page fails repeatably, refresh its baseline to current render (as done in `13cf4d7`).
- Google Drive mount: `git` HEAD is source of truth; `session:ready` hangs (skip it). Launch-preview reads `.claude/launch.json` from the session root (parent dir); `rb-site` serve config (`romanbediner.com/` on :8799) added there for local verification.
- After editing a page-specific stylesheet (about/home/resources/services), bump its `?v=` token (these are NOT auto-busted). `site.css`, `framework.css`, `site-navigation.js` ARE auto-busted at deploy by `create-artifact.js`.

## Open Items / Follow-ups
1. **Roman to review** the live staging preview (hard-refresh / allow CDN propagation): seq-261 fleet diagrams, seq-263 About/Framework all-caps, and this session's six changes — especially the floating "On this page" nav on About + Services and the diagram lightbox on mobile.
2. **When promoting to prod** (only on Roman's explicit approval; fast-forward only, exact tested staging HEAD `9a0141e`): **immediately re-submit `sitemap.xml` in Google Search Console**, then run `node scripts/qa/verify-live-production.js` (or `npm run release:verify-prod -- --sha <prod-sha>`).
3. **Known CI nuisance:** pre-push visual gate can fail on the `home--mobile-full` phantom — just `git push` again. For a *different* baseline failing repeatably, verify with a direct `test:visual` run before refreshing (see Environment notes).
4. Possible polish follow-ups (Roman's call): a visible chip nav on Services (currently the nav source is visually hidden — only the floating control shows); tuning the FAB position/label.
5. Backlog (copy-sensitive, Roman supplies copy): About-timeline mobile progressive disclosure; metric proof points; FAQ/Q&A block; richer OG image. Do not revive `/insights/`.
6. PRD: current release notes are recorded in the live `SEO Authority PRD`, covering the navigation, About hierarchy, and resource visual-family decisions.
7. **OG hygiene C + D — ✅ DONE** (`fdc466a`): insights now `summary_large_image` + card; dashboard app page + 404 fully carded. Optional real-X confirmation: drop `https://romanbediner.com/` into a tweet/DM (prod is robots-allowed, unlike the noindex preview).
8. **⚠️ DAILY EMAIL — needs Roman's one OAuth click (blocked for the agent).** GA4 has **no native scheduled-email**; the only path is **Looker Studio**, which on first use shows an "Authorize Data Studio API to access your account" consent. Granting OAuth is outside the agent's autonomous authority, so it was **not** clicked. To finish: open https://lookerstudio.google.com → click **Continue/Authorize** → Create report → add a **Google Analytics** data source (property `romanbediner.com`, a384780622p524954289) → build charts (suggested: Events by event name + count; resource_card_click by `Resource Title`; `scroll_depth` by `Scroll Percent` + page path; sessions by source/medium; engagement time by page) → **Share ▸ Schedule email delivery** → daily → `roman@romanbediner.com`. The custom dimensions registered tonight make all those breakdowns available in Looker.
9. **⚠️ GA4 KEY EVENTS mismatch (recommend reconciling).** The property's Key events are placeholder lead-funnel names (`close_convert_lead`, `qualify_lead`, `purchase`) that the site does **not** emit (all "No stream data"). The site's real high-intent signal is **`connect_intent`** (Connect CTA). Recommend: Admin → Events → mark `connect_intent` (and optionally `resource_card_click`) as a key event once it appears under Recent events, or create a "Create event" rule mapping it to a lead key event. This makes the Key events / conversions reports meaningful.
10. **GA4 reporting foundation (done tonight):** 7 custom dimensions + the "RB — Events & Engagement" exploration. Enhanced Measurement was not explicitly re-verified — worth a glance (Admin → Data Streams → Enhanced measurement) to confirm scroll/outbound/site-search auto-events are on (custom `scroll_depth` supplements but does not replace them).
11. PRD: the OG/metadata change is share-CTA/legibility, not a ranking lever, and analytics added event coverage — consider a brief `SEO Authority PRD` note for the analytics-contract extension (new events + custom dimensions) per the repo's "meaningful product change" rule.

## Release Watcher Hygiene

Keep release watcher hygiene in place for this repo.
- Use `npm run release:watchers:status` and `npm run release:watchers:cleanup`
- Do not use ad-hoc shell polling loops for CI or preview monitoring.
## Current staging correction — logo and icon QA

## Current staging correction — optical logo sizing and navy Disney+

## Current staging correction — mobile spacing, crest scale, and hover emphasis

## Current staging correction — AWS optical rebalance

The next mobile review showed that AWS still dominated the lower row because its heavy wordmark carries more visual mass than Disney+ and Laser Light at the same nominal width. Mobile AWS is now capped at 64px while Disney+ and Laser Light remain readable at 88px and 90px. The desktop NC Courage crest is increased to 128px. CSS cache token is `20260716r14`.

- Local homepage guardrail, services tests, visual regression, diff hygiene, and drift checks pass.
- Staging-only; no production promotion.

The follow-up visual review found the mobile three-mark row too tight and the crest slightly undersized. The mobile grid now uses 20px horizontal gutters, moves Agentic Society and NC Courage inward as a compact pair, and caps Disney+, AWS, and Laser Light to fit without crowding. The desktop crest increases from 112px to 120px. Logo hover/focus behavior is now deliberately stronger: an 8px lift, 1.14 scale, deeper blue halo, saturation lift, and a reduced-motion fallback. The CSS token is `20260716r13`.

- QA contract updated for the new 120px crest and centered mobile pair.
- Homepage guardrail, services tests, visual regression, diff hygiene, and Google Drive drift checks pass locally.
- Staging-only; no production promotion.

The previous live staging pass was rejected after desktop AWS rendered oversized and the color treatment remained inconsistent. This note is superseded by the mobile spacing, crest scale, and hover emphasis correction above. The navy Disney+ wordmark, AWS, Laser Light, Agentic Society, and NC Courage remain constrained to fit their visible geometry without clipping. The Disney+ source is the navy wordmark hosted on Wikimedia Commons and attributed in that file description to The Walt Disney Company; it is not represented as a current first-party downloadable brand-kit asset. CSS cache token for that earlier pass was `20260716r12`.

- Product files: `index.html`, `styles/home.css`, `assets/logos/disney-plus-navy.svg`, `assets/logos/logo-asset-manifest.json`, and refreshed home visual baselines.
- QA: `scripts/clean-drive-drift.sh --check`, homepage layout guardrail, services-stack unit tests, `git diff --check`, and visual regression all pass locally.
- Staging-only. Deploy only after the product commit is pushed, then verify the cache-busted desktop and mobile preview in browser.

Staging-only correction in progress on `staging` after visual review found that the homepage experience row was clipping marks and the Fractional service icon was too small and ambiguous.

- Homepage logo cells no longer clip official marks. AWS keeps the official PNG and is optically scaled around its transparent source canvas; Disney, Laser Light, Agentic Society, and NC Courage remain official color assets.
- The mobile six-track arrangement remains, with desktop and mobile visual baselines refreshed after browser review.
- The Fractional and Embedded Operating Leadership icon is now a clearer two-block operating handoff with two glossy blue nodes, rendered at 44px for the lead service entry; service icons remain distinct.
- Local browser review confirmed all five desktop marks render without cropping, and the fractional icon reads clearly at the rendered size. Mobile visual regression passed after baseline refresh.
- No production promotion has been attempted.

## Current staging correction — AWS optical centerline rebalance

The experience marks continue to use shared centered grid cells at desktop and mobile. The latest visual review identified an optical, not structural, mismatch: AWS carries substantially more visual weight because of its large lower smile. AWS is therefore reduced to 104px on desktop and 60px on mobile so the neighboring marks read as aligned to the same horizontal centerline without per-logo nudging. NC Courage remains at the larger 128px desktop crest treatment. CSS cache token is `20260716r15`.

- Homepage layout guardrail, services tests, visual regression, diff hygiene, and Google Drive drift checks pass locally.
- Staging-only; no production promotion.
## Latest — 2026-07-19: Agentic resource evidence framing and mobile hierarchy

The Agentic AI Employees resource now uses the more accurate public classification `REFERENCE ARCHITECTURE + BUILD REPORT`. It is a first-party operating-system build, not a customer case study, because the page does not claim an external customer context or measured before-and-after outcome.

- Updated the page label, supporting banner, metadata, JSON-LD date, resource taxonomy, hub card, and CTA to use build-report language.
- Added the shared resource opening pattern: blue introductory banner and `Who This Is For` card.
- Standardized the visible page heading to the site all-caps treatment with a supporting `FROM REQUEST TO PRODUCTION` deck; preserved the full SEO headline in metadata and structured data.
- Kept `On this page` available at page load on desktop and mobile, with a centered mobile control and centered mobile navigation sheet.
- Removed the banned phrase `why it matters` and long-dash punctuation from public HTML copy and updated the footer/metadata contracts accordingly.
- Updated the shared `bediner-site` skill in the local callable install and Google Drive source, including the evidence-level rule for build reports versus customer case studies, language rules, and mobile heading/navigation guidance.
- PRD updated with the classification and evidence boundary.

Validation:
- Focused agentic, diagram, footer, metadata, route parity, OG, Resources, and link checks passed.
- Direct Playwright checks passed at 1440px, 768px, and 390px with zero horizontal overflow; mobile floating navigation opened and closed correctly.
- Full visual suite remains blocked only by the pre-existing homepage baseline mismatch (`home--desktop-full.png`, changed ratio `0.054603` versus threshold `0.0016`); changed resource routes were isolated and visually inspected directly.

## Latest — 2026-07-19: Shared resource polish, About hierarchy, and immediate section navigation

- The floating `On this page` control is now available at page load across About, Services, and Agentic AI Employees on desktop and mobile. The inline anchor sources remain available for progressive enhancement.
- The About Operating Philosophy close now uses a wider 780px desktop reading measure and a full-width mobile rule so the text aligns more closely with the main body rail without creating phone overflow.
- Current responsibility lines on About and Services now use dark ink for the label and company names, with blue role titles, preserving the existing compact uppercase treatment while improving scanning.
- Dashboard and PasteFlow now share the Agentic AI Employees resource opening treatment: quiet radial field, balanced title scale, gradient introduction surface, and larger editorial lede. Their iframe, product image, CTA, analytics, and mobile fallback behaviors remain route-specific.

Validation:
- `npm run test:node` passed.
- `npm run test:playwright` passed 12/12, including mobile/desktop section navigation, GA runtime, CSP, and Agentic mobile layout.
- Direct desktop and phone screenshots were reviewed for About, Dashboard, and PasteFlow; no clipping or horizontal overflow observed.
- Live `SEO Authority PRD` updated with this release's product and design decisions.
- Staging only until exact-SHA deployment verification completes; production promotion is the next release step.

## Release Watcher Hygiene

Keep release watcher hygiene in place for this repo.
- Use `npm run release:watchers:status` and `npm run release:watchers:cleanup`
- Do not use ad-hoc shell polling loops for CI or preview monitoring.
