// Synthetic DigestData used by both the /preview endpoint (src/index.ts) and the
// insights test suite (src/insights.test.ts) -- one fixture, two consumers, so a
// change to the shape only needs updating in one place. Numbers are made up but
// deliberately exercise every insight/recommendation branch in insights.ts:
// an up-trending action, a down-trending one, a zero-volume watched event, a low
// deep-scroll rate, and a healthy (non-crashing) overall traffic trend.

import type { DigestData } from "./insights";

export function buildMockDigestData(): DigestData {
  return {
    dateLabel: "Saturday, July 4 (mock preview data -- not real GA4 numbers)",
    usersYesterday: 14,
    usersTrailing7: 92,
    usersPrevious7: 61,
    actions: [
      { eventName: "nav_click", yesterday: 20, trailing7: 140, previous7: 90 },
      { eventName: "scroll", yesterday: 12, trailing7: 60, previous7: 55 },
      { eventName: "scroll_depth", yesterday: 3, trailing7: 15, previous7: 24 },
      { eventName: "internal_link_click", yesterday: 6, trailing7: 25, previous7: 20 },
      { eventName: "resource_card_click", yesterday: 1, trailing7: 8, previous7: 6 },
      { eventName: "resource_source_code_click", yesterday: 0, trailing7: 0, previous7: 1 },
      { eventName: "resource_preview_expand", yesterday: 1, trailing7: 3, previous7: 2 },
    ],
    topPages: [
      { pagePath: "/", views: 150, prevViews: 128 },
      { pagePath: "/resources/agentic-ai-employees/", views: 40, prevViews: 20 },
      { pagePath: "/about/", views: 22, prevViews: 31 },
      { pagePath: "/framework/", views: 18, prevViews: 0 },
    ],
    zeroVolumeEvents: ["resource_pdf_download"],
    cardClicks: [
      { title: "Agentic AI Employees", count: 5 },
      { title: "The Operator's Field Guide", count: 2 },
      { title: "AI-Enabled Operations Dashboard", count: 1 },
    ],
    sources: [
      { name: "google", sessions: 34 },
      { name: "(direct)", sessions: 20 },
      { name: "linkedin.com", sessions: 12 },
      { name: "chatgpt.com", sessions: 6 },
    ],
    channels: [
      { name: "Organic Search", sessions: 40 },
      { name: "Direct", sessions: 20 },
      { name: "Referral", sessions: 18 },
      { name: "Organic Social", sessions: 4 },
    ],
  };
}
