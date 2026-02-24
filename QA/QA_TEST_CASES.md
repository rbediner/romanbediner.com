# QA Test Cases

## Route and URL Integrity

1. Clean URL navigation
- File: `QA/tests/test-clean-urls.js`
- Asserts no `.html` links in nav blocks.
- Asserts no `/contact/` nav links.

2. Canonical route existence policy
- File: `QA/tests/test-clean-urls.js`
- Asserts `/insights/index.html` exists.
- Asserts `/about/insights/index.html` does not exist.
- Asserts `contact/index.html` does not exist.
- Asserts `/home/index.html` does not exist.

## Metadata and SEO

4. Canonical + OG URL alignment
- File: `QA/tests/test-canonical.js`
- Asserts canonical URL per canonical page.
- Asserts `og:url` equals canonical URL.
- Asserts CSP `script-src` does not include `unsafe-inline`.

5. Title + description + social consistency
- File: `QA/tests/test-meta.js`
- Asserts each canonical page has title and meta description.
- Asserts OG/Twitter descriptions match meta description.
- Asserts no `/contact/` references in metadata.

6. Structured data coverage
- File: `QA/tests/test-schema.js`
- Asserts homepage includes valid Person JSON-LD.
- Asserts insights page includes 3 valid Article JSON-LD entries.

7. Favicon asset coverage and page references
- File: `QA/tests/test-favicon.js`
- File: `QA/tests/test_favicon_assets.py`
- Asserts required favicon files exist in `assets/favicon/`.
- Asserts each route references favicon `32x32`, `16x16`, Apple touch icon, and `.ico` fallback with correct relative paths.

## Analytics

8. GA4 installation across canonical pages
- File: `QA/tests/test-ga4-installation.js`
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
- File: `QA/tests/test_ga_runtime_playwright.py`
- Asserts GA loader request and GA collect request on each canonical route.
- Asserts no CSP console errors are emitted for GA at runtime.

11. Header and navigation consistency
- File: `QA/tests/test-header-nav.js`
- Asserts the same header/nav DOM structure across canonical pages.
- Asserts desktop and mobile nav accessibility labels are present and consistent.

12. Insights card layout + centralized bullets
- File: `QA/tests/test-insights-layout.js`
- File: `QA/tests/test_insights_layout.py`
- Asserts Insight cards use slug ids + expected structure.
- Asserts expand/collapse CSS behavior and subtle hover lift.
- Asserts shared orb bullet spec is centralized in `styles/site.css`.

13. Insights production checks
- File: `QA/tests/insights.test.js`
- Asserts each `.insight-card` slug is unique and derived from title.
- Asserts README auto-generated direct links match Insight slugs exactly.
- Asserts GA `insight_expand` and `insight_collapse` fire with slug payloads.
- Asserts warning behavior when `gtag` is unavailable.

14. About hybrid redesign + global footer attribution
- File: `QA/tests/test-about-redesign.js`
- File: `QA/tests/test_about_redesign.py`
- Asserts About page contains the approved hybrid structure and timeline sections.
- Asserts shared `service-list` bullets are used for About key points.
- Asserts global footer attribution line appears on all canonical pages.
- Asserts no em dashes are present in canonical page HTML.

## OG Validation

15. OG image URL consistency
- File: `scripts/check_og_urls.sh`
- Asserts canonical OG image URL appears once in each canonical page.

## Contact Experience

16. Connect form integration and UX hooks
- File: `QA/tests/test_contact_form.py`
- Asserts form fields, editor integration, and script hooks remain intact.

## Visual Regression and Layout Integrity

17. Critical-page baseline snapshots
- File: `QA/tests/test_visual_regression_playwright.py`
- Asserts Home/About/Services/Insights/Connect match committed baseline screenshots.
- Captures desktop full page (`1440px` width), desktop fold (`1200px` height), and mobile full page (`390px` width).
- Fails on low-threshold visual drift.

18. Navigation visual alignment and active-state stability
- File: `QA/tests/test_visual_regression_playwright.py`
- Asserts nav links remain horizontally aligned.
- Asserts Insights link exists on all pages.
- Asserts active indicator exists and no layout shift occurs when active state toggles.

19. Insights card integrity and interaction safety
- File: `QA/tests/test_visual_regression_playwright.py`
- Asserts card container, blue top divider, orb bullets, bottom-right toggle, and hover hook.
- Asserts expanded state screenshot remains stable.
- Asserts expand interaction does not break card width and uses smooth max-height animation.

20. Operating Philosophy visual contract
- File: `QA/tests/test_visual_regression_playwright.py`
- Asserts white card background, border radius, hover elevation, right-aligned link, and heading hierarchy.
- Captures normal and hover state screenshots.

21. Bullet and spacing guardrails
- File: `QA/tests/test_visual_regression_playwright.py`
- Asserts all unordered lists use `.service-list` with `/icons/bullet.png` at `8px`.
- Asserts no default browser bullets render.
- Asserts vertical spacing stays on the defined scale and below anomaly thresholds.

22. Mobile responsive integrity
- File: `QA/tests/test_visual_regression_playwright.py`
- Asserts mobile nav behavior, no horizontal overflow, clean Insights card stacking, and no clipping containers.

23. Home hero spacing + geometry hard guard
- File: `QA/tests/test_home_layout_spacing_playwright.py`
- Asserts desktop Home hero-to-Experience gap is bounded (`24px` to `72px`).
- Asserts mobile Home hero-to-Experience gap is bounded (`16px` to `64px`).
- Asserts photo top aligns to Home blurb top (`<= 2px` delta).
- Asserts no mobile horizontal overflow.

24. Home nav consistency + Home nav telemetry
- File: `QA/tests/test_home_nav_consistency_playwright.py`
- Asserts desktop and mobile nav contain `Home/About/Services/Insights/Connect` across canonical routes.
- Asserts active route nav state stays correct per route.
- Asserts Home header nav clicks emit `nav_click` with `{label, location:"header"}` when `gtag` is available.
