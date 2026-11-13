/**
 * Purpose: Enforce the owner's referral rule on public Agentic Society navigation.
 * Architectural role: Shared build-time contract for editorial sources and artifacts.
 * Dependencies: Node URL only; no packages or network.
 * Security/CSP considerations: Read-only validation, no runtime rewrite or tracking.
 * Migration considerations: Preserve paths, fragments and unrelated query parameters.
 */
const HOSTS = new Set(['agenticsociety.com', 'www.agenticsociety.com']);
const REF = 'roman-967464';
function decode(value) {
  return value.replace(/&amp;/gi, '&').replace(/&#(x[0-9a-f]+|\d+);/gi, (_,n) => String.fromCodePoint(n[0].toLowerCase()==='x' ? parseInt(n.slice(1),16) : Number(n)));
}
function validateUrl(raw, label) {
  let url; try { url = new URL(decode(raw), 'https://romanbediner.com'); } catch { return false; }
  if (!HOSTS.has(url.hostname.toLowerCase())) return false;
  const values = url.searchParams.getAll('ref');
  if (values.length !== 1 || values[0] !== REF) throw new Error(`${label}: Agentic Society link requires exactly one ref=${REF}`);
  return true;
}
function validateMarkup(html, label='HTML') {
  let count=0;
  for (const tag of html.match(/<a\b[^>]*>/gi) || []) {
    const attributes={};
    for (const m of tag.matchAll(/\b(href|rel)\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+))/gi)) attributes[m[1].toLowerCase()]=m[2]??m[3]??m[4];
    if (attributes.href && validateUrl(attributes.href,label)) {
      if (!decode(attributes.rel||'').toLowerCase().split(/\s+/).includes('sponsored')) throw new Error(`${label}: Agentic Society affiliate anchor requires sponsored rel`);
      count++;
    }
  }
  return count;
}
module.exports={validateMarkup,validateUrl};
