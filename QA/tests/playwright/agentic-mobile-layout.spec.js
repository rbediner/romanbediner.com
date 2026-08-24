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
 * - The downloadable Agentic Fleet Build Guide must expose its approved
 *   twenty-four-page implementation artifact through a usable, non-overflowing mobile preview.
 * Why this exists:
 * - The preview is the visitor's fastest way to assess the PDF before download;
 *   stale counts or a clipped disclosure make the artifact feel unreliable.
 */
test('agentic fleet build guide preview opens, advances, and closes on a phone', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(`http://${host}:${port}/resources/agentic-ai-employees/`, { waitUntil: 'networkidle' });

  await page.getByText('Preview the build guide', { exact: false }).click();
  await expect(page.getByRole('heading', { name: 'Agentic Fleet Build Guide Preview' })).toBeVisible();
  await expect(page.locator('[data-carousel-count]')).toHaveText('Page 1 of 24');
  await page.getByRole('button', { name: 'Next build guide page' }).click();
  await expect(page.locator('[data-carousel-count]')).toHaveText('Page 2 of 24');
  await page.getByRole('button', { name: 'Expand build guide page preview' }).click();
  await expect(page.getByRole('button', { name: 'Close preview' })).toBeVisible();
  await page.getByRole('button', { name: 'Close preview' }).click();
  await expect(page.getByRole('button', { name: 'Close preview' })).toBeHidden();

  const preview = await page.evaluate(() => ({
    scrollWidth: document.documentElement.scrollWidth,
    viewportWidth: window.innerWidth,
    pageCount: document.querySelectorAll('[data-carousel-slide]').length,
    downloadedPath: document.querySelector('[data-track-pdf-download]')?.getAttribute('href'),
    secondPreview: document.querySelector('img[src$="slide-02.png"]')?.getBoundingClientRect().width,
  }));
  expect(preview.scrollWidth).toBeLessThanOrEqual(preview.viewportWidth);
  expect(preview.pageCount).toBe(24);
  expect(preview.downloadedPath).toBe('/assets/downloads/agentic-fleet-build-guide-roman-bediner.pdf');
  expect(preview.secondPreview).toBeGreaterThan(0);
});

/**
 * Invariant:
 * - The first-agent Markdown construction contract is reachable and copyable
 *   from both existing agentic resource surfaces.
 * Why this exists:
 * - A real build artifact must survive without the PDF preview and cannot be
 *   hidden behind a new route or a JavaScript-only download flow.
 */
test('agent builder starter prompt downloads and copies from the flagship and hub', async ({ page }) => {
  await page.addInitScript(() => {
    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: {
        writeText: async (value) => { window.__copiedAgentBuilderStarter = value; },
      },
    });
  });

  for (const route of ['/resources/agentic-ai-employees/', '/resources/']) {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(`http://${host}:${port}${route}`, { waitUntil: 'networkidle' });
    const download = page.getByRole('link', { name: 'Download the starter prompt' });
    await expect(download).toHaveAttribute('href', '/assets/downloads/agent-builder-starter-prompt.md');
    if (route === '/resources/agentic-ai-employees/') {
      await download.scrollIntoViewIfNeeded();
      // The floating page nav is useful outside the artifact panels, but it
      // must yield whenever it would overlap the primary build action.
      await expect(page.locator('.section-nav-fab')).toHaveClass(/is-contextually-hidden/);
    }
    await page.getByRole('button', { name: 'Copy the starter prompt' }).click();
    await expect(page.getByRole('button', { name: 'Copied the starter prompt' })).toBeVisible();
    const copied = await page.evaluate(() => window.__copiedAgentBuilderStarter || '');
    expect(copied).toContain('# Agent Builder Starter Prompt');
    expect(copied).toContain('Nothing fails silently.');
    const width = await page.evaluate(() => ({ scrollWidth: document.documentElement.scrollWidth, viewportWidth: window.innerWidth }));
    expect(width.scrollWidth).toBeLessThanOrEqual(width.viewportWidth);
  }
});

/**
 * Invariant:
 * - The Resources hub keeps the downloadable architecture inside the Agentic
 *   AI Employees card and renders pages from the current canonical PDF.
 * Why this exists:
 * - A detached or stale preview makes the hub contradict the actual download
 *   and hides the artifact relationship a visitor needs to understand.
 * What breaks if it fails:
 * - The hub can regress to an always-open old deck or overflow when its
 *   disclosure opens on a phone.
 */
