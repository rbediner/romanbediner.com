#!/usr/bin/env node
/**
 * Invariant:
 * - Regression guardrails for test-home-hero-image-optimization.js.
 * Why this exists:
 * - Keeps the homepage hero image optimized and layout-stable.
 * What breaks if it fails:
 * - CI blocks deployment to prevent a large homepage media regression.
 */
/**
 * Home hero image optimization guardrails.
 * Ensures the homepage uses the lighter JPG asset with explicit dimensions.
 */
const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..', '..');
const homepagePath = path.join(root, 'index.html');
const optimizedImagePath = path.join(root, 'assets', 'images', 'website-photo.jpg');
const legacyImagePath = path.join(root, 'assets', 'images', 'website-photo.png');

const html = fs.readFileSync(homepagePath, 'utf8');
const failures = [];

if (!fs.existsSync(optimizedImagePath)) {
  failures.push('Optimized homepage photo is missing at assets/images/website-photo.jpg.');
} else {
  const optimizedSize = fs.statSync(optimizedImagePath).size;
  if (optimizedSize > 120 * 1024) {
    failures.push('Homepage hero image must stay at or below 120 KB to preserve Lighthouse headroom.');
  }
}

if (fs.existsSync(legacyImagePath)) {
  failures.push('Legacy homepage PNG should be removed after the JPEG optimization ships.');
}

const heroImageMatch = html.match(/<div class="master-photo">\s*<!--[\s\S]*?-->\s*<img([\s\S]*?)>\s*<\/div>/i);
if (!heroImageMatch) {
  failures.push('Unable to locate the homepage hero image markup in index.html.');
} else {
  const imageMarkup = heroImageMatch[1];

  if (!/src="assets\/images\/website-photo\.jpg"/i.test(imageMarkup)) {
    failures.push('Homepage hero image must reference assets/images/website-photo.jpg.');
  }

  if (/website-photo\.png/i.test(imageMarkup)) {
    failures.push('Homepage hero image must not reference the legacy PNG asset.');
  }

  if (!/width="541"/i.test(imageMarkup) || !/height="720"/i.test(imageMarkup)) {
    failures.push('Homepage hero image must keep explicit width and height attributes that match the optimized source asset.');
  }

  if (!/decoding="async"/i.test(imageMarkup)) {
    failures.push('Homepage hero image must enable async decoding.');
  }

  if (!/fetchpriority="high"/i.test(imageMarkup)) {
    failures.push('Homepage hero image must keep fetchpriority="high" for above-the-fold loading.');
  }
}

if (!/<link rel="preconnect" href="https:\/\/fonts\.googleapis\.com"/i.test(html)) {
  failures.push('Homepage must preconnect to fonts.googleapis.com to reduce font startup latency.');
}

if (!/<link rel="preconnect" href="https:\/\/fonts\.gstatic\.com" crossorigin/i.test(html)) {
  failures.push('Homepage must preconnect to fonts.gstatic.com with crossorigin.');
}

if (!/<link rel="preload" as="image" href="assets\/images\/website-photo\.jpg" fetchpriority="high">/i.test(html)) {
  failures.push('Homepage must preload the hero image for more stable LCP behavior.');
}

if (failures.length > 0) {
  failures.forEach((message) => console.error(`FAIL: ${message}`));
  process.exit(1);
}

console.log('PASS: home hero image optimization guardrails passed.');
