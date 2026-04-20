#!/usr/bin/env node
/**
 * Invariant:
 * - Website V2 Phase 1 resource routes must ship with the expected route,
 *   locked copy, CTA, analytics-attribute, and asset contracts.
 *
 * Why this exists:
 * - Prevents partial launches where nav changes land without the summary page,
 *   PDF asset, slide preview system, or locked PRD copy.
 * - Protects PRD-locked strings (sections 15.18 P1-RH-01..04, P1-FS-01..03,
 *   P1-FW-01) from accidental rewrites during visual polish.
 * - Protects the PRD-locked GA4 contract (P3-AD-01) data attributes so
 *   analytics cannot silently lose required parameters.
 *
 * What breaks if it fails:
 * - CI blocks deployment to prevent incomplete resource rollouts.
 */
const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..', '..');
const resourcesHtml = fs.readFileSync(path.join(root, 'resources', 'index.html'), 'utf8');
const summaryHtml = fs.readFileSync(
  path.join(root, 'resources', 'ai-enabled-operations-framework-summary', 'index.html'),
  'utf8'
);
const frameworkHtml = fs.readFileSync(path.join(root, 'framework', 'index.html'), 'utf8');
const carouselJs = fs.readFileSync(path.join(root, 'scripts', 'runtime', 'resources-carousel.js'), 'utf8');
const analyticsJs = fs.readFileSync(path.join(root, 'scripts', 'runtime', 'resources-analytics.js'), 'utf8');

const requiredFiles = [
  'assets/resources/framework-summary/ai-enabled-operations-framework-summary.pdf',
  'assets/resources/framework-summary/slides/slide-01.png',
  'assets/resources/framework-summary/slides/slide-08.png',
  'styles/resources.css',
  'scripts/runtime/resources-carousel.js',
  'scripts/runtime/resources-analytics.js'
];

let failures = 0;
function fail(msg) {
  failures += 1;
  console.error('FAIL: ' + msg);
}
function mustInclude(label, haystack, needle) {
  if (!haystack.includes(needle)) {
    fail(`${label} missing: ${JSON.stringify(needle)}`);
  }
}

for (const rel of requiredFiles) {
  if (!fs.existsSync(path.join(root, rel))) {
    fail(`missing required asset ${rel}`);
  }
}

// Route linkage preserved
mustInclude('resources hub', resourcesHtml, 'href="/resources/ai-enabled-operations-framework-summary/"');
mustInclude('summary page', summaryHtml, 'href="/framework/"');
mustInclude('summary page', summaryHtml, 'href="/connect/"');

// PRD-locked copy: P1-RH-01 (Resources hub intro — two sentences, verbatim)
mustInclude('P1-RH-01 locked intro', resourcesHtml,
  'Selected resources that make the operating model tangible. These materials provide a faster way to review the framework, its practical application, and the tools being developed around it.'
);
mustInclude('P1-RH-01 family shelf callout', resourcesHtml, 'class="shelf-callout resource-family-callout"');
mustInclude('P1-RH-01 vertical blue rule', resourcesHtml, 'class="shelf-border"');

// PRD-locked copy: P1-RH-03 (Dashboard placeholder — title + full body)
mustInclude('P1-RH-03 locked title', resourcesHtml, 'AI-Enabled Operations Dashboard');
mustInclude('P1-RH-03 locked body', resourcesHtml,
  'An interactive dashboard concept for AI-enabled operating visibility, structured execution, and leadership review. Designed as a free, shareable prototype, it offers a practical starting point for teams that want a clearer at-a-glance view of the business and a flexible artifact they can adapt to their own context.'
);

// PRD-locked copy: P1-RH-04 (hub forward nav)
mustInclude('P1-RH-04 locked CTA', resourcesHtml, 'Explore the Full Framework');
mustInclude('P1-RH-04 forward nav wrapper', resourcesHtml, 'class="next-page-nav resources-forward-nav"');
mustInclude('P1-RH-04 nav anchor to framework', resourcesHtml, 'href="/framework/" class="nav-anchor"');
mustInclude('P1-RH-04 divider above nav', resourcesHtml, 'class="page-nav-divider"');
mustInclude('P1-RH-04 no duplicate nav divider marker', resourcesHtml, '<section class="next-page-nav resources-forward-nav">\n      <div class="page-nav-divider" aria-hidden="true"></div>');

// PRD-locked copy: P1-FS-01 (conversational paragraph)
mustInclude('P1-FS-01 locked conversational paragraph', summaryHtml,
  'If this sounds relevant to what you are building, scaling, or trying to untangle, feel free to reach out. I am always glad to connect with thoughtful operators, leaders, and teams to exchange ideas, talk through challenges, and explore how this kind of framework can be applied in a real operating environment.'
);
mustInclude('P1-FS-01 family shelf callout', summaryHtml, 'class="shelf-callout resource-family-callout resource-summary-callout"');
mustInclude('P1-FS-01 vertical blue rule', summaryHtml, 'class="shelf-border"');
mustInclude('P1-FS-01 restrained audience card', summaryHtml, 'class="resource-blue-box resource-audience-card resource-audience-card-standalone"');
mustInclude('P1-FS-01 closing conversation card', summaryHtml, 'class="resource-conversation-card"');

const audienceIdx = summaryHtml.indexOf('id="summary-audience"');
const overviewIdx = summaryHtml.indexOf('id="summary-overview"');
const carouselIdx = summaryHtml.indexOf('data-resource-carousel');
const conversationIdx = summaryHtml.indexOf('resource-conversation-copy');

if (!(audienceIdx !== -1 && overviewIdx !== -1 && audienceIdx < overviewIdx)) {
  fail('P1-FS-01 audience card must appear before the In This Summary section.');
}

