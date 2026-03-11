# RomanBediner.com

## System Overview
- Executive operating website for Roman Bediner, focused on productizing operations for modern AI-enabled work.
- Static-first architecture with deterministic HTML, CSS, and JavaScript assets.
- Folder-based routing where each canonical URL resolves to a folder `index.html` file.
- Security-first posture with CSP enforcement and runtime policy validation.
- Analytics architecture is centralized, CSP-compatible, and validated by tests.

## Canonical Route Architecture
Canonical public routes:
- `/`
- `/about/`
- `/services/`
- `/connect/`
- `/insights/`

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
- Production publish flow uses GitHub Actions deployment from the `prod` branch (`.github/workflows/deploy-pages.yml`).
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
  3. GitHub Actions deploys Pages from `prod`
- Keep `prod` fast-forward only from tested commits to preserve release traceability.

## Google Analytics Architecture
- Each canonical page provides exactly one GA metadata source via a measurement ID meta tag.
- `/scripts/ga4.js` is the single analytics bootstrap point.
- Inline GA bootstrap is forbidden.
- External bootstrap keeps analytics compatible with strict CSP and avoids `unsafe-inline` dependency.
- Guardrails enforce analytics correctness:
  - GA meta tag presence and uniqueness
  - Allowed GA IDs only
  - No inline GA snippets
  - Runtime request visibility checks

## Connect Form Delivery Contract
- `/connect/` form submission is handled client-side via EmailJS in `/scripts/contact-form-emailjs.js`.
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
- If EmailJS ownership/account changes, update `SERVICE_ID`, `TEMPLATE_ID`, and `PUBLIC_KEY` in `/scripts/contact-form-emailjs.js` and rerun QA.
- To tune spam filters after deployment:
  - update `SPAM_KEYWORDS` and `BLOCKED_EMAIL_DOMAINS` in `/scripts/contact-form-emailjs.js`
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
  - `/insights/index.html`
  - `/connect/index.html`
- JavaScript runtime and automation scripts live in `/scripts`.
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

## Testing Philosophy
- Policy-as-code: architecture requirements are test-enforced, not convention-enforced.
- Invariants cover routing, metadata, analytics, CSP, DOM contracts, and repo hygiene.
- README contract validation is centralized in Jest under `/QA/tests/jest/readme_structure.test.js` and `/QA/tests/jest/readme_integrity.test.js`.
- Local README drift enforcement now uses commit-aware fallback logic (`git diff --name-only HEAD`) when branch-range diffs (`origin/staging...HEAD` or `origin/prod...HEAD`) and `HEAD~1...HEAD` are unavailable, and only skips when git history is genuinely unavailable.
- README drift enforcement (Node + Jest) allows cache-bust-only route HTML edits (`?v=` asset query token changes) without requiring README updates.
- CI fails fast when contracts break to prevent production drift.

## Continuous Integration
- Node is pinned to version 20.
- Dependency install in CI uses `npm ci`.
- Playwright browser installation is required in CI.
- CI is split into parallel jobs:
  - `qa-node` (`npm run test:node`)
  - `qa-python` (`npm run test:python`)
  - `qa-jest` (`npm run test:jest`)
  - `qa-playwright` (`npm run test:playwright -- --workers=3`)
- A final `deploy-gate` job depends on all QA jobs and is the required branch-protection status for release readiness.
- Production deployment is separate from validation and runs only on pushes to `prod`.
- Playwright spec tests are executed through `scripts/run-playwright-local.sh`, which mirrors the repo to `/tmp` and runs against local Playwright package extracts to prevent cloud-synced filesystem read timeouts.
- Playwright defaults to parallel workers via `scripts/run-playwright-local.sh` (`--workers=50%`) unless a specific `--workers` value is explicitly passed.
- Release SOP mandate: Playwright regression execution must use at least 3 concurrent workers (`--workers>=3`) in CI-parity and release gates.
- Jest (30.x) is required as a direct dev dependency and is invoked through `/scripts/run-jest-suite.js` to keep local/CI behavior deterministic.
- CI fails on:
  - CSP violations
  - GA misconfiguration
  - route/metadata contract violations
  - repository hygiene violations
  - documentation drift violations

