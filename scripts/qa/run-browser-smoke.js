#!/usr/bin/env node
/**
 * Purpose:
 * - Run lightweight browser smoke checks against local static pages or a live deployed URL.
 *
 * Architectural role:
 * - Provides a fast browser layer for selective gates so page-level, mobile,
 *   navigation, analytics bootstrap, and JS hotspot regressions are caught
 *   without paying for full visual/runtime regression every time.
 *
 * Dependencies:
 * - Node.js runtime, Playwright package + Chromium browser, and a local static
 *   server when no explicit base URL is provided.
 *
 * Security/CSP considerations:
 * - Read-only browser automation only; no content mutation.
 *
 * Migration considerations:
 * - Keep scope-to-route mappings aligned with canonical routes and runtime
 *   interaction selectors when page structure evolves.
 */

const fs = require('fs');
const http = require('http');
const path = require('path');
const { chromium } = require('playwright');

const ROOT = path.resolve(__dirname, '..', '..');
const DEFAULT_HOST = '127.0.0.1';

const CONTENT_TYPES = {
  '.css': 'text/css; charset=utf-8',
  '.html': 'text/html; charset=utf-8',
  '.ico': 'image/x-icon',
  '.jpeg': 'image/jpeg',
  '.jpg': 'image/jpeg',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.webmanifest': 'application/manifest+json'
};

const NAV_LABELS = ['Home', 'About', 'Framework', 'Services', 'Connect'];
const NAV_HREFS = ['/', '/about/', '/framework/', '/services/', '/connect/'];

const SCOPE_CONFIG = {
  home: { route: '/', checks: ['home', 'nav', 'mobile', 'ga'] },
  about: { route: '/about/', checks: ['service-list', 'nav', 'mobile', 'ga'] },
  services: { route: '/services/', checks: ['service-list', 'nav', 'mobile', 'ga'] },
  framework: { route: '/framework/', checks: ['framework', 'service-list', 'nav', 'mobile', 'ga'] },
  connect: { route: '/connect/', checks: ['connect', 'service-list', 'nav', 'mobile', 'ga'] }
};

function parseArgs(argv) {
  const args = {};
  for (let index = 2; index < argv.length; index += 1) {
    const token = argv[index];
    if (!token.startsWith('--')) {
      continue;
    }
    const key = token.slice(2);
    const next = argv[index + 1];
    if (next && !next.startsWith('--')) {
      args[key] = next;
      index += 1;
    } else {
      args[key] = 'true';
    }
  }
  return args;
}

function parseScopes(scopesArg) {
  if (!scopesArg || scopesArg === 'all') {
    return Object.keys(SCOPE_CONFIG);
  }
  const scopes = scopesArg
    .split(',')
    .map((value) => value.trim())
    .filter(Boolean);

  if (!scopes.length) {
    return Object.keys(SCOPE_CONFIG);
  }

  for (const scope of scopes) {
    if (!SCOPE_CONFIG[scope]) {
      throw new Error(`Unknown browser smoke scope: ${scope}`);
    }
  }

  return scopes;
}

function normalizePathname(pathname) {
  if (pathname === '/' || !pathname) {
    return '/';
  }
  return pathname.endsWith('/') ? pathname : `${pathname}/`;
}

function resolvePath(urlPath) {
  const clean = decodeURIComponent((urlPath || '/').split('?')[0]);
  if (clean === '/') {
    return path.join(ROOT, 'index.html');
  }
  const safe = path
    .normalize(clean)
    .replace(/^[/\\]+/, '')
    .replace(/^(\.\.[/\\])+/, '');
  let filePath = path.join(ROOT, safe);
  if (filePath.endsWith(path.sep)) {
    filePath = path.join(filePath, 'index.html');
  }
  if (fs.existsSync(filePath) && fs.statSync(filePath).isDirectory()) {
    filePath = path.join(filePath, 'index.html');
  }
  if (!fs.existsSync(filePath) && !path.extname(filePath)) {
    const htmlPath = `${filePath}.html`;
    if (fs.existsSync(htmlPath)) {
      filePath = htmlPath;
    }
  }
  return filePath;
}

