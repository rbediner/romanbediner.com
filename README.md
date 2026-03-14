# RomanBediner.com

## System Overview
- Executive operating website for Roman Bediner, focused on productizing operations for modern AI-enabled work.
- Static-first architecture with deterministic HTML, CSS, and JavaScript assets.
- Folder-based routing where each canonical URL resolves to a folder `index.html` file.
- Security-first posture with CSP enforcement and runtime policy validation.
- Analytics architecture is centralized, CSP-compatible, and validated by tests.
- Footer includes a responsive literary quote rendered with Cormorant Garamond, centered as a block with left-aligned text lines; desktop typography is tuned for a wider single-line presentation with stronger contrast, and attribution uses an em dash (`— Walt Disney`) under footer-aware QA guardrails.

## Canonical Route Architecture
Canonical public routes:
- `/`
- `/about/`
- `/services/`
- `/connect/`
- `/framework/`

Routing requirements:
- Trailing slash is required for canonical URLs.
- Public URLs must never expose `.html` suffixes.
- Canonical domain is apex-only: `https://romanbediner.com` (no `www`).
- `/home/` must never exist.

## Hosting Model
- Current host: GitHub Pages.
- Runtime model: static-only delivery.
- No server-side includes or server-rendered composition.
- CSP is enforced in HTML via `<meta http-equiv="Content-Security-Policy">`.
- Production publish flow uses GitHub Actions deployment on `push` to `prod`, with an explicit in-workflow wait for successful `CI` on the exact prod SHA (`.github/workflows/deploy-pages.yml`).
- Hosting portability is mandatory for:
  - S3 + CloudFront
  - Vercel
  - Netlify
  - Nginx/Apache

## Branch and Release Model
- `staging`: integration branch for active development and test validation.
- `prod`: deployment branch that publishes to GitHub Pages.
- Promotion rule:
  1. validate changes on `staging`
  2. promote the exact tested commit to `prod`
  3. GitHub Actions runs full-gate CI on `prod`, then deploys Pages only if CI passes
- Keep `prod` fast-forward only from tested commits to preserve release traceability.

## Operator Release Workflow (Required)
Use this exact sequence on every machine/session:
1. Push changes to `staging`.
2. Run full local regression (`npm test`) or CI-parity equivalent.
3. Wait for `staging` fast-gate CI jobs to pass.
4. Publish/share staging preview link only after fast gate passes.
5. Obtain visual approval from staging preview.
6. Promote the exact approved commit from `staging` to `prod` (fast-forward only).
7. Wait for `prod` full-gate CI completion, then verify production deploy completion and live route health checks.

Rules:
- Do not share a staging preview link before tests are green.
- Do not promote any commit that differs from the tested/approved staging commit.
- If a deploy run stalls or is canceled by a higher-priority Pages request, re-trigger the same workflow run and continue with the same commit.

## Cross-Machine Handoff Protocol
- Canonical handoff file: `/docs/handoff/latest.md`.
- Every session that changes code, scripts, QA behavior, or release flow must overwrite `/docs/handoff/latest.md` with the latest state before ending work.
- The handoff file is intentionally single-entry and non-growing:
  - keep only the latest state
  - increment `Handoff Sequence` each time it is updated
  - rely on Git history for older handoffs rather than appending to one file
- Required startup step for any new machine/session:
  1. open `/README.md`
  2. open `/docs/handoff/latest.md`
  3. open `/docs/architecture/repo-contract.json`
  4. align local branch to the handoff commit/branch before edits
- If `/docs/handoff/latest.md` is missing or stale relative to actual code changes, treat the repo as unsafe to modify until handoff is updated and committed.
- Standard command to refresh handoff metadata:
```bash
npm run handoff:update
```

Required handoff content for cross-machine continuity:
- active branches (`staging`, `prod`) and head commits
- whether branches are aligned or divergent
- current staging preview URL and whether it is approved
- latest CI result summary (node/python/jest/playwright/deploy-gate)
- any known blockers, retries, or manual GitHub environment settings currently required

## Google Analytics Architecture
- Each canonical page provides exactly one GA metadata source via a measurement ID meta tag.
- `/scripts/runtime/ga4-bootstrap.js` is the single analytics bootstrap point.
- Inline GA bootstrap is forbidden.
- External bootstrap keeps analytics compatible with strict CSP and avoids `unsafe-inline` dependency.
- Guardrails enforce analytics correctness:
  - GA meta tag presence and uniqueness
  - Allowed GA IDs only
  - No inline GA snippets
  - Runtime request visibility checks

