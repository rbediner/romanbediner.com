#!/usr/bin/env node
/**
 * Test: Insights structure, styling behavior, and shared orb bullet usage.
 */
const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const insightsHtml = fs.readFileSync(path.join(root, 'insights/index.html'), 'utf8');
const insightsCss = fs.readFileSync(path.join(root, 'styles/insights.css'), 'utf8');
const siteCss = fs.readFileSync(path.join(root, 'styles/site.css'), 'utf8');
const insightsScript = fs.readFileSync(path.join(root, 'scripts/insights-briefs.js'), 'utf8');

let failures = 0;

// Validate card markup and toggle wiring.
const insightCards = [...insightsHtml.matchAll(/<section id="([a-z0-9-]+)" class="insight-card">([\s\S]*?)<\/section>/g)];
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

  if (!/<button class="insight-toggle"[^>]*aria-expanded="false"/i.test(cardHtml)) {
    failures += 1;
    console.error(`FAIL: card ${slug} is missing the collapsed insight-toggle button.`);
  }

  if (!/<ul class="service-list">/i.test(cardHtml)) {
    failures += 1;
    console.error(`FAIL: card ${slug} is missing shared service-list bullets.`);
  }

  if (!/<div class="insight-expanded">/i.test(cardHtml)) {
    failures += 1;
    console.error(`FAIL: card ${slug} is missing insight-expanded content container.`);
  }
}

if (!insightsHtml.includes('src="../scripts/insights-briefs.js"')) {
  failures += 1;
  console.error('FAIL: Insights page must include insights-briefs.js from ../scripts/.');
}

// Validate CSS behavior for collapse/expand and hover lift.
if (!/\.insight-expanded\s*\{[^}]*display:\s*none;/s.test(insightsCss)) {
  failures += 1;
  console.error('FAIL: insight-expanded must be hidden by default.');
}
if (!/\.insight-card\.expanded\s+\.insight-expanded\s*\{[^}]*display:\s*block;/s.test(insightsCss)) {
  failures += 1;
  console.error('FAIL: expanded insight content rule is missing.');
}
if (!/\.insight-card\s*\{[^}]*transition:\s*transform 150ms ease;/s.test(insightsCss)) {
  failures += 1;
  console.error('FAIL: insight-card transition must use transform 150ms ease.');
}
if (!/\.insight-card:hover\s*\{[^}]*transform:\s*translateY\(-2px\);/s.test(insightsCss)) {
  failures += 1;
  console.error('FAIL: insight-card hover lift must be translateY(-2px).');
}

// Validate shared orb bullet implementation in global CSS.
if (!/\.service-list li::before\s*\{[^}]*width:\s*10px;[^}]*height:\s*10px;[^}]*margin-right:\s*12px;[^}]*background-image:\s*url\("\/assets\/icons\/bullet\.png"\);/s.test(siteCss)) {
  failures += 1;
  console.error('FAIL: shared orb bullet spec is not correctly defined in site.css.');
}

// Validate GA tracking contract in script.
if (!insightsScript.includes("gtag('event', 'insight_expand'")) {
  failures += 1;
  console.error('FAIL: insight_expand GA event call is missing.');
}
if (!/if \(isExpanded && typeof gtag === 'function'\)/.test(insightsScript)) {
  failures += 1;
  console.error('FAIL: GA event must fire only on expand and guard missing gtag.');
}

if (failures > 0) {
  process.exit(1);
}

console.log('PASS: insights structure, behavior, and orb bullet checks passed.');
