#!/usr/bin/env node
/**
 * Metadata consistency and positioning guardrails.
 */
const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');

const expectedHomepageTitle = 'Roman Bediner | Operations & Transformation Leader';
const expectedHomepageDescription = 'Executive operator designing scalable operating models that align product, engineering, and customer systems.';
const expectedHomepageH1 = 'Productizing Operations for Modern AI Enabled Work';
const expectedInsightsTitle = 'Insights on AI Enabled Operations | Roman Bediner';
const expectedInsightsDescription = 'Strategic briefs on operating architecture, AI-enabled execution, operations as a product, governance design, and models for disciplined work systems.';

const htmlPages = [
  'index.html',
  'about/index.html',
  'services/index.html',
  'connect/index.html',
  'insights/index.html'
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

const failures = { count: 0 };

const homepageHtml = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const insightsHtml = fs.readFileSync(path.join(root, 'insights', 'index.html'), 'utf8');

const homepageTitle = extractSingle(/<title>([^<]+)<\/title>/gi, homepageHtml, 'title', 'index.html', failures);
const homepageDescription = extractSingle(/<meta\s+name="description"\s+content="([^"]*)"\s*\/?\s*>/gi, homepageHtml, 'meta description', 'index.html', failures);
const homepageH1 = extractSingle(/<h1>([^<]+)<\/h1>/gi, homepageHtml, 'h1', 'index.html', failures);
const homepageOgTitle = extractSingle(/<meta\s+property="og:title"\s+content="([^"]*)"\s*\/?\s*>/gi, homepageHtml, 'og:title', 'index.html', failures);
const homepageOgDescription = extractSingle(/<meta\s+property="og:description"\s+content="([^"]*)"\s*\/?\s*>/gi, homepageHtml, 'og:description', 'index.html', failures);

const insightsTitle = extractSingle(/<title>([^<]+)<\/title>/gi, insightsHtml, 'title', 'insights/index.html', failures);
const insightsDescription = extractSingle(/<meta\s+name="description"\s+content="([^"]*)"\s*\/?\s*>/gi, insightsHtml, 'meta description', 'insights/index.html', failures);
const insightsOgTitle = extractSingle(/<meta\s+property="og:title"\s+content="([^"]*)"\s*\/?\s*>/gi, insightsHtml, 'og:title', 'insights/index.html', failures);
const insightsOgDescription = extractSingle(/<meta\s+property="og:description"\s+content="([^"]*)"\s*\/?\s*>/gi, insightsHtml, 'og:description', 'insights/index.html', failures);
const insightsTwitterTitle = extractSingle(/<meta\s+name="twitter:title"\s+content="([^"]*)"\s*\/?\s*>/gi, insightsHtml, 'twitter:title', 'insights/index.html', failures);
const insightsTwitterDescription = extractSingle(/<meta\s+name="twitter:description"\s+content="([^"]*)"\s*\/?\s*>/gi, insightsHtml, 'twitter:description', 'insights/index.html', failures);
const insightsH1 = [...insightsHtml.matchAll(/<h1>([^<]+)<\/h1>/gi)].map((m) => m[1].trim());

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
if (homepageOgTitle && homepageOgTitle !== expectedHomepageTitle) {
  failures.count += 1;
  console.error('FAIL: homepage og:title must match homepage title.');
}
if (homepageOgDescription && homepageOgDescription !== expectedHomepageDescription) {
  failures.count += 1;
  console.error('FAIL: homepage og:description must match homepage meta description.');
}

if (insightsTitle && insightsTitle !== expectedInsightsTitle) {
  failures.count += 1;
  console.error(`FAIL: insights title mismatch. Expected "${expectedInsightsTitle}"`);
}
if (insightsDescription && insightsDescription !== expectedInsightsDescription) {
  failures.count += 1;
  console.error('FAIL: insights meta description mismatch.');
}
if (insightsH1.length !== 1 || insightsH1[0] !== 'Insights') {
  failures.count += 1;
  console.error('FAIL: insights page must contain exactly one h1 with value "Insights".');
}
if (insightsOgTitle && insightsOgTitle !== expectedInsightsTitle) {
  failures.count += 1;
  console.error('FAIL: insights og:title must match insights title.');
}
if (insightsTwitterTitle && insightsTwitterTitle !== expectedInsightsTitle) {
  failures.count += 1;
  console.error('FAIL: insights twitter:title must match insights title.');
}
if (insightsOgDescription && insightsOgDescription !== expectedInsightsDescription) {
  failures.count += 1;
  console.error('FAIL: insights og:description must match insights meta description.');
}
if (insightsTwitterDescription && insightsTwitterDescription !== expectedInsightsDescription) {
  failures.count += 1;
  console.error('FAIL: insights twitter:description must match insights meta description.');
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

  if (/—/.test(html)) {
    failures.count += 1;
    console.error(`FAIL: em dash found in ${rel}`);
  }
}

if (failures.count > 0) {
  process.exit(1);
}

console.log('PASS: metadata consistency checks passed.');
