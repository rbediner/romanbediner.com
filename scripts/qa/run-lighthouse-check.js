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
const LIGHTHOUSE_ATTEMPTS = Number(process.env.LIGHTHOUSE_ATTEMPTS || 3);
const RETRY_DELAY_MS = Number(process.env.LIGHTHOUSE_RETRY_DELAY_MS || 4000);
const TARGET_WAIT_TIMEOUT_MS = Number(process.env.LIGHTHOUSE_TARGET_WAIT_TIMEOUT_MS || 30000);
const TARGET_WAIT_INTERVAL_MS = Number(process.env.LIGHTHOUSE_TARGET_WAIT_INTERVAL_MS || 1000);
const outputPrefix = path.join(os.tmpdir(), `rb-lighthouse-${Date.now()}`);

function fail(message) {
  process.stderr.write(`FAIL: ${message}\n`);
  process.exit(1);
}

function sleep(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

async function waitForTarget(url) {
  const deadline = Date.now() + TARGET_WAIT_TIMEOUT_MS;

  while (Date.now() < deadline) {
    try {
      const response = await fetch(url, { redirect: 'follow' });
      if (response.ok) {
        return true;
      }
    } catch (error) {
      // Ignore transient connection errors while waiting for the local preview server.
    }
    await sleep(TARGET_WAIT_INTERVAL_MS);
  }

  return false;
}

function runLighthouseOnce(outputPath) {
  const run = spawnSync(
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

  if (run.status !== 0) {
    return null;
  }

  if (!fs.existsSync(outputPath)) {
    return null;
  }

  const report = JSON.parse(fs.readFileSync(outputPath, 'utf8'));
  return {
    performance: Math.round((report.categories.performance.score || 0) * 100),
    accessibility: Math.round((report.categories.accessibility.score || 0) * 100)
  };
}

function median(values) {
  if (!values.length) {
    return 0;
  }
  const sorted = [...values].sort((a, b) => a - b);
  const middle = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 0
    ? Math.round((sorted[middle - 1] + sorted[middle]) / 2)
    : sorted[middle];
}

function evaluateScores(runScores, thresholds) {
  const performanceValues = runScores.map((score) => score.performance);
  const accessibilityValues = runScores.map((score) => score.accessibility);
  const performanceMedian = median(performanceValues);
  const accessibilityMedian = median(accessibilityValues);

  return {
    performanceMedian,
    accessibilityMedian,
    pass:
      performanceMedian >= thresholds.minPerformance &&
      accessibilityMedian >= thresholds.minAccessibility
  };
}

async function main() {
  const ready = await waitForTarget(TARGET);
  if (!ready) {
    fail(`target did not become reachable within ${TARGET_WAIT_TIMEOUT_MS}ms: ${TARGET}`);
  }

  const successfulRuns = [];

  for (let attempt = 1; attempt <= LIGHTHOUSE_ATTEMPTS; attempt += 1) {
    const outputPath = `${outputPrefix}-attempt-${attempt}.json`;
    const score = runLighthouseOnce(outputPath);

    if (score) {
      successfulRuns.push(score);
    }

    if (attempt < LIGHTHOUSE_ATTEMPTS) {
      await sleep(RETRY_DELAY_MS);
    }
  }

  if (!successfulRuns.length) {
    fail('lighthouse execution failed for all attempts');
  }

  const result = evaluateScores(successfulRuns, {
    minPerformance: MIN_PERFORMANCE,
    minAccessibility: MIN_ACCESSIBILITY
  });

  if (!result.pass) {
    fail(
      [
        `lighthouse medians did not meet thresholds.`,
        `- Performance median: ${result.performanceMedian} (required ${MIN_PERFORMANCE})`,
        `- Accessibility median: ${result.accessibilityMedian} (required ${MIN_ACCESSIBILITY})`,
        `- Successful attempts: ${successfulRuns.length}/${LIGHTHOUSE_ATTEMPTS}`
      ].join('\n')
    );
  }

  process.stdout.write(
    [
      'PASS: lighthouse threshold checks passed.',
      `- Target: ${TARGET}`,
      `- Performance median: ${result.performanceMedian}`,
      `- Accessibility median: ${result.accessibilityMedian}`,
      `- Successful attempts: ${successfulRuns.length}/${LIGHTHOUSE_ATTEMPTS}`
    ].join('\n') + '\n'
  );
}

if (require.main === module) {
  main().catch((error) => {
    fail(error.message || 'unexpected lighthouse validation failure');
  });
}

module.exports = {
  evaluateScores,
  median
};
