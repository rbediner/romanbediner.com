#!/usr/bin/env node
/**
 * Invariant:
 * - The Agentic AI Employees resource must describe the current autonomous
 *   organization, not the retired three-role version of the page.
 *
 * Why this exists:
 * - Protects the public narrative, roster, autonomy boundaries, and SEO
 *   contract from drifting apart as the fleet grows.
 *
 * What breaks if it fails:
 * - The page can ship with stale claims that understate or misrepresent how
 *   the autonomous engineering loop actually works.
 */
const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..', '..');
const page = fs.readFileSync(
  path.join(root, 'resources', 'agentic-ai-employees', 'index.html'),
  'utf8'
);
const hubPage = fs.readFileSync(path.join(root, 'resources', 'index.html'), 'utf8');
const resourceStyles = fs.readFileSync(path.join(root, 'styles', 'resources.css'), 'utf8');

let failures = 0;
function mustInclude(label, needle) {
  if (!page.includes(needle)) {
    failures += 1;
    console.error(`FAIL: ${label} missing: ${JSON.stringify(needle)}`);
  }
}
function mustNotInclude(label, needle) {
  if (page.includes(needle)) {
    failures += 1;
    console.error(`FAIL: ${label} unexpectedly present: ${JSON.stringify(needle)}`);
  }
}
function hubMustInclude(label, needle) {
  if (!hubPage.includes(needle)) {
    failures += 1;
    console.error(`FAIL: ${label} missing from resource hub: ${JSON.stringify(needle)}`);
  }
}

mustInclude('title', '<title>Agentic AI Employees: Fleet Control Plane Build Report</title>');
mustInclude('all-caps h1', '<h1>AGENTIC AI EMPLOYEES</h1>');
mustInclude('title deck', 'The fleet control plane');
mustInclude('audience card', 'Who This Is For');
mustInclude('condensed hero callout', 'I built and operate an eight-employee AI fleet for Agentic Society.');
mustNotInclude('duplicated hero lede', 'A fleet of autonomous AI employees that observe work');
// The hub names the downloadable artifact for what it is; “build report” was
// ambiguous once the preview and the canonical PDF became one architecture.
hubMustInclude('hub classification support', 'Flagship build report.');
hubMustInclude('hub fleet action', 'Explore the fleet');
mustInclude('SEO phrase', 'autonomous code review');
mustInclude('Project Manager roster card', 'Agent | Project Manager');
mustInclude('Chief of Staff roster card', 'Agent | Chief of Staff');
mustInclude('Director roster card', 'Agent | Director of Fleet Orchestration &amp; Engineering');
mustInclude('Continuous Improvement Engineer roster card', 'Agent | Continuous Improvement Engineer');
mustInclude('Staff Engineer roster card', 'Agent | Staff Engineer');
mustInclude('RevOps Engineer roster card', 'Agent | RevOps Engineer');
mustInclude('AI Correspondent roster card', 'Agent | AI Correspondent');
mustInclude('Solution Architect roster card', 'Agent | Solution Architect');
mustInclude('field guide title', 'The Agentic Fleet Control Plane');
mustInclude('Hivemind coordination layer', 'Hivemind gives the fleet shared context');
mustInclude('public Hivemind playbook', 'https://swarmsystem.ai/playbook/hive-mind/');
mustInclude('org chart', 'fleet-org-chart');
mustInclude('autonomy model', 'class="fleet-autonomy-grid"');
mustInclude('engineering loop', 'fleet-engineering-flow');
mustInclude('model router section', 'id="fleet-router"');
mustInclude('model routing tiers', 'fleet-router-map');
mustInclude('model routing explanation', 'model choice becomes an operational policy');
mustInclude('case study proof panel', 'class="fleet-proof-grid"');
mustInclude('reliability loop', 'fleet-reliability-loop');
mustInclude('Anthropic cost reporting', 'Anthropic cost snapshots');
mustInclude('router job examples', 'Typical jobs: Staff Engineer review, merge decision, production recovery.');
mustInclude('build report framing', 'A working system');
mustInclude('section orientation rail', 'class="fleet-section-nav"');
mustInclude('persistent section navigation source', 'data-section-nav');
mustInclude('persistent section navigation script', 'section-nav.js');
mustInclude('seven-stage lifecycle copy', 'The same seven stages run every time.');
mustInclude('minimal recipe framing', 'A minimal recipe for building one');
mustInclude('independent review boundary', 'no single agent writes, approves, and ships its own change');
mustInclude('production recovery', 'automatically reverted');
mustInclude('working-surface clarification', 'The architecture extends from human-facing work surfaces all the way to verified production.');
if (!resourceStyles.includes('margin: 24px 0 2px;')) {
  failures += 1;
  console.error('FAIL: mobile architecture case-study stamp needs separation from the caption.');
}

mustNotInclude('retired roster headline', 'Two doers and an operator');
mustNotInclude('overbroad human approval claim', 'Nothing consequential ships without a human');
mustNotInclude('banned phrase', 'Why it matters');
mustNotInclude('em dash entity', '&mdash;');

if (failures > 0) {
  process.exit(1);
}

console.log('PASS: Agentic AI Employees narrative and autonomy contracts passed.');
