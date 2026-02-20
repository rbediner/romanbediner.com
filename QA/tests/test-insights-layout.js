#!/usr/bin/env node
/**
 * Test: Insights structure, styling behavior, and shared orb bullet usage.
 */
const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..', '..');
const insightsHtml = fs.readFileSync(path.join(root, 'insights/index.html'), 'utf8');
const insightsCss = fs.readFileSync(path.join(root, 'styles/insights.css'), 'utf8');
const siteCss = fs.readFileSync(path.join(root, 'styles/site.css'), 'utf8');
const insightsScript = fs.readFileSync(path.join(root, 'scripts/insights-toggle.js'), 'utf8');

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

  if (!/id="[a-z0-9-]+-content"\s+class="brief-content"/i.test(cardHtml)) {
    failures += 1;
    console.error(`FAIL: card ${slug} is missing brief-content container with semantic id.`);
  }
}

if (!insightsHtml.includes('src="/scripts/insights-toggle.js" defer')) {
  failures += 1;
  console.error('FAIL: Insights page must include deferred /scripts/insights-toggle.js.');
}

// Validate CSS behavior for toggle content region and hover lift.
if (!/\.brief-content\s*\{[^}]*margin-top:\s*16px;/s.test(insightsCss)) {
  failures += 1;
  console.error('FAIL: brief-content region style is missing.');
}
if (!/\.insight-card\s*\{[^}]*transition:\s*transform 180ms ease, box-shadow 180ms ease;/s.test(insightsCss)) {
  failures += 1;
  console.error('FAIL: insight-card transition must use transform/box-shadow 180ms ease.');
}
if (!/\.insight-card:hover\s*\{[^}]*transform:\s*translateY\(-4px\);/s.test(insightsCss)) {
  failures += 1;
  console.error('FAIL: insight-card hover lift must be translateY(-4px).');
}

if (!/\.insight-accent\s*\{[^}]*width:\s*56px;[^}]*height:\s*3px;[^}]*background:\s*rgba\(59,\s*108,\s*255,\s*0\.62\);/s.test(insightsCss)) {
  failures += 1;
  console.error('FAIL: insight accent must be short (56px), light blue, and 3px tall.');
}

if (!/\.insight-actions\s*\{[^}]*justify-content:\s*flex-end;/s.test(insightsCss) || !/\.insight-toggle\s*\{[^}]*border-radius:\s*999px;/s.test(insightsCss)) {
  failures += 1;
  console.error('FAIL: bottom-right pill toggle styling is missing.');
}

// Validate shared orb bullet implementation in global CSS.
if (!/\.service-list li::before\s*\{[^}]*width:\s*8px;[^}]*height:\s*8px;[^}]*margin-right:\s*14px;[^}]*background-image:\s*url\("\/icons\/bullet\.png"\);/s.test(siteCss)) {
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
