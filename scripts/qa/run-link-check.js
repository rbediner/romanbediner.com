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
const { URL } = require('url');

const TARGET = process.env.LINK_CHECK_TARGET || 'http://127.0.0.1:4173';
const CONCURRENCY = process.env.LINK_CHECK_CONCURRENCY || '10';
const CANONICAL_DOMAIN = process.env.LINK_CHECK_CANONICAL_DOMAIN || 'romanbediner.com';

function fail(message) {
  process.stderr.write(`FAIL: ${message}\n`);
  process.exit(1);
}

function hostFor(urlValue) {
  try {
    return new URL(urlValue).hostname.toLowerCase();
  } catch (_error) {
    return '';
  }
}

function buildSkipPattern(targetUrl, canonicalDomain) {
  const targetHost = hostFor(targetUrl);
  const domain = String(canonicalDomain || '').trim().toLowerCase();
  const patterns = ['mailto:.*', 'tel:.*', 'https?://(www\\.)?linkedin\\.com/in/romanbediner/?'];

  // Staging/local link checks should validate artifact-internal links and avoid
  // coupling to whatever is live on production canonical URLs.
  if (domain && targetHost && targetHost !== domain && targetHost !== `www.${domain}`) {
    patterns.push(`https?://(www\\.)?${domain.replace(/\./g, '\\.')}/.*`);
  }

  return patterns.join(',');
}

const skipPattern = buildSkipPattern(TARGET, CANONICAL_DOMAIN);

function main() {
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
      skipPattern
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
      `- Concurrency: ${CONCURRENCY}`,
      `- Skip pattern: ${skipPattern}`
    ].join('\n') + '\n'
  );
}

module.exports = {
  buildSkipPattern,
  hostFor
};

if (require.main === module) {
  main();
}
