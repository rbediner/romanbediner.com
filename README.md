# romanbediner.com

Production static site for [https://romanbediner.com](https://romanbediner.com), deployed from `main` via GitHub Pages with a custom domain.

## Site Architecture

- `/index.html`: Homepage
- `/about/index.html`: About page (clean URL `/about/`)
- `/services/index.html`: Services page (clean URL `/services/`)
- `/connect/index.html`: Contact experience page
- `/contact/index.html`: Canonical clean Contact path (`/contact/`) redirecting to `/connect/`
- `/insights/index.html`: Indexable long-form authority page (not linked in main nav)
- `/assets/`: Static assets (logos, icons, photos, OG image)
- `/scripts/`: Utility scripts and browser JavaScript
- `/tests/`: Node and Python validation tests

Compatibility redirects are kept at:

- `/about.html` -> `/about/`
- `/services.html` -> `/services/`
- `/contact.html` -> `/contact/`

## Clean URL Strategy

The site uses folder-based URLs with `index.html` files per route. This avoids `.html` in navigation and keeps canonical paths stable.

Canonical URLs:

- `https://romanbediner.com/`
- `https://romanbediner.com/about`
- `https://romanbediner.com/services`
- `https://romanbediner.com/contact`
- `https://romanbediner.com/insights`

## SEO Strategy

Each primary page includes:

- Unique `<title>`
- Unique `<meta name="description">`
- Canonical URL
- Open Graph tags
- Twitter card tags
- Geo metadata (`US-NC`, `Raleigh-Durham-Chapel Hill`)

Homepage additionally includes:

- `Person` JSON-LD structured data with `knowsAbout`
- Hidden semantic authority expansion block (non-visual)

## Open Graph and Social Preview

Shared OG image:

- `https://romanbediner.com/assets/og-logo/og.png`

Every page includes explicit:

- `og:type`, `og:title`, `og:description`, `og:url`
- `og:image`, `og:image:type`, `og:image:width`, `og:image:height`
- `twitter:card`, `twitter:title`, `twitter:description`, `twitter:image`

## Analytics (GA4)

All clean-URL pages include a GA4 script placeholder in `<head>`:

- `G-XXXXXXXXXX`

Update this value on each page with the production Measurement ID.

## Sitemap and Robots

- `sitemap.xml` includes `/`, `/about/`, `/services/`, `/contact/`
- `robots.txt` allows crawling and points to sitemap:
  - `Sitemap: https://romanbediner.com/sitemap.xml`

## Scripts

- `scripts/generate-sitemap.js`: regenerates `sitemap.xml` with current date
- `scripts/validate-links.js`: verifies navigation avoids `.html` links
- `scripts/site-navigation.js`: shared mobile nav interaction
- `scripts/contact-form-emailjs.js`: contact form behavior and EmailJS handling

## QA Documentation

QA coverage is tracked in dedicated files:

- `QA_TEST_CASES.md`
- `QA_TEST_RESULTS.md`

## How to Update Sitemap

1. Add or remove route entries in `scripts/generate-sitemap.js`.
2. Run:
   ```bash
   node scripts/generate-sitemap.js
   ```
3. Commit updated `sitemap.xml`.

## How to Add a New Page

1. Create `/new-page/index.html`.
2. Add page-level SEO metadata (title, description, OG/Twitter, canonical).
3. Add the route to `scripts/generate-sitemap.js` if indexable.
4. Update navigation only if it is intended to be promoted.
5. Run tests and fix failures.

## Deployment Instructions

1. Commit changes to `main`.
2. Push to GitHub.
3. GitHub Pages deploys from repository root on `main`.
4. Validate live URLs and metadata after deployment.

## Domain Setup

- `CNAME` file is set to `romanbediner.com`.
- DNS should point custom domain to GitHub Pages.
- HTTPS should be enforced in repository Pages settings.

## QA Checklist

- [ ] All links use clean URLs
- [ ] No `.html` visible in navigation
- [ ] Canonicals point to clean URLs
- [ ] `sitemap.xml` loads successfully
- [ ] `robots.txt` loads successfully
- [ ] JSON-LD validates in Google Rich Results test
- [ ] No broken internal links
- [ ] HTTPS enforced
- [ ] GA4 script loads with production Measurement ID

## SEO Metadata Normalization Update

Date: 2026-02-16

### Summary

- Normalized metadata casing and phrasing across all SEO surfaces.
- Enforced authoritative core phrase:
  - `Productizing operations for modern, AI-enabled work`
- Standardized meta description, Open Graph description, and Twitter description content format across primary pages.
- Removed trailing-slash canonical variants for non-root pages.
- Updated Contact canonical strategy to clean path: `https://romanbediner.com/contact`.
- Updated homepage JSON-LD description casing and phrase alignment.

### Files Modified

- `index.html`
- `about/index.html`
- `services/index.html`
- `connect/index.html`
- `insights/index.html`
- `about.html`
- `services.html`
- `contact.html`
- `contact/index.html`
- `sitemap.xml`
- `scripts/generate-sitemap.js`
- `tests/test-canonical.js`
- `tests/test-meta.js`
- `README.md`

### Search/Replace Logic Used

- Audited all HTML files for:
  - `<meta name="description">`
  - `og:description`, `twitter:description`
  - `og:title`, `twitter:title`
  - `<title>`
  - `<link rel="canonical">`
  - JSON-LD `"description"`, `"name"`, `"headline"`
- Replaced inconsistent description strings with the normalized sentence-case standard.
- Verified no typo variants (including `PRODUCITZING`) exist.

### Canonical URL Changes

- Home: `https://romanbediner.com/` (unchanged)
- About: `https://romanbediner.com/about`
- Services: `https://romanbediner.com/services`
- Contact: `https://romanbediner.com/contact`
- Insights: `https://romanbediner.com/insights`

### Metadata Standard Adopted

- Description standard (meta + OG + Twitter):
  - `Productizing operations for modern, AI-enabled work — Executive operator designing AI-enabled operating models that align product, engineering, and customer systems.`
- No ALL CAPS metadata values.
- No typo variants.
- AI-enabled remains hyphenated.

### QA Tracking

QA test case definitions and execution results are maintained outside this README in:

- `QA_TEST_CASES.md`
- `QA_TEST_RESULTS.md`
