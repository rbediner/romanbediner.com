# Weekly AI Blog Publishing PRD

**Current owner direction: October 30, 2026 — automatic local Wednesday research/build/staging/email; manual review, edits and production publication. The local schedule is active; its first scheduled end-to-end run is not yet verified. Cloud scheduling is deferred.**

## Outcome

A genuine, sourced AI thought-leadership article for CEOs and business owners, rendered in the existing site design with a useful original diagram, Blog hub card, search/social metadata, internal links and production analytics. Every article is reviewed by Roman before production. Newsletter signup is out of scope for this release.

## Active local schedule and model

- Wednesday start: **02:00 America/New_York**.
- Verified preview target: **05:45 Eastern**; email and existing Remy delivery deadline: **06:00 Eastern**.
- Research and independent editorial review: **GPT-6.1 Sol, High reasoning**. Mechanical build work: **GPT-6.1 Sol, Medium reasoning**. The reviewer is separate from the producer and cannot supply owner approval.
- Run the actual article job locally on the owner-confirmed Mac, using background commands, headless browser QA and the existing Workspace email connection. The Mac must remain powered, awake, connected and running Codex Wednesday02:00–06:00 Eastern; its screen may be locked. This is not a cloud or both-Macs-off guarantee.
- App automation: `wednesday-blog-preview-by-6-am-eastern`, active, GPT-6.1 Sol High, Wednesday02:00 in the host America/New_York timezone. Saved schedule/model/local execution were read back. First scheduled run: November4,2026. No extra full article is generated merely to test the scheduler. A missed job while the Mac is unavailable cannot send its own failure email.
- Read current subscription headroom before admission. The 02:00 start can precede the weekly quota reset; the 06:00 deadline cannot depend on a later reset. Retain the standing admission reserve and report an honest delay if capacity or QA prevents readiness.
- Source window: previous Wednesday through Tuesday in Eastern time, including Sunday or any other published editions. Use actual coverage, not an assumed five weekdays.

## Skills and portability

The canonical definitions are [Blog Research](../../.agents/skills/bediner-blog-research/SKILL.md) and [Blog Build](../../.agents/skills/bediner-blog-build/SKILL.md). Both are source-controlled with this repository for the two Macs and a cloud checkout. The existing bediner-site design skill and repository styles supply the visual system. Do not fork a new design system or synchronize a live Git checkout through Drive. Same-version invocation on both machines and cloud remains a pilot acceptance item, not a claim established by these files existing.

## Research and editorial contract

Enumerate editions through https://aidailybrief.ai/agent.json and read every actual transcript plus companion edition in the selected window. Cache complete exact bytes and a private coverage manifest once. Missing editions/transcripts are explicit; do not silently draft from partial coverage.

Follow the underlying sources AI Daily Brief supplies, open and verify them, and place direct citations beside claims plus a Sources section. Credit AIDB and the relevant editions as the research starting point. Some current source arrays are empty; independently locate the named original reports/primary documentation and record that provenance honestly. Never fabricate citations or say AIDB supplied an independently found URL. Qualify or omit unsupported claims and preserve material disagreements between secondary and primary reporting.

Choose one lasting business decision or operating principle. News is evidence for Roman's original argument, not a chronological roundup or a rewrite of the host's argument. Read approved site copy for voice: plain connected prose, clear judgment, concrete responsibilities, practical examples and tradeoffs. Do not invent Roman's clients, tests, deployments or numerical results. Label illustrative examples. Avoid private member/client evidence and assumptions that one repository contains every agent he built. Link existing fleet/PM/framework guides rather than duplicate them. Use the referral only where relevant, with the existing disclosure requirements.

## Research-to-staging handoff

Research returns the full article, section IDs/TOC, audience/search intent/thesis, SEO suggestions, diagram specification, citation/claim ledger, coverage/hashes and evidence limitations. The builder uses actual content/blog metadata and editorial HTML, generates article/hub/RSS/sitemap, and retains the canonical author identity, GA4 bootstrap, indexability policy and design components.

