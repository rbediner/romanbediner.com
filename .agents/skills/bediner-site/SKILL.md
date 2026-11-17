---
name: bediner-site
description: Use when building, redesigning, auditing, or publishing a Roman Bediner website page. Single entrypoint for blogs, Framework hub/stages, Resources and artifacts, Services, About, Connect, homepage, diagrams, SEO, responsive QA and approval-bound staging/release. Routes each page type to its actual source and shared design system.
---

# Bediner Site

Use this skill for meaningful changes to romanbediner.com, especially pages that explain operating systems, AI architecture, agent fleets, integrations, or case studies. The result should feel editorial, restrained, architectural, and unusually clear: not like a generic SaaS landing page.

## Source of truth and routing

Use this skill as the entrypoint for all romanbediner.com page work. The version-controlled source is `.agents/skills/bediner-site/` in `rbediner/romanbediner.com`; the registered local `bediner-site` is its installed mirror. The Mac registration currently resolves into Roman's Skill Library. Edit the repository version first, then synchronize its files to the verified installed skill and compare bytes. Do not assume a stale local mirror or a cloud skill with a similar name is authoritative. Never replace the registration symlink or relocate unrelated skills.

Read repository `AGENTS.md`, `README.md` and `docs/handoff/latest.md` in that order before edits. Current owner instructions override historical handoff sections. Read [page-type routing](references/page-types.md) for the route being changed. For blogs, load the repository's `bediner-blog-research` and `bediner-blog-build` skills: they contain the editorial/source and generation contracts. Do not treat all page types as blog-generator inputs.

## North star

Make complex operating work understandable at a glance and credible on inspection. Lead with the idea, show the system, explain the proof, and give the reader a clear next move.

The public site is not an operating manual. Source repositories, READMEs, and internal skills provide evidence; the page should synthesize that evidence into a compelling public explanation. Never copy an internal README wholesale.

## Language rules

- Never use the phrase `why it matters` in visible copy, metadata, tests, or generated page text.
- Do not introduce em dashes or en dashes in new editorial copy. Use a period, colon, comma, or short parenthetical. Preserve approved quotations/attribution and existing intentional footer exceptions; do not blindly rewrite them.
- Treat these rules as global defaults for every page built with this skill.

## Before editing

1. Read the repository root `README.md`, then `docs/handoff/latest.md`.
2. Inspect the current branch, working tree, relevant route, shared CSS, existing diagrams, and QA tests.
3. Run `scripts/clean-drive-drift.sh --fix` and check for Drive conflict-copies before editing or committing.
4. Search the real source of truth for current claims: current skills, runtime code, README, and handoff.
5. Decide the audience and one-sentence thesis before changing copy.

## Editorial architecture

For complex architecture or case-study pages, use this sequence:

1. **Thesis** : one sharp claim about what the system makes possible.
2. **Architecture** : layers, boundaries, and closed loops.
3. **Case-study proof** : concrete capabilities enabled by the architecture.
4. **People/system map** : org chart or responsibility map with accountability.
5. **Operating model** : autonomy boundaries, memory, brain/body split, and lifecycle.
6. **Mechanisms** : model router, integrations, caching, heartbeats, cost reporting, and recovery.
7. **Delivery proof** : PR, code review, merge, deployment verification, rollback.
8. **Principles and next step** : what to copy and a clear invitation.

Slack, chat, or any single tool is a working surface, not the architecture, unless the page is specifically about that tool. Long case studies should include a compact inline orientation rail linking to Architecture, Proof, Organization, Router, Reliability, Engineering loop, and Production.

When a resource is a working system rather than a downloadable guide, distinguish the evidence level clearly. Use `REFERENCE ARCHITECTURE + BUILD REPORT` for a first-party system with no external customer or measured before-and-after outcome. Reserve `CASE STUDY + ARCHITECTURE` for work with a named context, a defined problem, and observable outcomes. Use the shared resource pattern: all-caps label, blue introductory banner, and a concise `Who This Is For` card before the long-form proof.

For a substantial downloadable artifact, name the work for what it is. Reserve `brief` for a genuinely concise summary. A deep architecture, reference implementation, or case-study follow-along should use its truthful, content-led title, such as `Agentic Operations Architecture`.

