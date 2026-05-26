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
const dashboardHtml = fs.readFileSync(
  path.join(root, 'resources', 'ai-enabled-operations-dashboard', 'index.html'),
  'utf8'
);
const pasteflowHtml = fs.readFileSync(
  path.join(root, 'resources', 'pasteflow', 'index.html'),
  'utf8'
);
const frameworkHtml = fs.readFileSync(path.join(root, 'framework', 'index.html'), 'utf8');
const resourcesCss = fs.readFileSync(path.join(root, 'styles', 'resources.css'), 'utf8');
const carouselJs = fs.readFileSync(path.join(root, 'scripts', 'runtime', 'resources-carousel.js'), 'utf8');
const analyticsJs = fs.readFileSync(path.join(root, 'scripts', 'runtime', 'resources-analytics.js'), 'utf8');

const requiredFiles = [
  'assets/resources/framework-summary/ai-enabled-operations-framework-summary.pdf',
  'assets/resources/framework-summary/slides/slide-01.png',
  'assets/resources/framework-summary/slides/slide-08.png',
  'assets/resources/ai-enabled-operations-dashboard/dashboard-home-mobile-preview.png',
  'assets/resources/pasteflow/pasteflow-cws-01-hero.png',
  'assets/resources/pasteflow/pasteflow-cws-02-control.png',
  'assets/resources/pasteflow/pasteflow-cws-03-multilingual.png',
  'assets/resources/pasteflow/pasteflow-cws-04-compatibility.png',
  'assets/resources/pasteflow/pasteflow-cws-05-privacy.png',
  'assets/resources/pasteflow/pasteflow-cws-marquee-promo-tile.png',
  'assets/resources/pasteflow/pasteflow-cws-small-promo-tile.png',
  'assets/resources/pasteflow/pasteflow-cws-store-icon-128x128.png',
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
function mustNotInclude(label, haystack, needle) {
  if (haystack.includes(needle)) {
    fail(`${label} unexpectedly present: ${JSON.stringify(needle)}`);
  }
}

for (const rel of requiredFiles) {
  if (!fs.existsSync(path.join(root, rel))) {
    fail(`missing required asset ${rel}`);
  }
}

// Route linkage preserved
mustInclude('resources hub', resourcesHtml, 'href="/resources/ai-enabled-operations-framework-summary/"');
mustInclude('resources hub', resourcesHtml, 'href="/resources/pasteflow/"');
mustInclude('summary page', summaryHtml, 'href="/framework/"');
mustInclude('summary page', summaryHtml, 'href="/connect/"');

// PRD-locked copy: P1-RH-01 (Resources hub intro — two sentences, verbatim)
mustInclude('P1-RH-01 locked intro', resourcesHtml,
  'Selected resources that make the operating model tangible. These materials provide a faster way to review the framework, its practical application, and the tools being developed around it.'
);
mustInclude('P1-RH-01 family shelf callout', resourcesHtml, 'class="shelf-callout resource-family-callout"');
mustInclude('P1-RH-01 vertical blue rule', resourcesHtml, 'class="shelf-border"');

// PRD-locked copy: P1-RH-03 (Dashboard card — title + body + launched state)
mustInclude('P1-RH-03 locked title', resourcesHtml, 'AI-Enabled Operations Dashboard');
mustInclude('P1-RH-03 locked body', resourcesHtml,
  'An interactive, single-screen dashboard prototype for AI-enabled operating visibility, structured execution, and faster review in modern AI-enabled work.'
);
mustInclude('P1-RH-03 locked CTA button copy', resourcesHtml, '>Open the Dashboard<');
mustInclude('P1-RH-03 launched CTA link', resourcesHtml, 'href="/resources/ai-enabled-operations-dashboard/"');
mustInclude('P1-RH-03 launched badge', resourcesHtml, 'class="resource-meta">Available Now<');
mustInclude('P1-RH-03 card present', resourcesHtml, 'data-resource-card="dashboard"');
mustInclude('pasteflow card present', resourcesHtml, 'data-resource-card="pasteflow"');
mustInclude('pasteflow card title', resourcesHtml, '<h2>PasteFlow</h2>');
mustInclude('pasteflow card cta', resourcesHtml, '>Explore PasteFlow<');
mustInclude('pasteflow card copy', resourcesHtml, 'A Chrome extension that turns browser-based input friction into human-rhythm typing for web editors, forms, surveys, and AI-assisted work. Built as a practical proof point for productizing operations in modern AI-enabled workflows.');
mustNotInclude('pasteflow hub card copy should not say shipped', resourcesHtml, 'A shipped Chrome extension');

const frameworkCardPos = resourcesHtml.indexOf('data-resource-card="framework-summary"');
const dashboardCardPos = resourcesHtml.indexOf('data-resource-card="dashboard"');
const pasteflowCardPos = resourcesHtml.indexOf('data-resource-card="pasteflow"');
if (!(frameworkCardPos !== -1 && dashboardCardPos !== -1 && pasteflowCardPos !== -1 && frameworkCardPos < dashboardCardPos && dashboardCardPos < pasteflowCardPos)) {
  fail('PasteFlow hub card must appear after framework-summary and dashboard cards.');
}

if (resourcesHtml.includes('is-coming-soon')) {
  fail('P1-RH-03 dashboard card must not show Coming Soon once the dashboard resource page exists.');
}

if (resourcesHtml.includes('class="resource-primary-cta is-disabled"')) {
  fail('P1-RH-03 dashboard CTA must be a live link, not a disabled state, once the dashboard page is launched.');
}

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
mustInclude('P1-FS-03 conversational CTA label', summaryHtml, '>Reach out for a chat<');
mustInclude('P1-FS-03 conversational CTA target', summaryHtml, 'class="resource-primary-cta resource-conversation-cta" href="/connect/"');
mustInclude('P1-FS-03 divider above bottom nav', summaryHtml, 'class="page-nav-divider"');
mustInclude('P1-FS-03 compact mobile toolbar hook', summaryHtml, 'class="resource-carousel-toolbar"');

if (summaryHtml.includes('href="/connect/" class="nav-anchor"')) {
  fail('P1-FS-03 connect CTA must be in the conversational card, not bottom page navigation.');
}

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
mustInclude('analytics: resource_source_code_click event', analyticsJs, "trackEvent('resource_source_code_click'");
mustInclude('analytics: resource_external_cta_click event', analyticsJs, "trackEvent('resource_external_cta_click'");
mustInclude('analytics: file_path param', analyticsJs, 'file_path');
mustInclude('analytics: resource_slug param', analyticsJs, 'resource_slug');
mustInclude('analytics: resource_title param', analyticsJs, 'resource_title');
mustInclude('analytics: resource_type param', analyticsJs, 'resource_type');
mustInclude('analytics: resource_location param', analyticsJs, 'resource_location');
mustInclude('analytics: destination param', analyticsJs, 'destination');
mustInclude('analytics: cta_label param', analyticsJs, 'cta_label');
mustInclude('analytics: external_url_type param', analyticsJs, 'external_url_type');

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

// Dashboard resource page contract (Phase 2)
mustInclude('dashboard page: canonical URL', dashboardHtml, 'href="https://romanbediner.com/resources/ai-enabled-operations-dashboard/"');
mustInclude('dashboard page: H1', dashboardHtml, '<h1>AI-Enabled Operations Dashboard</h1>');
mustInclude('dashboard page: label', dashboardHtml, '>DASHBOARD<');
mustInclude('dashboard page: supporting subhead', dashboardHtml,
  'An interactive, single-screen dashboard prototype for AI-enabled operating visibility, structured execution, and faster review in modern AI-enabled work.'
);
mustInclude('dashboard page: blue callout', dashboardHtml,
  'Designed as a shareable operating artifact, this dashboard prototype brings demand, delivery, financial tension, customer pressure, and AI leverage into a single-screen view.'
);
mustInclude('dashboard page: What This Dashboard Helps Answer heading', dashboardHtml, '>What This Dashboard Helps Answer<');
mustInclude('dashboard page: questions grid class', dashboardHtml, 'resource-dashboard-questions-grid');
mustInclude('dashboard page: question card class', dashboardHtml, 'resource-dashboard-question-item');
mustInclude('dashboard page: demand question', dashboardHtml, 'Are we creating enough demand?');
mustInclude('dashboard page: AI question', dashboardHtml, 'Is AI creating real leverage?');
mustNotInclude('dashboard page: old question bullet class removed', dashboardHtml, 'service-list resource-dashboard-questions');
mustInclude('dashboard page: In This Dashboard heading', dashboardHtml, '>In This Dashboard<');
mustInclude('dashboard page: quadrants container', dashboardHtml, 'resource-dashboard-quadrants');
mustInclude('dashboard page: demand/commercial quadrant', dashboardHtml, 'Demand / Commercial');
mustInclude('dashboard page: core truth quadrant', dashboardHtml, 'Core Truth / Center Lens');
mustInclude('dashboard page: delivery quadrant', dashboardHtml, 'Delivery / Operations');
mustInclude('dashboard page: targets quadrant', dashboardHtml, 'Targets / Action Signals');
mustInclude('dashboard page: Core Dashboard Views heading', dashboardHtml, '>Core Dashboard Views<');
mustInclude('dashboard page: Margin view', dashboardHtml, '<strong>Margin</strong>');
mustInclude('dashboard page: Revenue view', dashboardHtml, '<strong>Revenue</strong>');
mustInclude('dashboard page: AI view', dashboardHtml, '<strong>AI</strong>');
mustInclude('dashboard page: principles row class', dashboardHtml, 'resource-dashboard-principles-row');
mustInclude('dashboard page: principles label', dashboardHtml, '>OPERATING PRINCIPLES<');
mustInclude('dashboard page: principles one screen', dashboardHtml, 'One Screen, One Story');
mustInclude('dashboard page: principles ai signal', dashboardHtml, 'AI as Operating Signal');
mustNotInclude('dashboard page: helper line removed', dashboardHtml, 'Source package and supporting artifacts below.');
mustInclude('dashboard page: expand dashboard control', dashboardHtml, 'EXPAND DASHBOARD');
mustInclude('dashboard page: expand dashboard data hook', dashboardHtml, 'data-dashboard-expand');
mustInclude('dashboard page: expand dashboard runtime script', dashboardHtml, 'dashboard-expand.js');
// Source callout: updated copy mentions all three artifacts
mustInclude('dashboard page: source-availability callout', dashboardHtml,
  'The full artifact package is available in a dedicated standalone repository'
);
mustInclude('dashboard page: source includes label', dashboardHtml, 'Includes:');
mustInclude('dashboard page: source includes prototype dashboard', dashboardHtml, 'Prototype dashboard');
mustInclude('dashboard page: source includes original wireframe', dashboardHtml, 'Original wireframe');
mustInclude('dashboard page: source includes working prd', dashboardHtml, 'Working PRD');
mustInclude('dashboard page: source includes service list', dashboardHtml, 'resource-dashboard-source-includes');

// Source callout must appear before the conversational close
const sourceCalloutIdx = dashboardHtml.indexOf('resource-dashboard-source-callout');
const conversationalCloseIdx = dashboardHtml.indexOf('resource-conversational-close');
if (!(sourceCalloutIdx !== -1 && conversationalCloseIdx !== -1 && sourceCalloutIdx < conversationalCloseIdx)) {
  fail('dashboard page: source callout must appear before conversational close section.');
}

// Wireframe tile section
mustInclude('dashboard page: wireframe section', dashboardHtml, 'resource-dashboard-wireframe-section');
mustInclude('dashboard page: wireframe eyebrow', dashboardHtml, 'Included in the source package');
mustInclude('dashboard page: wireframe title', dashboardHtml, 'Dashboard Wireframe');
mustInclude('dashboard page: wireframe copy', dashboardHtml, 'Original structural wireframe used to map the operating view, screen zones, and information hierarchy.');
mustInclude('dashboard page: wireframe tile trigger', dashboardHtml, 'data-wireframe-trigger');
mustInclude('dashboard page: wireframe tile button type', dashboardHtml, 'type="button"');
mustInclude('dashboard page: wireframe image preview path', dashboardHtml, 'wireframe-prototype-preview.png');
mustInclude('dashboard page: wireframe tile cta', dashboardHtml, 'resource-dashboard-wireframe-tile-cta');

// Wireframe tile must appear between source callout and conversational close
const wireframeSectionIdx = dashboardHtml.indexOf('resource-dashboard-wireframe-section');
if (!(wireframeSectionIdx !== -1 && wireframeSectionIdx > sourceCalloutIdx && wireframeSectionIdx < conversationalCloseIdx)) {
  fail('dashboard page: wireframe tile must appear between source callout and conversational close.');
}

// Wireframe modal
mustInclude('dashboard page: wireframe modal element', dashboardHtml, 'data-wireframe-modal');
mustInclude('dashboard page: wireframe modal role dialog', dashboardHtml, 'role="dialog"');
mustInclude('dashboard page: wireframe modal aria-modal', dashboardHtml, 'aria-modal="true"');
mustInclude('dashboard page: wireframe modal close button', dashboardHtml, 'data-wireframe-close');
mustInclude('dashboard page: wireframe modal backdrop', dashboardHtml, 'data-wireframe-backdrop');
mustInclude('dashboard page: wireframe image src attr', dashboardHtml, 'data-wireframe-src="/assets/resources/ai-enabled-operations-dashboard/wireframe-prototype-preview.png"');

// Modal JS must be wired in
mustInclude('dashboard page: wireframe modal script', dashboardHtml, 'dashboard-wireframe-modal.js');

// Modal JS must contain Escape key and outside-click handlers
const wireframeModalJs = require('fs').readFileSync(require('path').join(root, 'scripts', 'runtime', 'dashboard-wireframe-modal.js'), 'utf8');
mustInclude('wireframe modal JS: Escape key', wireframeModalJs, "'Escape'");
mustInclude('wireframe modal JS: backdrop click closes', wireframeModalJs, 'data-wireframe-backdrop');
mustInclude('wireframe modal JS: aria-hidden open state', wireframeModalJs, "setAttribute('aria-hidden', 'false')");
mustInclude('wireframe modal JS: aria-hidden close state', wireframeModalJs, "setAttribute('aria-hidden', 'true')");

// Wireframe asset must exist on disk
const wireframeAssetPath = require('path').join(root, 'assets', 'resources', 'ai-enabled-operations-dashboard', 'wireframe-prototype.html');
if (!require('fs').existsSync(wireframeAssetPath)) {
  fail('wireframe asset missing: assets/resources/ai-enabled-operations-dashboard/wireframe-prototype.html');
}
const wireframePreviewImagePath = require('path').join(root, 'assets', 'resources', 'ai-enabled-operations-dashboard', 'wireframe-prototype-preview.png');
if (!require('fs').existsSync(wireframePreviewImagePath)) {
  fail('wireframe preview image missing: assets/resources/ai-enabled-operations-dashboard/wireframe-prototype-preview.png');
}

mustInclude('dashboard page: closing conversation copy', dashboardHtml,
  'If this sparks ideas about how your business is reviewed, managed, or scaled, feel free to reach out.'
);
mustInclude('dashboard page: Reach Out for a Chat CTA', dashboardHtml, '>Reach Out for a Chat<');
mustInclude('dashboard page: Reach Out links to /connect/', dashboardHtml, 'href="/connect/"');
mustInclude('dashboard page: View Source Code top CTA', dashboardHtml, 'View Source Code');
mustInclude('dashboard page: source CTA tracking hook', dashboardHtml, 'data-track-dashboard-source-code');
mustInclude('dashboard page: source CTA label contract', dashboardHtml, 'data-source-code-label="view_dashboard_source_code"');
mustInclude('dashboard page: Explore the Full Framework bottom CTA', dashboardHtml, '>Explore the Full Framework<');
mustInclude('dashboard page: mobile fallback message', dashboardHtml,
  'This interactive dashboard is designed for TV, desktop, or tablet review. For the full experience, please switch to a larger screen.'
);
mustInclude('dashboard page: back to resources hub nav', dashboardHtml, 'Back to Resources Hub');
mustInclude('dashboard page: mobile previous nav label', dashboardHtml, '← Resources Hub');
mustInclude('dashboard page: mobile next nav label', dashboardHtml, 'Full Framework →');
mustInclude('dashboard page: analytics slug attr', dashboardHtml, 'data-resource-slug="ai-enabled-operations-dashboard"');
mustInclude('dashboard page: analytics type attr', dashboardHtml, 'data-resource-type="dashboard_prototype"');
mustInclude('dashboard page: analytics location attr', dashboardHtml, 'data-resource-location="dashboard_page"');
mustInclude('dashboard page: shelf callout family', dashboardHtml, 'class="shelf-callout resource-family-callout resource-dashboard-callout"');
mustInclude('dashboard page: mobile fallback shell', dashboardHtml, 'resource-dashboard-mobile-fallback');
mustInclude('dashboard page: artifact frame shell', dashboardHtml, 'resource-dashboard-frame-shell');
mustInclude('dashboard page: iframe route', dashboardHtml, 'src="/ai-enabled-operations-dashboard/"');
mustInclude('dashboard page: iframe class', dashboardHtml, 'class="resource-dashboard-frame-iframe"');
mustInclude('dashboard page: mobile screenshot path', resourcesCss, 'dashboard-home-mobile-preview.png');

// PasteFlow page contract
mustInclude('pasteflow page: canonical URL', pasteflowHtml, 'href="https://romanbediner.com/resources/pasteflow/"');
mustInclude('pasteflow page: h1', pasteflowHtml, '<h1>PasteFlow</h1>');
mustInclude('pasteflow page: eyebrow', pasteflowHtml, '>PRODUCT PROOF POINT<');
mustInclude('pasteflow page: title', pasteflowHtml, '<title>PasteFlow Chrome Extension | Human-Like Auto Typer for Web Editors</title>');
mustInclude('pasteflow page: meta description', pasteflowHtml, 'PasteFlow is a Chrome extension for controlled, human-rhythm typed input in web editors, forms, surveys, and browser-based workflows. A product proof point for AI-enabled operations.');
mustInclude('pasteflow page: cws CTA', pasteflowHtml, 'href="https://chromewebstore.google.com/detail/pasteflow/paenffoomjmkonbgkmfdbnfaljoiilgm"');
mustInclude('pasteflow page: hero image path', pasteflowHtml, '/assets/resources/pasteflow/pasteflow-cws-01-hero.png');
mustInclude('pasteflow page: hero image alt', pasteflowHtml, 'PasteFlow product interface showing human-rhythm typing for browser-based work');
mustInclude('pasteflow page: shelf callout copy', pasteflowHtml, 'A workflow tool that turns browser-based input friction into controlled, human-rhythm typing for web editors, forms, surveys, and AI-assisted work.');
mustInclude('pasteflow page: opening thesis', pasteflowHtml, 'PasteFlow is the artifact behind a simple operating thesis: AI can accelerate building, but useful products still require clear workflow definition, QA, release discipline, and customer-ready execution.');
mustInclude('pasteflow page: learn how it works anchor', pasteflowHtml, 'href="#pasteflow-capabilities"');
mustInclude('pasteflow page: youtube title', pasteflowHtml, '>90-Second Product Overview<');
mustInclude('pasteflow page: youtube iframe', pasteflowHtml, 'https://www.youtube-nocookie.com/embed/lKfc8dehasg');
mustInclude('pasteflow page: product capabilities section', pasteflowHtml, '>Product Capabilities<');
mustInclude('pasteflow page: capability card controlled input', pasteflowHtml, '<h3>Controlled Input</h3>');
mustInclude('pasteflow page: capability card human rhythm', pasteflowHtml, '<h3>Human Rhythm</h3>');
mustInclude('pasteflow page: capability card target inspection', pasteflowHtml, '<h3>Target Inspection</h3>');
mustInclude('pasteflow page: capability card session control', pasteflowHtml, '<h3>Session Control</h3>');
mustInclude('pasteflow page: capability card editor coverage', pasteflowHtml, '<h3>Editor Coverage</h3>');
mustInclude('pasteflow page: capability card multilingual support', pasteflowHtml, '<h3>Multilingual Support</h3>');
mustNotInclude('pasteflow page: capability card product infrastructure removed', pasteflowHtml, '<h3>Product Infrastructure</h3>');
mustNotInclude('pasteflow page: removed build anatomy section', pasteflowHtml, '>Build Anatomy<');
mustNotInclude('pasteflow page: removed product system section', pasteflowHtml, '>Product System<');
mustNotInclude('pasteflow page: removed snippets mention', pasteflowHtml, 'Snippets');
mustNotInclude('pasteflow page: no duplicate hero CTA block', pasteflowHtml, 'resource-pasteflow-hero-actions');
mustInclude('pasteflow page: user-controlled heading', pasteflowHtml, '>User-Controlled by Design<');
mustNotInclude('pasteflow page: responsible use heading removed', pasteflowHtml, '>Responsible Use<');
mustInclude('pasteflow page: user-controlled note', pasteflowHtml, 'PasteFlow is intentionally user-directed. It types only into fields the user chooses, never submits forms, and keeps start, pause, resume, and stop controls visible throughout the session.');
mustInclude('pasteflow page: in-this-product narrative paragraph 1', pasteflowHtml, 'PasteFlow began with a practical workflow constraint: prepared text often needs to move into browser-based editors, forms, and tools where normal paste behavior can be unreliable, messy, or difficult to control.');
mustInclude('pasteflow page: in-this-product narrative paragraph 2', pasteflowHtml, 'The visible product is simple by design: choose the destination, inspect the target, set the typing behavior, start the session, and stay in control.');
mustInclude('pasteflow page: in-this-product narrative paragraph 3', pasteflowHtml, 'Behind that simple workflow is the operating work that turns an AI-assisted build into a real product: requirements, browser behavior testing, defect triage, release packaging, Chrome Web Store approval, licensing, payments, support documentation, and post-launch iteration.');
mustInclude('pasteflow page: in-this-product narrative paragraph 4', pasteflowHtml, 'The hard part was not prompting. The hard part was turning a recurring workflow problem into a usable system.');
mustInclude('pasteflow page: closing CTA link', pasteflowHtml, 'href="/connect/"');
mustInclude('pasteflow page: closing CTA copy', pasteflowHtml, 'PasteFlow is one example of the broader operating model: identify repeated friction, define the workflow, build the system, test it, and make it usable.');
mustInclude('pasteflow page: back nav', pasteflowHtml, 'href="/resources/"');
mustInclude('pasteflow page: ga bootstrap', pasteflowHtml, 'src="/scripts/runtime/ga4-bootstrap.js"');
mustInclude('pasteflow page: resources stylesheet', pasteflowHtml, 'href="/styles/resources.css');
mustInclude('pasteflow page: site stylesheet', pasteflowHtml, 'href="/styles/site.css');
mustInclude('pasteflow page: software schema', pasteflowHtml, '"@type": "SoftwareApplication"');
mustInclude('pasteflow page: webpage schema', pasteflowHtml, '"@type": "WebPage"');
mustInclude('pasteflow page: no html public links', pasteflowHtml, 'href="/resources/"');
mustInclude('pasteflow page: csp frame-src', pasteflowHtml, 'frame-src https://www.youtube.com https://www.youtube-nocookie.com');
mustInclude('pasteflow page: external cta hook', pasteflowHtml, 'data-track-resource-external-cta');
mustInclude('pasteflow page: external cta label', pasteflowHtml, 'data-resource-cta-label="add_to_chrome"');
mustInclude('pasteflow page: external url type', pasteflowHtml, 'data-resource-external-url-type="chrome_web_store"');
mustNotInclude('pasteflow page: source code link forbidden', pasteflowHtml, 'View Source Code');
mustNotInclude('pasteflow page: offers schema forbidden', pasteflowHtml, '"offers"');
mustNotInclude('pasteflow page: support email forbidden', pasteflowHtml, 'mailto:');
mustNotInclude('pasteflow page: support email forbidden', pasteflowHtml, 'connect@romanbediner.com');
mustNotInclude('pasteflow visible shelf should not say shipped', pasteflowHtml, 'A shipped workflow tool');
mustNotInclude('pasteflow opening thesis should not say shipped product', pasteflowHtml, 'turns a common workflow constraint into a shipped product');
mustNotInclude('pasteflow page copy should not say shipped', pasteflowHtml, 'shipped');

const addToChromeVisibleCount = (pasteflowHtml.match(/>Add to Chrome</g) || []).length;
if (addToChromeVisibleCount !== 1) {
  fail(`pasteflow page must contain exactly one visible Add to Chrome button label; found ${addToChromeVisibleCount}`);
}

const heroPos = pasteflowHtml.indexOf('resource-pasteflow-hero-link');
const audiencePos = pasteflowHtml.indexOf('id="pasteflow-audience"');
if (!(heroPos !== -1 && audiencePos !== -1 && heroPos < audiencePos)) {
  fail('pasteflow page must place Who This Is For after the hero image section.');
}

[
  'pricing',
  'Free',
  'Plus',
  '$4.99',
  'lifetime',
  'character limit',
  'source code',
  'support email',
  'snippets',
  'bypass',
  'evade',
  'defeat',
  'circumvent',
  'detection avoidance',
  'paste restriction',
  'anti-detection'
].forEach((term) => {
  if (pasteflowHtml.toLowerCase().includes(term.toLowerCase())) {
    fail(`pasteflow page contains prohibited term: ${term}`);
  }
});

mustInclude('pasteflow and dashboard share detail lede class on opening prose', pasteflowHtml, 'resource-detail-prose-lede');
mustInclude('pasteflow and dashboard share detail lede class on opening prose', dashboardHtml, 'resource-detail-prose-lede');
mustInclude('resources css: shared detail lede rule present', resourcesCss, '.resource-detail-prose-lede');

if (dashboardHtml.includes('resource-dashboard-frame-placeholder')) {
  fail('dashboard page must not include Phase 5 placeholder shell after iframe wiring.');
}

if (failures > 0) {
  process.exit(1);
}

console.log('PASS: Website V2 Phase 1 resource route + locked-copy + analytics contracts.');
