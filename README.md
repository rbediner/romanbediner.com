# romanbediner.com

Static production site for [romanbediner.com](https://romanbediner.com), published from `main` via GitHub Pages.

## System Overview

### Canonical routes

- `/` -> `index.html`
- `/about/` -> `about/index.html`
- `/services/` -> `services/index.html`
- `/insights/` -> `insights/index.html`
- `/connect/` -> `connect/index.html`

### Routing model

- Folder-based routing is the public URL contract.
- Public navigation must never link to `.html` files.
- Legacy paths such as `/home/`, `/contact/`, and `/about/insights/` are disallowed.
- Canonical URLs must always use trailing slashes.

### GitHub Pages assumptions

- Repository root serves static files directly.
- No server-side templating/includes at runtime.
- Navigation is injected by `/scripts/site-navigation.js` into static placeholders.

## Hosting Assumptions

- Fully static hosting (no backend dependency).
- CSP is enforced through HTML `<meta http-equiv="Content-Security-Policy">`.
- Analytics bootstrap is externalized via `/scripts/ga4.js`.
- Inline script bootstraps are forbidden because they break CSP hardening.

## Analytics Architecture

### GA contract

- Each canonical page must contain exactly one:
  - `<meta name="ga4-measurement-id" content="G-DVHD0KL633" />`
  - `<script src="/scripts/ga4.js" defer></script>`

### Bootstrap behavior

- `/scripts/ga4.js` reads measurement ID from the meta tag.
- It asynchronously loads `https://www.googletagmanager.com/gtag/js`.
- It initializes `gtag('config', id, { anonymize_ip: true })`.

### Security constraints

- Inline `gtag`, inline `dataLayer` setup, and inline GA config are disallowed.
- Runtime GA and CSP behavior is validated by automated Playwright tests in CI.

## CSP Policy Definition

### Required `script-src` origins

- `'self'`
- `https://www.googletagmanager.com`
- `https://cdn.jsdelivr.net`
- `https://cdn.quilljs.com`
- `https://www.emailjs.com`

### Required `connect-src` origins

- `https://www.google-analytics.com`
- `https://analytics.google.com`
- `https://api.emailjs.com`

### Never allow

- `unsafe-inline` inside `script-src`
- Inline script tags for runtime logic/analytics bootstrapping
- Unapproved GA IDs

## Testing Invariants

### CI-enforced contracts

- Canonical URLs and OG URL parity
- CSP presence and `script-src` hardening
- GA meta/bootstrap uniqueness and no inline GA code
- Header DOM consistency across canonical pages
- No `.DS_Store`, no nested `.git`, no legacy `/home/` references
- Shared typography and spacing guardrails
- Insights analytics event payload contracts
- README drift detection for architectural changes
- Runtime Playwright checks for:
  - Home H1 alignment contract
  - Home vs Connect H1 inheritance parity
  - CSP violation detection in browser console
  - GA loader + collect request visibility on canonical routes

### What failing tests prevent

- Silent CSP breakages in production
- Analytics outages caused by bootstrap drift
- Route/canonical regressions
- Documentation drift during architecture changes
- Repo hygiene issues that destabilize CI/deploy workflows

## Local Development

### Environment

- Node.js `20.x` (matches CI)
- Python `3.11` for Python QA suite

### Setup

```bash
npm ci
npx playwright install chromium
python3 -m pip install playwright==1.58.2 pillow==11.3.0
python3 -m playwright install chromium
```

### Run locally

Serve static files from repo root (example):

```bash
python3 -m http.server 4173
```

### Run tests

```bash
# Full architecture + QA contract checks
npm run test:qa-full

# Playwright browser suite
npm run test:playwright

# Combined CI-equivalent flow
npm test
```

### H1 calibration utility

If Home hero geometry changes:

```bash
npm run calibrate:h1
```

This updates `--h1-size-desktop` in `/styles/site.css` by measured browser geometry. Do not hand-tune per page.

## Migration Off GitHub Pages

### GitHub Pages-specific assumptions

- Root-level static publish behavior
- Folder route resolution by static `index.html`
- No runtime server rewrite logic

### Must preserve on any host

- Clean folder routes and trailing-slash canonical URLs
- Canonical + OG URL alignment
- CSP policy and runtime CSP cleanliness
- GA architecture (`ga4-measurement-id` + `/scripts/ga4.js`)
- No inline scripts for runtime bootstrapping

### Migration targets

#### S3 + CloudFront

- Configure default root object and per-folder `index.html` behavior.
- Add redirect/rewrite rules for clean routes.
- Preserve headers/CSP and cache policy for HTML vs assets.

#### Vercel

- Map folder routes cleanly in static output.
- Keep canonical URLs unchanged.
- Preserve CSP in HTML meta and verify runtime console is clean.

#### Netlify

- Ensure static route handling keeps trailing slash behavior.
- Avoid transform/inject features that alter CSP or GA tags.
- Validate runtime GA + CSP tests after deploy.

#### Traditional server (Nginx/Apache)

- Add explicit rewrite rules for folder routes.
- Serve `index.html` for canonical folders only.
- Preserve CSP and external script loading behavior.

## Documentation Drift Policy

- Any commit touching architecture-relevant paths must update `README.md`.
- Enforced by `QA/tests/test-readme-drift.js`.
- Failure message:
  - `Architectural changes require README update.`

## Typography Architecture Rules

- Global typography tokens live in `/styles/site.css`.
- Page styles must not define global `h1` font-size overrides.
- Global H1 tokens:
  - `--h1-size-desktop`
  - `--h1-size-mobile`
- Runtime inheritance is verified between Home and Connect in Playwright.

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
