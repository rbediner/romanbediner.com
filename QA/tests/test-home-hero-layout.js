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

const heroMatch = html.match(/<section class="hero section">([\s\S]*?)<\/section>/i);
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
  if (!/class="hero-bio"/i.test(heroHtml)) {
    failures.push('Hero section is missing required ".hero-bio" container.');
  }

  if (!/class="hero-bio-text"/i.test(heroHtml)) {
    failures.push('Hero section is missing required ".hero-bio-text" container.');
  }

  if (!/class="hero-bio-photo"/i.test(heroHtml)) {
    failures.push('Hero section is missing required ".hero-bio-photo" container.');
  }

  // The support copy must remain inside the hero bio text column.
  const bioTextMatch = heroHtml.match(/<p class="hero-bio-text">([\s\S]*?)<\/p>/i);
  if (!bioTextMatch) {
    failures.push('Unable to inspect ".hero-bio-text" contents in hero section.');
  } else if (!/Former executive at The Walt Disney Company/i.test(bioTextMatch[1])) {
    failures.push('Support copy is not inside ".hero-bio-text".');
  }

  // Ensure CSS uses top alignment for the hero bio row.
  if (!/\.hero-bio\s*\{[\s\S]*align-items:\s*flex-start/i.test(homeCss)) {
    failures.push('Home hero CSS must keep ".hero-bio" aligned with align-items: flex-start.');
  }
}

if (failures.length > 0) {
  failures.forEach((message) => console.error(`FAIL: ${message}`));
  process.exit(1);
}

console.log('PASS: home hero layout guardrails passed.');
