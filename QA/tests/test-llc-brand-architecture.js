#!/usr/bin/env node
/**
 * Invariant:
 * - Bediner Advisory LLC remains a supporting legal and commercial identity.
 * Why this exists:
 * - Prevents the LLC language from disappearing from approved surfaces or
 *   leaking into the primary navigation and redirect-only pages.
 * What breaks if it fails:
 * - The public brand hierarchy or commercial disclosure contract has drifted.
 */
const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..', '..');
const fullPages = [
  'index.html', 'about/index.html', 'services/index.html', 'connect/index.html',
  'framework/index.html', 'resources/index.html',
  'resources/agentic-ai-employees/index.html',
  'resources/ai-enabled-operations-dashboard/index.html',
  'resources/ai-enabled-operations-framework-summary/index.html',
  'resources/pasteflow/index.html',
  'framework/opportunity/productizing-operations/index.html',
  'framework/design/operations-as-product/index.html',
  'framework/integration/ai-operating-layer/index.html',
  'framework/execution/operational-lanes/index.html',
  'framework/signals/operational-signals/index.html',
  'framework/evolution/agentic-guardrails/index.html'
];

let failures = 0;
for (const relativePath of fullPages) {
  const html = fs.readFileSync(path.join(root, relativePath), 'utf8');
  if (!html.includes('class="footer-identity"') || !html.includes('Advisory services delivered through Bediner Advisory LLC.')) {
    failures += 1;
    console.error(`FAIL: ${relativePath} is missing the approved LLC footer identity.`);
  }
  if (!html.includes('class="brand-name">Roman Bediner</span>')) {
    failures += 1;
    console.error(`FAIL: ${relativePath} is missing the Roman Bediner primary brand.`);
  }
}

const about = fs.readFileSync(path.join(root, 'about/index.html'), 'utf8');
const services = fs.readFileSync(path.join(root, 'services/index.html'), 'utf8');
const connect = fs.readFileSync(path.join(root, 'connect/index.html'), 'utf8');
const homepage = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
if (!about.includes('Roman Bediner is the founder and principal of') || !about.includes('class="advisory-brand"') || !about.includes('class="advisory-llc"')) failures += 1;
if (!services.includes('Advisory services delivered through <span class="advisory-brand">') || !services.includes('class="advisory-llc"')) failures += 1;
if (!connect.includes('class="advisory-brand"') || !connect.includes('class="advisory-accent"') || !connect.includes('class="advisory-llc"')) failures += 1;
if (!homepage.includes('global operations and program strategy for LaserLight Communications; Chief Fractional Integration Officer leadership for NC Courage; and Fractional COO-level AI operating architecture for Agentic Society')) {
  failures += 1;
  console.error('FAIL: homepage operating-experience paragraph must name the three current operating roles.');
}

for (const [label, html] of [
  ['homepage', homepage],
  ['about', about],
  ['services', services],
  ['connect', connect]
]) {
  for (const phrase of [
    'Fractional COO',
    'Global Operations',
    'Program Strategy',
    'LaserLight Communications',
    'Chief Fractional Integration Officer',
    'Agentic Society',
    'NC Courage'
  ]) {
    if (!html.toLowerCase().includes(phrase.toLowerCase())) {
      failures += 1;
      console.error(`FAIL: ${label} is missing current-role SEO phrase "${phrase}".`);
    }
  }
}

for (const relativePath of ['index.html', 'about/index.html', 'services/index.html', 'connect/index.html']) {
  const html = fs.readFileSync(path.join(root, relativePath), 'utf8');
  if (!html.includes('"@type": "Organization"') || !html.includes('"name": "Bediner Advisory LLC"')) {
    failures += 1;
    console.error(`FAIL: ${relativePath} is missing Bediner Advisory LLC structured data.`);
  }
}

if (!homepage.includes('"@type": "Organization"') || !homepage.includes('"@id": "https://romanbediner.com/#bediner-advisory"')) {
  failures += 1;
  console.error('FAIL: homepage must expose a canonical Bediner Advisory LLC Organization entity.');
}
if (!about.includes('"@type": "ProfilePage"') || !about.includes('"mainEntity"')) {
  failures += 1;
  console.error('FAIL: About page must expose a Person-focused ProfilePage entity.');
}

const redirects = fs.readFileSync(path.join(root, 'insights/index.html'), 'utf8');
if (redirects.includes('Bediner Advisory LLC') || redirects.includes('footer-identity')) {
  failures += 1;
  console.error('FAIL: redirect-only /insights/ must not receive LLC footer or content changes.');
}

const navRuntime = fs.readFileSync(path.join(root, 'scripts/runtime/site-navigation.js'), 'utf8');
if (navRuntime.includes('Bediner Advisory LLC')) {
  if (!navRuntime.includes('function applyAdvisoryBrandLockups') || !navRuntime.includes('document.querySelectorAll(".footer-entity, .entity-relationship-line")')) {
    failures += 1;
    console.error('FAIL: LLC runtime handling must be limited to the shared visible brand lockup.');
  }
}
if (!navRuntime.includes('class="advisory-llc"')) {
  failures += 1;
  console.error('FAIL: shared navigation runtime must render the approved LLC superscript lockup.');
}

if (failures > 0) process.exit(1);
console.log('PASS: Bediner Advisory LLC brand architecture is present and scoped correctly.');
