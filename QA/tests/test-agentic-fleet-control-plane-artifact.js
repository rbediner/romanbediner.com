/**
 * Invariant:
 * - The canonical Agentic Fleet Control Plane PDF must remain a six-page,
 *   self-contained field guide with a matching visual preview.
 *
 * Why this exists:
 * - Protects the downloadable artifact from losing its narrative structure or
 *   becoming detached from the page-by-page website preview.
 *
 * What breaks if it fails:
 * - The website can advertise a missing, malformed, or incomplete artifact.
 */

const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..', '..');
const pdfPath = path.join(root, 'assets', 'downloads', 'agentic-fleet-control-plane-roman-bediner.pdf');
const slidesDir = path.join(root, 'assets', 'resources', 'agentic-fleet-control-plane', 'slides');

function fail(message) {
  console.error(`FAIL: ${message}`);
  process.exit(1);
}

if (!fs.existsSync(pdfPath)) fail('canonical PDF is missing');

const pdf = fs.readFileSync(pdfPath);
const header = pdf.subarray(0, 5).toString('ascii');
if (header !== '%PDF-') fail('artifact is not a PDF');
for (let index = 1; index <= 6; index += 1) {
  const filename = `slide-${String(index).padStart(2, '0')}.png`;
  const previewPath = path.join(slidesDir, filename);
  if (!fs.existsSync(previewPath)) fail(`preview page is missing: ${filename}`);
  if (fs.statSync(previewPath).size < 10_000) fail(`preview page is unexpectedly small: ${filename}`);
}

// Keep this contract portable: GitHub's runner does not ship Poppler/pdfinfo.
// The generated PDF stores its Info dictionary and Page tree uncompressed, so
// validate those durable PDF structures directly without an OS-level tool.
const pdfText = pdf.toString('latin1');
if (!/\/Title \(The Agentic Fleet Control Plane\)/.test(pdfText)) {
  fail('PDF metadata is missing the approved artifact title');
}
if (!/\/Count 6\s+\/Kids \[/.test(pdfText)) fail('PDF does not report six pages');

console.log('PASS: Agentic Fleet Control Plane artifact contract');
