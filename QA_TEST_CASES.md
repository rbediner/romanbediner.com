# QA Test Cases

This file defines the active QA test cases for romanbediner.com.

## Scope

- Clean URL architecture
- Canonical URL correctness
- SEO metadata consistency
- Structured data presence
- OG image metadata integrity
- Contact form behavior and integrations

## Automated Test Cases

1. `tests/test-clean-urls.js`
- Objective: verify navigation does not reference `.html` links.
- Pass criteria: no `.html` links in nav blocks on primary pages.

2. `tests/test-canonical.js`
- Objective: verify canonical URLs match expected clean URL paths.
- Pass criteria: canonical tags match configured targets for home/about/services/connect/insights.

3. `tests/test-schema.js`
- Objective: verify homepage contains valid `Person` JSON-LD.
- Pass criteria: JSON parses and includes required keys (`@context`, `@type`, `name`, `url`, `jobTitle`, `description`, `sameAs`, `knowsAbout`).

4. `tests/test-meta.js`
- Objective: verify metadata normalization and consistency.
- Pass criteria:
  - unique page titles;
  - normalized core phrase present in page descriptions;
  - OG and Twitter descriptions match page meta description for primary pages.

5. `scripts/check_og_urls.sh`
- Objective: verify OG image URL is present once in each primary page.
- Pass criteria: exactly one `og:image` and one `twitter:image`, pointing to canonical OG asset URL.

6. `tests/test_contact_form.py`
- Objective: verify contact experience markup and scripts.
- Pass criteria: form fields, validation hooks, Quill and EmailJS integration, and UX/status behaviors present.

## Manual QA Cases

1. Validate redirects
- `/about.html` -> `/about/`
- `/services.html` -> `/services/`
- `/contact.html` -> `/connect/`

2. Validate canonical output
- Confirm each page emits canonical URL without `.html`.

3. Validate social metadata
- Confirm OG/Twitter tags render expected title/description/image.

4. Validate structured data
- Run homepage through rich results/schema validator.

5. Validate live crawl assets
- Confirm `robots.txt` and `sitemap.xml` are reachable in production.
