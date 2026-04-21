# AI-Enabled Operations Dashboard — Handoff SOP

This dashboard lives inside `romanbediner.com` (private repo) as a sub-project under `ai-enabled-operations-dashboard/`. It is publicly distributed via automatic sync to `rbediner/ai-enabled-operations-dashboard` on every prod promotion that touches dashboard files.

---

## Source of Truth

| Artifact | Location |
|---|---|
| Dashboard source code | `romanbediner.com/ai-enabled-operations-dashboard/` |
| PRD | `romanbediner.com/ai-enabled-operations-dashboard/docs/PRD.md` |
| This SOP | `romanbediner.com/ai-enabled-operations-dashboard/docs/HANDOFF-SOP.md` |
| Session handoff | `romanbediner.com/ai-enabled-operations-dashboard/docs/handoff/latest.md` |
| Public distribution repo | `https://github.com/rbediner/ai-enabled-operations-dashboard` (read-only sync target) |
| Live embedded experience | `https://romanbediner.com/resources/ai-enabled-operations-dashboard/` |

**Never edit the public repo directly.** All changes go through `romanbediner.com` and sync automatically.

---

## Development Workflow

All development happens in the `romanbediner.com` private repo:

```
romanbediner.com/ai-enabled-operations-dashboard/   ← edit here
        ↓ push to staging
romanbediner.com staging branch                      ← iterate freely, no public sync
        ↓ promote to prod
romanbediner.com prod branch                         ← triggers sync to public repo
        ↓ auto-sync on prod push (sync-dashboard-public.yml)
rbediner/ai-enabled-operations-dashboard             ← public consumers see this
```

---

## Cross-Machine / Cross-Agent Pickup SOP

When a new machine or agent takes over:

1. Read `romanbediner.com/docs/handoff/latest.md` — primary session state
2. Read `romanbediner.com/README.md` — full release SOP and architecture
3. Read this file and `docs/PRD.md` for dashboard-specific context
4. Align local branch:

```bash
git checkout staging
git pull --ff-only origin staging
npm run session:ready
```

5. To run the dashboard locally:

```bash
cd ai-enabled-operations-dashboard
npm install
npm run dev
```

Open `http://localhost:5173/` and confirm dashboard loads correctly.

---

## Release Workflow (staging → prod)

Governed by `romanbediner.com` release SOP. Short form:

1. Develop and commit on `staging` in `romanbediner.com`
2. Wait for staging CI + Deploy Staging to pass
3. Promote to `prod` (fast-forward only from tested staging SHA)
4. Prod CI + Deploy Pages run automatically
5. On prod promotion, `sync-dashboard-public.yml` fires and mirrors `ai-enabled-operations-dashboard/` to the public repo
6. Update `docs/handoff/latest.md` via `npm run handoff:push` at session end

Full SOP: `romanbediner.com/README.md` → **Deployment SOP** section.

---

## PRD Update Rule

**When adding or changing dashboard features, update `docs/PRD.md` in the same commit or PR.**

This keeps the public repo's PRD current when the sync runs. Do not defer PRD updates — the public repo is the consumer-facing artifact and its docs must match the shipped code.

PRD update checklist:
- New feature? Add it to the relevant phase/section in `PRD.md`
- Behavior changed? Update the relevant spec
- Feature removed? Mark it removed or delete the entry
- After updating: commit `PRD.md` alongside the code change, not in a separate later commit

---

## Handoff Checklist (end of every session)

1. Update `docs/PRD.md` if any dashboard feature was added, changed, or removed
2. Update `docs/handoff/latest.md` — what changed, what's next
3. Commit on `staging` in `romanbediner.com`
4. Push via `npm run handoff:push` for docs-only changes, or normal commit + push for code changes
5. If promoting to prod: confirm sync ran green in GitHub Actions

---

## Safe Editing Rules

1. Preserve the wireframe hierarchy and tile mapping exactly
2. Keep the PRD metric story intact: demand solid, some stall, forecast under, margin below target but improving, capacity strained, AI rising but not magical
3. Do not substitute PRD numbers with cleaner or greener values
4. Never edit the public repo (`rbediner/ai-enabled-operations-dashboard`) directly — it is a sync target
5. If two sources conflict, priority is: running code > `docs/PRD.md` > wireframe > handoff doc
