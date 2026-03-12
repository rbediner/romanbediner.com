#!/usr/bin/env node
/**
 * Purpose:
 * - Validate preview artifact safety constraints before publishing to preview repo.
 * Architectural role:
 * - Blocks preview publication when CNAME exists or no-index policy is missing.
 * Dependencies:
 * - Node.js built-ins and artifact integrity verifier.
 * Security/CSP considerations:
 * - Prevents preview deployment from claiming production domain.
 * Migration considerations:
 * - Update robots/CNAME assertions if preview policy changes.
 */
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

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

  // First enforce checksum/manifest integrity.
  const integrityArgs = [
    path.resolve(__dirname, 'verify-artifact-integrity.js'),
    '--artifact',
    args.artifact
  ];
  if (args.expectCommit) {
    integrityArgs.push('--expect-commit', args.expectCommit);
  }

  execFileSync(process.execPath, integrityArgs, { stdio: 'inherit', env: process.env });

  const siteDir = path.join(args.artifact, 'site');
  const cnamePath = path.join(siteDir, 'CNAME');
  if (fs.existsSync(cnamePath)) {
    fail('Preview artifact must not contain CNAME.');
  }

  const robotsPath = path.join(siteDir, 'robots.txt');
  if (!fs.existsSync(robotsPath)) {
    fail('Preview artifact is missing robots.txt');
  }

  const robotsText = fs.readFileSync(robotsPath, 'utf8');
  if (!robotsText.includes('User-agent: *') || !robotsText.includes('Disallow: /')) {
    fail('Preview robots.txt must contain "User-agent: *" and "Disallow: /"');
  }

  process.stdout.write(
    [
      'PASS: preview artifact verification passed.',
      `- Artifact: ${args.artifact}`,
      '- CNAME removed: yes',
      '- Robots no-index policy: enforced'
    ].join('\n') + '\n'
  );
}

if (require.main === module) {
  main();
}

module.exports = {
  parseArgs
};
