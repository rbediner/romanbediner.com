# Release Notes: 2026-03-11

## Summary

This release reorganized the repository from a flat script layout into intent-based folders, tightened release automation, stabilized local QA execution for the Google Drive workspace, refreshed stale documentation, normalized a small set of homepage asset names, and deployed the resulting refactor to production.

- Deployed SHA: `2c826aa19cebfb34b782afc403970b0c754245d4`
- Commit message: `Reorganize scripts and tighten repo hygiene`
- Production branch at release time: `prod`

## Production Verification

The deployed commit was verified locally and remotely.

- Local `npm run qa:ci-parity`: passed
- Local Husky pre-push gate: passed
- GitHub Actions CI run: success
- GitHub Pages deploy run: success

Remote runs for the deployed SHA:

- CI: [actions/runs/22968642684](https://github.com/rbediner/romanbediner.com/actions/runs/22968642684)
- Deploy Pages: [actions/runs/22968642650](https://github.com/rbediner/romanbediner.com/actions/runs/22968642650)

## Why This Refactor Happened

The repository had accumulated a flat `scripts/` directory with mixed concerns:

- browser runtime JavaScript
- local QA wrappers
- release automation
- content generation utilities
- one-off diagnostics

That structure had become harder to navigate and made the README, QA docs, and operator workflow drift out of sync with reality.

Separately, local Node and Playwright execution inside the Google Drive workspace had become unreliable. The repo now treats a local `/tmp` mirror as the supported path for CI-parity execution when running from the synced workspace.

## Structural Changes

### Scripts are now grouped by purpose

The old flat `scripts/` layout was replaced with these folders:

- `scripts/runtime/`
- `scripts/qa/`
- `scripts/release/`
- `scripts/content/`
- `scripts/diagnostics/`

### Current script layout

#### Runtime

- `scripts/runtime/ga4-bootstrap.js`
- `scripts/runtime/site-navigation.js`
- `scripts/runtime/insights-toggle.js`
- `scripts/runtime/contact-form-emailjs.js`

#### QA

- `scripts/qa/run-ci-parity.sh`
- `scripts/qa/run-local-full-qa.sh`
- `scripts/qa/run-local-playwright-suite.sh`
- `scripts/qa/run-jest-suite.js`
- `scripts/qa/run-in-local-mirror.sh`
- `scripts/qa/validate-links.js`
- `scripts/qa/verify-ga4-installation.js`

#### Release

- `scripts/release/promote-tested-staging-to-prod.sh`
- `scripts/release/watch-ci-run.js`
- `scripts/release/install-local-husky-hooks.js`

#### Content

- `scripts/content/generate-insight-links.js`
- `scripts/content/generate-sitemap.js`
- `scripts/content/export-copy-baseline.js`
- `scripts/content/calibrate-h1.mjs`

#### Diagnostics

- `scripts/diagnostics/check-og-urls.sh`
- `scripts/diagnostics/diagnose-pages.py`

## Important Renames

These were the most important path changes. Any tool, script, or assistant still referencing the old paths is stale.

| Old path | New path |
| --- | --- |
| `scripts/ga4.js` | `scripts/runtime/ga4-bootstrap.js` |
| `scripts/site-navigation.js` | `scripts/runtime/site-navigation.js` |
| `scripts/insights-toggle.js` | `scripts/runtime/insights-toggle.js` |
| `scripts/contact-form-emailjs.js` | `scripts/runtime/contact-form-emailjs.js` |
| `scripts/run-ci-parity.sh` | `scripts/qa/run-ci-parity.sh` |
| `scripts/run-all-qa.sh` | `scripts/qa/run-local-full-qa.sh` |
| `scripts/run-playwright-local.sh` | `scripts/qa/run-local-playwright-suite.sh` |
| `scripts/run-jest-suite.js` | `scripts/qa/run-jest-suite.js` |
| `scripts/run-in-local-mirror.sh` | `scripts/qa/run-in-local-mirror.sh` |
| `scripts/validate-links.js` | `scripts/qa/validate-links.js` |
| `scripts/verify_ga4_id.js` | `scripts/qa/verify-ga4-installation.js` |
| `scripts/release-staging-to-prod.sh` | `scripts/release/promote-tested-staging-to-prod.sh` |
| `scripts/monitor-ci-run.js` | `scripts/release/watch-ci-run.js` |
| `scripts/prepare-husky.js` | `scripts/release/install-local-husky-hooks.js` |
| `scripts/generate-insight-links.js` | `scripts/content/generate-insight-links.js` |
| `scripts/generate-sitemap.js` | `scripts/content/generate-sitemap.js` |
| `scripts/export-copy-baseline.js` | `scripts/content/export-copy-baseline.js` |
| `scripts/calibrate-h1.mjs` | `scripts/content/calibrate-h1.mjs` |
| `scripts/check_og_urls.sh` | `scripts/diagnostics/check-og-urls.sh` |
| `scripts/diagnose_pages.py` | `scripts/diagnostics/diagnose-pages.py` |

## HTML Runtime Updates

Canonical pages were updated to load the new runtime paths.

- `index.html`
- `about/index.html`
- `services/index.html`
- `insights/index.html`
- `connect/index.html`

If a tool is searching for runtime references in the old locations, it should be updated immediately.

## README and Documentation Refresh

The following docs were refreshed to reflect the actual current repo:

- `README.md`
- `QA/QA_TEST_CASES.md`
- `QA/QA_TEST_RESULTS.md`
- `QA/analytics.md`

Key documentation corrections:

- release flow now reflects the current staging-to-prod promotion model
- release script names now match the renamed files
- QA commands now match what the repo actually runs
- stale analytics event naming was removed
- stale references to removed scripts were removed

## Release Safety Changes

The release script now enforces fast-forward-only pulls instead of loose pull behavior.

Current release script:

- `scripts/release/promote-tested-staging-to-prod.sh`

This matters because the README and actual automation are now aligned on a safer promotion path.

## QA and Local Execution Changes

### CI parity command

Canonical operator command:

```bash
npm run qa:ci-parity
```

### Full local QA command

Canonical operator command:

```bash
npm run qa:full-local
```

### Why `/tmp` mirror execution exists

The repo lives in a Google Drive synced path. That environment caused intermittent Node and Playwright failures in local execution. The QA runners now detect this and re-run from a local `/tmp` mirror.

Canonical mirror runner:

- `scripts/qa/run-in-local-mirror.sh`

This behavior is intentional. It is not a workaround that should be removed casually.

## Husky and Local Guardrails

The local Husky pre-push hook was repaired and verified during this work.

- `core.hooksPath` points at `.husky/_`
- `.husky/_/pre-push` is executable again
- pushes once again run the local CI-parity guardrail before remote updates

## Asset Naming Cleanup

Three homepage icon assets were renamed to be descriptive:

| Old filename | New filename |
| --- | --- |
| `assets/icons/context-blue-white.png` | `assets/icons/home-execution-context-icon.png` |
| `assets/icons/area-blue-white.png` | `assets/icons/home-execution-areas-icon.png` |
| `assets/icons/how-blue-white.png` | `assets/icons/home-execution-method-icon.png` |

`index.html` was updated to reference the new names.

## Repo Hygiene Guardrail

Repository hygiene checks were strengthened to catch unused assets.

Relevant test:

- `QA/tests/test-repo-hygiene.js`

The test is aware of legitimate indirect references like the logo SVG referencing the underlying JPG.

## Analytics Notes

The current insight interaction event remains:

- event name: `insight_toggle`

The relevant parameters remain:

- `insight_slug`
- `insight_title`
- `action`
- `page_path`

Do not assume legacy event names like `insight_expand` or `insight_collapse`. Those are stale.

## Commands Another Machine or Agent Should Use

### Validation

```bash
npm run test:node
npm run test:jest
npm run test:python
npm run test:playwright
npm run test:visual
npm run qa:ci-parity
npm run qa:full-local
```

### Release monitoring

```bash
node scripts/release/watch-ci-run.js --branch prod --sha 2c826aa19cebfb34b782afc403970b0c754245d4
```

### Promotion

```bash
bash scripts/release/promote-tested-staging-to-prod.sh
```

## Guidance For Another Codex Instance

If another Codex instance appears confused, the usual cause will be one of these:

1. It still assumes the old flat `scripts/` tree.
2. It still assumes the old release script names.
3. It still assumes local QA should run directly from the Google Drive path.
4. It still assumes old analytics event names.
5. It is reading stale memory instead of the updated `README.md`.

The correct reset sequence is:

1. read `README.md`
2. inspect the current `scripts/` subfolders
3. trust the new command paths, not old memory
4. use `npm run qa:ci-parity` as the main validation entrypoint

## One-Sentence Handoff

On 2026-03-11, the repo was refactored into intent-based script folders, docs and release automation were brought current, cloud-workspace QA was stabilized through a `/tmp` mirror runner, asset naming was cleaned up, and production was successfully deployed at `2c826aa19cebfb34b782afc403970b0c754245d4` with CI and Pages both green.
