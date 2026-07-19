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
mustInclude('h1', 'Agentic AI Employees That Move Work from Request to Production');
mustInclude('SEO phrase', 'autonomous code review');
mustInclude('Project Manager roster card', 'Agent &mdash; Project Manager');
mustInclude('Chief of Staff roster card', 'Agent &mdash; Chief of Staff');
mustInclude('Director roster card', 'Agent &mdash; Director of Fleet Orchestration &amp; Engineering');
mustInclude('Continuous Improvement Engineer roster card', 'Agent &mdash; Continuous Improvement Engineer');
mustInclude('Staff Engineer roster card', 'Agent &mdash; Staff Engineer');
mustInclude('org chart', 'class="fleet-org-chart"');
mustInclude('autonomy model', 'class="fleet-autonomy-grid"');
mustInclude('engineering loop', 'class="fleet-engineering-flow"');
mustInclude('model router section', 'id="fleet-router"');
mustInclude('model routing tiers', 'class="fleet-router-map"');
mustInclude('model routing explanation', 'model choice becomes an operational policy');
mustInclude('case study proof panel', 'class="fleet-proof-grid"');
mustInclude('reliability loop', 'class="fleet-reliability-loop"');
mustInclude('Anthropic cost reporting', 'Anthropic cost snapshots');
mustInclude('router job examples', 'Typical jobs: Staff Engineer review, merge decision, production recovery.');
mustInclude('case study framing', 'A working case study');
mustInclude('independent review boundary', 'no single agent writes, approves, and ships its own change');
mustInclude('production recovery', 'automatically reverted');
mustInclude('working-surface clarification', 'The architecture extends from human-facing work surfaces all the way to verified production.');

mustNotInclude('retired roster headline', 'Two doers and an operator');
mustNotInclude('overbroad human approval claim', 'Nothing consequential ships without a human');

if (failures > 0) {
  process.exit(1);
}

console.log('PASS: Agentic AI Employees narrative and autonomy contracts passed.');
