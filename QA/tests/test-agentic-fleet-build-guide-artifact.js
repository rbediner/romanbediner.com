/**
 * Invariant:
 * - The canonical Agentic Fleet Build Guide PDF must remain a twelve-page,
 *   self-contained implementation artifact with a matching visual preview.
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
const pdfPath = path.join(root, 'assets', 'downloads', 'agentic-fleet-build-guide-roman-bediner.pdf');
const slidesDir = path.join(root, 'assets', 'resources', 'agentic-fleet-build-guide', 'slides');

function fail(message) {
  console.error(`FAIL: ${message}`);
  process.exit(1);
}

if (!fs.existsSync(pdfPath)) fail('canonical PDF is missing');

const pdf = fs.readFileSync(pdfPath);
const header = pdf.subarray(0, 5).toString('ascii');
if (header !== '%PDF-') fail('artifact is not a PDF');
for (let index = 1; index <= 12; index += 1) {
  const filename = `slide-${String(index).padStart(2, '0')}.png`;
  const previewPath = path.join(slidesDir, filename);
  if (!fs.existsSync(previewPath)) fail(`preview page is missing: ${filename}`);
  if (fs.statSync(previewPath).size < 10_000) fail(`preview page is unexpectedly small: ${filename}`);
}

// Keep this contract portable: GitHub's runner does not ship Poppler/pdfinfo.
// The generated PDF stores its Info dictionary and Page tree uncompressed, so
// validate those durable PDF structures directly without an OS-level tool.
const pdfText = pdf.toString('latin1');
if (!/\/Title \(Agentic Fleet Build Guide\)/.test(pdfText)) {
  fail('PDF metadata is missing the approved artifact title');
}
if (!/\/Count 12\s+\/Kids \[/.test(pdfText)) fail('PDF does not report twelve pages');

console.log('PASS: Agentic Fleet Build Guide artifact contract');
