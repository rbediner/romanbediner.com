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

/**
 * Invariant:
 * - The downloadable Agentic Operations Architecture must expose its approved
 *   ten-page replacement through a usable, non-overflowing mobile preview.
 * Why this exists:
 * - The preview is the visitor's fastest way to assess the PDF before download;
 *   stale counts or a clipped disclosure make the artifact feel unreliable.
 */
test('agentic architecture preview opens and advances through ten pages on a phone', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(`http://${host}:${port}/resources/agentic-ai-employees/`, { waitUntil: 'networkidle' });

  await page.getByText('Preview the architecture', { exact: false }).click();
  await expect(page.getByRole('heading', { name: 'Architecture Preview' })).toBeVisible();
  await expect(page.locator('[data-carousel-count]')).toHaveText('Page 1 of 10');
  await page.getByRole('button', { name: 'Next architecture page' }).click();
  await expect(page.locator('[data-carousel-count]')).toHaveText('Page 2 of 10');

  const preview = await page.evaluate(() => ({
    scrollWidth: document.documentElement.scrollWidth,
    viewportWidth: window.innerWidth,
    pageCount: document.querySelectorAll('[data-carousel-slide]').length,
    downloadedPath: document.querySelector('[data-track-pdf-download]')?.getAttribute('href'),
    secondPreview: document.querySelector('img[src$="slide-02.png"]')?.getBoundingClientRect().width,
  }));
  expect(preview.scrollWidth).toBeLessThanOrEqual(preview.viewportWidth);
  expect(preview.pageCount).toBe(10);
  expect(preview.downloadedPath).toBe('/assets/downloads/agentic-operations-architecture-roman-bediner.pdf');
  expect(preview.secondPreview).toBeGreaterThan(0);
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

/**
 * Invariant:
 * - Dashboard and PasteFlow card groups must express the shared editorial
 *   anatomy rather than degrade into flat bordered text boxes.
 * Why this exists:
 * - These two resource routes exercise the compact and standard static-card
 *   categories at different content densities and phone widths.
 */
test('resource card categories keep editorial anatomy on desktop and phone widths', async ({ page }) => {
  for (const viewport of [
    { width: 1440, height: 900 },
    { width: 390, height: 844 },
  ]) {
    await page.setViewportSize(viewport);

    await page.goto(`http://${host}:${port}/resources/ai-enabled-operations-dashboard/`, { waitUntil: 'domcontentloaded' });
    const dashboard = await page.evaluate(() => ({
      viewportWidth: window.innerWidth,
      scrollWidth: document.documentElement.scrollWidth,
      questions: document.querySelectorAll('.resource-dashboard-question-item').length,
      quadrants: document.querySelectorAll('.resource-dashboard-quadrant').length,
      views: document.querySelectorAll('.resource-dashboard-view-block').length,
      questionMarker: getComputedStyle(document.querySelector('.resource-dashboard-question-item'), '::before').content,
      quadrantMarker: getComputedStyle(document.querySelector('.resource-dashboard-quadrant'), '::before').content,
      quadrantIcons: [...document.querySelectorAll('.resource-dashboard-quadrant .resource-system-icon img')].map((icon) => icon.getAttribute('src')),
      quadrantIconFilters: [...document.querySelectorAll('.resource-dashboard-quadrant .resource-system-icon img')].map((icon) => getComputedStyle(icon).filter),
      quadrantHeights: [...document.querySelectorAll('.resource-dashboard-quadrant')].map((card) => card.getBoundingClientRect().height),
      viewHeights: [...document.querySelectorAll('.resource-dashboard-view-block')].map((card) => card.getBoundingClientRect().height),
      viewIconInsets: [...document.querySelectorAll('.resource-dashboard-view-block')].map((card) => {
        const cardBounds = card.getBoundingClientRect();
        const iconBounds = card.querySelector('.resource-system-icon').getBoundingClientRect();
        return iconBounds.left - cardBounds.left;
      }),
      conversationParagraphs: document.querySelectorAll('.resource-conversation-copy').length,
      conversationCopyFontSize: parseFloat(getComputedStyle(document.querySelector('.resource-conversation-copy')).fontSize),
    }));
    expect(dashboard.scrollWidth).toBeLessThanOrEqual(dashboard.viewportWidth);
    expect(dashboard.questions).toBe(6);
    expect(dashboard.quadrants).toBe(4);
    expect(dashboard.views).toBe(3);
    // Decorative number chips add no orientation value in these card families.
    // They must stay removed at every viewport, leaving icons and labels to
    // carry the hierarchy.
    expect(dashboard.questionMarker).toBe('none');
    expect(dashboard.quadrantMarker).toBe('none');
    // Short information must not occupy gallery-sized cards on desktop.
    expect(Math.max(...dashboard.quadrantHeights)).toBeLessThanOrEqual(viewport.width > 767 ? 190 : 260);
    // These views remain content-sized. The longest explanatory unit is still
    // compact without compressing its copy into an unreadable text block.
    expect(Math.max(...dashboard.viewHeights)).toBeLessThanOrEqual(viewport.width > 767 ? 180 : 260);
    expect(new Set(dashboard.quadrantIcons).size).toBe(4);
    // Resource icons use the site's established dark-outline ink, not a blue
    // filter that can make a mark disappear against a pale blue tile.
    expect(dashboard.quadrantIconFilters.every((filter) => filter === 'none')).toBe(true);
    // Dashboard-view tiles must keep the same comfortable inset as the primary
    // cards; zero padding makes the icon visually cling to the card edge.
    expect(dashboard.viewIconInsets.every((inset) => inset >= 20)).toBe(true);
    expect(dashboard.conversationParagraphs).toBe(2);
    if (viewport.width <= 767) expect(dashboard.conversationCopyFontSize).toBeLessThanOrEqual(16);

    await page.goto(`http://${host}:${port}/resources/pasteflow/`, { waitUntil: 'domcontentloaded' });
    const pasteflow = await page.evaluate(() => ({
      viewportWidth: window.innerWidth,
      scrollWidth: document.documentElement.scrollWidth,
      capabilities: document.querySelectorAll('.resource-pasteflow-capability-item').length,
      marker: getComputedStyle(document.querySelector('.resource-pasteflow-capability-item'), '::before').content,
      titleFont: getComputedStyle(document.querySelector('.resource-pasteflow-capability-item h3')).fontFamily,
      icons: [...document.querySelectorAll('.resource-pasteflow-capability-item .resource-system-icon img')].map((icon) => icon.getAttribute('src')),
      iconFilters: [...document.querySelectorAll('.resource-pasteflow-capability-item .resource-system-icon img')].map((icon) => getComputedStyle(icon).filter),
      cardHeights: [...document.querySelectorAll('.resource-pasteflow-capability-item')].map((card) => card.getBoundingClientRect().height),
    }));
    expect(pasteflow.scrollWidth).toBeLessThanOrEqual(pasteflow.viewportWidth);
    expect(pasteflow.capabilities).toBe(6);
    expect(pasteflow.marker).toBe('none');
    expect(pasteflow.titleFont).toContain('Cormorant Garamond');
    // Keep the capability grid compact on desktop while allowing phone copy
    // to use normal reading height.
    expect(Math.max(...pasteflow.cardHeights)).toBeLessThanOrEqual(viewport.width > 767 ? 210 : 260);
    // Every capability receives a specific mnemonic, never a repeated filler icon.
    expect(new Set(pasteflow.icons).size).toBe(6);
    expect(pasteflow.iconFilters.every((filter) => filter === 'none')).toBe(true);
  }
});

/**
 * Invariant:
 * - A shared surface or navigation change must not introduce horizontal drift
 *   on an unrelated canonical page.
 * Why this exists:
 * - The site deliberately has several visual systems (editorial chapters,
 *   framework stages, architecture diagrams, artifacts, and compact cards),
 *   so card refinements need a whole-site viewport safety net.
 */
test('every canonical route remains viewport-safe at desktop and phone widths', async ({ page }) => {
  const routes = [
    '/', '/about/', '/resources/', '/resources/agentic-ai-employees/',
    '/resources/ai-enabled-operations-framework-summary/', '/resources/ai-enabled-operations-dashboard/',
    '/resources/pasteflow/', '/services/', '/connect/', '/framework/',
    '/framework/opportunity/productizing-operations/', '/framework/design/operations-as-product/',
    '/framework/integration/ai-operating-layer/', '/framework/execution/operational-lanes/',
    '/framework/signals/operational-signals/', '/framework/evolution/agentic-guardrails/',
  ];

  for (const viewport of [{ width: 1440, height: 1000 }, { width: 390, height: 844 }]) {
    await page.setViewportSize(viewport);
    for (const route of routes) {
      await page.goto(`http://${host}:${port}${route}`, { waitUntil: 'domcontentloaded' });
      const dimensions = await page.evaluate(() => ({
        viewportWidth: window.innerWidth,
        scrollWidth: document.documentElement.scrollWidth,
      }));
      expect(dimensions.scrollWidth, `${route} at ${viewport.width}px`).toBeLessThanOrEqual(dimensions.viewportWidth);
    }
  }
});

/**
 * Invariant:
 * - Long About and Services prose becomes a readable editorial sequence on a
 *   phone instead of a stack of artificially boxed, oversized cards.
 */
test('long-form chapters use editorial mobile rhythm rather than oversized card chrome', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });

  await page.goto(`http://${host}:${port}/about/`, { waitUntil: 'domcontentloaded' });
  const about = await page.evaluate(() => {
    const chapter = document.querySelector('.arc-item');
    const copy = document.querySelector('.arc-narrative p');
    const styles = getComputedStyle(chapter);
    return { borderTop: styles.borderTopWidth, boxShadow: styles.boxShadow, copySize: parseFloat(getComputedStyle(copy).fontSize) };
  });
  expect(about.borderTop).toBe('1px');
  expect(about.boxShadow).toBe('none');
  expect(about.copySize).toBeGreaterThanOrEqual(16);

  await page.goto(`http://${host}:${port}/services/`, { waitUntil: 'domcontentloaded' });
  const services = await page.evaluate(() => {
    const chapter = document.querySelector('.svc-entry');
    const copy = document.querySelector('.svc-body > p:not(.svc-kicker):not(.svc-lede):not(.svc-best-fit)');
    const lead = document.querySelector('.svc-lede');
    const bestFit = document.querySelector('.svc-best-fit');
    const paragraphs = [...document.querySelectorAll('.svc-body > p:not(.svc-kicker)')];
    const styles = getComputedStyle(chapter);
    return {
      borderTop: styles.borderTopWidth,
      boxShadow: styles.boxShadow,
      copySize: parseFloat(getComputedStyle(copy).fontSize),
      leadSize: parseFloat(getComputedStyle(lead).fontSize),
      leadWeight: parseInt(getComputedStyle(lead).fontWeight, 10),
      bestFitRule: getComputedStyle(bestFit).borderLeftWidth,
      paragraphGap: paragraphs[2].getBoundingClientRect().top - paragraphs[1].getBoundingClientRect().bottom,
    };
  });
  expect(services.borderTop).toBe('1px');
  expect(services.boxShadow).toBe('none');
  expect(services.copySize).toBeGreaterThanOrEqual(16);
  // The opening thesis and closing fit signal must remain visible landmarks,
  // without using an oversized phone type scale or heavy card treatment.
  expect(services.leadSize).toBe(services.copySize);
  expect(services.leadWeight).toBeGreaterThanOrEqual(600);
  expect(services.bestFitRule).toBe('2px');
  expect(services.paragraphGap).toBeLessThanOrEqual(18);
});
