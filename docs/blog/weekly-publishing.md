# Weekly publishing workflow

**Owner decision, October 26, 2026:** This is a proposed workflow, not an approved pipeline PRD. Scheduling and further automation work are deferred until the first blog hub and Agentic Society article have been reviewed. Next: discuss the complete research-to-draft-to-review pipeline, document the agreed PRD, and only then decide whether to schedule a routine.

The goal is a useful body of operator knowledge that attracts the right readers and gives them an honest next step: evaluate Agentic Society, use Roman’s Framework, or start a conversation with Roman. Roman’s title is **Fractional COO at Agentic Society**. Publishing frequency is a working cadence, not a reason to ship weak or unsupported content.

This repository includes an offline brief generator. It does not write articles, call a model, fetch sources, send messages, activate a schedule, or publish to any environment. Article drafting and the public article record use a separate schema owned by the website generator.

## Run a weekly brief

Requires Node.js 20 or later. Run from the repository root. There are no additional packages.

```sh
node scripts/content/blog-pipeline.js --help
node scripts/content/blog-pipeline.js --week 2026-11-02 --output ../blog-work
node scripts/content/blog-pipeline.js --week 2026-11-02 --output ../blog-work --write
```

The first command displays usage. The second prints a complete JSON brief without creating a directory or file. The third writes `../blog-work/2026-11-02.brief.json`. The output directory must be outside this repository, including through symbolic links. Use a private local directory that is not served by a web server or synced to a public destination. New directories are requested with mode `0700`; new briefs with `0600`. Existing directory permissions are unchanged.

`--week` is an actual Monday, interpreted as an editorial week label, not a scheduled execution time. If omitted, it uses the current Monday in `America/New_York`. The date does not activate anything. `--output` defaults to `../blog-work` relative to the repository location. Explicit relative paths are resolved from the shell’s working directory.

The generator reads `docs/blog/editorial-backlog.json` in order, selects the first `planned` topic whose slug has not appeared in that output directory, and snapshots it into a review-only brief. `in-progress`, `hold` and `published` entries are skipped. The initial Agentic Society article is already `in-progress`; its article route is `/blog/agentic-society/`. The backlog is a set of hypotheses, not confirmation that an agent is deployed or a claim is verified.

A repeat invocation for the same week reports `existing` and returns the saved brief, without overwriting it. Later weeks select the next unused topic. Preserve the output directory across runs to retain selection history. Moving or deleting its records changes that history. Use one canonical output directory and one writer at a time; there is no distributed scheduler or multi-process queue. Exclusive file creation prevents overwriting even if two writers race for the same week.

Invalid dates, unknown or duplicate options, output inside the repository, duplicate backlog slugs, malformed history and an exhausted backlog produce a descriptive error and a nonzero exit status. Review a damaged history file explicitly instead of deleting it to make the error disappear. The generator never changes backlog statuses. After editorial decisions, update the relevant status deliberately.

## The editorial path

1. **Source intake.** Collect candidate lessons from Roman’s reviewed build notes, public project materials, approved demonstrations, the current Agentic Society site, and primary documentation for timely news. Record where each statement came from and when it was checked.
2. **Brief.** Run the command above. Choose a specific audience, search intent, operator question, thesis and original lesson. Complete the evidence requests before treating the brief as ready for drafting.
3. **Article drafting.** Write a substantive article in the private workspace. Include Roman’s actual decision, alternatives, limitations and a practical next step. A simple workflow diagram or clearly labeled synthetic example should clarify the lesson. The brief is not a Markdown article generator and must not be copied into public content as-is.
4. **Human review.** Resolve every applicable checklist item. Maintain a claim ledger with the exact claim, public supporting URL, retrieval date, context, and reviewer conclusion. Non-applicable items need a written reason. Verify attribution, public suitability, and the difference between current functionality and a proposal.
5. **Static build.** Only reviewed public article content enters the site’s article records. Run the repository’s required validation and public route generation; check canonical URLs, metadata, links, accessibility and sitemap inclusion using the website’s existing tooling.
6. **Staging review.** Build a preview with the existing design system. Check desktop and mobile, referral links, disclosure placement, navigation and visual clarity. Record the exact staging revision and review link.
7. **Production approval.** Roman must explicitly approve the exact reviewed revision before production. A generated brief, a passed build, a draft batch, and the passage of a week never authorize production. This script contains no production action.