function startStaticServer() {
  const server = http.createServer((req, res) => {
    const filePath = resolvePath(req.url || '/');
    if (!filePath.startsWith(ROOT) || !fs.existsSync(filePath)) {
      res.writeHead(404);
      res.end('Not found');
      return;
    }
    const ext = path.extname(filePath).toLowerCase();
    const type = CONTENT_TYPES[ext] || 'application/octet-stream';
    res.writeHead(200, { 'Content-Type': type });
    fs.createReadStream(filePath).pipe(res);
  });

  return new Promise((resolve, reject) => {
    server.once('error', reject);
    server.listen(0, DEFAULT_HOST, () => {
      const address = server.address();
      resolve({
        server,
        baseUrl: `http://${DEFAULT_HOST}:${address.port}`
      });
    });
  });
}

async function withLocalServerIfNeeded(baseUrl, task) {
  if (baseUrl) {
    return task({ baseUrl, server: null });
  }

  const { server, baseUrl: resolvedBaseUrl } = await startStaticServer();
  try {
    return await task({ baseUrl: resolvedBaseUrl, server });
  } finally {
    await new Promise((resolve) => server.close(resolve));
  }
}

function recordFailures(page, runtimeIssues) {
  page.on('pageerror', (error) => {
    runtimeIssues.push(`pageerror: ${error.message}`);
  });
  page.on('console', (message) => {
    if (message.type() === 'error') {
      runtimeIssues.push(`console:${message.type()}: ${message.text()}`);
    }
  });
}

function shouldIgnoreRuntimeIssue(issue) {
  const normalized = String(issue || '');

  // Live prod smoke occasionally sees a third-party Cloudflare beacon attempt
  // that is correctly blocked by our CSP. Treating that as an app runtime
  // regression makes the release gate noisy without improving safety.
  return (
    normalized.includes('static.cloudflareinsights.com') &&
    normalized.includes('violates the following Content Security Policy directive')
  );
}

async function assertNavContract(page, routeLabel) {
  const desktopLabels = await page.locator('.site-nav a').allTextContents();
  const desktopHrefs = await page.locator('.site-nav a').evaluateAll((nodes) =>
    nodes.map((node) => node.getAttribute('href'))
  );
  const mobileLabels = await page.locator('#mobile-nav a').allTextContents();
  const mobileHrefs = await page.locator('#mobile-nav a').evaluateAll((nodes) =>
    nodes.map((node) => node.getAttribute('href'))
  );

  if (JSON.stringify(desktopLabels) !== JSON.stringify(NAV_LABELS)) {
    throw new Error(`${routeLabel}: desktop nav labels drifted`);
  }
  if (JSON.stringify(desktopHrefs) !== JSON.stringify(NAV_HREFS)) {
    throw new Error(`${routeLabel}: desktop nav hrefs drifted`);
  }
  if (JSON.stringify(mobileLabels) !== JSON.stringify(NAV_LABELS)) {
    throw new Error(`${routeLabel}: mobile nav labels drifted`);
  }
  if (JSON.stringify(mobileHrefs) !== JSON.stringify(NAV_HREFS)) {
    throw new Error(`${routeLabel}: mobile nav hrefs drifted`);
  }
}

async function assertMobileContract(page, routeLabel) {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.reload({ waitUntil: 'networkidle' });

  const menuToggle = page.locator('.menu-toggle');
  if ((await menuToggle.count()) !== 1) {
    throw new Error(`${routeLabel}: mobile menu toggle missing`);
  }

  const displays = await page.evaluate(() => {
    const toggle = document.querySelector('.menu-toggle');
    const desktopNav = document.querySelector('.site-nav');
    return {
      toggle: toggle ? window.getComputedStyle(toggle).display : 'none',
      desktop: desktopNav ? window.getComputedStyle(desktopNav).display : 'none'
    };
  });

  if (displays.toggle === 'none') {
    throw new Error(`${routeLabel}: mobile menu toggle hidden`);
  }
  if (displays.desktop !== 'none') {
    throw new Error(`${routeLabel}: desktop nav should be hidden on mobile`);
  }

  await menuToggle.click();
  const isOpen = await page.locator('#mobile-nav.open').count();
  if (isOpen !== 1) {
    throw new Error(`${routeLabel}: mobile nav failed to open`);
  }

  const overflow = await page.evaluate(() => {
    const root = document.documentElement;
    return root.scrollWidth - root.clientWidth;
  });
  if (overflow > 1) {
    throw new Error(`${routeLabel}: horizontal overflow detected on mobile (${overflow}px)`);
  }
}

