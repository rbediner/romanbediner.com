# AI-Enabled Operations Dashboard — Handoff SOP

This project lives in a Google Drive synced folder and is version-controlled with Git.
Follow this SOP whenever picking up work from another machine or another agent.

---

## Branch Model

| Branch | Purpose |
|---|---|
| `staging` | Active development. All changes committed here first. Use this branch for local review and Cloudflare stakeholder preview. |
| `prod` | Release branch. GitHub Pages deploys from here. Fast-forward only from `staging`. |

**Rule: Never commit directly to `prod`. Always develop on `staging`, verify, then promote.**

---

## Cross-Machine Pickup SOP

When a new machine or agent takes over:

1. Read `docs/handoff/latest.md` — current state, what changed, what to do next
2. Read this SOP
3. Read `README.md`
4. Wait for Google Drive to finish syncing before editing
5. Run:

```bash
git checkout staging
git pull origin staging
npm install
npm run dev
```

6. Open `http://localhost:5173/` and confirm the dashboard loads correctly
7. Confirm the box map is intact: `T1-T6`, `D1-D4`, `C1-C3`, `M1-M3`, `H1-H4`, `O1-O3`, `R1-R4`, `B1-B11`
8. Check local branch matches the head commit in `docs/handoff/latest.md` before making any changes

---

## Release Workflow (staging → prod)

1. Develop and commit on `staging`
2. Run `npm run screenshot` — verify all 3 states look correct
3. Start the local dev server and share a Cloudflare tunnel for stakeholder approval:
   ```bash
   npm run dev
   npm run tunnel
   ```
4. Wait for `cloudflared` to print a public `https://...trycloudflare.com` URL, then paste that exact URL into the current session notes or handoff while review is active.
5. Once visually approved, promote to `prod` (fast-forward only):
   ```bash
   git checkout prod
   git merge --ff-only staging
   git push origin prod
   git checkout staging
   ```
6. GitHub Actions deploys to GitHub Pages automatically on push to `prod`
7. **Monitor the deploy to completion — do not report release as done until it is green.** Use:
   ```bash
   gh run watch <run-id> --repo rbediner/ai-enabled-operations-dashboard --exit-status
   ```
   or poll `gh run list --repo rbediner/ai-enabled-operations-dashboard --limit 1`. If the run fails, diagnose with `gh run view <run-id> --log-failed`, fix the root cause (code, workflow file, or repo settings), re-run, and only report success once a run completes `success` AND `https://rbediner.github.io/ai-enabled-operations-dashboard/` serves the new build.
8. Overwrite `docs/handoff/latest.md` with the current session state, including whether a Cloudflare review URL was generated for that session, the final `prod` commit hash, and confirmation that the Pages deploy ran green.

**Do not promote a commit to `prod` that has not been visually verified on staging.**
**Do not report a release as complete until the Pages deploy has finished successfully.**

---

## Handoff Checklist (end of every session)

1. **Overwrite `docs/handoff/latest.md`** — what changed, what still needs work, what to do next. Mandatory after every session.
2. Run `npm run screenshot` — all 3 states + verification strip must be captured
3. Run `npm run test:unit` and `npm run test:qa` — both must pass
4. If stakeholder review is needed, run `npm run tunnel` and record the generated `https://...trycloudflare.com` URL in your session notes or handoff
5. Commit everything to `staging`
6. If approved for release: promote to `prod` using the workflow above
7. Leave `staging` as the active branch with a clean working tree

---

## Google Drive Sync-Drift SOP

Before editing on any machine:

1. Wait for Google Drive desktop sync to finish
2. Confirm expected folders exist: `src`, `public`, `design`, `scripts`, `screenshots`, `docs`, `tests`
3. There should be no `dist/` or `assets/` folder — both are excluded
4. Run `git status` to confirm your working tree is clean and on `staging`
5. Open the app with `npm run dev` before making structural edits — catches partial sync states fast

If sync drift is suspected:
1. Stop editing
2. Let Drive finish syncing on both machines
3. Run `git log --oneline -5` and compare against `docs/handoff/latest.md` head commit
4. Only resume after the workspace is consistent

---

## Current Publishing Status

| Layer | Location | Status |
|---|---|---|
| Local preview | `npm run dev` → `http://localhost:5173/` | Ready |
| Stakeholder preview | `npm run tunnel` → generated `https://...trycloudflare.com` URL | On demand |
| Production build | `npm run build && npm run preview` | Ready |
| Source repo | `https://github.com/rbediner/ai-enabled-operations-dashboard` | Live |
| GitHub Pages (prod) | Deploys from `prod` branch via GitHub Actions in source repo | Enabled; waiting for first prod promotion with workflow files |

### One-Time GitHub Setup Still Required
1. In `rbediner/ai-enabled-operations-dashboard`, keep Pages set to `GitHub Actions`
2. Promote the first approved commit from `staging` to `prod`
3. After that, pushes to `prod` will deploy the live site from the source repo Pages workflow

---

## Current Implementation Layout

See `docs/handoff/latest.md` → **Repo Structure** section for the full file tree.

Key paths:
- `src/App.jsx` — overall 16:9 screen composition
- `src/data/dashboardData.js` — all metric values and labels
- `src/components/` — purpose-built dashboard components
- `src/style-layer file` — complete V2.7 design system
- `.github/workflows/deploy-pages.yml` — prod GitHub Pages deploy workflow
- (no logo asset — T1 is a text wordmark rendered in `TopStatusBar.jsx`)
- `design/wireframe-prototype.html` — layout reference
- `design/exec-dashboard-prd.gdoc` — PRD shortcut
- `package.json` — includes `npm run tunnel` for generating the staging review URL
- `scripts/capture-dashboard-screenshots.mjs` — Puppeteer screenshot + verification strip script
- `scripts/verify-dashboard.mjs` — dashboard QA verification script
- `tests/dashboardData.test.mjs` — unit tests for dashboard data
- `screenshots/` — captured dashboard states for review

---

## Safe Editing Rules

1. Preserve the wireframe hierarchy and tile mapping exactly
2. Keep the PRD metric story intact: demand solid, some stall, forecast under, margin below target but improving, capacity strained, AI rising but not magical
3. Do not substitute PRD numbers with cleaner or greener values
4. If a second machine has already committed to `staging`, pull before making changes
5. If a local file conflicts with the PRD, the PRD wins
6. **NEVER delete, move, rename, or overwrite any `.gdoc` file.** Google Doc shortcut files (e.g. `design/*.gdoc`) point to canonical source-of-truth documents — losing one breaks the link to the real doc and git cannot recover it meaningfully. This rule applies to every agent, every session. When cleaning untracked files, exclude `*.gdoc` explicitly. If a `.gdoc` is in the way of a restructure, stop and ask the user.

---

## Source of Truth

1. **Product spec (authoritative):** `docs/PRD.md` — as-built PRD for the shipped prototype
2. **Product spec (mirror):** Google Doc — `https://docs.google.com/document/d/14-eyti0nHkSi2bvVVovCS7WaUSIfHoT5f6SuoPC-eZg/edit`. Paste `docs/PRD.md` into this doc to keep it in sync. Do NOT delete `design/exec-dashboard-prd.gdoc`.
3. **Layout:** `design/wireframe-prototype.html`
4. **Current state:** `docs/handoff/latest.md`

If two sources conflict, priority is: running code > `docs/PRD.md` > Google Doc > wireframe > handoff doc.
