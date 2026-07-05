# Replication guide: GA4 + Looker Studio + daily-digest Worker

Point an agent at this single file to replicate the whole
romanbediner.com analytics stack for a **different property** (a different
site, a different domain). It assumes no prior context about
romanbediner.com specifically -- everything property-specific here is a
placeholder to fill in, not a fact to copy.

The stack has three parts, built and wired in this order:

1. GA4 property + service account (read access for the Worker)
2. Looker Studio dashboard (human-facing, full detail, scheduled PDF email)
3. Cloudflare Worker "digest" (machine-generated narrative email, once/day)

Do not build (2) or (3) before (1) -- both depend on the property already
existing and receiving events.

## 0. Prerequisites

- The target site already fires GA4 events via `gtag.js` (or equivalent) into
  a GA4 property. If it doesn't yet, set that up first -- this guide starts
  from "a GA4 property with data in it," not from zero instrumentation.
- A Cloudflare account with a DNS zone for the target domain (needed if the
  Worker will send from a subdomain address via Resend, e.g.
  `digest@yourdomain.com`).
- A Resend account (or equivalent transactional-email API) with a domain
  verified for sending.

## 1. GA4 service account (read access for the Worker)

1. In Google Cloud Console, pick or create a project. Reusing an existing
   project on the same Google account is fine -- this doesn't need to be a
   dedicated project, just a dedicated *service account* within it.
2. Enable the **Google Analytics Data API** on that project.
3. **IAM & Admin -> Service Accounts -> Create service account.** Name it
   something identifiable, e.g. `<property-slug>-analytics-digest`. No
   project-level IAM role needed -- access is granted at the GA4 property
   level in the next step, not via Cloud IAM.
4. In **GA4 Admin -> Property Access Management** (for the target property),
   add the service account's email as a user with **Viewer** role. This is
   the only access it needs or should have.
5. Generate a JSON key for the service account (**Keys tab -> Add key ->
   Create new key -> JSON**). This file is a credential -- treat it exactly
   like a password:
   - Never let an agent/LLM session read or echo its contents.
   - It gets piped directly into `wrangler secret put` (step 3 below) and
     then should be deleted from wherever it downloaded.
6. Note the **GA4 property ID** (numeric, found in GA4 Admin -> Property
   Settings) -- needed for both the Worker config and the Looker Studio
   report's data source.

## 2. Looker Studio dashboard

This is the human-facing report -- build it directly in the Looker Studio UI
(no local files; everything lives in Google's hosted state). There's no way
to script this part; a human (or an agent driving a browser) builds it once.

**Recommended page structure** (5 pages, in this order -- behavior before
vanity metrics):

1. **Executive Summary** -- headline numbers + a one-paragraph "Daily
   Briefing" text block giving a plain-English read of the current trend.
   Default comparison: 7-day trailing vs. the 7 days before that (not
   day-over-day -- too noisy on low-traffic sites).
2. **Key Actions** -- a table/trend of every real interaction event (see
   "event taxonomy" concept below), explicitly excluding passive/automatic
   events so the page is about what visitors *did*, not just that they
   loaded a page. Include per-event deltas vs. the previous period, and
   surface any tracked "key" event that had zero volume in the window
   (silence should be visible, not just absent from the table).
3. **Audience & Devices** -- who's visiting and on what. Caption any
   `(not set)` buckets (see below) so they don't read as a tracking bug.
4. **Traffic Sources & Landing Pages** -- where visitors came from and what
   page they landed on. Avoid duplicating the Key Actions page's per-event
   breakdown here -- if you're tempted to add a raw "Top Events" table on
   this page, don't; it's the same data as page 2 with none of that page's
   filtering context, and is a maintenance/redundancy trap (this stack hit
   that exact mistake once -- see the "Structure" section below).
5. **Top Pages** -- most-viewed pages by URL/path, with % of tracked
   pageviews for context. Do not also duplicate an eCommerce-style
   "Conversions" table on this page unless the property actually has
   conversion events configured -- an empty/unused eCommerce section is
   dead weight on both the page and the Data panel's field picker (a
   zero-referenced blended eCommerce data source was found and removed from
   this exact report during cleanup; don't recreate that pattern).

**Report-wide traffic exclusions:** define ONE compound filter (not several
separate ones) with an `AND` of:

- Exclude rows where `pagePath` contains your preview/staging marker string
  (whatever your deploy pipeline uses to distinguish staging from prod
  paths, e.g. a `-preview` suffix).
- Exclude rows where `sessionSource` contains `localhost` (local dev
  traffic).

Apply this one filter to every chart on every page that shows traffic
volume. Don't create per-page or per-chart duplicates of the same logic --
that's how a report ends up with 16 filters where 4 would do (this
happened here; recovering from it took a full filter audit, see
"Structure" below).