## Connect Form Delivery Contract
- `/connect/` form submission is handled client-side via EmailJS in `/scripts/runtime/contact-form-emailjs.js`.
- Email recipient target for website inquiries is `connect@romanbediner.com`.
- Recipient address must remain obfuscated in JavaScript and must not appear as plaintext in page HTML.
- EmailJS payload includes `to_email`, `to`, `recipient_email`, and `recipient` mapped to the same recipient to tolerate template-variable naming drift across account migrations.
- Anti-abuse protections (no CAPTCHA, static-site compatible):
  - honeypot field (`company`) blocks scripted autofill submissions
  - minimum time-to-submit gate (`>= 4` seconds from page load)
  - cooldown between accepted submissions (`>= 15` seconds)
  - client-side rate limits (`max 5/hour`, `max 25/day`) using `localStorage`
  - spam heuristics: minimum content length, URL stuffing detection, repeated-character detection, spam keyword detection
  - disposable email-domain deny list (extensible in script constants)
- Anti-abuse rejections use a generic message and do not expose internal rule details.
- Static-site limitation: these controls reduce abuse but cannot fully prevent hostile automation because enforcement is client-side and can be bypassed by advanced attackers.
- If EmailJS ownership/account changes, update `SERVICE_ID`, `TEMPLATE_ID`, and `PUBLIC_KEY` in `/scripts/runtime/contact-form-emailjs.js` and rerun QA.
- To tune spam filters after deployment:
  - update `SPAM_KEYWORDS` and `BLOCKED_EMAIL_DOMAINS` in `/scripts/runtime/contact-form-emailjs.js`
  - rerun `python3 -m unittest discover -s QA/tests -p test_contact_form.py -v`
  - rerun `npm run test:jest`

## Content Security Policy
- `script-src` must include approved sources only, including `'self'` and `https://www.googletagmanager.com`.
- `connect-src` must include Google Analytics endpoints required for event delivery.
- `unsafe-inline` in `script-src` is forbidden.
- CI enforces CSP contract through static checks and browser runtime tests that fail on CSP violations.

## Repository Structure
- Canonical page entrypoints:
  - `/index.html`
  - `/about/index.html`
  - `/services/index.html`
  - `/framework/index.html`
  - `/connect/index.html`
- Browser runtime scripts live in `/scripts/runtime`.
- QA and local runner scripts live in `/scripts/qa`.
- Release automation scripts live in `/scripts/release`.
- Content-generation scripts live in `/scripts/content`.
- Manual diagnostics live in `/scripts/diagnostics`.
- Automated tests live in `/QA/tests`.
- Jest policy/readme tests live in `/QA/tests/jest`.
- Generated QA and calibration outputs are consolidated under `/QA/results`.
- Legacy paths are disallowed.
- `.DS_Store` files are disallowed.
- Nested `.git` directories are disallowed.

## Directory Hygiene Rules
- Keep production assets under `/assets/*` and avoid duplicate root-level asset folders.
- Keep executable/runtime scripts under `/scripts`.
- Keep test definitions under `/QA/tests` only.
- Keep Jest unit/policy tests under `/QA/tests/jest`.
- Keep Playwright browser specs under `/QA/tests/playwright`.
- Keep generated test output out of root:
  - Playwright output: `/QA/results/playwright`
  - Calibration output: `/QA/results/h1-calibration`
- Remove stale local result folders such as `test-results` and `test-results (1)` before commit.
- Remove unused legacy folders when references are fully migrated.

## Icon Asset Management
- Production icon files must live only in page-scoped folders under `/assets/icons/`:
  - `/assets/icons/home/`
  - `/assets/icons/about/`
  - `/assets/icons/framework/`
  - `/assets/icons/services/`
  - `/assets/icons/connect/`
- `/assets/icons/` must not contain loose files; page folders are the only allowed entries.
- Unused or not-yet-promoted icons must live in the asset library at `/assets/asset-library/icons/`.
- Promotion workflow for new icons:
  1. add candidate icon to `/assets/asset-library/icons/`
  2. move it to `/assets/icons/<page-name>/` only when actively used on a live page
- Icons from imported grids must first be stored in `/assets/asset-library/icons/`, then promoted to page folders only when used.
- Unused icons must remain in the asset library.
- Framework stage icons are treated as production icons and must remain under `/assets/icons/framework/`.
- Framework icon display target is approximately `36px` to `40px` height.
- Framework card text width policy:
  - `.card-body` in `/styles/framework.css` uses `max-width: none` so long bullets (especially in Integration) do not wrap prematurely on desktop layouts.
- Framework stage icons use an optical vertical alignment offset (`top: -8px`) in `/styles/framework.css` to keep icon glyphs visually centered against stage pills.
- Stage-specific framework icon refinements are also codified in `/styles/framework.css`:
  - `#integration .framework-icon { top: -10px; }`
  - `#execution .framework-icon { top: -12px; }`
- Shared orb bullet image is centralized at `/assets/icons/home/bullet.png` and referenced from `styles/site.css`.
- Non-icon spare assets belong in purpose-driven asset-library folders:
  - `/assets/asset-library/concept-images/` for unused visual concepts/raster references
  - `/assets/asset-library/brand-sources/` for editable brand source files (e.g., PSD)

