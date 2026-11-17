/**
 * Invariant:
 * - The weekly article, metadata and diagram work at the actual destination.
 * Why this exists:
 * - Trusted touch input must exercise the reader's real pinch/pan path.
 * What breaks if it fails:
 * - Staging delivery stops before a preview with broken reading controls is sent.
 * Reuse these checks after staging; always close owned servers and contexts.
 */
const fs = require('fs');
const path = require('path');
const http = require('http');
const {test, expect} = require('playwright/test');
const root = path.resolve(__dirname, '../../..');
let server, base;
test.beforeAll(async () => {
  if (process.env.RB_BLOG_ROLLOUT_BASE_URL) {
    base = process.env.RB_BLOG_ROLLOUT_BASE_URL.replace(/\/$/, '');
    return;
  }
  const mime = {'.html':'text/html','.css':'text/css','.js':'application/javascript','.svg':'image/svg+xml','.png':'image/png','.jpg':'image/jpeg','.woff2':'font/woff2'};
  server = http.createServer((req,res) => {
    let file = path.join(root, decodeURIComponent(req.url.split('?')[0]));
    if (!file.startsWith(root + path.sep)) return res.writeHead(403).end();
    if (fs.existsSync(file) && fs.statSync(file).isDirectory()) file = path.join(file,'index.html');
    if (!fs.existsSync(file)) return res.writeHead(404).end();
    res.writeHead(200, {'Content-Type':mime[path.extname(file)] || 'application/octet-stream'});
    fs.createReadStream(file).pipe(res);
  });
  await new Promise(resolve => server.listen(0,'127.0.0.1',resolve));
  base = `http://127.0.0.1:${server.address().port}`;
});
test.afterAll(async () => { if (server) await new Promise(resolve => server.close(resolve)); });

const slugs = fs.readdirSync(path.join(root,'content/blog')).filter(f=>f.endsWith('.json')).map(f=>JSON.parse(fs.readFileSync(path.join(root,'content/blog',f)))).filter(p=>p.status!=='draft');
for(const post of slugs) for(const width of [1440,768,390]) test(`Blog conversion and SEO: ${post.slug} ${width}`,async({page})=>{
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.setViewportSize({width,height:1000});
 expect((await page.goto(`${base}/blog/${post.slug}/`)).status()).toBe(200);
 await page.evaluate(()=>document.fonts.ready);
 const canonical=`https://romanbediner.com/blog/${post.slug}/`;
 await expect(page.locator('h1')).toHaveCount(1);
 expect(await page.title()).toBe(post.seoTitle);
 await expect(page.locator('meta[name="description"]')).toHaveAttribute('content',post.description);
 await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href',canonical);
 await expect(page.locator('meta[property="og:url"]')).toHaveAttribute('content',canonical);
 for(const sel of ['meta[property="og:image"]','meta[name="twitter:image"]']) await expect(page.locator(sel)).toHaveAttribute('content',`https://romanbediner.com${post.image}`);
 const schema=JSON.parse(await page.locator('script[type="application/ld+json"]').textContent())['@graph'];
 expect(schema[0].dateModified).toBe(`${post.updated}T12:00:00Z`);expect(schema[0].datePublished).toBe(`${post.date}T12:00:00Z`);expect(schema[0].mainEntityOfPage).toBe(canonical);
 const card=page.locator('.article-close');await expect(card).toHaveCount(1);
 const actions=card.locator('.blog-actions a');await expect(actions).toHaveCount(2);
 await expect(actions.nth(0)).toContainText('Explore Working Together');await expect(actions.nth(0)).toHaveAttribute('href','mailto:roman@romanbediner.com');await expect(actions.nth(0)).toHaveClass(/resource-primary-cta/);
 await expect(actions.nth(1)).toContainText('Learn more about Agentic Society');
 await expect(page.locator('[aria-labelledby="sources"]')).toHaveCount(1);
 const resources=page.locator('[aria-labelledby="agentic-society-resources"]');await expect(resources.locator('a')).toHaveCount(3);
 for(const link of await page.locator('.article-body a[href*="agenticsociety.com"]').all()) {const u=new URL(await link.getAttribute('href'));expect(u.searchParams.getAll('ref')).toEqual(['roman-967464']);await expect(link).toHaveAttribute('rel','sponsored noopener');}
 await expect(page.locator('.article-body')).not.toContainText('I may receive a commission');
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
 for(const action of await actions.all()) {expect(await action.evaluate(e=>e.getBoundingClientRect().height)).toBeGreaterThanOrEqual(44);await action.focus();await expect(action).toBeFocused();}
 const ids=await page.locator('[id]').evaluateAll(ns=>ns.map(n=>n.id));expect(new Set(ids).size).toBe(ids.length);
 expect(errors).toEqual([]);
 const dir=path.join(root,'QA/results/blog-rollout');fs.mkdirSync(dir,{recursive:true});
 await card.scrollIntoViewIfNeeded();
 const clip=await page.evaluate(()=>{const a=document.querySelector('.article-close').getBoundingClientRect(),b=document.querySelector('[aria-labelledby="agentic-society-resources"]').getBoundingClientRect();return {x:a.left+scrollX,y:a.top+scrollY,width:a.width,height:b.bottom-a.top};});
 await page.screenshot({path:path.join(dir,`${post.slug}-${width}-end.png`),fullPage:true,clip});
});
