#!/usr/bin/env node
/**
 * Invariant:
 * - Framework page retains the vertical architecture while enforcing refined content and visual contracts.
 * Why this exists:
 * - Prevents subtle regression in hierarchy, section content, iconography, and transition wiring.
 * What breaks if it fails:
 * - CI blocks deployment when framework refinement requirements drift.
 */
const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..', '..');
const frameworkHtml = fs.readFileSync(path.join(root, 'framework/index.html'), 'utf8');
const frameworkCss = fs.readFileSync(path.join(root, 'styles/framework.css'), 'utf8');

let failures = 0;

const stageIds = ['opportunity', 'design', 'integration', 'execution', 'signals', 'evolution'];
const expectedTitles = {
  opportunity: 'Productizing Operations for Modern AI-Enabled Work',
  design: 'Operations as a Product for Scalable Execution',
  integration: 'Integrating AI as an Operating Layer',
  execution: 'Operational Lanes for Scalable Execution',
  signals: 'Steering Execution with Operational Signals',
  evolution: 'Designing Adaptive Guardrails for Agentic Work'
};

for (const id of stageIds) {
  if (!new RegExp(`<section id="${id}" class="framework-section framework-card insight-card">`).test(frameworkHtml)) {
    failures += 1;
    console.error(`FAIL: missing framework section #${id}.`);
  }
  if (!new RegExp(`href="#${id}"`).test(frameworkHtml)) {
    failures += 1;
    console.error(`FAIL: stage nav missing anchor href #${id}.`);
  }
}

if ((frameworkHtml.match(/class="framework-section framework-card insight-card"/g) || []).length !== 6) {
  failures += 1;
  console.error('FAIL: expected exactly 6 framework sections.');
}

if ((frameworkHtml.match(/class="framework-arrow framework-transition"/g) || []).length !== 3) {
  failures += 1;
  console.error('FAIL: expected exactly 3 framework arrows between stage groups.');
}

const sectionBlocks = [...frameworkHtml.matchAll(/<section id="([a-z-]+)" class="framework-section framework-card insight-card">([\s\S]*?)<\/section>/g)];
if (sectionBlocks.length !== 6) {
  failures += 1;
  console.error('FAIL: unable to parse all framework section blocks for contract checks.');
}

for (const [, id, block] of sectionBlocks) {
  if (/framework-arrow/.test(block)) {
    failures += 1;
    console.error(`FAIL: framework-arrow must not be nested inside section #${id}.`);
  }

  if (!new RegExp(`<h2 class="stage-label">${id.charAt(0).toUpperCase()}${id.slice(1)}<\/h2>`).test(block)) {
    failures += 1;
    console.error(`FAIL: section #${id} must use stage name as <h2>.`);
  }

  if (!block.includes(`<h3 class="stage-title">${expectedTitles[id]}</h3>`)) {
    failures += 1;
    console.error(`FAIL: section #${id} is missing required <h3> title copy.`);
  }

  const listItems = (block.match(/<li>/g) || []).length;
  if (listItems !== 5) {
    failures += 1;
    console.error(`FAIL: section #${id} must contain exactly 5 bullets, found ${listItems}.`);
  }
}

if (!/<h1>The AI-Enabled Operations Framework<\/h1>/.test(frameworkHtml)) {
  failures += 1;
  console.error('FAIL: framework page must keep exact H1.');
}

if (!/<h2 class="framework-subtitle">Insights and Briefs on Productizing Operations for Modern AI-Enabled Work<\/h2>/.test(frameworkHtml)) {
  failures += 1;
  console.error('FAIL: framework subtitle must be an H2 with exact copy.');
}

if (!/href="\/services\/"/.test(frameworkHtml) || !/THE EXECUTION LAYER/.test(frameworkHtml) || !/Transition to Services →/.test(frameworkHtml)) {
  failures += 1;
  console.error('FAIL: bottom transition must point to /services/ with updated execution-layer copy.');
}

if (!/\.framework-progress-line\s*\{[^}]*height:\s*3px;[^}]*opacity:\s*0\.35;/s.test(frameworkCss)) {
  failures += 1;
  console.error('FAIL: framework progress line must be 3px with 0.35 opacity.');
}

if (!/\.framework-progress-markers span\s*\{[^}]*width:\s*10px;[^}]*height:\s*10px;/s.test(frameworkCss)) {
  failures += 1;
  console.error('FAIL: framework progress markers must be 10px circles.');
}

if (!/\.framework-header\s*\{[^}]*align-items:\s*center;[^}]*gap:\s*12px;/s.test(frameworkCss)) {
  failures += 1;
  console.error('FAIL: framework header alignment must be centered with 12px gap.');
}

