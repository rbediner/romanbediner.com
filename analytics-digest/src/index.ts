import { andFilters, batchRunReports, eventNameFilter, excludeEventNamesFilter, excludeLocalhostFilter, excludePreviewPathFilter } from "./ga4";
import type { ReportRequest, ReportResult, ServiceAccountKey } from "./ga4";
import { buildInsights } from "./insights";
import type { ActionRow, CardClickRow, DigestData, PageRow, TrafficSourceRow } from "./insights";
import { renderDigestEmail, sendDigestEmail } from "./email";
import { buildMockDigestData } from "./mock-data";

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
// (fleet_diagram_* and a generic "click") -- mirrors the Looker Studio filter
// named "Exclude passive & legacy events" applied report-wide on the Key
// Actions page. These two lists are maintained independently (one is a Worker
// constant, the other a Looker Studio RegExp filter value) -- if you add or
// remove an event here, make the same change there, and vice versa.
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

function toCardClicks(report: ReportResult): CardClickRow[] {
  return (report.rows ?? [])
    .map((row) => ({
      title: row.dimensionValues?.[0]?.value ?? "(unknown)",
      count: row.metricValues?.[0] ? Number(row.metricValues[0].value) : 0,
    }))
    .filter((c) => c.count > 0 && c.title !== "(not set)");
}

function toSources(report: ReportResult): TrafficSourceRow[] {
  return (report.rows ?? [])
    .map((row) => ({
      name: row.dimensionValues?.[0]?.value ?? "(unknown)",
      sessions: row.metricValues?.[0] ? Number(row.metricValues[0].value) : 0,
    }))
    .filter((s) => s.sessions > 0);
}

