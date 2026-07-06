# Google Drive Git Corruption — Runbook & Install Kit

**Status:** hardened and verified working end-to-end.
**Scope:** any git repository checked out inside a Google Drive-synced folder — not specific to this project. Copy this whole file into another repo and follow "Install in a new repo" below.
**Audience:** this doc is agent-agnostic. It is written to be read and acted on by a human, or by any AI coding agent — Claude Code, Codex, Cursor, Copilot, Aider, or otherwise. Nothing here depends on a specific agent's tooling; the guardrail itself is plain bash + git.

---

## 1. The problem

Google Drive's desktop sync client detects when two devices (or Drive and a local process) write to the same file at close to the same time and resolves the collision by keeping both copies — renaming the newer one with a suffix like `File 2.ext`, `File (1).ext`, or `File 3.ext`.

That behavior is harmless for ordinary documents. It is **repo-corrupting** for a folder that contains a `.git` directory, because:

- Git's internal object store (`.git/objects/**`), refs (`.git/refs/**`), and index are binary/plain files with names Git itself chose — **Git never puts a space in any of these names.**
- When Drive drops a conflict-copy inside `.git` (e.g. `.git/objects/ab/<hash> 2`), the *original* filename is what Git's internal pointers expect. The stray copy is inert junk, but if Drive later overwrites the original with a differently-conflicted version, or a stray `.DS_Store` lands inside `.git` and confuses ref parsing, `git fsck` starts reporting things like `bad sha1 file`, `badRefName`, or missing objects. The repository is now actually corrupted, not just messy.
- This is not hypothetical — it has taken down the same repo three separate times before this guardrail existed in its current (working) form.

**Detection rule that makes this safe to automate:** because Git never uses spaces in its own filenames, *any* space-containing name found inside `.git/` is guaranteed to be Drive junk (or a stray `.DS_Store`), never a real Git-managed file. That single fact is what makes an automatic, unattended cleanup safe.

---

## 2. The fix, in one sentence

Install a small dependency-free script that deletes space-suffixed junk (and stray `.DS_Store`) from inside `.git/`, wire it to run automatically at the moments corruption is introduced or discovered (pre-commit, post-merge, post-checkout, every `npm install`, and — for Claude Code specifically — every session start), and document it once, in one place, so every agent and every human on the project follows the same rule.

---

## 3. Piece 1 — the cleaner script

Save as `scripts/clean-drive-drift.sh` and `chmod +x` it.

