---
name: bediner-blog-build
description: Build or revise a sourced Roman Bediner blog article, hub card, diagrams and SEO metadata through verified staging using the existing static website. Production requires Roman's approval of the exact revision.
---

# Bediner Blog Build

Convert an accepted research packet into a complete site-native article and reviewable staging preview. Read the verified repository's AGENTS.md, README.md, docs/handoff/latest.md and applicable card-surface/design rules. Reuse the existing blog generator and website system; read `../bediner-site/SKILL.md` as the canonical site entrypoint and shared design/conversion/SEO contract.

## Build contract

Use repository-relative paths and the declared Node/runtime versions, never a machine-specific checkout path. Reconcile current remote staging/prod and preserve recovered or concurrent work. Start from the current production base with one serialized article job; prepare only this article's reviewed release delta. A later production fast-forward must not include unrelated pending drafts.

Write content/blog metadata and editorial source using the actual existing schema. Preserve the permanent slug through revisions. Generate the article, /blog/ card, RSS and sitemap with npm run blog:build; verify with npm run blog:check and required normal gates. Draft status is not a publishing permission.

Use existing Resources-derived headings, compact cards, pills, fonts and actions. Before making any diagram, read [the Roman Bediner diagram style](references/diagram-style.md) and inspect the existing blog SVGs and styles. This is required brand behavior: AI Daily Brief supplies research, not visual styling. Create thesis-specific SVG artwork within that established system. Test loaded-font label bounds and line spacing, shared-state relationships, mobile frame fit, visible fullscreen expansion, real pinch/pan, Zoom/Fit, keyboard access and focus/scroll return. Inspect actual desktop and phone screenshots.

Keep the visible primary heading concise enough for one natural line at desktop widths, matching the existing Resources/fleet title treatment. Put the longer argument in the subtitle/deck and retain an accurate SEO title. Do not insert forced line breaks, force nowrap or shrink the site's heading typography to fit. Verify loaded-font line count at 1024px and 1440px; allow natural wrapping on phones without overflow.

Include the research packet's verified original-source citations beside supported claims and in a Sources section, with AIDB attribution. Check the real destinations. Match article title/description, canonical, social image/alt, dates, author identity, Article/Breadcrumb structured data and relevant internal links. Preserve the shared GA4 bootstrap and production-only intent events; staging stays noindex and marks analytics as preview/debug. Verify reporting filters before claiming preview pageviews are excluded. Never describe installed analytics as verified traffic or search performance.

## Reviewable delivery

Require a separate editorial/source reviewer before delivery. Default job roles are GPT-6.1 Sol High for research and independent review, and GPT-6.1 Sol Medium for mechanical build work. The reviewer checks the frozen draft, source claims, diagrams and actual QA evidence, returning bounded findings or PASS. The builder resolves findings; neither agent can supply Roman's production approval.

After the required CI and Deploy Staging pass for the exact source SHA, verify the deployed article, hub card, diagram, links and metadata. Retain a frozen preview artifact and source/content hashes for each revision; a mutable staging URL alone is not durable approval evidence. Return the verified preview, originating chat reference if supported, revision, exact source/base SHA, QA/deploy receipts and a short editorial summary to the review coordinator. Do not send notifications unless the job's delivery configuration authorizes them.

## Approval and edits

A revision request creates a new packet/version and invalidates prior approval. An authenticated approval must bind Roman, article ID, revision, content/artwork hashes and exact tested source SHA. A click-through GET, generated ready flag or generic prior approval cannot publish. The coordinator, not the article writer, owns the durable decision record.

On approval, use the repository's normal exact-source promotion and release verification. Reconcile current prod ancestry and the reviewed delta before mutation; if the proposed article changes, return it for review. Verify production CI/deploy and the actual live revision before reporting publication. Preserve accepted receipts on an ambiguous outcome instead of replaying a deployment. Update the current PRD and isolated staging handoff using the repository's supported flow.

For the weekly job, follow the current `docs/blog/weekly-job.md`: local Wednesday research/build/staging/email is automatic; owner review, edits and production are manual. A locked screen is expected; use background commands, headless QA and the existing identity-safe email connection. Do not require an interactive browser or investigate cloud blockers. Preserve the independent source/editorial review. Deliver rich HTML with Preview staging and an actual verified editable generating chat or honestly labelled continuation. Never invent a session URL, call a GitHub run a direct publication button, or create a waiting GitHub approval run just to send this email. Roman requests changes or says “Publish this version” in Codex; no automatic email-reply pickup is active. Keep approval bound to the exact revision, preserve normal release verification and never claim a local schedule works with both Macs off.

Before implementing a review gate, inspect the actual native provider receipt. Validate its stable author/App identity, complete reviewed commit/tree and explicit current verdict. Verify the required endpoint permissions in workflow defaults and every job override. Use deterministic bytewise path order for manifest hashes, with an independently frozen real fixture; never use locale-sensitive sorting or ask for an unsupported PASS marker. Final production QA must fetch this article and verify its exact release token and canonical identity. Recovery reads must work after mutable staging/review state advances. Follow the repository's actual JS header contract and verify validator dependencies before running QA.

## Owner review corrections (November 17, 2026)

- Client acquisition is the primary editorial goal. Reuse the established big blue article-close editorial surface, with article-specific invitation copy. Put the blue `Explore Working Together` pill to `mailto:roman@romanbediner.com` first, and `Learn more about Agentic Society` second. Preserve existing event names and the exact `ref=roman-967464` parameter on every Agentic Society link, including resource lists.
- Roman approved this consistent pattern across all existing blogs on November17,2026. Every article gets relevant original closing copy, one `{{cta:closing}}` and separate source/resource sections. A future request limited to one example still requires approval before bulk rollout. No design approval authorizes production.
- Keep legitimate independent citations beside the claims they support and in an independent Sources section. Do not alter independent-source URLs with referral tracking. Separately label relevant, real Agentic Society pages as community resources, not evidence for independent research. Verify every destination; never invent a source or fill the section with unrelated links.
- Vary the author perspective when useful to the article. Use verified experience and article-specific byline/bio metadata; do not repeat the Agentic Society affiliation mechanically. Verify numerical career claims before using them. Do not infer Disney tenure or subscriber metrics from general experience.
- Do not automatically insert the rejected boilerplate `Agentic Society links are affiliate links. I may receive compensation` or its `commission` wording, or move a near-identical sentence elsewhere in a review example. Roman controls the requested draft wording. This is NOT a finding that disclosure is unnecessary: before any publication, separately assess the actual material relationship, applicable endorsement guidance and any partner-program requirements, and resolve a clear, conspicuous disclosure approach where needed. A referral URL or `rel="sponsored"` alone is not a reader-facing disclosure. Keep production manual and approval-bound.
- Show the actual rendered end of the article, including the invitation AND both independent sources and Agentic Society resources with their links. A CTA-only crop or verbal list is insufficient. Deliver full-section screenshots and a complete portable PDF when a hosted preview is not yet verified. Never give localhost as a link usable on another computer.
- Report only EBI rounds actually completed with before/after copy, test/build receipts and screenshots. Do not relabel prior editing, advisor reviews or QA retries as formal EBI rounds.
