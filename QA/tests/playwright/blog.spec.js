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
  await expect(page.getByRole('heading',{level:1})).toHaveText('BLOG');
  await expect(page.locator('.blog-feature')).toHaveCount(1);
  // The artwork, headline and explicit action all lead to the real article.
  await expect(page.locator('.blog-feature-art a')).toHaveAttribute('href','/blog/agentic-society/');
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
  if (process.env.RB_BLOG_CAPTURE && [1440,390].includes(width)) {
    await page.screenshot({path:path.join(root,`QA/results/blog-hub-${width}.png`)});
  }
  await page.getByRole('link',{name:'Read the story'}).click();
  await expect(page).toHaveURL(/\/blog\/agentic-society\/$/);
  if (process.env.RB_BLOG_CAPTURE && [1440,390].includes(width)) {
    await page.screenshot({path:path.join(root,`QA/results/blog-article-${width}.png`)});
  }
  await expect(page.locator('.affiliate-disclosure').first()).toContainText('I may earn a commission');
  for(const link of await page.locator('[data-partner-cta]').all()) {
    await expect(link).toHaveAttribute('href','https://agenticsociety.com?ref=roman-967464');
    await expect(link).toHaveAttribute('rel',/sponsored/);
  }
  for(const button of await page.locator('[data-expand-diagram]').all()) {
    await button.click();await expect(page.locator('dialog')).toBeVisible();
    await expect(page.locator('dialog img')).toHaveJSProperty('complete',true);
    await page.keyboard.press('Escape');await expect(button).toBeFocused();
  }
  await page.getByText('Can I join Agentic Society online outside Austin?',{exact:true}).click();
  await expect(page.locator('details[open]')).toContainText('virtual component');
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
  expect(errors).toEqual([]);
});

test('Workflow labels fit their actual SVG panels', async({page})=>{
  // Measure rendered font geometry, reproducing the owner-reported clipped label.
  for(const name of ['community-loop','solution-workflow']) {
    await page.goto(`${base}/assets/blog/${name}.svg`);
    const bounds=await page.locator('text[y="199"]').evaluateAll(nodes=>nodes.map(node=>{
      const box=node.getBBox();return {x:box.x,right:box.x+box.width};
    }));
    expect(bounds).toHaveLength(3);
    bounds.forEach((box,index)=>{
      expect(box.x).toBeGreaterThanOrEqual(48+304*index+16);
      expect(box.right).toBeLessThanOrEqual(48+304*index+256-12);
    });
    if(process.env.RB_BLOG_CAPTURE) await page.locator('svg').screenshot({path:path.join(root,`QA/results/${name}.png`)});
  }
  await page.goto(`${base}/assets/blog/company-brain-team.svg`);
  const outside=await page.locator('text').evaluateAll(nodes=>nodes.filter(node=>{
    const b=node.getBBox();return b.x<0 || b.x+b.width>960;
  }).map(node=>node.textContent));
  expect(outside).toEqual([]);
  if(process.env.RB_BLOG_CAPTURE) await page.locator('svg').screenshot({path:path.join(root,'QA/results/company-brain-team.png')});
});
