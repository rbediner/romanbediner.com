#!/usr/bin/env node
/**
 * Invariant:
 * - Regression guardrails for test-insights-layout.js.
 * Why this exists:
 * - Prevents architectural drift in routing, analytics, CSP, metadata, or shared UI contracts.
 * What breaks if it fails:
 * - CI blocks deployment to prevent production regressions.
 */
/**
 * Test: Insights structure, styling behavior, and shared orb bullet usage.
 */
const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..', '..');
const insightsHtml = fs.readFileSync(path.join(root, 'insights/index.html'), 'utf8');
const insightsCss = fs.readFileSync(path.join(root, 'styles/insights.css'), 'utf8');
const siteCss = fs.readFileSync(path.join(root, 'styles/site.css'), 'utf8');
const insightsScript = fs.readFileSync(path.join(root, 'scripts/runtime/insights-toggle.js'), 'utf8');

let failures = 0;

// Validate card markup and toggle wiring.
const insightCards = [...insightsHtml.matchAll(/<article id="([a-z0-9-]+)" class="insight-card">([\s\S]*?)<\/article>/g)];
if (insightCards.length < 3) {
  failures += 1;
  console.error('FAIL: Insights page should contain at least 3 insight-card sections.');
}

const seenSlugs = new Set();
for (const card of insightCards) {
  const slug = card[1];
  const cardHtml = card[2];
  const titleMatch = cardHtml.match(/<h2>([^<]+)<\/h2>/);

  if (!slug || seenSlugs.has(slug)) {
    failures += 1;
    console.error(`FAIL: duplicate or missing card slug: ${slug}`);
  }
  seenSlugs.add(slug);

  if (!titleMatch) {
    failures += 1;
    console.error(`FAIL: card ${slug} is missing an h2 title.`);
  }

  if (!/<button[\s\S]*class="insight-toggle"[\s\S]*aria-expanded="(true|false)"/i.test(cardHtml)) {
    failures += 1;
    console.error(`FAIL: card ${slug} is missing the insight-toggle button with aria-expanded.`);
  }

  if (!/<ul class="service-list">/i.test(cardHtml)) {
    failures += 1;
    console.error(`FAIL: card ${slug} is missing shared service-list bullets.`);
  }

  if (!/id="[a-z0-9-]+-content"\s+class="brief-content collapsed"/i.test(cardHtml)) {
    failures += 1;
    console.error(`FAIL: card ${slug} is missing collapsed brief-content container with semantic id.`);
  }

  // Guardrail: summary and bullets must remain visible in collapsed state, outside the brief-content block.
  const contentMarker = `id="${slug}-content" class="brief-content collapsed"`;
  const contentStart = cardHtml.indexOf(contentMarker);
  const summaryStart = cardHtml.indexOf('<p class="insight-summary">');
  const listStart = cardHtml.indexOf('<ul class="service-list">');
  if (contentStart === -1 || summaryStart === -1 || listStart === -1 || summaryStart > contentStart || listStart > contentStart) {
    failures += 1;
    console.error(`FAIL: card ${slug} must keep summary and service-list outside hidden brief-content.`);
  }
}

if (!insightsHtml.includes('src="/scripts/runtime/insights-toggle.js" defer')) {
  failures += 1;
  console.error('FAIL: Insights page must include deferred /scripts/runtime/insights-toggle.js.');
}

// Validate CSS behavior for toggle content region and hover lift.
if (!/\.brief-content\s*\{[^}]*overflow:\s*hidden;[^}]*transition:\s*max-height 280ms ease, opacity 220ms ease;/s.test(insightsCss)) {
  failures += 1;
  console.error('FAIL: brief-content region style is missing.');
}
if (!/\.brief-content\.collapsed\s*\{[^}]*max-height:\s*0;[^}]*overflow:\s*hidden;[^}]*opacity:\s*0;/s.test(insightsCss)) {
  failures += 1;
  console.error('FAIL: collapsed brief-content CSS state is missing.');
}
if (!/\.brief-content\.expanded\s*\{[^}]*margin-top:\s*16px;[^}]*max-height:\s*2000px;[^}]*opacity:\s*1;/s.test(insightsCss)) {
  failures += 1;
  console.error('FAIL: expanded brief-content CSS state must restore visible spacing.');
}
if (!/\.insight-card\s*\{[^}]*transition:\s*transform 180ms ease, box-shadow 180ms ease;/s.test(insightsCss)) {
  failures += 1;
  console.error('FAIL: insight-card transition must use transform/box-shadow 180ms ease.');
}
if (!/\.insight-card\s*\{[^}]*margin-bottom:\s*48px;/s.test(insightsCss)) {
  failures += 1;
  console.error('FAIL: insight-card must preserve the refined briefing vertical rhythm (48px spacing).');
}
if (!/\.insight-card,\s*[\s\S]*?\.philosophy-card\s*\{[^}]*padding:\s*40px;[^}]*border-radius:\s*8px;/s.test(siteCss)) {
  failures += 1;
  console.error('FAIL: site.css must own shared card geometry (40px padding, 8px radius).');
}
if (!/\.insight-card:hover\s*\{[^}]*transform:\s*translateY\(-2px\);/s.test(insightsCss)) {
  failures += 1;
  console.error('FAIL: insight-card hover lift must be translateY(-2px).');
}

if (!/\.section-accent\s*\{[^}]*width:\s*56px;[^}]*height:\s*3px;[^}]*background:\s*rgba\(59,\s*108,\s*255,\s*0\.62\);/s.test(insightsCss)) {
  failures += 1;
  console.error('FAIL: section accent must be short (56px), light blue, and 3px tall.');
}

if (!/\.insight-actions\s*\{[^}]*justify-content:\s*flex-end;/s.test(insightsCss) || !/\.insight-toggle\s*\{[^}]*border-radius:\s*6px;/s.test(insightsCss)) {
  failures += 1;
  console.error('FAIL: bottom-right executive toggle styling is missing.');
}

// Validate shared orb bullet implementation in global CSS.
if (!/\.service-list li::before\s*\{[^}]*width:\s*8px;[^}]*height:\s*8px;[^}]*margin-right:\s*14px;[^}]*background-image:\s*url\("\/assets\/icons\/bullet\.png"\);/s.test(siteCss)) {
  failures += 1;
  console.error('FAIL: shared orb bullet spec is not correctly defined in site.css.');
}

// Validate GA tracking contract in script.
if (!insightsScript.includes("window.gtag('event', 'insight_toggle'")) {
  failures += 1;
  console.error('FAIL: insight_toggle GA event call is missing.');
}
if (!insightsScript.includes('insight_slug')) {
  failures += 1;
  console.error('FAIL: insight_slug parameter is missing.');
}
if (!insightsScript.includes('insight_title')) {
  failures += 1;
  console.error('FAIL: insight_title parameter is missing.');
}
if (!insightsScript.includes('action: expanded ? \'collapse\' : \'expand\'')) {
  failures += 1;
  console.error('FAIL: action parameter must be expand/collapse based on current state.');
}
if (!insightsScript.includes('page_path: window.location.pathname')) {
  failures += 1;
  console.error('FAIL: page_path parameter must use window.location.pathname.');
}

if (failures > 0) {
  process.exit(1);
}

console.log('PASS: insights structure, behavior, and orb bullet checks passed.');
