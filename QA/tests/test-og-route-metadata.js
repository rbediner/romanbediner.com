#!/usr/bin/env node
/**
 * Invariant:
 * - Regression guardrails for test-og-route-metadata.js.
 * Why this exists:
 * - Prevents architectural drift in routing, analytics, CSP, metadata, or shared UI contracts.
 * What breaks if it fails:
 * - CI blocks deployment to prevent production regressions.
 */
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
    ogTitle: 'Roman Bediner | AI-Enabled Operations & Execution Systems',
    ogDescription: 'Roman Bediner designs AI-enabled operations, execution systems, and engineering operating models that productize operations for scalable platform execution architecture.'
  },
  {
    file: 'about/index.html',
    canonical: 'https://romanbediner.com/about/',
    ogTitle: 'About | AI-Enabled Operations Leadership',
    ogDescription: 'Leadership background building AI-enabled operations, execution systems, and engineering operating models that productize operations across complex organizations.'
  },
  {
    file: 'services/index.html',
    canonical: 'https://romanbediner.com/services/',
    ogTitle: 'Services | AI-Enabled Operations & Operating Models',
    ogDescription: 'Operating model design, execution systems leadership, and platform execution architecture for organizations productizing operations in AI-enabled environments.'
  },
  {
    file: 'framework/index.html',
    canonical: 'https://romanbediner.com/framework/',
    ogTitle: 'Framework | AI-Enabled Operations Framework',
    ogDescription: 'The AI-Enabled Operations Framework for productizing operations through Opportunity, Design, Integration, Execution, Signals, and Evolution.'
  },
  {
    file: 'resources/index.html',
    canonical: 'https://romanbediner.com/resources/',
    ogTitle: 'Resources | AI-Enabled Operations Artifacts',
    ogDescription: 'Curated resources for the AI-Enabled Operations Framework, beginning with the downloadable framework summary and expanding to additional public artifacts over time.'
  },
  {
    file: 'resources/ai-enabled-operations-framework-summary/index.html',
    canonical: 'https://romanbediner.com/resources/ai-enabled-operations-framework-summary/',
    ogTitle: 'AI-Enabled Operations Framework Summary',
    ogDescription: 'A concise, downloadable overview of the six-stage framework for productizing operations in modern AI-enabled environments.'
  },
  {
    file: 'connect/index.html',
    canonical: 'https://romanbediner.com/connect/',
    ogTitle: 'Connect | AI-Enabled Operations Advisory',
    ogDescription: 'Start a conversation about AI-enabled operations, execution systems, engineering operating models, or platform execution architecture.'
  },
  {
    file: 'resources/ai-enabled-operations-dashboard/index.html',
    canonical: 'https://romanbediner.com/resources/ai-enabled-operations-dashboard/',
    ogTitle: 'AI-Enabled Operations Dashboard',
    ogDescription: 'An interactive, single-screen dashboard prototype for AI-enabled operating visibility, structured execution, and faster review in modern AI-enabled work.'
  },
  {
    file: 'resources/pasteflow/index.html',
    canonical: 'https://romanbediner.com/resources/pasteflow/',
    ogTitle: 'PasteFlow Chrome Extension | Human-Like Auto Typer for Web Editors',
    ogDescription: 'PasteFlow is a Chrome extension for controlled, human-rhythm typed input in web editors, forms, surveys, and browser-based workflows. A product proof point for AI-enabled operations.'
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

  // Guardrail: old Insights phrase must not appear in Framework metadata.
  if (page.file === 'framework/index.html') {
    const metadataValues = [
      ogTitle || '',
      ogDescription || '',
      twitterTitle || '',
      twitterDescription || '',
      metaDescription || ''
    ].join(' ');
    if (/Short operational essays/i.test(metadataValues)) {
      failures += 1;
      console.error('FAIL: legacy phrase "Short operational essays" remains in Framework metadata');
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
