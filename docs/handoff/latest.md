# Cross-Machine Handoff (Latest)

- Handoff Sequence: 61
- Updated At (UTC): 2026-03-13T22:25:00Z
- Source Branch: `codex/prod-promote`
- Source Commit: `da88d15566e05f045094bb13c569693eec710f8e` (pre-handoff baseline)

## What Changed Most Recently
- Fixed canonical navigation cache invalidation by appending a version query to the shared runtime include on canonical pages:
  - `/index.html`
  - `/about/index.html`
  - `/services/index.html`
  - `/framework/index.html`
  - `/connect/index.html`
- Retained runtime-driven nav model (`Framework` route) while ensuring stale browser caches do not keep showing `Insights`.
- Fixed framework bullet wrapping in Integration (and all framework sections) by removing the artificial list-item width cap:
  - `/styles/framework.css`: `.framework-section li` now uses `max-width: none`.
- Updated focused QA contracts to validate the new behavior:
  - `/QA/tests/test-header-nav.js`
  - `/QA/tests/test-nav-links-contract.js`
  - `/QA/tests/test_contact_form.py`
  - `/QA/tests/test_insights_layout.py`

## Validation Status (Targeted, Fast Iteration)
- `node QA/tests/test-header-nav.js` ✅
- `node QA/tests/test-nav-links-contract.js` ✅
- `node QA/tests/test-insights-layout.js` ✅
- `python3 -m unittest QA.tests.test_insights_layout -v` ✅
- `python3 -m unittest QA.tests.test_contact_form -v` ✅

## Branch Alignment
- Working branch: `codex/prod-promote`
- Pending push: yes (local commit not pushed yet at this handoff snapshot).

## Preview Links (Staging)
- Preview base (after staging deploy): `https://rbediner.github.io/romanbediner-preview/`
- Framework preview (after staging deploy): `https://rbediner.github.io/romanbediner-preview/framework/`

## Operator Notes
- Workflow contract remains:
  1. local targeted/focused validation
  2. push to `staging`
  3. wait for staging CI + staging deploy green
  4. share preview link
  5. promote exact commit to `prod` only after sign-off
- Query-string cache busting on shared runtime scripts is allowed and covered by QA regex contracts.
