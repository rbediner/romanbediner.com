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

if ((aboutHtml.match(/class="era-header"/g) || []).length !== 5) {
failures.push('About page must include exactly five chapter headers.');
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

// Durable, non-time-sensitive construction for the Agentic Society chapter opener.
if (!aboutHtml.includes('Fractional COO work with Agentic Society focuses on')) {
  failures.push('About page must use the approved Fractional COO construction for Agentic Society.');
}

// The substantive claim about a coordinated fleet of agentic AI employees must remain.
if (!aboutHtml.includes('a coordinated fleet of agentic AI employees')) {
  failures.push('About page must preserve the coordinated fleet of agentic AI employees claim.');
}

// Chapter index items must be functional same-page anchors with matching targets.
const chapterAnchorTargets = [
  'enterprise-scale',
  'global-delivery-leadership',
  'global-infrastructure-advisory',
  'ai-enabled-operating-systems',
  'fractional-integration-leadership',
  'operating-philosophy'
];
for (const target of chapterAnchorTargets) {
  if (!aboutHtml.includes(`href="#${target}"`)) {
    failures.push(`About chapter index missing anchor link: #${target}`);
  }
  if (!aboutHtml.includes(`id="${target}"`)) {
    failures.push(`About page missing anchor target: id="${target}"`);
  }
}

const currentToHistoryOrder = [
  'href="#ai-enabled-operating-systems"',
  'href="#fractional-integration-leadership"',
  'href="#global-infrastructure-advisory"',
  'href="#enterprise-scale"',
  'href="#global-delivery-leadership"'
];
let previousOrderIndex = -1;
for (const marker of currentToHistoryOrder) {
  const index = aboutHtml.indexOf(marker);
  if (index <= previousOrderIndex) {
    failures.push('About chapter navigation must run from current responsibility backward through operating history.');
    break;
  }
  previousOrderIndex = index;
}

// Final CTA points to Services with the approved label.
if (!aboutHtml.includes('Explore Service Models') || !aboutHtml.includes('href="/services/"')) {
  failures.push('About final CTA must read Explore Service Models and link to /services/.');
}

// Fixed-header anchor offset must exist for same-page jumps.
if (!aboutCss.includes('scroll-margin-top')) {
  failures.push('About CSS must set scroll-margin-top for fixed-header anchor offset.');
}

// Long chapter labels must be allowed to wrap (no nowrap) so they do not cross the rail.
if (aboutCss.includes('white-space: nowrap')) {
  failures.push('About CSS must not force era headings to a single line (nowrap).');
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

if (!aboutCss.includes('.about-chapter-nav') || !aboutCss.includes('.arc-item')) {
  failures.push('About CSS must support the chapter nav and editorial chapter panels.');
}

if ((aboutHtml.match(/class="arc-item-label"/g) || []).length !== 5) {
  failures.push('About page must attach a visible label block to each professional-background chapter.');
}

if (aboutHtml.includes('class="arc-index"') || aboutCss.includes('.arc-index')) {
  failures.push('About chapter panels must not render decorative numeric indexes.');
}

if (!aboutHtml.includes('class="advisory-brand"') || !aboutHtml.includes('class="advisory-accent"')) {
  failures.push('About page must visually distinguish Bediner Advisory inside the relationship line.');
}

if (aboutHtml.includes('timeline-orb') || aboutCss.includes('timeline-orb')) {
  failures.push('About page must not retain the obsolete decorative timeline orbs.');
}

if (aboutHtml.includes('<ul') || aboutHtml.includes('<ol')) {
  failures.push('About professional-background narrative must remain prose, not bullets.');
}

if (aboutHtml.includes('class="arc-item"') && !aboutCss.includes('border: 1px solid var(--border-color)')) {
  failures.push('About chapter panels must use the shared border token.');
}

if (!aboutCss.includes('@media (prefers-reduced-motion: reduce)')) {
  failures.push('About chapter motion must include a reduced-motion treatment.');
}

if (!aboutCss.includes('overflow-wrap: break-word')) {
  failures.push('About chapter headings must be allowed to wrap at narrow widths.');
}

if (failures.length > 0) {
  failures.forEach((message) => console.error(`FAIL: ${message}`));
  process.exit(1);
}

console.log('PASS: about redesign and global footer attribution checks passed.');
