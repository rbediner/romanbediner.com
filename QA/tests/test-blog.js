#!/usr/bin/env node
/**
 * Invariant:
 * - Generated blog pages preserve referral attribution, disclosure, metadata,
 *   readable diagrams and the reviewed-content boundary.
 * Why this exists:
 * - Weekly editorial work must not leak drafts or silently break conversion.
 * What breaks if it fails:
 * - CI blocks stale public pages, broken discovery, or unsafe affiliate changes.
 */
const assert = require('assert');
const fs = require('fs');
const path = require('path');
const cp = require('child_process');
const root = path.resolve(__dirname, '../..');
const read = file => fs.readFileSync(path.join(root,file),'utf8');
cp.execFileSync(process.execPath,['scripts/content/build-blog.js','--check'],{cwd:root,stdio:'inherit'});
const article = read('blog/agentic-society/index.html');
const hub = read('blog/index.html');
for(const [file,html] of [['article',article],['hub',hub]]) {
  assert.equal((html.match(/<h1>/g)||[]).length,1,`${file} has one primary heading`);
  assert(html.includes('rel="canonical"'),`${file} canonical`);
  assert(html.includes('name="description"'),`${file} description`);
  assert(html.includes('name="twitter:image"'),`${file} social metadata`);
  for(const match of html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)) JSON.parse(match[1]);
  assert(!/[\u2013\u2014]/.test(html),'Editorial copy avoids dash punctuation');
}
const ctas=[...article.matchAll(/<a[^>]+href="https:\/\/agenticsociety\.com\?ref=roman-967464"[^>]*>/g)];
assert.equal(ctas.length,2,'Opening and closing referral links');
ctas.forEach(m=>assert(m[0].includes('rel="sponsored noopener"'),'Sponsored referral relationship'));
assert(article.indexOf('I may earn a commission')<article.indexOf('data-partner-cta'),'Disclosure before referral CTA');
assert(article.includes('Fractional COO') && !article.includes('Fractional CEO'));
assert.equal((article.match(/data-expand-diagram/g)||[]).length,2);
assert(article.includes('/resources/agentic-ai-employees/') && article.includes('/resources/ai-project-manager/'));
assert(hub.includes('/blog/agentic-society/'));
for(const route of ['/blog/','/blog/agentic-society/']) assert(read('sitemap.xml').includes(`https://romanbediner.com${route}</loc>`));
assert(read('blog/feed.xml').includes('https://romanbediner.com/blog/agentic-society/'));
assert(read('scripts/build/create-artifact.js').includes("'blog',"),'Deployment includes blog');
assert(read('scripts/runtime/blog.js').includes("analytics.environment !== 'production'"),'No preview partner telemetry');
for(const name of ['community-cover.svg','community-loop.svg','company-brain-team.svg','agentic-society-cover.png']) assert(fs.existsSync(path.join(root,'assets/blog',name)),`Missing ${name}`);
assert(fs.existsSync(path.join(root,'assets/asset-library/blog/solution-preparation-reference.svg')), 'Retired diagram retained in reference library');
const records=fs.readdirSync(path.join(root,'content/blog')).filter(f=>f.endsWith('.json')).map(f=>JSON.parse(read(`content/blog/${f}`)));
records.filter(p=>p.status==='draft').forEach(p=>{
  assert(!hub.includes(`/blog/${p.slug}/`),'Draft excluded from hub');
  assert(!fs.existsSync(path.join(root,'blog',p.slug,'index.html')),'Draft excluded from public tree');
});
console.log('PASS: blog discovery, editorial metadata, attribution, diagrams and draft boundary.');

