#!/usr/bin/env node
/**
 * Invariant:
 * - The Cloudflare edge worker must negotiate Markdown without changing normal origin responses.
 * Why this exists:
 * - GitHub Pages is static, so an edge regression would remove the only safe Accept-aware path.
 * What breaks if it fails:
 * - Agents can receive HTML for a Markdown request or a cache can mix the two representations.
 */
const path = require('path');
const { pathToFileURL } = require('url');

async function run() {
  const worker = await import(pathToFileURL(path.resolve(__dirname, '..', '..', 'agent-access', 'worker.mjs')).href);
  const markdownRequest = new Request('https://romanbediner.com/', { headers: { Accept: 'text/markdown, text/html;q=0.9' } });
  const markdownResponse = await worker.handleRequest(markdownRequest, { ORIGIN_BASE_URL: 'https://example.com/site/' });

  if (markdownResponse.headers.get('Content-Type') !== 'text/markdown; charset=utf-8') throw new Error('Markdown response must set the expected content type.');
  if (markdownResponse.headers.get('Vary') !== 'Accept, Accept-Encoding') throw new Error('Markdown response must vary by Accept and Accept-Encoding.');
  if (markdownResponse.headers.get('Cache-Control') !== 'no-store') throw new Error('Markdown response must avoid unreviewed cache mixing.');
  if (!(await markdownResponse.text()).includes('# Roman Bediner')) throw new Error('Homepage Markdown response must describe the site.');

  if (worker.wantsMarkdown(new Request('https://romanbediner.com/', { headers: { Accept: 'text/html' } }))) throw new Error('HTML-only requests must not negotiate Markdown.');
  if (worker.mergeVary('Accept-Encoding', 'Accept') !== 'Accept-Encoding, Accept') throw new Error('Vary values must merge without replacing origin behavior.');
  if (worker.mergeVary('Accept, Accept-Encoding', 'Accept') !== 'Accept, Accept-Encoding') throw new Error('Vary values must not duplicate Accept.');

  const proxiedRequest = new Request('https://romanbediner.com/privacy/?source=test', { headers: { Accept: 'text/html' } });
  let proxiedUrl = '';
  const proxiedResponse = await worker.handleRequest(proxiedRequest, { ORIGIN_BASE_URL: 'https://example.com/site/' }, async (request) => {
    proxiedUrl = request.url;
    return new Response('origin HTML', { headers: { Vary: 'Accept-Encoding', 'Content-Type': 'text/html; charset=utf-8' } });
  });
  if (proxiedUrl !== 'https://example.com/site/privacy/?source=test') throw new Error('Normal requests must preserve the origin base path, route, and query string.');
  if (proxiedResponse.headers.get('Vary') !== 'Accept-Encoding, Accept') throw new Error('Normal responses must vary by Accept without dropping origin Vary values.');
  if ((await proxiedResponse.text()) !== 'origin HTML') throw new Error('Normal responses must preserve origin bodies.');

  // A routed production Worker must fetch the configured zone origin, not GitHub Pages'
  // public URL. The latter redirects to the canonical domain and would loop back here.
  let productionRequest = null;
  const productionResponse = await worker.handleRequest(proxiedRequest, { USE_ZONE_ORIGIN: 'true' }, async (request) => {
    productionRequest = request;
    return new Response('production HTML', { headers: { 'Content-Type': 'text/html; charset=utf-8' } });
  });
  if (productionRequest !== proxiedRequest) throw new Error('Production requests must pass through to Cloudflare\'s configured origin without rewriting the public URL.');
  if (productionResponse.headers.get('Vary') !== 'Accept') throw new Error('Production origin responses must still vary by Accept.');
  if ((await productionResponse.text()) !== 'production HTML') throw new Error('Production origin responses must preserve origin bodies.');

  console.log('PASS: agent-access edge worker negotiation and origin proxy contracts passed.');
}

run().catch((error) => {
  console.error(`FAIL: ${error.message}`);
  process.exit(1);
});
