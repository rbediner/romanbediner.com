#!/usr/bin/env node
/**
 * Home hero layout regression guardrails.
 * Prevents geometry regressions in the master-grid layout.
 */
const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..', '..');
const homepagePath = path.join(root, 'index.html');
const homeCssPath = path.join(root, 'styles', 'home.css');
const html = fs.readFileSync(homepagePath, 'utf8');
const homeCss = fs.readFileSync(homeCssPath, 'utf8');

const failures = [];

const mainMatch = html.match(/<main class="page-main">([\s\S]*?)<section class="semantic-authority"/i);
if (!mainMatch) {
  failures.push('Missing page-main content block in index.html.');
} else {
  const mainHtml = mainMatch[1];

  // Guard against the exact inline styles that previously caused vertical spacing breakage.
  if (/direction\s*:\s*rtl/i.test(mainHtml)) {
    failures.push('Home main contains forbidden "direction: rtl" override.');
  }

  if (/align-items\s*:\s*flex-end/i.test(mainHtml)) {
    failures.push('Home main contains forbidden "align-items: flex-end" override.');
  }

  // Guard for required structural hooks used by master-grid layout rules.
  if (!/class="container master-layout-grid"/i.test(mainHtml)) {
    failures.push('Home main is missing required ".master-layout-grid" container.');
  }

  if (!/class="master-head"/i.test(mainHtml)) {
    failures.push('Home main is missing required ".master-head" container.');
  }

  if (!/class="master-photo"/i.test(mainHtml)) {
    failures.push('Home main is missing required ".master-photo" container.');
  }

  if (!/class="master-blurb"/i.test(mainHtml)) {
    failures.push('Home main is missing required ".master-blurb" container.');
  }

  // The support copy must remain inside the hero bio text column.
  const bioTextMatch = mainHtml.match(/<div class="master-blurb">\s*<p>([\s\S]*?)<\/p>\s*<\/div>/i);
  if (!bioTextMatch) {
    failures.push('Unable to inspect ".master-blurb" contents in home main.');
  } else if (!/The Walt Disney Company/i.test(bioTextMatch[1])) {
    failures.push('Support copy text in ".master-blurb" no longer matches expected Disney anchor.');
  }

  // Ensure key content blocks keep expected IDs.
  if (!/id="experience"/i.test(mainHtml)) {
    failures.push('Missing #experience block.');
  }
  if (!/id="areas-of-focus"/i.test(mainHtml)) {
    failures.push('Missing #areas-of-focus block.');
  }
  if (!/id="operating-principles"/i.test(mainHtml)) {
    failures.push('Missing #operating-principles block.');
  }

  // Ensure CSS keeps the home in deterministic master-grid layout.
  if (!/\.master-layout-grid\s*\{[\s\S]*display:\s*grid/i.test(homeCss)) {
    failures.push('Home CSS must keep ".master-layout-grid" on CSS Grid.');
  }

  if (!/\.master-head\s*\{[\s\S]*grid-column:\s*1\s*\/\s*-1/i.test(homeCss)) {
    failures.push('Home CSS must keep ".master-head" spanning both grid columns.');
  }

  if (!/\.master-layout-grid\s*\{[\s\S]*row-gap:\s*56px/i.test(homeCss)) {
    failures.push('Home CSS must keep ".master-layout-grid" row-gap at 56px.');
  }

  if (!/\.master-photo\s*\{[\s\S]*grid-row:\s*2/i.test(homeCss)) {
    failures.push('Home CSS must keep ".master-photo" starting on row 2.');
  }

  if (!/\.master-blurb\s*\{[\s\S]*grid-row:\s*2/i.test(homeCss)) {
    failures.push('Home CSS must keep ".master-blurb" on row 2.');
  }

  if (!/#experience\.master-section\s*\{[\s\S]*grid-column:\s*1/i.test(homeCss)) {
    failures.push('Home CSS must keep "#experience" in left grid column.');
  }

  if (!/#areas-of-focus\.master-section\s*\{[\s\S]*grid-column:\s*1/i.test(homeCss)) {
    failures.push('Home CSS must keep "#areas-of-focus" in left grid column.');
  }
}

if (failures.length > 0) {
  failures.forEach((message) => console.error(`FAIL: ${message}`));
  process.exit(1);
}

console.log('PASS: home hero layout guardrails passed.');
