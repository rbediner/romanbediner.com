# Cross-Machine Handoff (Latest)

- Handoff Sequence: 18
- Updated At (UTC): 2026-03-13T00:25:34Z
- Source Branch: staging
- Source Commit: 02752663f35be27e9fdc28177f3e3daba169ccec (pre-handoff baseline)

## What Changed Most Recently
- Fixed staging preview rendering parity for GitHub project Pages path:
  - Preview artifact now rewrites root-relative asset links (`/styles/...`, `/scripts/...`, `/assets/...`) to preview-base paths (`/romanbediner-preview/...`).
  - This resolved the issue where preview loaded without styling and script assets.
- Confirmed successful staging pipeline for the fix commit:
  - CI run on `68421f9`: success.
  - Deploy Staging run on `68421f9`: success.
  - Preview URL served and validated: `https://rbediner.github.io/romanbediner-preview/`.
- Documentation sync updates completed:
  - `/README.md` staging preview branch configuration now documents variable-driven branch selection.
  - `/README.md` now includes a one-line operator shortcut prompt for new Codex sessions.
  - `/docs/architecture/environment-model.json` now includes preview branch configuration metadata and explicit preview URL emission locations.

## Validation Status
- `node QA/tests/test-staging-preview-automation.js`: passed
- `npm run docs:verify`: passed

## Operator Checklist (Next Machine)
1. `git fetch origin --prune`
2. `git checkout staging && git pull --ff-only origin staging`
3. `nvm use` (Node 20 per `.nvmrc`)
4. Run `npm run session:ready`
5. Read in order before architecture changes:
   - `/README.md`
   - `/docs/handoff/latest.md`
   - `/docs/architecture/repo-contract.json`
6. Use the session shortcut prompt:
   - `session:start — read README + docs/handoff/latest, run session readiness, then run/verify staging deploy and give me the Staging Preview Ready URL.`
7. For visual validation, always open:
   - `https://rbediner.github.io/romanbediner-preview/`

## Notes
- This file must contain only the latest handoff state; do not append logs.
- This file is intentionally updated by hand at session end after code/test changes.
- Staging preview now uses separate preview repository publication and does not share production Pages deployment state.
