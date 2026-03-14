# Cross-Machine Handoff (Latest)

- Handoff Sequence: 73
- Updated At (UTC): 2026-03-14T21:59:50Z
- Source Branch: codex/prod-promote
- Source Commit: 5dc42d6e21f3a4f9e334830fa7d6eb02bcfbf84a

## Current State
- Remote branches are aligned:
  - `origin/staging` -> `5dc42d6e21f3a4f9e334830fa7d6eb02bcfbf84a`
  - `origin/prod` -> `5dc42d6e21f3a4f9e334830fa7d6eb02bcfbf84a`
- Session change:
  - README now includes an explicit "Fresh Machine Dependency Baseline (Required)" section with exact bootstrap commands and required GitHub repo-level preview settings.

## What Changed In This Session
1. Cross-machine operator docs were tightened for onboarding clarity:
   - `/README.md` now enumerates machine prerequisites and exact setup commands.
2. Preview/deploy prerequisites are now explicit in docs:
   - required secret/variables in `rbediner/romanbediner.com`
   - required branch/pages settings in `rbediner/romanbediner-preview`

## Validation Performed
- Documentation-only update. No code/runtime behavior changed.
- Regression not rerun in this handoff update session.

## Fresh Machine Prerequisites (Operator Quick List)
1. Install `git`.
2. Install `nvm`, then activate Node 20:
   - `nvm install`
   - `nvm use`
3. Install repo dependencies:
   - `npm ci`
4. Install Python QA dependencies:
   - `python3 -m pip install --upgrade pip`
   - `python3 -m pip install playwright==1.58.0 pillow==11.3.0`
   - `python3 -m playwright install chromium`
5. Install/auth GitHub CLI:
   - `gh auth login --web --scopes repo,workflow`
6. Validate environment:
   - `npm run session:ready`

## Required Startup Order (Next Machine / Next Codex Session)
1. Read `/README.md`
2. Read `/docs/handoff/latest.md`
3. Read `/docs/architecture/repo-contract.json`
4. Run `npm run session:ready`

## Operator Notes
- Staging preview URL:
  - `https://rbediner.github.io/romanbediner-preview/`
- Promotion discipline remains strict:
  - `staging` fast gate + preview review
  - promote exact approved SHA to `prod`
  - `prod` full gate + deploy + post-deploy validation
- No CI caching added (per operator preference).
- Ensure preview wiring exists before expecting staging preview publication:
  - secret `PREVIEW_REPO_TOKEN`
  - variables `PREVIEW_REPO` and `PREVIEW_REPO_BRANCH=staging-preview`
  - preview repo Pages source set to `staging-preview` root