Keep the artifact and its preview in one unified resource surface. Present `Preview` first and `Download` second so the reader can inspect the work before taking it away. Keep the preview closed by default, expand it inside the same card when opened, and let the open state use the card's full available width. Render preview pages from the exact canonical PDF, say `Page` for document pages and `Slide` only for presentation decks, and do not introduce a detached second preview card. On narrow screens, use a single-column action layout, constrain controls with `min-width: 0`, and verify that the preview cannot create horizontal page overflow. Preserve the artifact's existing analytics event names, resource slug, file path, and download target while changing only the presentation layer. Verify at 1440px and 390px: open the preview, advance one page, confirm the count/label and canonical download target, then confirm no horizontal overflow.

When the artifact belongs to a resource listing, the same rule applies at the hub level: the collapsed preview belongs inside that resource's own card, not in a detached page section. Use the same canonical PDF for download and every rendered preview image, and lock their relationship with a manifest or equivalent integrity check.

For the About page's Operating Philosophy close, align the desktop paragraph measure with the outer right rail of the professional-background chapter narratives. Keep the mobile rule full-width within the page container so the wider desktop measure cannot create horizontal overflow. The current approved measure is `1010px` on desktop with `max-width: 100%` at mobile widths.

## Agentic architecture vocabulary

Prefer four layers:

- **Behavioral brain:** plain-language skills, memory, personalities, and operating rules.
- **Shared runtime:** serverless functions, schedules, event triggers, authentication, tools, and one agent loop.
- **Control plane:** model router, heartbeat ledger, handoff broker, cost ledger, reporting, health checks, and recovery.
- **Delivery body:** APIs, GitHub, CI, branches, pull requests, deployment verification, and rollback.

Foreground three loops:

- **Work loop:** trigger → skill → model → tools → memory.
- **Engineering loop:** improvement queue → Director branch/PR → independent Staff Engineer review → merge → deploy → verify/revert.
- **Reliability loop:** heartbeats + cost snapshots + cache savings + deployment status → health pass → digest/alert → recovery.

The model router is an operating policy:

- **Mechanical:** fast/low-cost model for bounded syncs, housekeeping, deterministic transforms, and snapshots.
- **Judgment:** reasoning model for digests, orchestration, improvement planning, scans, and human-facing synthesis.
- **Merge gate:** strongest independent reviewer for adversarial review, protected changes, production verification, and rollback judgment.

Read `references/diagram-system.md` for diagram grammar and `references/case-study-content.md` for proof framing.

## Visual system

Use existing site tokens and typography; do not introduce an unrelated framework or component system. Read [production-grounded design audit](references/production-design-audit.md) for heading, route and CSS ownership; do not flatten page-specific typography into one global size.

- Cormorant Garamond for display headings; DM Sans for navigation, labels, body, and UI.
- Site UI uses current `styles/site.css` tokens: accent blue `#2457d6`, primary ink `#111111`, secondary text `#555555`, white cards, muted surface `#f8fafc`. Never substitute the diagram palette for site UI tokens.
- Architecture artwork has its own semantic palette and whiteboard paper/grid. Read `references/diagram-system.md` only for those visuals; preserve page-specific semantic colors.
- Favor thin borders, generous whitespace, small shadows, restrained radius, and one clear accent. Preserve the approved restrained blue edge washes and gradients in shared surface classes; avoid unrelated gradients, glassmorphism, excessive pills, dashboard clutter, and decorative motion.

## Contained surfaces

Before adding or changing a card-like surface, read the canonical repository guide at `docs/design-system/card-surfaces/README.md`. It defines the five allowed base types: Compact Surface, Standard Content Card, Editorial Feature Card, Static Callout Surface, and Form / Input Surface. Interaction is a modifier, never a sixth type.

Use restrained editorial containment: thin borders, compact/standard/feature shadow tiers, 8/12/14px radii, one blue accent, and generous whitespace. A static surface has no pointer cursor, no lift, and no button-like hover state. Interactive and linked surfaces may lift at most 2px on pointer devices and must retain visible keyboard focus and reduced-motion support.

Never add a generic icon, emoji, Unicode symbol, repeated icon, or decorative numeric marker to a surface. Preserve approved icons, existing semantic stage colors, copy, routes, and analytics. A labeled semantic stage pill is sufficient hierarchy for Framework stages; do not add an icon tile there. Do not turn a grouping into a card merely for decoration.

