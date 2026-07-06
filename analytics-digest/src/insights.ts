// Rule-based interpretation of GA4 numbers into plain-English insights and
// recommendations. Deliberately deterministic (no LLM call, no extra API
// key/cost/latency dependency) -- every sentence traces back to a specific
// threshold on a specific number, so nothing here is ever invented.

export interface ActionRow {
  eventName: string;
  yesterday: number;
  trailing7: number;
  previous7: number;
}

export interface PageRow {
  pagePath: string;
  views: number;
  prevViews?: number; // views in the prior 7-day window, for week-over-week movement
}

export interface CardClickRow {
  title: string; // resource_title custom dimension value
  count: number;
}

export interface TrafficSourceRow {
  name: string; // sessionSource value or GA4 default channel group
  sessions: number;
}

export interface DigestData {
  dateLabel: string; // the day being reported on, e.g. "Friday, July 3"
  usersYesterday: number;
  usersTrailing7: number;
  usersPrevious7: number;
  actions: ActionRow[];
  topPages: PageRow[];
  zeroVolumeEvents: string[]; // tracked key events with 0 in the last 7 days
  cardClicks?: CardClickRow[]; // which specific resource cards were clicked (trailing 7d)
  sources?: TrafficSourceRow[]; // top referring sources by sessions (trailing 7d)
  channels?: TrafficSourceRow[]; // GA4 default channel grouping by sessions (trailing 7d)
}

export interface Insight {
  text: string;
  kind: "summary" | "trend" | "notable" | "recommendation";
}

/** Turn a raw page path into a readable label, e.g. "/" -> "Home",
 * "/resources/agentic-ai-employees/" -> "Agentic AI Employees". */
export function prettyPage(path: string): string {
  if (!path || path === "/") return "Home";
  const seg = path.replace(/\/+$/, "").split("/").filter(Boolean).pop() ?? path;
  return seg
    .replace(/[-_]/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase())
    .replace(/\bAi\b/g, "AI");
}

/** Human-friendly label for a GA4 sessionSource value. */
export function prettySource(name: string): string {
  if (!name || name === "(not set)" || name === "(none)") return "Unknown";
  if (name === "(direct)") return "Direct";
  const map: Record<string, string> = {
    google: "Google",
    "chatgpt.com": "ChatGPT",
    "t.co": "X / Twitter",
    "com.linkedin.android": "LinkedIn",
    "linkedin.com": "LinkedIn",
    "lnkd.in": "LinkedIn",
    "bing.com": "Bing",
    "duckduckgo.com": "DuckDuckGo",
    "reddit.com": "Reddit",
    "out.reddit.com": "Reddit",
  };
  if (map[name]) return map[name];
  const clean = name.replace(/^www\./, "");
  return clean.charAt(0).toUpperCase() + clean.slice(1);
}

function pctChange(current: number, previous: number): number | null {
  if (previous === 0) return current === 0 ? 0 : null; // undefined growth from zero
  return ((current - previous) / previous) * 100;
}

function fmtPct(p: number): string {
  const sign = p > 0 ? "+" : "";
  return `${sign}${p.toFixed(0)}%`;
}

const ACTION_LABELS: Record<string, string> = {
  nav_click: "navigation clicks",
  scroll_depth: "deep scrolls (75%+)",
  scroll: "scrolls",
  internal_link_click: "internal link clicks",
  resource_card_click: "resource card clicks",
  resource_pdf_download: "PDF downloads",
  resource_source_code_click: "source code clicks",
  resource_external_cta_click: "external CTA clicks",
  resource_preview_expand: "resource preview expansions",
};

export function label(eventName: string): string {
  return ACTION_LABELS[eventName] ?? eventName;
}

