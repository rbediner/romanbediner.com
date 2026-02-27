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
const insightsHtml = fs.readFileSync(path.join(root, 'insights/index.html'), 'utf8');
const siteCss = fs.readFileSync(path.join(root, 'styles/site.css'), 'utf8');
const servicesCss = fs.readFileSync(path.join(root, 'styles/services.css'), 'utf8');

let failures = 0;

function assertSingleTransitionBlock(html, pageLabel) {
  const count = (html.match(/class="next-page-nav(?:\s|\")/g) || []).length;
  if (count !== 1) {
    failures += 1;
    console.error(`FAIL: ${pageLabel} must contain exactly one next-page-nav block, found ${count}.`);
  }

  for (const className of ['section-accent', 'nav-anchor', 'nav-header-row', 'nav-label', 'nav-title', 'nav-arrow']) {
    if (!new RegExp(`class="[^"]*\\b${className}\\b[^"]*"`).test(html)) {
      failures += 1;
      console.error(`FAIL: ${pageLabel} transition block is missing class ${className}.`);
    }
  }
}

assertSingleTransitionBlock(homeHtml, 'index.html');
assertSingleTransitionBlock(insightsHtml, 'insights/index.html');

if (!homeHtml.includes('THE EXECUTION LAYER')) {
  failures += 1;
  console.error('FAIL: index.html is missing transition micro label THE EXECUTION LAYER.');
}
if (!homeHtml.includes('Transition to Operating Philosophy')) {
  failures += 1;
  console.error('FAIL: index.html is missing transition headline Transition to Operating Philosophy.');
}
if (!/href="\/about\/"/.test(homeHtml)) {
  failures += 1;
  console.error('FAIL: index.html transition must link to /about/.');
}

if (!insightsHtml.includes('THE RELATIONSHIP LAYER')) {
  failures += 1;
  console.error('FAIL: insights/index.html is missing transition micro label THE RELATIONSHIP LAYER.');
}
if (!insightsHtml.includes('Transition to Connect')) {
  failures += 1;
  console.error('FAIL: insights/index.html is missing transition headline Transition to Connect.');
}
if (!/href="\/connect\/"/.test(insightsHtml)) {
  failures += 1;
  console.error('FAIL: insights/index.html transition must link to /connect/.');
}

if (!siteCss.includes('.next-page-nav')) {
  failures += 1;
  console.error('FAIL: shared transition component styles must exist in styles/site.css.');
}

if (servicesCss.includes('.next-page-nav') || servicesCss.includes('.nav-anchor') || servicesCss.includes('.nav-title')) {
  failures += 1;
  console.error('FAIL: transition component styles must not be duplicated in styles/services.css.');
}

if (failures > 0) {
  process.exit(1);
}

console.log('PASS: transition block structure and shared-style contract checks passed.');
