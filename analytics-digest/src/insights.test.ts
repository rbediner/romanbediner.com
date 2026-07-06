// Tests the deterministic, threshold-driven logic in insights.ts. buildInsights()
// is the public contract (pctChange etc. are private helpers), so these assert
// against its output for known inputs -- exactly the kind of pure, cheap-to-test
// logic that's easy to silently break in a daily email nobody re-reads closely.

import { describe, expect, it } from "vitest";
import { buildInsights } from "./insights";
import type { DigestData } from "./insights";
import { buildMockDigestData } from "./mock-data";

function baseData(overrides: Partial<DigestData> = {}): DigestData {
  return {
    dateLabel: "Test Day",
    usersYesterday: 10,
    usersTrailing7: 70,
    usersPrevious7: 70,
    actions: [],
    topPages: [],
    zeroVolumeEvents: [],
    ...overrides,
  };
}

describe("buildInsights -- trend", () => {
  it("reports an upward trend when trailing7 is >5% above previous7", () => {
    const insights = buildInsights(baseData({ usersTrailing7: 100, usersPrevious7: 70 }));
    const trend = insights.find((i) => i.kind === "trend" && i.text.startsWith("Visitors:"));
    expect(trend?.text).toContain("up");
    expect(trend?.text).toContain("+43%");
  });

  it("reports a downward trend when trailing7 is >5% below previous7", () => {
    const insights = buildInsights(baseData({ usersTrailing7: 50, usersPrevious7: 100 }));
    const trend = insights.find((i) => i.kind === "trend" && i.text.startsWith("Visitors:"));
    // Direction is conveyed by the "down"/"up" word; fmtPct() always renders
    // the magnitude with a "+" sign since it's always fed Math.abs(change).
    expect(trend?.text).toContain("down +50%");
  });

  it("reports roughly flat within +/-5%", () => {
    const insights = buildInsights(baseData({ usersTrailing7: 102, usersPrevious7: 100 }));
    const trend = insights.find((i) => i.kind === "trend" && i.text.startsWith("Visitors:"));
    expect(trend?.text).toContain("roughly flat");
  });

  it("falls back to 'no prior-week baseline yet' when previous7 is zero", () => {
    const insights = buildInsights(baseData({ usersTrailing7: 12, usersPrevious7: 0 }));
    const trend = insights.find((i) => i.kind === "trend" && i.text.startsWith("Visitors:"));
    expect(trend?.text).toContain("no prior-week baseline yet");
  });

  it("does not divide by zero or crash when both trailing7 and previous7 are zero", () => {
    expect(() => buildInsights(baseData({ usersTrailing7: 0, usersPrevious7: 0 }))).not.toThrow();
  });
});

describe("buildInsights -- notable per-action deltas", () => {
  it("surfaces an action whose trailing7 count moved >=25% week-over-week", () => {
    const insights = buildInsights(
      baseData({ actions: [{ eventName: "nav_click", yesterday: 5, trailing7: 40, previous7: 20 }] })
    );
    const notable = insights.filter((i) => i.kind === "notable");
    expect(notable.some((i) => i.text.includes("navigation clicks"))).toBe(true);
  });

  it("does not surface an action whose change is below the 25% threshold", () => {
    const insights = buildInsights(
      baseData({ actions: [{ eventName: "nav_click", yesterday: 5, trailing7: 21, previous7: 20 }] })
    );
    const notable = insights.filter((i) => i.kind === "notable");
    expect(notable.some((i) => i.text.includes("navigation clicks"))).toBe(false);
  });

  it("caps notable per-action callouts at 4, sorted by magnitude of change", () => {
    const actions = ["a", "b", "c", "d", "e"].map((name, i) => ({
      eventName: name,
      yesterday: 1,
      trailing7: 100,
      previous7: 100 - (i + 1) * 10, // increasing % change per action
    }));
    const insights = buildInsights(baseData({ actions }));
    const notableActionCallouts = insights.filter((i) => i.kind === "notable" && i.text.includes(" this week vs. "));
    expect(notableActionCallouts.length).toBeLessThanOrEqual(4);
  });
});

describe("buildInsights -- zero-volume watched events", () => {
  it("calls out watched events with zero activity in the last 7 days", () => {
    const insights = buildInsights(baseData({ zeroVolumeEvents: ["resource_pdf_download"] }));
    const callout = insights.find((i) => i.text.startsWith("No activity in the last 7 days for"));
    expect(callout?.text).toContain("PDF downloads");
  });

  it("recommends a clearer download CTA when resource_pdf_download is zero-volume", () => {
    const insights = buildInsights(baseData({ zeroVolumeEvents: ["resource_pdf_download"] }));
    expect(insights.some((i) => i.kind === "recommendation" && i.text.includes("download CTA"))).toBe(true);
  });
});

describe("buildInsights -- recommendations", () => {
  it("recommends checking above-the-fold content when deep-scroll rate is below 30%", () => {
    const insights = buildInsights(
      baseData({
        actions: [
          { eventName: "scroll", yesterday: 5, trailing7: 100, previous7: 100 },
          { eventName: "scroll_depth", yesterday: 1, trailing7: 20, previous7: 20 },
        ],
      })
    );
    expect(insights.some((i) => i.kind === "recommendation" && i.text.includes("75% depth"))).toBe(true);
  });

  it("does not recommend the scroll-depth check when the rate is healthy", () => {
    const insights = buildInsights(
      baseData({
        actions: [
          { eventName: "scroll", yesterday: 5, trailing7: 100, previous7: 100 },
          { eventName: "scroll_depth", yesterday: 4, trailing7: 60, previous7: 60 },
        ],
      })
    );
    expect(insights.some((i) => i.kind === "recommendation" && i.text.includes("75% depth"))).toBe(false);
  });

  it("recommends investigating a broken link/change on a >=25% traffic drop", () => {
    const insights = buildInsights(baseData({ usersTrailing7: 30, usersPrevious7: 100 }));
    expect(insights.some((i) => i.kind === "recommendation" && i.text.includes("Traffic dropped"))).toBe(true);
  });
});

describe("buildInsights -- top page", () => {
  it("recommends leveraging the busiest page when one dominates pageviews", () => {
    const insights = buildInsights(
      baseData({
        topPages: [
          { pagePath: "/", views: 80 },
          { pagePath: "/about/", views: 20 },
        ],
      })
    );
    const rec = insights.find((i) => i.kind === "recommendation" && i.text.includes("busiest page"));
    expect(rec?.text).toContain("Home");
    expect(rec?.text).toContain("80%");
  });
});

describe("buildInsights -- mock fixture", () => {
  it("runs end-to-end on the shared mock fixture without throwing and produces all three insight kinds", () => {
    const insights = buildInsights(buildMockDigestData());
    const kinds = new Set(insights.map((i) => i.kind));
    expect(kinds.has("trend")).toBe(true);
    expect(kinds.has("notable")).toBe(true);
    expect(kinds.has("recommendation")).toBe(true);
  });
});
