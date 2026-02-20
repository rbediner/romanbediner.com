#!/usr/bin/env node
/**
 * Test: homepage contains Person JSON-LD and Insights page contains Article JSON-LD entries.
 */
const fs = require('fs');
const path = require('path');

const homepage = path.resolve(__dirname, '..', '..', 'index.html');
const html = fs.readFileSync(homepage, 'utf8');
const match = html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/i);

if (!match) {
  console.error('FAIL: no JSON-LD block found on homepage.');
  process.exit(1);
}

let schema;
try {
  schema = JSON.parse(match[1]);
} catch (error) {
  console.error('FAIL: homepage JSON-LD is not valid JSON.');
  process.exit(1);
}

const required = ['@context', '@type', 'name', 'url', 'jobTitle', 'description', 'sameAs', 'knowsAbout'];
for (const key of required) {
  if (!(key in schema)) {
    console.error(`FAIL: homepage schema missing field ${key}.`);
    process.exit(1);
  }
}

if (schema['@type'] !== 'Person') {
  console.error('FAIL: homepage schema @type must be Person.');
  process.exit(1);
}

console.log('PASS: homepage Person schema is present and complete.');

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
if (!Array.isArray(graph) || graph.length !== 4) {
  console.error('FAIL: insights JSON-LD must include exactly 4 Article entries.');
  process.exit(1);
}

for (const article of graph) {
  if (article['@type'] !== 'Article') {
    console.error('FAIL: insights JSON-LD graph includes non-Article entry.');
    process.exit(1);
  }
  if (!article.headline || !article.mainEntityOfPage || !article.dateModified) {
    console.error('FAIL: insights Article JSON-LD missing required fields.');
    process.exit(1);
  }
}

console.log('PASS: insights Article schema is present and complete.');
