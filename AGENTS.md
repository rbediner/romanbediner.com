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
- After any meaningful product change, also update the live PRD in Google Docs: `SEO Authority PRD` (`https://docs.google.com/document/d/15WTgARcQl8jlKuqYtQdxBucWjEsXvrxnGNqbB0xTbE8/edit`).
- Treat the PRD update as required when a session adds or changes a feature, deploy-worthy behavior, UX rule, analytics rule, metadata rule, information architecture decision, content-system rule, or any other product-level decision that changes how the site works or what it promises.
