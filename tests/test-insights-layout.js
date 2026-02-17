#!/usr/bin/env node
/**
 * Test: Insights card grid and centralized bullet system usage.
 */
const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const insightsHtml = fs.readFileSync(path.join(root, 'about/insights/index.html'), 'utf8');
const siteCss = fs.readFileSync(path.join(root, 'styles/site.css'), 'utf8');
const insightsCss = fs.readFileSync(path.join(root, 'styles/insights.css'), 'utf8');
const servicesCss = fs.readFileSync(path.join(root, 'styles/services.css'), 'utf8');
const servicesHtml = fs.readFileSync(path.join(root, 'services/index.html'), 'utf8');

let failures = 0;

if (!insightsHtml.includes('class="insights-grid"')) {
  failures += 1;
  console.error('FAIL: Insights page is missing .insights-grid.');
}

const insightCardCount = (insightsHtml.match(/class="insight-card card"/g) || []).length;
if (insightCardCount < 3) {
  failures += 1;
  console.error('FAIL: Insights page should contain at least 3 .insight-card.card entries.');
}

const insightListMatches = [...insightsHtml.matchAll(/<ul class="([^"]*insight-points[^"]*)">/g)];
if (insightListMatches.length < 3) {
  failures += 1;
  console.error('FAIL: Insights page should contain at least 3 insight point lists.');
} else {
  for (const match of insightListMatches) {
    if (!match[1].includes('bullet-list')) {
      failures += 1;
      console.error('FAIL: insight-points list is missing bullet-list utility class.');
    }
  }
}

const serviceListMatches = [...servicesHtml.matchAll(/<ul class="([^"]*service-list[^"]*)">/g)];
for (const match of serviceListMatches) {
  if (!match[1].includes('bullet-list')) {
    failures += 1;
    console.error('FAIL: service-list is missing bullet-list utility class.');
  }
}

if (!siteCss.includes('.bullet-list') || !siteCss.includes('.bullet-list li::before') || !siteCss.includes('background-image: url("/assets/icons/bullet.png");')) {
  failures += 1;
  console.error('FAIL: shared bullet system definition is incomplete in styles/site.css.');
}

if (/service-list\s+li::before/.test(servicesCss) || /insight-points\s+li::before/.test(insightsCss) || /bullet-list\s+li::before/.test(insightsCss)) {
  failures += 1;
  console.error('FAIL: page-level CSS should not override shared bullet pseudo-elements.');
}

if (failures > 0) {
  process.exit(1);
}

console.log('PASS: insights cards and centralized bullet system are configured correctly.');
