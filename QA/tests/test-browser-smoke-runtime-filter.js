#!/usr/bin/env node
/**
 * Invariant:
 * - Browser smoke must ignore only environment-level DNS noise, never CSP violations.
 * Why this exists:
 * - Prevents CI DNS flakiness from hiding real application or policy regressions.
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

const dnsResolutionIssue =
  'console:error: Failed to load resource: net::ERR_NAME_NOT_RESOLVED https://www.google-analytics.com/g/collect';

const realAppIssue = 'console:error: Uncaught ReferenceError: frameworkStageState is not defined';

assert(
  shouldIgnoreRuntimeIssue(cspBlockedCloudflareIssue) === false,
  'browser smoke must fail closed for Cloudflare CSP violations'
);

assert(
  shouldIgnoreRuntimeIssue(dnsResolutionIssue) === true,
  'browser smoke may ignore only known headless DNS-resolution noise'
);

assert(
  shouldIgnoreRuntimeIssue(realAppIssue) === false,
  'browser smoke must not ignore real application runtime errors'
);

console.log('PASS: browser smoke runtime filter guardrails passed.');
