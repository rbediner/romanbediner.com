import type { ActionRow, CardClickRow, DigestData, Insight, PageRow, TrafficSourceRow } from "./insights";
import { label, prettyPage, prettySource } from "./insights";

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function section(title: string, items: Insight[]): string {
  if (items.length === 0) return "";
  const rows = items
    .map(
      (i) =>
        `<li style="margin:0 0 8px 0;padding:0;color:#1a1a1a;font-size:15px;line-height:1.5;">${escapeHtml(i.text)}</li>`
    )
    .join("");
  return `
    <tr>
      <td style="padding:24px 0 8px 0;">
        <div style="font-size:13px;font-weight:600;letter-spacing:.04em;text-transform:uppercase;color:#666;">${escapeHtml(title)}</div>
        <ul style="margin:8px 0 0 0;padding-left:18px;">${rows}</ul>
      </td>
    </tr>`;
}

/** The synthesized one-liner, rendered as a prominent callout above everything. */
function summaryBlock(text: string): string {
  if (!text) return "";
  return `
    <tr>
      <td style="padding:20px 0 4px 0;">
        <div style="background:#f0f5ff;border-left:3px solid #3b6cff;border-radius:4px;padding:12px 16px;font-size:15px;line-height:1.5;color:#0d1530;font-weight:600;">${escapeHtml(text)}</div>
      </td>
    </tr>`;
}

/** Small week-over-week movement badge for a page, shown only for meaningful moves. */
function movementLabel(views: number, prevViews?: number): string {
  if (prevViews === undefined) return "";
  if (prevViews === 0) return views > 0 ? ` <span style="color:#137333;font-size:12px;">&#9650; new</span>` : "";
  const pct = Math.round(((views - prevViews) / prevViews) * 100);
  if (pct >= 15) return ` <span style="color:#137333;font-size:12px;">&#9650; +${pct}%</span>`;
  if (pct <= -15) return ` <span style="color:#b91c1c;font-size:12px;">&#9660; ${pct}%</span>`;
  return "";
}

/** Ranked list of the top pages with views, share, and week-over-week movement. */
function pagesSection(topPages: PageRow[]): string {
  if (!topPages || topPages.length === 0) return "";
  const total = topPages.reduce((sum, p) => sum + p.views, 0);
  const rows = topPages
    .slice(0, 5)
    .map((p) => {
      const share = total > 0 ? Math.round((p.views / total) * 100) : 0;
      return `<li style="margin:0 0 6px 0;padding:0;color:#1a1a1a;font-size:15px;line-height:1.5;"><strong>${escapeHtml(prettyPage(p.pagePath))}</strong> <span style="color:#999;font-size:13px;">${escapeHtml(p.pagePath)}</span> &mdash; ${p.views} views (${share}%)${movementLabel(p.views, p.prevViews)}</li>`;
    })
    .join("");
  return `
    <tr>
      <td style="padding:24px 0 8px 0;">
        <div style="font-size:13px;font-weight:600;letter-spacing:.04em;text-transform:uppercase;color:#666;">Top pages this week</div>
        <ol style="margin:8px 0 0 0;padding-left:20px;">${rows}</ol>
      </td>
    </tr>`;
}

/** A ranked list of traffic sources or channels with sessions + share. */
function sourceListSection(title: string, sources: TrafficSourceRow[] | undefined, labelFn: (n: string) => string): string {
  if (!sources || sources.length === 0) return "";
  const total = sources.reduce((sum, s) => sum + s.sessions, 0);
  const rows = sources
    .slice(0, 5)
    .map((s) => {
      const share = total > 0 ? Math.round((s.sessions / total) * 100) : 0;
      return `<li style="margin:0 0 6px 0;padding:0;color:#1a1a1a;font-size:15px;line-height:1.5;"><strong>${escapeHtml(labelFn(s.name))}</strong> &mdash; ${s.sessions} session${s.sessions === 1 ? "" : "s"} (${share}%)</li>`;
    })
    .join("");
  return `
    <tr>
      <td style="padding:24px 0 8px 0;">
        <div style="font-size:13px;font-weight:600;letter-spacing:.04em;text-transform:uppercase;color:#666;">${escapeHtml(title)}</div>
        <ul style="margin:8px 0 0 0;padding-left:18px;">${rows}</ul>
      </td>
    </tr>`;
}

/** Full key-action activity list (this week + yesterday), sorted by weekly volume. */
function activitySection(actions: ActionRow[]): string {
  const rows = actions
    .filter((a) => a.trailing7 > 0)
    .sort((a, b) => b.trailing7 - a.trailing7)
    .slice(0, 8)
    .map(
      (a) =>
        `<li style="margin:0 0 6px 0;padding:0;color:#1a1a1a;font-size:15px;line-height:1.5;"><strong>${escapeHtml(label(a.eventName))}</strong>: ${a.trailing7} this week <span style="color:#888;">(${a.yesterday} yesterday)</span></li>`
    )
    .join("");
  if (!rows) return "";
  return `
    <tr>
      <td style="padding:24px 0 8px 0;">
        <div style="font-size:13px;font-weight:600;letter-spacing:.04em;text-transform:uppercase;color:#666;">What visitors did this week</div>
        <ul style="margin:8px 0 0 0;padding-left:18px;">${rows}</ul>
      </td>
    </tr>`;
}

