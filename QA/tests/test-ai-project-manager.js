#!/usr/bin/env node
/**
 * Invariant:
 * - The Project Manager resource remains a first-party page with its operating
 *   loop, ownership boundary, and hub entry intact.
 * Why this exists:
 * - The guide must not regress into an unlinked or authority-unsafe resource.
 * What breaks if it fails:
 * - CI blocks publication before the resource can misstate AI responsibility.
 */
const fs = require('fs');
const path = require('path');
const root = path.resolve(__dirname, '..', '..');
const page = fs.readFileSync(path.join(root, 'resources', 'ai-project-manager', 'index.html'), 'utf8');
const hub = fs.readFileSync(path.join(root, 'resources', 'index.html'), 'utf8');
const required = ['data-resource-slug="ai-project-manager"', 'Download the Skill Template', 'Download the Setup Checklist', 'data-copy-template="pm-skill-copy"', 'data-copy-template="pm-checklist-copy"', 'project-manager-resource.js', 'What the Agent Does Each Day', 'class="fleet-diagram fleet-zoomable-diagram pm-diagram"'];
const missing = required.filter((value) => !page.includes(value));
if (!hub.includes('data-resource-card="ai-project-manager"') || !hub.includes('href="/resources/ai-project-manager/"')) missing.push('Resources hub entry');
if (missing.length) { console.error(`FAIL: missing Project Manager resource contract: ${missing.join(', ')}`); process.exit(1); }
console.log('PASS: AI Project Manager resource contract passed.');
