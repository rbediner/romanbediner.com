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
    next: '/framework/signals/operational-signals/'
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

if (!frameworkHtml.includes('<h2 class="framework-subtitle">A Six-Stage Model for Productizing Operations in Modern AI-Enabled Work</h2>')) {
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

const sectionBlocks = [...frameworkHtml.matchAll(/<section id="([a-z-]+)" data-stage="([a-z-]+)" class="framework-section framework-card insight-card">([\s\S]*?)<\/section>/g)];
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

if (/class="framework-stage-nav"/.test(frameworkHtml)) {
  failures += 1;
  console.error('FAIL: duplicate stage row above framework diagram must be removed from hub.');
}

if (!/class="framework-progress framework-diagram"/.test(frameworkHtml)) {
  failures += 1;
  console.error('FAIL: framework hub must use diagram navigation wrapper.');
}

if (!/href="#opportunity"/.test(frameworkHtml) || !/href="#evolution"/.test(frameworkHtml)) {
  failures += 1;
  console.error('FAIL: framework diagram pills must link to matching in-page anchors.');
}

if (!frameworkHtml.includes('<script src="/scripts/runtime/framework-stage-nav.js"></script>')) {
  failures += 1;
  console.error('FAIL: framework hub must include runtime script for sticky diagram stage tracking.');
}

for (const [idx, [, id, dataStage, block]] of sectionBlocks.entries()) {
  const expected = stages[idx];
  if (id !== expected.id) {
    failures += 1;
    console.error(`FAIL: framework section order mismatch at index ${idx}.`);
    continue;
  }
  if (dataStage !== expected.id) {
    failures += 1;
    console.error(`FAIL: framework section #${id} must expose matching data-stage.`);
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

  if (stage.id === 'opportunity' || stage.id === 'design' || stage.id === 'integration' || stage.id === 'execution' || stage.id === 'signals' || stage.id === 'evolution') {
    if (!briefHtml.includes('class="framework-brief-article"')) {
      failures += 1;
      console.error(`FAIL: ${stage.brief} must render the long-form brief article.`);
    }
    const expectedInsetHeading = stage.id === 'opportunity'
      ? '<h2>What starts to break first</h2>'
      : stage.id === 'design'
        ? '<h2>What operational design makes explicit</h2>'
        : stage.id === 'integration'
          ? '<h2>Integration Maturity</h2>'
          : stage.id === 'signals'
          ? '<h2>Operational signals worth watching</h2>'
          : stage.id === 'evolution'
            ? '<h2>What adaptive guardrails should define</h2>'
            : '<h2>Lane Anatomy <span style="white-space:nowrap">(Structured View)</span></h2>';
    if (!briefHtml.includes(expectedInsetHeading)) {
      failures += 1;
      console.error(`FAIL: ${stage.brief} missing required inset list heading.`);
    }
    const expectedInsetClass = stage.id === 'integration'
      ? 'class="brief-section integration-maturity"'
      : 'class="brief-section brief-inset-list-section"';
    if (!briefHtml.includes(expectedInsetClass)) {
      failures += 1;
      console.error(`FAIL: ${stage.brief} missing inset list section treatment.`);
    }
    if (!briefHtml.includes('class="service-list"')) {
      failures += 1;
      console.error(`FAIL: ${stage.brief} inset list must use orb bullet styling.`);
    }
    if (briefHtml.includes('Brief in Development') || briefHtml.includes('Content coming soon.')) {
      failures += 1;
      console.error(`FAIL: ${stage.brief} should not include legacy placeholder copy.`);
    }
  }

  if (!briefHtml.includes('class="framework-progress framework-diagram"')) {
    failures += 1;
    console.error(`FAIL: ${stage.brief} missing framework diagram navigator.`);
  }

  if (!new RegExp(`<span class="badge-phase framework-diagram-pill current-stage stage-${stage.id}">${stage.label}<\/span>`).test(briefHtml)) {
    failures += 1;
    console.error(`FAIL: ${stage.brief} must highlight the current stage with a non-clickable pill.`);
  }

  if (/class="[^"]*current-stage[^"]*" href=/.test(briefHtml)) {
    failures += 1;
    console.error(`FAIL: ${stage.brief} current stage must not be clickable.`);
  }

  if ((briefHtml.match(/class="framework-progress-marker"/g) || []).length !== 6) {
    failures += 1;
    console.error(`FAIL: ${stage.brief} framework diagram must render exactly 6 stage markers.`);
  }

  if (!briefHtml.includes(`href="${stage.next}"`)) {
    failures += 1;
    console.error(`FAIL: ${stage.brief} next-stage navigation target mismatch.`);
  }

  if (!briefHtml.includes('<meta name="ga4-measurement-id" content="G-DVHD0KL633" />') || !briefHtml.includes('<script src="/scripts/runtime/ga4-bootstrap.js" defer></script>')) {
    failures += 1;
    console.error(`FAIL: ${stage.brief} missing required GA4 meta/bootstrap tags.`);
  }

  const metadataChecks = [
    /<title>[^<]+<\/title>/,
    /<meta name="description" content="[^"]+" \/>/,
    /<link rel="canonical" href="https:\/\/romanbediner\.com\/framework\/[^"]+" \/>/,
    /<meta property="og:title" content="[^"]+" \/>/,
    /<meta property="og:description" content="[^"]+" \/>/,
    /<meta property="og:type" content="article" \/>/,
    /<meta property="og:url" content="https:\/\/romanbediner\.com\/framework\/[^"]+" \/>/,
    /<meta property="og:image" content="https:\/\/romanbediner\.com\/assets\/og\/framework-preview\.png" \/>/,
    /<meta name="twitter:card" content="summary_large_image" \/>/,
    /<meta name="twitter:title" content="[^"]+" \/>/,
    /<meta name="twitter:description" content="[^"]+" \/>/,
    /<meta name="twitter:image" content="https:\/\/romanbediner\.com\/assets\/og\/framework-preview\.png" \/>/
  ];
  for (const check of metadataChecks) {
    if (!check.test(briefHtml)) {
      failures += 1;
      console.error(`FAIL: ${stage.brief} metadata contract missing required tag (${check}).`);
      break;
    }
  }
}

