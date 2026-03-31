#!/usr/bin/env node
/**
 * Invariant:
 * - Browser smoke must ignore only the known third-party CSP-blocked beacon noise.
 * Why this exists:
 * - Prevents live smoke from failing on a non-app script that CSP is already
 *   blocking, while keeping real runtime errors release-blocking.
 * What breaks if it fails:
 * - Production deploy smoke becomes noisy or dangerously permissive.
 */
const path = require('path');

const { shouldIgnoreRuntimeIssue } = require(path.resolve(
  __dirname,
  '..',
  '..',
  'scripts',
  'qa',
  'run-browser-smoke.js'
));

function assert(condition, message) {
  if (!condition) {
    console.error(`FAIL: ${message}`);
    process.exit(1);
  }
}

const cspBlockedCloudflareIssue =
  "console:error: Loading the script 'https://static.cloudflareinsights.com/beacon.min.js/v8c78df7c7c0f484497ecbca7046644da1771523124516' violates the following Content Security Policy directive: \"script-src 'self' https://cdn.jsdelivr.net https://cdn.quilljs.com https://www.emailjs.com https://www.googletagmanager.com\".";

const realAppIssue = 'console:error: Uncaught ReferenceError: frameworkStageState is not defined';

assert(
  shouldIgnoreRuntimeIssue(cspBlockedCloudflareIssue) === true,
  'browser smoke must ignore the known Cloudflare CSP-blocked beacon error'
);

assert(
  shouldIgnoreRuntimeIssue(realAppIssue) === false,
  'browser smoke must not ignore real application runtime errors'
);

console.log('PASS: browser smoke runtime filter guardrails passed.');
