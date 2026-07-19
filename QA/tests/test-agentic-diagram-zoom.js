#!/usr/bin/env node
/**
 * Invariant:
 * - Every Agentic AI Employees diagram has a reliable fullscreen and zoom
 *   contract, including the mobile flex sizing rule and focus restoration.
 *
 * Why this exists:
 * - A diagram that opens but cannot become legible on a phone is a broken
 *   case-study interaction, not a cosmetic regression.
 *
 * What breaks if it fails:
 * - A future diagram or lightbox change can silently remove fullscreen,
 *   mobile zoom, or keyboard-return behavior from the public case study.
 */
const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..', '..');
const page = fs.readFileSync(path.join(root, 'resources', 'agentic-ai-employees', 'index.html'), 'utf8');
const zoomScript = fs.readFileSync(path.join(root, 'scripts', 'runtime', 'fleet-diagram-zoom.js'), 'utf8');
const resourcesCss = fs.readFileSync(path.join(root, 'styles', 'resources.css'), 'utf8');

const checks = [
  ['three inline SVG diagrams', (page.match(/class="fleet-diagram"/g) || []).length === 3],
  ['seven HTML/CSS diagrams', (page.match(/fleet-zoomable-diagram/g) || []).length === 7],
  ['fullscreen script loaded', page.includes('fleet-diagram-zoom.js')],
  ['zoom control exists', zoomScript.includes("className = 'fleet-lightbox-zoom'")],
  ['close control exists', zoomScript.includes("className = 'fleet-lightbox-close'")],
  ['focus returns to trigger', zoomScript.includes('currentTrigger.focus()')],
  ['zoomed SVG cannot shrink', resourcesCss.includes('flex: 0 0 auto;')]
];

const failures = checks.filter(([, passed]) => !passed);
if (failures.length) {
  failures.forEach(([label]) => console.error(`FAIL: ${label}`));
  process.exit(1);
}

console.log('PASS: Agentic diagram fullscreen and mobile zoom contracts passed.');
