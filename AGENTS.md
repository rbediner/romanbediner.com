# Repo Agent Instructions

## Startup Requirement
- Before making changes in this repository, read `/README.md`.
- Immediately after reading `/README.md`, read `/docs/handoff/latest.md`.
- Treat `/docs/handoff/latest.md` as the live source of truth for current repo state, branch alignment, and operator notes.
- If `/docs/handoff/latest.md` conflicts with older docs or release notes, follow `/docs/handoff/latest.md`.

## Handoff Rule
- After any session that changes code, scripts, QA behavior, or release flow, update `/docs/handoff/latest.md` before ending work.
- Push the handoff as an **isolated commit** using:
  ```bash
  npm run handoff:push
  ```
  This commits only `docs/handoff/latest.md` so the pre-push gate classifies it as `docs-only` (~10s). Bundling the handoff with code changes escalates the gate to full-regression (~2 min). Always commit handoff separately.
- Handoff doc updates must always be committed on `staging` first. Never commit the handoff directly on `prod`.
- The handoff **must** include the phrase `release watcher hygiene` (lowercase) in the body — a contract test asserts this. Use this exact block:
  ```
  ## Release Watcher Hygiene

  Keep release watcher hygiene in place for this repo.
  - Use `npm run release:watchers:status` and `npm run release:watchers:cleanup`
  - Do not use ad-hoc shell polling loops for CI or preview monitoring.
  ```
- After any meaningful product change, also update the live PRD in Google Docs: `SEO Authority PRD` (`https://docs.google.com/document/d/15WTgARcQl8jlKuqYtQdxBucWjEsXvrxnGNqbB0xTbE8/edit`).
- Treat the PRD update as required when a session adds or changes a feature, deploy-worthy behavior, UX rule, analytics rule, metadata rule, information architecture decision, content-system rule, or any other product-level decision that changes how the site works or what it promises.

## Dashboard Sub-Project Rule

### What syncs to the public repo
The sync workflow (`sync-dashboard-public.yml`) copies **only** `ai-enabled-operations-dashboard/` to the root of `rbediner/ai-enabled-operations-dashboard` on every prod promotion that touches those files. Nothing outside that folder ever reaches the public repo.

| File | Syncs to public? | Rule |
|---|---|---|
| `ai-enabled-operations-dashboard/docs/PRD.md` | ✅ Yes | Dashboard PRD only — never include website-level content |
| `ai-enabled-operations-dashboard/docs/handoff/latest.md` | ✅ Yes | Dashboard state only — never include website-level changes |
| `ai-enabled-operations-dashboard/README.md` | ✅ Yes | Dashboard README only — already correct |
| `docs/handoff/latest.md` (repo root) | ❌ Never | Website handoff — stays private, never touches dashboard subfolder |
| `README.md` (repo root) | ❌ Never | Website README — stays private |

### Required doc updates after dashboard changes
After any session that adds, changes, or removes dashboard features, **both** of the following must be updated before ending work:
1. `ai-enabled-operations-dashboard/docs/PRD.md` — update the relevant tile, behavior, or release section **in the same commit** as the code change.
2. `ai-enabled-operations-dashboard/docs/handoff/latest.md` — overwrite with **dashboard-only** state (what changed in the dashboard, current SHA, next dashboard steps). Do not include website-level changes here.

### Boundary rules — never cross these
- `ai-enabled-operations-dashboard/docs/handoff/latest.md` must contain **only dashboard content**. If a session touched the website but not the dashboard, do not update this file.
- `docs/handoff/latest.md` (repo root) is the **website handoff only**. Never reference dashboard-specific tile or behavior changes there — those belong in the dashboard handoff.
- Do not edit the public repo (`rbediner/ai-enabled-operations-dashboard`) directly. It is a read-only sync target.

### Release completion gate
After promoting to prod, verify `sync-dashboard-public.yml` ran green in GitHub Actions. A dashboard release is not complete until the sync is confirmed green and the public repo's `docs/PRD.md` and `docs/handoff/latest.md` reflect the shipped state.
## Google Drive drift (ALL agents & tools — read this)

This repo is checked out inside **Google Drive** and synced across multiple machines. Google Drive creates conflict-copies of files (names ending in ` 2`, ` 3`, …) — **including inside `.git/objects` and `.git/refs`** — which corrupt the repository. This has caused real breakage.

**Before starting work, and before committing, clean the drift:**

```
scripts/clean-drive-drift.sh --fix      # remove conflict-copies + verify with git fsck
scripts/clean-drive-drift.sh --check    # report only (exit 1 if any found)
```

- Runs automatically three ways, so it self-heals without anyone remembering to invoke it: (1) `.husky/pre-commit`, `.husky/post-merge`, `.husky/post-checkout` -- this repo uses **Husky** for hooks, so the cleaner lives inside Husky's own hook files rather than a separate `core.hooksPath`, which Husky's own install step (`npm install` -> `prepare` -> `scripts/release/install-local-husky-hooks.js`) resets on every install; a standalone `.githooks` directory would have been silently overridden the next time anyone ran `npm install`, which is exactly why this guardrail failed to prevent corruption three times before 2026-07-05. (2) `scripts/release/install-local-husky-hooks.js` itself also runs the cleaner directly, so every `npm install` self-heals even before Husky's hooks are (re)installed. (3) Claude also runs it at session start via `.claude/settings.json`'s `SessionStart` hook -- that file (and `.claude/launch.json`) are deliberately **not** gitignored (only `.claude/settings.local.json` is) so this survives a fresh clone; a blanket `.claude/` gitignore was the second reason this guardrail kept vanishing.
- **If this pattern is ever copied into a repo that does NOT already use Husky (or another hook manager)**, a plain `.githooks` directory + `git config core.hooksPath .githooks` is fine -- the failure mode above is specifically about two things fighting over `core.hooksPath`. Check first with `git config core.hooksPath` and `cat package.json | grep prepare` whether something already owns it.
- Dependency-free (bash + git) — works for Codex, Claude, Cursor, or a human. Claude also runs it at session start via `.claude/settings.json`.
- **Never commit a file whose name ends in ` 2`/` 3` — it is Drive junk, not a real file.**
