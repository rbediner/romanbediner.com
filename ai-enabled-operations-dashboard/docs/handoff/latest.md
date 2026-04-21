# AI-Enabled Operations Dashboard — Handoff
**Session date:** 2026-04-21

## Status
- **Release complete.** Dashboard source is live at `https://romanbediner.com/resources/ai-enabled-operations-dashboard/` (embedded iframe, prod SHA `72c9b7b`).
- Public distribution repo (`rbediner/ai-enabled-operations-dashboard`) is synced and current.
- `HANDOFF-SOP.md` rewritten to reflect new workflow: develop in `romanbediner.com`, sync to public on prod promotion.

## Current State

The dashboard is now fully integrated into `romanbediner.com` under `ai-enabled-operations-dashboard/`. The standalone public repo is a read-only sync target — do not edit it directly.

Development flow:
1. Edit `romanbediner.com/ai-enabled-operations-dashboard/`
2. Push to `staging` in `romanbediner.com` → iterate freely
3. Promote to `prod` in `romanbediner.com` → auto-sync fires to public repo

## Source Repo
- Private: `https://github.com/rbediner/romanbediner.com` (branch: `staging`)
- Public sync target: `https://github.com/rbediner/ai-enabled-operations-dashboard`
- Live experience: `https://romanbediner.com/resources/ai-enabled-operations-dashboard/`

## Next Steps
- PRD (`docs/PRD.md`) needs updating to reflect shipped features: 3x2 question grid, Operating Principles section, wireframe prototype tile + modal, expand control.
- Any new dashboard features must include a `docs/PRD.md` update in the same commit.

## Pickup Note
- Continue on `staging` in `romanbediner.com` from the current HEAD.
- Read `romanbediner.com/docs/handoff/latest.md` for the full cross-repo session state.
- Read `docs/HANDOFF-SOP.md` in this folder for the development and release workflow.