For an editorial elevation pass, use a limited number of synthesis surfaces rather than covering every section in cards. Service offerings may become static two-column editorial panels when their existing distinct icons can live in compact blue-tinted tiles. Pair the existing eyebrow, a serif title, a short blue rule, and comfortably sized body copy; do not add decorative numeric markers. Keep the palette blue, white, off-white, charcoal, and existing grays. Do not borrow green or teal from reference imagery, and do not make the homepage hero or logo band card-heavy.

Card elevation must be structural, not a border-and-shadow pass. Compact questions use a concise prompt with their approved iconography only when that meaningfully improves recognition. Standard content cards use a serif title, short blue rule, explanatory copy, and quiet blue edge wash. Editorial cards preserve existing semantic structure and may use a compact icon tile only when a distinct approved source icon already exists. Decorative numeric markers are not a card-system default. Do not invent a generic icon set, reuse an icon, or make a typographic card carry a filler tile. Static callouts should synthesize one idea; forms should keep a visible label and practical controls.

On the Resources hub, keep a single flagship artifact card for the primary architecture. Supporting resources should use compact horizontal editorial rows on desktop and one-column stacks on phone. Do not make every resource an equal large vertical feature card. A resource metadata pill may grow only horizontally with its label: every pill uses the same 34px minimum height, 14px inline padding, fully rounded radius, centered 12px line-height, blue wash, and uppercase tracking. Never create a visually different pill variant merely because the label text differs. Preserve a clear 12px visual pause between a metadata pill and its serif resource title. Primary blue CTA pills share one 48px height, radius, typography, and horizontal padding; let their widths follow their labels rather than forcing equal widths.

Whenever `Bediner Advisory LLC` is visible as brand language, render the approved lockup: ink-black `Bediner`, site-blue `Advisory`, then small ink-black superscript `LLC` immediately after the `y`. Apply it consistently in footers, Services, About, Connect, callouts, and other visible identity statements. Keep the plain legal name in metadata, JSON-LD, and machine-readable fields.

## Diagram rules

Every important diagram needs a visible caption, precise `aria-label`, whiteboard paper/grid treatment, clear direction/ownership/authority/recovery paths, consistent semantic colors, and an expandable/fullscreen affordance. Preserve readable labels at desktop and mobile. Blog diagrams fit their article frame without internal horizontal scrolling and use fullscreen pinch/pan for detail. Other established diagram types may retain a scrollable frame when their actual component contract permits it. If removing a node does not change understanding, remove it.

## SEO and metadata

Each page needs an accurate title, description, canonical URL, Open Graph/Twitter metadata, and appropriate structured data. For agentic architecture pages, use supported terms such as agentic AI employees, autonomous AI software engineering, AI agents that merge pull requests, autonomous code review, multi-agent orchestration, model routing, Anthropic cost reporting, deployment verification, and rollback.

Do not claim “fully autonomous” without describing authority boundaries. Match visible copy, metadata, schema, and sitemap intent. Update `dateModified` when materially changing the page.

## Production audit guardrails

- Treat browser-console CSP errors as release blockers. Do not suppress Cloudflare beacon or GA transport policy errors in smoke tests. If a telemetry endpoint is intentionally used, add the exact endpoint to the canonical CSP and add a regression assertion.
- Self-host the site’s editorial fonts in `assets/fonts/` and declare them once in shared CSS. Do not reintroduce Google Fonts CSS, font preconnects, or an `@import`; the first render path must remain local and dependency-free.
- Keep the existing Lighthouse threshold intact. A performance regression is fixed with a measured asset, font, image, or rendering change, never by weakening the quality gate.
- Keep text-bearing blue and secondary-gray tokens at WCAG AA contrast on white. Soft blue washes may remain light because they are surfaces, not text.
- The repository `robots.txt` allows discovery. Cloudflare-managed AI crawler rules and response-security headers are production configuration, not GitHub Pages source. Keep AI reference/search discovery enabled unless Roman explicitly directs otherwise. Configure HSTS, `X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy`, and clickjacking protection at Cloudflare, then verify the live response.

## QA and release workflow

