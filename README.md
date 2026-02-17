# romanbediner.com

Production static site for [romanbediner.com](https://romanbediner.com), deployed from `main` via GitHub Pages.

## Canonical Routes

- `/` -> `index.html`
- `/about/` -> `about/index.html`
- `/services/` -> `services/index.html`
- `/connect/` -> `connect/index.html`
- `/about/insights/` -> `about/insights/index.html`

Route policy:

- No runtime `/contact/`
- No runtime root `/insights/`
- No runtime `/home/`
- No `.html` links in navigation

## Project Structure

- `/styles/site.css` shared architecture styles (header/nav consistency)
- `/styles/home.css`, `/styles/about.css`, `/styles/services.css`, `/styles/connect.css`, `/styles/insights.css` page styles
- `/styles.css` legacy stub pointing to `/styles/` architecture
- `/scripts/ga4.js` GA4 bootstrap logic
- `/scripts/` validation and utility scripts
- `/tests/` automated guardrail tests
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

## Testing

Node and Python tests are wired through npm scripts.

Run all checks:

```bash
npm ci
npm test
```

Browser runtime GA check (included in `npm test` on CI):

- `tests/test_ga_runtime_playwright.py`
- Requires Playwright and Chromium

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
