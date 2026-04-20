#!/usr/bin/env node
/**
 * Invariant:
 * - Shared transition block contract across Home and Insights.
 * Why this exists:
 * - Prevents drift in page-to-page narrative transitions and styling reuse.
 * What breaks if it fails:
 * - CI blocks deployment to prevent broken transition UX.
 */
const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..', '..');
const homeHtml = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const insightsHtml = fs.readFileSync(path.join(root, 'framework/index.html'), 'utf8');
const siteCss = fs.readFileSync(path.join(root, 'styles/site.css'), 'utf8');
const servicesCss = fs.readFileSync(path.join(root, 'styles/services.css'), 'utf8');

let failures = 0;

function assertSingleTransitionBlock(html, pageLabel) {
  const count = (html.match(/class="next-page-nav(?:\s|\")/g) || []).length;
  if (count !== 1) {
    failures += 1;
    console.error(`FAIL: ${pageLabel} must contain exactly one next-page-nav block, found ${count}.`);
  }

  for (const className of ['nav-anchor', 'nav-header-row', 'nav-label', 'nav-title', 'nav-arrow']) {
    if (!new RegExp(`class="[^"]*\\b${className}\\b[^"]*"`).test(html)) {
      failures += 1;
      console.error(`FAIL: ${pageLabel} transition block is missing class ${className}.`);
    }
  }

  if (!/class="[^"]*\b(section-accent|page-nav-divider)\b[^"]*"/.test(html)) {
    failures += 1;
    console.error(`FAIL: ${pageLabel} transition block must include section-accent or page-nav-divider.`);
  }

  if (!/class="nav-title sr-only"/.test(html)) {
    failures += 1;
    console.error(`FAIL: ${pageLabel} nav-title must remain in the DOM and include sr-only.`);
  }
}

assertSingleTransitionBlock(homeHtml, 'index.html');
assertSingleTransitionBlock(insightsHtml, 'framework/index.html');

if (!homeHtml.includes('Explore the Operating Model')) {
  failures += 1;
  console.error('FAIL: index.html is missing transition micro label Explore the Operating Model.');
}
if (!homeHtml.includes('Transition to About')) {
  failures += 1;
  console.error('FAIL: index.html is missing transition headline Transition to About.');
}
if (!/href="\/about\/"/.test(homeHtml)) {
  failures += 1;
  console.error('FAIL: index.html transition must link to /about/.');
}

if (!insightsHtml.includes('Explore Service Models')) {
  failures += 1;
  console.error('FAIL: framework/index.html is missing transition micro label Explore Service Models.');
}
if (!insightsHtml.includes('Transition to Services')) {
  failures += 1;
  console.error('FAIL: framework/index.html is missing transition headline Transition to Services.');
}
if (!/href="\/services\/"/.test(insightsHtml)) {
  failures += 1;
  console.error('FAIL: framework/index.html transition must link to /services/.');
}

if (!siteCss.includes('.next-page-nav')) {
  failures += 1;
  console.error('FAIL: shared transition component styles must exist in styles/site.css.');
}

if (!/\.sr-only\s*\{[^}]*position:\s*absolute;[^}]*width:\s*1px;[^}]*height:\s*1px;[^}]*clip:\s*rect\(0,\s*0,\s*0,\s*0\);/s.test(siteCss)) {
  failures += 1;
  console.error('FAIL: styles/site.css must provide the shared sr-only utility class.');
}

if (servicesCss.includes('.next-page-nav') || servicesCss.includes('.nav-anchor') || servicesCss.includes('.nav-title')) {
  failures += 1;
  console.error('FAIL: transition component styles must not be duplicated in styles/services.css.');
}

if (failures > 0) {
  process.exit(1);
}

console.log('PASS: transition block structure and shared-style contract checks passed.');
