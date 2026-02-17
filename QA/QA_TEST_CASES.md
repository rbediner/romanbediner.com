# QA Test Cases

## Route and URL Integrity

1. Clean URL navigation
- File: `tests/test-clean-urls.js`
- Asserts no `.html` links in nav blocks.
- Asserts no `/contact/` or root `/insights/` nav links.

2. Canonical route existence policy
- File: `tests/test-clean-urls.js`
- Asserts `/about/insights/index.html` exists.
- Asserts `contact/index.html` does not exist.
- Asserts `insights/index.html` does not exist.

3. About-only insights linking
- File: `tests/test-clean-urls.js`
- Asserts About page includes `/about/insights/` in content.
- Asserts `/about/insights/` does not appear in main desktop nav.

## Metadata and SEO

4. Canonical + OG URL alignment
- File: `tests/test-canonical.js`
- Asserts canonical URL per canonical page.
- Asserts `og:url` equals canonical URL.
- Asserts CSP `script-src` does not include `unsafe-inline`.

5. Title + description + social consistency
- File: `tests/test-meta.js`
- Asserts each canonical page has title and meta description.
- Asserts OG/Twitter descriptions match meta description.
- Asserts no `/contact/` references in metadata.

6. Structured data coverage
- File: `tests/test-schema.js`
- Asserts homepage includes valid Person JSON-LD.
- Asserts insights page includes 3 valid Article JSON-LD entries.

7. Favicon asset coverage and page references
- File: `tests/test-favicon.js`
- File: `tests/test_favicon_assets.py`
- Asserts required favicon files exist in `assets/favicon/`.
- Asserts each route references favicon `32x32`, `16x16`, Apple touch icon, and `.ico` fallback with correct relative paths.

## Analytics

8. GA4 installation across canonical pages
- File: `tests/test-ga4-installation.js`
- Asserts one `ga4-measurement-id` meta tag exists per canonical page.
- Asserts one `/scripts/ga4.js` include exists per canonical page.
- Asserts no inline `gtag('config'...)` blocks remain.
- Asserts no unexpected GA measurement IDs exist.

9. Repository-wide GA4 ID enforcement
- File: `scripts/verify_ga4_id.js`
- Scans all HTML files.
- Fails if any GA ID other than `G-DVHD0KL633` appears.
- Fails on inline GA config blocks in any HTML file.

10. Browser runtime GA verification
- File: `tests/test_ga_runtime_playwright.py`
- Asserts GA loader request and GA collect request on each canonical route.
- Asserts no CSP console errors are emitted for GA at runtime.

11. Header and navigation consistency
- File: `tests/test-header-nav.js`
- Asserts the same header/nav DOM structure across canonical pages.
- Asserts desktop and mobile nav accessibility labels are present and consistent.

12. Insights card layout + centralized bullets
- File: `tests/test-insights-layout.js`
- File: `tests/test_insights_layout.py`
- Asserts Insights uses responsive card grid and card classes.
- Asserts Insights and Services lists use `bullet-list`.
- Asserts bullet pseudo-element definitions live in `styles/site.css` only.

13. About hybrid redesign + global footer attribution
- File: `tests/test-about-redesign.js`
- File: `tests/test_about_redesign.py`
- Asserts About page contains the approved hybrid structure and timeline sections.
- Asserts shared `service-list` bullets are used for About key points.
- Asserts global footer attribution line appears on all canonical pages.
- Asserts no em dashes are present in canonical page HTML.

## OG Validation

14. OG image URL consistency
- File: `scripts/check_og_urls.sh`
- Asserts canonical OG image URL appears once in each canonical page.

## Contact Experience

15. Connect form integration and UX hooks
- File: `tests/test_contact_form.py`
- Asserts form fields, editor integration, and script hooks remain intact.
