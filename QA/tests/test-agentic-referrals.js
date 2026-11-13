/**
 * Invariant: All public Agentic Society navigation retains referral and disclosure semantics.
 * Why this exists: Citations are navigation too; a future page must not lose the owner’s referral.
 * What breaks if it fails: Editorial checks and artifact builds stop before publication.
 */
const assert=require('assert');
const fs=require('fs');
const path=require('path');
const {validateMarkup,validateUrl}=require('../../scripts/content/agentic-referrals.js');
const root=path.resolve(__dirname,'../..');
for(const href of ['https://agenticsociety.com/','https://agenticsociety.com/?ref=wrong','https://agenticsociety.com/?ref=roman-967464&ref=roman-967464','//www.agenticsociety.com/events#next']) assert.throws(()=>validateMarkup(`<a href="${href}" rel="sponsored">Test</a>`),/exactly one ref/);
assert.throws(()=>validateMarkup('<a href="https://agenticsociety.com?ref=roman-967464">Test</a>'),/sponsored/);
assert.equal(validateMarkup('<a href="https://www.agenticsociety.com/apply?utm_source=site&amp;ref=roman-967464#form" rel="noopener sponsored">Apply</a>'),1);
assert.equal(validateMarkup('<a href="https://notagenticsociety.com/">Other</a>'),0);
assert.equal(validateMarkup("<a href='//agenticsociety.com/events?ref=roman-967464' rel='sponsored'>Events</a>"),1);
for(const name of fs.readdirSync(path.join(root,'content/blog'))) {
 const file=path.join(root,'content/blog',name);
 if(name.endsWith('.html.txt'))validateMarkup(fs.readFileSync(file,'utf8'),name);
 if(name.endsWith('.json')){const visit=value=>{if(typeof value==='string')validateUrl(value,name);else if(value&&typeof value==='object')Object.values(value).forEach(visit);};visit(JSON.parse(fs.readFileSync(file,'utf8')));}
}
// The artifact build runs this same validator over every included HTML page, not only blog routes.
console.log('PASS: referral missing/wrong/duplicate/rel fixtures and canonical source contracts.');
