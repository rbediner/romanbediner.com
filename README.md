# romanbediner.com

Production static site for [romanbediner.com](https://romanbediner.com), deployed from `main` via GitHub Pages.

## Canonical Routes

- `/` -> `index.html`
- `/about/` -> `about/index.html`
- `/services/` -> `services/index.html`
- `/connect/` -> `connect/index.html`
- `/insights/` -> `insights/index.html`

Route policy:

- No runtime `/contact/`
- No runtime `/about/insights/`
- No runtime `/home/`
- No `.html` links in navigation

## Project Structure

- `/styles/site.css` shared architecture styles (header/nav consistency)
- `/styles/home.css`, `/styles/about.css`, `/styles/services.css`, `/styles/connect.css`, `/styles/insights.css` page styles
- `/styles.css` legacy stub pointing to `/styles/` architecture
- `/scripts/ga4.js` GA4 bootstrap logic
- `/scripts/` validation and utility scripts
- `/QA/tests/` automated guardrail tests
- `/QA/` QA cases and QA results documents

## Analytics (GA4)

- Measurement ID: `G-DVHD0KL633`
- Source of truth on each canonical page:
  - `<meta name="ga4-measurement-id" content="G-DVHD0KL633" />`
- Runtime bootstrap:
  - `<script src="/scripts/ga4.js" defer></script>`
  - `scripts/ga4.js` loads `gtag.js` asynchronously and initializes `gtag('config', id, { anonymize_ip: true })`
- Defensive behavior:
  - If the GA meta tag is missing, GA initialization exits silently.
  - Insights expand/collapse analytics tracking is covered by automated tests in `/tests/insights-analytics.test.js`.

Reference snippet file (not server-included on GitHub Pages):

- `/analytics/ga4.html`

## CSP Expectations

Canonical pages include CSP via meta tag with:

- `script-src` allowing `https://www.googletagmanager.com`
- `connect-src` allowing `https://www.google-analytics.com` and `https://analytics.google.com`
- No `unsafe-inline` in `script-src`

## SEO and Social

Each canonical page includes:

- `<title>`
- `<meta name="description">`
- canonical link
- Open Graph tags
- Twitter tags

Homepage includes Person JSON-LD. Insights includes Article JSON-LD entries.

## Positioning

Roman Bediner is positioned as an Operations & Transformation Leader focused on productizing execution systems for modern AI-enabled work.

Guidelines:

- **Homepage identity and thesis taxonomy**
  - `<title>`: `Roman Bediner | Operations & Transformation Leader`
  - `<h1>`: `Productizing Operations for Modern AI Enabled Work`
  - `<meta name="description">`: `Executive operator designing scalable operating models that align product, engineering, and customer systems.`
  - Keep a single `<title>`, a single `<meta name="description">`, and a single homepage `<h1>`.
- **Insights page structure**
  - `<title>`: `Insights on AI Enabled Operations | Roman Bediner`
  - Keep exactly one `<h1>` with value `Insights`.
  - Use the dedicated insights description focused on disciplined work systems.
- **Canonical discipline**
  - Keep exactly one canonical tag per canonical page.
  - Keep canonical URLs aligned to route architecture without introducing legacy paths.
- **Testing rules**
  - `QA/tests/test-metadata-consistency.js` verifies homepage title/description/H1, insights title, duplicate prevention, no em dashes in HTML, and one canonical per page.

## Testing

Node and Python tests are wired through npm scripts.

Run all checks:

```bash
npm ci
npm test
```

Browser runtime GA check (included in `npm test` on CI):

- `QA/tests/test_ga_runtime_playwright.py`
- Requires Playwright and Chromium

Visual regression and layout integrity checks (included in `npm test` on CI):

- `QA/tests/test_visual_regression_playwright.py`
- Compares committed baselines for Home, About, Services, Insights, and Connect
- Captures desktop full page (`1440px` width), desktop fold (`1200px` height), and mobile (`390px` width)
- Enforces navigation alignment, active-state stability, spacing guardrails, bullet consistency, Insights expand behavior, and mobile overflow rules

Refresh visual baselines intentionally:

```bash
npm run test:visual:update
```

Run only visual checks:

```bash
npm run test:visual
```

Run Node-only checks:

```bash
npm run test:node
```

Run Python-only checks:

```bash
npm run test:python
```

## CI

GitHub Actions workflow:

- File: `.github/workflows/ci.yml`
- Runs on push and pull_request
- Uses Node 20 and Python 3.11
- Installs Playwright Chromium for runtime GA verification
- Runs `npm ci` and `npm test`

## Deployment

1. Commit to `main`
2. Push to GitHub
3. GitHub Pages deploys from repository root
4. Validate canonical routes and metadata on live site

## Operating Philosophy Section Structure

- Header placement: `OPERATING PHILOSOPHY` sits at the top of the unified philosophy card with a single blue accent rule below it.
- Card behavior: the three philosophy blocks are wrapped in one `.card-philosophy` container with subtle default elevation and restrained hover lift.
- Divider rules: two `.philosophy-divider` lines separate the three blocks, using neutral gray only.
- Blue usage rule: blue is used only for the section accent rule and the micro-link, not structural dividers.
- Bullet sizing standard: shared `.service-list` bullets use `/icons/bullet.png` at `8px` by `8px` with `14px` right spacing.
- Insights linkage rule: the card ends with the micro-link `Explore related insights →` targeting `/insights/`.

<!-- AUTO-GENERATED INSIGHT LINKS START -->
## INSIGHT DIRECT LINKS

Productizing Operations for Modern AI-Enabled Work
https://romanbediner.com/insights/#productizing-operations-for-modern-ai-enabled-work

Operations as a Product
https://romanbediner.com/insights/#operations-as-a-product

AI as an Operating Layer
https://romanbediner.com/insights/#ai-as-an-operating-layer

<!-- AUTO-GENERATED INSIGHT LINKS END -->
