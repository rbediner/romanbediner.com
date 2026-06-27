#!/usr/bin/env node
/**
 * Invariant:
 * - Regression guardrails for test-metadata-consistency.js.
 * Why this exists:
 * - Prevents architectural drift in routing, analytics, CSP, metadata, or shared UI contracts.
 * What breaks if it fails:
 * - CI blocks deployment to prevent production regressions.
 */
/**
 * Metadata consistency and positioning guardrails.
 */
const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..', '..');

const expectedHomepageTitle = 'Roman Bediner | AI-Enabled Operations & Agentic Operating Systems';
const expectedHomepageDescription = 'Roman Bediner designs AI-enabled operations, execution systems, and agentic operating models, including coordinated fleets of AI employees supporting project management, workflow orchestration, decision tracking, and executive visibility.';
const expectedHomepageH1 = 'Productizing Operations for Modern, AI-Enabled Work.';
const expectedFrameworkTitle = 'AI-Enabled Operations Framework | Productizing Modern Operating Teams';
const expectedFrameworkDescription = 'A six-stage operating model for modern AI-enabled teams, covering opportunity, design, integration, execution, signals, and evolution to turn fragmented work into scalable operating systems.';

const htmlPages = [
  'index.html',
  'about/index.html',
  'services/index.html',
  'connect/index.html',
  'framework/index.html',
  'resources/index.html',
  'resources/ai-enabled-operations-framework-summary/index.html',
  'resources/pasteflow/index.html'
];

function extractSingle(regex, html, label, file, failures) {
  const matches = [...html.matchAll(regex)].map((m) => m[1].trim());
  if (matches.length !== 1) {
    failures.count += 1;
    console.error(`FAIL: expected exactly one ${label} in ${file}`);
    return null;
  }
  return matches[0];
}

function decodeBasicEntities(value) {
  return value
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");
}

const failures = { count: 0 };

const homepageHtml = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const insightsHtml = fs.readFileSync(path.join(root, 'framework', 'index.html'), 'utf8');

const homepageTitle = extractSingle(/<title>([^<]+)<\/title>/gi, homepageHtml, 'title', 'index.html', failures);
const homepageDescription = extractSingle(/<meta\s+name="description"\s+content="([^"]*)"\s*\/?\s*>/gi, homepageHtml, 'meta description', 'index.html', failures);
const homepageH1 = extractSingle(/<h1>([^<]+)<\/h1>/gi, homepageHtml, 'h1', 'index.html', failures);
const homepageOgTitle = extractSingle(/<meta\s+property="og:title"\s+content="([^"]*)"\s*\/?\s*>/gi, homepageHtml, 'og:title', 'index.html', failures);
const homepageOgDescription = extractSingle(/<meta\s+property="og:description"\s+content="([^"]*)"\s*\/?\s*>/gi, homepageHtml, 'og:description', 'index.html', failures);

const insightsTitle = extractSingle(/<title>([^<]+)<\/title>/gi, insightsHtml, 'title', 'framework/index.html', failures);
const insightsDescription = extractSingle(/<meta\s+name="description"\s+content="([^"]*)"\s*\/?\s*>/gi, insightsHtml, 'meta description', 'framework/index.html', failures);
const insightsOgTitle = extractSingle(/<meta\s+property="og:title"\s+content="([^"]*)"\s*\/?\s*>/gi, insightsHtml, 'og:title', 'framework/index.html', failures);
const insightsOgDescription = extractSingle(/<meta\s+property="og:description"\s+content="([^"]*)"\s*\/?\s*>/gi, insightsHtml, 'og:description', 'framework/index.html', failures);
const insightsTwitterTitle = extractSingle(/<meta\s+name="twitter:title"\s+content="([^"]*)"\s*\/?\s*>/gi, insightsHtml, 'twitter:title', 'framework/index.html', failures);
const insightsTwitterDescription = extractSingle(/<meta\s+name="twitter:description"\s+content="([^"]*)"\s*\/?\s*>/gi, insightsHtml, 'twitter:description', 'framework/index.html', failures);
const insightsH1 = [...insightsHtml.matchAll(/<h1>([^<]+)<\/h1>/gi)].map((m) => decodeBasicEntities(m[1].trim()));