if (!/\.framework-icon\s*\{[^}]*width:\s*(3[6-9]|40)px;[^}]*height:\s*(3[6-9]|40)px;/s.test(frameworkCss)) {
  failures += 1;
  console.error('FAIL: framework icons must render between 36px and 40px.');
}

if (!/\.framework-icon\s*\{[^}]*position:\s*relative;[^}]*top:\s*-8px;/s.test(frameworkCss)) {
  failures += 1;
  console.error('FAIL: framework icons must include baseline optical vertical offset (top: -8px).');
}

if (!/#integration\s+\.framework-icon\s*\{[^}]*top:\s*-10px;/s.test(frameworkCss)) {
  failures += 1;
  console.error('FAIL: integration icon must include stage-specific vertical offset (top: -10px).');
}

if (!/#execution\s+\.framework-icon\s*\{[^}]*top:\s*-12px;/s.test(frameworkCss)) {
  failures += 1;
  console.error('FAIL: execution icon must include stage-specific vertical offset (top: -12px).');
}

if (!/\.framework-pill\s*\{[^}]*margin-bottom:\s*8px;[^}]*font-weight:\s*600;[^}]*letter-spacing:\s*0\.04em;/s.test(frameworkCss)) {
  failures += 1;
  console.error('FAIL: framework pill refinement (spacing + weight + tracking) is missing.');
}

if (!/\.framework-section\s*\{[^}]*padding:\s*32px;[^}]*border-radius:\s*12px;[^}]*box-shadow:\s*0 6px 18px rgba\(0, 0, 0, 0\.04\);/s.test(frameworkCss)) {
  failures += 1;
  console.error('FAIL: framework card padding/radius/shadow refinement is missing.');
}

if (!/\.card-body\s*\{[^}]*max-width:\s*760px;/s.test(frameworkCss)) {
  failures += 1;
  console.error('FAIL: framework card body max-width must be 760px.');
}

if (!/\.framework-transition\s*\{[^}]*margin:\s*28px 0;[^}]*display:\s*flex;[^}]*justify-content:\s*center;/s.test(frameworkCss)) {
  failures += 1;
  console.error('FAIL: framework transition spacing contract is missing.');
}

if (!/\.framework-rail\s*\{[^}]*width:\s*2px;[^}]*background:\s*rgba\(80,\s*110,\s*255,\s*0\.15\);/s.test(frameworkCss)) {
  failures += 1;
  console.error('FAIL: framework vertical rail contract is missing.');
}

if (!/\.framework-section h3\s*\{[^}]*margin-top:\s*6px;[^}]*margin-bottom:\s*14px;/s.test(frameworkCss)) {
  failures += 1;
  console.error('FAIL: framework section h3 spacing contract is missing.');
}

if (!/\.framework-main \.executive-callout\s*\{[^}]*background:\s*#f6f8ff;[^}]*border-left:\s*3px solid #3b6cff;[^}]*padding:\s*20px;/s.test(frameworkCss)) {
  failures += 1;
  console.error('FAIL: framework intro box refinement is missing.');
}

if (!/\.framework-section\s*\{[^}]*border:\s*1px solid #e5e7eb;[^}]*background:\s*#ffffff;/s.test(frameworkCss)) {
  failures += 1;
  console.error('FAIL: framework card polish contract (white card + #e5e7eb border) is missing.');
}

if (!/\.framework-section:hover\s*\{[^}]*translateY\(-2px\);[^}]*box-shadow:\s*0 6px 18px rgba\(0, 0, 0, 0\.04\);/s.test(frameworkCss)) {
  failures += 1;
  console.error('FAIL: framework hover polish contract is missing.');
}

if (!/\.framework-arrow svg\s*\{[^}]*stroke:\s*#3b6cff;[^}]*stroke-width:\s*2;[^}]*opacity:\s*0\.75;/s.test(frameworkCss)) {
  failures += 1;
  console.error('FAIL: framework arrow style must use refined chevron stroke settings.');
}

const iconFiles = [
  'opportunity-network',
  'design-blueprint',
  'integration-merger',
  'execution-workflow',
  'signals-telemetry',
  'evolution-feedback'
];
for (const iconName of iconFiles) {
  const iconPath = path.join(root, 'assets', 'icons', 'framework', `${iconName}.png`);
  if (!fs.existsSync(iconPath)) {
    failures += 1;
    console.error(`FAIL: ${iconName}.png is missing from assets/icons/framework.`);
  }
}

if (failures > 0) {
  process.exit(1);
}

console.log('PASS: framework refinement contracts passed.');
