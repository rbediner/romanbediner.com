/**
 * Invariant:
 * - The canonical Agentic Fleet Build Guide PDF must remain a 24-page,
 *   self-contained construction manual with a matching visual preview.
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
const generatorDir = path.join(root, 'scripts', 'asset-generation', 'agentic-fleet-build-guide');
const previewRenderer = path.join(generatorDir, 'render_preview.py');
// Page content lives across the entry point plus its page modules, so the
// content contract must read all of them or it silently protects nothing.
const generatorSources = [
  'generate_agentic_fleet_build_guide.py',
  'kit.py',
  'pages_b.py',
  'pages_c.py',
].map((name) => path.join(generatorDir, name));

function fail(message) {
  console.error(`FAIL: ${message}`);
  process.exit(1);
}

if (!fs.existsSync(pdfPath)) fail('canonical PDF is missing');
if (!fs.existsSync(previewRenderer)) fail('build-guide preview renderer is missing');

const pdf = fs.readFileSync(pdfPath);
const header = pdf.subarray(0, 5).toString('ascii');
if (header !== '%PDF-') fail('artifact is not a PDF');
for (let index = 1; index <= 24; index += 1) {
  const filename = `slide-${String(index).padStart(2, '0')}.png`;
  const previewPath = path.join(slidesDir, filename);
  if (!fs.existsSync(previewPath)) fail(`preview page is missing: ${filename}`);
  if (fs.statSync(previewPath).size < 10_000) fail(`preview page is unexpectedly small: ${filename}`);
}

// Keep this contract portable: GitHub's runner does not ship Poppler/pdfinfo.
// The generated PDF stores its Info dictionary and Page tree uncompressed, so
// validate those durable PDF structures directly without an OS-level tool.
const pdfText = pdf.toString('latin1');
const rendererSource = fs.readFileSync(previewRenderer, 'utf8');
if (!rendererSource.includes('pdftoppm') || !rendererSource.includes('artifactSha256')) {
  fail('preview renderer must lock carousel images to the canonical PDF');
}
generatorSources.forEach((file) => {
  if (!fs.existsSync(file)) fail(`build-guide generator source is missing: ${path.basename(file)}`);
});
const generator = generatorSources.map((file) => fs.readFileSync(file, 'utf8')).join('\n');
if (!/\/Title \(Agentic Fleet Build Guide\)/.test(pdfText)) {
  fail('PDF metadata is missing the approved artifact title');
}
if (!/\/Count 24\s+\/Kids \[/.test(pdfText)) fail('PDF does not report twenty-four pages');

// The guide must stay practical. These anchors protect the first-agent
// construction contract rather than allowing a return to high-level philosophy.
// The guide must stay a step-by-step build, in plain language, covering how an
// agent is actually made to run by itself. These anchors exist because the
// previous edition was a topic-ordered reference that never mentioned cron.
[
  // it is a sequence of sessions, not a list of topics
  'SESSION',
  'DO THIS',
  'YOU SHOULD SEE',
  'SAY THIS',
  // autonomy, which the previous edition omitted entirely
  'Cron',
  'cron expression',
  'day of week',
  'UTC',
  'daylight',
  'stop button',
  'PARKED',
  // the controls
  'Inbound Inquiry',
  'docs/PRD.md',
  '.agent/personality.md',
  'run record',
  'run twice',
  'Model routing',
  'Caching',
  'Hivemind',
  'Observability',
  'Bounded self-healing',
  'Evaluation and QA',
  'Staff Engineer',
  'Agent Builder Starter Prompt',
].forEach((phrase) => {
  if (!generator.includes(phrase)) fail(`build-guide source is missing required content: ${phrase}`);
});

console.log('PASS: Agentic Fleet Build Guide artifact contract');