if (!(carouselIdx !== -1 && conversationIdx !== -1 && carouselIdx < conversationIdx)) {
  fail('P1-FS-01 conversational paragraph must appear below the slide preview area.');
}

// PRD-locked copy: P1-FS-03 (download CTA + helper line + secondary text CTA)
mustInclude('P1-FS-03 download CTA label', summaryHtml, 'Download Framework Summary PDF');
mustInclude('P1-FS-03 utility line', summaryHtml, 'Six slides. Fast review. Easy to share.');
mustInclude('P1-FS-03 secondary text CTA', summaryHtml, 'Explore the Full Framework');
mustInclude('P1-FS-03 stronger companion CTA class', summaryHtml, 'class="resource-companion-cta" href="/framework/"');
mustInclude('P1-FS-03 site-family nav wrapper', summaryHtml, 'class="resource-page-nav"');
mustInclude('P1-FS-03 nav back to resources hub', summaryHtml, 'Back to Resources Hub');
mustInclude('P1-FS-03 nav forward to connect', summaryHtml, 'href="/connect/" class="nav-anchor"');
mustInclude('P1-FS-03 divider above bottom nav', summaryHtml, 'class="page-nav-divider"');
mustInclude('P1-FS-03 compact mobile toolbar hook', summaryHtml, 'class="resource-carousel-toolbar"');

// PRD-locked copy: P1-FW-01 (framework bottom CTA)
mustInclude('P1-FW-01 locked framework CTA', frameworkHtml, 'Explore the Framework Summary at a Glance');
mustInclude('P1-FW-01 inset companion panel', frameworkHtml, 'class="framework-summary-cta framework-summary-cta-inset resource-companion-panel"');
mustInclude('P1-FW-01 button-like CTA treatment', frameworkHtml, 'class="resource-companion-cta resource-companion-cta-framework"');
mustInclude('P1-FW-01 no duplicate nav divider marker', frameworkHtml, '<section class="next-page-nav">\n      <div class="page-nav-divider" aria-hidden="true"></div>');

// Carousel contract
mustInclude('carousel shell', summaryHtml, 'data-resource-carousel');
mustInclude('expand preview button', summaryHtml, 'data-carousel-expand');

const slideMatches = summaryHtml.match(/assets\/resources\/framework-summary\/slides\/slide-\d{2}\.png/g) || [];
if (slideMatches.length !== 8) {
  fail('framework summary page must reference exactly 8 slide preview images.');
}

// P3-AD-01 analytics data-attribute contract on DOM
const requiredCardAttrs = [
  'data-resource-slug="ai-enabled-operations-framework-summary"',
  'data-resource-title="AI-Enabled Operations Framework Summary"',
  'data-resource-type="pdf_summary"',
  'data-resource-location="resources_hub"'
];
requiredCardAttrs.forEach((attr) => mustInclude('P3-AD-01 hub framework-summary card attr', resourcesHtml, attr));

const requiredSummaryAttrs = [
  'data-resource-slug="ai-enabled-operations-framework-summary"',
  'data-resource-title="AI-Enabled Operations Framework Summary"',
  'data-resource-type="pdf_summary"',
  'data-resource-location="summary_page"'
];
requiredSummaryAttrs.forEach((attr) => mustInclude('P3-AD-01 summary page attr', summaryHtml, attr));

mustInclude('P3-AD-01 dashboard slug attr', resourcesHtml, 'data-resource-slug="ai-enabled-operations-dashboard"');
mustInclude('P3-AD-01 dashboard type attr', resourcesHtml, 'data-resource-type="dashboard_prototype"');

mustInclude('P3-AD-01 pdf download data attr', summaryHtml, 'data-track-pdf-download');
mustInclude('P3-AD-01 pdf file_path data attr', summaryHtml, 'data-file-path="/assets/resources/framework-summary/ai-enabled-operations-framework-summary.pdf"');

// P3-AD-01 analytics event + required parameter contract in runtime JS
mustInclude('analytics: resource_card_click event', analyticsJs, "trackEvent('resource_card_click'");
mustInclude('analytics: resource_pdf_download event', analyticsJs, "trackEvent('resource_pdf_download'");
mustInclude('analytics: file_path param', analyticsJs, 'file_path');
mustInclude('analytics: resource_slug param', analyticsJs, 'resource_slug');
mustInclude('analytics: resource_title param', analyticsJs, 'resource_title');
mustInclude('analytics: resource_type param', analyticsJs, 'resource_type');
mustInclude('analytics: resource_location param', analyticsJs, 'resource_location');

mustInclude('carousel: resource_preview_expand event', carouselJs, "trackEvent('resource_preview_expand'");
mustInclude('carousel: slide_index param', carouselJs, 'slide_index');
mustInclude('carousel: resource_slug param', carouselJs, 'resource_slug');

// P1-FS-02 / P3-UX-01: Modal behavioral contract (source-level checks)
const modalChecks = [
  ['role dialog', "setAttribute('role', 'dialog')"],
  ['aria-modal', "setAttribute('aria-modal', 'true')"],
  ['Escape key handler', "'Escape'"],
  ['ArrowLeft handler', "'ArrowLeft'"],
  ['ArrowRight handler', "'ArrowRight'"],
  ['focus trap via Tab', "'Tab'"],
  ['outside click closes', 'e.target === modal'],
  ['focus return on close', 'lastFocusedTrigger'],
  ['visible close button aria', 'Close slide preview'],
  ['modal prev/next controls', 'resource-preview-modal-nav']
];
modalChecks.forEach(([label, needle]) => mustInclude(`modal contract: ${label}`, carouselJs, needle));

if (failures > 0) {
  process.exit(1);
}

console.log('PASS: Website V2 Phase 1 resource route + locked-copy + analytics contracts.');