// Keep community participation ahead of the supporting implementation example.
const source=read('content/blog/agentic-society.html.txt');
assert(source.indexOf('id="community"') < source.indexOf('id="participation"'));
assert(source.indexOf('id="participation"') < source.indexOf('id="examples"'));
for (const role of ['Project Manager','Chief of Staff','RevOps Engineer','AI Correspondent','Director of Fleet Orchestration and Engineering','Continuous Improvement Engineer','Staff Engineer','Solution Architect']) assert(source.includes(`<strong>${role}</strong>`), `Missing real fleet role ${role}`);
const words=html=>html.replace(/<[^>]*>/g,' ').split(/\s+/).filter(Boolean).length;
const example=source.match(/<section id="examples">([\s\S]*?)<\/section>/)[1];
assert(words(example)/words(source)<0.35, 'The fleet supports the community story');
assert(!source.includes('starting point for the room') && !source.includes('{{workDiagram}}'), 'Retired solution-preparation detour');
assert(source.includes('Bring your business. Build with people who understand the work.'), 'Preserve owner-selected closing invitation');
assert(source.includes('AZ Moyer') && source.includes('Adelle Archer'), 'Attributed public examples');
assert(article.includes('blog-contents') && article.includes('section-nav.js'), 'Compact progressive navigation');
assert(hub.includes('<h1>Blog</h1>') && hub.includes('resource-card resource-card--compact'), 'Blog uses the Resources landing and compact card components');
// Assert the actual shared component contract and crawlable search metadata.
for (const html of [hub, article]) {
  assert(html.includes('/styles/resources.css?'), 'Shared Resources stylesheet');
  assert(html.includes('shelf-callout resource-family-callout'), 'Shared introduction shelf');
  assert(html.includes('class="resource-meta"'), 'Shared metadata pills');
  assert.equal((html.match(/src="[^\"]*ga4-bootstrap.js"/g) || []).length, 1, 'One GA4 bootstrap');
  assert(html.includes('content="G-DVHD0KL633"'), 'Existing GA4 property');
}
assert(!hub.includes('RSS feed →') && !hub.includes('blog-feature-art'), 'No visible feed action or oversized cover card');
assert(!article.includes('article-rail') && article.includes('data-section-nav'), 'Shared article navigation');
assert(article.includes('class="fleet-title-deck"') && article.includes('<h1>Agentic Society</h1>'), 'Resource article opening');
const articleSchema = JSON.parse(article.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/)[1])['@graph'][0];
assert(articleSchema.keywords.includes('Company Brain') && articleSchema.keywords.includes('AI community for business owners'), 'Specific search topics');
assert.equal(articleSchema.isPartOf['@id'], 'https://romanbediner.com/blog/#blog');
assert.equal(articleSchema.isAccessibleForFree, true);

// Exercise the real generator in disposable state; never mutate reviewed sources.
const os = require('os');
const temp = fs.mkdtempSync(path.join(os.tmpdir(),'rb-blog-contract-'));
try {
  for (const file of ['index.html','sitemap.xml','scripts/content/build-blog.js','content/blog']) {
    const target=path.join(temp,file);
    fs.mkdirSync(path.dirname(target),{recursive:true});
    fs.cpSync(path.join(root,file),target,{recursive:true});
  }
  const generate=()=>cp.execFileSync(process.execPath,['scripts/content/build-blog.js'],{cwd:temp,stdio:'pipe'});
  const record=path.join(temp,'content/blog/agentic-society.json');
  const post=JSON.parse(fs.readFileSync(record,'utf8'));
  post.status='draft';fs.writeFileSync(record,JSON.stringify(post));generate();
  assert(!fs.existsSync(path.join(temp,'blog/agentic-society/index.html')),'Retired draft page removed');
  for (const file of ['blog/index.html','blog/feed.xml','sitemap.xml']) {
    assert(!fs.readFileSync(path.join(temp,file),'utf8').includes('/blog/agentic-society/'),`Draft absent from ${file}`);
  }
  post.status='ready';post.toc.push(['missing-section','Missing section']);
  fs.writeFileSync(record,JSON.stringify(post));
  assert.throws(generate,/Missing article section/, 'Bad section navigation fails before output');
} finally { fs.rmSync(temp,{recursive:true,force:true}); }

// Conversion is intent only, with an explicit production hostname/environment fence.
const vm=require('vm');
for (const [hostname,environment,count] of [['romanbediner.com','production',1],['rbediner.github.io','production',0],['romanbediner.com','preview',0]]) {
  let click;const events=[];
  const link={dataset:{partnerCta:'opening',article:'agentic-society'},hasAttribute:()=>true,addEventListener:(_,fn)=>{click=fn;}};
  vm.runInNewContext(read('scripts/runtime/blog.js'),{
    document:{querySelector:()=>null,querySelectorAll:selector=>selector.includes('data-partner-cta')?[link]:[]},
    window:{location:{hostname},__rbAnalytics:{environment,trackEvent:(...event)=>events.push(event)}}
  });
  click();assert.equal(events.length,count);
  if(count)assert.equal(events[0][0],'partner_click');
}

// Preserve the recovered brief utility without claiming it writes weekly articles.
const pipeline=require('../../scripts/content/blog-pipeline.js');
assert.throws(()=>pipeline.validateWeek('2026-11-03'),/Monday/);
assert.throws(()=>pipeline.validateWeek('2026-02-30'),/real calendar/);
assert.throws(()=>pipeline.resolveDestination(path.join(root,'private-drafts')),/outside/);
const queue=fs.mkdtempSync(path.join(os.tmpdir(),'rb-blog-brief-'));
try {
  const first=pipeline.run({week:'2026-11-02',output:queue,write:true});
  const bytes=fs.readFileSync(first.file,'utf8');
  assert.equal(pipeline.run({week:'2026-11-02',output:queue,write:true}).status,'existing');
  assert.equal(fs.readFileSync(first.file,'utf8'),bytes,'Existing brief never overwritten');
  assert.equal(first.brief.publication.productionApproved,false);
  assert.notEqual(pipeline.run({week:'2026-11-09',output:queue,write:false}).brief.topic.slug,first.brief.topic.slug);
} finally { fs.rmSync(queue,{recursive:true,force:true}); }
console.log('PASS: actual draft retirement, section integrity, telemetry fence and private brief replay.');
