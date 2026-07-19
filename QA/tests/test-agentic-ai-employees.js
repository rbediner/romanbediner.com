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

mustInclude('title', '<title>Agentic AI Employees: From Request to Production</title>');
mustInclude('all-caps h1', '<h1>AGENTIC AI EMPLOYEES</h1>');
mustInclude('title deck', 'From request to production');
mustInclude('audience card', 'Who This Is For');
mustInclude('SEO phrase', 'autonomous code review');
mustInclude('Project Manager roster card', 'Agent: Project Manager');
mustInclude('Chief of Staff roster card', 'Agent: Chief of Staff');
mustInclude('Director roster card', 'Agent: Director of Fleet Orchestration &amp; Engineering');
mustInclude('Continuous Improvement Engineer roster card', 'Agent: Continuous Improvement Engineer');
mustInclude('Staff Engineer roster card', 'Agent: Staff Engineer');
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

mustNotInclude('retired roster headline', 'Two doers and an operator');
mustNotInclude('overbroad human approval claim', 'Nothing consequential ships without a human');
mustNotInclude('banned phrase', 'Why it matters');
mustNotInclude('em dash entity', '&mdash;');

if (failures > 0) {
  process.exit(1);
}

console.log('PASS: Agentic AI Employees narrative and autonomy contracts passed.');
