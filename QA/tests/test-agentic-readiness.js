#!/usr/bin/env node
/**
 * Invariant:
 * - Public machine-readable guidance, recovery, privacy, and contact semantics remain available.
 * Why this exists:
 * - These source-level improvements make the public website understandable and recoverable for AI agents.
 * What breaks if it fails:
 * - CI blocks a release that silently removes the documented agent-readiness surfaces.
 */
const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..', '..');
const read = (relativePath) => fs.readFileSync(path.join(root, relativePath), 'utf8');
const failures = [];

const llms = read('llms.txt');
for (const requiredText of ['## When to use this site', 'https://romanbediner.com/connect/', 'https://romanbediner.com/privacy/', 'roman@romanbediner.com', 'Do not invent any other email address']) {
  if (!llms.includes(requiredText)) failures.push(`llms.txt is missing required guidance: ${requiredText}`);
}

const robots = read('robots.txt');
if (!robots.includes('Agent-guide: https://romanbediner.com/llms.txt')) failures.push('robots.txt must advertise the public agent guide.');

const notFound = read('404.html');
for (const route of ['/sitemap.xml', '/llms.txt', '/connect/']) {
  if (!notFound.includes(`href="${route}"`)) failures.push(`404.html must offer a recovery link to ${route}.`);
}
if (!notFound.includes('name="robots" content="noindex"')) failures.push('404.html must remain noindex.');

const privacyPath = path.join(root, 'privacy', 'index.html');
if (!fs.existsSync(privacyPath)) {
  failures.push('/privacy/ must exist as a public trust-anchor page.');
} else {
  const privacy = read('privacy/index.html');
  for (const requiredText of ['<h1 class="page-title">Privacy</h1>', 'Information submitted through the contact form', 'Service providers and analytics', 'https://romanbediner.com/privacy/']) {
    if (!privacy.includes(requiredText)) failures.push(`privacy/index.html is missing required content: ${requiredText}`);
  }
  if (privacy.length < 3000) failures.push('privacy/index.html must contain substantive public privacy information.');
}

const connect = read('connect/index.html');
if (!connect.includes('"@type": "ContactPage"')) failures.push('/connect/ must publish ContactPage structured data.');
if (!connect.includes('"url": "https://romanbediner.com/connect/"')) failures.push('/connect/ structured data must retain the canonical contact route.');

const sitemap = read('sitemap.xml');
if (!sitemap.includes('<loc>https://romanbediner.com/privacy/</loc>')) failures.push('sitemap.xml must include /privacy/.');

if (failures.length) {
  failures.forEach((failure) => console.error(`FAIL: ${failure}`));
  process.exit(1);
}

console.log('PASS: agent-readiness public surfaces are present and connected.');
