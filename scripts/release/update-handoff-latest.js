#!/usr/bin/env node
/**
 * Purpose:
 * - Update the single canonical cross-machine handoff file with fresh metadata.
 * Architectural role:
 * - Enforces deterministic handoff continuity across machines by refreshing sequence, timestamp, branch, and source commit.
 * Dependencies:
 * - Node.js built-ins only (fs, path, child_process); no third-party packages.
 * Security/CSP considerations:
 * - Local file and git metadata update only; no network calls and no runtime/browser impact.
 * Migration considerations:
 * - If repository layout changes, keep HANDOFF_PATH aligned with README and Jest handoff contract tests.
 */
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const ROOT = path.resolve(__dirname, '..', '..');
const HANDOFF_PATH = path.join(ROOT, 'docs', 'handoff', 'latest.md');

function getGitValue(command, fallback = 'unknown') {
  try {
    return execSync(command, { cwd: ROOT, stdio: ['ignore', 'pipe', 'ignore'] }).toString().trim();
  } catch (_) {
    return fallback;
  }
}

function updateLine(text, pattern, replacement) {
  if (!pattern.test(text)) {
    return `${replacement}\n${text}`;
  }
  return text.replace(pattern, replacement);
}

function main() {
  if (!fs.existsSync(HANDOFF_PATH)) {
    throw new Error(`Missing handoff file: ${HANDOFF_PATH}`);
  }

  const nowUtc = new Date().toISOString().replace(/\.\d{3}Z$/, 'Z');
  const branch = getGitValue('git branch --show-current');
  const sourceCommit = getGitValue('git rev-parse HEAD');

  const original = fs.readFileSync(HANDOFF_PATH, 'utf8');
  const sequenceMatch = original.match(/- Handoff Sequence:\s*(\d+)/);
  const currentSequence = sequenceMatch ? Number(sequenceMatch[1]) : 0;
  const nextSequence = currentSequence + 1;

  let updated = original;
  updated = updateLine(updated, /- Handoff Sequence:\s*\d+/, `- Handoff Sequence: ${nextSequence}`);
  updated = updateLine(updated, /- Updated At \(UTC\):\s*[^\n]+/, `- Updated At (UTC): ${nowUtc}`);
  updated = updateLine(updated, /- Source Branch:\s*[^\n]+/, `- Source Branch: ${branch}`);
  updated = updateLine(
    updated,
    /- Source Commit:\s*[^\n]+/,
    `- Source Commit: ${sourceCommit} (pre-handoff baseline)`
  );

  fs.writeFileSync(HANDOFF_PATH, updated, 'utf8');

  process.stdout.write(
    [
      `[handoff] Updated: ${path.relative(ROOT, HANDOFF_PATH)}`,
      `[handoff] Sequence: ${currentSequence} -> ${nextSequence}`,
      `[handoff] Timestamp (UTC): ${nowUtc}`,
      `[handoff] Branch: ${branch}`,
      `[handoff] Source commit: ${sourceCommit}`
    ].join('\n') + '\n'
  );
}

main();
