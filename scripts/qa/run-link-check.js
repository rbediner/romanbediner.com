#!/usr/bin/env node
/**
 * Purpose:
 * - Crawl internal links and fail on broken responses.
 * Architectural role:
 * - CI quality gate to prevent 404 regressions before deployment.
 * Dependencies:
 * - Node.js runtime, npx, and linkinator package availability.
 * Security/CSP considerations:
 * - Read-only crawling against local preview URL.
 * Migration considerations:
 * - Keep default concurrency conservative for CI stability.
 */
const { spawnSync } = require('child_process');

const TARGET = process.env.LINK_CHECK_TARGET || 'http://127.0.0.1:4173';
const CONCURRENCY = process.env.LINK_CHECK_CONCURRENCY || '10';

function fail(message) {
  process.stderr.write(`FAIL: ${message}\n`);
  process.exit(1);
}

const result = spawnSync(
  'npx',
  [
    '--yes',
    'linkinator',
    TARGET,
    '--recurse',
    '--concurrency',
    CONCURRENCY,
    '--silent',
    '--skip',
    'mailto:.*,tel:.*'
  ],
  {
    stdio: 'inherit',
    env: { ...process.env, TMPDIR: process.env.TMPDIR || '/tmp' }
  }
);

if (result.status !== 0) {
  fail(`linkinator failed with status ${result.status}`);
}

process.stdout.write(
  [
    'PASS: internal link validation passed.',
    `- Target: ${TARGET}`,
    `- Concurrency: ${CONCURRENCY}`
  ].join('\n') + '\n'
);
