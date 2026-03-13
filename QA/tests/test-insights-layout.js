#!/usr/bin/env node
/**
 * Invariant:
 * - Framework page structure and styling must remain stable.
 * Why this exists:
 * - Prevents regressions in stage navigation, section flow, and readability.
 * What breaks if it fails:
 * - CI blocks deployment when framework layout contracts drift.
 */
const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..', '..');
const frameworkHtml = fs.readFileSync(path.join(root, 'framework/index.html'), 'utf8');
const frameworkCss = fs.readFileSync(path.join(root, 'styles/framework.css'), 'utf8');
const siteCss = fs.readFileSync(path.join(root, 'styles/site.css'), 'utf8');

let failures = 0;

const stageIds = ['opportunity', 'design', 'integration', 'execution', 'signals', 'evolution'];
for (const id of stageIds) {
  if (!new RegExp(`<section id="${id}" class="framework-section insight-card">`).test(frameworkHtml)) {
    failures += 1;
    console.error(`FAIL: missing framework section #${id}.`);
  }
  if (!new RegExp(`href="#${id}"`).test(frameworkHtml)) {
    failures += 1;
    console.error(`FAIL: stage nav missing anchor href #${id}.`);
  }
}

const sectionCount = (frameworkHtml.match(/class="framework-section insight-card"/g) || []).length;
if (sectionCount !== 6) {
  failures += 1;
  console.error(`FAIL: expected 6 framework sections, found ${sectionCount}.`);
}

if ((frameworkHtml.match(/class="framework-arrow"/g) || []).length !== 3) {
  failures += 1;
  console.error('FAIL: expected exactly 3 framework arrows between stage groups.');
}

if (/insight-toggle|brief-content|\+ Expand|- Collapse/.test(frameworkHtml)) {
  failures += 1;
  console.error('FAIL: legacy expand/collapse insights functionality is still present on framework page.');
}

if (!/class="framework-progress"/.test(frameworkHtml) || !/class="framework-progress-line"/.test(frameworkHtml)) {
  failures += 1;
  console.error('FAIL: framework progress indicator line is missing.');
}

if (!/\.framework-progress-line\s*\{[^}]*height:\s*2px;[^}]*opacity:\s*0\.25;/s.test(frameworkCss)) {
  failures += 1;
  console.error('FAIL: framework progress line styling contract is missing (2px, 0.25 opacity).');
}

if (!/\.framework-progress\s*\{[^}]*max-width:\s*700px;/s.test(frameworkCss)) {
  failures += 1;
  console.error('FAIL: framework progress max-width must be 700px.');
}

if (!/\.framework-progress-markers span\s*\{[^}]*width:\s*8px;[^}]*height:\s*8px;[^}]*opacity:\s*0\.5;/s.test(frameworkCss)) {
  failures += 1;
  console.error('FAIL: framework progress markers must be 8px circles at 0.5 opacity.');
}

if (!/\.framework-section\s*\{[^}]*max-width:\s*var\(--framework-max-width\);/s.test(frameworkCss)) {
  failures += 1;
  console.error('FAIL: framework sections must use constrained narrative width.');
}

if (!/--framework-max-width:\s*860px;/.test(frameworkCss)) {
  failures += 1;
  console.error('FAIL: framework max width token must remain 860px.');
}

if (!/\.framework-section \+ \.framework-section\s*\{[^}]*margin-top:\s*48px;/s.test(frameworkCss)) {
  failures += 1;
  console.error('FAIL: framework section vertical rhythm must remain 48px.');
}

if (!/\.framework-section:hover\s*\{[^}]*translateY\(-2px\);[^}]*box-shadow:\s*0 4px 14px rgba\(0, 0, 0, 0\.06\);/s.test(frameworkCss)) {
  failures += 1;
  console.error('FAIL: framework hover behavior contract is missing.');
}

if (!/\.framework-section ul\s*\{[^}]*line-height:\s*1\.6;[^}]*margin-top:\s*14px;/s.test(frameworkCss)) {
  failures += 1;
  console.error('FAIL: framework bullet readability rule is missing for list containers.');
}

if (!/\.framework-section li\s*\{[^}]*margin-bottom:\s*10px;[^}]*max-width:\s*620px;/s.test(frameworkCss)) {
  failures += 1;
  console.error('FAIL: framework bullet readability rule is missing for list items.');
}

if (!/\.badge-phase\s*\{/.test(siteCss)) {
  failures += 1;
  console.error('FAIL: shared badge-phase style must exist in site.css.');
}

const frameworkIcons = [
  '/assets/icons/framework/opportunity.svg',
  '/assets/icons/framework/design.svg',
  '/assets/icons/framework/integration.svg',
  '/assets/icons/framework/execution.svg',
  '/assets/icons/framework/signals.svg',
  '/assets/icons/framework/evolution.svg'
];
for (const iconPath of frameworkIcons) {
  if (!frameworkHtml.includes(`src="${iconPath}"`)) {
    failures += 1;
    console.error(`FAIL: missing framework icon reference ${iconPath}`);
  }
}

if (failures > 0) {
  process.exit(1);
}

console.log('PASS: framework layout and stage contracts passed.');
