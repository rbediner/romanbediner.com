#!/usr/bin/env node
/**
 * Invariant:
 * - Framework hub and stage brief pages retain fixed architecture and navigation contracts.
 * Why this exists:
 * - Prevents drift in framework card linking, stage flow, and brief placeholder scaffolding.
 * What breaks if it fails:
 * - CI blocks deployment when framework IA or brief routing regresses.
 */
const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..', '..');
const frameworkHtml = fs.readFileSync(path.join(root, 'framework/index.html'), 'utf8');
const frameworkCss = fs.readFileSync(path.join(root, 'styles/framework.css'), 'utf8');

let failures = 0;

const stages = [
  {
    id: 'opportunity',
    label: 'Opportunity',
    title: 'Productizing Operations for Modern AI-Enabled Work',
    brief: '/framework/opportunity/productizing-operations/',
    next: '/framework/design/operations-as-product/'
  },
  {
    id: 'design',
    label: 'Design',
    title: 'Operations as a Product for Scalable Execution',
    brief: '/framework/design/operations-as-product/',
    next: '/framework/integration/ai-operating-layer/'
  },
  {
    id: 'integration',
    label: 'Integration',
    title: 'Integrating AI as an Operating Layer',
    brief: '/framework/integration/ai-operating-layer/',
    next: '/framework/execution/operational-lanes/'
  },
  {
    id: 'execution',
    label: 'Execution',
    title: 'Operational Lanes for Scalable Execution',
    brief: '/framework/execution/operational-lanes/',
    next: '/framework/signals/operational-signals/'
  },
  {
    id: 'signals',
    label: 'Signals',
    title: 'Steering Execution with Operational Signals',
    brief: '/framework/signals/operational-signals/',
    next: '/framework/evolution/agentic-guardrails/'
  },
  {
    id: 'evolution',
    label: 'Evolution',
    title: 'Designing Adaptive Guardrails for Agentic Work',
    brief: '/framework/evolution/agentic-guardrails/',
    next: '/framework/opportunity/productizing-operations/'
  }
];

if (!frameworkHtml.includes('<p class="framework-label">FRAMEWORK</p>')) {
  failures += 1;
  console.error('FAIL: framework label must render above H1.');
}

if (!frameworkHtml.includes('<h1>The AI-Enabled Operations Framework</h1>')) {
  failures += 1;
  console.error('FAIL: framework page must keep exact H1.');
}

if (!frameworkHtml.includes('<h2 class="framework-subtitle">Insights and Briefs on Productizing Operations for Modern AI-Enabled Work</h2>')) {
  failures += 1;
  console.error('FAIL: framework subtitle must match required copy.');
}

if (!/class="executive-callout framework-intro-block framework-thesis-block"/.test(frameworkHtml)) {
  failures += 1;
  console.error('FAIL: framework thesis block wrapper is missing.');
}

if (!/Modern organizations rarely struggle with strategy\./.test(frameworkHtml) || !/They stall when execution fragments across teams, tools, and decision layers\./.test(frameworkHtml)) {
  failures += 1;
  console.error('FAIL: framework thesis narrative lines are missing.');
}

if (!/<ul class="service-list">\s*<li>Design operations as a system<\/li>\s*<li>Integrate AI directly into execution<\/li>\s*<li>Evolve operating models as automation expands<\/li>/s.test(frameworkHtml)) {
  failures += 1;
  console.error('FAIL: framework thesis must use orb service-list bullets with exact three statements.');
}

const sectionBlocks = [...frameworkHtml.matchAll(/<section id="([a-z-]+)" class="framework-section framework-card insight-card">([\s\S]*?)<\/section>/g)];
if (sectionBlocks.length !== 6) {
  failures += 1;
  console.error('FAIL: expected exactly 6 framework sections.');
}

if ((frameworkHtml.match(/class="framework-arrow framework-transition"/g) || []).length !== 5) {
  failures += 1;
  console.error('FAIL: expected exactly 5 centered vertical flow arrows between cards.');
}

if (/class="stage-label"/.test(frameworkHtml)) {
  failures += 1;
  console.error('FAIL: duplicate stage-label headings must be removed from cards.');
}

