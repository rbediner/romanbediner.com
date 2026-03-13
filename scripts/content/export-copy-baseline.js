#!/usr/bin/env node
/**
 * Purpose:
 * - Export a deterministic, text-only copy baseline for all canonical pages.
 * Architectural role:
 * - Creates a human-readable content snapshot used to detect copy regressions over time.
 * Dependencies:
 * - Node.js core modules only (fs, path).
 * Security/CSP considerations:
 * - Offline static file processing; no network access or runtime script execution.
 * Migration considerations:
 * - Update CANONICAL_PAGES if route architecture changes.
 */
const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..", "..");
const OUTPUT_DIR = path.join(ROOT, "QA", "results");
const OUTPUT_FILE = path.join(OUTPUT_DIR, "copy-baseline.md");

const CANONICAL_PAGES = [
  { route: "/", file: "index.html" },
  { route: "/about/", file: "about/index.html" },
  { route: "/services/", file: "services/index.html" },
  { route: "/framework/", file: "framework/index.html" },
  { route: "/connect/", file: "connect/index.html" }
];

function decodeEntities(input) {
  return input
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, "\"")
    .replace(/&#39;/g, "'");
}

function htmlToText(html) {
  const bodyMatch = html.match(/<body[\s\S]*?>([\s\S]*?)<\/body>/i);
  const body = bodyMatch ? bodyMatch[1] : html;

  const withoutNonCopy = body
    // Remove script-like content that is not user-facing copy.
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<noscript[\s\S]*?<\/noscript>/gi, " ")
    .replace(/<svg[\s\S]*?<\/svg>/gi, " ")
    // Normalize known block-level boundaries to newlines for readability.
    .replace(/<\/(h1|h2|h3|h4|h5|h6|p|li|a|button|label|legend|summary|figcaption|dt|dd|div|section|article|header|footer|nav|main)>/gi, "\n")
    .replace(/<br\s*\/?>/gi, "\n");

  const withoutTags = withoutNonCopy.replace(/<[^>]+>/g, " ");
  const decoded = decodeEntities(withoutTags);

  return decoded
    .replace(/[ \t]+/g, " ")
    .replace(/\n[ \t]+/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .join("\n");
}

function main() {
  const timestamp = new Date().toISOString();
  const lines = [
    "# Website Copy Baseline",
    "",
    `Generated: ${timestamp}`,
    ""
  ];

  for (const page of CANONICAL_PAGES) {
    const fullPath = path.join(ROOT, page.file);
    const html = fs.readFileSync(fullPath, "utf8");
    const text = htmlToText(html);
    lines.push(`## ${page.route}`);
    lines.push(`Source: ${page.file}`);
    lines.push("");
    lines.push(text);
    lines.push("");
  }

  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  fs.writeFileSync(OUTPUT_FILE, lines.join("\n"), "utf8");

  console.log(`Copy baseline written: ${path.relative(ROOT, OUTPUT_FILE)}`);
}

main();
