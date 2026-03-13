#!/usr/bin/env node
/**
 * Invariant:
 * - Regression guardrails for test-about-redesign.js.
 * Why this exists:
 * - Prevents architectural drift in routing, analytics, CSP, metadata, or shared UI contracts.
 * What breaks if it fails:
 * - CI blocks deployment to prevent production regressions.
 */
/**
 * About page contract test:
 * - manifesto-led hero structure
 * - timeline and philosophy sections
 * - global footer consistency after disclaimer removal
 */
const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..', '..');
const aboutHtml = fs.readFileSync(path.join(root, 'about/index.html'), 'utf8');
const siteCss = fs.readFileSync(path.join(root, 'styles/site.css'), 'utf8');
const aboutCss = fs.readFileSync(path.join(root, 'styles/about.css'), 'utf8');

const canonicalPages = [
  'index.html',
  'about/index.html',
  'services/index.html',
  'connect/index.html',
  'framework/index.html'
];

const footerPrimary = '© Roman Bediner, PMP';
let failures = 0;

if (!aboutHtml.includes('<main class="about-main">')) {
  failures += 1;
  console.error('FAIL: About page is missing the about-main container.');
}

// The About hero is a manifesto-led text block with a blue callout block.
const requiredContainers = [
  'class="container"',
  'class="about-hero-refactored"',
  'class="page-title"',
  'class="shelf-callout"',
  'class="shelf-border"',
  'class="shelf-content"'
];
for (const marker of requiredContainers) {
  if (!aboutHtml.includes(marker)) {
    failures += 1;
    console.error(`FAIL: About page is missing required container marker ${marker}.`);
  }
}

if (aboutHtml.includes('About Roman Bediner')) {
  failures += 1;
  console.error('FAIL: legacy "About Roman Bediner" heading should not appear in About hero.');
}

if (!aboutHtml.includes('id="professional-arc"')) {
  failures += 1;
  console.error('FAIL: About timeline section must include #professional-arc.');
}

if ((aboutHtml.match(/class="era-header"/g) || []).length !== 3) {
  failures += 1;
  console.error('FAIL: About professional arc must include exactly 3 era headers.');
}

if ((aboutHtml.match(/<ul class="service-list">/g) || []).length < 2) {
  failures += 1;
  console.error('FAIL: About page should keep shared service-list bullets in philosophy blocks.');
}

// Page-specific selectors stay in about.css.
for (const cssSelector of ['.about-hero-refactored', '.about-timeline', '.philosophy-stack']) {
  if (!aboutCss.includes(cssSelector)) {
    failures += 1;
    console.error(`FAIL: About CSS is missing page selector ${cssSelector}.`);
  }
}

// Shared selectors are centralized in site.css.
for (const sharedSelector of [
  '.container,\n.about-container',
  '.page-title',
  '.shelf-callout',
  '.shelf-border',
  '.shelf-content',
  '.lede-description',
  '.section-divider'
]) {
  if (!siteCss.includes(sharedSelector)) {
    failures += 1;
    console.error(`FAIL: site.css is missing shared selector ${sharedSelector}.`);
  }
}

if (!siteCss.includes('.footer-primary')) {
  failures += 1;
  console.error('FAIL: global footer-primary style is missing in styles/site.css.');
}
if (aboutHtml.includes('<h2>TODAY</h2>')) {
  failures += 1;
  console.error('FAIL: legacy TODAY heading should not appear in About content.');
}
if (!aboutHtml.includes('<h3>Embedded Operating Leadership</h3>')) {
  failures += 1;
  console.error('FAIL: Embedded Operating Leadership subsection is missing.');
}
if (!aboutHtml.includes('<h3>Systems Over Heroics</h3>')) {
  failures += 1;
  console.error('FAIL: Systems Over Heroics subsection is missing.');
}

for (const rel of canonicalPages) {
  const html = fs.readFileSync(path.join(root, rel), 'utf8');
  if (html.includes('This site was developed with automated coding assistance from OpenAI Codex and complementary modern AI tooling.')) {
    failures += 1;
    console.error(`FAIL: legacy footer disclaimer should be removed from ${rel}`);
  }
  if (!html.includes(footerPrimary) || !html.includes('class="footer-primary"')) {
    failures += 1;
    console.error(`FAIL: primary footer attribution missing in ${rel}`);
  }
  const htmlWithoutAllowedFooterDash = html.replace(
    '<p class="footer-quote-author">— Walt Disney</p>',
    ''
  );
  if (/—/.test(htmlWithoutAllowedFooterDash)) {
    failures += 1;
    console.error(`FAIL: em dash found in ${rel}`);
  }
}

if (failures > 0) {
  process.exit(1);
}

console.log('PASS: about redesign and global footer attribution checks passed.');
if (aboutHtml.includes('class="about-photo-wrapper"') || aboutHtml.includes('class="hero-photo"')) {
  failures += 1;
  console.error('FAIL: About hero should not include a profile photo wrapper or hero-photo image.');
}
