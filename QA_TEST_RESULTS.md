# QA Test Results

## Latest Run

Date: 2026-02-16

## Automated Checks

1. `bash scripts/check_og_urls.sh`
- Result: PASS
- Notes: OG image exists and each primary page references canonical OG URL exactly once.

2. `python3 -m unittest discover -s tests -v`
- Result: PASS
- Notes: all contact form tests passed.

3. Node-based tests (`tests/test-clean-urls.js`, `tests/test-canonical.js`, `tests/test-schema.js`, `tests/test-meta.js`)
- Result: NOT RUN IN CURRENT ENVIRONMENT
- Notes: `node` runtime was not available locally at execution time.

## Manual Verification Snapshot

1. Canonical `.html` scan
- Result: PASS
- Notes: no canonical URL contains `.html`.

2. Metadata typo scan (`PRODUCITZING` and variants)
- Result: PASS
- Notes: no typo variants detected in site code.

3. Uppercase metadata phrase scan
- Result: PASS
- Notes: no all-caps metadata phrase remains.

4. Description phrase normalization check
- Result: PASS
- Notes: required phrase appears in target page meta descriptions.
