#!/usr/bin/env node
/**
 * Invariant:
 * - Regression guardrails for test-jsonld-schema.js.
 * Why this exists:
 * - Prevents architectural drift in routing, analytics, CSP, metadata, or shared UI contracts.
 * What breaks if it fails:
 * - CI blocks deployment to prevent production regressions.
 */
/**
 * Test: homepage contains Person and WebSite JSON-LD, and Framework page contains CreativeWork JSON-LD.
 */
const fs = require('fs');
const path = require('path');

const homepage = path.resolve(__dirname, '..', '..', 'index.html');
const html = fs.readFileSync(homepage, 'utf8');
const matches = [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/gi)];

if (matches.length === 0) {
  console.error('FAIL: no JSON-LD blocks found on homepage.');
  process.exit(1);
}

let homepageSchemas;
try {
  homepageSchemas = matches.map((match) => JSON.parse(match[1]));
} catch (error) {
  console.error('FAIL: homepage JSON-LD contains invalid JSON.');
  process.exit(1);
}

const personSchema = homepageSchemas.find((schema) => schema['@type'] === 'Person');
const websiteSchema = homepageSchemas.find((schema) => schema['@type'] === 'WebSite');

if (!personSchema) {
  console.error('FAIL: homepage must include a Person JSON-LD block.');
  process.exit(1);
}
if (!websiteSchema) {
  console.error('FAIL: homepage must include a WebSite JSON-LD block.');
  process.exit(1);
}

const requiredPerson = ['@context', '@type', 'name', 'url', 'jobTitle', 'description', 'sameAs', 'knowsAbout'];
for (const key of requiredPerson) {
  if (!(key in personSchema)) {
    console.error(`FAIL: homepage schema missing field ${key}.`);
    process.exit(1);
  }
}

for (const topic of ['AI-enabled operations', 'execution systems', 'engineering operating models', 'productizing operations']) {
  if (!Array.isArray(personSchema.knowsAbout) || !personSchema.knowsAbout.includes(topic)) {
    console.error(`FAIL: homepage Person schema must include knowsAbout topic "${topic}".`);
    process.exit(1);
  }
}

const requiredWebsite = ['@context', '@type', 'name', 'url', 'description', 'about', 'publisher'];
for (const key of requiredWebsite) {
  if (!(key in websiteSchema)) {
    console.error(`FAIL: homepage WebSite schema missing field ${key}.`);
    process.exit(1);
  }
}

if (!Array.isArray(websiteSchema.about) || websiteSchema.about.length < 4) {
  console.error('FAIL: homepage WebSite schema must include an about array of expertise topics.');
  process.exit(1);
}

console.log('PASS: homepage Person and WebSite schema are present and complete.');

const insightsPath = path.resolve(__dirname, '..', '..', 'framework', 'index.html');
const insightsHtml = fs.readFileSync(insightsPath, 'utf8');
const insightsSchemaMatch = insightsHtml.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/i);

if (!insightsSchemaMatch) {
  console.error('FAIL: no JSON-LD block found on framework page.');
  process.exit(1);
}

let insightsSchema;
try {
  insightsSchema = JSON.parse(insightsSchemaMatch[1]);
} catch (error) {
  console.error('FAIL: framework JSON-LD is not valid JSON.');
  process.exit(1);
}

if (insightsSchema['@type'] !== 'CreativeWork') {
  console.error('FAIL: framework JSON-LD must be CreativeWork.');
  process.exit(1);
}

if (!insightsSchema.name || !insightsSchema.description || !insightsSchema.url || !insightsSchema.creator) {
  console.error('FAIL: framework CreativeWork JSON-LD missing required top-level fields.');
  process.exit(1);
}

if (!Array.isArray(insightsSchema.hasPart) || insightsSchema.hasPart.length !== 6) {
  console.error('FAIL: framework CreativeWork JSON-LD must include six stage entries in hasPart.');
  process.exit(1);
}

for (const stage of insightsSchema.hasPart) {
  if (stage['@type'] !== 'CreativeWork' || !stage.name || !stage.description) {
    console.error('FAIL: framework stage entry in hasPart is missing required CreativeWork fields.');
    process.exit(1);
  }
}

console.log('PASS: framework CreativeWork schema is present and complete.');
