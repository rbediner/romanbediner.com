#!/usr/bin/env node
/**
 * Invariant:
 * - Framework hub and all framework brief pages must reference `/styles/framework.css` with a shared `?v=` token.
 * Why this exists:
 * - Production CDN/browser caches can retain stale shared CSS and break page behavior after HTML updates.
 * What breaks if it fails:
 * - Deploys can publish new framework page markup while old CSS remains cached, causing visual/regression mismatches.
 */

const fs = require('fs');
const path = require('path');
const assert = require('assert');

const root = path.resolve(__dirname, '..', '..');

const frameworkPages = [
  'framework/index.html',
  'framework/opportunity/productizing-operations/index.html',
  'framework/design/operations-as-product/index.html',
  'framework/integration/ai-operating-layer/index.html',
  'framework/execution/operational-lanes/index.html',
  'framework/signals/operational-signals/index.html',
  'framework/evolution/agentic-guardrails/index.html',
];

const frameworkCssPattern = /href="\/styles\/framework\.css\?v=([A-Za-z0-9._-]+)"/;

const versions = new Set();

for (const relPath of frameworkPages) {
  const absPath = path.join(root, relPath);
  const html = fs.readFileSync(absPath, 'utf8');
  const match = html.match(frameworkCssPattern);
  assert(
    match,
    `${relPath} must include cache-busted framework stylesheet link: /styles/framework.css?v=<version>`
  );
  versions.add(match[1]);
}

assert(
  versions.size === 1,
  `Framework pages must share one framework.css cache-bust token. Found: ${Array.from(versions).join(', ')}`
);

console.log(`PASS: framework.css cache-bust token is enforced across hub + brief pages (${Array.from(versions)[0]}).`);
