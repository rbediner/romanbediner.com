# romanbediner.com

Production static site for [romanbediner.com](https://romanbediner.com), deployed from `main` via GitHub Pages.

## Site Architecture

Canonical routes:

- `/` -> `/index.html`
- `/about/` -> `/about/index.html`
- `/services/` -> `/services/index.html`
- `/connect/` -> `/connect/index.html`
- `/about/insights/` -> `/about/insights/index.html`

Content and support directories:

- `/assets/` static media and brand assets
- `/partials/ga4.html` GA4 snippet source-of-truth
- `/scripts/` validation and utility scripts
- `/tests/` automated QA checks

## Clean URL Strategy

The site uses folder-based clean URLs with `index.html` per route.

Rules:

- No `.html` links in navigation
- No runtime `/contact/` route
- No runtime root `/insights/` route
- Insights is intentionally nested under About: `/about/insights/`

## SEO Strategy

Each canonical page includes:

- unique `<title>`
- `<meta name="description">`
- `<link rel="canonical">`
- Open Graph (`og:*`) tags
- Twitter tags

Homepage also includes `Person` JSON-LD.
Insights includes `Article` JSON-LD entries for all three briefs.

## Open Graph and Social Preview

Shared social image:

- `https://romanbediner.com/assets/og-logo/og.png`

All canonical pages include explicit:

- `og:type`, `og:title`, `og:description`, `og:url`
- `og:image`, `og:image:type`, `og:image:width`, `og:image:height`
- `twitter:card`, `twitter:title`, `twitter:description`, `twitter:image`

## Analytics (GA4)

- Measurement ID: `G-DVHD0KL633`
- Snippet source: `/partials/ga4.html`
- Installed in `<head>` on all canonical routes:
  - `/`
  - `/about/`
  - `/services/`
  - `/connect/`
  - `/about/insights/`

Verification:

1. GA Realtime in Google Analytics
2. Browser DevTools Network filter: `collect`
3. Local script check: `node scripts/verify_ga4_id.js`

Note: ad blockers/privacy extensions can block GA requests locally.

## Insights Architecture

- Path: `/about/insights/`
- Navigation: not in main nav
- Discovery: linked from About page content (`Selected Briefs` section)
- Indexing: included in sitemap

## Sitemap and Robots

- `sitemap.xml` contains only canonical routes:
  - `/`
  - `/about/`
  - `/services/`
  - `/connect/`
  - `/about/insights/`
- `robots.txt`:
  - `User-agent: *`
  - `Allow: /`
  - `Sitemap: https://romanbediner.com/sitemap.xml`

## Scripts

- `scripts/generate-sitemap.js` updates `sitemap.xml`
- `scripts/validate-links.js` checks clean URLs + route policy + GA consistency
- `scripts/verify_ga4_id.js` enforces GA ID and duplicate checks
- `scripts/check_og_urls.sh` validates OG image references on canonical pages
- `scripts/diagnose_pages.py` reports route/config issues

## Tests

- `tests/test-clean-urls.js`
- `tests/test-canonical.js`
- `tests/test-meta.js`
- `tests/test-schema.js`
- `tests/test-ga4-installation.js`
- `tests/test_contact_form.py`

## Deployment

1. Commit changes to `main`
2. Push to GitHub
3. GitHub Pages deploys automatically from repo root
4. Validate canonical routes, metadata, and analytics on live site
