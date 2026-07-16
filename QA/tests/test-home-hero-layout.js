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
const officialCrest = path.join(root, 'assets/logos/nc-courage-crest-official.svg');

const failures = [];

if (!html.includes('<main class="page-main">')) {
  failures.push('Homepage is missing page-main.');
}

if (!html.includes('AI-ENABLED OPERATING SYSTEMS')) {
  failures.push('Homepage eyebrow must equal AI-ENABLED OPERATING SYSTEMS.');
}

if (!html.includes('Productizing Operations for Modern, AI-Enabled Work')) {
  failures.push('Homepage must preserve the approved H1.');
}

const requiredCopy = [
  'The work focuses on designing execution systems that connect product, engineering, finance, commercial operations, and customer delivery through clear ownership, measurable signals, disciplined operating cadence, and AI-enabled coordination.',
  'The work is rarely blocked by strategy alone. It breaks down when ownership, systems, signals, and execution rhythms are not designed together.',
  'SELECTED OPERATING EXPERIENCE',
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

if (!html.includes('/assets/logos/nc-courage-crest-official.svg')) {
  failures.push('Homepage must use the first-party NC Courage crest asset.');
}
if (!fs.existsSync(officialCrest)) {
  failures.push('First-party NC Courage crest asset is missing.');
}
if (!/\.experience-logo-courage\s*\{[\s\S]*?height:\s*112px\s*;/i.test(homeCss)) {
  failures.push('NC Courage crest must remain large enough to read beside the wordmarks.');
}

if (/\.experience-logo-cell\s*\{[\s\S]*?overflow:\s*hidden/i.test(homeCss)) {
  failures.push('Experience logo cells must not clip official marks.');
}

const logoOrder = [
  'class="experience-logo experience-logo-disney"',
  'class="experience-logo experience-logo-aws"',
  'class="experience-logo experience-logo-laser-light"',
  'class="experience-logo experience-logo-agentic"',
  'class="experience-logo experience-logo-courage"'
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

// The supporting "Selected leadership…" qualifier sentence was intentionally removed from the logo band.
if (html.includes('Selected leadership, advisory, and embedded operating engagements.')) {
  failures.push('Homepage logo band qualifier sentence must be removed.');
}

if (!homeCss.includes('.experience-logo-grid') || !homeCss.includes('.experience-logo-row')) {
  failures.push('Homepage CSS must include logo-grid and logo-row styles.');
}

if (!/\.experience-logo\s*\{[\s\S]*?filter:\s*none/i.test(homeCss)) {
  failures.push('Experience logos must preserve the supplied official mark colors.');
}

if (!/\.experience-logo-cell-agentic\s*\{[\s\S]*?grid-column:\s*1\s*\/\s*span\s*3[\s\S]*?grid-row:\s*1/i.test(homeCss)) {
  failures.push('Agentic Society must lead the centered first mobile logo row.');
}
if (!/\.experience-logo-cell-courage\s*\{[\s\S]*?grid-column:\s*4\s*\/\s*span\s*3[\s\S]*?grid-row:\s*1/i.test(homeCss)) {
  failures.push('NC Courage crest must lead the centered first mobile logo row.');
}
if (!/\.experience-logo-cell-disney,[\s\S]*?\.experience-logo-cell-laser-light\s*\{[\s\S]*?grid-row:\s*2/i.test(homeCss)) {
  failures.push('Disney, AWS, and Laser Light must occupy the second mobile logo row.');
}

if (failures.length > 0) {
  failures.forEach((message) => console.error(`FAIL: ${message}`));
  process.exit(1);
}

console.log('PASS: home hero layout guardrails passed.');
