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
const insightsScript = fs.readFileSync(path.join(root, 'scripts/insights-briefs.js'), 'utf8');

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
    if (!match[1].includes('service-list')) {
      failures += 1;
      console.error('FAIL: insight-points list is missing shared service-list class.');
    }
  }
}

const serviceListMatches = [...servicesHtml.matchAll(/<ul class="([^"]*service-list[^"]*)">/g)];
for (const match of serviceListMatches) {
  if (match[1].includes('bullet-list')) {
    failures += 1;
    console.error('FAIL: legacy bullet-list class should not be present on Services lists.');
  }
}

if (!siteCss.includes('.service-list') || !siteCss.includes('.service-list li::before') || !siteCss.includes('background-image: url("/assets/icons/bullet.png");')) {
  failures += 1;
  console.error('FAIL: shared bullet system definition is incomplete in styles/site.css.');
}

if (/service-list\s+li::before/.test(servicesCss) || /insight-points\s+li::before/.test(insightsCss) || /bullet-list\s+li::before/.test(insightsCss)) {
  failures += 1;
  console.error('FAIL: page-level CSS should not override shared bullet pseudo-elements.');
}

if (!/\.insights-grid\s*\{[^}]*display:\s*flex;[^}]*flex-direction:\s*column;/s.test(insightsCss)) {
  failures += 1;
  console.error('FAIL: insights-grid must be a vertical flex stack.');
}

if (/grid-template-columns\s*:/s.test(insightsCss)) {
  failures += 1;
  console.error('FAIL: insights.css should not define grid-template-columns for insights-grid.');
}

if ((insightsHtml.match(/class="expand-brief"/g) || []).length < 3 || (insightsHtml.match(/class="brief-full"/g) || []).length < 3) {
  failures += 1;
  console.error('FAIL: each insight card should include expand-brief and brief-full elements.');
}

if (!insightsHtml.includes('src="../../scripts/insights-briefs.js"')) {
  failures += 1;
  console.error('FAIL: insights page must include the external expand/collapse script.');
}

if (!insightsScript.includes('classList.toggle("open")')) {
  failures += 1;
  console.error('FAIL: expand script must toggle the "open" class on brief panels.');
}

if (/--bullet-size|--bullet-gap|--bullet-nudge-y/.test(insightsCss)) {
  failures += 1;
  console.error('FAIL: insights.css must not redefine shared bullet variables.');
}

if (!/\.insight-card\s+h2\s*\{[^}]*font-size:\s*20px;[^}]*font-weight:\s*600;[^}]*letter-spacing:\s*normal;[^}]*line-height:\s*normal;/s.test(insightsCss)) {
  failures += 1;
  console.error('FAIL: insight-card h2 must mirror Services heading typography values.');
}

if (!/\.insight-divider\s*\{[^}]*height:\s*3px;[^}]*width:\s*60px;[^}]*margin:\s*1rem 0 1\.25rem 0;/s.test(insightsCss)) {
  failures += 1;
  console.error('FAIL: insight-divider styling does not match the required stronger treatment.');
}

if (!/\.insight-card\s*\{[^}]*max-width:\s*960px;[^}]*margin-left:\s*auto;[^}]*margin-right:\s*auto;/s.test(insightsCss)) {
  failures += 1;
  console.error('FAIL: insight-card readable width constraints are missing.');
}

if (!/\.expand-brief\s*\{[^}]*background:\s*none;[^}]*border:\s*none;[^}]*padding:\s*0;[^}]*margin-top:\s*1\.25rem;[^}]*transition:\s*opacity 150ms ease;/s.test(insightsCss) || !/\.expand-brief::after\s*\{[^}]*content:\s*" \\2192";/s.test(insightsCss)) {
  failures += 1;
  console.error('FAIL: expand-brief must use the editorial link-style treatment.');
}

if (failures > 0) {
  process.exit(1);
}

console.log('PASS: insights cards and centralized bullet system are configured correctly.');
