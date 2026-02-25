#!/usr/bin/env node
/**
 * Design-system architecture guardrail for About/Services:
 * - shared tokens/components are defined in site.css
 * - page CSS files do not reintroduce root tokens or !important overrides
 * - About/Services use the shared shelf callout structure
 */
const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..', '..');
const siteCss = fs.readFileSync(path.join(root, 'styles/site.css'), 'utf8');
const aboutCss = fs.readFileSync(path.join(root, 'styles/about.css'), 'utf8');
const servicesCss = fs.readFileSync(path.join(root, 'styles/services.css'), 'utf8');
const aboutHtml = fs.readFileSync(path.join(root, 'about/index.html'), 'utf8');
const servicesHtml = fs.readFileSync(path.join(root, 'services/index.html'), 'utf8');

let failures = 0;

for (const sharedNeedle of [
  '--brand-tint:',
  '--text-primary:',
  '--text-secondary:',
  '.container,\n.about-container',
  '.page-title',
  '.shelf-callout',
  '.shelf-border',
  '.shelf-content',
  '.brand-highlight',
  '.section-divider'
]) {
  if (!siteCss.includes(sharedNeedle)) {
    failures += 1;
    console.error(`FAIL: styles/site.css is missing shared design token/component ${sharedNeedle}`);
  }
}

for (const marker of ['class="shelf-callout"', 'class="shelf-border"', 'class="shelf-content"']) {
  if (!aboutHtml.includes(marker)) {
    failures += 1;
    console.error(`FAIL: About page is missing shared callout marker ${marker}`);
  }
  if (!servicesHtml.includes(marker)) {
    failures += 1;
    console.error(`FAIL: Services page is missing shared callout marker ${marker}`);
  }
}

for (const [file, content] of [
  ['styles/about.css', aboutCss],
  ['styles/services.css', servicesCss]
]) {
  if (/!important/.test(content)) {
    failures += 1;
    console.error(`FAIL: ${file} must not contain !important overrides.`);
  }
  if (/\:root\s*\{/.test(content)) {
    failures += 1;
    console.error(`FAIL: ${file} must not redefine root design tokens.`);
  }
  if (/\.container\s*\{/.test(content)) {
    failures += 1;
    console.error(`FAIL: ${file} must not redefine container width/padding.`);
  }
}

if (failures > 0) {
  process.exit(1);
}

console.log('PASS: shared design-system architecture checks passed.');
