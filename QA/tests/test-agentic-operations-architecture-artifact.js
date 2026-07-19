/**
 * Invariant:
 * - The canonical Agentic Operations Architecture PDF must remain an eight-page,
 *   selectable, self-contained architecture follow-along.
 *
 * Why this exists:
 * - Protects the downloadable artifact from losing its narrative structure or
 *   becoming detached from the checked-in generator source.
 *
 * What breaks if it fails:
 * - The website can advertise a missing, malformed, or incomplete artifact.
 */

const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..', '..');
const pdfPath = path.join(root, 'assets', 'downloads', 'agentic-operations-architecture-roman-bediner.pdf');
const sourcePath = path.join(root, 'scripts', 'asset-generation', 'agentic-operations-architecture', 'generate_agentic_operations_architecture.py');

function fail(message) {
  console.error(`FAIL: ${message}`);
  process.exit(1);
}

if (!fs.existsSync(sourcePath)) fail('generation source is missing');
if (!fs.existsSync(pdfPath)) fail('canonical PDF is missing');

const pdf = fs.readFileSync(pdfPath);
const header = pdf.subarray(0, 5).toString('ascii');
if (header !== '%PDF-') fail('artifact is not a PDF');
if (!pdf.includes(Buffer.from('/Count 8'))) fail('PDF page tree does not report eight pages');

const source = fs.readFileSync(sourcePath, 'utf8');
[
  'The Agentic Operations Architecture',
  'Build autonomy that stays accountable.',
  'Roman Bediner',
  'explicit operating loops',
  'independent review',
  'recoverable execution',
].forEach((required) => {
  if (!source.includes(required)) fail(`source is missing required contract text: ${required}`);
});

console.log('PASS: Agentic Operations Architecture artifact contract');