```bash
#!/usr/bin/env bash
# clean-drive-drift.sh — remove Google Drive conflict-copies (INCLUDING inside
# .git/objects and .git/refs) that accumulate when this repo is synced across
# machines via Google Drive. Google Drive renames colliding copies with a
# " <n>" suffix (e.g. "index 2.ts", ".git/objects/ab/<hash> 2"); git never uses
# spaces in its internal names, so any such name inside .git is junk and, left
# in place, corrupts the repository.
#
# Dependency-free (bash + coreutils + git) so it works for ANY tool/agent —
# Codex, Claude, Cursor, or a human. See docs/runbooks/google-drive-drift.md.
#
# Usage:
#   scripts/clean-drive-drift.sh            # check: report, exit 1 if any found
#   scripts/clean-drive-drift.sh --check    # same
#   scripts/clean-drive-drift.sh --fix      # remove them, then run git fsck
#   scripts/clean-drive-drift.sh --fix --quiet
set -u
MODE="check"; QUIET=0
for a in "$@"; do
  case "$a" in
    --fix) MODE="fix" ;;
    --check) MODE="check" ;;
    --quiet) QUIET=1 ;;
  esac
done

ROOT="$(git rev-parse --show-toplevel 2>/dev/null || pwd)"
cd "$ROOT" || exit 0

# Strip a trailing Drive conflict suffix: " 2" or " (2)" before end-or-extension.
canonical() { printf '%s' "$1" | sed -E 's/ (\([0-9]+\)|[0-9]+)(\.[^.]+)?$/\2/'; }
# Does a basename look like a Drive conflict copy? (" 2", " 3", " (1)", " (2).ext")
is_conflict() { [[ "$1" =~ \ (\([0-9]+\)|[0-9]+)($|\.) ]]; }

found=()
# Inside .git: git never uses spaces, so ANY spaced name is junk (conflict copy
# of an object/ref/index in either " n" or " (n)" style). Stray .DS_Store files
# also land in .git via Drive/macOS and break `git fsck` (badRefName) — drop them.
if [ -d .git ]; then
  while IFS= read -r -d '' f; do found+=("$f"); done \
    < <(find .git \( -name '* *' -o -name '.DS_Store' \) -print0 2>/dev/null)
fi
# Working tree: only treat a conflict-style name as junk when its de-suffixed
# sibling ALSO exists (Drive copies coexist with the original), so real names
# like "chapter 2.md" or "My File.txt" are left alone.
while IFS= read -r -d '' f; do
  b="$(basename "$f")"; is_conflict "$b" || continue
  d="$(dirname "$f")"; c="$(canonical "$b")"
  if [ "$c" != "$b" ] && [ -e "$d/$c" ]; then found+=("$f"); fi
done < <(find . -path ./.git -prune -o -path '*/node_modules' -prune -o \
             -name '* *' -print0 2>/dev/null)

n=${#found[@]}
if [ "$n" -eq 0 ]; then
  [ "$QUIET" -eq 0 ] && echo "clean-drive-drift: no Google Drive conflict-copies found. ✓"
  exit 0
fi

echo "clean-drive-drift: found $n Google Drive conflict-copy path(s):"
for f in "${found[@]}"; do echo "  ${f#./}"; done

if [ "$MODE" != "fix" ]; then
  echo "Run with --fix to remove them (they are safe to delete)."
  exit 1
fi

for f in "${found[@]}"; do
  # Unstage first (no-op if untracked/unstaged) so a conflict-copy that was
  # accidentally `git add`-ed can't ride through in the index after its
  # working-tree copy is gone -- a plain `rm -rf` alone doesn't touch the
  # index, so a staged junk file would still land in the next commit.
  git rm -r --cached --ignore-unmatch --quiet -- "$f" >/dev/null 2>&1 || true
  rm -rf "$f"
done
echo "clean-drive-drift: removed $n conflict-copy path(s)."

# Verify .git integrity after touching object/ref files. --no-dangling hides the
# harmless dangling-object chatter so only real corruption surfaces.
if git rev-parse --git-dir >/dev/null 2>&1; then
  tmp="$(mktemp)"
  if ! git fsck --full --no-progress --no-dangling >"$tmp" 2>&1; then
    echo "clean-drive-drift: git fsck reported problems — inspect before continuing:"
    cat "$tmp"; rm -f "$tmp"; exit 2
  fi
  if [ "$QUIET" -eq 0 ]; then
    [ -s "$tmp" ] && cat "$tmp"
    echo "clean-drive-drift: git fsck --full passed. ✓"
  fi
  rm -f "$tmp"
fi
exit 0
```

**Safety guarantee:** inside `.git`, every space-containing name is removed unconditionally (Git never creates them, so there is no false-positive case). In the **working tree**, a `" 2"`-suffixed file is removed *only if* its de-suffixed sibling also exists on disk — so a real, intentional filename like `chapter 2.md` (with no `chapter.md` next to it) is never touched.

---

## 4. Piece 2 — wire it to run automatically

Automation matters more than the script itself: a script nobody remembers to run doesn't prevent anything. **Before installing this piece, run these two checks in the target repo** — they decide which variant applies:

```bash
git config core.hooksPath                          # non-empty? something already owns hook activation
grep -E '"prepare"|"postinstall"' package.json      # a hook-manager install step?
ls .husky 2>/dev/null || ls .git/hooks/*.sample 2>/dev/null   # Husky? lefthook? pre-commit framework?
```

### Variant A — the repo already has a hook manager (Husky, lefthook, pre-commit framework, etc.)

**Do not** create a separate `.githooks` directory or set `core.hooksPath` yourself. The hook manager's own install step (typically an npm `prepare` script) will silently reclaim `core.hooksPath` on the next install, and your standalone hook will stop firing with no warning. This exact failure is what let this repo's `.git` corrupt more than once even after a "guardrail" had already been written and committed.

Instead, add the call into the manager's own hook files. For Husky v9+ (plain executable scripts, no shebang needed):

`.husky/pre-commit`:
```sh
# Purpose:
# - Self-heal Google Drive conflict-copy corruption before it gets committed.
# Notes:
# - Husky v9 hook files are plain executable scripts without shebang boilerplate.
# - See docs/runbooks/google-drive-drift.md for why this exists.

bash "$(git rev-parse --show-toplevel)/scripts/clean-drive-drift.sh" --fix --quiet || true
```

