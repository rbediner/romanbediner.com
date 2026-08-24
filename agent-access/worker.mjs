/**
 * Purpose:
 * - Provide a cache-safe Markdown representation to agents that explicitly request it.
 *
 * Architectural role:
 * - This Cloudflare Worker sits in front of the static GitHub Pages origin only when
 *   the approved production route is deployed. Production browser requests pass to
 *   Cloudflare's configured origin unchanged; Markdown-capable agents receive a compact site guide.
 *
 * Security and cache considerations:
 * - Markdown responses are intentionally not cached, preventing a Markdown variant
 *   from being served to a browser by a cache rule that does not honor Vary.
 * - The normal origin response retains its headers while Vary gains Accept.
 */

const SITE_URL = 'https://romanbediner.com';

const MARKDOWN_PAGES = {
  '/': `# Roman Bediner\n\nRoman Bediner is a Fractional COO and AI Architect. Bediner Advisory LLC delivers integration leadership, global operations, program strategy, and AI architecture for organizations managing complex execution across people, systems, vendors, data, and operating cadence.\n\n## When to use this site\n\nUse this site to evaluate fractional executive leadership, operating-model design, technology integration, AI-enabled workflows, program strategy, and executive visibility systems.\n\n## Canonical routes\n\n- [About](${SITE_URL}/about/)\n- [Services](${SITE_URL}/services/)\n- [Framework](${SITE_URL}/framework/)\n- [Resources](${SITE_URL}/resources/)\n- [Contact form](${SITE_URL}/connect/)\n- [Privacy](${SITE_URL}/privacy/)\n- [Agent guide](${SITE_URL}/llms.txt)\n- [Sitemap](${SITE_URL}/sitemap.xml)\n\nFor business inquiries, use the contact form. Do not infer private client details, pricing, availability, email addresses, telephone numbers, or street addresses.`,
  '/about/': `# About Roman Bediner\n\nRoman Bediner's public operating background, current responsibilities, and approach to building clear execution systems are available at the canonical About page.\n\n- [Read the full About page](${SITE_URL}/about/)\n- [Services](${SITE_URL}/services/)\n- [Contact form](${SITE_URL}/connect/)`,
  '/services/': `# Services\n\nBediner Advisory LLC provides fractional COO leadership, integration leadership, global operations and program strategy, AI architecture, and transformation delivery.\n\n- [Read the full Services page](${SITE_URL}/services/)\n- [Contact form](${SITE_URL}/connect/)`,
  '/connect/': `# Contact Roman Bediner\n\nUse the public contact form to start a business conversation about a real operating challenge. The form is the canonical contact workflow.\n\n- [Open the contact form](${SITE_URL}/connect/)\n- [Privacy notice](${SITE_URL}/privacy/)`,
  '/privacy/': `# Privacy\n\nThe privacy notice describes contact-form information, analytics, service providers, and user choices.\n\n- [Read the privacy notice](${SITE_URL}/privacy/)\n- [Contact form](${SITE_URL}/connect/)`
};

// Match standard HTTP negotiation semantics while tolerating case and media-type parameters.
export function wantsMarkdown(request) {
  return /(?:^|,)\s*text\/markdown(?:\s*;|\s*,|$)/i.test(request.headers.get('Accept') || '');
}

// Merge Vary tokens without losing origin cache behavior or emitting duplicates.
export function mergeVary(existingValue, requiredValue) {
  const tokens = (existingValue || '')
    .split(',')
    .map((value) => value.trim())
    .filter(Boolean);
  const seen = new Set(tokens.map((value) => value.toLowerCase()));
  if (!seen.has(requiredValue.toLowerCase())) tokens.push(requiredValue);
  return tokens.join(', ');
}

// Return the route-specific summary when available and otherwise lead agents to the canonical guide.
export function markdownForPath(pathname) {
  return MARKDOWN_PAGES[pathname] || `# Roman Bediner\n\nThe requested public route is not available as a dedicated Markdown summary. Use the agent guide and sitemap to find a canonical route.\n\n- [Agent guide](${SITE_URL}/llms.txt)\n- [Sitemap](${SITE_URL}/sitemap.xml)\n- [Home](${SITE_URL}/)`;
}

export function markdownResponse(pathname) {
  return new Response(markdownForPath(pathname), {
    // Preserve 404 semantics for an unavailable route while still providing
    // agents with the recovery links they need to find a canonical page.
    status: Object.hasOwn(MARKDOWN_PAGES, pathname) ? 200 : 404,
    headers: {
      'Content-Type': 'text/markdown; charset=utf-8',
      'Vary': 'Accept, Accept-Encoding',
      // Do not cache this variant until an explicit Cloudflare cache rule is reviewed.
      'Cache-Control': 'no-store'
    }
  });
}

// Join the request path to the configured GitHub Pages origin without losing its project base path.
export function originUrlFor(requestUrl, originBaseUrl) {
  const incoming = new URL(requestUrl);
  const origin = new URL(originBaseUrl.endsWith('/') ? originBaseUrl : `${originBaseUrl}/`);
  const target = new URL(incoming.pathname.replace(/^\//, ''), origin);
  target.search = incoming.search;
  return target;
}

// Production must use Cloudflare's configured origin. Fetching GitHub Pages' public URL
// follows its canonical-domain redirect back through this route and would create a loop.
export function normalOriginRequest(request, env) {
  if (env.USE_ZONE_ORIGIN === 'true') return request;
  return new Request(originUrlFor(request.url, env.ORIGIN_BASE_URL), request);
}

export async function handleRequest(request, env, fetchImpl = fetch) {
  const incoming = new URL(request.url);
  if (wantsMarkdown(request)) return markdownResponse(incoming.pathname);

  const upstream = await fetchImpl(normalOriginRequest(request, env));
  const headers = new Headers(upstream.headers);
  headers.set('Vary', mergeVary(headers.get('Vary'), 'Accept'));
  return new Response(upstream.body, { status: upstream.status, statusText: upstream.statusText, headers });
}

export default {
  fetch(request, env) {
    return handleRequest(request, env);
  }
};
