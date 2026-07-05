import type { DigestData, Insight } from "./insights";

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

export function renderDigestEmail(data: DigestData, insights: Insight[]): { subject: string; html: string } {
  const trend = insights.filter((i) => i.kind === "trend");
  const notable = insights.filter((i) => i.kind === "notable");
  const recs = insights.filter((i) => i.kind === "recommendation");

  const subject = `romanbediner.com daily digest -- ${data.dateLabel}`;

  const html = `<!doctype html>
<html>
  <body style="margin:0;padding:0;background:#f4f4f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f5;padding:24px 0;">
      <tr>
        <td align="center">
          <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:8px;overflow:hidden;">
            <tr>
              <td style="padding:28px 32px 4px 32px;">
                <div style="font-size:20px;font-weight:700;color:#111;">romanbediner.com</div>
                <div style="font-size:14px;color:#888;margin-top:2px;">What visitors did -- ${escapeHtml(data.dateLabel)}</div>
              </td>
            </tr>
            <tr><td style="padding:0 32px;"><hr style="border:none;border-top:1px solid #eee;margin:16px 0 0 0;"></td></tr>
            <tr><td style="padding:0 32px;"><table role="presentation" width="100%" cellpadding="0" cellspacing="0">
              ${section("Trend", trend)}
              ${section("Notable", notable)}
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
