#!/usr/bin/env node
/**
 * Invariant:
 * - Shared transition blocks and section handoff styling must stay consistent across the revised pages.
 * Why this exists:
 * - Protects the cross-page visual rhythm that ties the content system together.
 * What breaks if it fails:
 * - CI blocks deployment to prevent section-transition regressions.
 */
const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..', '..');
const homeHtml = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const frameworkHtml = fs.readFileSync(path.join(root, 'framework/index.html'), 'utf8');
const siteCss = fs.readFileSync(path.join(root, 'styles/site.css'), 'utf8');

const failures = [];

if (!homeHtml.includes('class="next-page-nav home-next-page-nav container"')) {
  failures.push('Homepage must keep one next-page-nav block.');
}

if (!homeHtml.includes('class="nav-label">About</span>') || !homeHtml.includes('href="/about/"')) {
  failures.push('Homepage transition block must link to /about/ with label About.');
}

if (!frameworkHtml.includes('Explore Service Models') || !frameworkHtml.includes('href="/services/"')) {
  failures.push('Framework transition block must still link to /services/.');
}

if (!siteCss.includes('.next-page-nav') || !siteCss.includes('.sr-only')) {
  failures.push('Shared transition styles must remain in site.css.');
}

if (failures.length > 0) {
  failures.forEach((message) => console.error(`FAIL: ${message}`));
  process.exit(1);
}

console.log('PASS: transition block structure and shared-style contract checks passed.');