if (homepageTitle && homepageTitle !== expectedHomepageTitle) {
  failures.count += 1;
  console.error(`FAIL: homepage title mismatch. Expected "${expectedHomepageTitle}"`);
}
if (homepageDescription && homepageDescription !== expectedHomepageDescription) {
  failures.count += 1;
  console.error('FAIL: homepage meta description mismatch.');
}
if (homepageH1 && homepageH1 !== expectedHomepageH1) {
  failures.count += 1;
  console.error(`FAIL: homepage h1 mismatch. Expected "${expectedHomepageH1}"`);
}
if (homepageOgTitle && !homepageOgTitle.length) {
  failures.count += 1;
  console.error('FAIL: homepage og:title cannot be empty.');
}
if (homepageOgDescription && !homepageOgDescription.length) {
  failures.count += 1;
  console.error('FAIL: homepage og:description cannot be empty.');
}

if (insightsTitle && insightsTitle !== expectedFrameworkTitle) {
  failures.count += 1;
  console.error(`FAIL: framework title mismatch. Expected "${expectedFrameworkTitle}"`);
}
if (insightsDescription && insightsDescription !== expectedFrameworkDescription) {
  failures.count += 1;
  console.error('FAIL: framework meta description mismatch.');
}
if (insightsH1.length !== 1 || insightsH1[0] !== 'The AI-Enabled Operations Framework') {
  failures.count += 1;
  console.error('FAIL: framework page must contain exactly one h1 with value \"The AI-Enabled Operations Framework\".');
}
if (insightsOgTitle && !insightsOgTitle.length) {
  failures.count += 1;
  console.error('FAIL: insights og:title cannot be empty.');
}
if (insightsTwitterTitle && !insightsTwitterTitle.length) {
  failures.count += 1;
  console.error('FAIL: insights twitter:title cannot be empty.');
}
if (insightsOgDescription && !insightsOgDescription.length) {
  failures.count += 1;
  console.error('FAIL: insights og:description cannot be empty.');
}
if (insightsTwitterDescription && !insightsTwitterDescription.length) {
  failures.count += 1;
  console.error('FAIL: insights twitter:description cannot be empty.');
}

for (const rel of htmlPages) {
  const html = fs.readFileSync(path.join(root, rel), 'utf8');
  const title = extractSingle(/<title>([^<]+)<\/title>/gi, html, 'title', rel, failures);
  const description = extractSingle(/<meta\s+name="description"\s+content="([^"]*)"\s*\/?\s*>/gi, html, 'meta description', rel, failures);

  if (rel !== 'index.html' && title === expectedHomepageTitle) {
    failures.count += 1;
    console.error(`FAIL: ${rel} duplicates homepage title`);
  }

  if (rel !== 'index.html' && description === expectedHomepageDescription) {
    failures.count += 1;
    console.error(`FAIL: ${rel} duplicates homepage meta description`);
  }

  const canonicalMatches = html.match(/<link\s+rel="canonical"\s+href="[^"]+"\s*\/?\s*>/gi) || [];
  if (canonicalMatches.length !== 1) {
    failures.count += 1;
    console.error(`FAIL: expected exactly one canonical tag in ${rel}`);
  }

  const htmlWithoutAllowedFooterDash = html.replace(
    '<p class="footer-quote-author">— Walt Disney</p>',
    ''
  );
  if (/—/.test(htmlWithoutAllowedFooterDash)) {
    failures.count += 1;
    console.error(`FAIL: em dash found in ${rel}`);
  }
}

if (failures.count > 0) {
  process.exit(1);
}

console.log('PASS: metadata consistency checks passed.');
