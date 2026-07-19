/**
 * Invariant:
 * - The canonical Agentic Operations Architecture PDF must remain a ten-page,
 *   self-contained reference architecture with a matching visual preview.
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
const { spawnSync } = require('child_process');

const root = path.resolve(__dirname, '..', '..');
const pdfPath = path.join(root, 'assets', 'downloads', 'agentic-operations-architecture-roman-bediner.pdf');
const slidesDir = path.join(root, 'assets', 'resources', 'agentic-operations-architecture', 'slides');

function fail(message) {
  console.error(`FAIL: ${message}`);
  process.exit(1);
}

if (!fs.existsSync(pdfPath)) fail('canonical PDF is missing');

const pdf = fs.readFileSync(pdfPath);
const header = pdf.subarray(0, 5).toString('ascii');
if (header !== '%PDF-') fail('artifact is not a PDF');
for (let index = 1; index <= 10; index += 1) {
  const filename = `slide-${String(index).padStart(2, '0')}.png`;
  const previewPath = path.join(slidesDir, filename);
  if (!fs.existsSync(previewPath)) fail(`preview page is missing: ${filename}`);
  if (fs.statSync(previewPath).size < 10_000) fail(`preview page is unexpectedly small: ${filename}`);
}

// The artifact is supplied as the approved source PDF, so inspect its visible
// metadata instead of coupling the site to an obsolete local generator.
const pdfInfo = spawnSync('pdfinfo', [pdfPath], { encoding: 'utf8' });
if (pdfInfo.error || pdfInfo.status !== 0) fail('pdfinfo could not inspect the canonical PDF');
if (!/^Title:\s+Agentic Operations Architecture$/m.test(pdfInfo.stdout)) {
  fail('PDF metadata is missing the approved artifact title');
}
if (!/^Pages:\s+10$/m.test(pdfInfo.stdout)) fail('PDF does not report ten pages');

console.log('PASS: Agentic Operations Architecture artifact contract');
