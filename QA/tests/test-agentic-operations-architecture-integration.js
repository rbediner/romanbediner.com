/**
 * Invariant:
 * - The artifact, page CTAs, preview carousel, and GA4 download attributes
 *   must point to the same canonical resource.
 *
 * Why this exists:
 * - Keeps the staged website experience and the downloadable artifact aligned
 *   while preserving the resource analytics contract.
 *
 * What breaks if it fails:
 * - Visitors can see stale previews, download the wrong file, or produce
 *   incomplete Google Analytics download events.
 */

const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..', '..');
const aiPagePath = path.join(root, 'resources', 'agentic-ai-employees', 'index.html');
const hubPath = path.join(root, 'resources', 'index.html');
const pdfPath = path.join(root, 'assets', 'downloads', 'agentic-operations-architecture-roman-bediner.pdf');
const slidesDir = path.join(root, 'assets', 'resources', 'agentic-operations-architecture', 'slides');

const aiPage = fs.readFileSync(aiPagePath, 'utf8');
const hub = fs.readFileSync(hubPath, 'utf8');
const artifactPath = '/assets/downloads/agentic-operations-architecture-roman-bediner.pdf';

function fail(message) {
  console.error(`FAIL: ${message}`);
  process.exit(1);
}

if (!fs.existsSync(pdfPath)) fail('canonical artifact PDF is missing');
for (let index = 1; index <= 10; index += 1) {
  const filename = `slide-${String(index).padStart(2, '0')}.png`;
  if (!fs.existsSync(path.join(slidesDir, filename))) {
    fail(`preview slide is missing: ${filename}`);
  }
}

[
  'data-resource-slug="agentic-ai-employees"',
  'data-resource-title="Agentic AI Employees"',
  'data-resource-type="reference_architecture_build_report"',
  'data-resource-location="agentic_fleet_page"',
  'data-track-pdf-download',
  `data-file-path="${artifactPath}"`,
  'Agentic Operations Architecture',
  'Take the architecture with you.',
  'Preview the architecture',
  'Download the architecture',
  'resources-analytics.js',
  'resource-collapsible-preview',
  'data-carousel-unit="Page"',
  'Page 1 of 10',
  'slide-10.png',
  // The version query prevents an older cached runtime from relabeling PDF pages as slides.
  'resources-carousel.js?v=20260719',
].forEach((needle) => {
  if (!aiPage.includes(needle)) fail(`AI Employees CTA contract is missing: ${needle}`);
});

[
  'data-resource-slug="agentic-operations-architecture"',
  'data-resource-title="The Agentic Operations Architecture"',
  'data-resource-type="pdf_architecture_case_study"',
  'data-resource-location="resources_hub_preview"',
  'data-resource-carousel',
  'data-carousel-expand',
  'slide-01.png',
  'slide-10.png',
  'data-carousel-unit="Page"',
  'Page 1 of 10',
  `data-file-path="${artifactPath}"`,
  'resources-carousel.js?v=20260719',
].forEach((needle) => {
  if (!hub.includes(needle)) fail(`Resources hub preview contract is missing: ${needle}`);
});

if ((hub.match(/data-carousel-slide/g) || []).length !== 10) {
  fail('Resources hub preview must contain exactly ten carousel pages');
}

if ((aiPage.match(/data-carousel-slide/g) || []).length !== 10) {
  fail('Agentic AI Employees collapsible preview must contain exactly ten carousel pages');
}

console.log('PASS: Agentic Operations Architecture staging integration contract');
