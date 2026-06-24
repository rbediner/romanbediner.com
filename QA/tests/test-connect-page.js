#!/usr/bin/env node
/**
 * Invariant:
 * - Connect page must preserve the approved conversation framing, CTA copy, and retained contact form.
 * Why this exists:
 * - Protects the conversion flow and keeps the new connect narrative aligned with the live route contract.
 * What breaks if it fails:
 * - CI blocks deployment to prevent connect-page content or structure regressions.
 */
const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..', '..');
const connectHtml = fs.readFileSync(path.join(root, 'connect', 'index.html'), 'utf8');
const connectCss = fs.readFileSync(path.join(root, 'styles', 'connect.css'), 'utf8');

const failures = [];

const requiredCopy = [
  '<h1>Start a Conversation</h1>',
  'The most useful conversations begin with a real operating challenge.',
  'That may involve executive or embedded operating leadership, a complex transformation or strategic initiative, AI enablement, or the development of a stronger operator.',
  'The work is most relevant when execution has become fragmented, ownership is unclear, systems no longer support the pace of the business, or AI needs to be integrated into real workflows with greater discipline.',
  'A short note describing the context, the challenge, and the type of support being considered is enough to begin.',
  'Email Roman',
  'Connect on LinkedIn'
];

for (const phrase of requiredCopy) {
  if (!connectHtml.includes(phrase)) {
    failures.push(`Connect page missing required copy: ${phrase}`);
  }
}

if (!connectHtml.includes('id="form-card"')) {
  failures.push('Connect page must keep the existing email form action target.');
}

if (!connectHtml.includes('https://www.linkedin.com/in/romanbediner')) {
  failures.push('Connect page must keep the existing LinkedIn destination.');
}

const removedCopy = [
  'How we might connect',
  'Many conversations start with a simple exchange of ideas rather than a defined engagement.',
  'Brainstorming ideas, exchanging perspectives, or connecting across networks'
];

for (const phrase of removedCopy) {
  if (connectHtml.includes(phrase)) {
    failures.push(`Connect page still includes removed legacy copy: ${phrase}`);
  }
}

if (!connectCss.includes('.connect-main::before') || !connectCss.includes('.connect-main::after')) {
  failures.push('Connect page must keep ambient background styling.');
}

if (failures.length > 0) {
  failures.forEach((message) => console.error(`FAIL: ${message}`));
  process.exit(1);
}

console.log('PASS: connect conversation section and orb bullet integration checks passed.');
