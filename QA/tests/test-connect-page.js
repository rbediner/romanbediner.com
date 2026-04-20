#!/usr/bin/env node
/**
 * Invariant:
 * - Connect page keeps a conversation-first "How we might connect" section with shared orb bullets.
 * Why this exists:
 * - Prevents drift into duplicated Services copy while preserving the shared design system.
 * What breaks if it fails:
 * - Connect page intent and visual consistency regress.
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..', '..');
const connectHtmlPath = path.join(ROOT, 'connect', 'index.html');
const connectCssPath = path.join(ROOT, 'styles', 'connect.css');
const siteCssPath = path.join(ROOT, 'styles', 'site.css');

const connectHtml = fs.readFileSync(connectHtmlPath, 'utf8');
const connectCss = fs.readFileSync(connectCssPath, 'utf8');
const siteCss = fs.readFileSync(siteCssPath, 'utf8');

function fail(message) {
  console.error(`FAIL: ${message}`);
  process.exit(1);
}

if (!connectHtml.includes('<h2 id="connect-themes-title">How we might connect</h2>')) {
  fail('Connect page is missing the "How we might connect" section heading.');
}

if (!connectHtml.includes('Many conversations start with a simple exchange of ideas rather than a defined engagement.')) {
  fail('Connect page is missing the conversation-first framing paragraph.');
}

if (!connectHtml.includes('<ul class="service-list">')) {
  fail('Connect page themes must use shared service-list orb bullets.');
}

const requiredBulletPhrases = [
  'Exploring operational challenges in product, engineering, or platform organizations',
  'Comparing notes on scaling execution in high-growth environments',
  'Leadership conversations with operators navigating growth or career transitions',
  'Execution leadership coaching for operators and emerging leaders',
  'Brainstorming ideas, exchanging perspectives, or connecting across networks'
];

for (const phrase of requiredBulletPhrases) {
  if (!connectHtml.includes(phrase)) {
    fail(`Connect page missing expected bullet theme: ${phrase}`);
  }
}

const prohibitedServiceCopy = [
  'Fractional leadership',
  'Strategic program leadership'
];

for (const phrase of prohibitedServiceCopy) {
  if (connectHtml.includes(phrase)) {
    fail(`Connect page should not include services-style offering copy: ${phrase}`);
  }
}

if (!connectCss.includes('.connect-themes-divider')) {
  fail('Connect CSS must define a subtle divider for the themes section.');
}

if (connectHtml.includes('class="footer-divider"') || connectHtml.includes('footer-divider-accent')) {
  fail('Connect page must not render an extra short footer divider element.');
}

if (connectHtml.includes('connect-page-divider') || connectCss.includes('.connect-page-divider')) {
  fail('Connect page must not keep any legacy page-divider block.');
}

if (!connectCss.includes('.connect-closing') || !connectCss.includes('.connect-expectation')) {
  fail('Connect CSS must include muted styles for closing lines.');
}

if (!connectCss.includes('.connect-main::before') || !connectCss.includes('.connect-main::after')) {
  fail('Connect CSS must keep the ambient orb pseudo-elements.');
}

if (!/\.connect-main::before\s*\{[^}]*animation:\s*floatOrb/s.test(connectCss)) {
  fail('Connect CSS must animate the primary orb with floatOrb on desktop.');
}

if (!/\.connect-main::after\s*\{[^}]*animation:\s*floatOrb/s.test(connectCss)) {
  fail('Connect CSS must animate the secondary orb with floatOrb on desktop.');
}

if (!/@media\s*\(max-width:\s*768px\)\s*\{[\s\S]*\.connect-main::before[\s\S]*\.connect-main::after[\s\S]*display:\s*none/s.test(connectCss)) {
  fail('Connect CSS must hide both ambient orb pseudo-elements on mobile (max-width: 768px).');
}

if (!/\.service-list li::before\s*\{[^}]*background-image:\s*url\("\/assets\/icons\/home\/bullet\.png"\);/s.test(siteCss)) {
  fail('Shared orb bullet source must remain /assets/icons/home/bullet.png in site.css.');
}

console.log('PASS: connect conversation section and orb bullet integration checks passed.');
