#!/usr/bin/env node
/**
 * Purpose:
 * - Shared route health helpers for validating sitemap-backed URL availability.
 * Architectural role:
 * - Centralizes route extraction and status checks used by preview/prod deploy validators.
 * Dependencies:
 * - Node.js runtime with URL + fetch support (Node 20+).
 * Security/CSP considerations:
 * - Read-only HTTP GET checks against target deployment endpoints.
 * Migration considerations:
 * - Keep sitemap parsing aligned with URL contracts when route model changes.
 */

function requireCondition(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

function extractRoutePathnames(sitemapText) {
  const locMatches = [...sitemapText.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => match[1].trim());
  requireCondition(locMatches.length > 0, 'Sitemap did not include any <loc> URLs.');

  const paths = [];
  for (const loc of locMatches) {
    let pathname;
    try {
      const url = new URL(loc);
      pathname = url.pathname || '/';
    } catch (error) {
      throw new Error(`Invalid sitemap <loc> URL: ${loc}`);
    }

    if (!pathname.startsWith('/')) {
      pathname = `/${pathname}`;
    }

    paths.push(pathname);
  }

  return [...new Set(paths)];
}

function resolvePathForBase(baseUrl, canonicalPathname) {
  const parsedBase = new URL(baseUrl);
  const basePrefix = parsedBase.pathname === '/' ? '/' : `${parsedBase.pathname.replace(/\/+$/, '')}/`;

  if (canonicalPathname === '/') {
    return basePrefix;
  }

  if (!canonicalPathname.startsWith('/')) {
    throw new Error(`Canonical pathname must start with "/": ${canonicalPathname}`);
  }

  const trimmed = canonicalPathname.replace(/^\/+/, '');
  if (basePrefix === '/') {
    return `/${trimmed}`;
  }
  return `${basePrefix}${trimmed}`;
}

async function fetchText(baseUrl, pathname) {
  const target = new URL(pathname, baseUrl).toString();
  const response = await fetch(target, { redirect: 'follow' });
  const text = await response.text();
  return { target, response, text };
}

async function validateRouteStatuses(baseUrl, canonicalRoutes) {
  const results = [];
  for (const route of canonicalRoutes) {
    const mappedPath = resolvePathForBase(baseUrl, route);
    const check = await fetchText(baseUrl, mappedPath);
    results.push({
      canonicalRoute: route,
      mappedPath,
      target: check.target,
      status: check.response.status,
      ok: check.response.ok
    });
  }

  const failed = results.filter((item) => !item.ok);
  if (failed.length > 0) {
    const details = failed.map((item) => `${item.canonicalRoute} -> ${item.mappedPath} [${item.status}]`).join(', ');
    throw new Error(`Route status check failed: ${details}`);
  }

  return results;
}

module.exports = {
  extractRoutePathnames,
  fetchText,
  requireCondition,
  resolvePathForBase,
  validateRouteStatuses
};
