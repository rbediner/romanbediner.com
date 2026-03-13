#!/usr/bin/env node
/**
 * Invariant:
 * - Canonical pages include the shared footer quote block and Cormorant Garamond font link.
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

const fontHref =
  'https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,500;1,500&display=swap';
const quoteText = "“Laughter is timeless, imagination has no age, dreams are forever.”";
const authorText = "— Walt Disney";

for (const relPath of pages) {
  const filePath = path.join(root, relPath);
  const html = fs.readFileSync(filePath, "utf8");

  if (!html.includes(fontHref)) {
    console.error(`FAIL: Missing Cormorant Garamond font link in ${relPath}`);
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
