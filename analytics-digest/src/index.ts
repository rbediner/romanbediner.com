import { andFilters, batchRunReports, excludeEventNamesFilter, excludePreviewPathFilter } from "./ga4";
import type { ReportRequest, ReportResult, ServiceAccountKey } from "./ga4";
import { buildInsights } from "./insights";
import type { ActionRow, DigestData, PageRow } from "./insights";
import { renderDigestEmail, sendDigestEmail } from "./email";

export interface Env {
  ENVIRONMENT: string;
  GA4_PROPERTY_ID: string;
  DIGEST_TO_EMAIL: string;
  DIGEST_FROM_EMAIL: string;
  SITE_PREVIEW_PATH_MARKER: string;
  // Secrets -- set via `wrangler secret put <NAME>`. Absent until Roman
  // wires them up; the Worker degrades gracefully until then.
  GA4_SERVICE_ACCOUNT_JSON?: string;
  RESEND_API_KEY?: string;
  DIGEST_TRIGGER_TOKEN?: string;
}

// Passive/automatic GA4 events plus legacy/unrelated instrumentation
// (fleet_diagram_* and a generic "click") -- mirrors the "Event name
// filter" applied report-wide in the Looker Studio Key Actions page.
const EXCLUDED_EVENT_NAMES = [
  "page_view",
  "session_start",
  "first_visit",
  "user_engagement",
  "fleet_diagram_fullscreen",
  "fleet_diagram_zoom",
  "click",
];

// Named "key" events we specifically want to call out if they go quiet.
const WATCHED_EVENT_NAMES = ["resource_pdf_download", "resource_source_code_click", "resource_preview_expand"];

function isDigestHour(): boolean {
  const hourStr = new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    hour12: false,
    timeZone: "America/New_York",
  }).format(new Date());
  return parseInt(hourStr, 10) === 8;
}

function dateLabel(): string {
  const d = new Date(Date.now() - 24 * 60 * 60 * 1000); // yesterday
  return new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    timeZone: "America/New_York",
  }).format(d);
}

function firstMetricValue(report: ReportResult): number {
  const row = report.rows?.[0];
  return row?.metricValues?.[0] ? Number(row.metricValues[0].value) : 0;
}

function toEventMap(report: ReportResult): Map<string, number> {
  const map = new Map<string, number>();
  for (const row of report.rows ?? []) {
    const name = row.dimensionValues?.[0]?.value;
    const count = row.metricValues?.[0]?.value;
    if (name) map.set(name, count ? Number(count) : 0);
  }
  return map;
}

function toPageRows(report: ReportResult): PageRow[] {
  return (report.rows ?? []).map((row) => ({
    pagePath: row.dimensionValues?.[0]?.value ?? "(unknown)",
    views: row.metricValues?.[0] ? Number(row.metricValues[0].value) : 0,
  }));
}

