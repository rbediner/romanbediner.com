/**
 * Invariant:
 * - Blog readers can navigate, inspect diagrams and follow disclosed referrals
 *   without overflow or runtime errors on desktop and phone.
 * Why this exists:
 * - Static HTML assertions cannot prove browser usability or keyboard behavior.
 * What breaks if it fails:
 * - Staging must not ship inaccessible diagrams or broken conversion paths.
 */
const fs = require('fs');
const http = require('http');
const path = require('path');
const {test, expect} = require('playwright/test');
const root = path.resolve(__dirname, '../../..');
let server, base;
test.beforeAll(async()=>{
  const types={'.html':'text/html','.css':'text/css','.js':'application/javascript','.svg':'image/svg+xml','.png':'image/png','.jpg':'image/jpeg','.woff2':'font/woff2'};
  server=http.createServer((req,res)=>{
    let file=path.join(root,decodeURIComponent(req.url.split('?')[0]));
    if(!file.startsWith(root+path.sep)){res.writeHead(403).end();return;}
    if(fs.existsSync(file)&&fs.statSync(file).isDirectory())file=path.join(file,'index.html');
    if(!fs.existsSync(file)){res.writeHead(404).end();return;}
    res.writeHead(200,{'Content-Type':types[path.extname(file)]||'application/octet-stream'});fs.createReadStream(file).pipe(res);
  });
  await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
  base=`http://127.0.0.1:${server.address().port}`;
});
test.afterAll(async()=>{if(server)await new Promise(resolve=>server.close(resolve));});
for(const width of [1440,1280,1024,768,430,390,320])test(`Blog conversion and diagrams at ${width}px`,async({page})=>{
  const errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.setViewportSize({width,height:900});
  await page.goto(`${base}/blog/`);
  await expect(page.getByRole('heading',{level:1})).toHaveText('Blog');
  await expect(page.locator('.blog-feature')).toHaveCount(1);
  // Use the same compact component as Resources, with a linked article heading.
  await expect(page.locator('.blog-feature')).toHaveClass(/resource-card--compact/);
  await expect(page.locator('.blog-feature h2 a')).toHaveAttribute('href','/blog/agentic-society/');
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
  if (process.env.RB_BLOG_CAPTURE && [1440,390].includes(width)) {
    await page.screenshot({path:path.join(root,`QA/results/blog-hub-${width}.png`)});
  }
  await page.getByRole('link',{name:'Read the article'}).click();
  await expect(page).toHaveURL(/\/blog\/agentic-society\/$/);
  if (process.env.RB_BLOG_CAPTURE && [1440,390].includes(width)) {
    await page.screenshot({path:path.join(root,`QA/results/blog-article-${width}.png`)});
  }
  await page.getByRole('button',{name:'On this page',exact:true}).click();
  await expect(page.locator('.section-nav-sheet')).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(page.locator('.section-nav-sheet')).toBeHidden();
  await expect(page.locator('.article-byline img')).toHaveCSS('object-fit','contain');
  await expect(page.locator('.affiliate-disclosure').first()).toContainText('I may earn a commission');
  for(const link of await page.locator('[data-partner-cta]').all()) {
    await expect(link).toHaveAttribute('href','https://agenticsociety.com?ref=roman-967464');
    await expect(link).toHaveAttribute('rel',/sponsored/);
  }
  for(const button of await page.locator('[data-expand-diagram]').all()) {
    await button.click();await expect(page.locator('dialog')).toBeVisible();
    await expect(page.locator('dialog svg')).toBeVisible();
    expect(await page.locator('[id]').evaluateAll(nodes=>nodes.length===new Set(nodes.map(n=>n.id)).size)).toBe(true);
    await page.keyboard.press('Escape');await expect(button).toBeFocused();
  }
  await page.getByText('Can I join Agentic Society online outside Austin?',{exact:true}).click();
  await expect(page.locator('details[open]')).toContainText('virtual component');
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
  expect(errors).toEqual([]);
});

