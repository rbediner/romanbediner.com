/**
 * Invariant:
 * - README must include required architecture sections and a valid machine-readable summary JSON.
 * Why this exists:
 * - Ensures migration and operational contracts remain explicit and parseable.
 * What breaks if it fails:
 * - CI blocks merges until README structure and architecture invariants are restored.
 */
const fs = require('fs');
const path = require('path');

// Jest specs are nested under QA/tests/jest, so repository root is three levels up.
const ROOT = path.resolve(__dirname, '..', '..', '..');
const README_PATH = path.join(ROOT, 'README.md');
const MODEL_PATH = path.join(ROOT, 'docs', 'architecture', 'environment-model.json');
const README_TEXT = fs.readFileSync(README_PATH, 'utf8');
const ENV_MODEL = JSON.parse(fs.readFileSync(MODEL_PATH, 'utf8'));

const REQUIRED_HEADINGS = [
  'Technical Specification',
  'Machine-Readable Architecture Summary'
];

describe('README structure contract', () => {
  test('contains required section headings (case-sensitive)', () => {
    for (const heading of REQUIRED_HEADINGS) {
      expect(README_TEXT.includes(`## ${heading}`)).toBe(true);
    }
  });

  test('contains exactly one JSON fenced block under machine-readable summary section', () => {
    const sectionMatch = README_TEXT.match(
      /## Machine-Readable Architecture Summary\n([\s\S]*?)(?:\n## |$)/
    );
    expect(sectionMatch).not.toBeNull();

    const sectionText = sectionMatch[1];
    const jsonBlocks = [...sectionText.matchAll(/```json\n([\s\S]*?)\n```/g)];
    expect(jsonBlocks.length).toBe(1);
  });

  test('machine-readable JSON parses and satisfies required invariants', () => {
    const sectionMatch = README_TEXT.match(
      /## Machine-Readable Architecture Summary\n([\s\S]*?)(?:\n## |$)/
    );
    if (!sectionMatch) {
      throw new Error('Missing "Machine-Readable Architecture Summary" section.');
    }

    const sectionText = sectionMatch[1];
    const jsonBlocks = [...sectionText.matchAll(/```json\n([\s\S]*?)\n```/g)];
    if (jsonBlocks.length !== 1) {
      throw new Error(`Expected exactly one JSON block under machine-readable summary; found ${jsonBlocks.length}.`);
    }

    let parsed;
    try {
      parsed = JSON.parse(jsonBlocks[0][1]);
    } catch (error) {
      throw new Error(`Machine-readable JSON failed to parse: ${error.message}`);
    }

    const expectedRoutes = ['/', '/about/', '/services/', '/framework/', '/resources/', '/resources/ai-enabled-operations-framework-summary/', '/resources/pasteflow/', '/connect/'];
    expect(parsed.routes).toEqual(expectedRoutes);
    expect(parsed.canonical_domain).toBe('romanbediner.com');
    expect(parsed.requires_trailing_slash).toBe(true);

    expect(parsed.ga?.meta_tag_required).toBe(true);
    expect(parsed.ga?.bootstrap_script).toBe('/scripts/runtime/ga4-bootstrap.js');
    expect(parsed.ga?.inline_allowed).toBe(false);

    expect(parsed.csp?.unsafe_inline_allowed).toBe(false);
    expect(parsed.csp?.required_script_src).toEqual(
      expect.arrayContaining(['self', 'https://www.googletagmanager.com'])
    );
    expect(parsed.csp?.required_connect_src).toEqual(
      expect.arrayContaining([
        'https://www.google-analytics.com',
        'https://analytics.google.com'
      ])
    );

    expect(parsed.ci?.node_version).toBe('20');
    expect(parsed.ci?.lockfile_required).toBe(true);
    expect(parsed.ci?.playwright_required).toBe(true);
    expect(parsed.ci?.readme_update_required_on_arch_change).toBe(true);

    // Enforce that README machine-readable JSON is generated from (or equivalent to)
    // docs/architecture/environment-model.json.
    expect(parsed).toEqual(ENV_MODEL.machine_readable_summary);
  });
});