`.husky/post-merge` and `.husky/post-checkout`: identical body, adjusted comment (self-heal after a pull/merge or after switching branches, respectively).

Also call the cleaner directly from whatever script the manager's `prepare`/`postinstall` step runs, so **every `npm install` self-heals too** — this fires far more often than any single git hook, which meaningfully narrows the window where corruption can sit undetected. Example (`scripts/release/install-local-husky-hooks.js` in this repo):

```js
// Runs on every `npm install` (via the `prepare` lifecycle script), which is
// far more frequent than any single git hook -- catches Google Drive
// conflict-copy corruption even between commits/merges/checkouts, when no
// git hook would otherwise fire.
if (fs.existsSync(gitDir) && fs.existsSync(driftCleaner)) {
  spawnSync('bash', [driftCleaner, '--fix', '--quiet'], { cwd: ROOT, stdio: 'inherit' });
}
```

### Variant B — the repo has no existing hook manager

A plain `.githooks` directory is fine here, since nothing else is competing for `core.hooksPath`:

`.githooks/pre-commit`, `.githooks/post-merge`, `.githooks/post-checkout`:
```sh
#!/bin/sh
_dg_root="$(git rev-parse --show-toplevel 2>/dev/null)"
[ -f "$_dg_root/scripts/clean-drive-drift.sh" ] && bash "$_dg_root/scripts/clean-drive-drift.sh" --fix --quiet || true
```

```bash
chmod +x .githooks/*
git config core.hooksPath .githooks
```

