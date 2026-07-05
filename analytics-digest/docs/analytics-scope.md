# Analytics scope: romanbediner.com

What's tracked, where it lives, and what's deliberately excluded. This is the
reference for "does this system see X" questions -- for how the two reporting
surfaces (Looker Studio dashboard, this Worker's daily digest) were built and
how to replicate the whole thing for another property, see
[replication-guide.md](replication-guide.md).

## Property

| | |
|---|---|
| GA4 property | `524954289` ("romanbediner.com", under Analytics account "Roman Bediner") |
| Site's tracking snippet | `ga4-bootstrap.js` (loads gtag.js against this property) |
| Consumers of this property | Looker Studio report "RB Website - Traffic, Pages, and Key Actions"; this Worker (`analytics-digest`) |

Both consumers read the same property and apply the same traffic exclusions
(below), so their numbers should always agree for the same date range. If
they ever disagree, that's a bug -- check whether one side's filter logic
drifted from the other's (see [replication-guide.md](replication-guide.md)'s
note on keeping the two exclusion definitions in sync).

## Traffic exclusions (applied everywhere, both systems)

Two exclusions are applied to every report/chart in both systems:

1. **Preview/staging traffic** -- any pagePath containing
   `romanbediner-preview` (the marker string used for staging/preview
   deploys). Looker Studio: first clause of the "Page path filter". Worker:
   `excludePreviewPathFilter()` in `src/ga4.ts`, driven by the
   `SITE_PREVIEW_PATH_MARKER` env var.
2. **Localhost / local dev traffic** -- any sessionSource containing
   `localhost`. Looker Studio: second clause of the "Page path filter"
   (AND'd with the preview-path clause). Worker: `excludeLocalhostFilter()`
   in `src/ga4.ts`.

Neither exclusion is perfect -- some localhost/dev sessions can still show up
in raw traffic-source rows (session source isn't always populated), which is
why the Landing Pages caption says "some localhost/dev sessions may still
appear in raw traffic-source rows." This is a known, accepted gap, not a bug.

## Event taxonomy

### Passive / automatic events (excluded from "Key Actions" reporting)

These fire on every pageview or session regardless of what the visitor
actually does, so they're noise for an "engagement" view. Excluded via the
Looker Studio filter **"Exclude passive & legacy events"** and the Worker's
`EXCLUDED_EVENT_NAMES` constant (`src/index.ts`) -- **these two lists must be
kept in sync by hand**, there's no shared source of truth:

- `page_view`, `session_start`, `first_visit`, `user_engagement` -- GA4's own
  automatic events.
- `click` -- a legacy generic click event, superseded by the specific
  `*_click` events below.
- `fleet_diagram_fullscreen`, `fleet_diagram_zoom` -- instrumentation for a
  page component that's no longer part of the current site build; kept in
  the exclusion list in case any is still queued/cached, not because it's
  expected to fire again.

### Real interaction ("key action") events

Everything else the site fires -- these are what the Key Actions page and
the digest's "Notable"/"Worth trying" sections are actually about:

| Event name | Meaning | Source file |
|---|---|---|
| `nav_click` | Nav menu click | `scripts/runtime/*` |
| `scroll` | Any scroll event | `scripts/runtime/*` |
| `scroll_depth` | Reached 75%+ scroll depth on a page | `scripts/runtime/*` |
| `internal_link_click` | Click on a link to another page on the site | `scripts/runtime/*` |
| `resource_card_click` | Click on a resource card (resources page) | `scripts/runtime/resources-carousel.js` |
| `resource_pdf_download` | PDF download from the resources page | `scripts/runtime/resources-analytics.js` |
| `resource_source_code_click` | Click-through to a resource's source code | `scripts/runtime/resources-analytics.js` |
| `resource_external_cta_click` | Click on an external CTA link on a resource | `scripts/runtime/resources-analytics.js` |
| `resource_preview_expand` | Expand a resource's inline preview | `scripts/runtime/resources-analytics.js` |

### Watched ("key") events

A subset of the above that get an explicit zero-volume callout if they go
quiet for 7 days straight -- defined in `WATCHED_EVENT_NAMES` in
`src/index.ts`:

- `resource_pdf_download`
- `resource_source_code_click`
- `resource_preview_expand`

These three also have their own scorecards on the Looker Studio Key Actions
page (filters `Event = resource_pdf_download` and
`Event = resource_preview_expand`; `resource_source_code_click` has no
dedicated scorecard yet, only the digest's zero-volume/recommendation logic
covers it).

## Looker Studio filter inventory

As of 2026-07-05, exactly 4 filters exist on the report (`Resource > Manage
filters`) -- down from 16 (11 dead, 1 broken with an empty value, 4 real)
after EBI Round 2 cleanup:

| Filter name | Charts | What it does |
|---|---|---|
| `Page path filter` | 7 | Compound, 2 AND'd Exclude clauses: preview-path + localhost. The report-wide traffic exclusion described above. |
| `Exclude passive & legacy events` | 3 | RegExp-excludes the 7 passive/legacy event names from the Key Actions table/trend. |
| `Event = resource_pdf_download` | 1 | Isolates the PDF-download scorecard. |
| `Event = resource_preview_expand` | 1 | Isolates the resource-preview-expand scorecard. |

If a new filter shows "Missing" for its field or "Invalid" for every
field-picker option, it can't be repaired (Save stays disabled even after a
valid Name-only edit) -- delete and recreate it instead. If a scorecard shows
a suspicious `0`, check whether its filter's value column is actually
populated in Manage Filters: Looker Studio will silently save an "Equal to"
filter with **no** value if "Show suggested values while typing" is on and
you type a value with zero historical occurrences (exactly the case for a
genuinely zero-volume event) -- toggle that switch off first when defining
a filter for a rare/zero-volume value.

## Known "(not set)" buckets

GA4 buckets sessions it can't attribute or geolocate under `(not set)`. This
shows up in two places on the Looker Studio report and is expected, not a
tracking bug:

- **Country** (Audience & Devices page) -- sessions GA4 couldn't geolocate,
  often bots or privacy-proxied traffic.
- **Landing page + query string** (Landing Pages table) -- sessions with no
  recorded landing page, same root cause.

## What's explicitly out of scope

- **eCommerce events** (`add_to_cart`, `purchase`, `view_item`,
  `begin_checkout`) -- romanbediner.com has no eCommerce functionality and
  none of these are ever populated for this property. An unused blended data
  source ("BL: eComm Funnel", 0 charts referencing it) previously showed
  these as pickable fields in the Looker Studio Data panel; removed
  2026-07-05 during EBI Round 2 structure cleanup. If a future
  page/chart references eCommerce fields, re-check whether that's a
  copy-paste artifact rather than a real tracking need.
- **The site's own contact-form submissions** -- handled by EmailJS, a
  completely separate system from GA4/Resend. Not tracked as a GA4 event as
  of this writing.