## Technical Specification
1. **Routing architecture contract**
   - Folder-based canonical routes with trailing slashes.
   - No `.html` in public links.
   - Apex canonical domain requirement.

2. **GA initialization flow**
   - Page defines GA measurement meta tag.
   - `/scripts/ga4.js` reads the meta value.
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

7. **Required Node version**
   - Node 20 is required for local and CI parity.

8. **Required CI workflow structure**
   - Install dependencies via `npm ci`.
   - Install Playwright Chromium.
   - Execute node, python, jest, and Playwright checks through `npm test`.

9. **Standardized page transition blocks**
   - Primary narrative pages end with a shared transition component using the same structure and classes.
   - Transition flow architecture is: `Home -> About -> Services -> Insights -> Connect`.
   - Transition component styles are centralized in `styles/site.css` and must not be duplicated in page-level CSS.

10. **Insights crawlability contract**
   - Insights brief content must remain present in the DOM for crawlability and semantic indexing.
   - The `hidden` attribute is intentionally not used on `.brief-content` panels because it suppresses content visibility to some crawlers.
   - Visual collapse is implemented with CSS state classes only: `.brief-content.collapsed` and `.brief-content.expanded`.
   - The visible card structure remains unchanged: title, bullet list, expand button, then full brief content.
   - `scripts/insights-toggle.js` toggles collapse classes and `aria-expanded` state without moving content or changing layout.

11. **Contextual internal link styling contract**
   - Contextual inline links may be added inside existing narrative copy to strengthen topical linking to canonical routes such as `/insights/`.
   - These links must use the shared `.semantic-inline-link` class in `styles/site.css` so crawlable anchors do not introduce visible color, underline, or typography drift.
   - Internal-link additions must preserve the original layout, spacing, and editorial presentation.

12. **About philosophy heading standard**
   - The philosophy card heading on `/about/` uses the canonical label `Operating Philosophy`.

13. **About professional arc timeline structure**
   - `/about/` professional arc content is wrapped by `.arc-timeline-wrapper` with a neutral grey structural spine rendered via `::before`.
   - Exactly four orbs are rendered (`.orb-1` through `.orb-4`) using `/assets/icons/timeline-orb.png`; spine layering is above orb center to create a bisected structural mark.
   - Orb alignment is computed dynamically in `/scripts/site-navigation.js` using arc item boundaries and CSS variables (`--orb1` to `--orb4`) with resize recalculation.
   - Timeline dividers are constrained to `.arc-item + .arc-item .arc-narrative` (right column only) so divider lines do not intersect the timeline spine.
   - Era subtitle labels use plain text without decorative bracket pseudo-elements.
   - Timeline spine and orbs are hidden at `max-width: 900px` to preserve mobile readability and layout stability.

14. **Connect page conversation section contract**
   - `/connect/` includes a dedicated `How we might connect` section above the form to frame the page as conversation-first rather than service-offering duplication.
   - Theme bullets in this section must use shared `.service-list` orb bullets from `styles/site.css` with `/assets/icons/bullet.png` (no page-level bullet redefinition).
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
   - `/connect/` hero icon uses a transparent-background asset at `/assets/icons/contact-transparent.png` to prevent white-box rendering against ambient backgrounds.
   - The hero image preload and `<img>` source on `/connect/index.html` must reference the same transparent asset path.
   - Mobile styling keeps the icon centered above the headline with `max-width: 72px`, `display: block`, and `margin-left/right: auto` plus `margin-bottom: 16px`.

