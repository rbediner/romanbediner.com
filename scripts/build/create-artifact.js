#!/usr/bin/env node
/**
 * Purpose:
 * - Build a deterministic static-site artifact with metadata and checksum.
 * Architectural role:
 * - Creates the single deployable package consumed by staging/prod workflows.
 * Dependencies:
 * - Node.js built-ins only.
 * Security/CSP considerations:
 * - Packages already-tracked static assets; no runtime policy changes.
 * Migration considerations:
 * - Adjust INCLUDE_PATHS if route or asset layout changes.
 */
const crypto = require('crypto');
const fs = require('fs');
const os = require('os');
const path = require('path');
const { execSync } = require('child_process');

const ROOT = path.resolve(__dirname, '..', '..');
const DEFAULT_OUT = path.join(os.tmpdir(), 'rb-site-artifact');
const INCLUDE_PATHS = [
  '.nojekyll',
  'CNAME',
  'index.html',
  'robots.txt',
  'sitemap.xml',
  'about',
  'services',
  'framework',
  'insights',
  'connect',
  'assets',
  'styles',
  path.join('scripts', 'runtime')
];

function parseArgs(argv) {
  const args = { out: DEFAULT_OUT };
  for (let i = 0; i < argv.length; i += 1) {
    const token = argv[i];
    if (token === '--out' && argv[i + 1]) {
      args.out = path.resolve(argv[i + 1]);
      i += 1;
    }
  }
  return args;
}

function removeAndRecreateDir(dirPath) {
  fs.rmSync(dirPath, { recursive: true, force: true });
  fs.mkdirSync(dirPath, { recursive: true });
}

function copyIncludedPaths(siteDir) {
  for (const relativePath of INCLUDE_PATHS) {
    const source = path.join(ROOT, relativePath);
    if (!fs.existsSync(source)) {
      continue;
    }

    const destination = path.join(siteDir, relativePath);
    fs.mkdirSync(path.dirname(destination), { recursive: true });
    fs.cpSync(source, destination, { recursive: true });
  }
}

function listFilesRecursive(baseDir) {
  const output = [];
  const stack = [''];

  while (stack.length > 0) {
    const relativeDir = stack.pop();
    const absoluteDir = path.join(baseDir, relativeDir);
    const entries = fs.readdirSync(absoluteDir, { withFileTypes: true });

    for (const entry of entries) {
      const relativePath = path.posix.join(relativeDir, entry.name);
      const absolutePath = path.join(baseDir, relativePath);
      if (entry.isDirectory()) {
        stack.push(relativePath);
      } else if (entry.isFile()) {
        output.push(relativePath);
      }
    }
  }

  return output.sort();
}

function computeChecksum(siteDir) {
  const hash = crypto.createHash('sha256');
  const files = listFilesRecursive(siteDir);

  for (const relativePath of files) {
    const fullPath = path.join(siteDir, relativePath);
    const contentHash = crypto.createHash('sha256').update(fs.readFileSync(fullPath)).digest('hex');
    hash.update(`${relativePath}:${contentHash}\n`);
  }

  return {
    checksum: hash.digest('hex'),
    fileCount: files.length
  };
}

function resolveCommitSha() {
  try {
    return execSync('git rev-parse HEAD', {
      cwd: ROOT,
      stdio: ['ignore', 'pipe', 'ignore']
    }).toString().trim();
  } catch (_error) {
    return 'unknown';
  }
}

function writeGithubOutput(values) {
  const outputPath = process.env.GITHUB_OUTPUT;
  if (!outputPath) {
    return;
  }

  const lines = Object.entries(values).map(([key, value]) => `${key}=${value}`);
  fs.appendFileSync(outputPath, `${lines.join('\n')}\n`);
}

function main() {
  const args = parseArgs(process.argv.slice(2));
  const outDir = args.out;
  const siteDir = path.join(outDir, 'site');

  removeAndRecreateDir(outDir);
  fs.mkdirSync(siteDir, { recursive: true });
  copyIncludedPaths(siteDir);

  const commit = resolveCommitSha();
  const { checksum, fileCount } = computeChecksum(siteDir);
  const manifest = {
    artifact_id: `${commit.slice(0, 12)}-${Date.now()}`,
    commit,
    node: process.versions.node,
    checksum,
    file_count: fileCount,
    build_time: new Date().toISOString()
  };

  const manifestPath = path.join(outDir, 'artifact-manifest.json');
  fs.writeFileSync(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`);

  writeGithubOutput({
    artifact_dir: outDir,
    artifact_site_dir: siteDir,
    artifact_manifest: manifestPath,
    artifact_checksum: checksum,
    artifact_id: manifest.artifact_id
  });

  process.stdout.write(
    [
      'PASS: static artifact created.',
      `- Artifact directory: ${outDir}`,
      `- Site directory: ${siteDir}`,
      `- Manifest: ${manifestPath}`,
      `- Checksum: ${checksum}`
    ].join('\n') + '\n'
  );
}

if (require.main === module) {
  main();
}

module.exports = {
  computeChecksum,
  listFilesRecursive,
  main,
  parseArgs
};