Add or update a focused static contract test for new claims/selectors. Run focused QA, metadata parity/consistency, link validation, relevant Jest/Node checks, and visual renders at 1440px, 768px, and 390px. Check hierarchy, readable text, diagram expansion, keyboard access, and horizontal overflow.

On mobile, keep the desktop thesis and the mobile scan pattern aligned: use the same all-caps primary heading at a smaller site-standard size, move the longer explanatory phrase into a supporting deck, and keep `On this page` available as a compact floating control plus an accessible inline source nav.

Before commit: run Drive drift fix/check; update durable decisions in `README.md`; update `docs/handoff/latest.md` while preserving the exact `release watcher hygiene` block; push the handoff separately with `npm run handoff:push`; push product changes to `staging`; verify staging CI, deploy, exact SHA, metadata, copy, diagrams, font loading, and a clean browser console. For contained-surface work, visually review the priority pages in a real browser at desktop and phone width, confirm no horizontal overflow, and check that static surfaces do not imply clickability. Do not promote to `prod` unless explicitly asked.

When production promotion is explicitly approved, promote only the exact tested product SHA. Confirm production CI, `Deploy Pages`, post-deploy live smoke, and `npm run release:verify-prod -- --sha <prod-sha>` before describing the release as live. For About layout changes, include direct browser geometry checks at desktop and phone widths in the handoff.

## Public-safe boundaries

Keep secrets, credentials, private stakeholder names, internal URLs, private cost values, and confidential findings out of public copy. Preserve Roman Bediner as the site identity unless explicitly asked otherwise.

## Blog conversion, sources and SEO contract

Client acquisition is the first goal. Every blog uses the established big blue article-close surface with original invitation copy tied to that article's business problem. Primary blue pill: **Explore Working Together**, linking to `mailto:roman@romanbediner.com` (verified public Connect address). Secondary action: **Learn more about Agentic Society**. Use the existing `{{cta:closing}}` generator token once; do not duplicate an opening conversion block. Preserve analytics names and accessibility.

Roman approved applying this pattern to all existing articles on November17,2026. Future design changes requested as a one-article example still need that example's approval before a bulk rollout. Design approval is not production approval.

Keep genuine supporting citations beside the claims and in **Sources**; keep **Agentic Society resources** separately labeled, never misrepresented as corroborating evidence. All public Agentic Society links carry exactly one `ref=roman-967464` plus the established sponsored rel. Independent research URLs receive no referral parameter. Include relevant verified AS resources on every blog, but do not invent links or imply unavailable events. Triple-check sources: (1) the actual destination and identity, (2) whether the text supports the specific claim, (3) final rendered inline/footer link parity. A successful HTTP status is not claim validation.

Use article-specific verified experience for bylines and invitations, not a mechanical Agentic Society role on every page. The generator supports escaped plain-text `byline`, `authorJobTitle`, `authorBio`. Do not invent Disney tenure, subscriber metrics, clients or outcomes. Keep first-person experience grounded in approved public evidence.

Do not automatically insert the rejected compensation/commission boilerplate or move it elsewhere in a review example. Draft wording is separate from publication compliance: check actual material relationships, current endorsement guidance and partner terms before publication; do not claim referral tracking or sponsored rel substitutes for any required reader-facing disclosure. No automatic production release.

For every article verify search intent and useful original content, unique truthful SEO title/description, concise visible H1, ordered headings, descriptive internal links, crawlable source links, image alt text and correct social image dimensions/type, canonical trailing-slash production URL, OG/Twitter parity, Article/Breadcrumb schema, author and accurate published/modified dates, hub/feed/sitemap inclusion and production indexability. Keep preview noindex and base-path rewriting. Preserve original publication dates; only change modification dates for real substantive changes. Do not keyword-stuff, fabricate FAQ/reviews/schema or promise rankings. Validate actual rendered HTML, not just source metadata.

Show the complete rendered invitation AND both source/resource sections. A CTA-only crop is insufficient. Provide a portable complete preview when a hosted revision is not verified; localhost only works on the computer actually serving it. Report only completed EBI rounds with evidence, distinguishing editorial rounds, QA repairs and owner corrections. Read the installed EBI skill when performing a requested EBI pass; never manufacture a round count.
