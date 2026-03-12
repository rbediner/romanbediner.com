#!/usr/bin/env node
/**
 * Purpose:
 * - Create a staging preview artifact that is safe for isolated preview publishing.
 * Architectural role:
 * - Builds a static artifact without CNAME and with strict no-index robots policy.
 * Dependencies:
 * - Node.js built-ins and create-artifact helper.
 * Security/CSP considerations:
 * - Removes domain-claiming CNAME from preview artifacts.
 * Migration considerations:
 * - Keep preview robots policy strict unless preview indexing policy changes.
 */
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const { computeChecksum } = require(path.resolve(__dirname, 'create-artifact.js'));

function parseArgs(argv) {
  const args = {
    out: ''
  };

  for (let i = 0; i < argv.length; i += 1) {
    const token = argv[i];
    if (token === '--out' && argv[i + 1]) {
      args.out = path.resolve(argv[i + 1]);
      i += 1;
    }
  }

  return args;
}

function fail(message) {
  process.stderr.write(`FAIL: ${message}\n`);
  process.exit(1);
}

function writeGithubOutput(values) {
  const outputPath = process.env.GITHUB_OUTPUT;
  if (!outputPath) {
    return;
  }
  const lines = Object.entries(values).map(([key, value]) => `${key}=${value}`);
  fs.appendFileSync(outputPath, `${lines.join('\n')}\n`);
}

function ensurePreviewRobots(siteDir) {
  const robotsPath = path.join(siteDir, 'robots.txt');
  const required = ['User-agent: *', 'Disallow: /', ''];
  fs.writeFileSync(robotsPath, required.join('\n'));
}

function updateManifest(outDir, siteDir) {
  const manifestPath = path.join(outDir, 'artifact-manifest.json');
  if (!fs.existsSync(manifestPath)) {
    fail(`Missing artifact manifest: ${manifestPath}`);
  }

  const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
  const { checksum, fileCount } = computeChecksum(siteDir);
  manifest.checksum = checksum;
  manifest.file_count = fileCount;
  manifest.preview = true;
  manifest.preview_policy = 'robots-disallow-all';
  fs.writeFileSync(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`);

  return { manifestPath, checksum, artifactId: manifest.artifact_id };
}

function main() {
  const args = parseArgs(process.argv.slice(2));
  const outDir = args.out || path.resolve('/tmp/rb-preview-artifact');

  // Reuse the primary artifact builder to keep preview/prod packaging aligned.
  execFileSync(process.execPath, [path.resolve(__dirname, 'create-artifact.js'), '--out', outDir], {
    stdio: 'inherit',
    env: process.env
  });

  const siteDir = path.join(outDir, 'site');
  const cnamePath = path.join(siteDir, 'CNAME');
  if (fs.existsSync(cnamePath)) {
    fs.rmSync(cnamePath, { force: true });
  }

  ensurePreviewRobots(siteDir);
  const manifest = updateManifest(outDir, siteDir);

  writeGithubOutput({
    preview_artifact_dir: outDir,
    preview_site_dir: siteDir,
    preview_manifest: manifest.manifestPath,
    preview_checksum: manifest.checksum,
    preview_artifact_id: manifest.artifactId
  });

  process.stdout.write(
    [
      'PASS: preview artifact created.',
      `- Artifact directory: ${outDir}`,
      `- Site directory: ${siteDir}`,
      `- Manifest: ${manifest.manifestPath}`,
      `- Preview checksum: ${manifest.checksum}`
    ].join('\n') + '\n'
  );
}

if (require.main === module) {
  main();
}

module.exports = {
  ensurePreviewRobots,
  parseArgs
};
