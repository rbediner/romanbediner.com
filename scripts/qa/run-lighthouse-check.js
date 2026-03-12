#!/usr/bin/env node
/**
 * Purpose:
 * - Run Lighthouse against the local static preview and enforce quality thresholds.
 * Architectural role:
 * - CI quality gate for performance and accessibility before artifact promotion.
 * Dependencies:
 * - Node.js runtime, npx, and lighthouse package availability.
 * Security/CSP considerations:
 * - Uses local preview URL only; no production mutation.
 * Migration considerations:
 * - Update thresholds only when explicitly changing quality policy.
 */
const fs = require('fs');
const os = require('os');
const path = require('path');
const { spawnSync } = require('child_process');

const TARGET = process.env.LIGHTHOUSE_TARGET || 'http://127.0.0.1:4173';
const MIN_PERFORMANCE = Number(process.env.LIGHTHOUSE_MIN_PERFORMANCE || 85);
const MIN_ACCESSIBILITY = Number(process.env.LIGHTHOUSE_MIN_ACCESSIBILITY || 90);
const outputPath = path.join(os.tmpdir(), `rb-lighthouse-${Date.now()}.json`);

function fail(message) {
  process.stderr.write(`FAIL: ${message}\n`);
  process.exit(1);
}

const lighthouseRun = spawnSync(
  'npx',
  [
    '--yes',
    'lighthouse',
    TARGET,
    '--quiet',
    '--chrome-flags=--headless=new --no-sandbox',
    '--output=json',
    `--output-path=${outputPath}`,
    '--only-categories=performance,accessibility'
  ],
  {
    stdio: 'inherit',
    env: { ...process.env, TMPDIR: process.env.TMPDIR || '/tmp' }
  }
);

if (lighthouseRun.status !== 0) {
  fail(`lighthouse execution failed with status ${lighthouseRun.status}`);
}

if (!fs.existsSync(outputPath)) {
  fail(`lighthouse output file was not created at ${outputPath}`);
}

const report = JSON.parse(fs.readFileSync(outputPath, 'utf8'));
const performance = Math.round((report.categories.performance.score || 0) * 100);
const accessibility = Math.round((report.categories.accessibility.score || 0) * 100);

if (performance < MIN_PERFORMANCE) {
  fail(`performance score ${performance} is below required ${MIN_PERFORMANCE}`);
}
if (accessibility < MIN_ACCESSIBILITY) {
  fail(`accessibility score ${accessibility} is below required ${MIN_ACCESSIBILITY}`);
}

process.stdout.write(
  [
    'PASS: lighthouse threshold checks passed.',
    `- Target: ${TARGET}`,
    `- Performance: ${performance}`,
    `- Accessibility: ${accessibility}`
  ].join('\n') + '\n'
);