/** Which specific resource cards were clicked (from the resource_title dimension). */
function cardsSection(cardClicks: CardClickRow[] | undefined): string {
  if (!cardClicks || cardClicks.length === 0) return "";
  const rows = cardClicks
    .slice(0, 5)
    .map(
      (c) =>
        `<li style="margin:0 0 6px 0;padding:0;color:#1a1a1a;font-size:15px;line-height:1.5;"><strong>${escapeHtml(c.title)}</strong> &mdash; ${c.count} click${c.count === 1 ? "" : "s"}</li>`
    )
    .join("");
  return `
    <tr>
      <td style="padding:24px 0 8px 0;">
        <div style="font-size:13px;font-weight:600;letter-spacing:.04em;text-transform:uppercase;color:#666;">Resource cards clicked</div>
        <ul style="margin:8px 0 0 0;padding-left:18px;">${rows}</ul>
      </td>
    </tr>`;
}

/** A single big-number stat with an uppercase label, for the scorecard strip. */
function statCell(value: string, labelText: string): string {
  return `<td style="padding:0 6px;vertical-align:top;width:25%;">
    <div style="font-size:22px;font-weight:700;color:#0d1530;line-height:1.1;">${escapeHtml(value)}</div>
    <div style="font-size:11px;font-weight:600;letter-spacing:.03em;text-transform:uppercase;color:#999;margin-top:3px;">${escapeHtml(labelText)}</div>
  </td>`;
}

/** At-a-glance stat strip: the numbers that answer "how are we doing?" instantly. */
function scorecardRow(data: DigestData): string {
  const wow = data.usersPrevious7 > 0 ? Math.round(((data.usersTrailing7 - data.usersPrevious7) / data.usersPrevious7) * 100) : null;
  const wowStr = wow === null ? "—" : `${wow > 0 ? "+" : ""}${wow}%`;
  const topSource = data.sources && data.sources.length > 0 ? prettySource(data.sources[0].name) : "—";
  const cells = [
    statCell(String(data.usersTrailing7), "Visitors 7d"),
    statCell(wowStr, "vs prior wk"),
    statCell(String(data.usersYesterday), "Yesterday"),
    statCell(topSource, "Top source"),
  ].join("");
  return `
    <tr>
      <td style="padding:18px 0 6px 0;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr>${cells}</tr></table>
      </td>
    </tr>`;
}

export function renderDigestEmail(data: DigestData, insights: Insight[]): { subject: string; html: string } {
  const summary = insights.find((i) => i.kind === "summary");
  const trend = insights.filter((i) => i.kind === "trend");
  const notable = insights.filter((i) => i.kind === "notable");
  const recs = insights.filter((i) => i.kind === "recommendation");

  const subject = `romanbediner.com daily digest -- ${data.dateLabel}`;

  const html = `<!doctype html>
<html>
  <body style="margin:0;padding:0;background:#f4f4f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
    <div style="display:none;max-height:0;overflow:hidden;mso-hide:all;font-size:1px;line-height:1px;color:#f4f4f5;">${escapeHtml(summary?.text ?? "Your daily romanbediner.com traffic recap.")}</div>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f5;padding:24px 0;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="width:100%;max-width:600px;background:#ffffff;border-radius:8px;overflow:hidden;">
            <tr>
              <td style="padding:28px 32px 4px 32px;">
                <div style="font-size:20px;font-weight:700;color:#111;">romanbediner.com</div>
                <div style="font-size:14px;color:#888;margin-top:2px;">What visitors did -- ${escapeHtml(data.dateLabel)}</div>
              </td>
            </tr>
            <tr><td style="padding:0 32px;"><hr style="border:none;border-top:1px solid #eee;margin:16px 0 0 0;"></td></tr>
            <tr><td style="padding:0 32px;"><table role="presentation" width="100%" cellpadding="0" cellspacing="0">
              ${scorecardRow(data)}
              ${summaryBlock(summary?.text ?? "")}
              ${section("Trend", trend)}
              ${sourceListSection("Where visitors came from", data.sources, prettySource)}
              ${sourceListSection("Channels", data.channels, (n) => n)}
              ${pagesSection(data.topPages)}
              ${activitySection(data.actions)}
              ${section("Notable changes", notable)}
              ${cardsSection(data.cardClicks)}
              ${section("Worth trying", recs)}
            </table></td></tr>
            <tr>
              <td style="padding:24px 32px 32px 32px;">
                <hr style="border:none;border-top:1px solid #eee;margin:0 0 16px 0;">
                <div style="font-size:12px;color:#999;line-height:1.5;">
                  Rule-based digest generated from GA4 data, excluding preview/staging traffic and passive page-load events.
                  For the full dashboard, see your Looker Studio report.
                </div>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;

  return { subject, html };
}

export async function sendDigestEmail(
  resendApiKey: string,
  from: string,
  to: string,
  subject: string,
  html: string
): Promise<void> {
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${resendApiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ from, to: [to], subject, html }),
  });

  if (!res.ok) {
    throw new Error(`Resend send failed: ${res.status} ${await res.text()}`);
  }
}