async function assertGaBootstrap(page, routeLabel) {
  const gaState = await page.evaluate(() => ({
    hasAnalyticsObject: typeof window.__rbAnalytics === 'object' && window.__rbAnalytics !== null,
    hasGtag: typeof window.gtag === 'function',
    meta: document.querySelector('meta[name="ga4-measurement-id"]')?.content || null
  }));

  if (gaState.meta !== 'G-DVHD0KL633') {
    throw new Error(`${routeLabel}: GA measurement meta missing or changed`);
  }

  if (!gaState.hasAnalyticsObject && !gaState.hasGtag) {
    throw new Error(`${routeLabel}: GA bootstrap did not initialize a runtime object`);
  }
}

async function assertServiceBulletContract(page, routeLabel) {
  const result = await page.evaluate(() => {
    const first = document.querySelector('.service-list li');
    if (!first) {
      return { present: false };
    }
    const pseudo = window.getComputedStyle(first, '::before');
    return {
      present: true,
      listStyle: window.getComputedStyle(first).listStyleType,
      width: pseudo.width,
      height: pseudo.height,
      marginRight: pseudo.marginRight,
      backgroundImage: pseudo.backgroundImage
    };
  });

  if (!result.present) {
    return;
  }
  if (result.listStyle !== 'none') {
    throw new Error(`${routeLabel}: default list styling reappeared`);
  }
  if (result.width !== '8px' || result.height !== '8px') {
    throw new Error(`${routeLabel}: bullet size contract drifted (${result.width} x ${result.height})`);
  }
  if (result.marginRight !== '14px') {
    throw new Error(`${routeLabel}: bullet spacing contract drifted (${result.marginRight})`);
  }
  if (!String(result.backgroundImage).includes('bullet.png')) {
    throw new Error(`${routeLabel}: bullet asset drifted`);
  }
}

async function assertHomeContract(page) {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.reload({ waitUntil: 'networkidle' });

  const result = await page.evaluate(() => {
    const image = document.querySelector('.master-photo img, .master-photo picture img, .hero-photo img');
    const h1 = document.querySelector('.hero-head h1, .master-head h1');
    const callout = document.querySelector('.executive-callout');
    if (!image || !h1 || !callout) {
      return { missing: true };
    }
    const h1Box = h1.getBoundingClientRect();
    const calloutBox = callout.getBoundingClientRect();
    const style = window.getComputedStyle(h1);
    const lineHeight = Number.parseFloat(style.lineHeight) || Number.parseFloat(style.fontSize) * 1.1;
    return {
      missing: false,
      naturalWidth: image.naturalWidth,
      naturalHeight: image.naturalHeight,
      delta: Math.abs(h1Box.right - calloutBox.right),
      oneLine: h1Box.height <= lineHeight + 1
    };
  });

  if (result.missing) {
    throw new Error('home: hero contract nodes missing');
  }
  if (result.naturalWidth < 500 || result.naturalHeight < 700) {
    throw new Error(`home: hero image dimensions look wrong (${result.naturalWidth}x${result.naturalHeight})`);
  }
  if (result.delta > 1) {
    throw new Error(`home: hero alignment drifted by ${result.delta.toFixed(2)}px`);
  }
  if (!result.oneLine) {
    throw new Error('home: hero H1 wrapped unexpectedly');
  }
}

