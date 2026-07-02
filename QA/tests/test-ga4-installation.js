#!/usr/bin/env node
/**
 * Invariant:
 * - Regression guardrails for test-ga4-installation.js.
 * Why this exists:
 * - Prevents architectural drift in routing, analytics, CSP, metadata, or shared UI contracts.
 * What breaks if it fails:
 * - CI blocks deployment to prevent production regressions.
 */
/**
 * GA4 architecture checks.
 * Enforces meta-based measurement ID + shared /scripts/runtime/ga4-bootstrap.js bootstrap.
 */
const fs = require('fs');
const path = require('path');

const MEASUREMENT_ID = 'G-DVHD0KL633';
const navRuntime = fs.readFileSync(path.resolve(__dirname, '..', '..', 'scripts/runtime/site-navigation.js'), 'utf8');
const frameworkAnalyticsRuntime = fs.readFileSync(
  path.resolve(__dirname, '..', '..', 'scripts/runtime/framework-brief-analytics.js'),
  'utf8'
);
const gaBootstrapRuntime = fs.readFileSync(path.resolve(__dirname, '..', '..', 'scripts/runtime/ga4-bootstrap.js'), 'utf8');
const PAGES = [
  'index.html',
  'about/index.html',
  'services/index.html',
  'connect/index.html',
  'framework/index.html',
  'resources/index.html',
  'resources/ai-enabled-operations-framework-summary/index.html',
  'resources/pasteflow/index.html',
  'framework/opportunity/productizing-operations/index.html',
  'framework/design/operations-as-product/index.html',
  'framework/integration/ai-operating-layer/index.html',
  'framework/execution/operational-lanes/index.html',
  'framework/signals/operational-signals/index.html',
  'framework/evolution/agentic-guardrails/index.html'
];

let failures = 0;

for (const rel of PAGES) {
  const html = fs.readFileSync(path.resolve(__dirname, '..', '..', rel), 'utf8');

  const metaMatches = html.match(new RegExp(`<meta name="ga4-measurement-id" content="${MEASUREMENT_ID}" \/>`, 'g')) || [];
  const bootstrapMatches = html.match(/<script src="\/scripts\/runtime\/ga4-bootstrap\.js" defer><\/script>/g) || [];
  const inlineConfigMatches = html.match(/gtag\('config'/g) || [];
  const inlineDataLayerMatches = html.match(/window\.dataLayer\s*=\s*window\.dataLayer/g) || [];

  if (metaMatches.length !== 1) {
    failures += 1;
    console.error(`FAIL: expected one ga4-measurement-id meta tag in ${rel}`);
  }
  if (bootstrapMatches.length !== 1) {
    failures += 1;
    console.error(`FAIL: expected one /scripts/runtime/ga4-bootstrap.js include in ${rel}`);
  }
  if (inlineConfigMatches.length > 0 || inlineDataLayerMatches.length > 0) {
    failures += 1;
    console.error(`FAIL: inline GA config/dataLayer script found in ${rel}`);
  }

  const allMeasurementIds = html.match(/G-[A-Z0-9]{8,}/g) || [];
  const unexpectedIds = allMeasurementIds.filter((id) => id.toUpperCase() !== MEASUREMENT_ID);
  if (unexpectedIds.length > 0) {
    failures += 1;
    console.error(`FAIL: unexpected GA IDs in ${rel}: ${unexpectedIds.join(', ')}`);
  }
}

const requiredNavigationParams = ['source_page', 'target_page', 'link_type', 'environment'];
for (const key of requiredNavigationParams) {
  if (!navRuntime.includes(key)) {
    failures += 1;
    console.error(`FAIL: missing required navigation analytics parameter '${key}' in scripts/runtime/site-navigation.js`);
  }
}

const requiredFrameworkParams = ['source_page', 'target_page', 'link_type'];
for (const key of requiredFrameworkParams) {
  if (!frameworkAnalyticsRuntime.includes(key)) {
    failures += 1;
    console.error(`FAIL: missing required framework analytics parameter '${key}' in scripts/runtime/framework-brief-analytics.js`);
  }
}

if (!frameworkAnalyticsRuntime.includes('environment')) {
  failures += 1;
  console.error('FAIL: missing required framework analytics parameter \'environment\' in scripts/runtime/framework-brief-analytics.js');
}

const requiredEvents = [
  'nav_click',
  'internal_link_click',
  'framework_stage_click',
  'framework_nav_click',
  'scroll_depth',
  'connect_intent'
];

for (const eventName of requiredEvents) {
  if (!navRuntime.includes(eventName) && !frameworkAnalyticsRuntime.includes(eventName)) {
    failures += 1;
    console.error(`FAIL: required analytics event '${eventName}' is not implemented in runtime scripts.`);
  }
}

if (!frameworkAnalyticsRuntime.includes("page_type: 'framework_brief'")) {
  failures += 1;
  console.error("FAIL: scroll_depth payload must include page_type='framework_brief'.");
}

if (!frameworkAnalyticsRuntime.includes('percent_scrolled')) {
  failures += 1;
  console.error("FAIL: framework brief scroll_depth payload must include 'percent_scrolled'.");
}

if (frameworkAnalyticsRuntime.includes('scroll_percent')) {
  failures += 1;
  console.error("FAIL: framework brief scroll_depth payload must not use legacy 'scroll_percent'.");
}

if (!frameworkAnalyticsRuntime.includes('var thresholds = [25, 50, 75, 90]')) {
  failures += 1;
  console.error('FAIL: scroll_depth thresholds must be 25/50/75/90.');
}

if (!navRuntime.includes('trackConnectIntentNavigation')) {
  failures += 1;
  console.error('FAIL: connect intent navigation tracking hook is missing.');
}

if (!navRuntime.includes('linkedin.com/in/romanbediner')) {
  failures += 1;
  console.error('FAIL: connect intent external-link tracking for LinkedIn is missing.');
}

if (!gaBootstrapRuntime.includes('debug_mode')) {
  failures += 1;
  console.error('FAIL: GA bootstrap must configure debug_mode for non-production environments.');
}

if (failures > 0) {
  process.exit(1);
}

console.log('PASS: GA4 meta/bootstrap architecture checks passed.');