export function buildInsights(data: DigestData): Insight[] {
  const insights: Insight[] = [];

  // --- Overall traffic trend (7-day trailing vs previous 7 days, to smooth
  // out day-to-day noise on a low-traffic site) ---
  const perDay = Math.round(data.usersTrailing7 / 7);
  const userTrend = pctChange(data.usersTrailing7, data.usersPrevious7);
  if (userTrend !== null) {
    const direction = userTrend > 5 ? "up" : userTrend < -5 ? "down" : "flat";
    insights.push({
      kind: "trend",
      text:
        `Visitors: ${data.usersYesterday} yesterday, ${data.usersTrailing7} over the trailing 7 days ` +
        `(~${perDay}/day, ${direction === "flat" ? "roughly flat" : `${direction} ${fmtPct(Math.abs(userTrend))}`} vs. the 7 days before that).`,
    });
  } else {
    insights.push({
      kind: "trend",
      text: `Visitors: ${data.usersYesterday} yesterday, ${data.usersTrailing7} over the trailing 7 days (~${perDay}/day, no prior-week baseline yet).`,
    });
  }

  // --- Per-action deltas worth flagging (trailing 7 vs previous 7, |change| >= 25%) ---
  const significant = data.actions
    .map((a) => ({ ...a, change: pctChange(a.trailing7, a.previous7) }))
    .filter((a) => a.change !== null && Math.abs(a.change) >= 25 && (a.trailing7 > 0 || a.previous7 > 0))
    .sort((a, b) => Math.abs(b.change!) - Math.abs(a.change!));

  for (const a of significant.slice(0, 4)) {
    const dir = a.change! > 0 ? "up" : "down";
    insights.push({
      kind: "notable",
      text: `${label(a.eventName)}: ${a.trailing7} this week vs. ${a.previous7} last week (${dir} ${fmtPct(Math.abs(a.change!))}; ${a.yesterday} yesterday).`,
    });
  }

  // --- Zero-volume key events: surfaced explicitly instead of silently absent ---
  if (data.zeroVolumeEvents.length > 0) {
    const names = data.zeroVolumeEvents.map(label).join(", ");
    insights.push({
      kind: "notable",
      text: `No activity in the last 7 days for: ${names}. These are tracked but nobody has triggered them.`,
    });
  }

  // --- Templated recommendations, each tied to a concrete detected condition ---
  if (data.zeroVolumeEvents.includes("resource_pdf_download")) {
    insights.push({
      kind: "recommendation",
      text: "Zero PDF downloads this week -- if you want people pulling your resume/case studies, consider a more visible download CTA near the top of the resources page rather than relying on a card click.",
    });
  }
  if (data.zeroVolumeEvents.includes("resource_source_code_click")) {
    insights.push({
      kind: "recommendation",
      text: "Zero source-code clicks this week -- if that link is meant for a technical audience, check it's not buried below the fold or mislabeled.",
    });
  }

  const scrollDepth = data.actions.find((a) => a.eventName === "scroll_depth");
  const scroll = data.actions.find((a) => a.eventName === "scroll");
  if (scrollDepth && scroll && scroll.trailing7 > 0) {
    const deepScrollRate = scrollDepth.trailing7 / scroll.trailing7;
    if (deepScrollRate < 0.3) {
      insights.push({
        kind: "recommendation",
        text: `Only ${Math.round(deepScrollRate * 100)}% of scrolls reach the 75% depth mark this week -- visitors may be losing interest early. Worth checking what's above the fold on your most-viewed page.`,
      });
    }
  }

  if (userTrend !== null && userTrend <= -25) {
    insights.push({
      kind: "recommendation",
      text: `Traffic dropped ${fmtPct(Math.abs(userTrend))} week-over-week -- worth checking if a recent change (nav update, deploy, broken link) coincides with the drop.`,
    });
  }

  // --- Positive/action recommendation: leverage the busiest page ---
  if (data.topPages.length > 0) {
    const top = data.topPages[0];
    const total = data.topPages.reduce((sum, p) => sum + p.views, 0);
    const share = total > 0 ? Math.round((top.views / total) * 100) : 0;
    if (share >= 30) {
      insights.push({
        kind: "recommendation",
        text: `${prettyPage(top.pagePath)} is your busiest page (${share}% of views this week) -- make sure its main call-to-action points where you want visitors to go next.`,
      });
    }
  }

  // --- Traffic-source concentration: flag over-reliance on a single source ---
  if (data.sources && data.sources.length > 1) {
    const totalSessions = data.sources.reduce((sum, s) => sum + s.sessions, 0);
    const topSource = data.sources[0];
    const share = totalSessions > 0 ? Math.round((topSource.sessions / totalSessions) * 100) : 0;
    if (share >= 70) {
      insights.push({
        kind: "recommendation",
        text: `${share}% of visits came from ${prettySource(topSource.name)} -- worth cultivating a second channel so your traffic doesn't hinge on one source.`,
      });
    }
  }

  // --- Bottom line: one synthesized takeaway, unshifted so it renders first ---
  const summaryParts: string[] = [];
  if (userTrend !== null && userTrend <= -25) {
    summaryParts.push(`Heads up -- visitors down ${fmtPct(Math.abs(userTrend))} week-over-week.`);
  } else if (userTrend !== null && userTrend > 5) {
    summaryParts.push(`Good week -- visitors up ${fmtPct(userTrend)} vs. the prior 7 days.`);
  } else if (userTrend === null) {
    summaryParts.push(`${data.usersTrailing7} visitors over the last 7 days (first week of data).`);
  } else {
    summaryParts.push(`Steady week -- visitors roughly flat.`);
  }
  if (data.topPages.length > 0) {
    summaryParts.push(`Most traffic went to ${prettyPage(data.topPages[0].pagePath)}.`);
  }
  if (data.sources && data.sources.length > 0) {
    summaryParts.push(`Most visitors arrived via ${prettySource(data.sources[0].name)}.`);
  }
  if (data.zeroVolumeEvents.length > 0) {
    summaryParts.push(`${data.zeroVolumeEvents.map(label).join(" and ")} saw zero activity.`);
  }
  insights.unshift({ kind: "summary", text: summaryParts.join(" ") });

  return insights;
}