## Machine-Readable Architecture Summary
```json
{
  "routes": ["/", "/about/", "/services/", "/connect/", "/insights/"],
  "transitions": {
    "flow": [
      {"from": "/", "to": "/about/", "label": "THE EXECUTION LAYER", "title": "Transition to Operating Philosophy"},
      {"from": "/about/", "to": "/services/", "label": "The Execution Layer", "title": "Transition to Strategic Services"},
      {"from": "/services/", "to": "/insights/", "label": "The Strategy Layer", "title": "Transition to Strategic Insights"},
      {"from": "/insights/", "to": "/connect/", "label": "THE RELATIONSHIP LAYER", "title": "Transition to Connect"}
    ],
    "intent": "Guide a linear narrative from operating context to engagement."
  },
  "canonical_domain": "romanbediner.com",
  "requires_trailing_slash": true,
  "ga": {
    "meta_tag_required": true,
    "bootstrap_script": "/scripts/ga4.js",
    "inline_allowed": false
  },
  "csp": {
    "unsafe_inline_allowed": false,
    "required_script_src": ["self", "https://www.googletagmanager.com"],
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
    "readme_update_required_on_arch_change": true
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
- Run Playwright with the default parallel worker profile (same behavior used by `npm test`):
```bash
bash scripts/run-playwright-local.sh
```
- Run CI-parity release checks locally:
```bash
npm run qa:ci-parity
```

## New Machine Bootstrap
Use this checklist when setting up a new workstation for this repository.

1. Install required runtimes and tools:
```bash
# macOS example (Homebrew)
brew install node@20 python@3.11 git
```
2. Clone repository and install Node dependencies:
```bash
git clone git@github.com:rbediner/romanbediner.com.git
cd romanbediner.com
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
5. Verify local baseline:
```bash
npm run qa:ci-parity
```

## Deployment SOP (Standard Operating Procedure)
Release policy is deterministic and staging-first. Do not push directly to `prod` without the steps below.

1. Ensure branch and working tree are clean:
```bash
git checkout staging
git pull origin staging
git status
```
2. Run CI-parity locally (same suites required by release gate):
```bash
npm run qa:ci-parity
```
3. Push `staging`, then monitor CI by SHA:
```bash
git push origin staging
node scripts/monitor-ci-run.js --branch staging --sha "$(git rev-parse HEAD)"
```
4. Promote only the exact tested SHA to `prod` (fast-forward only):
```bash
git checkout prod
git pull origin prod
git merge --ff-only <tested-sha>
git push origin prod
node scripts/monitor-ci-run.js --branch prod --sha "<tested-sha>"
```
5. Use the one-command release automation when possible:
```bash
npm run release:staging-prod
```

### Local Push Guard
- `.husky/pre-push` runs `npm run qa:ci-parity` automatically before any push.
- Emergency bypass (use only when explicitly approved): `SKIP_PREPUSH_QA=1 git push ...`
- Any bypass must be followed by a full local `npm run qa:ci-parity` and staging CI verification.

## Codex Permissions Model
Codex command elevation is governed by command-prefix approvals.

- Codex cannot run unrestricted elevated commands permanently.
- Best practice is approving stable prefixes (for example `git`, `curl -Ls`, `npm run ...`) so Codex can persist approvals beyond a single command.
- In Codex Desktop, approved command prefixes are stored and reused in future sessions depending local policy and environment controls.
- If a command falls outside approved prefixes, Codex must request a new permission prompt.
- Recommendation: pre-approve routine operational prefixes used in this repository to reduce interruptive prompts during CI triage and release operations.
- Override worker count when needed for debugging or stability:
```bash
bash scripts/run-playwright-local.sh --workers=1
```
- Run all local QA checks from any directory (recommended operator entrypoint):
```bash
cd "/Users/roman.bediner/Library/CloudStorage/GoogleDrive-rbediner@gmail.com/My Drive/AI/Codex/romanbediner.com" && ./scripts/run-all-qa.sh
```
- Export a plain-text copy baseline for regression comparison:
```bash
node scripts/export-copy-baseline.js
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
## INSIGHT DIRECT LINKS

Productizing Operations for Modern AI-Enabled Work
https://romanbediner.com/insights/#productizing-operations-ai-enabled-work

Operations as a Product for Scalable Execution
https://romanbediner.com/insights/#operations-as-a-product-scalable-execution

Integrating AI as an Operating Layer
https://romanbediner.com/insights/#ai-as-an-operating-layer

Steering Execution with Operational Signals
https://romanbediner.com/insights/#steering-execution-with-operational-signals

Designing Adaptive Guardrails for Agentic Work
https://romanbediner.com/insights/#designing-adaptive-guardrails-for-agentic-work

<!-- AUTO-GENERATED INSIGHT LINKS END -->