for (const [idx, [, id, block]] of sectionBlocks.entries()) {
  const expected = stages[idx];
  if (id !== expected.id) {
    failures += 1;
    console.error(`FAIL: framework section order mismatch at index ${idx}.`);
    continue;
  }

  if (!new RegExp(`<span class="framework-pill stage-pill badge-phase stage-${expected.id}">${expected.label}<\/span>`).test(block)) {
    failures += 1;
    console.error(`FAIL: section #${id} missing stage-colored pill label.`);
  }

  if (!new RegExp(`<h3 class="stage-title"><a class="framework-title-link" href="${expected.brief}">${expected.title}<\/a><\/h3>`).test(block)) {
    failures += 1;
    console.error(`FAIL: section #${id} title link must target its brief page.`);
  }

  if (!new RegExp(`<a class="framework-brief-band" href="${expected.brief}"`).test(block)) {
    failures += 1;
    console.error(`FAIL: section #${id} footer band must link to its brief page.`);
  }

  const listItems = (block.match(/<li>/g) || []).length;
  if (listItems !== 5) {
    failures += 1;
    console.error(`FAIL: section #${id} must keep exactly 5 bullets (found ${listItems}).`);
  }

  if (!/class="service-list"/.test(block)) {
    failures += 1;
    console.error(`FAIL: section #${id} must use service-list orb bullets.`);
  }

  if (/framework-arrow/.test(block)) {
    failures += 1;
    console.error(`FAIL: flow arrows must not be nested inside section #${id}.`);
  }
}

for (const stage of stages) {
  const briefFile = path.join(root, stage.brief.replace(/^\//, ''), 'index.html');
  if (!fs.existsSync(briefFile)) {
    failures += 1;
    console.error(`FAIL: missing brief page ${stage.brief}`);
    continue;
  }

  const briefHtml = fs.readFileSync(briefFile, 'utf8');
  if (!briefHtml.includes('<p class="framework-label">FRAMEWORK</p>')) {
    failures += 1;
    console.error(`FAIL: ${stage.brief} missing framework label.`);
  }

  if (!new RegExp(`<span class="framework-pill stage-pill badge-phase stage-${stage.id}">${stage.label}<\/span>`).test(briefHtml)) {
    failures += 1;
    console.error(`FAIL: ${stage.brief} missing stage pill with stage color class.`);
  }

  if (!briefHtml.includes(`<h1>${stage.title}</h1>`)) {
    failures += 1;
    console.error(`FAIL: ${stage.brief} missing expected brief title.`);
  }

  if (!briefHtml.includes('class="brief-placeholder-panel"')) {
    failures += 1;
    console.error(`FAIL: ${stage.brief} missing placeholder panel.`);
  }

  if (!briefHtml.includes('Brief in Development') || !briefHtml.includes('Content coming soon.')) {
    failures += 1;
    console.error(`FAIL: ${stage.brief} placeholder text contract is missing.`);
  }

  if (!briefHtml.includes('class="framework-stage-nav"')) {
    failures += 1;
    console.error(`FAIL: ${stage.brief} missing framework stage navigator.`);
  }

  if (!briefHtml.includes('class="badge-phase current-stage"')) {
    failures += 1;
    console.error(`FAIL: ${stage.brief} must highlight the current stage in navigator.`);
  }

  if (!briefHtml.includes(`href="${stage.next}"`)) {
    failures += 1;
    console.error(`FAIL: ${stage.brief} next-stage navigation target mismatch.`);
  }

  if (!briefHtml.includes('<meta name="ga4-measurement-id" content="G-DVHD0KL633" />') || !briefHtml.includes('<script src="/scripts/runtime/ga4-bootstrap.js" defer></script>')) {
    failures += 1;
    console.error(`FAIL: ${stage.brief} missing required GA4 meta/bootstrap tags.`);
  }
}

if (!/\.framework-progress-line\s*\{[^}]*background:\s*#d1d5db;/s.test(frameworkCss)) {
  failures += 1;
  console.error('FAIL: framework diagram connector line must remain neutral gray.');
}

if (!/\.framework-progress-dot\s*\{[^}]*width:\s*10px;[^}]*height:\s*10px;/s.test(frameworkCss)) {
  failures += 1;
  console.error('FAIL: framework node dots must render as 10px circles.');
}

if (!/\.framework-pill\s*\{[^}]*text-transform:\s*uppercase;/s.test(frameworkCss)) {
  failures += 1;
  console.error('FAIL: stage pill style contract is missing.');
}

if (!/\.framework-arrow svg\s*\{[^}]*stroke:\s*var\(--flow-neutral\);/s.test(frameworkCss)) {
  failures += 1;
  console.error('FAIL: inter-card flow arrows must use neutral styling.');
}

if (!/\.framework-brief-band\s*\{[^}]*display:\s*flex;[^}]*justify-content:\s*space-between;/s.test(frameworkCss)) {
  failures += 1;
  console.error('FAIL: framework brief footer band style contract is missing.');
}

if (!/\.framework-section:hover\s*\{[^}]*translateY\(-2px\);/s.test(frameworkCss)) {
  failures += 1;
  console.error('FAIL: framework card hover lift contract is missing.');
}

if (!/\.framework-section:hover\s+\.framework-brief-arrow\s*\{[^}]*translateX\(4px\);/s.test(frameworkCss)) {
  failures += 1;
  console.error('FAIL: brief-band arrow hover shift is missing.');
}

if (failures > 0) {
  process.exit(1);
}

console.log('PASS: framework hub + brief page contracts passed.');
