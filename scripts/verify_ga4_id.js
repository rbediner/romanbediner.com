#!/usr/bin/env node
/**
 * Verifies GA4 measurement ID usage across HTML files.
 * - Canonical pages: exactly one ga4-measurement-id meta and one /scripts/ga4.js include.
 * - All pages: no inline gtag config blocks.
 * - All pages: no GA IDs other than G-DVHD0KL633.
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const MEASUREMENT_ID = 'G-DVHD0KL633';
const canonicalPages = [
  path.join(ROOT, 'index.html'),
  path.join(ROOT, 'about', 'index.html'),
  path.join(ROOT, 'services', 'index.html'),
  path.join(ROOT, 'connect', 'index.html'),
  path.join(ROOT, 'about', 'insights', 'index.html')
];

function walkHtml(dir, out = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name === '.git' || entry.name === 'node_modules') {
      continue;
    }
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walkHtml(full, out);
    } else if (entry.isFile() && entry.name.endsWith('.html')) {
      out.push(full);
    }
  }
  return out;
}

let failures = 0;

for (const file of walkHtml(ROOT)) {
  const html = fs.readFileSync(file, 'utf8');
  const ids = html.match(/G-[A-Z0-9]{6,}/gi) || [];
  const unexpected = ids.filter((id) => id !== MEASUREMENT_ID);

  if (unexpected.length > 0) {
    failures += 1;
    console.error(`FAIL: unexpected GA ID(s) in ${path.relative(ROOT, file)}: ${unexpected.join(', ')}`);
  }

  const inlineConfigCount = (html.match(/gtag\('config'/g) || []).length;
  const inlineDataLayerCount = (html.match(/window\.dataLayer\s*=\s*window\.dataLayer/g) || []).length;
  if (inlineConfigCount > 0 || inlineDataLayerCount > 0) {
    failures += 1;
    console.error(`FAIL: inline GA script found in ${path.relative(ROOT, file)}`);
  }
}

for (const page of canonicalPages) {
  if (!fs.existsSync(page)) {
    failures += 1;
    console.error(`FAIL: missing canonical page ${path.relative(ROOT, page)}`);
    continue;
  }

  const html = fs.readFileSync(page, 'utf8');
  const metaCount = (html.match(new RegExp(`<meta name="ga4-measurement-id" content="${MEASUREMENT_ID}" \/>`, 'g')) || []).length;
  const bootstrapCount = (html.match(/<script src="\/scripts\/ga4\.js" defer><\/script>/g) || []).length;

  if (metaCount !== 1 || bootstrapCount !== 1) {
    failures += 1;
    console.error(`FAIL: canonical page ${path.relative(ROOT, page)} must include one GA meta and one GA bootstrap (meta=${metaCount}, bootstrap=${bootstrapCount})`);
  }
}

if (failures > 0) {
  process.exit(1);
}

console.log('PASS: GA4 ID and bootstrap checks passed.');
