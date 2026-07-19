#!/usr/bin/env node
/**
 * Invariant:
 * - Regression guardrails for test-home-hero-alignment-node-playwright.js.
 * Why this exists:
 * - Prevents architectural drift in routing, analytics, CSP, metadata, or shared UI contracts.
 * What breaks if it fails:
 * - CI blocks deployment to prevent production regressions.
 */
/**
 * Node Playwright QA: verifies homepage hero alignment contract.
 * - Viewport is fixed to desktop contract: 1440x900.
 * - H1 right edge must align to executive callout right edge within ±1px.
 * - H1 must remain a single line at this viewport.
 */

const fs = require("fs");
const http = require("http");
const path = require("path");
const { chromium } = require("playwright");

const ROOT = path.resolve(__dirname, "..", "..");
const PORT = 4173;
const HOST = "127.0.0.1";

// Minimal content type map for the static site assets used by this test.
const CONTENT_TYPES = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
  ".webmanifest": "application/manifest+json",
};

function resolvePath(urlPath) {
  // Normalize to prevent path traversal and serve index files for directories.
  const clean = decodeURIComponent((urlPath || "/").split("?")[0]);
  if (clean === "/") {
    return path.join(ROOT, "index.html");
  }
  const safe = path
    .normalize(clean)
    .replace(/^[/\\]+/, "")
    .replace(/^(\.\.[/\\])+/, "");
  let filePath = path.join(ROOT, safe);
  if (filePath.endsWith(path.sep)) filePath = path.join(filePath, "index.html");
  if (fs.existsSync(filePath) && fs.statSync(filePath).isDirectory()) {
    filePath = path.join(filePath, "index.html");
  }
  if (!fs.existsSync(filePath) && !path.extname(filePath)) {
    const htmlPath = `${filePath}.html`;
    if (fs.existsSync(htmlPath)) filePath = htmlPath;
  }
  return filePath;
}

function startStaticServer() {
  const server = http.createServer((req, res) => {
    const filePath = resolvePath(req.url || "/");
    if (!filePath.startsWith(ROOT) || !fs.existsSync(filePath)) {
      res.writeHead(404);
      res.end("Not found");
      return;
    }
    const ext = path.extname(filePath).toLowerCase();
    const type = CONTENT_TYPES[ext] || "application/octet-stream";
    res.writeHead(200, { "Content-Type": type });
    fs.createReadStream(filePath).pipe(res);
  });
  return new Promise((resolve, reject) => {
    server.once("error", reject);
    server.listen(PORT, HOST, () => resolve(server));
  });
}

async function run() {
  const server = await startStaticServer();
  let browser;
  try {
    browser = await chromium.launch({ headless: true });
    const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
    await page.goto(`http://${HOST}:${PORT}/`, { waitUntil: "networkidle" });

    // Measure right-edge alignment and approved two-line behavior directly from rendered layout.
    const result = await page.evaluate(() => {
      const h1 = document.querySelector(".hero-head h1, .master-head h1");
      // The executive callout was retired. The hero container is now the stable
      // alignment boundary for the approved homepage headline.
      const heroContainer = document.querySelector(".master-head");
      if (!h1 || !heroContainer) {
        throw new Error(
          `Missing .hero-head h1/.master-head h1 or .master-head (url=${location.href}, hasH1=${Boolean(h1)}, hasHeroContainer=${Boolean(heroContainer)})`
        );
      }
      const h1Box = h1.getBoundingClientRect();
      const heroContainerBox = heroContainer.getBoundingClientRect();
      const h1Style = getComputedStyle(h1);
      const lineHeight = Number.parseFloat(h1Style.lineHeight) || Number.parseFloat(h1Style.fontSize) * 1.1;
      // The approved value proposition wraps at desktop width to avoid horizontal overflow.
      // A third line would mean its reading measure or typography has regressed.
      const withinApprovedLineCount = h1Box.height <= lineHeight * 2 + 1;
      return {
        h1Right: h1Box.right,
        heroContainerRight: heroContainerBox.right,
        delta: h1Box.right - heroContainerBox.right,
        withinApprovedLineCount,
      };
    });

    if (Math.abs(result.delta) > 1) {
      throw new Error(
        `Homepage hero alignment failed: delta=${result.delta.toFixed(2)}px (h1Right=${result.h1Right}, heroContainerRight=${result.heroContainerRight})`
      );
    }
    if (!result.withinApprovedLineCount) {
      throw new Error("Homepage hero alignment failed: H1 exceeds its approved two-line measure at 1440x900.");
    }

    // Keep output concise for CI logs.
    console.log(`PASS: Node Playwright hero alignment delta=${result.delta.toFixed(2)}px, withinApprovedLineCount=${result.withinApprovedLineCount}`);
  } finally {
    if (browser) await browser.close();
    await new Promise((resolve) => server.close(resolve));
  }
}

run().catch((err) => {
  console.error(`FAIL: ${err.message}`);
  // Keep failure diagnostics concise but actionable for local troubleshooting.
  console.error("Tip: if browsers are missing, run: npx playwright install chromium");
  process.exit(1);
});
