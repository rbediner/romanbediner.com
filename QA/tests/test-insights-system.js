#!/usr/bin/env node
/**
 * Invariant:
 * - Framework route and insights redirect must remain aligned.
 * Why this exists:
 * - Prevents broken migration from /insights/ to /framework/.
 * What breaks if it fails:
 * - CI blocks deployment when route migration or schema contracts drift.
 */
const assert = require('assert');
const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..', '..');
const frameworkHtml = fs.readFileSync(path.join(root, 'framework/index.html'), 'utf8');
const redirectHtml = fs.readFileSync(path.join(root, 'insights/index.html'), 'utf8');

function assertNoLegacyToggle() {
  assert(!frameworkHtml.includes('insight-toggle'), 'Framework must not include insight-toggle controls.');
  assert(!frameworkHtml.includes('brief-content'), 'Framework must not include collapsible brief-content containers.');
}

function assertStageAnchors() {
  const ids = ['opportunity', 'design', 'integration', 'execution', 'signals', 'evolution'];
  for (const id of ids) {
    assert(frameworkHtml.includes(`id="${id}"`), `Missing framework section id ${id}.`);
    assert(frameworkHtml.includes(`href="#${id}"`), `Missing framework stage link #${id}.`);
  }
}

function assertFrameworkSchema() {
  const match = frameworkHtml.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/i);
  assert(match, 'Framework page must include JSON-LD schema.');
  const parsed = JSON.parse(match[1]);
  assert(parsed['@type'] === 'CreativeWork', 'Framework JSON-LD must be CreativeWork.');
  assert(Array.isArray(parsed.hasPart), 'Framework JSON-LD must include hasPart array.');
  assert(parsed.hasPart.length === 6, 'Framework JSON-LD must include exactly six stages.');
}

function assertInsightsRedirect() {
  assert(redirectHtml.includes('http-equiv="refresh"'), '/insights/ must include meta refresh redirect.');
  assert(redirectHtml.includes('url=/framework/'), '/insights/ redirect must target /framework/.');
  assert(redirectHtml.includes('rel="canonical" href="https://romanbediner.com/framework/"'), '/insights/ redirect must preserve canonical to /framework/.');
}

function run() {
  assertNoLegacyToggle();
  assertStageAnchors();
  assertFrameworkSchema();
  assertInsightsRedirect();
  console.log('PASS: framework route and redirect contracts passed.');
}

run();