async function assertFrameworkContract(page) {
  await page.setViewportSize({ width: 1440, height: 960 });
  await page.reload({ waitUntil: 'networkidle' });

  const stageCount = await page.locator('.framework-progress-link').count();
  if (stageCount !== 6) {
    throw new Error(`framework: expected 6 stage pills, found ${stageCount}`);
  }

  await page.click('.framework-progress-link[href="#integration"]');
  await page.waitForTimeout(500);
  const state = await page.evaluate(() => ({
    hash: window.location.hash,
    activeCount: document.querySelectorAll('.framework-progress-marker.is-active').length,
    integrationVisible: Boolean(document.querySelector('#integration.framework-card'))
  }));

  if (state.hash !== '#integration') {
    throw new Error(`framework: stage-nav hash update failed (${state.hash})`);
  }
  if (state.activeCount !== 1) {
    throw new Error(`framework: expected exactly one active stage marker, found ${state.activeCount}`);
  }
  if (!state.integrationVisible) {
    throw new Error('framework: integration card missing after stage interaction');
  }
}

async function assertConnectContract(page) {
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.reload({ waitUntil: 'networkidle' });

  const counts = {
    name: await page.locator('#name').count(),
    email: await page.locator('#email').count(),
    editor: await page.locator('#message-editor').count(),
    submit: await page.locator('#submit-btn').count(),
    linkedin: await page.locator('.executive-action-block').count()
  };

  for (const [key, count] of Object.entries(counts)) {
    if (count !== 1) {
      throw new Error(`connect: expected one ${key} control, found ${count}`);
    }
  }
}

async function runScope(browser, baseUrl, scopeName) {
  const config = SCOPE_CONFIG[scopeName];
  const context = await browser.newContext();
  const page = await context.newPage();
  const runtimeIssues = [];
  recordFailures(page, runtimeIssues);

  try {
    await page.goto(new URL(config.route, baseUrl).toString(), { waitUntil: 'networkidle' });

    if (config.checks.includes('nav')) {
      await assertNavContract(page, scopeName);
    }
    if (config.checks.includes('ga')) {
      await assertGaBootstrap(page, scopeName);
    }
    if (config.checks.includes('service-list')) {
      await assertServiceBulletContract(page, scopeName);
    }
    if (config.checks.includes('home')) {
      await assertHomeContract(page);
    }
    if (config.checks.includes('framework')) {
      await assertFrameworkContract(page);
    }
    if (config.checks.includes('connect')) {
      await assertConnectContract(page);
    }
    if (config.checks.includes('mobile')) {
      await assertMobileContract(page, scopeName);
    }

    const actionableRuntimeIssues = runtimeIssues.filter((issue) => !shouldIgnoreRuntimeIssue(issue));

    if (actionableRuntimeIssues.length > 0) {
      throw new Error(`${scopeName}: runtime errors detected (${actionableRuntimeIssues.join(' | ')})`);
    }

    return {
      scope: scopeName,
      route: config.route,
      checks: config.checks
    };
  } finally {
    await context.close();
  }
}

async function main() {
  const args = parseArgs(process.argv);
  const scopes = parseScopes(args.scopes);
  const explicitBaseUrl = args['base-url'] || null;
  const label = args.label || (explicitBaseUrl ? 'live' : 'local');

  await withLocalServerIfNeeded(explicitBaseUrl, async ({ baseUrl }) => {
    const browser = await chromium.launch({ headless: true });
    const results = [];

    try {
      for (const scope of scopes) {
        results.push(await runScope(browser, baseUrl, scope));
      }
    } finally {
      await browser.close();
    }

    process.stdout.write(
      [
        'PASS: browser smoke checks passed.',
        `- Label: ${label}`,
        `- Base URL: ${baseUrl}`,
        `- Scopes: ${scopes.join(', ')}`,
        `- Route checks: ${results.length}`
      ].join('\n') + '\n'
    );
  });
}

if (require.main === module) {
  main().catch((error) => {
    process.stderr.write(`FAIL: ${error.message}\n`);
    process.exit(1);
  });
}

module.exports = {
  SCOPE_CONFIG,
  parseScopes,
  shouldIgnoreRuntimeIssue
};
