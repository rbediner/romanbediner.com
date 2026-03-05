/**
 * Invariant:
 * - Regression guardrails for h1-alignment.spec.js.
 * Why this exists:
 * - Prevents architectural drift in routing, analytics, CSP, metadata, or shared UI contracts.
 * What breaks if it fails:
 * - CI blocks deployment to prevent production regressions.
 */
const fs = require("fs");
const http = require("http");
const path = require("path");
const { test, expect } = require("playwright/test");

// Playwright specs now live under QA/tests/playwright, so repo root is three levels up.
const rootDir = path.resolve(__dirname, "..", "..", "..");
const host = "127.0.0.1";
const port = 4174;

const h1Selector = ".master-head h1";
const targetSelector = ".master-head .executive-callout";

const contentTypes = {
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
  const clean = decodeURIComponent((urlPath || "/").split("?")[0]);
  if (clean === "/") return path.join(rootDir, "index.html");
  const safe = path.normalize(clean).replace(/^[/\\]+/, "").replace(/^(\.\.[/\\])+/, "");
  let filePath = path.join(rootDir, safe);
  if (fs.existsSync(filePath) && fs.statSync(filePath).isDirectory()) {
    filePath = path.join(filePath, "index.html");
  }
  if (!fs.existsSync(filePath) && !path.extname(filePath)) {
    const fallback = path.join(filePath, "index.html");
    if (fs.existsSync(fallback)) filePath = fallback;
  }
  return filePath;
}

async function startServer() {
  const server = http.createServer((req, res) => {
    const filePath = resolvePath(req.url);
    if (!filePath.startsWith(rootDir) || !fs.existsSync(filePath)) {
      res.writeHead(404);
      res.end("Not found");
      return;
    }
    const ext = path.extname(filePath).toLowerCase();
    const type = contentTypes[ext] || "application/octet-stream";
    res.writeHead(200, { "Content-Type": type });
    fs.createReadStream(filePath).pipe(res);
  });
  await new Promise((resolve, reject) => {
    server.once("error", reject);
    server.listen(port, host, () => resolve());
  });
  return server;
}

async function measureHome(page) {
  // Use DOM readiness to avoid timeouts from long-lived third-party network activity.
  await page.goto(`http://${host}:${port}/`, { waitUntil: "domcontentloaded" });
  await page.evaluate(async () => {
    if (document.fonts?.ready) await document.fonts.ready;
  });
  return page.evaluate(({ h1Sel, targetSel }) => {
    const h1 = document.querySelector(h1Sel);
    const target = document.querySelector(targetSel);
    if (!h1 || !target) {
      throw new Error("Home alignment selectors not found.");
    }
    const h1Box = h1.getBoundingClientRect();
    const targetBox = target.getBoundingClientRect();
    const h1Style = getComputedStyle(h1);
    const fontSize = Number.parseFloat(h1Style.fontSize);
    const lineHeight = Number.parseFloat(h1Style.lineHeight) || fontSize * 1.1;
    return {
      delta: h1Box.right - targetBox.right,
      oneLine: h1Box.height <= lineHeight + 1,
      fontSize: h1Style.fontSize,
    };
  }, { h1Sel: h1Selector, targetSel: targetSelector });
}

let server;

test.beforeAll(async () => {
  server = await startServer();
});

test.afterAll(async () => {
  if (server) {
    await new Promise((resolve) => server.close(resolve));
  }
});

test.use({ viewport: { width: 1440, height: 900 } });

test("home H1 aligns to manifesto callout right edge", async ({ page }) => {
  const home = await measureHome(page);
  expect(Math.abs(home.delta)).toBeLessThanOrEqual(1);
  expect(home.oneLine).toBeTruthy();
});

test("connect page H1 inherits same computed size as home H1", async ({ page }) => {
  const home = await measureHome(page);
  await page.goto(`http://${host}:${port}/connect/`, { waitUntil: "domcontentloaded" });
  await page.evaluate(async () => {
    if (document.fonts?.ready) await document.fonts.ready;
  });
  const connectSize = await page.evaluate(() => {
    const h1 = document.querySelector("h1");
    if (!h1) throw new Error("Connect H1 not found.");
    return getComputedStyle(h1).fontSize;
  });
  expect(connectSize).toBe(home.fontSize);
});
