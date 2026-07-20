#!/usr/bin/env node
/**
 * Invariant:
 * - Canonical pages include the shared footer quote block and local Cormorant Garamond support.
 * Why this exists:
 * - Protects the responsive footer quote contract across all top-level routes.
 * What breaks if it fails:
 * - Footer quote can disappear, lose typography, or gain malformed markup on one or more pages.
 */
const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..", "..");
const pages = [
  "index.html",
  "about/index.html",
  "services/index.html",
  "framework/index.html",
  "connect/index.html"
];

// Cormorant is self-hosted from styles/site.css to remove a third-party critical-path request.
const externalFontPattern = /fonts\.(googleapis|gstatic)\.com/;
const quoteText = '\u201cLaughter is timeless, imagination has no age, dreams are forever.\u201d';
const authorText = 'Walt Disney';

for (const relPath of pages) {
  const filePath = path.join(root, relPath);
  const html = fs.readFileSync(filePath, "utf8");

  if (externalFontPattern.test(html)) {
    console.error(`FAIL: External Google Font dependency remains in ${relPath}`);
    process.exit(1);
  }

  if (!html.includes('<div class="footer-quote-block">')) {
    console.error(`FAIL: Missing footer quote block wrapper in ${relPath}`);
    process.exit(1);
  }

  if (!html.includes(`<p class="footer-quote">${quoteText}</p>`)) {
    console.error(`FAIL: Quote text missing or malformed in ${relPath}`);
    process.exit(1);
  }

  if (!html.includes(`<p class="footer-quote-author">${authorText}</p>`)) {
    console.error(`FAIL: Quote author line missing or malformed in ${relPath}`);
    process.exit(1);
  }

  // Ensure no manual line-break tags were introduced into the quote line.
  if (/<p class="footer-quote">[\s\S]*<br\s*\/?>[\s\S]*<\/p>/.test(html)) {
    console.error(`FAIL: Manual line break found inside footer quote in ${relPath}`);
    process.exit(1);
  }
}

console.log("PASS: footer quote and font contract checks passed.");
