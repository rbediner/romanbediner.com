#!/usr/bin/env node
/**
 * Purpose:
 * - Run lightweight browser smoke checks against the live production or preview site.
 *
 * Architectural role:
 * - Extends deploy-time smoke coverage into real browser behavior for mobile nav,
 *   JS hotspots, analytics bootstrap, and alignment-sensitive UI contracts.
 *
 * Dependencies:
 * - Node.js built-ins and scripts/qa/run-browser-smoke.js.
 *
 * Security/CSP considerations:
 * - Read-only live-site verification only.
 *
 * Migration considerations:
 * - Keep scope defaults aligned with the highest-risk live routes.
 */

const path = require('path');
const { execFileSync } = require('child_process');

const ROOT = path.resolve(__dirname, '..', '..');
const RUNNER = path.join(ROOT, 'scripts', 'qa', 'run-browser-smoke.js');

function main() {
  const baseUrl = process.env.RB_LIVE_URL || 'https://romanbediner.com';
  const scopes = process.env.RB_LIVE_BROWSER_SCOPES || 'home,framework,connect';

  execFileSync(process.execPath, [RUNNER, '--base-url', baseUrl, '--scopes', scopes, '--label', 'live-smoke'], {
    cwd: ROOT,
    stdio: 'inherit',
    env: process.env
  });
}

if (require.main === module) {
  try {
    main();
  } catch (error) {
    process.stderr.write(`FAIL: ${error.message}\n`);
    process.exit(1);
  }
}

module.exports = {
  RUNNER
};
