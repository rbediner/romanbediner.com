#!/usr/bin/env node
/**
 * Invariant:
 * - NC Courage's current public role is Fractional CTO, not the retired
 *   Chief Fractional Integration Officer title.
 * Why this exists:
 * - The visible role, schema, metadata, and service model must tell one
 *   consistent, public-safe positioning story.
 * What breaks if it fails:
 * - Public pages can reintroduce the retired title or disconnect the CTO role
 *   from its supporting technology and integration scope.
 */
const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..', '..');
const read = (relativePath) => fs.readFileSync(path.join(root, relativePath), 'utf8');
const pages = {
  homepage: read('index.html'),
  about: read('about/index.html'),
  services: read('services/index.html'),
  connect: read('connect/index.html')
};
const failures = [];

for (const [label, html] of Object.entries(pages)) {
  if (!html.includes('Fractional CTO')) {
    failures.push(`${label} must identify the current NC Courage role as Fractional CTO.`);
  }
  if (html.includes('Chief Fractional Integration Officer')) {
    failures.push(`${label} still exposes the retired NC Courage role title.`);
  }
}

if (!pages.about.includes('id="fractional-integration-leadership"')) {
  failures.push('About must preserve the established NC Courage chapter anchor.');
}
if (!pages.about.includes('FRACTIONAL CTO LEADERSHIP')) {
  failures.push('About must visibly label the NC Courage chapter as Fractional CTO Leadership.');
}
if (!pages.services.includes('Fractional CTO Leadership')) {
  failures.push('Services must visibly offer Fractional CTO Leadership.');
}
if (!pages.services.includes('Technology and integration leadership')) {
  failures.push('Services must retain technology and integration as supporting scope language.');
}
if (!pages.homepage.includes('"name": "Fractional CTO"')) {
  failures.push('Homepage Person schema must expose Fractional CTO as the current occupation.');
}

if (failures.length > 0) {
  failures.forEach((failure) => console.error(`FAIL: ${failure}`));
  process.exit(1);
}

console.log('PASS: Fractional CTO positioning is consistent across public role surfaces.');
