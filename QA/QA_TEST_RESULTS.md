# QA Test Results

Date: 2026-02-17

## Automated Results

1. `npm run test:node`
- Result: PASS
- Output summary: all Node checks passed, including:
  - route/canonical/metadata/schema checks
  - GA4 architecture checks
  - header/nav consistency checks
  - favicon checks
  - insights layout + slug/README/GA expand checks
  - repository link and GA policy validators

2. `npm run test:python`
- Result: PASS
- Output summary: 21 tests run, 0 failures
- Includes Playwright runtime GA verification across all canonical routes
- Includes Insights structure and behavior tests in `tests/test_insights_layout.py`
- Includes About redesign and global footer attribution checks in `tests/test_about_redesign.py`

3. `bash scripts/check_og_urls.sh`
- Result: PASS
- Output summary: canonical OG image URL appears exactly once on each canonical page

4. `python3 scripts/diagnose_pages.py`
- Result: PASS (local file and route checks)
- Note: GitHub API checks were not executable in this environment due to network/DNS restrictions

## Runtime Route and Metadata Scans

1. Runtime legacy route scan
- Command: `rg -n "/contact/|/about/insights/|https://romanbediner.com/insights/|G-[A-Z0-9]{6,}" index.html about services connect insights analytics assets -S`
- Result: PASS
- Notes: no matches in runtime page/content directories

## Additional Notes

- Updated metadata unit test policy to enforce description quality and cross-tag consistency, removing an outdated assertion for a previously required core phrase that no longer matches current approved page metadata.

## Notes

- During QA, runtime GA test initially surfaced a CSP issue on `/insights/` (`img-src` blocked a Google Tag Manager image ping).
- Fix applied: added `https://www.googletagmanager.com` to `img-src` in canonical page CSP meta tags.
- Re-run after fix: full Node + Python suites passed.
