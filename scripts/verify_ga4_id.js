#!/usr/bin/env node
/**
 * Verifies GA4 measurement ID usage across HTML files.
 * - Ensures canonical pages include G-DVHD0KL633 exactly once.
 * - Ensures no other GA measurement IDs are present anywhere.
 * - Reports duplicate GA source/config entries per file.
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

  const sourceCount = (html.match(new RegExp(`https://www\\.googletagmanager\\.com/gtag/js\\?id=${MEASUREMENT_ID}`, 'g')) || []).length;
  const configCount = (html.match(new RegExp(`gtag\\('config', '${MEASUREMENT_ID}'\\)`, 'g')) || []).length;

  if (sourceCount > 1 || configCount > 1) {
    failures += 1;
    console.error(`FAIL: duplicate GA snippet in ${path.relative(ROOT, file)} (source=${sourceCount}, config=${configCount})`);
  }
}

for (const page of canonicalPages) {
  if (!fs.existsSync(page)) {
    failures += 1;
    console.error(`FAIL: missing canonical page ${path.relative(ROOT, page)}`);
    continue;
  }
  const html = fs.readFileSync(page, 'utf8');
  const sourceCount = (html.match(new RegExp(`https://www\\.googletagmanager\\.com/gtag/js\\?id=${MEASUREMENT_ID}`, 'g')) || []).length;
  const configCount = (html.match(new RegExp(`gtag\\('config', '${MEASUREMENT_ID}'\\)`, 'g')) || []).length;
  if (sourceCount !== 1 || configCount !== 1) {
    failures += 1;
    console.error(`FAIL: canonical page ${path.relative(ROOT, page)} must include GA exactly once (source=${sourceCount}, config=${configCount})`);
  }
}

if (failures > 0) {
  process.exit(1);
}

console.log('PASS: GA4 measurement ID and duplication checks passed.');
