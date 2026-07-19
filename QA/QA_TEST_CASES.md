# QA Test Cases

## Scope
This repository enforces static-site architecture through automated Node, Python, Jest, and Playwright checks. The authoritative entrypoints are `npm run test:node`, `npm run test:python`, `npm run test:jest`, `npm run test:playwright`, `npm run test:visual`, `npm run qa:ci-parity`, and `npm run qa:full-local`.

## Core Contract Suites

1. Route and canonical URL integrity
- Files: `QA/tests/test-clean-urls.js`, `QA/tests/test-canonical.js`, `QA/tests/test-route-metadata-parity.js`
- Validates trailing-slash canonical routes, canonical/og:url alignment, and removal of legacy route patterns such as `/contact/` and public `.html` links.

2. Shared metadata and search contracts
- Files: `QA/tests/test-jsonld-schema.js`, `QA/tests/test-og-homepage.js`, `QA/tests/test-og-route-metadata.js`, `QA/tests/test-metadata-consistency.js`, `QA/tests/test-favicon-contract.js`, `QA/tests/test_favicon_assets.py`
- Validates title/description consistency, JSON-LD coverage, OG/Twitter image wiring, and favicon asset references.

3. Analytics installation and runtime telemetry
- Files: `QA/tests/test-ga4-installation.js`, `QA/tests/test_ga_runtime_playwright.py`, `QA/tests/jest/insights-analytics.test.js`, `scripts/qa/verify-ga4-installation.js`
- Validates one GA meta tag per canonical page, one external GA bootstrap include, no inline GA config, and runtime event delivery.
- Insights interaction telemetry uses event name `insight_toggle` with params `insight_slug`, `insight_title`, `action`, and `page_path`.

4. Navigation and shared layout contracts
- Files: `QA/tests/test-header-nav.js`, `QA/tests/test-nav-links-contract.js`, `QA/tests/test-page-top-spacing.js`, `QA/tests/test-transition-blocks.js`, `QA/tests/test-shared-design-system.js`
- Validates shared nav structure, active-state consistency, top-spacing token usage, and narrative transition block architecture.

5. Page-specific content and interaction contracts
- Files: `QA/tests/test-home-hero-layout.js`, `QA/tests/test-home-spacing-contract.js`, `QA/tests/test-about-redesign.js`, `QA/tests/test-about-hero-contract.js`, `QA/tests/test-operating-philosophy.js`, `QA/tests/test-connect-page.js`, `QA/tests/test_contact_form.py`, `QA/tests/test-insights-layout.js`, `QA/tests/test_insights_layout.py`, `QA/tests/test-insights-system.js`
- Validates route-specific DOM, copy structure, visual guardrails, connect form hooks, and insights toggle/card behavior.

6. Agentic Operations Architecture artifact and staging integration
- Files: `QA/tests/test-agentic-operations-architecture-artifact.js`, `QA/tests/test-agentic-operations-architecture-integration.js`, `scripts/asset-generation/agentic-operations-architecture/generate_agentic_operations_architecture.py`
- Validates the eight-page downloadable case-study artifact, its eight visual preview slides, the direct resource CTA, the resource hub carousel, and the shared `resource_pdf_download` Google Analytics attributes.

7. Repository hygiene and automation guardrails
- Files: `QA/tests/test-no-legacy-references.js`, `QA/tests/test-js-header-comments.js`, `QA/tests/test-repo-hygiene.js`, `QA/tests/test-readme-drift.js`, `QA/tests/test-qa-runner-script.js`, `QA/tests/test-release-sop-automation.js`, `QA/tests/jest/readme_structure.test.js`, `QA/tests/jest/readme_integrity.test.js`, `QA/tests/jest/scripts_comment_headers.test.js`
- Validates documentation drift, script header coverage, release automation invariants, and repo cleanliness expectations.

## Browser and Visual Regression Suites

8. Runtime browser checks
- Files: `QA/tests/playwright/csp-ga-runtime.spec.js`, `QA/tests/playwright/h1-alignment.spec.js`, `QA/tests/test_nav_runtime_playwright.py`, `QA/tests/test_home_nav_consistency_playwright.py`, `QA/tests/test_home_layout_spacing_playwright.py`, `QA/tests/test_home_spacing_playwright.py`
- Validates runtime CSP behavior, GA requests, nav interactions, geometry, and mobile overflow constraints.

9. Visual baselines
- File: `QA/tests/test_visual_regression_playwright.py`
- Compares committed baselines in `QA/tests/visual-baselines/` against current desktop/mobile renders for Home, About, Services, Insights, and Connect.

## Operator Commands
- Fast local validation: `npm run qa:full-local`
- Release parity validation: `npm run qa:ci-parity`
- Visual baseline refresh: `npm run test:visual:update`
