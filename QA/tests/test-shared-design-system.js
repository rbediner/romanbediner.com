#!/usr/bin/env node
/**
 * Invariant:
 * - Regression guardrails for test-shared-design-system.js.
 * Why this exists:
 * - Prevents architectural drift in routing, analytics, CSP, metadata, or shared UI contracts.
 * What breaks if it fails:
 * - CI blocks deployment to prevent production regressions.
 */
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

// shelf-callout removed from About and Services heroes in redesign (opens typography after H1).
// The CSS classes remain in site.css for use on Framework/Resources pages.

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