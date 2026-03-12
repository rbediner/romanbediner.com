#!/usr/bin/env node
/**
 * Purpose:
 * - Generate README architecture diagram and machine-readable JSON from a single model source.
 * Architectural role:
 * - Prevents documentation drift between narrative docs and machine-readable architecture contracts.
 * Dependencies:
 * - Node.js built-ins only.
 * Security/CSP considerations:
 * - Documentation-only mutation; no runtime/browser behavior changes.
 * Migration considerations:
 * - Keep marker labels stable to preserve automated updates.
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..', '..');
const README_PATH = path.join(ROOT, 'README.md');
const MODEL_PATH = path.join(ROOT, 'docs', 'architecture', 'environment-model.json');

const DIAGRAM_START = '<!-- ENVIRONMENT_DIAGRAM_START -->';
const DIAGRAM_END = '<!-- ENVIRONMENT_DIAGRAM_END -->';

function toMermaid(diagram) {
  const lines = ['```mermaid', 'flowchart LR'];

  for (const node of diagram.nodes) {
    lines.push(`  ${node.id}["${node.label}"]`);
  }
  for (const edge of diagram.edges) {
    const edgeLabel = edge.label ? `|"${edge.label}"|` : '';
    lines.push(`  ${edge.from} -->${edgeLabel} ${edge.to}`);
  }

  lines.push('```');
  return lines.join('\n');
}

function renderDiagramBlock(model) {
  const mermaid = toMermaid(model.diagram);
  return [
    DIAGRAM_START,
    `### ${model.diagram.title}`,
    mermaid,
    DIAGRAM_END
  ].join('\n');
}

function renderMachineReadableSection(model) {
  const jsonText = JSON.stringify(model.machine_readable_summary, null, 2);
  return ['## Machine-Readable Architecture Summary', '```json', jsonText, '```'].join('\n');
}

function replaceMachineReadableSection(readmeText, model) {
  const newSection = renderMachineReadableSection(model);
  const sectionPattern = /## Machine-Readable Architecture Summary\n[\s\S]*?(?=\n## |$)/;
  if (!sectionPattern.test(readmeText)) {
    throw new Error('README is missing "## Machine-Readable Architecture Summary" section.');
  }
  return readmeText.replace(sectionPattern, newSection);
}

function replaceDiagramBlock(readmeText, model) {
  const block = renderDiagramBlock(model);
  if (readmeText.includes(DIAGRAM_START) && readmeText.includes(DIAGRAM_END)) {
    const pattern = new RegExp(`${DIAGRAM_START}[\\s\\S]*?${DIAGRAM_END}`);
    return readmeText.replace(pattern, block);
  }

  const insertionMarker = '## Technical Specification';
  if (!readmeText.includes(insertionMarker)) {
    throw new Error('README is missing "## Technical Specification" heading required for diagram insertion.');
  }

  return readmeText.replace(insertionMarker, `${block}\n\n${insertionMarker}`);
}

function main() {
  const args = new Set(process.argv.slice(2));
  const writeMode = args.has('--write');
  const checkMode = args.has('--check');

  if (!writeMode && !checkMode) {
    throw new Error('Usage: node scripts/docs/generate-environment-diagram.js --write|--check');
  }

  const readmeText = fs.readFileSync(README_PATH, 'utf8');
  const model = JSON.parse(fs.readFileSync(MODEL_PATH, 'utf8'));

  const withDiagram = replaceDiagramBlock(readmeText, model);
  const nextReadme = replaceMachineReadableSection(withDiagram, model);

  if (checkMode) {
    if (nextReadme !== readmeText) {
      throw new Error('README architecture diagram/JSON is out of date. Run npm run docs:generate.');
    }
    process.stdout.write('PASS: README architecture diagram and JSON are up to date.\n');
    return;
  }

  fs.writeFileSync(README_PATH, nextReadme);
  process.stdout.write('PASS: README architecture diagram and JSON regenerated from docs/architecture/environment-model.json.\n');
}

if (require.main === module) {
  try {
    main();
  } catch (error) {
    process.stderr.write(`FAIL: ${error.message}\n`);
    process.exit(1);
  }
}

module.exports = {
  renderDiagramBlock,
  renderMachineReadableSection,
  replaceDiagramBlock,
  replaceMachineReadableSection,
  toMermaid
};
