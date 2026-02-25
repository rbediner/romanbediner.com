/**
 * Invariant:
 * - Every JavaScript file in /scripts must start with a structured multi-line header comment.
 * Why this exists:
 * - Preserves architecture/security intent for maintainers and migration workstreams.
 * What breaks if it fails:
 * - CI blocks changes until script-level documentation is complete.
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const SCRIPTS_DIR = path.join(ROOT, 'scripts');

const REQUIRED_LABELS = [
  'Purpose:',
  'Architectural role:',
  'Dependencies:',
  'Security/CSP considerations:',
  'Migration considerations:'
];

function getScriptFiles(dir) {
  const files = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...getScriptFiles(full));
      continue;
    }
    if (entry.isFile() && entry.name.endsWith('.js')) {
      files.push(full);
    }
  }
  return files;
}

describe('Script header comment contract', () => {
  test('all scripts start with a multi-line block comment containing required labels', () => {
    const scriptFiles = getScriptFiles(SCRIPTS_DIR);
    expect(scriptFiles.length).toBeGreaterThan(0);

    const failures = [];

    for (const file of scriptFiles) {
      const rel = path.relative(ROOT, file);
      const text = fs.readFileSync(file, 'utf8');
      const trimmed = text.trimStart();

      const headerMatch = trimmed.match(/^\/\*([\s\S]*?)\*\//);
      if (!headerMatch) {
        failures.push(`${rel}: missing top-of-file multi-line block comment header.`);
        continue;
      }

      const headerText = headerMatch[0];
      const missing = REQUIRED_LABELS.filter((label) => !headerText.includes(label));
      if (missing.length > 0) {
        failures.push(`${rel}: missing header labels -> ${missing.join(', ')}`);
      }
    }

    if (failures.length > 0) {
      throw new Error(failures.join('\n'));
    }
  });
});
