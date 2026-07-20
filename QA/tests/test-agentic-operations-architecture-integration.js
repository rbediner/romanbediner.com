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
const crypto = require('crypto');

const root = path.resolve(__dirname, '..', '..');
const aiPagePath = path.join(root, 'resources', 'agentic-ai-employees', 'index.html');
const hubPath = path.join(root, 'resources', 'index.html');
const resourcesCssPath = path.join(root, 'styles', 'resources.css');
const pdfPath = path.join(root, 'assets', 'downloads', 'agentic-operations-architecture-roman-bediner.pdf');
const slidesDir = path.join(root, 'assets', 'resources', 'agentic-operations-architecture', 'slides');
const previewManifestPath = path.join(root, 'assets', 'resources', 'agentic-operations-architecture', 'preview-manifest.json');

const aiPage = fs.readFileSync(aiPagePath, 'utf8');
const hub = fs.readFileSync(hubPath, 'utf8');
const resourcesCss = fs.readFileSync(resourcesCssPath, 'utf8');
const artifactPath = '/assets/downloads/agentic-operations-architecture-roman-bediner.pdf';

function sha256(filePath) {
  return crypto.createHash('sha256').update(fs.readFileSync(filePath)).digest('hex');
}

function fail(message) {
  console.error(`FAIL: ${message}`);
  process.exit(1);
}

if (!fs.existsSync(pdfPath)) fail('canonical artifact PDF is missing');
if (!fs.existsSync(previewManifestPath)) fail('preview manifest is missing');
const previewManifest = JSON.parse(fs.readFileSync(previewManifestPath, 'utf8'));
if (previewManifest.artifact !== artifactPath || previewManifest.artifactSha256 !== sha256(pdfPath)) {
  fail('preview manifest must identify the exact canonical architecture PDF');
}
for (let index = 1; index <= 10; index += 1) {
  const filename = `slide-${String(index).padStart(2, '0')}.png`;
  const slidePath = path.join(slidesDir, filename);
  if (!fs.existsSync(slidePath)) {
    fail(`preview slide is missing: ${filename}`);
  }
  if (previewManifest.pages?.[filename] !== sha256(slidePath)) {
    fail(`preview slide is not rendered from the locked canonical artifact: ${filename}`);
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
  'data-resource-card="agentic-ai-employees"',
  'data-resource-slug="agentic-ai-employees"',
  'data-resource-title="Agentic AI Employees"',
  'data-resource-type="reference_architecture_build_report"',
  'data-resource-location="resources_hub"',
  'resource-card-artifact-preview',
  'Preview the architecture',
  'Download the architecture',
  'Explore the Architecture',
  'Reference architecture.',
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
  fail('Agentic AI Employees card preview must contain exactly ten carousel pages');
}

// The portable PDF belongs inside the Agentic AI Employees card. A detached
// hub section breaks the agreed preview-before-download artifact hierarchy.
const cardStart = hub.indexOf('data-resource-card="agentic-ai-employees"');
const previewStart = hub.indexOf('resource-card-artifact-preview');
const detachedPreviewStart = hub.indexOf('class="resource-artifact-preview"');
if (cardStart < 0 || previewStart < cardStart || detachedPreviewStart >= 0) {
  fail('Resources hub must keep the architecture disclosure inside the Agentic AI Employees card');
}

if ((aiPage.match(/data-carousel-slide/g) || []).length !== 10) {
  fail('Agentic AI Employees collapsible preview must contain exactly ten carousel pages');
}

// The artifact title is a peer editorial heading, not compact utility copy.
if (!resourcesCss.includes('font-family: var(--font-serif);') || !resourcesCss.includes('font-size: 30px;')) {
  fail('Agentic architecture artifact title must retain the shared serif heading treatment');
}

console.log('PASS: Agentic Operations Architecture staging integration contract');
