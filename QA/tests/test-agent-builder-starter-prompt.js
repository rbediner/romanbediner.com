#!/usr/bin/env node
/**
 * Invariant:
 * - The Agent Builder Starter Prompt is a real, downloadable construction
 *   contract available from both the flagship page and Resources hub.
 *
 * Why this exists:
 * - The starter must remain a practical path to a first cloud-run AI employee,
 *   not regress into a high-level resource description or a dead download.
 *
 * What breaks if it fails:
 * - A visitor loses the copy-ready build artifact, its safety boundaries, or
 *   the ability to reach it from the two established resource surfaces.
 */
const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..', '..');
const artifactPath = path.join(root, 'assets', 'downloads', 'agent-builder-starter-prompt.md');
const flagshipPath = path.join(root, 'resources', 'agentic-ai-employees', 'index.html');
const hubPath = path.join(root, 'resources', 'index.html');
const copyRuntimePath = path.join(root, 'scripts', 'runtime', 'agent-builder-starter-prompt.js');

function fail(message) {
  console.error(`FAIL: ${message}`);
  process.exit(1);
}

if (!fs.existsSync(artifactPath)) fail('starter prompt Markdown artifact is missing');
if (!fs.existsSync(copyRuntimePath)) fail('starter prompt copy runtime is missing');

const artifact = fs.readFileSync(artifactPath, 'utf8');
const flagship = fs.readFileSync(flagshipPath, 'utf8');
const hub = fs.readFileSync(hubPath, 'utf8');
const copyRuntime = fs.readFileSync(copyRuntimePath, 'utf8');
const publicPath = '/assets/downloads/agent-builder-starter-prompt.md';

[
  '# Agent Builder Starter Prompt',
  'one job, one source, one output, one approver',
  '## 2. A completed example: Inbound Inquiry Brief',
  'docs/PRD.md',
  '.agent/personality.md',
  '.agent/skills/',
  '.agent/evals/',
  'Cloud runtime contract',
  'Model routing and cache policy',
  'Nothing fails silently.',
  'Fail closed',
  'idempotency key',
  'Launch gate',
  'The master prompt: paste this into your build assistant',
  'INTERVIEW ME FIRST',
  'YOUR FIRST REPLY',
  'ONE question per message',
  'DECIDED',
  'ASSUMED',
  'HOW WE BUILD TOGETHER',
  'THE STAGES',
  'provider timeout',
  'duplicate trigger',
  'access denied',
  'rejected output',
  'deploy, merge your own change, alter permissions, use new secrets, spend money',
].forEach((needle) => {
  if (!artifact.includes(needle)) fail(`starter prompt is missing practical contract: ${needle}`);
});

[flagship, hub].forEach((page, index) => {
  const surface = index === 0 ? 'flagship page' : 'Resources hub';
  [
    publicPath,
    'Download the starter prompt',
    'Copy the starter prompt',
    'data-track-resource-download',
    `data-file-path="${publicPath}"`,
    `data-copy-resource="${publicPath}"`,
  ].forEach((needle) => {
    if (!page.includes(needle)) fail(`${surface} is missing starter prompt access: ${needle}`);
  });
});

[
  'fetches a same-origin, static text asset only',
  "document.querySelectorAll('[data-copy-resource]')",
  "window.fetch(resourcePath, { credentials: 'same-origin' })",
  'navigator.clipboard.writeText',
].forEach((needle) => {
  if (!copyRuntime.includes(needle)) fail(`copy runtime is missing safe behavior: ${needle}`);
});

if (artifact.includes('swarmsystem.ai') || artifact.includes('github.com/Agentic-Society-LLC')) {
  fail('starter prompt must not publish external Hivemind or internal fleet links');
}

console.log('PASS: Agent Builder Starter Prompt contract');