Every brief starts with `publication.state: "brief"`, both approvals false, and every review requirement pending. Those fields are editorial records, not deployment credentials or an approval bypass. Review and deployment controls remain separate.

## Evidence from the work Roman actually builds

The Slack-Agents repository is a candidate source, not a complete inventory. Reconcile it with Roman’s other approved repositories and project records before claiming the breadth of his work. Distinguish active agents, tools, skills, experiments and proposed systems. Do not give the fleet a fixed count based on one repository.

Examples worth investigating include the news-to-business-decision workflow, shared memory and lessons, task follow-through, revenue operations, and human review of proposed advice. Confirm the relevant implementation and operating status before using any example. A code path proves what is implemented, not how widely it is used or what financial result it produced.

The internal story-bank pattern provides a useful editorial distinction: a mined candidate is not a testimonial ready to publish. Internal staff wins are not member outcomes. Check quotes in context, avoid repeating the same story as multiple independent results, and obtain permission for identifiable member or client stories. Proposals discussed in a Hot Seat are not decisions the room adopted, and neither automatically proves a business result.

Public sources can support public claims after verification. Private source links may guide the researcher but must not appear as accessible proof in a public article. Never export raw internal conversations, IDs, account details, commissions, payout records, customer records, confidential procedures, or credentials into the backlog, briefs intended for sharing, article records, screenshots or generated pages. The committed backlog contains generic editorial prompts only.

## Conversion without eroding trust

Match the CTA to the reader’s next decision. For implementation and community fit, a disclosed Agentic Society referral can be appropriate. For a narrow workflow lesson, a Framework link or a conversation with Roman may be more helpful. Do not force an affiliate CTA into every article.

Verify the referral URL before each relevant staging review:

`https://agenticsociety.com?ref=roman-967464`

Place a plain disclosure before or near the first referral CTA, visible without expanding a panel:

> I serve as Fractional COO at Agentic Society. If you join through my referral link, I may earn a commission.

Use `rel="sponsored noopener"` on referral links and preserve the referral parameter. Describe current offer details from the official site. Do not add pricing or present Roman’s private internal agents as benefits included with membership unless explicitly verified. Never invent revenue, ROI, time savings, testimonials, conversion rates, scarcity or guarantees.

Measure the funnel in separate steps once the existing analytics setup supports them: article discovery, engaged reading, relevant CTA clicks, and partner-confirmed signups. A click is not a signup; traffic is not a commission. Establish a baseline before claiming improvements, and avoid introducing personal tracking or sending customer data as part of this workflow.

## Weekly cadence and future automation

Start with one useful article per week. Review the backlog against actual shipped work, reader questions and current primary sources. Revisit existing articles when an offer, product feature or operating lesson changes. Search terms in the backlog are research hypotheses, not keyword-volume data or ranking promises. Current Google guidance should inform editorial review, including helpful content and scaled content abuse policies; bulk output alone is not an SEO strategy.

No weekly job is activated by this change. Roman wants weekly drafts sent for his review. After he reviews the initial staging result and approves an operating cadence and delivery destination, a separate scheduling task can prepare drafts into that review queue. A future Remy handoff is optional and requires a separate setup; none is activated here. Even an approved batch must have explicit article and revision approval before release. Automated source intake must preserve permissions and evidence provenance. Production automation requires a separate explicit decision; it is not the default next stage of this script.

This keeps weekly preparation repeatable while letting Roman review what represents him publicly.
