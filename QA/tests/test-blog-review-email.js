/**
 * Invariant: Every owner email has real preview, approval and editable-chat links.
 * Why this exists: Placeholder controls leave the weekly review workflow unusable.
 * What breaks if it fails: Roman cannot approve or request a revision from the delivered email.
 * Purpose: Verify usable approval/edit controls and reject misleading owner emails.
 * Architectural role: Pure renderer regression; no messages or provider writes.
 * Dependencies: Node built-ins and the production renderer.
 * Security/CSP considerations: Test HTML escaping and native destination restrictions.
 * Migration considerations: Preserve the native approval and chat URL fixtures.
 */
const {test} = require('node:test');
const assert = require('node:assert/strict');
const {renderReviewEmail} = require('../../scripts/content/render-blog-review-email');
const fixture = () => ({sourceSha:'a'.repeat(40),revision:2,title:'A <clear> argument',summary:'Roman & a business decision',previewUrl:'https://rbediner.github.io/romanbediner-preview/blog/example/',approvalUrl:'https://github.com/rbediner/romanbediner.com/actions/runs/123',approvalState:'waiting',sessionUrl:'https://chatgpt.com/local/01a189ee-1fa3-74f9-8e44-ca9954708031',sessionVerified:true,evidenceLinks:[{label:'Exact source',url:'https://github.com/rbediner/romanbediner.com/commit/'+ 'a'.repeat(40)}]});
test('render all real controls, full source identity and escaped copy', () => {
  const p=fixture(),html=renderReviewEmail(p);
  for(const label of ['Preview the article','Push to prod','Request changes','Review deployments'])assert(html.includes(label));
  for(const url of [p.previewUrl,p.approvalUrl,p.sessionUrl,p.evidenceLinks[0].url])assert(html.includes(`href="${url}"`));
  assert(html.includes('A &lt;clear&gt; argument'));assert(html.includes('Roman &amp; a business decision'));
});
for(const [name, patch] of Object.entries({fakeApproval:{approvalUrl:'#'},completedApproval:{approvalState:'completed'},unverifiedChat:{sessionVerified:false},inventedProtocol:{sessionUrl:'codex://threads/example'},wrongRepo:{approvalUrl:'https://github.com/other/repo/actions/runs/123'},unsafeEvidence:{evidenceLinks:[{label:'bad',url:'javascript:alert(1)'}]}}))test(`refuse ${name}`,()=>assert.throws(()=>renderReviewEmail({...fixture(),...patch})));