test('resources hub keeps the current architecture preview inside the Agentic AI Employees card', async ({ page }) => {
  for (const viewport of [
    { width: 1440, height: 900 },
    { width: 390, height: 844 },
  ]) {
    await page.setViewportSize(viewport);
    await page.goto(`http://${host}:${port}/resources/`, { waitUntil: 'networkidle' });

    const card = page.locator('[data-resource-card="agentic-ai-employees"]');
    const preview = card.locator('.resource-card-artifact-preview');
    await expect(preview).not.toHaveAttribute('open', '');
    await expect(card.getByText('Flagship first-agent build kit.', { exact: true })).toBeVisible();
    await expect(card.getByRole('link', { name: 'Explore the build guide' })).toBeVisible();

    await preview.getByText('Preview the build guide', { exact: false }).click();
    await expect(preview).toHaveAttribute('open', '');
    await expect(preview.getByRole('heading', { name: 'Agentic Fleet Build Guide Preview' })).toBeVisible();
    await expect(preview.locator('[data-carousel-count]')).toHaveText('Page 1 of 24');
    await preview.getByRole('button', { name: 'Next build guide page' }).click();
    await expect(preview.locator('[data-carousel-count]')).toHaveText('Page 2 of 24');

    const layout = await page.evaluate(() => ({
      viewportWidth: window.innerWidth,
      scrollWidth: document.documentElement.scrollWidth,
      standalonePreview: Boolean(document.querySelector('.resource-artifact-preview')),
      pageCount: document.querySelectorAll('[data-resource-card="agentic-ai-employees"] [data-carousel-slide]').length,
      downloadedPath: document.querySelector('[data-resource-card="agentic-ai-employees"] [data-track-pdf-download]')?.getAttribute('href'),
      compactHeights: [...document.querySelectorAll('.resource-card--compact')].map((card) => card.getBoundingClientRect().height),
      resourcePills: [...document.querySelectorAll('.resource-meta')].map((pill) => {
        const box = pill.getBoundingClientRect();
        const style = getComputedStyle(pill);
        return {
          height: box.height,
          minHeight: style.minHeight,
          lineHeight: style.lineHeight,
          borderRadius: style.borderRadius,
        };
      }),
      compactPillTitleGap: [...document.querySelectorAll('.resource-card--compact .resource-card-heading .resource-meta')].map((pill) => getComputedStyle(pill).marginBottom),
      primaryCtaHeights: [...document.querySelectorAll('.resource-primary-cta')].map((cta) => cta.getBoundingClientRect().height),
    }));
    expect(layout.scrollWidth).toBeLessThanOrEqual(layout.viewportWidth);
    expect(layout.standalonePreview).toBe(false);
    expect(layout.pageCount).toBe(24);
    expect(layout.downloadedPath).toBe('/assets/downloads/agentic-fleet-build-guide-roman-bediner.pdf');
    // Resource metadata must read as one component across the flagship and
    // supporting rows. Labels may vary in width with their real copy, but the
    // shared pill geometry may not vary by card context.
    // The hub has one flagship plus four compact supporting resources.
    expect(layout.resourcePills).toHaveLength(5);
    expect(layout.resourcePills.every((pill) => pill.height === 34)).toBe(true);
    expect(layout.resourcePills.every((pill) => pill.minHeight === '34px')).toBe(true);
    expect(layout.resourcePills.every((pill) => pill.lineHeight === '12px')).toBe(true);
    expect(layout.resourcePills.every((pill) => pill.borderRadius === '999px')).toBe(true);
    expect(layout.compactPillTitleGap).toHaveLength(4);
    expect(layout.compactPillTitleGap.every((gap) => gap === '12px')).toBe(true);
    expect(layout.primaryCtaHeights.every((height) => height === 48)).toBe(true);
    // The supporting resources should scan as compact editorial rows, not
    // repeat the flagship artifact card's oversized vertical treatment.
    expect(Math.max(...layout.compactHeights)).toBeLessThanOrEqual(viewport.width > 767 ? 260 : 440);
  }
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
    '/', '/about/', '/resources/', '/resources/ai-project-manager/', '/resources/agentic-ai-employees/',
    '/resources/ai-enabled-operations-framework-summary/', '/resources/ai-enabled-operations-dashboard/',
    '/resources/pasteflow/', '/services/', '/connect/', '/privacy/', '/framework/',
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