## Testing Philosophy
- Policy-as-code: architecture requirements are test-enforced, not convention-enforced.
- Invariants cover routing, metadata, analytics, CSP, DOM contracts, and repo hygiene.
- README contract validation is centralized in Jest under `/QA/tests/jest/readme_structure.test.js` and `/QA/tests/jest/readme_integrity.test.js`.
- Local README drift enforcement now uses commit-aware fallback logic (`git diff --name-only HEAD`) when branch-range diffs (`origin/staging...HEAD` or `origin/prod...HEAD`) and `HEAD~1...HEAD` are unavailable.
- CI README drift enforcement additionally falls back to `git show --pretty=\"\" --name-only HEAD` when shallow clone history prevents branch-range and `HEAD~1` diff resolution.
- README drift enforcement (Node + Jest) allows cache-bust-only route HTML edits (`?v=` asset query token changes) without requiring README updates.
- CI fails fast when contracts break to prevent production drift.

## Continuous Integration
- Node is pinned to version 20.
- Local development should use the same version via `.nvmrc`.
- Recommended operator tooling:
  - GitHub CLI (`gh`) for reliable workflow monitoring and reruns:
    - Install via Homebrew when available: `brew install gh`
    - If Homebrew is unavailable, install official release binary to `~/.local/bin/gh` and add `export PATH="$HOME/.local/bin:$PATH"` to `~/.zshrc`
- Recommended local setup:
```bash
nvm use
```
- If Node 20 is not installed yet:
```bash
nvm install
```
- Dependency install in CI uses `npm ci`.
- Playwright browser installation is required in CI.
- Local pre-push CI-parity uses an isolated temp mirror per run (`mktemp`) to avoid cloud-sync path lock collisions.
- CI auto-selects gate profile by branch/event:
  - `staging` push -> `fast` profile
  - `prod` push -> `full` profile
  - `workflow_dispatch` -> `full` profile
- CI is split into explicit guardrails and parallel validation jobs:
  - `session-ready`
  - `gate-profile`
  - `repo-contract`
  - `workflow-integrity`
  - `unit-tests`
  - `regression-tests`
  - `link-validation`
- Full profile-only jobs:
  - `qa-tests`
  - `browser-tests`
  - `lighthouse-validation`
  - `build-artifact`
- Production deployment is separate from validation and runs only on `push` to `prod`.
- `Deploy Pages` explicitly waits for matching prod `CI` success for the same SHA before artifact deploy, preventing branch-ambiguity when the same commit exists on multiple branches.
- The prod CI-wait step passes `GITHUB_TOKEN` to the monitor script for authenticated GitHub API polling and reliable rate-limit behavior in Actions runners.
- `Deploy Pages` checks out the exact source SHA before running monitor/build steps so release scripts are always available in runner workspace.
- Downstream deploy jobs (`post-deploy-validation`, `release-tag`) are guarded on successful deploy result.
- Post-deploy production validation runs as a dependent job against `https://romanbediner.com`.
- Lighthouse validation uses a median-of-3-attempts gate with retry delay to reduce one-off runner noise while preserving thresholds (`performance >= 85`, `accessibility >= 90`).
- Post-deploy production validation includes propagation-aware retries before failing release flow.
- Post-deploy production validation checks canonical route reachability directly (`/about/`, `/services/`, `/framework/`, `/connect/`) instead of assuming every route appears in homepage navigation HTML.
- Staging deployment publishes an isolated preview to a dedicated repository target (`rbediner/romanbediner-preview`) so production Pages state cannot be overwritten.
- Preview publication branch is fixed to `staging-preview` (not configurable) to prevent branch drift and accidental publication to preview `main`.
- Preview publisher now creates `staging-preview` even when preview content is unchanged versus preview `main`, preventing "missing branch" confusion on first hard-locked rollout.
- Staging preview workflow writes a clickable preview URL to both CI logs and GitHub Actions Job Summary.
- Preview artifacts always remove `CNAME` and enforce `robots.txt` no-index policy.
- Shared header nav runtime detects GitHub Pages preview hosts and prefixes canonical nav routes with the active preview base path so `Home` and primary navigation never escape preview scope; already-prefixed preview routes are intentionally left unchanged to prevent double-prefix URLs.
- Link validation (`scripts/qa/run-link-check.js`) is environment-aware:
  - when crawling local/staging targets, canonical production domain links are skipped to prevent false failures during staging-first route rollouts
  - when crawling production targets, canonical domain links remain validated
