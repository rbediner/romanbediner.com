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
 * Test: homepage contains Person and WebSite JSON-LD, and Insights page contains complete Article JSON-LD entries.
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

const insightsPath = path.resolve(__dirname, '..', '..', 'insights', 'index.html');
const insightsHtml = fs.readFileSync(insightsPath, 'utf8');
const insightsSchemaMatch = insightsHtml.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/i);

if (!insightsSchemaMatch) {
  console.error('FAIL: no JSON-LD block found on insights page.');
  process.exit(1);
}

let insightsSchema;
try {
  insightsSchema = JSON.parse(insightsSchemaMatch[1]);
} catch (error) {
  console.error('FAIL: insights JSON-LD is not valid JSON.');
  process.exit(1);
}

const graph = insightsSchema['@graph'];
if (!Array.isArray(graph) || graph.length !== 5) {
  console.error('FAIL: insights JSON-LD must include exactly 5 Article entries.');
  process.exit(1);
}

for (const article of graph) {
  if (article['@type'] !== 'Article') {
    console.error('FAIL: insights JSON-LD graph includes non-Article entry.');
    process.exit(1);
  }
  if (!article.headline || !article.description || !article.author || !article.datePublished || !article.dateModified || !article.mainEntityOfPage || !article.keywords || !article.about) {
    console.error('FAIL: insights Article JSON-LD missing required fields.');
    process.exit(1);
  }
}

console.log('PASS: insights Article schema is present and complete.');