async function buildDigestData(env: Env, key: ServiceAccountKey): Promise<DigestData> {
  const previewFilter = excludePreviewPathFilter(env.SITE_PREVIEW_PATH_MARKER);
  const eventFilter = andFilters(previewFilter, excludeEventNamesFilter(EXCLUDED_EVENT_NAMES));

  const requests: ReportRequest[] = [
    // 0: total users -- yesterday
    { dateRanges: [{ name: "yesterday", startDate: "yesterday", endDate: "yesterday" }], metrics: ["activeUsers"], dimensionFilter: previewFilter },
    // 1: total users -- trailing 7 days
    { dateRanges: [{ name: "trailing7", startDate: "7daysAgo", endDate: "yesterday" }], metrics: ["activeUsers"], dimensionFilter: previewFilter },
    // 2: total users -- previous 7 days
    { dateRanges: [{ name: "previous7", startDate: "14daysAgo", endDate: "8daysAgo" }], metrics: ["activeUsers"], dimensionFilter: previewFilter },
    // 3: event breakdown -- yesterday
    { dateRanges: [{ name: "yesterday", startDate: "yesterday", endDate: "yesterday" }], dimensions: ["eventName"], metrics: ["eventCount"], dimensionFilter: eventFilter, limit: 50 },
    // 4: event breakdown -- trailing 7 days
    { dateRanges: [{ name: "trailing7", startDate: "7daysAgo", endDate: "yesterday" }], dimensions: ["eventName"], metrics: ["eventCount"], dimensionFilter: eventFilter, limit: 50 },
    // 5: event breakdown -- previous 7 days
    { dateRanges: [{ name: "previous7", startDate: "14daysAgo", endDate: "8daysAgo" }], dimensions: ["eventName"], metrics: ["eventCount"], dimensionFilter: eventFilter, limit: 50 },
    // 6: top pages -- trailing 7 days
    {
      dateRanges: [{ name: "trailing7", startDate: "7daysAgo", endDate: "yesterday" }],
      dimensions: ["pagePath"],
      metrics: ["screenPageViews"],
      dimensionFilter: previewFilter,
      orderBys: [{ metric: { metricName: "screenPageViews" }, desc: true }],
      limit: 10,
    },
  ];

  const reports = await batchRunReports(key, env.GA4_PROPERTY_ID, requests);

  const usersYesterday = firstMetricValue(reports[0]);
  const usersTrailing7 = firstMetricValue(reports[1]);
  const usersPrevious7 = firstMetricValue(reports[2]);

  const eventsYesterday = toEventMap(reports[3]);
  const eventsTrailing7 = toEventMap(reports[4]);
  const eventsPrevious7 = toEventMap(reports[5]);

  const allEventNames = new Set<string>([...eventsYesterday.keys(), ...eventsTrailing7.keys(), ...eventsPrevious7.keys()]);
  const actions: ActionRow[] = Array.from(allEventNames).map((eventName) => ({
    eventName,
    yesterday: eventsYesterday.get(eventName) ?? 0,
    trailing7: eventsTrailing7.get(eventName) ?? 0,
    previous7: eventsPrevious7.get(eventName) ?? 0,
  }));
  actions.sort((a, b) => b.trailing7 - a.trailing7);

  const zeroVolumeEvents = WATCHED_EVENT_NAMES.filter((name) => (eventsTrailing7.get(name) ?? 0) === 0);

  return {
    dateLabel: dateLabel(),
    usersYesterday,
    usersTrailing7,
    usersPrevious7,
    actions,
    topPages: toPageRows(reports[6]),
    zeroVolumeEvents,
  };
}

async function runDigest(env: Env): Promise<{ status: string; detail?: string }> {
  if (!env.GA4_SERVICE_ACCOUNT_JSON) {
    console.log("[analytics-digest] GA4_SERVICE_ACCOUNT_JSON not set -- skipping run. See README.md.");
    return { status: "skipped", detail: "GA4_SERVICE_ACCOUNT_JSON not set" };
  }
  if (!env.RESEND_API_KEY) {
    console.log("[analytics-digest] RESEND_API_KEY not set -- skipping run. See README.md.");
    return { status: "skipped", detail: "RESEND_API_KEY not set" };
  }

  let key: ServiceAccountKey;
  try {
    key = JSON.parse(env.GA4_SERVICE_ACCOUNT_JSON);
  } catch {
    return { status: "error", detail: "GA4_SERVICE_ACCOUNT_JSON is not valid JSON" };
  }

  const data = await buildDigestData(env, key);
  const insights = buildInsights(data);
  const { subject, html } = renderDigestEmail(data, insights);

  await sendDigestEmail(env.RESEND_API_KEY, env.DIGEST_FROM_EMAIL, env.DIGEST_TO_EMAIL, subject, html);

  console.log(`[analytics-digest] Sent digest for ${data.dateLabel}: ${insights.length} insights.`);
  return { status: "sent", detail: subject };
}

export default {
  async scheduled(_controller: ScheduledController, env: Env, ctx: ExecutionContext): Promise<void> {
    if (!isDigestHour()) return; // cheap no-op for the other 23 hourly firings
    ctx.waitUntil(
      runDigest(env).catch((err) => {
        console.error("[analytics-digest] run failed:", err);
      })
    );
  },

  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);

    if (url.pathname === "/trigger" && request.method === "POST") {
      const auth = request.headers.get("Authorization");
      if (!env.DIGEST_TRIGGER_TOKEN || auth !== `Bearer ${env.DIGEST_TRIGGER_TOKEN}`) {
        return new Response("Unauthorized", { status: 401 });
      }
      try {
        const result = await runDigest(env);
        return Response.json(result);
      } catch (err) {
        return Response.json({ status: "error", detail: String(err) }, { status: 500 });
      }
    }

    return Response.json({
      service: "romanbediner-analytics-digest",
      environment: env.ENVIRONMENT,
      secretsConfigured: {
        ga4: Boolean(env.GA4_SERVICE_ACCOUNT_JSON),
        resend: Boolean(env.RESEND_API_KEY),
      },
      note: "POST /trigger with Authorization: Bearer <DIGEST_TRIGGER_TOKEN> to run on demand.",
    });
  },
};