async function buildDigestData(env: Env, key: ServiceAccountKey): Promise<DigestData> {
  // Combines preview-path exclusion with localhost session-source exclusion --
  // matches the Looker Studio "Page path filter" (2 AND'd Exclude clauses)
  // exactly, so the digest email and the dashboard never disagree on what
  // counts as real traffic.
  const trafficFilter = andFilters(excludePreviewPathFilter(env.SITE_PREVIEW_PATH_MARKER), excludeLocalhostFilter());
  const eventFilter = andFilters(trafficFilter, excludeEventNamesFilter(EXCLUDED_EVENT_NAMES));

  const requests: ReportRequest[] = [
    // 0: total users -- yesterday
    { dateRanges: [{ name: "yesterday", startDate: "yesterday", endDate: "yesterday" }], metrics: ["activeUsers"], dimensionFilter: trafficFilter },
    // 1: total users -- trailing 7 days
    { dateRanges: [{ name: "trailing7", startDate: "7daysAgo", endDate: "yesterday" }], metrics: ["activeUsers"], dimensionFilter: trafficFilter },
    // 2: total users -- previous 7 days
    { dateRanges: [{ name: "previous7", startDate: "14daysAgo", endDate: "8daysAgo" }], metrics: ["activeUsers"], dimensionFilter: trafficFilter },
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
      dimensionFilter: trafficFilter,
      orderBys: [{ metric: { metricName: "screenPageViews" }, desc: true }],
      limit: 10,
    },
    // 7: which resource cards were clicked -- breakdown by resource_title
    // (registered GA4 custom dimension), trailing 7 days.
    {
      dateRanges: [{ name: "trailing7", startDate: "7daysAgo", endDate: "yesterday" }],
      dimensions: ["customEvent:resource_title"],
      metrics: ["eventCount"],
      dimensionFilter: andFilters(trafficFilter, eventNameFilter("resource_card_click")),
      orderBys: [{ metric: { metricName: "eventCount" }, desc: true }],
      limit: 10,
    },
    // 8: top traffic sources by sessions -- trailing 7 days
    {
      dateRanges: [{ name: "trailing7", startDate: "7daysAgo", endDate: "yesterday" }],
      dimensions: ["sessionSource"],
      metrics: ["sessions"],
      dimensionFilter: trafficFilter,
      orderBys: [{ metric: { metricName: "sessions" }, desc: true }],
      limit: 8,
    },
    // 9: channel mix (GA4 default channel grouping) by sessions -- trailing 7 days
    {
      dateRanges: [{ name: "trailing7", startDate: "7daysAgo", endDate: "yesterday" }],
      dimensions: ["sessionDefaultChannelGroup"],
      metrics: ["sessions"],
      dimensionFilter: trafficFilter,
      orderBys: [{ metric: { metricName: "sessions" }, desc: true }],
      limit: 8,
    },
    // 10: top pages -- previous 7 days (to compute week-over-week page movement)
    {
      dateRanges: [{ name: "previous7", startDate: "14daysAgo", endDate: "8daysAgo" }],
      dimensions: ["pagePath"],
      metrics: ["screenPageViews"],
      dimensionFilter: trafficFilter,
      orderBys: [{ metric: { metricName: "screenPageViews" }, desc: true }],
      limit: 50,
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

  // Week-over-week page movement: annotate each current top page with its
  // prior-7-day view count so the email can show which pages rose/fell.
  const prevPageViews = new Map<string, number>();
  for (const p of toPageRows(reports[10])) prevPageViews.set(p.pagePath, p.views);
  const topPages: PageRow[] = toPageRows(reports[6]).map((p) => ({
    ...p,
    prevViews: prevPageViews.get(p.pagePath) ?? 0,
  }));

  return {
    dateLabel: dateLabel(),
    usersYesterday,
    usersTrailing7,
    usersPrevious7,
    actions,
    topPages,
    zeroVolumeEvents,
    cardClicks: toCardClicks(reports[7]),
    sources: toSources(reports[8]),
    channels: toSources(reports[9]),
  };
}

/**
 * Sends a short plain-text failure notice via Resend when a run throws after
 * GA4/Resend were both configured -- so a broken run is loud (an email
 * Roman actually sees) instead of silent (only visible in `wrangler tail`,
 * which nobody tails proactively for a once-a-day cron).
 */
async function sendFailureAlert(env: Env, message: string): Promise<void> {
  const subject = `romanbediner.com daily digest -- FAILED (${dateLabel()})`;
  const html = `<!doctype html>
<html><body style="font-family:-apple-system,BlinkMacSystemFont,sans-serif;padding:24px;color:#1a1a1a;">
  <h2 style="color:#b91c1c;margin:0 0 8px 0;">Analytics digest failed to send</h2>
  <p style="margin:0 0 16px 0;">The scheduled run for ${dateLabel()} threw an error before it could email real numbers:</p>
  <pre style="background:#f4f4f5;padding:12px;border-radius:6px;white-space:pre-wrap;font-size:13px;">${message.replace(/</g, "&lt;")}</pre>
  <p style="color:#666;font-size:13px;margin-top:16px;">Check <code>npx wrangler tail</code> from the analytics-digest/ directory for the full stack trace.</p>
</body></html>`;
  await sendDigestEmail(env.RESEND_API_KEY!, env.DIGEST_FROM_EMAIL, env.DIGEST_TO_EMAIL, subject, html);
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

  try {
    const data = await buildDigestData(env, key);
    const insights = buildInsights(data);
    const { subject, html } = renderDigestEmail(data, insights);

    await sendDigestEmail(env.RESEND_API_KEY, env.DIGEST_FROM_EMAIL, env.DIGEST_TO_EMAIL, subject, html);

    console.log(`[analytics-digest] Sent digest for ${data.dateLabel}: ${insights.length} insights.`);
    return { status: "sent", detail: subject };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("[analytics-digest] run failed, sending failure alert:", message);
    try {
      await sendFailureAlert(env, message);
    } catch (alertErr) {
      // Resend itself is the only dependency of the alert path, so this only
      // fires if Resend is down -- rare, and already loud in Cloudflare's own
      // dashboard/logs at that point.
      console.error("[analytics-digest] failure alert also failed to send:", alertErr);
    }
    return { status: "error", detail: message };
  }
}

/**
 * Constant-time string comparison so the /trigger bearer check doesn't leak
 * timing information char-by-char. (Length is still compared up front, which
 * leaks length -- an accepted simplification for a low-value personal
 * trigger endpoint, not a high-security secret.)
 */
function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) {
    diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return diff === 0;
}

export default {
  async scheduled(_controller: ScheduledController, env: Env, ctx: ExecutionContext): Promise<void> {
    if (!isDigestHour()) return; // cheap no-op for the other 23 hourly firings
    ctx.waitUntil(
      runDigest(env).catch((err) => {
        // runDigest() catches and reports its own errors (including sending a
        // failure alert email); this is only a backstop for something going
        // wrong in that error-handling path itself.
        console.error("[analytics-digest] run failed:", err);
      })
    );
  },

  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);

    if (url.pathname === "/preview" && request.method === "GET") {
      // Renders the digest email HTML from synthetic data -- no secrets
      // required, no real GA4/Resend calls made. Lets the wording and
      // thresholds in insights.ts/email.ts be sanity-checked in a browser at
      // any time, independent of whether GA4_SERVICE_ACCOUNT_JSON is set.
      const data = buildMockDigestData();
      const insights = buildInsights(data);
      const { html } = renderDigestEmail(data, insights);
      return new Response(html, { headers: { "Content-Type": "text/html; charset=utf-8" } });
    }

    if (url.pathname === "/trigger" && request.method === "POST") {
      const auth = request.headers.get("Authorization");
      const expected = `Bearer ${env.DIGEST_TRIGGER_TOKEN ?? ""}`;
      if (!env.DIGEST_TRIGGER_TOKEN || !auth || !timingSafeEqual(auth, expected)) {
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
      note: "GET /preview for a mock-data email render. POST /trigger with Authorization: Bearer <DIGEST_TRIGGER_TOKEN> to run on demand.",
    });
  },
};