**⚠️ Durability gap unique to Variant B:** `core.hooksPath` is stored in the local, per-clone `.git/config` — it is **never committed** and does **not** survive a fresh clone (including the recovery clone you'll do after a corruption event, which is exactly when this guardrail matters most). There is no way to make this fully automatic through git config alone. Mitigate with a loud, explicit note in step 8 of the install checklist below, plus Piece 4 (which does not depend on `core.hooksPath`).

---

## 5. Piece 3 — the one canonical doc, referenced everywhere (don't duplicate the explanation)

Keep the full explanation in exactly one place — this file. Every other doc in the repo that needs to mention this should be a short pointer, not a re-explanation, so the docs can't drift out of sync with each other the way `CLAUDE.md` and `AGENTS.md` did here before this file existed.

Paste this short block into every agent-instruction file your tooling reads (`CLAUDE.md`, `AGENTS.md`, `.cursorrules`, `.github/copilot-instructions.md`, or equivalent):

```markdown
## Google Drive drift (ALL agents & tools — read this)

This repo is checked out inside Google Drive and synced across machines, which
can corrupt .git (see docs/runbooks/google-drive-drift.md for the full
explanation and install kit). Before starting work, and before committing:

    scripts/clean-drive-drift.sh --fix      # remove conflict-copies + verify with git fsck
    scripts/clean-drive-drift.sh --check    # report only (exit 1 if any found)

This also runs automatically via git hooks, on every `npm install`, and (for
Claude Code) at session start. Never commit a file whose name ends in ` 2` /
` 3` — it is Drive junk, not a real file.
```

---

## 6. Piece 4 — Claude Code session-start layer (optional, additive)

Git hooks (Piece 2) are reactive — they only fire on `commit`/`merge`/`checkout`. Google Drive syncs, and can drop conflict-copy junk into `.git/objects`/`.git/refs`, entirely in the background, with no git command running at all. `git status`, `git fetch`, and `git fsck` do **not** trigger any hook. If you're using Claude Code, close part of that gap with a `SessionStart` hook that runs the cleaner at the beginning of every session, independent of git events:

`.claude/settings.json`:
```json
{
  "hooks": {
    "SessionStart": [
      {
        "hooks": [
          {
            "type": "command",
            "command": "bash \"$CLAUDE_PROJECT_DIR/scripts/clean-drive-drift.sh\" --fix --quiet || true"
          }
        ]
      }
    ]
  }
}
```

**⚠️ This has the same durability problem as `core.hooksPath`, wearing a different hat:** `.claude/` is very commonly blanket-gitignored, which means `settings.json` never survives a clone either. Carve out an explicit exception in `.gitignore` so the hook config is tracked while genuinely personal, machine-specific files stay untracked:

```gitignore
# .claude/ holds machine-local Claude Code config. settings.local.json carries
# personal permission overrides and must stay untracked, but settings.json
# (the Drive-drift SessionStart hook) and launch.json (dev-server config)
# must be shared -- a blanket .claude/ ignore silently drops this guardrail on
# clone -- exactly the gap that let this repo's .git corrupt three times
# before anyone noticed the guardrail wasn't actually wired up.
.claude/*
!.claude/settings.json
!.claude/launch.json
```

Other AI coding tools with their own session/startup hook mechanism (if any) can wire the identical command in the same spirit — the point is "run the cleaner as early as possible in any new working session," not anything Claude-specific.

---

## 7. If the repo is already corrupted right now

Don't hand-repair individual corrupted git objects. GitHub (or whatever your remote is) is the actual source of truth; a Drive-mounted checkout is just a viewer/editor copy of it.

1. Rename the corrupted checkout aside (don't delete — non-destructive safety net in case uncommitted work is trapped in the working tree): `mv myrepo myrepo-corrupted-$(date +%Y%m%d)`
2. `git clone <remote-url> myrepo` fresh, outside interference from the renamed folder.
3. Diff the renamed-aside working tree against the fresh clone for any uncommitted work worth recovering, then discard the corrupted copy once you're satisfied nothing is lost.
4. Re-run the one-time install checklist below in the fresh clone if the guardrail wasn't already committed to the remote.

---

## 8. One-time install checklist (new repo)

1. **Check for an existing hook manager first** (the two commands at the top of §4) — this decides Variant A vs B. Skipping this check is exactly what caused this guardrail to silently no-op the first time it was installed elsewhere.
2. Save §3 to `scripts/clean-drive-drift.sh`; `chmod +x` it.
3. Wire hooks per Variant A or B (§4).
4. Copy this entire file to `docs/runbooks/google-drive-drift.md` in the target repo (or link to wherever your org keeps shared runbooks), then paste the short pointer block (§5) into `CLAUDE.md`/`AGENTS.md`/`.cursorrules`/equivalent.
5. If using Claude Code: fix `.gitignore` per §6 **before** creating `.claude/settings.json`, then create it.
6. Clean once now: `scripts/clean-drive-drift.sh --fix`.
7. Commit everything together, then **verify it actually fires** — don't trust that hooks "should" work:
   ```bash
   touch "test 2.txt"; git add -A; git commit -m "test: verify drift guardrail"
   git show --stat HEAD   # confirm "test 2.txt" is NOT in the commit
   ```
8. **On every fresh clone of a Variant-B repo** (including a corruption-recovery re-clone), re-run `git config core.hooksPath .githooks` by hand — this still does not travel with the repo's committed files. Variant A repos don't have this problem, since the hook manager reinstalls itself via its own install step.

---

## 9. Operational gotchas

- Run the cleaner from inside the target repo — it `cd`s to its own git root via `git rev-parse --show-toplevel`, so it's safe to invoke from any subdirectory.
- `find` over `.git` on a Drive-synced folder can be slow or stall under active syncing; if scripting this across many repos in a loop, wrap each call in a timeout.
- Repos may be on a non-default branch (e.g. `staging`) when this fires — the cleaner doesn't care about branch, but remember to push whatever branch you're actually on afterward.
- Best long-term option, if it's available to you: keep git repos **outside** Drive-synced folders entirely and rely on GitHub (or your remote) for cross-machine sync — sync the rest of a project's assets via Drive if needed, but not `.git` itself. If a repo must stay inside Drive, this guardrail is a mitigation, not a guarantee: Drive can still write junk between any two checks.

---

## 10. History / attribution

Originally authored 2026-07-02 as a `core.hooksPath`-based guardrail. That version was committed correctly but was fully inert in practice: this repo already used Husky, whose own `prepare` install step resets `core.hooksPath` on every `npm install`, silently un-wiring the standalone hooks. A second, independent gap: `.claude/settings.json` existed locally with the correct content but `.claude/` was blanket-gitignored, so it never reached any clone either — same root cause (an activation/config layer that's real but non-durable) wearing a different hat. Diagnosed and hardened into the current Variant A / Piece 4 form on 2026-07-05, and verified end-to-end the same day (§8 step 7). Consolidated into this single canonical doc — replacing near-duplicate explanations that had begun drifting apart between `CLAUDE.md` and `AGENTS.md` — on 2026-06-28.
