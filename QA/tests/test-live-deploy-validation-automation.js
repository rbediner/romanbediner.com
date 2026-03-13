#!/usr/bin/env node
/**
 * Invariant:
 * - Live deployment validators must enforce homepage and sitemap contracts.
 * Why this exists:
 * - Keeps post-deploy smoke checks deterministic and testable.
 * What breaks if it fails:
 * - Production deploy validation can become brittle or silently ineffective.
 */
const path = require('path');

const script = require(path.resolve(__dirname, '..', '..', 'scripts', 'qa', 'verify-live-production.js'));

function assert(condition, message) {
  if (!condition) {
    console.error(`FAIL: ${message}`);
    process.exit(1);
  }
}

function expectThrow(fn, message) {
  let threw = false;
  try {
    fn();
  } catch (error) {
    threw = true;
  }
  assert(threw, message);
}

assert(typeof script.validateHomepage === 'function', 'verify-live-production.js must export validateHomepage');
assert(typeof script.validateSitemap === 'function', 'verify-live-production.js must export validateSitemap');

const validHomepage = {
  response: { ok: true, status: 200 },
  text: [
    '/about/',
    '/services/',
    '/framework/',
    '/connect/',
    'application/ld+json',
    'Content-Security-Policy',
    '/scripts/runtime/ga4-bootstrap.js'
  ].join('\n')
};
script.validateHomepage(validHomepage);

expectThrow(
  () => script.validateHomepage({ response: { ok: true, status: 200 }, text: '/about/' }),
  'validateHomepage should fail when required markers are missing'
);

script.validateSitemap({ response: { ok: true, status: 200 }, text: '<urlset></urlset>' });
expectThrow(
  () => script.validateSitemap({ response: { ok: true, status: 200 }, text: '<xml></xml>' }),
  'validateSitemap should fail when <urlset> is missing'
);

console.log('PASS: live deploy validation automation checks passed.');
