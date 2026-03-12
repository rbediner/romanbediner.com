#!/usr/bin/env node
/**
 * Purpose:
 * - Verify that required workflow files and critical jobs still exist.
 * Architectural role:
 * - Protects CI/CD invariants from accidental workflow deletion or job drift.
 * Dependencies:
 * - Node.js built-ins only.
 * Security/CSP considerations:
 * - Static text validation only; does not execute workflows.
 * Migration considerations:
 * - Keep docs/architecture/workflow-manifest.json in sync when workflow topology changes.
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..', '..');
const MANIFEST_PATH = path.join(ROOT, 'docs', 'architecture', 'workflow-manifest.json');
const WORKFLOW_DIR = path.join(ROOT, '.github', 'workflows');

function fail(message) {
  process.stderr.write(`FAIL: ${message}\n`);
  process.exit(1);
}

function readJson(filePath) {
  try {
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
  } catch (error) {
    fail(`Unable to parse JSON at ${path.relative(ROOT, filePath)}: ${error.message}`);
  }
}

function hasJobDefinition(workflowText, jobName) {
  // Simple but stable check for top-level job keys used in this repository.
  const escaped = jobName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const pattern = new RegExp(`^\\s{2}${escaped}:\\s*$`, 'm');
  return pattern.test(workflowText);
}

function main() {
  if (!fs.existsSync(MANIFEST_PATH)) {
    fail(`Missing workflow manifest: ${path.relative(ROOT, MANIFEST_PATH)}`);
  }
  if (!fs.existsSync(WORKFLOW_DIR)) {
    fail('Missing .github/workflows directory');
  }

  const manifest = readJson(MANIFEST_PATH);
  if (!Array.isArray(manifest.required_workflows)) {
    fail('required_workflows must be an array');
  }

  const requiredJobs = manifest.required_jobs || {};

  for (const workflowName of manifest.required_workflows) {
    const workflowPath = path.join(WORKFLOW_DIR, workflowName);
    if (!fs.existsSync(workflowPath)) {
      fail(`Required workflow file is missing: .github/workflows/${workflowName}`);
    }

    const expectedJobs = requiredJobs[workflowName] || [];
    const workflowText = fs.readFileSync(workflowPath, 'utf8');
    for (const jobName of expectedJobs) {
      if (!hasJobDefinition(workflowText, jobName)) {
        fail(`Workflow ${workflowName} is missing required job: ${jobName}`);
      }
    }
  }

  process.stdout.write('PASS: workflow integrity verification passed.\n');
}

if (require.main === module) {
  main();
}

module.exports = {
  hasJobDefinition,
  main
};
