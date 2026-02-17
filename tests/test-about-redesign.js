#!/usr/bin/env node
/**
 * Test: About page hybrid redesign structure and global footer attribution.
 */
const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const aboutHtml = fs.readFileSync(path.join(root, 'about/index.html'), 'utf8');
const siteCss = fs.readFileSync(path.join(root, 'styles/site.css'), 'utf8');
const aboutCss = fs.readFileSync(path.join(root, 'styles/about.css'), 'utf8');

const canonicalPages = [
  'index.html',
  'about/index.html',
  'services/index.html',
  'connect/index.html',
  'about/insights/index.html'
];

const footerLine = 'This site was developed with automated coding assistance from OpenAI Codex and complementary modern AI tooling.';
let failures = 0;

if (!aboutHtml.includes('<main class="container about-main">')) {
  failures += 1;
  console.error('FAIL: About page is missing the about-main container.');
}

const requiredSections = ['about-hero', 'about-timeline', 'about-thesis', 'about-ai', 'about-today'];
for (const section of requiredSections) {
  if (!aboutHtml.includes(`class="section ${section}"`)) {
    failures += 1;
    console.error(`FAIL: About page is missing section ${section}.`);
  }
}

if ((aboutHtml.match(/class="timeline-item"/g) || []).length !== 3) {
  failures += 1;
  console.error('FAIL: About timeline must include exactly 3 timeline items.');
}

if ((aboutHtml.match(/<ul class="service-list">/g) || []).length < 5) {
  failures += 1;
  console.error('FAIL: About page should use shared service-list bullets across sections.');
}

if (!aboutHtml.includes('certified Project Management Professional')) {
  failures += 1;
  console.error('FAIL: About page is missing PMP credential statement.');
}

if (!aboutCss.includes('.about-main') || !aboutCss.includes('.timeline') || !aboutCss.includes('.operating-thesis-card')) {
  failures += 1;
  console.error('FAIL: About CSS is missing required redesign style blocks.');
}

if (!siteCss.includes('.footer-meta')) {
  failures += 1;
  console.error('FAIL: global footer-meta style is missing in styles/site.css.');
}

for (const rel of canonicalPages) {
  const html = fs.readFileSync(path.join(root, rel), 'utf8');
  if (!html.includes(footerLine) || !html.includes('class="footer-meta"')) {
    failures += 1;
    console.error(`FAIL: footer attribution line missing in ${rel}`);
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
