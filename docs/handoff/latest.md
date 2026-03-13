# Cross-Machine Handoff (Latest)

- Handoff Sequence: 60
- Updated At (UTC): 2026-03-13T22:00:45Z
- Source Branch: codex/prod-promote
- Source Commit: da88d15566e05f045094bb13c569693eec710f8e (pre-handoff baseline)

## What Changed Most Recently
- Replaced only two framework production icon assets to fix bottom clipping from prior grid crop:
  - `assets/icons/framework/integration-merger.png`
  - `assets/icons/framework/execution-workflow.png`
- Regenerated from source grid with preserved bottom margin so glyph bottoms are no longer cut.
- Applied final framework icon alignment refinement:
  - `#execution .framework-icon` moved down by 2px to `top: -12px` in `styles/framework.css`.
- Refreshed visual baselines and icon alignment QA contracts for the approved framework icon state.

## Validation Status
- Full local CI parity suite passed before release (`npm run -s qa:ci-parity`), including:
  1. Node contract suite
  2. Jest suite
  3. Python QA suite
  4. Playwright runtime suite
  5. Visual regression suite
- Staging push and prod promotion both passed pre-push CI gates.

## Branch Alignment
- `staging`: at `da88d15` (aligned)
- `prod`: at `da88d15` (aligned)
- `staging` and `prod` are in sync at the same release commit.

## Preview Links (Staging)
- Main preview: `https://rbediner.github.io/romanbediner-preview/`
- Framework preview: `https://rbediner.github.io/romanbediner-preview/framework/`

## Operator Notes
- In non-login shells, `gh` may not be on PATH; use full path when needed:
  - `~/.local/bin/gh run list --repo rbediner/romanbediner.com --branch staging --limit 5`
- Workflow remains:
  1. push to `staging`
  2. wait for all tests + deploy green
  3. share preview link for visual sign-off
  4. promote exact commit to `prod`
