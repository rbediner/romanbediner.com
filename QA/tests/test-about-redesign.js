#!/usr/bin/env node
/**
 * About page contract test:
 * - manifesto-led hero structure
 * - timeline and philosophy sections
 * - global footer attribution consistency
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
  'insights/index.html'
];

const footerLine = 'This site was developed with automated coding assistance from OpenAI Codex and complementary modern AI tooling.';
const footerPrimary = '© Roman Bediner, PMP';
let failures = 0;

if (!aboutHtml.includes('<main class="about-main">')) {
  failures += 1;
  console.error('FAIL: About page is missing the about-main container.');
}

// The About hero is now a manifesto + photo layout block, not a generic section heading.
const requiredContainers = [
  'class="about-container"',
  'class="about-hero"',
  'class="about-text-content"',
  'class="about-photo-wrapper"',
  'class="hero-photo"',
  'class="manifesto-h1"'
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

// Keep guardrails around the photo ratio lock and manifesto typography hooks.
for (const cssSelector of [
  'body .about-container',
  '.about-hero',
  '.about-photo-wrapper img.hero-photo',
  '.manifesto-h1',
  '.lede-primary',
  '.about-main .section:has(> #professional-arc:first-child)'
]) {
  if (!aboutCss.includes(cssSelector)) {
    failures += 1;
    console.error(`FAIL: About CSS is missing selector ${cssSelector}.`);
  }
}

if (!siteCss.includes('.footer-meta')) {
  failures += 1;
  console.error('FAIL: global footer-meta style is missing in styles/site.css.');
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
  if (!html.includes(footerLine) || !html.includes('class="footer-meta"') || !html.includes(footerPrimary) || !html.includes('class="footer-primary"')) {
    failures += 1;
    console.error(`FAIL: footer content or classes missing in ${rel}`);
  }
  if (/—/.test(html)) {
    failures += 1;
    console.error(`FAIL: em dash found in ${rel}`);
  }
}

if (failures > 0) {
  process.exit(1);
}

console.log('PASS: about redesign and global footer attribution checks passed.');
