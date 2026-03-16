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
  7. Update `docs/handoff/latest.md` and push to both branches
- Never promote a SHA that differs from the tested staging commit.

## Cleanup
- After every release, verify: no orphan local branches, no uncommitted files, staging and prod remote heads match.

## Session Start
- Always run `npm run session:ready` before making any changes.
- Read `README.md` and `docs/handoff/latest.md` before starting work.
