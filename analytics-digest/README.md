# romanbediner-analytics-digest

Cloudflare Worker that reads GA4 data for romanbediner.com, generates a
rule-based plain-English interpretation (trend, notable changes, and
recommendations tied to specific thresholds), and emails it daily via Resend.

This is deliberately separate from `pasteflow-growth-engine` -- own project,
own Cloudflare account, own secrets. It reuses the same pattern (Workers +
Cron Trigger + Resend) but nothing else is shared.

It is also separate from the existing Looker Studio scheduled email (see
[Companion system: Looker Studio report](#companion-system-looker-studio-report)
below), which sends the full dashboard as a static PDF snapshot. This Worker
sends a short narrative companion email -- numbers plus what they mean, not
another dashboard screenshot.

**Status as of 2026-07-05: deployed, partially wired.** `RESEND_API_KEY` and
`DIGEST_TRIGGER_TOKEN` are set. `GA4_SERVICE_ACCOUNT_JSON` is **not** set yet
-- see [Known gap](#known-gap-ga4_service_account_json-not-set) below. Until
it's set, the Worker fires on schedule every day but skips the actual GA4
fetch + email send (safe no-op, confirmed via the `/` status endpoint).

## Architecture at a glance

```
Cron Trigger (hourly, self-gates to 8am America/New_York)
        |
        v
Cloudflare Worker (romanbediner-analytics-digest)
        |
        +--> GA4 Data API (batchRunReports) ---- auth: Google service-account
        |                                          JWT signed with Web Crypto
        |                                          (src/ga4.ts) -- no Node
        |                                          crypto/fs, Workers-native.
        |
        +--> src/insights.ts -- rule-based thresholds only, no LLM call,
        |                        nothing invented.
        |
        +--> src/email.ts -- renders HTML, sends via Resend API
        |                     (api.resend.com/emails)
        |                     |
        |                     v
        |            roman@romanbediner.com
        |
        +--> on error anywhere above: caught, sends a "-- FAILED" alert
                      email via the same Resend path instead of failing
                      silently (see "Degradation behavior" below).

fetch() handler (independent of the cron path, for manual use):
        GET  /            -- status: which secrets are configured
        GET  /preview     -- renders the real email HTML from src/mock-data.ts,
        |                     no secrets/GA4/Resend calls, safe anytime
        POST /trigger     -- bearer-token-gated on-demand real run
```

Full request/response flow per run: `scheduled()` in `src/index.ts` checks
the clock -> `buildDigestData()` calls `batchRunReports()` (7 GA4 report
requests in one HTTP call: totals + event breakdown + top pages, each for
yesterday / trailing-7 / previous-7) -> `buildInsights()` turns the numbers
into English -> `renderDigestEmail()` builds the HTML -> `sendDigestEmail()`
POSTs to Resend.

## Accounts and boundaries (read this before touching secrets)

| System | Account / ID | Notes |
|---|---|---|
| Cloudflare (this Worker) | `a00e5c592f3d32a0258528122cecde89` (`Rbediner@gmail.com`'s Account) | Same account that owns the romanbediner.com DNS zone. **Not** the Pasteflow Cloudflare account (`0718c0706eb3a866bb7aa6f417f425e8`, `Pasteflow.support@gmail.com`) -- deliberately separate per-project. |
| GA4 property | `524954289` (romanbediner.com, under Analytics account "Roman Bediner") | Same property the site's own `ga4-bootstrap.js` sends events to and that the Looker Studio report reads from. |
| Google Cloud project | `gen-lang-client-0482186037` ("Default Gemini Project") | Existing project on Roman's Google account, reused rather than creating a new one. "Google Analytics Data API" was enabled on it for this Worker. |
| Service account (GA4 read access) | `romanbediner-analytics-digest@gen-lang-client-0482186037.iam.gserviceaccount.com` | Created specifically for this Worker. Granted **Viewer** role on the romanbediner.com GA4 property via Admin -> Property Access Management. Has no access to anything else. |
| Resend | Dedicated API key named `romanbediner-analytics-digest` | Created in the Resend dashboard under API keys. Separate from the key the site's contact form uses and separate from any PasteFlow key -- one key per project/purpose. |
| Worker deploy | `romanbediner-analytics-digest.rbediner.workers.dev` | Confirmed live 2026-07-05 (`npx wrangler deploy` output: "Deployed romanbediner-analytics-digest triggers", schedule `0 * * * *`). |

**Why this matters for future agents/sessions:** if you're asked to touch
analytics automation for romanbediner.com, this is the project -- not
`pasteflow-growth-engine`, even though the code pattern looks similar. If
you're asked to touch PasteFlow's growth engine, the reverse applies: don't
reuse this Cloudflare account, this GA4 property, or this Resend key.

## Known gap: `GA4_SERVICE_ACCOUNT_JSON` not set

On 2026-07-05 the service-account JSON key was generated and "downloaded"
during an earlier Claude session's browser automation, but that download
landed inside the automation's sandboxed browser environment, not on Roman's
actual Mac. The subsequent `wrangler secret put GA4_SERVICE_ACCOUNT_JSON <
~/Downloads/gen-lang-client-0482186037-2c0d2e53619c.json` failed with "no
such file or directory" -- confirmed the file does not exist anywhere on
this machine (`~/Downloads`, `~/Desktop`, `~/Documents` all checked).

**Fix (5 minutes, must be done by Roman in his own browser -- this is a
credential, so no agent should ever see the raw key contents):**

1. Go to [Google Cloud Console -> IAM & Admin -> Service Accounts](https://console.cloud.google.com/iam-admin/serviceaccounts?project=gen-lang-client-0482186037).
2. Click `romanbediner-analytics-digest@gen-lang-client-0482186037.iam.gserviceaccount.com`.
3. **Keys** tab -> **Add key** -> **Create new key** -> JSON. This downloads
   a *new* key file to your real `~/Downloads` (the old key, if it exists
   anywhere, can be left alone or deleted from the Keys list -- doesn't
   matter, a service account can have multiple active keys).
4. From a real terminal on this Mac:
   ```bash
   cd ~/.local-repos/romanbediner.com/analytics-digest
   npx wrangler secret put GA4_SERVICE_ACCOUNT_JSON < ~/Downloads/<the-new-file>.json
   ```
5. Verify: `curl https://romanbediner-analytics-digest.rbediner.workers.dev/`
   should show `"ga4":true`.
6. Optional: delete the downloaded JSON file from `~/Downloads` afterward --
   the secret now lives only in Cloudflare's encrypted secret store.

**Step 1 (granting GA4 Viewer access to the service account) was already
completed** via GA4 Admin -> Property Access Management -- confirmed in the
Google Analytics Admin UI. Do not redo that step, only the key regeneration.

## Setting the other two secrets (already done, for reference)

```bash
cd ~/.local-repos/romanbediner.com/analytics-digest
npx wrangler secret put RESEND_API_KEY        # done 2026-07-05
npx wrangler secret put DIGEST_TRIGGER_TOKEN  # done 2026-07-05, random string via `openssl rand -hex 20`
```

Neither of these values are recorded anywhere in this repo, in chat, or in
Claude's memory -- they live only in Cloudflare's secret store. If either
needs rotating, just re-run the `wrangler secret put` command for that name;
it overwrites silently.

## Deploying

```bash
cd ~/.local-repos/romanbediner.com/analytics-digest
npm install
npx wrangler deploy
```

## Tests

```bash
npm test
```

Vitest, covering the pure threshold logic in `src/insights.ts` (trend
direction/flat/no-baseline, per-action >=25% callouts capped at 4, zero-volume
watched-event callouts, all three recommendation branches, top-page share
math) plus an end-to-end smoke test against the shared mock fixture. No
Workers runtime or network calls involved -- this only tests deterministic
functions, so it's fast and has no secrets dependency.

## Verifying it works

Check status (shows whether secrets resolved, doesn't send anything):

```bash
curl https://romanbediner-analytics-digest.rbediner.workers.dev/
```

Expected once fully wired: `{"service":"romanbediner-analytics-digest","environment":"production","secretsConfigured":{"ga4":true,"resend":true},...}`

Preview the actual email design and wording using synthetic data -- no
secrets required, no real GA4/Resend calls made, safe to open in a browser
any time:

```
https://romanbediner-analytics-digest.rbediner.workers.dev/preview
```

The mock data (`src/mock-data.ts`) is shared with the test suite (`npm test`)
so both exercise the same fixture.

Trigger a real send on demand (replace `<token>` with the value set for
`DIGEST_TRIGGER_TOKEN`):

```bash
curl -X POST https://romanbediner-analytics-digest.rbediner.workers.dev/trigger \
  -H "Authorization: Bearer <token>"
```

Tail logs while it's running:

```bash
npx wrangler tail
```

## How the schedule works

The Cron Trigger fires every hour (`0 * * * *`). The handler checks whether
it's currently 8am in `America/New_York` (matching the existing Looker
Studio email) and no-ops otherwise. This self-corrects across the two DST
changes per year without a static UTC cron value that would need manual
updates every March and November. Every other hourly invocation is a single
cheap timezone check -- no GA4 or Resend traffic, no cost.

## Degradation behavior

Until both `GA4_SERVICE_ACCOUNT_JSON` and `RESEND_API_KEY` are set, the
Worker still fires on schedule but logs "skipped" and returns early rather
than throwing. Deploying before secrets are wired up is safe. (Current
state: `RESEND_API_KEY` is set, `GA4_SERVICE_ACCOUNT_JSON` is not -- see
[Known gap](#known-gap-ga4_service_account_json-not-set) above.)

Once both secrets *are* set, a failure looks different on purpose: if
`buildDigestData`/GA4/Resend throws partway through a run, the Worker catches
it and sends a short failure-notice email via Resend instead (subject line
`... -- FAILED`, includes the error message) rather than just logging to
`wrangler tail`, which nobody tails proactively for a once-a-day cron. If
even that alert fails to send (Resend itself down), that's logged and there's
genuinely nothing left to signal with.

## What the digest actually says

Everything is rule-based off real thresholds against GA4 numbers -- no LLM
call, so nothing is invented:

- **Trend**: yesterday's visitors, 7-day trailing total, and week-over-week
  % change (trailing 7 days vs. the 7 days before that -- day-over-day is
  too noisy at ~5-6 visitors/day, so the digest leads with the smoothed view).
- **Notable**: any tracked action whose 7-day count moved >=25% week-over-week,
  plus an explicit callout for any of the three "resource_" key events
  (PDF download, source-code click, preview expand) that had zero activity
  in the last 7 days -- so their absence is visible instead of silently
  missing.
- **Worth trying**: specific recommendations, each tied to a concrete
  condition (e.g. zero PDF downloads -> suggest a clearer download CTA;
  low deep-scroll rate -> suggest checking above-the-fold content; a big
  week-over-week traffic drop -> suggest checking for a broken link or
  recent change).

All numbers exclude both `romanbediner-preview` staging traffic
(`SITE_PREVIEW_PATH_MARKER` env var) and `localhost` session-source traffic
(`excludeLocalhostFilter()` in `src/ga4.ts`), matching the Looker Studio
report's "Page path filter" exactly -- both systems now agree on what counts
as real traffic.

## Companion system: Looker Studio report

The full dashboard lives in Looker Studio (now branded "Data Studio"),
separate from this Worker, sending its own scheduled PDF email:

- **Report:** "RB Website - Traffic, Pages, and Key Actions"
  (`https://datastudio.google.com/u/0/reporting/520a765a-8529-48dc-b8d8-bc339564438a/`),
  connected to the `romanbediner.com` GA4 property (`524954289`).
- **5 pages:** Executive Summary, Key Actions, Audience & Devices, Traffic
  Sources & Landing Pages, Top Pages.
- **Traffic exclusions, event taxonomy, and the full filter inventory**
  (currently 4 filters, down from a peak of 16 after the 2026-07-05 EBI
  Round 2 cleanup) are documented in
  [`docs/analytics-scope.md`](docs/analytics-scope.md) rather than here, so
  there's a single source of truth instead of two READMEs drifting out of
  sync. Read that file before editing any report filter -- it also covers
  two Looker Studio gotchas worth knowing before you touch Manage Filters
  (a filter with an unrepairable "Missing"/"Invalid" field reference, and a
  filter that silently saves with an empty value for zero-volume event
  names).
- **To replicate this whole stack (GA4 setup, dashboard blueprint, Worker
  scaffold, insight-methodology rationale) for a different property**, see
  [`docs/replication-guide.md`](docs/replication-guide.md) -- a
  property-agnostic runbook written so an agent can be pointed at that one
  file and asked to rebuild the pattern from scratch, without re-deriving
  any of the design decisions made here.
