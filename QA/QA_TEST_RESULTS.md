# QA Test Results

Date: 2026-02-17

## Automated Results

1. `python3 -m unittest discover -s tests -v`
- Result: PASS
- Output summary: 10 tests run, 0 failures
- Added coverage: favicon assets + favicon link references via `tests/test_favicon_assets.py`

2. `bash scripts/check_og_urls.sh`
- Result: PASS
- Output summary: canonical OG image URL appears exactly once on each canonical page

3. `python3 scripts/diagnose_pages.py`
- Result: PASS (local file and route checks)
- Note: GitHub API checks were not executable in this environment due to network/DNS restrictions

## Runtime Route and Metadata Scans

1. Runtime legacy route scan
- Command: `rg -n "/contact/|href=\"/insights/\"|https://romanbediner.com/insights/|G-[A-Z0-9]{6,}" index.html about services connect about/insights home partials assets -S`
- Result: PASS
- Notes: no matches in runtime page/content directories

## Pending Node-based Checks

Node runtime is not installed in this environment (`node: command not found`), so the following checks are prepared but not executable locally:

- `node tests/test-clean-urls.js`
- `node tests/test-canonical.js`
- `node tests/test-meta.js`
- `node tests/test-schema.js`
- `node tests/test-ga4-installation.js`
- `node tests/test-favicon.js`
- `node scripts/verify_ga4_id.js`

These should be run in a Node-enabled environment before release sign-off.
