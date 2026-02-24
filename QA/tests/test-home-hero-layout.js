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
  if (!/class="hero-grid"/i.test(heroHtml)) {
    failures.push('Hero section is missing required ".hero-grid" container.');
  }

  if (!/class="hero-head"/i.test(heroHtml)) {
    failures.push('Hero section is missing required ".hero-head" container.');
  }

  if (!/class="hero-support"/i.test(heroHtml)) {
    failures.push('Hero section is missing required ".hero-support" container.');
  }

  if (!/class="hero-media"/i.test(heroHtml)) {
    failures.push('Hero section is missing required ".hero-media" container.');
  }

  // The support copy must remain in the text column so it is not aligned to image bottom.
  const supportMatch = heroHtml.match(/<div class="hero-support">([\s\S]*?)<\/div>/i);
  if (!supportMatch) {
    failures.push('Unable to inspect ".hero-support" contents in hero section.');
  } else if (!/Former executive at The Walt Disney Company/i.test(supportMatch[1])) {
    failures.push('Support copy is not inside ".hero-support".');
  }

  // Ensure the desktop grid areas keep support copy and media in the same row.
  if (!/grid-template-areas:\s*"head spacer"\s*"support media"/i.test(homeCss)) {
    failures.push('Home hero CSS must keep "support media" on the same grid row.');
  }
}

if (failures.length > 0) {
  failures.forEach((message) => console.error(`FAIL: ${message}`));
  process.exit(1);
}

console.log('PASS: home hero layout guardrails passed.');
