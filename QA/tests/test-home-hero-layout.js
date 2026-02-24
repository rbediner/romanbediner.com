#!/usr/bin/env node
/**
 * Home hero layout regression guardrails.
 * Prevents reintroducing inline direction/alignment overrides that created large vertical gaps.
 */
const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..', '..');
const homepagePath = path.join(root, 'index.html');
const html = fs.readFileSync(homepagePath, 'utf8');

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

  if (!/class="hero-copy"/i.test(heroHtml)) {
    failures.push('Hero section is missing required ".hero-copy" container.');
  }

  if (!/class="hero-media"/i.test(heroHtml)) {
    failures.push('Hero section is missing required ".hero-media" container.');
  }

  // The support copy must remain in the text column so it is not aligned to image bottom.
  const copyMatch = heroHtml.match(/<div class="hero-copy">([\s\S]*?)<\/div>/i);
  if (!copyMatch) {
    failures.push('Unable to inspect ".hero-copy" contents in hero section.');
  } else if (!/Former executive at The Walt Disney Company/i.test(copyMatch[1])) {
    failures.push('Support copy is not inside ".hero-copy"; it must remain under the subhead.');
  }
}

if (failures.length > 0) {
  failures.forEach((message) => console.error(`FAIL: ${message}`));
  process.exit(1);
}

console.log('PASS: home hero layout guardrails passed.');
