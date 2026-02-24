#!/usr/bin/env node
/**
 * Home hero layout regression guardrails.
 * Prevents reintroducing inline direction/alignment overrides that created large vertical gaps.
 */
const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..', '..');
const homepagePath = path.join(root, 'index.html');
const homeCssPath = path.join(root, 'styles', 'home.css');
const html = fs.readFileSync(homepagePath, 'utf8');
const homeCss = fs.readFileSync(homeCssPath, 'utf8');

const failures = [];

const heroMatch = html.match(/<section class="home-hero section"[^>]*>([\s\S]*?)<\/section>/i);
if (!heroMatch) {
  failures.push('Missing hero section in index.html.');
} else {
  const heroHtml = heroMatch[1];

  // Guard against the exact inline styles that previously caused vertical spacing breakage.
  if (/direction\s*:\s*rtl/i.test(heroHtml)) {
    failures.push('Hero section contains forbidden "direction: rtl" override.');
  }

  if (/align-items\s*:\s*flex-end/i.test(heroHtml)) {
    failures.push('Hero section contains forbidden "align-items: flex-end" override.');
  }

  // Guard for required structural hooks used by shared CSS layout rules.
  if (!/class="hero-grid"/i.test(heroHtml)) {
    failures.push('Hero section is missing required ".hero-grid" container.');
  }

  if (!/class="hero-head"/i.test(heroHtml)) {
    failures.push('Hero section is missing required ".hero-head" container.');
  }

  if (!/class="hero-photo"/i.test(heroHtml)) {
    failures.push('Hero section is missing required ".hero-photo" container.');
  }

  if (!/class="hero-blurb"/i.test(heroHtml)) {
    failures.push('Hero section is missing required ".hero-blurb" container.');
  }

  // The support copy must remain inside the hero bio text column.
  const bioTextMatch = heroHtml.match(/<div class="hero-blurb">\s*<p>([\s\S]*?)<\/p>\s*<\/div>/i);
  if (!bioTextMatch) {
    failures.push('Unable to inspect ".hero-blurb" contents in hero section.');
  } else if (!/Former executive at The Walt Disney Company/i.test(bioTextMatch[1])) {
    failures.push('Support copy is not inside ".hero-blurb".');
  }

  // Ensure CSS keeps the hero in a deterministic grid layout.
  if (!/\.hero-grid\s*\{[\s\S]*display:\s*grid/i.test(homeCss)) {
    failures.push('Home hero CSS must keep ".hero-grid" on CSS Grid.');
  }

  if (!/\.hero-photo\s*\{[\s\S]*grid-row:\s*2/i.test(homeCss)) {
    failures.push('Home hero CSS must keep ".hero-photo" aligned to the blurb row.');
  }
}

if (failures.length > 0) {
  failures.forEach((message) => console.error(`FAIL: ${message}`));
  process.exit(1);
}

console.log('PASS: home hero layout guardrails passed.');
