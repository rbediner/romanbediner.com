#!/usr/bin/env node
/**
 * Invariant:
 * - Homepage hero copy, CTA, and operating-experience logo layout must remain intact.
 * Why this exists:
 * - Protects the approved homepage positioning and visual hierarchy from silent regressions.
 * What breaks if it fails:
 * - CI blocks deployment to prevent homepage messaging or layout drift.
 */
const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..', '..');
const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const homeCss = fs.readFileSync(path.join(root, 'styles/home.css'), 'utf8');

const failures = [];

if (!html.includes('<main class="page-main">')) {
  failures.push('Homepage is missing page-main.');
}

if (!html.includes('AI-ENABLED OPERATING SYSTEMS')) {
  failures.push('Homepage eyebrow must equal AI-ENABLED OPERATING SYSTEMS.');
}

if (!html.includes('Productizing Operations for Modern, AI-Enabled Work.')) {
  failures.push('Homepage must preserve the approved H1.');
}

const requiredCopy = [
  'The work focuses on designing execution systems that connect product, engineering, finance, commercial operations, and customer delivery through clear ownership, measurable signals, disciplined operating cadence, and AI-enabled coordination.',
  'The work is rarely blocked by strategy alone. It breaks down when ownership, systems, signals, and execution rhythms are not designed together.',
  'SELECTED OPERATING EXPERIENCE',
  'Selected leadership, advisory, and embedded operating engagements.',
  'OPERATING EXPERIENCE',
  'EXECUTION SYSTEMS',
  'OPERATING PRINCIPLES'
];

for (const phrase of requiredCopy) {
  if (!html.includes(phrase)) {
    failures.push(`Homepage missing required copy: ${phrase}`);
  }
}

if (!/href="\/about\/">About<\/a>/.test(html)) {
  failures.push('Homepage hero CTA must be About -> /about/.');
}

const logoOrder = [
  'class="experience-logo experience-logo-disney"',
  'class="experience-logo experience-logo-aws"',
  'class="experience-logo experience-logo-laser-light"',
  'class="experience-logo experience-logo-agentic"'
];
let previousIndex = -1;
for (const marker of logoOrder) {
  const index = html.indexOf(marker);
  if (index === -1) {
    failures.push(`Missing homepage logo marker: ${marker}`);
    continue;
  }
  if (index <= previousIndex) {
    failures.push('Homepage logos are not in the approved order.');
  }
  previousIndex = index;
}

if (html.includes('semantic-authority')) {
  failures.push('Homepage hidden semantic-authority block must be removed.');
}

if (html.includes('The Walt Disney Company &middot; Amazon Web Services')) {
  failures.push('Homepage must remove the legacy Disney/AWS eyebrow.');
}

if (!homeCss.includes('.experience-logo-grid') || !homeCss.includes('.home-primary-cta')) {
  failures.push('Homepage CSS must include logo-grid and hero CTA styles.');
}

if (failures.length > 0) {
  failures.forEach((message) => console.error(`FAIL: ${message}`));
  process.exit(1);
}

console.log('PASS: home hero layout guardrails passed.');