- Local CI-parity execution from cloud-synced paths is automatically mirrored to `/tmp` by `scripts/qa/run-ci-parity.sh` so Node installs and Jest reads do not stall on synced filesystem latency.
- `scripts/qa/run-ci-parity.sh` and `scripts/qa/run-in-local-mirror.sh` must retain the executable bit so the mirrored local runner can be invoked directly by release helpers and Husky-managed shell entrypoints.
- Playwright spec tests are executed through `scripts/qa/run-local-playwright-suite.sh`, which mirrors the repo to `/tmp` and runs against local Playwright package extracts to prevent cloud-synced filesystem read timeouts.
- Playwright defaults to parallel workers via `scripts/qa/run-local-playwright-suite.sh` (`--workers=50%`) unless a specific `--workers` value is explicitly passed.
- Release SOP mandate: Playwright regression execution must use at least 3 concurrent workers (`--workers>=3`) in CI-parity and release gates.
- Jest (30.x) is required as a direct dev dependency and is invoked through `/scripts/qa/run-jest-suite.js` to keep local/CI behavior deterministic.
- CI fails on:
  - CSP violations
  - GA misconfiguration
  - route/metadata contract violations
  - repository hygiene violations
  - documentation drift violations

## CLI Automation Bootstrap (Cross-Machine)
- Goal: allow Codex sessions to trigger/re-run workflows, monitor CI, and promote releases without manual GitHub UI steps.
- Required tools and auth on each machine:
  - GitHub CLI (`gh`) installed and available in `PATH`
  - `gh auth login` completed for `github.com` with `repo` and `workflow` scopes
  - Node 20 active (`nvm use`) for local CI parity
- Recommended install paths:
  - Homebrew install (preferred when available): `brew install gh`
  - Fallback local binary install: `~/.local/bin/gh`
- Ensure `gh` is on `PATH` for every shell profile used by Codex or terminal automation:
```bash
echo 'export PATH="$HOME/.local/bin:$PATH"' >> ~/.zshrc
source ~/.zshrc
```
- Verify availability and auth before release operations:
```bash
gh --version
gh auth status
```
- Fallback local binary install (macOS arm64, no Homebrew required):
```bash
mkdir -p "$HOME/.local/bin" "$HOME/.local/share/gh-install"
latest_tag=$(curl -fsSLI -o /dev/null -w '%{url_effective}' https://github.com/cli/cli/releases/latest | sed -E 's#.*/tag/##')
version="${latest_tag#v}"
archive="gh_${version}_macOS_arm64.zip"
url="https://github.com/cli/cli/releases/download/${latest_tag}/${archive}"
cd "$HOME/.local/share/gh-install"
curl -fL -o "$archive" "$url"
unzip -oq "$archive"
cp -f "gh_${version}_macOS_arm64/bin/gh" "$HOME/.local/bin/gh"
chmod +x "$HOME/.local/bin/gh"
```
- Ensure `gh` is on PATH (zsh):
```bash
echo 'export PATH="$HOME/.local/bin:$PATH"' >> "$HOME/.zshrc"
source "$HOME/.zshrc"
```
- Authenticate with required scopes:
```bash
gh auth login --web --scopes repo,workflow
```
- Required verification commands:
```bash
gh --version
gh auth status
npm ci
npm test
```
- Expected `gh auth status` contract for release automation:
  - active account is your repo owner/collaborator account
  - token scopes include `repo` and `workflow`
- Release-ops expectation:
  - If a CI/deploy workflow stalls, re-run failed jobs via CLI before asking operators to click through the UI.

## Cross-Machine Replication Checklist
Use this checklist whenever onboarding a new machine so dependencies, permissions, and release controls stay identical.

1. Install runtime dependencies
   - Node 20 via `nvm` (`nvm install && nvm use`)
   - npm lockfile install: `npm ci`
   - Playwright browser/runtime deps: `npx playwright install --with-deps`
   - Python 3.11 available for QA scripts (`python3 --version`)
2. Configure access and permissions
   - `gh auth login --web --scopes repo,workflow`
   - Verify access: `gh auth status`
   - Confirm repository remotes include `rbediner/romanbediner.com`
3. Validate environment parity
   - `npm test`
   - `npm run test:node`
   - `npm run test:links`
4. Validate release controls
   - Confirm `staging` is current integration branch and `prod` is deploy branch
   - Confirm staging preview publisher targets `rbediner/romanbediner-preview` branch `staging-preview`
   - Confirm GitHub Pages environment protection allows deploy branch being used
5. Confirm handoff integrity
   - Read `/docs/handoff/latest.md`
   - Ensure local branch/commit matches handoff before changes
   - Update handoff at session end if code/scripts/QA/release behavior changed

<!-- ENVIRONMENT_DIAGRAM_START -->
### RomanBediner.com Environment Flow
```mermaid
flowchart LR
  dev["Local Dev"]
  staging["Staging Branch"]
  ci["CI Validation"]
  artifact["Verified Artifact"]
  preview["Preview Repo Pages"]
  prod["Prod Branch"]
  pages["GitHub Pages"]
  live["romanbediner.com"]
  dev -->|"push"| staging
  staging -->|"run QA"| ci
  ci -->|"build + checksum"| artifact
  artifact -->|"publish preview"| preview
  artifact -->|"promote tested commit"| prod
  prod -->|"deploy"| pages
  pages -->|"serve"| live
```
<!-- ENVIRONMENT_DIAGRAM_END -->