**Event-name filters:** if you need to exclude a list of passive/automatic
event names from an interaction-focused table, use one filter with a
RegExp or in-list exclusion covering the whole list, named descriptively
(e.g. `Exclude passive events`) -- not one identically-named filter per
event, which is indistinguishable in the filter list and impossible to
audit later.

**Caption every page** with a one-line note of what's excluded and the date
range (e.g. "Excludes preview/staging and localhost traffic. Last 28
days."). Someone looking at a number six months from now needs to know
what it does and doesn't include without archaeology.

**Schedule the PDF email** via `File > Schedule email delivery` inside
Looker Studio, at whatever cadence the property owner wants (once/day is
the pattern used here, matching the digest Worker's cadence so both land
around the same time).

### Structure lessons learned (apply these from the start, don't rediscover them)

- **Filters with a "Missing"/"Invalid" field reference can't be repaired.**
  If Save stays disabled after fixing the Name, delete and recreate rather
  than debugging further.
- **A filter with an empty value silently matches nothing** (renders `0`
  regardless of real data) if "Show suggested values while typing" was on
  when you typed a value with zero historical occurrences. Toggle that
  switch off before defining a filter for a genuinely rare/zero-volume
  value, and always verify the value column is populated in Manage
  Filters afterward.
- **Never bulk-reposition a multi-selected group with repeated arrow-key
  presses** (e.g. `repeat: 100`) to close a layout gap. This has corrupted
  an entire page's rendering (not just the moved elements) in a way that
  survives reload, View mode, and even a brand-new browser tab -- it's a
  server-side saved-state corruption, not a client glitch. If a gap needs
  closing, either drag manually in small increments with a visual check
  after each move, or accept the cosmetic gap. If a page does break this
  way, recover via `File > Version history > See version history`: preview
  timestamped snapshots (plain click, non-destructive) to bisect the exact
  break point, then Restore the last-good one. Restoring reverts the
  *entire* report to that timestamp, so verify afterward what other
  in-progress work (e.g. filter cleanups) did or didn't survive.
- **Delete confirmed-dead resources aggressively, but verify "dead" first.**
  Both stray filters and unused blended data sources should be checked via
  their "Used in report" / "0 charts" count before deletion, not assumed.

## 3. Cloudflare Worker (daily narrative digest)

This is the code-driven half -- a small Worker that reads the same GA4
property via the Data API, generates a short plain-English digest with
zero LLM involvement (deterministic thresholds only, so nothing is ever
invented), and emails it once a day via Resend.

**Why build this separately from the Looker Studio PDF, rather than
relying on the PDF alone:** a PDF snapshot of a dashboard requires the
reader to interpret the numbers themselves. This Worker's job is narrower
and complementary -- it states the interpretation directly ("visitors up
12% this week," "zero PDF downloads this week -- consider X") so the
property owner gets the takeaway without opening the dashboard. It is not
a replacement for the dashboard; keep both.

### 3.1 Scaffold

```bash
mkdir <property-slug>-analytics-digest && cd <property-slug>-analytics-digest
npm init -y
npm install --save-dev wrangler typescript @cloudflare/workers-types vitest
```

Directory layout to replicate (see `analytics-digest/src/` in this repo for
full reference implementations -- copy and adapt, don't reinvent):

- `src/ga4.ts` -- GA4 Data API client. **Must not use Google's official
  client libraries** -- they assume a Node runtime with `fs`/`crypto`
  modules the Workers runtime doesn't provide. Instead, hand-roll the
  service-account JWT Bearer OAuth2 flow using Web Crypto
  (`crypto.subtle.importKey` + `crypto.subtle.sign` with
  `RSASSA-PKCS1-v1_5` / SHA-256), then call `batchRunReports` directly via
  `fetch`. Export composable dimension-filter builder functions (exclude-by-
  contains, exclude-by-list, AND-combine) so the traffic exclusions can
  mirror the Looker Studio filter exactly.
- `src/insights.ts` -- pure, deterministic functions that turn raw
  GA4 numbers into `Insight` objects (trend / notable / recommendation).
  No network calls, no LLM call -- every sentence must trace back to a
  specific threshold on a specific number. This is what makes it testable
  without mocking a network.
- `src/email.ts` -- renders the `Insight[]` into an HTML email and sends it
  via Resend's REST API (a single `fetch` POST, no SDK needed).
  Escape all interpolated user-facing strings (`escapeHtml`) since some
  data (page paths, event names) could theoretically contain HTML-unsafe
  characters.
- `src/mock-data.ts` -- one shared synthetic fixture used by both a
  `/preview` HTTP route and the test suite, so "what does the email look
  like" can be checked without any real GA4/Resend credentials, and the
  same fixture exercises every insight branch (trend up/down, a zero-volume
  watched event, a low-engagement metric, etc).
- `src/insights.test.ts` -- Vitest tests against `buildInsights()` for
  every threshold branch, plus one end-to-end smoke test against the mock
  fixture. No Workers runtime needed for these -- pure function tests.
- `src/index.ts` -- ties it together: `scheduled()` handler gated on a
  specific local hour (see 3.3), `fetch()` handler exposing `/` (status),
  `/preview` (mock-data render, no secrets needed), and `/trigger`
  (bearer-token-gated on-demand run).

### 3.2 Config (`wrangler.jsonc`)

Key fields to set per-property:

```jsonc
{
  "name": "<property-slug>-analytics-digest",
  "main": "src/index.ts",
  "compatibility_flags": ["nodejs_compat"],
  "account_id": "<this property's own Cloudflare account ID>",
  "triggers": { "crons": ["0 * * * *"] },  // hourly; handler self-gates to one hour/day
  "vars": {
    "ENVIRONMENT": "production",
    "GA4_PROPERTY_ID": "<numeric property ID from step 1.6>",
    "DIGEST_TO_EMAIL": "<owner's email>",
    "DIGEST_FROM_EMAIL": "<Display Name> <digest@yourdomain.com>",
    "SITE_PREVIEW_PATH_MARKER": "<same marker string used in the Looker Studio filter>"
  }
}
```

**Cron pattern:** fire hourly and self-gate in code to a specific local
hour via `Intl.DateTimeFormat` with the target IANA timezone (see
`isDigestHour()` in `src/index.ts` of this repo). This avoids a static UTC
cron value that silently drifts by an hour twice a year across DST --
every non-matching hourly invocation is a single cheap timezone check, no
GA4/Resend traffic.

**Secrets** (never in `wrangler.jsonc`, never in git, never read by an
agent -- set by the human property owner directly):

```bash
npx wrangler secret put GA4_SERVICE_ACCOUNT_JSON < /path/to/key.json  # from step 1.5
npx wrangler secret put RESEND_API_KEY                                 # dedicated key, not shared with other projects
npx wrangler secret put DIGEST_TRIGGER_TOKEN                           # random string, e.g. `openssl rand -hex 20`
```

One Resend API key per project/purpose -- don't reuse a key from another
project's Worker or from the site's own contact-form integration (if it
uses a different email provider like EmailJS, that's an unrelated system
entirely, doesn't apply here).

### 3.3 Insight-generation methodology (the "why" behind the thresholds)

This is the part most worth preserving exactly, since it's the accumulated
judgment call about what's worth saying vs. noise:

- **Trend basis: 7-day trailing vs. the 7 days before that, not
  day-over-day.** Day-over-day is too noisy on a low-traffic site (a single
  referral spike swings the number wildly); week-over-week on trailing
  totals smooths that out while still being recent enough to act on.
- **"Flat" band: within +/-5%.** Below that, a percentage change is more
  likely rounding noise than a real signal on typical low-traffic volumes.
- **Per-action "notable" threshold: >=25% week-over-week change**, and only
  when at least one of the two periods has nonzero volume (a 0-to-0 "change"
  isn't notable). Cap the callout list at 4, sorted by magnitude, so the
  email doesn't become a wall of minor fluctuations.
- **Zero-volume callouts for a short explicit "watched" list**, not every
  tracked event -- pick the 2-4 events that represent a real desired
  outcome (e.g. a download, a code click) so their silence is meaningfully
  actionable, not just "event X exists and had 0."
- **Recommendations are templated and condition-gated**, never generated
  freeform -- each one fires only when a specific numeric condition is met
  (a named event at zero volume, a low ratio between two related events, a
  large traffic drop). This is what keeps the whole system honest: nothing
  in the email is inferred or guessed, everything traces to a number you
  could go recompute by hand.
- **Deliver once a day.** Resist the temptation to increase frequency "for
  more signal" -- daily is the cadence that was explicitly requested and
  matches how often anyone actually wants a plain-English traffic recap
  for a personal/portfolio site.

### 3.4 Degradation and failure behavior

- If required secrets aren't set yet, the scheduled run should no-op safely
  (log + return early) rather than throw -- deploying before secrets are
  fully wired must be safe.
- Once secrets *are* set, wrap the core run in try/catch and, on failure,
  send a short failure-notice email via the same email path (distinct
  subject line, e.g. ending in `-- FAILED`) rather than only logging --
  nobody proactively tails Worker logs for a once-a-day cron, so a silent
  failure can go unnoticed indefinitely. If even the failure alert fails to
  send, that's a log-only condition (nothing left to signal with).
- Gate the manual `/trigger` endpoint with a bearer token compared in
  constant time (`timingSafeEqual`-style char-by-char XOR accumulation) to
  avoid leaking the token via response-time side channel. Comparing length
  up front first is an accepted simplification for a low-value personal
  endpoint, not a defense against a high-value secret.

### 3.5 Testing and verification

```bash
npm test    # vitest run -- pure insights.ts logic, no network/secrets needed
```

```bash
curl https://<worker>.workers.dev/            # status: which secrets resolved
curl https://<worker>.workers.dev/preview     # renders the actual email HTML from mock data, safe anytime
curl -X POST https://<worker>.workers.dev/trigger -H "Authorization: Bearer <token>"  # real send, on demand
npx wrangler tail                              # live logs during a run
```

## 4. Keeping the two systems in sync going forward

The Looker Studio report and the Worker each independently implement the
same traffic-exclusion and event-exclusion logic -- there is no shared
source of truth between a hosted SaaS report and a deployed Worker's
source code. Whenever one side's filter/exclusion list changes, update the
other by hand and note it in a comment at both call sites (see
`EXCLUDED_EVENT_NAMES` in `src/index.ts` and the "Companion system" section
of `analytics-digest/README.md` in this repo for the cross-reference
pattern to copy). Treat any observed disagreement between the dashboard's
numbers and the digest email's numbers for the same date range as a bug to
root-cause, not noise to ignore.

## 5. Architecture boundary discipline

If this pattern is replicated for a second, third, etc. property, give each
one its own:

- Cloudflare account (or at minimum, don't share Worker names/routes across
  unrelated domains)
- GA4 service account, scoped to Viewer on exactly one property
- Resend API key

Reusing the *pattern* (Worker + Cron Trigger + Resend + rule-based insights)
across properties is the point of this guide. Reusing the *infrastructure*
(one Worker serving multiple properties, one service account with access to
multiple properties) is not recommended -- it couples unrelated properties'
uptime/secrets/blast-radius together for no real benefit at this scale.
