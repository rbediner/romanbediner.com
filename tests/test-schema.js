#!/usr/bin/env node
/**
 * Test: homepage contains Person JSON-LD with required fields.
 */
const fs = require('fs');
const path = require('path');

const homepage = path.resolve(__dirname, '..', 'index.html');
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
