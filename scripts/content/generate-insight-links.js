/*
 * Purpose:
 * - Regenerate README insight deep-link section from canonical Insights page cards.
 *
 * Architectural role:
 * - Keeps documentation synchronized with content slugs as part of QA and CI workflows.
 *
 * Dependencies:
 * - Node.js filesystem APIs and stable Insights card markup structure.
 *
 * Security/CSP considerations:
 * - Build-time utility only; does not execute in browser and does not affect CSP runtime policy.
 *
 * Migration considerations:
 * - Update input/output paths if repository routing or documentation location changes.
 */
/**
 * Auto-generates direct anchor links for Insights cards in README.md.
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..', '..');
const INSIGHTS_PATH = path.join(ROOT, 'insights', 'index.html');
const README_PATH = path.join(ROOT, 'README.md');
const START_MARKER = '<!-- AUTO-GENERATED INSIGHT LINKS START -->';
const END_MARKER = '<!-- AUTO-GENERATED INSIGHT LINKS END -->';

function parseInsights(html) {
  // Each card id and h2 pair is used to produce stable anchor links.
  const matches = [...html.matchAll(/<article id="([a-z0-9-]+)" class="insight-card">[\s\S]*?<h2>([^<]+)<\/h2>/g)];
  return matches.map((match) => ({ slug: match[1], title: match[2].trim() }));
}

function buildSection(entries) {
  const lines = [
    START_MARKER,
    '## INSIGHT DIRECT LINKS',
    ''
  ];

  for (const entry of entries) {
    lines.push(entry.title);
    lines.push(`https://romanbediner.com/insights/#${entry.slug}`);
    lines.push('');
  }

  // Keep marker placement deterministic for test verification.
  lines.push(END_MARKER);
  return lines.join('\n');
}

function replaceGeneratedBlock(readme, generatedSection) {
  const escapedStart = START_MARKER.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const escapedEnd = END_MARKER.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const blockPattern = new RegExp(`${escapedStart}[\\s\\S]*?${escapedEnd}`, 'm');

  if (blockPattern.test(readme)) {
    return readme.replace(blockPattern, generatedSection);
  }

  const suffix = readme.endsWith('\n') ? '' : '\n';
  return `${readme}${suffix}\n${generatedSection}\n`;
}

const insightsHtml = fs.readFileSync(INSIGHTS_PATH, 'utf8');
const readme = fs.readFileSync(README_PATH, 'utf8');
const entries = parseInsights(insightsHtml);
const generatedSection = buildSection(entries);
const updatedReadme = replaceGeneratedBlock(readme, generatedSection);

fs.writeFileSync(README_PATH, updatedReadme, 'utf8');
console.log(`Updated README insight links from ${entries.length} insight card(s).`);

if (typeof module !== 'undefined') {
  module.exports = {
    parseInsights,
    buildSection,
    replaceGeneratedBlock,
    START_MARKER,
    END_MARKER
  };
}
