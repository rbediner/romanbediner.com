#!/usr/bin/env node
/**
 * Invariant:
 * - About page chapter structure, chapter navigation, and revised operating-background story must remain intact.
 * Why this exists:
 * - Protects the approved about-page information architecture and content sequencing.
 * What breaks if it fails:
 * - CI blocks deployment to prevent about-page narrative or layout regressions.
 */
const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..', '..');
const aboutHtml = fs.readFileSync(path.join(root, 'about/index.html'), 'utf8');
const aboutCss = fs.readFileSync(path.join(root, 'styles/about.css'), 'utf8');

const failures = [];

const chapterHeadings = [
  'ENTERPRISE SCALE',
  'GLOBAL DELIVERY LEADERSHIP',
  'GLOBAL INFRASTRUCTURE ADVISORY',
  'AI-ENABLED OPERATING SYSTEMS'
];

for (const heading of chapterHeadings) {
  if (!aboutHtml.includes(heading)) {
    failures.push(`About page missing chapter heading: ${heading}`);
  }
}

if ((aboutHtml.match(/class="era-header"/g) || []).length !== 4) {
  failures.push('About page must include exactly four chapter headers.');
}

const requiredSubheadings = [
  'DISNEY &amp; AWS',
  'OMNIGON &amp; ORIGIN DIGITAL',
  'LASER LIGHT COMMUNICATIONS',
  'AGENTIC SOCIETY'
];

for (const subheading of requiredSubheadings) {
  if (!aboutHtml.includes(subheading)) {
    failures.push(`About page missing subheading: ${subheading}`);
  }
}

if (!aboutHtml.includes('Current work as Operating Partner with Agentic Society')) {
  failures.push('About page must use Operating Partner as the public Agentic Society title.');
}

if (aboutHtml.includes('Fractional CEO')) {
  failures.push('About page must not mention Fractional CEO.');
}

if (!aboutHtml.includes('OPERATING PHILOSOPHY')) {
  failures.push('About page must include the approved Operating Philosophy close.');
}

if (aboutHtml.includes('Systems Over Heroics') || aboutHtml.includes('Embedded Operating Leadership')) {
  failures.push('About page must remove the old two-column philosophy card copy.');
}

if (!aboutCss.includes('.about-chapter-nav') || !aboutCss.includes('.timeline-orb.orb-4')) {
  failures.push('About CSS must support the chapter nav and fourth timeline orb.');
}

if (failures.length > 0) {
  failures.forEach((message) => console.error(`FAIL: ${message}`));
  process.exit(1);
}

console.log('PASS: about redesign and global footer attribution checks passed.');
