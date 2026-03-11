# Analytics QA Guide

## Insights Toggle Tracking
The canonical Insights interaction event is:
- event name: `insight_toggle`
- params: `insight_slug`, `insight_title`, `action`, `page_path`
- `action` values: `expand` or `collapse`

Authoritative implementation and tests:
- Runtime sender: `scripts/runtime/insights-toggle.js`
- Jest contract: `QA/tests/jest/insights-analytics.test.js`
- Runtime/browser verification: `QA/tests/test_ga_runtime_playwright.py`

## Manual Verification
1. Run the site locally.
2. Open `/insights/` in a browser.
3. Open DevTools and inspect GA collect requests.
4. Click an insight toggle.
5. Confirm the request includes:
- `en=insight_toggle`
- `ep.insight_slug=...`
- `ep.insight_title=...`
- `ep.action=expand` or `ep.action=collapse`

## Reporting Notes
- GA4 Explore views can lag behind realtime/network evidence.
- If an Explore report is empty, confirm it is filtering on `Event name = insight_toggle` rather than legacy event names.
