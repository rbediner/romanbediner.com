/*
 * Purpose:
 * - Generate sitemap.xml entries from canonical route definitions.
 *
 * Architectural role:
 * - Provides deterministic search-index routing output for static hosting deployments.
 *
 * Dependencies:
 * - Node.js filesystem APIs and canonical route list maintained in this script.
 *
 * Security/CSP considerations:
 * - Build-time utility only; no browser execution and no CSP policy impact.
 *
 * Migration considerations:
 * - Keep canonical route outputs aligned with redirects/rewrite behavior on new hosting platforms.
 */
/**
 * Generates sitemap.xml for the canonical clean URLs.
 * Update PAGE_PATHS when a new top-level page is added.
 */
const fs = require('fs');
const path = require('path');

const SITE_URL = 'https://romanbediner.com';
const PAGE_PATHS = [
  { path: '/', priority: '1.0' },
  { path: '/about/', priority: '0.8' },
  { path: '/services/', priority: '0.9' },
  // Refactor: /connect/ is the only canonical route after removing /contact.
  { path: '/connect/', priority: '0.7' },
  // Canonical top-level Framework route.
  { path: '/framework/', priority: '0.6' }
];

const lastmod = new Date().toISOString().slice(0, 10);
const items = PAGE_PATHS.map((page) => {
  return [
    '  <url>',
    `    <loc>${SITE_URL}${page.path}</loc>`,
    `    <lastmod>${lastmod}</lastmod>`,
    `    <priority>${page.priority}</priority>`,
    '  </url>'
  ].join('\n');
}).join('\n');

const xml = [
  '<?xml version="1.0" encoding="UTF-8"?>',
  '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
  items,
  '</urlset>',
  ''
].join('\n');

const outPath = path.resolve(__dirname, '..', '..', 'sitemap.xml');
fs.writeFileSync(outPath, xml, 'utf8');
console.log(`Sitemap generated at ${outPath}`);
