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

5. Title + description + social consistency
- File: `tests/test-meta.js`
- Asserts each canonical page has title and meta description.
- Asserts OG/Twitter descriptions match meta description.
- Asserts no `/contact/` references in metadata.

6. Structured data coverage
- File: `tests/test-schema.js`
- Asserts homepage includes valid Person JSON-LD.
- Asserts insights page includes 3 valid Article JSON-LD entries.

## Analytics

7. GA4 installation across canonical pages
- File: `tests/test-ga4-installation.js`
- Asserts GA snippet appears once per canonical page.
- Asserts `gtag('config', 'G-DVHD0KL633')` appears once per canonical page.
- Asserts no unexpected GA measurement IDs exist.

8. Repository-wide GA4 ID enforcement
- File: `scripts/verify_ga4_id.js`
- Scans all HTML files.
- Fails if any GA ID other than `G-DVHD0KL633` appears.
- Fails on duplicate GA snippet in any file.

## OG Validation

9. OG image URL consistency
- File: `scripts/check_og_urls.sh`
- Asserts canonical OG image URL appears once in each canonical page.

## Contact Experience

10. Connect form integration and UX hooks
- File: `tests/test_contact_form.py`
- Asserts form fields, editor integration, and script hooks remain intact.