test('Community and full-fleet diagrams have readable, contained labels', async({page})=>{
  await page.goto(`${base}/blog/agentic-society/`);
  await page.evaluate(()=>document.fonts.ready);
  await expect(page.locator('.blog-diagram')).toHaveCount(2);
  for (const figure of await page.locator('.blog-diagram').all()) {
    const outside=await figure.locator('svg text').evaluateAll(nodes=>nodes.filter(n=>{
      const b=n.getBBox();return b.x<20 || b.x+b.width>940;
    }).map(n=>n.textContent));
    expect(outside).toEqual([]);
  }
  // Every role must fit its actual panel using the loaded site font.
  const roles=await page.locator('.blog-diagram').nth(1).locator('svg text').evaluateAll(nodes=>nodes.filter(n=>[270,422,429,450,308,335,476,503].includes(Number(n.getAttribute('y')))).map(n=>{
    const b=n.getBBox(), x=Number(n.getAttribute('x'));
    return {text:n.textContent,left:b.x,right:b.x+b.width,center:x};
  }));
  expect(roles.length).toBeGreaterThan(20);
  roles.forEach(b=>{expect(b.left, b.text).toBeGreaterThanOrEqual(b.center-94);expect(b.right,b.text).toBeLessThanOrEqual(b.center+94);});
  await expect(page.locator('.blog-contents')).toBeHidden();
});

test('Article orientation remains usable without JavaScript', async({browser})=>{
  const context=await browser.newContext({javaScriptEnabled:false});
  const page=await context.newPage();
  await page.goto(`${base}/blog/agentic-society/`);
  await expect(page.locator('.blog-contents')).toBeVisible();
  await page.locator('.blog-contents summary').click();
  await expect(page.locator('.blog-contents nav a').first()).toBeVisible();
  await expect(page.locator('.blog-contents nav a').first()).toHaveCSS('font-size','16px');
  await context.close();
});

// Compare the live computed styles, not a second hand-maintained approximation.
for (const width of [1440,390]) test(`Resources component parity at ${width}px`, async({page})=>{
  await page.setViewportSize({width,height:900});
  const styles=async(selector)=>page.locator(selector).first().evaluate(el=>{
    const s=getComputedStyle(el);
    return Object.fromEntries(['fontFamily','fontSize','fontWeight','lineHeight','padding','borderRadius','backgroundColor'].map(k=>[k,s[k]]));
  });
  await page.goto(`${base}/resources/`); await page.evaluate(()=>document.fonts.ready);
  const selectors=['main > h1','.resource-family-copy','.resource-meta','.resource-card--compact','.resource-primary-cta'];
  const reference=await Promise.all(selectors.map(styles));
  await page.goto(`${base}/blog/`); await page.evaluate(()=>document.fonts.ready);
  expect(await Promise.all(selectors.map(styles))).toEqual(reference);
  await page.goto(`${base}/resources/agentic-ai-employees/`); await page.evaluate(()=>document.fonts.ready);
  const opening=['main > h1','.fleet-title-deck','.resources-label'];
  const articleReference=await Promise.all(opening.map(styles));
  await page.goto(`${base}/blog/agentic-society/`); await page.evaluate(()=>document.fonts.ready);
  expect(await Promise.all(opening.map(styles))).toEqual(articleReference);
  // Inline SVG labels inherit the site's real font rather than a fallback artwork font.
  expect(await page.locator('.blog-diagram .diagram-serif').first().evaluate(el=>getComputedStyle(el).fontFamily)).toContain('Cormorant Garamond');
  expect(await page.locator('.blog-diagram .diagram-sans').first().evaluate(el=>getComputedStyle(el).fontFamily)).toContain('DM Sans');
  for (const figure of await page.locator('.blog-diagram').all()) {
    const bad=await figure.locator('svg text').evaluateAll(nodes=>nodes.filter(n=>{const b=n.getBBox();return b.x<0 || b.x+b.width>960;}).map(n=>n.textContent));
    expect(bad).toEqual([]);
  }
  if (process.env.RB_BLOG_CAPTURE && width===1440) {
    await page.locator('.blog-diagram').first().screenshot({path:path.join(root,'QA/results/blog-inline-community.png')});
    await page.locator('.blog-diagram').nth(1).screenshot({path:path.join(root,'QA/results/blog-inline-team.png')});
    await page.locator('.blog-reading').screenshot({path:path.join(root,'QA/results/blog-reading.png')});
  }
});
