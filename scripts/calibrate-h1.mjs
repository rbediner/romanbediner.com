/*
 * Purpose:
 * - Automatically calibrate the global desktop H1 size token against the Home hero callout boundary.
 *
 * Architectural role:
 * - Updates `--h1-size-desktop` in `/styles/site.css` as the single source of truth for H1 sizing.
 * - Produces deterministic artifacts and logs for visual alignment debugging.
 *
 * Dependencies:
 * - Node.js runtime
 * - Playwright Chromium (`playwright` package and installed browser binary)
 *
 * Migration considerations:
 * - Assumes static file serving from repository root and folder-based clean routes.
 * - If hosting or route resolution changes, update `resolvePath`, route targets, and static server assumptions.
 */
import fs from "node:fs";
import http from "node:http";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "..");
const siteCssPath = path.join(rootDir, "styles", "site.css");
// Store calibration outputs under QA/results to keep root clean and purpose-driven.
const artifactsDir = path.join(rootDir, "QA", "results", "h1-calibration");
const finalHeroShotPath = path.join(rootDir, "QA", "results", "h1-calibration", "h1-final.png");
const viewport = { width: 1440, height: 900 };
const host = "127.0.0.1";
const port = 4173;

const h1Selector = ".master-head h1";
const targetSelector = ".master-head .executive-callout";

const maxIterations = 120;
const minFontPx = 28;
const maxFontPx = 64;
const tolerancePx = 1;

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

// Resolve URL paths to static files in project root.
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

function startStaticServer() {
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

  return new Promise((resolve, reject) => {
    server.once("error", reject);
    server.listen(port, host, () => resolve(server));
  });
}

function readCurrentSize() {
  const css = fs.readFileSync(siteCssPath, "utf8");
  const match = css.match(/(--h1-size-desktop:\s*)(\d+)(px;)/);
  if (!match) throw new Error("Could not find --h1-size-desktop in styles/site.css");
  return Number.parseInt(match[2], 10);
}

function writeSize(fontPx) {
  const css = fs.readFileSync(siteCssPath, "utf8");
  const nextCss = css.replace(/(--h1-size-desktop:\s*)\d+(px;)/, `$1${fontPx}$2`);
  if (nextCss === css) throw new Error("Failed to update --h1-size-desktop in styles/site.css");
  fs.writeFileSync(siteCssPath, nextCss, "utf8");
}

async function measure(page) {
  await page.goto(`http://${host}:${port}/`, { waitUntil: "networkidle" });
  await page.evaluate(async () => {
    if (document.fonts?.ready) await document.fonts.ready;
    await new Promise((resolve) => requestAnimationFrame(() => resolve()));
    await new Promise((resolve) => requestAnimationFrame(() => resolve()));
  });
  return page.evaluate(({ h1Sel, targetSel }) => {
    const h1 = document.querySelector(h1Sel);
    const target = document.querySelector(targetSel);
    if (!h1 || !target) {
      throw new Error(`Selector lookup failed (h1=${Boolean(h1)}, target=${Boolean(target)})`);
    }
    const h1Box = h1.getBoundingClientRect();
    const targetBox = target.getBoundingClientRect();
    const fontSize = Number.parseFloat(getComputedStyle(h1).fontSize);
    const lineHeight = Number.parseFloat(getComputedStyle(h1).lineHeight) || fontSize * 1.1;
    return {
      h1Right: h1Box.x + h1Box.width,
      targetRight: targetBox.x + targetBox.width,
      delta: h1Box.x + h1Box.width - (targetBox.x + targetBox.width),
      oneLine: h1Box.height <= lineHeight + 1,
      computedFontPx: fontSize,
    };
  }, { h1Sel: h1Selector, targetSel: targetSelector });
}

async function measureConnectFontSize(page) {
  await page.goto(`http://${host}:${port}/connect/`, { waitUntil: "networkidle" });
  await page.evaluate(async () => {
    if (document.fonts?.ready) await document.fonts.ready;
    await new Promise((resolve) => requestAnimationFrame(() => resolve()));
    await new Promise((resolve) => requestAnimationFrame(() => resolve()));
  });
  return page.evaluate(() => {
    const h1 = document.querySelector("h1");
    if (!h1) {
      throw new Error("Connect H1 not found.");
    }
    return Number.parseFloat(getComputedStyle(h1).fontSize);
  });
}

async function run() {
  fs.mkdirSync(artifactsDir, { recursive: true });
  const logs = [];

  const server = await startStaticServer();
  let browser;
  try {
    let currentSize = readCurrentSize();
    let previousDelta = null;
    browser = await chromium.launch({ headless: true });
    const page = await browser.newPage({ viewport });

    for (let i = 0; i < maxIterations; i += 1) {
      const result = await measure(page);
      logs.push({ iteration: i, fontPx: currentSize, ...result });

      // Keep first iteration screenshot as baseline artifact.
      if (i === 0) {
        await page.screenshot({ path: path.join(artifactsDir, "iteration-first.png"), fullPage: true });
      }

      // Save screenshot when sign flips to help debugging overshoot.
      if (previousDelta !== null && Math.sign(previousDelta) !== Math.sign(result.delta)) {
        await page.screenshot({ path: path.join(artifactsDir, `iteration-overshoot-${i}.png`), fullPage: true });
      }

      if (!result.oneLine) {
        throw new Error(`H1 wrapped to multiple lines at ${currentSize}px; calibration aborted.`);
      }

      if (Math.abs(result.delta) <= tolerancePx) {
        await page.screenshot({ path: path.join(artifactsDir, "iteration-final.png"), fullPage: true });
        await page.screenshot({ path: finalHeroShotPath, fullPage: false });
        const connectFontPx = await measureConnectFontSize(page);
        const inheritancePass = connectFontPx === result.computedFontPx;
        const alignmentPass = Math.abs(result.delta) <= tolerancePx;
        fs.writeFileSync(path.join(artifactsDir, "calibration-log.json"), JSON.stringify(logs, null, 2), "utf8");
        console.log(`Final calibrated size: ${currentSize}px`);
        console.log(`Final delta: ${result.delta}px`);
        console.log(`Iterations used: ${i + 1}`);
        console.log(`Global inheritance check: ${inheritancePass ? "PASS" : "FAIL"}`);
        console.log(`Alignment check: ${alignmentPass ? "PASS" : "FAIL"}`);
        console.log(`Selectors used: ${h1Selector} | ${targetSelector}`);
        if (!inheritancePass || !alignmentPass) {
          throw new Error(
            `Validation failed (inheritancePass=${inheritancePass}, alignmentPass=${alignmentPass}, connectFontPx=${connectFontPx}, homeFontPx=${result.computedFontPx}, delta=${result.delta})`
          );
        }
        return;
      }

      // Delta > 1 means H1 is too wide and must shrink by exactly 1px.
      const nextSize = currentSize + (result.delta > tolerancePx ? -1 : 1);
      if (nextSize < minFontPx || nextSize > maxFontPx) {
        throw new Error(
          `Calibration hit font-size safety limit. nextSize=${nextSize}px, delta=${result.delta}px, iteration=${i}`
        );
      }

      writeSize(nextSize);
      currentSize = nextSize;
      previousDelta = result.delta;
    }

    throw new Error(`Calibration exceeded ${maxIterations} iterations.`);
  } finally {
    if (browser) await browser.close();
    await new Promise((resolve) => server.close(resolve));
  }
}

run().catch((error) => {
  console.error(`Calibration failed: ${error.message}`);
  process.exit(1);
});