## Technical Specification
1. **Routing architecture contract**
   - Folder-based canonical routes with trailing slashes.
   - No `.html` in public links.
   - Apex canonical domain requirement.

2. **GA initialization flow**
   - Page defines GA measurement meta tag.
   - `/scripts/runtime/ga4-bootstrap.js` reads the meta value.
   - Script loads GTM-hosted `gtag.js` and initializes analytics without inline JavaScript.

3. **CSP contract**
   - Strict `script-src` and `connect-src` allowlists.
   - No `unsafe-inline`.
   - Runtime CSP violations are treated as release blockers.

4. **Header/navigation consistency requirement**
   - Shared header DOM structure across canonical pages.
   - Navigation route model must be consistent across all canonical pages.

5. **Lockfile requirement**
   - `package-lock.json` is required and must stay in sync with `package.json`.

6. **Documentation drift enforcement**
   - Architecture-impacting code changes require `README.md` updates in the same change set.
   - README machine-readable JSON must remain synchronized with `docs/architecture/environment-model.json`.

7. **Required Node version**
   - Node 20 is required for local and CI parity.

8. **Required CI workflow structure**
   - `session-ready` gate runs first in CI and must pass before other jobs.
   - Repository contract and workflow integrity checks are mandatory.
   - Core QA lanes run in parallel where safe: node, python, jest, browser, lighthouse, and link validation.
   - CI builds one verified static artifact and enforces checksum integrity before deployment.
   - Lighthouse gate uses repeated attempts with median score evaluation to reduce flaky single-run variance.

9. **Staging and production deployment model**
   - `staging` deploys verified preview artifacts to isolated preview repo `rbediner/romanbediner-preview` on branch `staging-preview`.
   - Staging preview URL is `https://rbediner.github.io/romanbediner-preview/`.
   - `prod` deploys verified artifacts to GitHub Pages and then runs live-site post-deploy validation with retry/backoff for Pages propagation.
   - Production requires `CNAME` and remains pinned to `https://romanbediner.com`.

10. **Manual repository governance (outside code)**
   - Branch protections and required status checks are manual GitHub settings and are not modified by scripts/workflows.
   - Install dependencies via `npm ci`.
   - Install Playwright Chromium.
   - Execute node, python, jest, and Playwright checks through the dedicated CI job commands in `.github/workflows/ci.yml`.

9. **Standardized page transition blocks**
   - Primary narrative pages end with a shared transition component using the same structure and classes.
   - Transition flow architecture is: `Home -> About -> Services -> Insights -> Connect`.
   - Transition component styles are centralized in `styles/site.css` and must not be duplicated in page-level CSS.
   - Transition layer labels render in uppercase to keep taxonomy consistent across the narrative flow.
   - The semantic transition phrase remains in the DOM inside `.nav-title.sr-only` so search engines and screen readers retain the contextual handoff without showing duplicate visible copy.
   - The shared `.sr-only` utility in `styles/site.css` is the only approved way to visually hide transition titles while preserving accessibility and crawlability.

10. **Insights crawlability contract**
   - Insights brief content must remain present in the DOM for crawlability and semantic indexing.
   - The `hidden` attribute is intentionally not used on `.brief-content` panels because it suppresses content visibility to some crawlers.
   - Visual collapse is implemented with CSS state classes only: `.brief-content.collapsed` and `.brief-content.expanded`.
   - The visible card structure remains unchanged: title, bullet list, expand button, then full brief content.
   - `scripts/runtime/insights-toggle.js` toggles collapse classes and `aria-expanded` state without moving content or changing layout.

11. **Contextual internal link styling contract**
   - Contextual inline links may be added inside existing narrative copy to strengthen topical linking to canonical routes such as `/framework/`.
   - These links must use the shared `.semantic-inline-link` class in `styles/site.css` so crawlable anchors do not introduce visible color, underline, or typography drift.
   - Internal-link additions must preserve the original layout, spacing, and editorial presentation.

12. **About philosophy heading standard**
   - The philosophy card heading on `/about/` uses the canonical label `Operating Philosophy`.