if (!/\.framework-diagram\s*\{[^}]*position:\s*sticky;[^}]*top:\s*90px;[^}]*z-index:\s*50;/s.test(frameworkCss)) {
  failures += 1;
  console.error('FAIL: framework diagram must remain sticky below header.');
}

if (!/html\s*\{[^}]*scroll-behavior:\s*smooth;/s.test(frameworkCss)) {
  failures += 1;
  console.error('FAIL: framework route must enforce smooth anchor scrolling.');
}

if (!/\.framework-card\s*\{[^}]*scroll-margin-top:\s*160px;/s.test(frameworkCss)) {
  failures += 1;
  console.error('FAIL: framework cards must reserve sticky-diagram anchor offset.');
}

if (!/\.framework-progress-line\s*\{[^}]*background:\s*#c6cdd8;/s.test(frameworkCss)) {
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

if (!/\.framework-brief-main\s*>\s*\.framework-pill\s*\{[^}]*border:\s*2px\s+solid\s+currentColor;[^}]*background:\s*transparent;[^}]*cursor:\s*default;[^}]*pointer-events:\s*none;/s.test(frameworkCss)) {
  failures += 1;
  console.error('FAIL: framework header stage pills must be outlined, non-interactive markers.');
}

if (!/\.brief-sticky-stage\s*\{[^}]*border:\s*2px\s+solid\s+currentColor;[^}]*background:\s*transparent;/s.test(frameworkCss)) {
  failures += 1;
  console.error('FAIL: spine stage pills must remain outlined markers.');
}

if (!/\.framework-arrow svg\s*\{[^}]*stroke:\s*#8792a1;[^}]*stroke-width:\s*2\.2;/s.test(frameworkCss)) {
  failures += 1;
  console.error('FAIL: inter-card flow arrows must use neutral styling.');
}

if (!/\.framework-progress-marker\.is-active\s+\.framework-progress-dot\s*\{[^}]*scale\(1\.25\);/s.test(frameworkCss)) {
  failures += 1;
  console.error('FAIL: active stage tracking style hook is missing.');
}

if (!/\.framework-progress-link:hover\s*\{[^}]*filter:\s*brightness\(0\.96\);/s.test(frameworkCss)) {
  failures += 1;
  console.error('FAIL: framework diagram hover tint contract is missing.');
}

if (!/\.framework-brief-band\s*\{[^}]*display:\s*flex;[^}]*justify-content:\s*space-between;/s.test(frameworkCss)) {
  failures += 1;
  console.error('FAIL: framework brief footer band style contract is missing.');
}

if (!/\.framework-brief-band:hover\s*\{[^}]*color:\s*#2563eb;[^}]*background:\s*#eef4ff;/s.test(frameworkCss)) {
  failures += 1;
  console.error('FAIL: framework brief footer hover tint contract is missing.');
}

if (!/\.framework-brief-band:hover\s+\.framework-brief-arrow\s*\{[^}]*translateX\(4px\);/s.test(frameworkCss)) {
  failures += 1;
  console.error('FAIL: framework brief footer hover arrow shift is missing.');
}

if (!/\.framework-section:hover\s*\{[^}]*translateY\(-2px\);/s.test(frameworkCss)) {
  failures += 1;
  console.error('FAIL: framework card hover lift contract is missing.');
}

if (failures > 0) {
  process.exit(1);
}

console.log('PASS: framework hub + brief page contracts passed.');
