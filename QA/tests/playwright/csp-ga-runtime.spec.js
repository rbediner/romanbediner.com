/**
 * Invariant:
 * - Canonical pages must remain CSP-clean at runtime and continue emitting GA runtime requests.
 * Why this exists:
 * - CSP regressions and analytics outages are high-impact production failures that static checks can miss.
 * What breaks if it fails:
 * - CI blocks deployment because browser-executed scripts would be blocked or GA would silently fail.
 */
const fs = require('fs');
const http = require('http');
const path = require('path');
const { test, expect } = require('playwright/test');

// Playwright specs now live under QA/tests/playwright, so repo root is three levels up.
const rootDir = path.resolve(__dirname, '..', '..', '..');
const host = '127.0.0.1';
const port = 4175;
const routes = ['/', '/about/', '/services/', '/framework/', '/resources/', '/resources/ai-enabled-operations-framework-summary/', '/connect/'];

const contentTypes = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.webmanifest': 'application/manifest+json'
};

function resolvePath(urlPath) {
  const clean = decodeURIComponent((urlPath || '/').split('?')[0]);
  if (clean === '/') return path.join(rootDir, 'index.html');
  const safe = path.normalize(clean).replace(/^[/\\]+/, '').replace(/^(\.\.[/\\])+/, '');
  let filePath = path.join(rootDir, safe);
  if (fs.existsSync(filePath) && fs.statSync(filePath).isDirectory()) {
    filePath = path.join(filePath, 'index.html');
  }
  if (!fs.existsSync(filePath) && !path.extname(filePath)) {
    const fallback = path.join(filePath, 'index.html');
    if (fs.existsSync(fallback)) filePath = fallback;
  }
  return filePath;
}

async function startServer() {
  const server = http.createServer((req, res) => {
    const filePath = resolvePath(req.url);
    if (!filePath.startsWith(rootDir) || !fs.existsSync(filePath)) {
      res.writeHead(404);
      res.end('Not found');
      return;
    }
    const ext = path.extname(filePath).toLowerCase();
    const type = contentTypes[ext] || 'application/octet-stream';
    res.writeHead(200, { 'Content-Type': type });
    fs.createReadStream(filePath).pipe(res);
  });

  await new Promise((resolve, reject) => {
    server.once('error', reject);
    server.listen(port, host, () => resolve());
  });
  return server;
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

test.describe('CSP and GA runtime contract', () => {
  for (const route of routes) {
    test(`route ${route} has no CSP runtime violations and emits GA requests`, async ({ page }) => {
      const requests = [];
      const consoleErrors = [];

      page.on('request', (request) => requests.push(request.url()));
      page.on('console', (msg) => {
        if (msg.type() === 'error') {
          consoleErrors.push(msg.text());
        }
      });

      // `networkidle` can hang on third-party CDN activity; DOM readiness is deterministic for this contract.
      await page.goto(`http://${host}:${port}${route}`, { waitUntil: 'domcontentloaded' });
      await page.waitForTimeout(2000);

      const cspLikeErrors = consoleErrors.filter((entry) => {
        const text = entry.toLowerCase();
        return text.includes('content security policy') || text.includes('refused to execute script') || text.includes('csp');
      });

      expect(cspLikeErrors, `CSP runtime console errors on ${route}: ${JSON.stringify(cspLikeErrors)}`).toEqual([]);

      const loaderHits = requests.filter((url) => url.includes('googletagmanager.com/gtag/js'));
      const collectHits = requests.filter((url) => url.includes('google-analytics.com/g/collect'));

      expect(loaderHits.length, `Missing GA loader request on ${route}`).toBeGreaterThanOrEqual(1);
      expect(collectHits.length, `Missing GA collect request on ${route}`).toBeGreaterThanOrEqual(1);
    });
  }
});
