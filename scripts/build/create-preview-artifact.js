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

const { computeChecksum, listFilesRecursive } = require(path.resolve(__dirname, 'create-artifact.js'));

function parseArgs(argv) {
  const args = {
    out: '',
    basePath: process.env.PREVIEW_BASE_PATH || ''
  };

  for (let i = 0; i < argv.length; i += 1) {
    const token = argv[i];
    if (token === '--out' && argv[i + 1]) {
      args.out = path.resolve(argv[i + 1]);
      i += 1;
    } else if (token === '--base-path' && argv[i + 1]) {
      args.basePath = argv[i + 1];
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

function normalizeBasePath(input) {
  if (!input) {
    return '/romanbediner-preview';
  }

  let value = input.trim();
  if (!value) {
    return '/romanbediner-preview';
  }

  if (!value.startsWith('/')) {
    value = `/${value}`;
  }

  return value.endsWith('/') && value.length > 1
    ? value.slice(0, -1)
    : value;
}

function rewriteRootRelativePathsForPreview(siteDir, basePath) {
  const files = listFilesRecursive(siteDir);
  const textExtensions = new Set(['.html', '.css', '.js']);

  for (const relativePath of files) {
    const ext = path.extname(relativePath).toLowerCase();
    if (!textExtensions.has(ext)) {
      continue;
    }

    const absolutePath = path.join(siteDir, relativePath);
    const original = fs.readFileSync(absolutePath, 'utf8');
    let rewritten = original;

    // Rewrite common HTML attributes that currently assume domain-root paths.
    rewritten = rewritten.replace(
      /\b(href|src|action|poster|content)=("|')\/(?!\/)/g,
      `$1=$2${basePath}/`
    );

    // Rewrite CSS url("/...") references.
    rewritten = rewritten.replace(
      /url\((['"]?)\/(?!\/)/g,
      `url($1${basePath}/`
    );

    // Rewrite JS string literals that reference root assets/routes.
    rewritten = rewritten.replace(
      /(["'`])\/(assets|styles|scripts|about|services|framework|resources|insights|connect|ai-enabled-operations-dashboard)(\/)/g,
      `$1${basePath}/$2$3`
    );

    if (rewritten !== original) {
      fs.writeFileSync(absolutePath, rewritten);
    }
  }
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
  const basePath = normalizeBasePath(args.basePath);

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

  // Project Pages previews are served from /<repo-name>/, so root-relative
  // production links need to be rewritten for parity in preview environments.
  rewriteRootRelativePathsForPreview(siteDir, basePath);
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
      `- Preview base path: ${basePath}`,
      `- Preview checksum: ${manifest.checksum}`
    ].join('\n') + '\n'
  );
}

if (require.main === module) {
  main();
}

module.exports = {
  ensurePreviewRobots,
  normalizeBasePath,
  rewriteRootRelativePathsForPreview,
  parseArgs
};
