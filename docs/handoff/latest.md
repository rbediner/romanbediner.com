# Cross-Machine Handoff (Latest)

- Handoff Sequence: 72
- Updated At (UTC): 2026-03-14T12:42:41Z
- Source Branch: codex/prod-promote
- Source Commit: 992807dc75a3290c14ade4f859ed3a944659b1f9 (pre-handoff baseline)

## Current State
- Remote branches are aligned:
  - `origin/staging` -> `992807dc75a3290c14ade4f859ed3a944659b1f9`
  - `origin/prod` -> `992807dc75a3290c14ade4f859ed3a944659b1f9`
- This session includes one additional local, unpushed docs/tooling update at handoff time:
  - add GitHub CLI (`gh`) operator setup guidance in README for better cross-machine workflow monitoring.

## What Changed In This Session
1. Production deploy model was stabilized:
   - `/.github/workflows/deploy-pages.yml` uses `push` on `prod` and explicit CI success gating for the exact SHA.
2. API reliability guard was added:
   - prod CI monitor step passes `GITHUB_TOKEN` to avoid unauthenticated rate-limit failures.
3. Step-order bug was fixed:
   - checkout now runs before CI monitor invocation in deploy workflow.
4. Architecture and guardrail contracts updated:
   - `/README.md` deployment bullets updated.
   - `/QA/tests/test-ci-gate-profile-automation.js` updated to enforce tokenized SHA-gated prod deploy behavior.

## Validation Performed
- `npm run docs:generate` PASS
- `npm run test:node` PASS
- `npm run test:jest` PASS
- Latest confirmed prod green (for `992807dc75a3290c14ade4f859ed3a944659b1f9`):
  - CI success: https://github.com/rbediner/romanbediner.com/actions/runs/23075564619
  - Deploy Pages success: https://github.com/rbediner/romanbediner.com/actions/runs/23075564612

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
- Local operator tooling now includes GitHub CLI:
  - installed binary: `~/.local/bin/gh`
  - shell path update: `~/.zshrc` includes `export PATH="$HOME/.local/bin:$PATH"`
