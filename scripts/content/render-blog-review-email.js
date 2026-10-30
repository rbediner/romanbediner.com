#!/usr/bin/env node
/**
 * Purpose: Render the owner email with real preview, approval and editing destinations.
 * Architectural role: Pure presentation; delivery and authenticated decisions stay native.
 * Dependencies: Node built-ins and a coordinator-verified delivery packet.
 * Security/CSP considerations: Escape all text; links cannot execute publication on GET.
 * Migration considerations: Keep repository and native chat URL contracts aligned.
 */
const fs = require('fs');
const escape = value => String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

function renderReviewEmail(p) {
  // Refuse placeholder controls. The coordinator must verify both native destinations first.
  if (!p || !/^[a-f0-9]{40}$/.test(p.sourceSha) || !Number.isSafeInteger(p.revision) || p.revision < 1) throw new Error('Frozen revision required');
  if (!/^https:\/\/rbediner\.github\.io\/romanbediner-preview\/blog\/[a-z0-9-]+\/$/.test(p.previewUrl)) throw new Error('Verified staging URL required');
  if (!/^https:\/\/github\.com\/rbediner\/romanbediner\.com\/actions\/runs\/\d+$/.test(p.approvalUrl) || p.approvalState !== 'waiting') throw new Error('A real waiting native approval run is required');
  if (!/^https:\/\/chatgpt\.com\/(?:local\/[a-f0-9-]{36}|c\/[a-f0-9-]{36}|remote\/[a-z0-9_-]+)(?:\?hostId=local)?$/.test(p.sessionUrl) || !p.sessionVerified) throw new Error('Verified editable generating or continuation session required');
  if (!p.title || !p.summary || !Array.isArray(p.evidenceLinks) || !p.evidenceLinks.length) throw new Error('Editorial summary and evidence links required');
  for (const link of p.evidenceLinks) if (!/^https:\/\//.test(link.url) || !link.label) throw new Error('Real HTTPS evidence links required');
  const button = (label, url, color) => `<a href="${escape(url)}" style="display:inline-block;background:${color};color:#fff;padding:14px 22px;margin:0 10px 12px 0;border-radius:25px;text-decoration:none;font-weight:600">${label}</a>`;
  return `<!doctype html><html><body style="margin:0;background:#fff;color:#192633;font:17px/1.65 Arial,sans-serif"><main style="max-width:680px;margin:auto;padding:30px 22px">
<h1 style="color:#16467a;font-size:27px">Action required: review your new blog draft</h1>
<h2 style="font-size:22px">${escape(p.title)}</h2><p>${escape(p.summary)}</p>
<p>${button('Preview the article', p.previewUrl, '#2454df')}${button('Push to prod', p.approvalUrl, '#174779')}${button('Request changes', p.sessionUrl, '#374151')}</p>
<p><strong>Push to prod:</strong> open the GitHub run, choose <em>Review deployments</em>, and approve this exact revision. Viewing the email or link never publishes.</p>
<p><strong>Request changes:</strong> open the linked Codex continuation and type or dictate your edits. The coordinator cancels the pending approval before changing the draft, then returns a new preview and approval link.</p>
<p>Revision ${p.revision} · source <code>${escape(p.sourceSha)}</code>. Production still requires your approval. Only verified CI, staging and independent review may reach this step.</p>
<h2 style="font-size:21px">Good to know</h2><ul>${p.evidenceLinks.map(link => `<li><a href="${escape(link.url)}">${escape(link.label)}</a></li>`).join('')}</ul>
</main></body></html>\n`;
}

if (require.main === module) {
  // Input/output files let callers send the exact rendered bytes and retain their delivery hash.
  const [input, output] = process.argv.slice(2);
  if (!input || !output) throw new Error('Usage: render-blog-review-email.js packet.json email.html');
  fs.writeFileSync(output, renderReviewEmail(JSON.parse(fs.readFileSync(input, 'utf8'))));
}
module.exports = {renderReviewEmail};