13. **About professional arc timeline structure**
   - `/about/` professional arc content is wrapped by `.arc-timeline-wrapper` with a neutral grey structural spine rendered via `::before`.
   - Exactly three orbs are rendered (`.orb-1` through `.orb-3`) as CSS radial-gradient circles; spine layering is above orb center to create a bisected structural mark.
   - Orb alignment is computed dynamically in `/scripts/runtime/site-navigation.js` using arc item boundaries and CSS variables (`--orb1` to `--orb3`) with resize recalculation.
   - Timeline dividers are constrained to `.arc-item + .arc-item .arc-narrative` (right column only) so divider lines do not intersect the timeline spine.
   - Era subtitle labels use plain text without decorative bracket pseudo-elements.
   - Timeline spine and orbs are hidden at `max-width: 900px` to preserve mobile readability and layout stability.

14. **Connect page conversation section contract**
   - `/connect/` includes a dedicated `How we might connect` section above the form to frame the page as conversation-first rather than service-offering duplication.
   - Theme bullets in this section must use shared `.service-list` orb bullets from `styles/site.css` with `/assets/icons/home/bullet.png` (no page-level bullet redefinition).
   - Closing expectation lines are present and visually muted to keep the bullet themes as primary visual focus.

15. **Connect ambient polish contract**
   - Ambient decorative orbs on `/connect/` are CSS-only pseudo-elements (`.connect-main::before` and `.connect-main::after`) that use layered radial gradients, high blur, and a shared `floatOrb` animation for subtle ambient motion.
   - The ambient background wash is intentionally anchored near the hero (`circle at 78% 14%`) so lighting emphasis stays in the top composition and fades toward lower sections.
   - Hero title polish on `/connect/` uses subtle tightened tracking and line-height (`letter-spacing: -0.02em`, `line-height: 1.15`) without changing page structure.
   - Decorative layers remain behind content (`z-index` control plus container safety rules) and must never alter contact form structure, IDs, or handler behavior.
   - Mobile experience hides ambient orbs at `max-width: 768px` to preserve viewport clarity and form usability.
   - Connect page stylesheet can include a version query string (`/styles/connect.css?v=...`) to force immediate cache refresh after visual hotfixes.

16. **Global page-top spacing contract**
   - Header-to-content distance is controlled centrally in `styles/site.css` by `--page-top-spacing`.
   - Canonical main containers (`.page-main`, `.about-main`, `.services-main`, `.insights-main`, `.connect-main`, and `body > main`) inherit this token through a shared `padding-top` rule.
   - Page-level styles must not set independent top offsets for the first section on a canonical route.

17. **Connect hero icon transparency and mobile sizing contract**
   - `/connect/` hero icon uses a transparent-background asset at `/assets/icons/connect/contact-transparent.png` to prevent white-box rendering against ambient backgrounds.
   - The hero image preload and `<img>` source on `/connect/index.html` must reference the same transparent asset path.
   - Mobile styling keeps the icon centered above the headline with `max-width: 72px`, `display: block`, and `margin-left/right: auto` plus `margin-bottom: 16px`.

18. **Footer quote mobile readability contract**
   - Footer quote contrast is increased on mobile-only breakpoints (`max-width: 768px`) to preserve readability while keeping quote hierarchy secondary to body copy.
   - Mobile quote colors are fixed to `#6f6f6f` for `.footer-quote` and `#7a7a7a` for `.footer-quote-author`.
   - No layout, spacing, alignment, or typography changes are allowed when adjusting this contract.

## Machine-Readable Architecture Summary
```json
{
  "routes": [
    "/",
    "/about/",
    "/services/",
    "/connect/",
    "/framework/"
  ],
  "transitions": {
    "flow": [
      {
        "from": "/",
        "to": "/about/",
        "label": "THE EXECUTION LAYER",
        "title": "Transition to Operating Philosophy"
      },
      {
        "from": "/about/",
        "to": "/services/",
        "label": "THE OPERATING MODEL",
        "title": "Transition to Strategic Services"
      },
      {
        "from": "/services/",
        "to": "/framework/",
        "label": "THE STRATEGY LAYER",
        "title": "Transition to Strategic Insights"
      },
      {
        "from": "/framework/",
        "to": "/connect/",
        "label": "THE RELATIONSHIP LAYER",
        "title": "Transition to Connect"
      }
    ],
    "intent": "Guide a linear narrative from operating context to engagement."
  },
  "canonical_domain": "romanbediner.com",
  "requires_trailing_slash": true,
  "ga": {
    "meta_tag_required": true,
    "bootstrap_script": "/scripts/runtime/ga4-bootstrap.js",
    "inline_allowed": false
  },
  "csp": {
    "unsafe_inline_allowed": false,
    "required_script_src": [
      "self",
      "https://www.googletagmanager.com"
    ],
    "required_connect_src": [
      "https://www.google-analytics.com",
      "https://analytics.google.com",
      "https://www.google.com"
    ]
  },
  "ci": {
    "node_version": "20",
    "lockfile_required": true,
    "playwright_required": true,
    "readme_update_required_on_arch_change": true,
    "gate_profiles": {
      "staging": "fast",
      "prod": "full"
    },
    "full_gate_schedule": {
      "nightly_enabled": false,
      "reason": "Operator-selected: full gate runs on prod promotion, not nightly."
    }
  },
  "deployment": {
    "promotion_flow": [
      "staging",
      "preview",
      "prod"
    ],
    "environments": {
      "staging_preview": {
        "repo": "rbediner/romanbediner-preview",
        "branch": "staging-preview",
        "branch_configuration": {
          "source": "hard-locked in deploy-staging workflow",
          "current_configured_value": "staging-preview"
        },
        "url": "https://rbediner.github.io/romanbediner-preview/",
        "cname": false,
        "isolated_from_production": true,
        "preview_url_emission": [
          "workflow logs",
          "github job summary"
        ],
        "release_gate": {
          "required_tests_must_pass_before_preview_confirmation": true,
          "must_return_preview_url_with_pass_confirmation": true,
          "requires_visual_approval_before_prod_promotion": true
        }
      },
      "production": {
        "repo": "rbediner/romanbediner.com",
        "branch": "prod",
        "url": "https://romanbediner.com",
        "cname": true,
        "deploy_trigger": "push:prod with explicit CI success gate on matching SHA"
      }
    }
  }
}
```
## Local Development Instructions
- Node: `20.x`
- Install dependencies:
```bash
npm ci
```
- Install Playwright browser:
```bash
npx playwright install chromium
```
- Run architecture and regression tests:
```bash
npm test
```
- Run the descriptive full local QA entrypoint:
```bash
npm run qa:full-local
```
- Run Playwright with the default parallel worker profile:
```bash
bash scripts/qa/run-local-playwright-suite.sh
```
- Run CI-parity release checks locally:
```bash
npm run qa:ci-parity
```

