/**
 * Invariant:
 * - The Agentic AI Employees hero and organization diagram must remain readable
 *   inside a real phone viewport.
 * Why this exists:
 * - Static contracts cannot detect flex items that visually clip at the edge of
 *   a phone screen or a fixed navigation control covering nearby content.
 * What breaks if it fails:
 * - A production mobile visitor sees truncated agent responsibilities or loses
 *   access to the next section beneath the floating orientation control.
 */
const fs = require('fs');
const http = require('http');
const path = require('path');
const { test, expect } = require('playwright/test');

const rootDir = path.resolve(__dirname, '..', '..', '..');
const host = '127.0.0.1';
const port = 4176;

const contentTypes = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
};

function resolvePath(urlPath) {
  const clean = decodeURIComponent((urlPath || '/').split('?')[0]);
  const relative = clean === '/' ? 'index.html' : clean.replace(/^[/\\]+/, '');
  let filePath = path.join(rootDir, path.normalize(relative));
  if (fs.existsSync(filePath) && fs.statSync(filePath).isDirectory()) {
    filePath = path.join(filePath, 'index.html');
  }
  return filePath;
}

async function startServer() {
  const server = http.createServer((request, response) => {
    const filePath = resolvePath(request.url);
    if (!filePath.startsWith(rootDir) || !fs.existsSync(filePath)) {
      response.writeHead(404);
      response.end('Not found');
      return;
    }
    const type = contentTypes[path.extname(filePath).toLowerCase()] || 'application/octet-stream';
    response.writeHead(200, { 'Content-Type': type });
    fs.createReadStream(filePath).pipe(response);
  });
  await new Promise((resolve, reject) => {
    server.once('error', reject);
    server.listen(port, host, resolve);
  });
  return server;
}

let server;

test.beforeAll(async () => {
  server = await startServer();
});

test.afterAll(async () => {
  if (server) await new Promise((resolve) => server.close(resolve));
});

test('agentic resource fits a phone viewport and keeps the org chart legible', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(`http://${host}:${port}/resources/agentic-ai-employees/`, { waitUntil: 'domcontentloaded' });
  await page.evaluate(async () => {
    if (document.fonts?.ready) await document.fonts.ready;
  });
  expect(await page.locator('.section-nav-fab').evaluate((node) => node.classList.contains('is-visible'))).toBe(true);

  const layout = await page.evaluate(() => {
    const chart = document.querySelector('.fleet-org-chart');
    const cards = [...document.querySelectorAll('.fleet-org-human, .fleet-org-director, .fleet-org-branch, .fleet-org-independent')];
    const chartBox = chart?.getBoundingClientRect();
    const cardBoxes = cards.map((card) => card.getBoundingClientRect());
    const fab = document.querySelector('.section-nav-fab');
    const fabBox = fab?.getBoundingClientRect();
    const nearbyHeading = document.querySelector('#fleet-roster')?.getBoundingClientRect();
    return {
      viewportWidth: window.innerWidth,
      scrollWidth: document.documentElement.scrollWidth,
      chartRight: chartBox?.right,
      cardRights: cardBoxes.map((box) => box.right),
      chartBottom: chartBox?.bottom,
      fabBottom: fabBox?.bottom,
      headingTop: nearbyHeading?.top,
    };
  });

  expect(layout.scrollWidth).toBeLessThanOrEqual(layout.viewportWidth);
  expect(layout.cardRights.every((right) => right <= layout.chartRight + 1)).toBe(true);
  expect(layout.fabBottom).toBeLessThanOrEqual(844);
  expect(layout.headingTop).toBeGreaterThan(0);

});

test('section navigation is available immediately across supported pages and viewports', async ({ page }) => {
  for (const viewport of [
    { width: 1440, height: 900 },
    { width: 390, height: 844 },
  ]) {
    await page.setViewportSize(viewport);
    for (const route of ['/about/', '/services/', '/resources/agentic-ai-employees/']) {
      await page.goto(`http://${host}:${port}${route}`, { waitUntil: 'domcontentloaded' });
      await expect(page.locator('.section-nav-fab')).toHaveClass(/is-visible/);
    }
  }
});

/**
 * Invariant:
 * - The elevated Services panels must remain genuinely static editorial content
 *   and fit on a narrow phone viewport.
 * Why this exists:
 * - A visual card treatment can accidentally create horizontal overflow or a
 *   pointer affordance that incorrectly suggests a service panel is clickable.
 */
test('services editorial panels preserve unique icon tiles without phone overflow', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(`http://${host}:${port}/services/`, { waitUntil: 'domcontentloaded' });
  await page.evaluate(async () => {
    if (document.fonts?.ready) await document.fonts.ready;
  });

  const layout = await page.evaluate(() => {
    const panels = [...document.querySelectorAll('.svc-entry')];
    const tiles = [...document.querySelectorAll('.svc-icon-tile')];
    return {
      viewportWidth: window.innerWidth,
      scrollWidth: document.documentElement.scrollWidth,
      panelCount: panels.length,
      panelCursors: panels.map((panel) => getComputedStyle(panel).cursor),
      tileCount: tiles.length,
      tileWidths: tiles.map((tile) => tile.getBoundingClientRect().width),
      tileRights: tiles.map((tile) => tile.getBoundingClientRect().right),
    };
  });

  expect(layout.scrollWidth).toBeLessThanOrEqual(layout.viewportWidth);
  expect(layout.panelCount).toBe(5);
  expect(layout.tileCount).toBe(5);
  expect(layout.panelCursors.every((cursor) => cursor === 'default')).toBe(true);
  expect(layout.tileWidths.every((width) => width >= 44)).toBe(true);
  expect(layout.tileRights.every((right) => right <= layout.viewportWidth)).toBe(true);
});
