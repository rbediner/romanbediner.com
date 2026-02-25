#!/usr/bin/env node
/**
 * Route-level OG/Twitter metadata contract checks.
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..', '..');
const OG_IMAGE = 'https://romanbediner.com/assets/og-logo/og-final.png?v=4';
// Shared OG image alt text must match the production metadata contract across pages.
const OG_ALT = 'Roman Bediner brand mark on editorial gradient background';

const expected = [
  {
    file: 'index.html',
    canonical: 'https://romanbediner.com/',
    ogTitle: 'Roman Bediner | Productizing Operations for AI-Enabled Organizations',
    ogDescription: 'Roman Bediner designs AI-enabled operating models that align product, engineering, finance, and customer teams into scalable execution systems.'
  },
  {
    file: 'about/index.html',
    canonical: 'https://romanbediner.com/about/',
    ogTitle: 'Roman Bediner | Operating Philosophy & Leadership Background',
    ogDescription: 'Operating philosophy and leadership background of a global operations executive specializing in productized execution systems and AI-enabled delivery models.'
  },
  {
    file: 'services/index.html',
    canonical: 'https://romanbediner.com/services/',
    ogTitle: 'Operating Model Design & AI-Enabled Execution Systems | Roman Bediner',
    ogDescription: 'Operating model design, embedded leadership, and AI-enabled execution systems that scale product and engineering organizations with measurable accountability.'
  },
  {
    file: 'insights/index.html',
    canonical: 'https://romanbediner.com/insights/',
    ogTitle: 'Working Briefs on AI-Enabled Operations | Roman Bediner',
    ogDescription: 'Strategic working briefs on productizing operations, AI as an operating layer, and designing execution systems for modern organizations.'
  },
  {
    file: 'connect/index.html',
    canonical: 'https://romanbediner.com/connect/',
    ogTitle: 'Connect with Roman Bediner | Operating Model Advisory',
    ogDescription: 'Start a conversation about operating model design, AI-enabled systems, or embedded operational leadership.'
  }
];

function getMetaByProperty(html, name) {
  const esc = name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const matches = html.match(new RegExp(`<meta\\s+property="${esc}"\\s+content="([^"]+)"\\s*\\/?>`, 'gi')) || [];
  if (matches.length === 0) {
    return null;
  }
  const value = matches[0].match(/content="([^"]+)"/i);
  return value ? value[1] : null;
}

function getMetaByName(html, name) {
  const esc = name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const matches = html.match(new RegExp(`<meta\\s+name="${esc}"\\s+content="([^"]+)"\\s*\\/?>`, 'gi')) || [];
  if (matches.length === 0) {
    return null;
  }
  const value = matches[0].match(/content="([^"]+)"/i);
  return value ? value[1] : null;
}

function countMetaByProperty(html, name) {
  const esc = name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return (html.match(new RegExp(`<meta\\s+property="${esc}"\\s+content="[^"]+"\\s*\\/?>`, 'gi')) || []).length;
}

function countMetaByName(html, name) {
  const esc = name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return (html.match(new RegExp(`<meta\\s+name="${esc}"\\s+content="[^"]+"\\s*\\/?>`, 'gi')) || []).length;
}

let failures = 0;
const summaryRows = [];

for (const page of expected) {
  const fullPath = path.join(ROOT, page.file);
  const html = fs.readFileSync(fullPath, 'utf8');

  const canonicalMatch = html.match(/<link rel="canonical" href="([^"]+)"\s*\/?>/i);
  const ogUrl = getMetaByProperty(html, 'og:url');
  const ogTitle = getMetaByProperty(html, 'og:title');
  const ogDescription = getMetaByProperty(html, 'og:description');
  const twitterTitle = getMetaByName(html, 'twitter:title');
  const twitterDescription = getMetaByName(html, 'twitter:description');
  const metaDescription = getMetaByName(html, 'description');

  summaryRows.push({
    page: page.canonical,
    'og:title': ogTitle || 'MISSING',
    'og:description': ogDescription || 'MISSING'
  });

  const requiredProps = [
    'og:locale',
    'og:type',
    'og:url',
    'og:site_name',
    'og:title',
    'og:description',
    'og:image',
    'og:image:width',
    'og:image:height',
    'og:image:type',
    'og:image:alt'
  ];
  const requiredNames = ['twitter:card', 'twitter:title', 'twitter:description', 'twitter:image'];

  for (const prop of requiredProps) {
    if (countMetaByProperty(html, prop) !== 1) {
      failures += 1;
      console.error(`FAIL: expected exactly one ${prop} in ${page.file}`);
    }
  }
  for (const name of requiredNames) {
    if (countMetaByName(html, name) !== 1) {
      failures += 1;
      console.error(`FAIL: expected exactly one ${name} in ${page.file}`);
    }
  }

  if (!canonicalMatch || canonicalMatch[1] !== page.canonical) {
    failures += 1;
    console.error(`FAIL: canonical mismatch in ${page.file}`);
  }
  if (ogUrl !== page.canonical) {
    failures += 1;
    console.error(`FAIL: og:url mismatch in ${page.file}`);
  }
  if (ogTitle !== page.ogTitle) {
    failures += 1;
    console.error(`FAIL: og:title mismatch in ${page.file}`);
  }
  if (ogDescription !== page.ogDescription) {
    failures += 1;
    console.error(`FAIL: og:description mismatch in ${page.file}`);
  }
  if (twitterTitle !== ogTitle) {
    failures += 1;
    console.error(`FAIL: twitter:title must mirror og:title in ${page.file}`);
  }
  if (twitterDescription !== ogDescription) {
    failures += 1;
    console.error(`FAIL: twitter:description must mirror og:description in ${page.file}`);
  }
  if (!metaDescription || metaDescription !== ogDescription) {
    failures += 1;
    console.error(`FAIL: meta description must match og:description in ${page.file}`);
  }
  if (getMetaByProperty(html, 'og:image') !== OG_IMAGE) {
    failures += 1;
    console.error(`FAIL: og:image mismatch in ${page.file}`);
  }
  if (getMetaByName(html, 'twitter:image') !== OG_IMAGE) {
    failures += 1;
    console.error(`FAIL: twitter:image mismatch in ${page.file}`);
  }
  if (getMetaByProperty(html, 'og:image:width') !== '1200') {
    failures += 1;
    console.error(`FAIL: og:image:width mismatch in ${page.file}`);
  }
  if (getMetaByProperty(html, 'og:image:height') !== '630') {
    failures += 1;
    console.error(`FAIL: og:image:height mismatch in ${page.file}`);
  }
  if (getMetaByProperty(html, 'og:image:type') !== 'image/png') {
    failures += 1;
    console.error(`FAIL: og:image:type mismatch in ${page.file}`);
  }
  if (getMetaByProperty(html, 'og:image:alt') !== OG_ALT) {
    failures += 1;
    console.error(`FAIL: og:image:alt mismatch in ${page.file}`);
  }
  if (getMetaByProperty(html, 'og:locale') !== 'en_US') {
    failures += 1;
    console.error(`FAIL: og:locale mismatch in ${page.file}`);
  }
  if (getMetaByProperty(html, 'og:type') !== 'website') {
    failures += 1;
    console.error(`FAIL: og:type mismatch in ${page.file}`);
  }
  if (getMetaByProperty(html, 'og:site_name') !== 'Roman Bediner') {
    failures += 1;
    console.error(`FAIL: og:site_name mismatch in ${page.file}`);
  }
  if (getMetaByName(html, 'twitter:card') !== 'summary_large_image') {
    failures += 1;
    console.error(`FAIL: twitter:card mismatch in ${page.file}`);
  }

  // Guardrail: metadata descriptions must not include en or em dashes.
  for (const [name, value] of [
    ['meta description', metaDescription || ''],
    ['og:description', ogDescription || ''],
    ['twitter:description', twitterDescription || '']
  ]) {
    if (/[—–]/.test(value)) {
      failures += 1;
      console.error(`FAIL: ${name} contains en/em dash in ${page.file}`);
    }
  }

  // Guardrail: old Insights phrase must not appear in Insights metadata.
  if (page.file === 'insights/index.html') {
    const metadataValues = [
      ogTitle || '',
      ogDescription || '',
      twitterTitle || '',
      twitterDescription || '',
      metaDescription || ''
    ].join(' ');
    if (/Short operational essays/i.test(metadataValues)) {
      failures += 1;
      console.error('FAIL: legacy phrase "Short operational essays" remains in Insights metadata');
    }
  }
}

console.log('\nPage | og:title | og:description');
console.log('--- | --- | ---');
for (const row of summaryRows) {
  console.log(`${row.page} | ${row['og:title']} | ${row['og:description']}`);
}

if (failures > 0) {
  process.exit(1);
}

console.log('PASS: route-level OG/Twitter metadata checks passed with no duplicate tags.');
