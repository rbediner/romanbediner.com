#!/usr/bin/env node
/**
 * Invariant:
 * - Icon assets are split into a production page-scoped icon tree and an asset-library tree for unused icons.
 * Why this exists:
 * - Prevents icon sprawl in assets/icons and preserves a deterministic workflow for staging/prod icon promotion.
 * What breaks if it fails:
 * - CI blocks release because icon paths can drift, unused assets can leak into production, and page ownership becomes unclear.
 */
const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..', '..');
const productionIconsRoot = path.join(root, 'assets', 'icons');
const designLibraryRoot = path.join(root, 'assets', 'asset-library', 'icons');

const expectedPageFolders = ['home', 'about', 'framework', 'services', 'connect'];
const expectedFrameworkIcons = [
  'opportunity-network.png',
  'design-blueprint.png',
  'integration-merger.png',
  'execution-workflow.png',
  'signals-telemetry.png',
  'evolution-feedback.png'
];
const expectedLibraryGridIcons = [
  'opportunity-network.png',
  'design-blueprint.png',
  'integration-merger.png',
  'execution-workflow.png',
  'signals-telemetry.png',
  'evolution-feedback.png',
  'collaboration-convergence.png',
  'strategy-roadmap.png',
  'system-scale.png',
  'system-resilience.png'
];

const pageFiles = [
  { file: 'index.html', folder: 'home' },
  { file: 'about/index.html', folder: 'about' },
  { file: 'framework/index.html', folder: 'framework' },
  { file: 'services/index.html', folder: 'services' },
  { file: 'connect/index.html', folder: 'connect' }
];

let failures = 0;

if (!fs.existsSync(productionIconsRoot)) {
  failures += 1;
  console.error('FAIL: assets/icons directory is missing.');
}

const iconRootEntries = fs.readdirSync(productionIconsRoot, { withFileTypes: true });
const rootFiles = iconRootEntries.filter((entry) => entry.isFile()).map((entry) => entry.name);
if (rootFiles.length > 0) {
  failures += 1;
  console.error(`FAIL: assets/icons must not contain loose files: ${rootFiles.join(', ')}`);
}

for (const folder of expectedPageFolders) {
  if (!iconRootEntries.some((entry) => entry.isDirectory() && entry.name === folder)) {
    failures += 1;
    console.error(`FAIL: missing page icon folder assets/icons/${folder}/`);
  }
}

const unexpectedFolders = iconRootEntries
  .filter((entry) => entry.isDirectory() && !expectedPageFolders.includes(entry.name))
  .map((entry) => entry.name);
if (unexpectedFolders.length > 0) {
  failures += 1;
  console.error(`FAIL: assets/icons contains unexpected non-page folders: ${unexpectedFolders.join(', ')}`);
}

if (!fs.existsSync(designLibraryRoot)) {
  failures += 1;
  console.error('FAIL: design asset library assets/asset-library/icons is missing.');
} else {
  for (const filename of expectedLibraryGridIcons) {
    if (!fs.existsSync(path.join(designLibraryRoot, filename))) {
      failures += 1;
      console.error(`FAIL: missing asset-library icon ${filename}`);
    }
  }
  const libraryIcons = fs
    .readdirSync(designLibraryRoot, { withFileTypes: true })
    .filter((entry) => entry.isFile() && entry.name.endsWith('.png'))
    .map((entry) => entry.name)
    .sort();
  const expectedSorted = [...expectedLibraryGridIcons].sort();
  if (JSON.stringify(libraryIcons) !== JSON.stringify(expectedSorted)) {
    failures += 1;
    console.error(`FAIL: assets/asset-library/icons must contain exactly the 10 grid PNGs. Found: ${libraryIcons.join(', ')}`);
  }
}

const legacyDesignLibraryRoot = path.join(root, 'Codex', 'art', 'icons');
if (fs.existsSync(legacyDesignLibraryRoot)) {
  failures += 1;
  console.error('FAIL: legacy design library path Codex/art/icons must not exist.');
}

for (const filename of expectedFrameworkIcons) {
  const iconPath = path.join(productionIconsRoot, 'framework', filename);
  if (!fs.existsSync(iconPath)) {
    failures += 1;
    console.error(`FAIL: missing framework icon assets/icons/framework/${filename}`);
  }
}

const frameworkIcons = fs
  .readdirSync(path.join(productionIconsRoot, 'framework'), { withFileTypes: true })
  .filter((entry) => entry.isFile() && entry.name.endsWith('.png'))
  .map((entry) => entry.name)
  .sort();
const expectedFrameworkSorted = [...expectedFrameworkIcons].sort();
if (JSON.stringify(frameworkIcons) !== JSON.stringify(expectedFrameworkSorted)) {
  failures += 1;
  console.error(`FAIL: assets/icons/framework must contain exactly 6 production PNG icons. Found: ${frameworkIcons.join(', ')}`);
}

for (const { file, folder } of pageFiles) {
  const html = fs.readFileSync(path.join(root, file), 'utf8');
  const iconMatches = html.match(/(?:\/|\.\.\/)?assets\/icons\/[^"'\s)]+/g) || [];
  for (const iconPathRef of iconMatches) {
    // Canonical, absolute framework icon references are checked by folder ownership rule below.
    const cleaned = iconPathRef.replace(/^\/+/, '').replace(/^\.\.\//, '');
    if (cleaned === 'assets/icons/home/bullet.png') {
      // Shared orb bullet contract is intentionally centralized in styles/site.css.
      continue;
    }
    if (!cleaned.startsWith(`assets/icons/${folder}/`) && !cleaned.startsWith('assets/icons/framework/')) {
      failures += 1;
      console.error(`FAIL: ${file} references icon outside page folder contract: ${iconPathRef}`);
    }
  }
}

if (failures > 0) {
  process.exit(1);
}

console.log('PASS: icon management system contract checks passed.');