## New Machine Bootstrap
Use this checklist when setting up a new workstation for this repository.

1. Install required runtimes and tools:
```bash
# Recommended on macOS: install NVM so local Node stays aligned with CI.
brew install nvm python@3.11 git
```
2. Clone repository and install Node dependencies:
```bash
git clone git@github.com:rbediner/romanbediner.com.git
cd romanbediner.com
nvm install
nvm use
npm ci
```
3. Install Python QA dependencies:
```bash
python3 -m pip install --upgrade pip
pip install playwright==1.58.0 pillow==11.3.0
python3 -m playwright install chromium
```
4. Ensure Husky hooks are installed (pre-push gate):
```bash
npm run prepare
```
5. Run the automated startup preflight before edits:
```bash
npm run session:ready
```
6. Verify local baseline:
```bash
npm run qa:ci-parity
```

`npm run session:ready` is the canonical startup command. It fails fast if Node does not match `.nvmrc`, the working tree is dirty, the current branch does not match the handoff branch, the local commit does not match `origin/staging`, or cloud-sync duplicate artifacts like `scripts 2/` are present.

## Deployment SOP (Standard Operating Procedure)
Release policy is deterministic and staging-first. Do not push directly to `prod` without the steps below.

1. Ensure branch and working tree are clean:
```bash
git checkout staging
git pull --ff-only origin staging
git status
```
2. Run CI-parity locally (same suites required by release gate):
```bash
npm run qa:ci-parity
```
3. Push `staging`, then monitor CI by SHA:
```bash
git push origin staging
node scripts/release/watch-ci-run.js --branch staging --sha "$(git rev-parse HEAD)"
```
   - Monitor resilience: `watch-ci-run.js` retries transient GitHub API failures (DNS, timeout, reset, 5xx) before failing.
4. Default assistant release behavior:
   - after local required QA passes, push to `staging` automatically
   - wait for `staging` fast-gate CI checks to complete successfully
   - then return an explicit pass confirmation plus the staging preview URL for visual sign-off
   - do not promote to `prod` until preview approval is given
5. Promote only the exact tested SHA to `prod` (fast-forward only):
```bash
git checkout prod
git pull --ff-only origin prod
git merge --ff-only <tested-sha>
git push origin prod
node scripts/release/watch-ci-run.js --branch prod --sha "<tested-sha>"
```
   - `prod` CI runs full gate automatically.
   - `Deploy Pages` starts only after successful `prod` CI completion.
6. Use the one-command release automation when possible:
```bash
npm run release:staging-prod
```

## Staging Preview
Staging preview is isolated from production and is published to a separate repository target.

Flow:
1. Push to `staging`.
2. `CI` workflow must complete successfully.
3. `Deploy Staging` workflow builds a preview artifact, removes `CNAME`, enforces preview `robots.txt` no-index policy, and publishes to preview repo.
4. Confirm required staging tests passed for the pushed SHA.
5. Provide the clickable staging preview URL from logs/Job Summary plus pass confirmation.
6. Review preview, then promote tested commit to `prod`.

Current preview target:
- Repo: `rbediner/romanbediner-preview`
- Branch: `staging-preview` (hard-locked in workflow)
- URL: `https://rbediner.github.io/romanbediner-preview/`

