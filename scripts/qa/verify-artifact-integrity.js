#!/usr/bin/env node
/**
 * Purpose:
 * - Validate that a generated static artifact matches its checksum manifest.
 * Architectural role:
 * - Prevents deployment of mutated or incomplete artifacts.
 * Dependencies:
 * - Node.js built-ins plus create-artifact checksum helper.
 * Security/CSP considerations:
 * - Integrity verification only; no runtime/browser changes.
 * Migration considerations:
 * - Keep manifest field names stable across build/deploy scripts.
 */
const fs = require('fs');
const path = require('path');

const { computeChecksum } = require(path.resolve(__dirname, '..', 'build', 'create-artifact.js'));

function parseArgs(argv) {
  const args = {
    artifact: '',
    expectCommit: ''
  };

  for (let i = 0; i < argv.length; i += 1) {
    const token = argv[i];
    if (token === '--artifact' && argv[i + 1]) {
      args.artifact = path.resolve(argv[i + 1]);
      i += 1;
    } else if (token === '--expect-commit' && argv[i + 1]) {
      args.expectCommit = argv[i + 1];
      i += 1;
    }
  }

  return args;
}

function fail(message) {
  process.stderr.write(`FAIL: ${message}\n`);
  process.exit(1);
}

function main() {
  const args = parseArgs(process.argv.slice(2));
  if (!args.artifact) {
    fail('Missing --artifact argument');
  }

  const manifestPath = path.join(args.artifact, 'artifact-manifest.json');
  const siteDir = path.join(args.artifact, 'site');

  if (!fs.existsSync(manifestPath)) {
    fail(`Missing artifact manifest: ${manifestPath}`);
  }
  if (!fs.existsSync(siteDir)) {
    fail(`Missing artifact site directory: ${siteDir}`);
  }

  let manifest;
  try {
    manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
  } catch (error) {
    fail(`Artifact manifest is invalid JSON: ${error.message}`);
  }

  const { checksum } = computeChecksum(siteDir);
  if (!manifest.checksum || manifest.checksum !== checksum) {
    fail(`Checksum mismatch. expected=${manifest.checksum} actual=${checksum}`);
  }

  if (args.expectCommit && manifest.commit !== args.expectCommit) {
    fail(`Commit mismatch. expected=${args.expectCommit} actual=${manifest.commit}`);
  }

  process.stdout.write(
    [
      'PASS: artifact integrity verification passed.',
      `- Artifact: ${args.artifact}`,
      `- Checksum: ${checksum}`,
      `- Commit: ${manifest.commit}`
    ].join('\n') + '\n'
  );
}

if (require.main === module) {
  main();
}

module.exports = {
  main,
  parseArgs
};