Staging stays noindex and marks analytics as preview/debug. Production-only blog intent events remain fenced; report filters must be verified before claiming preview pageviews are excluded from reporting. QA covers meaningful claims/citations, source links, metadata/structured data, accessibility, desktop/phone layouts, loaded-font labels and line spacing, shared-state diagram semantics, frame-level fit, visible fullscreen expansion, trusted pinch/pan/Zoom/Fit, keyboard access and focus/scroll return. Normal hooks and CI remain in force. A source-only draft or passing local build is not a verified preview: exact-source CI, Deploy Staging and live inspection must pass before a ready link is delivered.

## Review and promotion

Article production and staging/email delivery run automatically every Wednesday. Owner review, edits and publication are manual. Build and independently review the article, run required QA, deploy staging, verify the exact source and actual desktop/phone preview, then send Roman a rich HTML email. Include the verified staging link, the exact source/revision, and a verified editable generating or continuation Codex chat. Label a continuation honestly. The email needs no GitHub navigation and must not call a GitHub run link a direct publication button.

Roman enters edits or “Publish this version” in that linked chat. This is a manual request handled by the agent; no automatic email-reply pickup, background edit execution or publication service is claimed. The agent uses the existing release process, binds approval to the exact reviewed revision, checks current production ancestry and the complete release delta, promotes only the approved version, and verifies CI/deployment and the live article. Changed article bytes invalidate prior approval. Unknown external writes are reconciled, never blindly replayed.

An email “Publish” button is optional future work only if a real supported authenticated action can be provided simply. The current email uses Preview and Open Codex. Research, source attribution, site styling, metadata, GA4, diagram behavior and release QA remain required. Newsletter signup and cloud execution are deferred; the local Wednesday staging/email job is active.

## Deferred cloud and notification implementation boundary

The public Pages website stays static. Native GitHub protected-environment approval and durable Git control records own publication; the existing Codex chat owns edits. This uses existing authentication without provisioning a separate review service. No new paid API lane, credential copying, substitute notifier named Remy or automatic publication is implied. Current local automation tooling alone does not prove a cloud routine or Remy push delivery. Verify the actual account connections and native receipts during the pilot before recurring activation.

## End-to-end acceptance

1. Run the research skill on one complete real source window and build a genuine new article, original diagram and hub card.
2. Pass the actual required local/hosted checks and verify the exact staging preview, source links, SEO and GA4 behavior.
3. Deliver that real preview through Roman's selected email and existing Remy, with verified receipts.
4. Accept one typed/dictated edit, return revision 2, and refuse approval of superseded revision 1.
5. On Roman's explicit approval of revision 2, promote only its reviewed change and verify production.
6. Prove duplicate notification/promotion handling, actual cloud execution without a Mac dependency, and same-version skill discovery on both machines.
7. Activate the Wednesday 02:00/06:00 routine only after the complete proof passes. Until then report implemented, tested, delivered and unverified parts separately.

## Measurement

The live Blog hub and first article were checked on October 29 for GA4 property G-DVHD0KL633 with one shared bootstrap each. Received GA4 reports and Search Console access remain unverified. Track organic landing sessions, engagement and relevant guide/contact actions by article; use Search Console for impressions, queries and clicks once access is verified. Traffic/ranking are measured outcomes, not guaranteed by publishing volume.

## Design review history

Roman approved the two-skill, single-review-page architecture on October 29 and changed the initial 06:45/09:00 proposal to a 02:00 start and 06:00 delivery deadline. He then authorized a real end-to-end pilot before scheduling and requested this canonical PRD in Git with a README link. The earlier Google Doc is a discussion mirror; this Git document is the maintained implementation contract.

## October 29 owner acceptance

Roman approved the attention-budget article and authorized production after the desktop title correction. The visible title is concise at site-standard typography, with loaded-font one-line checks at1024px and1440px and natural mobile wrapping. He also authorized completing and activating the Wednesday cloud routine with independent review and exact-revision owner approval before each production release. Saved scheduling and actual end-to-end implementation evidence must still be verified before claiming this routine works.
