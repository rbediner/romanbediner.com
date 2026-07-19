# Claude Repo-Specific Rules — romanbediner.com

These rules apply to all sessions working in this repository.

## Branch Discipline
- Before every commit, verify the current branch with `git branch`. Confirm you are on the correct branch before proceeding.
- Handoff doc updates (`docs/handoff/latest.md`) must always be committed on `staging` first, then fast-forwarded to `prod`. Never commit the handoff directly on `prod`.

## Release Flow
- Follow the documented SOP in `README.md` exactly:
  1. Push to `staging`
  2. Verify staging CI passes
  3. Validate staging preview
  4. Promote exact tested SHA to `prod` (fast-forward only)
  5. Verify prod CI and deploy pass
  6. Run `node scripts/qa/verify-live-production.js`
  7. Update `docs/handoff/latest.md` and push using `npm run handoff:push` — this commits the handoff in isolation so it gets the fast `docs-only` gate (~10s). Never bundle handoff with code commits.
- Never promote a SHA that differs from the tested staging commit.

## Cleanup
- After every release, verify: no orphan local branches, no uncommitted files, staging and prod remote heads match.

## Session Start
- Always run `npm run session:ready` before making any changes.
- Read `README.md` and `docs/handoff/latest.md` before starting work.
- For any card-like or contained UI, read `docs/design-system/card-surfaces/README.md`. Do not invent a sixth surface type, duplicate an icon, or give static surfaces a click affordance.
## Google Drive drift (ALL agents & tools — read this)

This repo is checked out inside Google Drive and synced across machines, which can corrupt `.git`. Full explanation and install kit: **`docs/runbooks/google-drive-drift.md`**. Before starting work, and before committing:

```
scripts/clean-drive-drift.sh --fix      # remove conflict-copies + verify with git fsck
scripts/clean-drive-drift.sh --check    # report only (exit 1 if any found)
```

This also runs automatically via git hooks, on every `npm install`, and at Claude session start. Never commit a file whose name ends in ` 2` / ` 3` — it is Drive junk, not a real file.
