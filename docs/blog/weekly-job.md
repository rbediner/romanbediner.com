# Weekly blog job and owner controls

The canonical product contract is [the PRD](weekly-publishing-prd.md). This runbook is portable Git input, not a claim that scheduling or delivery has been activated.

## Cloud job

Run Wednesday at 02:00 in **America/New_York**, including daylight saving changes. Aim for verified staging by 05:45 and email plus the existing Remy notification by 06:00. Use the published **romanbediner.com** cloud environment and existing GitHub / Roman Google Workspace connections. Never use an unrelated project's environment, a Mac relay, new credentials or paid API billing.

The existing Remy owns the recurrence and creates the real cloud article child through native `cloud_threads.create`, with the verified website source configuration and requested GPT-6.1 Sol High settings. The platform terminal callback returns to Remy; Remy must read the actual result before notifying Roman. This route passed the real routing pilot. A `parentThreadId=null` readback alone cannot diagnose routing: the successful native callback also had that field. Keep the genuine child URL as the edit destination; each completed revision returns through the same supported route. Verify Actions dispatch/cancel authority with the actual publication intent; public metadata reads or a Git dry-run alone cannot prove it.

At each run, read the current Git version of AGENTS.md, README.md, handoff, this runbook and both `.agents/skills/bediner-blog-*` skills. Verify the current production/staging refs, available subscription headroom and Node 20. A cached workspace is not current source. Fetch the observed refs, preserve concurrent changes and create an isolated article branch from production. Keep one article job active; do not include unrelated staging work.

Research the previous Wednesday–Tuesday AIDB window with **GPT-6.1 Sol High**. Use the research skill's complete transcript coverage, verified original sources and claim ledger. Build the article, original site-style diagram, hub card, metadata and analytics with **GPT-6.1 Sol Medium** where the platform supports a bounded build worker; retain High when it cannot switch safely. Invoke a separate read-only reviewer generation at **High**, with the frozen draft, sources and QA evidence. Resolve findings and record actual producer/reviewer identities. Do not turn an invented PASS string into a review receipt.

Run the relevant local gates, normal hooks and exact-source CI/Deploy Staging. Inspect the deployed desktop/phone article and diagram controls. Retain a frozen preview artifact, source/base SHA, complete changed-file hashes and the genuine originating or continuation chat URL. If any required proof or deadline cannot be met, deliver an honest blocker and preserve the draft; do not send an unverified ready link.

## Authenticated publication review

`Publish Reviewed Blog` is a manually dispatched Actions workflow on trusted `staging`. Its input is a frozen JSON packet, not executable candidate code. It prepares the review read-only; the production writer waits at the **blog-production-review** environment with **rbediner as the only reviewer** and **administrator bypass disabled**. This environment must be configured and read back before activation.

Packet version 1 contains `articleId`, positive `revision`, full `sourceSha`/`baseSha`, `kind` (`article` or explicit `maintenance`), actual `producerRun`/`reviewerRun`, `reviewerVerdict: "PASS"`, `reviewReceipt: {pullRequest, summaryCommentId}`, and `files: [{path, sha256}]`. The files must equal the complete release delta. Article scope is derived from actual content metadata; maintenance scope is shown explicitly to the owner.

Retain the actual native Codex GitHub App summary receipt (observed bot ID **199175422**, App ID **1144995**) on the candidate PR. The current provider-managed `codex-review-state:v1` record must say code review is completed for the exact candidate commit, with both findings flags explicitly false. Validate the native author/App, current summary identity and PR head; reject pending, missing, negative, superseded or dismissed current reviews. Do not ask the integration to emit an invented PASS marker: the live pilot demonstrated its actual structured receipt. The commit cryptographically binds the complete reviewed tree; the gate separately verifies every manifest byte using deterministic bytewise path order. A merge commit is eligible only when the API proves its complete Git tree equals that reviewed tree; both identities are retained.

The protected writer rechecks current production ancestry, manifest bytes, exact-source staging CI/deployment, preview identity, native review and authenticated owner approval. It fast-forwards production without force. Both receiving CI and deployment workflows reject a requested SHA that differs from their immutable event SHA. Every production deployment, including manual dispatch, waits for green CI for that SHA. After normal release verification, fetch the approved article itself and require its exact release token, canonical identity and production indexability; generic homepage/sitemap smoke cannot establish article publication.

GitHub does not trigger other push workflows from the Actions token's ref update. Therefore the writer explicitly dispatches normal CI and Deploy Pages with the frozen `source_sha`. Before each POST it creates a durable, create-only intent at `blog-publication-state:publication/<source-sha>/<workflow>.json`. That control branch has no release trigger. A lost response or delayed run listing never permits another POST. Each result and unknown outcome is retained in the Actions artifact.

For recovery, run the same script's **read-only `reconcile` phase** with the frozen packet. Inspect the original intent and native workflow run. Reuse the original successful run; for terminal CI failures, use the normal failed-job rerun after correcting the cause. For a terminal Pages failure, inspect deployment/provider state first and use the documented normal release recovery with the same exact SHA only after absence/failure is established. Do not delete a fence, automatically create another approval run, replay an unknown dispatch or infer absence from a run-list delay.

## Email and edits

Render with `scripts/content/render-blog-review-email.js` using a coordinator-verified delivery packet. Send rich HTML through the existing identity-safe Workspace connection as **roman@romanbediner.com**, to that same address. Verify Sent identity, HTML bytes/links and message receipt. Fence notification delivery by article/revision/channel; reconcile an unknown send from Sent before any retry.

The email has three real controls:

- **Preview the article** — the verified staging article.
- **Push to prod** — the exact waiting GitHub Actions run. Roman selects **Review deployments → Approve**. Merely visiting the link cannot publish.
- **Request changes** — the verified editable generating or linked continuation chat, where Roman can type or use device dictation. Label a continuation honestly; do not call it the original producer.

All referenced source, PR, CI, deployment and PRD links are clickable. The existing Remy notification points to the same real controls; do not provision a substitute notifier.

On any edit, first cancel the prior pending approval run and verify cancellation. Preserve Roman's exact words, revise the same slug, rerun affected review/QA, and return a new frozen revision and new waiting approval run. An old email cannot approve newer bytes. Use the actual session URL exposed by the platform; never invent one from an internal ID. A one-off scheduled cloud routing proof, actual message delivery and owner approval/edit proof must pass before weekly activation.
