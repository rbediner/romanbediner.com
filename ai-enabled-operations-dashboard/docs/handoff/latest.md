# AI-Enabled Operations Dashboard — Handoff
**Session date:** 2026-04-20

## Status
- **Release complete.** `staging` and `prod` are both at `3a4852b` and GitHub Pages is serving the build at `https://rbediner.github.io/ai-enabled-operations-dashboard/`.
- This docs pass: de-clientization and repo rename. Repo renamed from `canopy-exec-dashboard` to `ai-enabled-operations-dashboard`. README rewritten as clean public artifact doc. Internal Canopy/old-repo-name references scrubbed from docs.

## What Changed This Session
- **Repo renamed.** `rbediner/canopy-exec-dashboard` → `rbediner/ai-enabled-operations-dashboard`. GitHub redirects old URLs automatically but all internal references have been updated.
- **README rewritten.** Clean public artifact README — no internal agent instructions, no client-specific framing, no Cloudflare tunnel workflow details. Now introduces the dashboard as a standalone public artifact with usage, customization, and build/deploy instructions.
- **`package.json` name updated.** `exec-operating-screen` → `ai-enabled-operations-dashboard`.
- **`docs/HANDOFF-SOP.md` updated.** `canopy-exec-dashboard` repo URL references replaced with `ai-enabled-operations-dashboard`.
- **`docs/PRD.md` updated.** Same URL scrub.
- **This handoff file updated.**

## Current Branch / Head
- `staging`: `3a4852b` (dashboard code unchanged — this is a docs-only pass)
- `prod`: `3a4852b` (unchanged)
- Source repo: `https://github.com/rbediner/ai-enabled-operations-dashboard`
- Live site: `https://rbediner.github.io/ai-enabled-operations-dashboard/`

## Context: Migration to romanbediner.com
This standalone repo is now the **public source repository** for the dashboard artifact. The canonical live dashboard experience is being migrated to [romanbediner.com](https://romanbediner.com/resources/ai-enabled-operations-dashboard/), where it runs embedded in a dedicated resource page under the website's staging/prod release model.

The public source repo (this repo) remains for:
- Public artifact distribution
- Repomix / tooling packaging
- Direct fork and adaptation

The website (`rbediner/romanbediner.com`) owns the live embedded experience going forward.

## Next Steps (Phase 4 — dashboard import into romanbediner.com)
- Import the dashboard source from this repo into `romanbediner.com` under a dedicated `ai-enabled-operations-dashboard/` folder
- Do NOT create a nested `.git` directory
- Wire the imported source into the resource page iframe
- Set up sync automation so future changes here also land in the website repo

## Cloudflare Preview Path
- Local app: `http://127.0.0.1:5173/`
- Stakeholder tunnel: run `npm run dev` + `npm run tunnel` to regenerate a `https://...trycloudflare.com` URL on demand.

## Production Release Status
- Pages deploy from the last promotion (`3a4852b`) ran green.
- On the next code promotion, monitor with `gh run watch <run-id> --repo rbediner/ai-enabled-operations-dashboard --exit-status` before reporting done.

---

## Append-Only Note (2026-04-21)

- Website hotfix context: romanbediner.com resources hub now marks the dashboard card as `Coming Soon` and disables the hub CTA link pending readiness.
- Source dashboard repository remains unchanged functionally; this note is for cross-repo rollout awareness.

---

## Append-Only Note (2026-04-21, CTA visual lock)

- Cross-repo note: website resources hub dashboard CTA disabled state was visually hardened to a grey pill for cache-resilient rendering.
- No dashboard source behavior changed in this repository.
