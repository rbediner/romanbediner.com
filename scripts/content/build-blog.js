#!/usr/bin/env node
/**
 * Purpose:
 * - Render reviewed blog content into crawlable static pages and an RSS feed.
 * Architectural role:
 * - Dependency-free publishing adapter for the existing static website.
 * Dependencies:
 * - Node built-ins, trusted repository editorial HTML and JSON, shared home shell.
 * Security/CSP considerations:
 * - Repository HTML is reviewed code, never user-submitted content. Drafts stay out
 *   of generated pages. No network, credentials, inline handlers or deployment.
 * Migration considerations:
 * - Preserve permanent slugs and feed URLs when changing the authoring system.
 */
const fs = require('fs');
const path = require('path');
const ROOT = path.resolve(__dirname, '../..');
const BASE = 'https://romanbediner.com';
const escape = value => String(value).replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
const read = relative => fs.readFileSync(path.join(ROOT, relative), 'utf8');
const home = read('index.html');
const header = home.match(/<header class="site-header">[\s\S]*?<\/header>/)[0].replace('src="assets/', 'src="/assets/');
const footer = home.match(/<footer class="footer">[\s\S]*?<\/footer>/)[0];
const csp = home.match(/<meta http-equiv="Content-Security-Policy"[^>]+>/)[0];
const posts = fs.readdirSync(path.join(ROOT, 'content/blog')).filter(f => f.endsWith('.json')).map(file => {
  const p = JSON.parse(read(`content/blog/${file}`));
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(p.slug)) throw new Error(`Invalid slug: ${file}`);
  if (!['draft', 'ready', 'published'].includes(p.status)) throw new Error(`Invalid status: ${file}`);
  if (file !== `${p.slug}.json`) throw new Error(`Filename must match slug: ${file}`);
  if (p.status === 'draft') return null;
  for (const key of ['title','seoTitle','description','deck','category','date','updated','image','imageAlt']) {
    if (!p[key]) throw new Error(`Missing ${key}: ${file}`);
  }
  for (const key of ['date','updated']) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(p[key]) || new Date(`${p[key]}T12:00:00Z`).toISOString().slice(0,10) !== p[key]) throw new Error(`Invalid date: ${file}`);
  }
  if (p.referralUrl && p.referralUrl !== 'https://agenticsociety.com?ref=roman-967464') throw new Error('Unexpected referral destination');
  p.body = read(`content/blog/${p.slug}.html.txt`);
  // Fail before writing any output if an article's navigation cannot resolve.
  if (!Array.isArray(p.toc) || !p.toc.length) throw new Error(`Missing article toc: ${file}`);
  const ids = new Set();
  for (const entry of p.toc) {
    if (!Array.isArray(entry) || entry.length !== 2 || !/^[a-z][a-z0-9-]*$/.test(entry[0]) || typeof entry[1] !== 'string' || !entry[1].trim() || ids.has(entry[0])) throw new Error(`Invalid article toc: ${file}`);
    ids.add(entry[0]);
    if (!p.body.includes(`id="${entry[0]}"`)) throw new Error(`Missing article section ${entry[0]}: ${file}`);
  }
  p.minutes = Math.max(1, Math.ceil(p.body.replace(/<[^>]*>/g, ' ').split(/\s+/).length / 220));
  return p;
}).filter(Boolean).sort((a,b) => b.date.localeCompare(a.date) || a.slug.localeCompare(b.slug));
const formatDate = date => new Intl.DateTimeFormat('en-US', {month:'long', day:'numeric', year:'numeric', timeZone:'UTC'}).format(new Date(`${date}T12:00:00Z`));
function shell({title, description, route, image, imageAlt, schema, body, article}) {
  return `<!DOCTYPE html>
<html lang="en"><head>
<meta charset="UTF-8" /><meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>${escape(title)}</title><meta name="description" content="${escape(description)}" />
<link rel="canonical" href="${BASE}${route}" />
<meta property="og:locale" content="en_US" /><meta property="og:site_name" content="Roman Bediner" />
<meta property="og:type" content="${article ? 'article' : 'website'}" /><meta property="og:url" content="${BASE}${route}" />
<meta property="og:title" content="${escape(title)}" /><meta property="og:description" content="${escape(description)}" />
<meta property="og:image" content="${BASE}${image}" /><meta property="og:image:width" content="1200" /><meta property="og:image:height" content="630" /><meta property="og:image:type" content="image/png" /><meta property="og:image:alt" content="${escape(imageAlt)}" />
<meta name="twitter:card" content="summary_large_image" /><meta name="twitter:title" content="${escape(title)}" /><meta name="twitter:description" content="${escape(description)}" /><meta name="twitter:image" content="${BASE}${image}" /><meta name="twitter:image:alt" content="${escape(imageAlt)}" />
${article ? `<meta property="article:published_time" content="${article.date}T12:00:00Z" /><meta property="article:modified_time" content="${article.updated}T12:00:00Z" /><meta name="author" content="Roman Bediner" />` : ''}
<!-- CSP architecture: external runtime only; no inline executable scripts. -->
${csp}
<link rel="icon" type="image/png" sizes="32x32" href="/assets/favicon/favicon-32x32.png" /><link rel="icon" type="image/png" sizes="16x16" href="/assets/favicon/favicon-16x16.png" /><link rel="apple-touch-icon" sizes="180x180" href="/assets/favicon/apple-touch-icon.png" /><link rel="shortcut icon" href="/assets/favicon/favicon.ico" />
<link rel="stylesheet" href="/styles/site.css?v=20260720r5" /><link rel="stylesheet" href="/styles/blog.css?v=20261026" />
<link rel="alternate" type="application/rss+xml" title="Roman Bediner Blog" href="/blog/feed.xml" />
<meta name="ga4-measurement-id" content="G-DVHD0KL633" /><script src="/scripts/runtime/ga4-bootstrap.js" defer></script>
<script type="application/ld+json">${JSON.stringify(schema).replace(/</g, '\\u003c')}</script>
</head><body class="blog-page"><a class="blog-skip" href="#main">Skip to content</a>
${header}
${body}
${footer}
<dialog class="blog-diagram-dialog" aria-label="Expanded workflow diagram"><form method="dialog"><button class="blog-button blog-button--quiet" autofocus>Close diagram</button></form><div class="blog-diagram-expanded"></div></dialog>
<script src="${article ? '../../' : '../'}scripts/runtime/site-navigation.js?v=20261026"></script><script src="/scripts/runtime/blog.js?v=20261026" defer></script>
</body></html>\n`;
}
function cta(p, position) {
  return `<div class="blog-conversion"><p class="affiliate-disclosure">I serve as Fractional COO at Agentic Society. If you join through my referral link, I may earn a commission.</p><div class="blog-actions"><a class="blog-button" href="${escape(p.referralUrl)}" rel="sponsored noopener" data-partner-cta="${position}" data-article="${escape(p.slug)}">Explore Agentic Society <span aria-hidden="true">&rarr;</span></a><a class="blog-text-link" href="/connect/" data-blog-contact="${position}">Talk with me about it <span aria-hidden="true">&rarr;</span></a></div></div>`;
}
function diagram(file, label, caption, height = 440) {
  return `<figure class="blog-diagram"><div class="blog-diagram-top"><span class="blog-eyebrow">An operating view</span><button type="button" class="diagram-expand" data-expand-diagram aria-label="Expand ${escape(label)}">Expand diagram</button></div><div class="blog-diagram-scroll"><img src="/assets/blog/${file}.svg" width="960" height="${height}" alt="${escape(label)}" loading="lazy" /></div><figcaption>${caption}</figcaption></figure>`;
}
const outputs = {};
for (const p of posts) {
  const route = `/blog/${p.slug}/`;
  let content = p.body.replace(/\{\{cta:(\w+)\}\}/g, (_,position) => cta(p, position));
  content = content.replace('{{communityDiagram}}', diagram('community-loop', 'Community learning loop: bring a business problem, build with peers and advisors, apply it in your business, and share what you learn.', 'The community loop: your business supplies the context. Shared work and real-world feedback keep the learning useful.'));
  // The shared-context map leads the agent examples; the narrower workflow follows it.
  content = content.replace('{{teamDiagram}}', diagram('company-brain-team', 'Company Brain supplies shared business context to a Project Manager and Chief of Staff. People own decisions; reviewed learning returns to the brain.', 'One shared foundation, different jobs: the project manager follows the work, the Chief of Staff organizes knowledge, and people retain authority.', 520));
  content = content.replace('{{workDiagram}}', diagram('solution-workflow', 'Solution preparation: business context leads to an AI starting proposal, human discussion and decisions, then captured learning for the next session.', 'A proposal prepares the conversation. People own the decision. The next session starts with better context.'));
  if (/\{\{/.test(content)) throw new Error(`Unresolved template in ${p.slug}`);
  const schema = {'@context':'https://schema.org','@graph':[
    {'@type':'BlogPosting','@id':`${BASE}${route}#article`,headline:p.title,description:p.description,datePublished:`${p.date}T12:00:00Z`,dateModified:`${p.updated}T12:00:00Z`,image:`${BASE}${p.image}`,mainEntityOfPage:`${BASE}${route}`,author:{'@type':'Person',name:'Roman Bediner',url:`${BASE}/about/`,jobTitle:'Fractional COO and AI Architect'},publisher:{'@type':'Organization',name:'Bediner Advisory LLC',url:BASE},articleSection:p.category,inLanguage:'en-US'},
    {'@type':'BreadcrumbList',itemListElement:[{'@type':'ListItem',position:1,name:'Blog',item:`${BASE}/blog/`},{'@type':'ListItem',position:2,name:p.title,item:`${BASE}${route}`}]}]};
  outputs[`blog/${p.slug}/index.html`] = shell({title:p.seoTitle,description:p.description,route,image:p.image,imageAlt:p.imageAlt,schema,article:p,body:`<main id="main" class="container page-main blog-main">
<a class="blog-back" href="/blog/">&larr; All writing</a>
<header class="article-hero"><div><p class="blog-eyebrow">${escape(p.category)} ${p.series ? `<span aria-hidden="true">/</span> ${escape(p.series)}` : ''}</p><h1>${escape(p.title)}</h1><p class="article-deck">${escape(p.deck)}</p><div class="article-byline"><img src="/assets/images/website-photo.jpg" width="48" height="48" alt="" /><div><a href="/about/">Roman Bediner</a><span>Fractional COO, Agentic Society</span><span><time datetime="${p.date}">${formatDate(p.date)}</time> · ${p.minutes} min read</span></div></div></div><div class="article-cover"><img src="${escape(p.cover || p.image)}" width="620" height="610" alt="${escape(p.imageAlt)}" /></div></header>
<div class="article-layout"><aside class="article-rail"><nav aria-label="On this page"><span class="blog-eyebrow">In this article</span>${p.toc.map(([id,label])=>`<a href="#${escape(id)}">${escape(label)}</a>`).join('')}</nav><p>Practical perspectives on building a more capable business.</p><a class="blog-text-link" href="/connect/">Ask me about the community &rarr;</a></aside><article class="article-body">${content}</article></div>
<section class="blog-author"><img src="/assets/images/website-photo.jpg" width="80" height="80" alt="Roman Bediner" loading="lazy" /><div><p class="blog-eyebrow">About the author</p><h2>Roman Bediner</h2><p>Fractional COO and AI Architect. I help connect business priorities, people, and systems so useful work gets done.</p><a href="/about/">More about my work &rarr;</a></div></section>
</main>`});
}
const feature = posts[0];
const card = (p, featured = false) => `<article class="blog-feature${featured ? '' : ' blog-feature--compact'} ui-surface ui-surface--editorial is-static"><div class="blog-feature-art"><a href="/blog/${p.slug}/" aria-label="Read ${escape(p.title)}"><img src="${escape(p.cover || p.image)}" alt="${escape(p.imageAlt)}" width="620" height="610" /></a></div><div class="blog-feature-copy"><p class="blog-eyebrow">${escape(p.category)} · ${p.minutes} min read</p><h2><a href="/blog/${p.slug}/">${escape(p.title)}</a></h2><p>${escape(p.deck)}</p><div class="blog-feature-end"><span>${formatDate(p.date)}</span><a class="blog-button" href="/blog/${p.slug}/">Read the story &rarr;</a></div></div></article>`;
outputs['blog/index.html'] = shell({title:'Blog | AI, Operations & Building Better Businesses | Roman Bediner',description:'Field notes from Roman Bediner on AI adoption, operating systems, and the people who make businesses work. Practical ideas grounded in the work.',route:'/blog/',image:feature ? feature.image : '/assets/og-logo/og-final.png',imageAlt:feature ? feature.imageAlt : 'Roman Bediner',schema:{'@context':'https://schema.org','@type':'Blog',name:'Roman Bediner Blog',url:`${BASE}/blog/`,description:'Practical perspectives on AI, operations, and building better businesses.',blogPost:posts.map(p=>({'@type':'BlogPosting',headline:p.title,url:`${BASE}/blog/${p.slug}/`}))},body:`<main id="main" class="container page-main blog-main"><header class="blog-hub-hero"><p class="blog-eyebrow">The blog / Roman Bediner</p><h1>BLOG</h1><p class="blog-hub-deck">Ideas from the work.<br><span>Built for your business.</span></p><p>Field notes on AI, operations, and the people who turn possibility into progress.</p></header><section class="blog-latest" aria-label="Latest articles"><div class="blog-section-label"><h2>Latest writing</h2><a href="/blog/feed.xml">RSS feed &rarr;</a></div>${posts.map((p, index) => card(p, index === 0)).join('')}</section><section class="blog-editorial"><div><p class="blog-eyebrow">A practical point of view</p><h2>The work is the source material.</h2></div><div><p>I write about what it takes to make AI and operations useful in a real business: the decisions, the systems, the relationships, and what we learn along the way.</p><p>Expect clear examples and questions you can bring back to your team. For deeper implementation material, explore the resource library.</p><a class="blog-text-link" href="/resources/">Explore the resources &rarr;</a></div></section><section class="blog-reading" aria-labelledby="reading-title"><h2 id="reading-title">Go deeper into the work</h2><a href="/resources/agentic-ai-employees/"><span>Reference architecture</span><strong>Agentic AI employees</strong><span>Explore the guide &rarr;</span></a><a href="/resources/ai-project-manager/"><span>Practical guide</span><strong>AI project manager</strong><span>Explore the guide &rarr;</span></a><a href="/framework/"><span>Operating framework</span><strong>From opportunity to execution</strong><span>Explore the framework &rarr;</span></a></section><section class="blog-hub-close"><h2>What are you trying to make work?</h2><p>Bring the business problem. We can start there.</p><a class="blog-button" href="/connect/">Start a conversation &rarr;</a></section></main>`});
outputs['blog/feed.xml'] = `<?xml version="1.0" encoding="UTF-8"?>\n<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom"><channel><title>Roman Bediner Blog</title><link>${BASE}/blog/</link><description>Field notes on AI, operations, and building better businesses.</description><language>en-us</language><atom:link href="${BASE}/blog/feed.xml" rel="self" type="application/rss+xml" />${posts.map(p=>`<item><title>${escape(p.title)}</title><link>${BASE}/blog/${p.slug}/</link><guid isPermaLink="true">${BASE}/blog/${p.slug}/</guid><pubDate>${new Date(`${p.date}T12:00:00Z`).toUTCString()}</pubDate><description>${escape(p.description)}</description></item>`).join('')}</channel></rss>\n`;
const sitemapBlock = `<!-- blog:start -->\n${['/blog/',...posts.map(p=>`/blog/${p.slug}/`)].map((route,i)=>`  <url><loc>${BASE}${route}</loc><lastmod>${i === 0 ? (feature?.updated || '2026-10-26') : posts[i-1].updated}</lastmod></url>`).join('\n')}\n<!-- blog:end -->`;
outputs['sitemap.xml'] = read('sitemap.xml').replace(/<!-- blog:start -->[\s\S]*?<!-- blog:end -->\n?/, '').replace('</urlset>', `${sitemapBlock}\n</urlset>`);
// Manifest makes stale generated articles detectable instead of accidentally shipping a retired draft.
const manifestPath = 'content/blog/generated-files.json.txt';
const previous = fs.existsSync(path.join(ROOT, manifestPath)) ? JSON.parse(read(manifestPath)) : [];
const generatedFiles = Object.keys(outputs).filter(f=>f.startsWith('blog/'));
const stale = previous.filter(f=>!generatedFiles.includes(f));
outputs[manifestPath] = JSON.stringify(generatedFiles,null,2)+'\n';
let dirty = false;
for (const [file, value] of Object.entries(outputs)) {
  if (fs.existsSync(path.join(ROOT,file)) && read(file) === value) continue;
  dirty = true;
  if (process.argv.includes('--check')) { console.error(`Stale generated file: ${file}`); continue; }
  fs.mkdirSync(path.dirname(path.join(ROOT,file)),{recursive:true}); fs.writeFileSync(path.join(ROOT,file),value);
}
for (const file of stale) {
  if (!/^blog\/[a-z0-9-]+\/index\.html$/.test(file)) throw new Error(`Unsafe stale path: ${file}`);
  if (fs.existsSync(path.join(ROOT,file))) {
    dirty=true;
    if (process.argv.includes('--check')) console.error(`Retired generated file still present: ${file}`);
    else fs.unlinkSync(path.join(ROOT,file));
  }
}
if (process.argv.includes('--check') && dirty) process.exit(1);
console.log(`${process.argv.includes('--check') ? 'Verified' : 'Generated'} blog hub, ${posts.length} article(s), feed and sitemap.`);
