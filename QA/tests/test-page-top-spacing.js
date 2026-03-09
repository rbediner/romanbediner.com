#!/usr/bin/env node
/**
 * Invariant:
 * - Global page-to-header spacing is owned by styles/site.css via --page-top-spacing.
 * - Connect page must not reintroduce page-level top offset overrides.
 * Why this exists:
 * - Prevents vertical drift where /connect/ starts lower than other canonical pages.
 * What breaks if it fails:
 * - Cross-page visual alignment and spacing consistency regress.
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..', '..');
const siteCss = fs.readFileSync(path.join(ROOT, 'styles', 'site.css'), 'utf8');
const connectCss = fs.readFileSync(path.join(ROOT, 'styles', 'connect.css'), 'utf8');

function fail(message) {
  console.error(`FAIL: ${message}`);
  process.exit(1);
}

if (!/--page-top-spacing\s*:\s*72px\s*;/m.test(siteCss)) {
  fail('styles/site.css must define --page-top-spacing: 72px.');
}

if (!/\.page-main,\s*[\s\S]*\.connect-main,\s*[\s\S]*body\s*>\s*main\s*\{[\s\S]*padding-top:\s*var\(--page-top-spacing\)/m.test(siteCss)) {
  fail('styles/site.css must apply --page-top-spacing to canonical main containers.');
}

if (/\.section\s*\{[^}]*margin\s*:\s*72px\s+0\s*;/m.test(connectCss)) {
  fail('styles/connect.css must not define a generic .section { margin: 72px 0; } override.');
}

if (/\.connect-main\s*\{[^}]*padding-top\s*:/m.test(connectCss)) {
  fail('styles/connect.css must not set connect-main padding-top; global spacing token owns this.');
}

if (/\.contact-hero\s*\{[^}]*margin-top\s*:/m.test(connectCss)) {
  fail('styles/connect.css must not set contact-hero margin-top; section rhythm should be inherited.');
}

console.log('PASS: global page-top spacing and connect spacing override checks passed.');
