# QA Test Results

## Policy
This file is a lightweight status note, not a historical execution ledger. The repository's source of truth for pass/fail state is:
- local command output from `npm run qa:full-local` or `npm run qa:ci-parity`
- GitHub Actions runs from `.github/workflows/ci.yml`
- GitHub Actions deploy runs from `.github/workflows/deploy-pages.yml`

## Current Expected Baseline
- Local machines with the documented toolchain should pass `npm run qa:ci-parity`.
- `staging` should be promoted to `prod` only after the exact tested SHA passes CI.
- `prod` pushes should trigger both CI validation and GitHub Pages deployment.

## Maintenance Rule
Do not commit one-off machine-specific test logs here. If a durable result summary is needed, update this file only when the repository's expected QA policy changes.