CNAME handling rules:
- Preview artifacts must not include `CNAME`.
- Production artifacts must include `CNAME` and deploy to `https://romanbediner.com`.

One-time manual setup (GitHub UI, do not automate in-repo):
1. Create repository `rbediner/romanbediner-preview`.
2. Enable Pages for preview repo.
3. Add secret `PREVIEW_REPO_TOKEN` in primary repo (`rbediner/romanbediner.com`).
4. Add repository variables:
   - `PREVIEW_REPO` = `rbediner/romanbediner-preview`
   - `PREVIEW_REPO_BRANCH` variable is no longer used (branch is hard-locked to `staging-preview`)
5. Scope token to preview repo only with minimum permissions (`contents: write`).
6. Optionally protect the configured preview branch if team policy requires it.

Token rotation procedure:
1. Create a new fine-grained token with preview-repo-only access.
2. Update `PREVIEW_REPO_TOKEN` repository secret.
3. Trigger staging deploy and confirm preview URL publishes successfully.
4. Revoke old token after successful validation.

## Manual GitHub Configuration Steps
These settings are intentionally manual and are not modified by scripts in this repository.

1. Branch protection for `staging`:
   - require CI status checks
   - restrict direct force pushes
2. Branch protection for `prod`:
   - require CI + deployment checks
   - restrict direct force pushes
3. Required status checks:
   - include CI contract and test jobs that gate promotion/deployment
4. Force-push restrictions:
   - keep force pushes disabled for `staging` and `prod`

## Architecture Session Start Rule
Before architecture implementation work, read these files in order:
1. `/README.md`
2. `/docs/handoff/latest.md`
3. `/docs/architecture/repo-contract.json`

Operator shortcut prompt for new Codex sessions:
- `session:start — read README + docs/handoff/latest, run session readiness, then run/verify staging deploy and give me the Staging Preview Ready URL.`

### Local Push Guard
- `.husky/pre-push` runs `npm run qa:ci-parity` automatically before any push.
- `npm` prepare runs `node scripts/release/install-local-husky-hooks.js`, which installs Husky hooks only in local Git worktrees and skips cleanly in CI.
- Emergency bypass (use only when explicitly approved): `SKIP_PREPUSH_QA=1 git push ...`
- Any bypass must be followed by a full local `npm run qa:ci-parity` and staging CI verification.

## Codex Permissions Model
Codex command elevation is governed by command-prefix approvals.

- Codex cannot run unrestricted elevated commands permanently.
- Best practice is approving stable prefixes (for example `git`, `curl -Ls`, `npm run ...`) so Codex can persist approvals beyond a single command.
- In Codex Desktop, approved command prefixes are stored and reused in future sessions depending local policy and environment controls.
- If a command falls outside approved prefixes, Codex must request a new permission prompt.
- Recommendation: pre-approve routine operational prefixes used in this repository to reduce interruptive prompts during CI triage and release operations.
- Local mirrored execution helper:
```bash
bash scripts/qa/run-in-local-mirror.sh npm run test:jest
```
- Override worker count when needed for debugging or stability:
```bash
bash scripts/qa/run-local-playwright-suite.sh --workers=1
```
- Run the complete local QA suite:
```bash
npm run qa:full-local
```
- Export a plain-text copy baseline for regression comparison:
```bash
node scripts/content/export-copy-baseline.js
```
- Serve locally (example):
```bash
python3 -m http.server 4173
```

Notes:
- `node_modules` is dependency cache created by `npm ci` for tests and scripts.
- `node_modules` is intentionally ignored by git and should remain local-only.
- If sync tools duplicate module folders (for example with suffixes like ` (1)`), delete `node_modules` and re-run `npm ci`.

## CLI Tooling Reference
Use this checklist when setting up a new computer for this repository.

Required tools:
- `git` - source control, branch and remote operations
- `node` (20.x) - JavaScript runtime for scripts and tests
- `npm` - dependency install and test orchestration (`npm ci`, `npm test`)
- `python3` (3.11 recommended) - Python QA and Playwright-backed unittest suite
- `npx playwright` - browser runtime used for CSP/GA and regression tests

Optional but useful:
- `ripgrep` (`rg`) - fast codebase search while debugging and auditing contracts

Version checks:
```bash
git --version
node --version
npm --version
python3 --version
npx playwright --version
rg --version
```

First-time machine setup:
```bash
npm ci
npx playwright install chromium
# Keep Python Playwright pinned to a published CI-compatible version.
python3 -m pip install playwright==1.58.0 pillow==11.3.0
python3 -m playwright install chromium
```

<!-- AUTO-GENERATED INSIGHT LINKS START -->
## FRAMEWORK STAGE DIRECT LINKS

<!-- AUTO-GENERATED INSIGHT LINKS END -->
