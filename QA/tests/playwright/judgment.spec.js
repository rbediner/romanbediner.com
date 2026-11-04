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
  if (process.env.RB_JUDGMENT_BASE_URL) {
    base = process.env.RB_JUDGMENT_BASE_URL.replace(/\/$/, '');
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

for (const width of [1440,1024,768,390,320]) test(`Reusable judgment article at ${width}px`, async ({page}) => {
  const errors=[];
  page.on('pageerror', error => errors.push(error.message));
  await page.setViewportSize({width,height:900});
  const response=await page.goto(`${base}/blog/make-judgment-reusable/`);
  expect(response.status()).toBe(200);
  await page.evaluate(() => document.fonts.ready);
  await expect(page.locator('h1')).toHaveText('Make judgment reusable');
  if (width >= 1024) expect(await page.locator('h1').evaluate(node => {
    const range=document.createRange();range.selectNodeContents(node);
    return new Set([...range.getClientRects()].map(box=>Math.round(box.top))).size;
  })).toBe(1);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href','https://romanbediner.com/blog/make-judgment-reusable/');
  await expect(page.locator('meta[name="ga4-measurement-id"]')).toHaveAttribute('content','G-DVHD0KL633');
  await expect(page.locator('script[src*="ga4-bootstrap"]')).toHaveCount(1);
  await expect(page.locator('meta[property="og:image"]')).toHaveAttribute('content', /reusable-judgment-cover.png$/);
  const graph=JSON.parse(await page.locator('script[type="application/ld+json"]').textContent())['@graph'];
  expect(graph[0].author.name).toBe('Roman Bediner');
  expect(graph[0].mainEntityOfPage).toBe('https://romanbediner.com/blog/make-judgment-reusable/');
  expect(graph[1]['@type']).toBe('BreadcrumbList');
  // Every table-of-contents target must resolve to the article being read.
  for (const link of await page.locator('[data-section-nav] a').all()) {
    await expect(page.locator(await link.getAttribute('href'))).toHaveCount(1);
  }
  const figure=page.locator('.blog-diagram');
  await expect(figure).toHaveCount(1);
  expect(await figure.locator('.blog-diagram-scroll').evaluate(node=>node.scrollWidth<=node.clientWidth)).toBe(true);
  const issues=await figure.locator('svg').evaluate(svg=>{
    const bad=[];
    for(const group of svg.querySelectorAll('[data-diagram-panel]')) {
      const panel=group.querySelector('rect').getBBox();let bottom=null;
      for(const text of group.querySelectorAll('text')) {
        const box=text.getBBox();
        if(box.x<panel.x+8 || box.x+box.width>panel.x+panel.width-8 || box.y<panel.y+8 || box.y+box.height>panel.y+panel.height-8) bad.push(text.textContent);
        if(bottom!==null && box.y-bottom<8) bad.push(`line gap: ${text.textContent}`);
        bottom=box.y+box.height;
      }
    }
    return bad;
  });
  expect(issues).toEqual([]);
  // Fixed triangle heads must meet the end of a shaft; detached heads caused the owner rejection.
  const detachedHeads = await figure.locator('svg').evaluate(svg => {
    const ends = [...svg.querySelectorAll('path[stroke]')].map(path => path.getPointAtLength(path.getTotalLength()));
    return [...svg.querySelectorAll('[data-arrowhead]')].filter(head => {
      const points = [...head.points];
      const base = {x:(points[1].x+points[2].x)/2,y:(points[1].y+points[2].y)/2};
      return !ends.some(end => Math.hypot(end.x-base.x,end.y-base.y) <= 1);
    }).map(head => head.getAttribute('points'));
  });
  expect(detachedHeads).toEqual([]);
  expect(await figure.locator('.diagram-serif').first().evaluate(n=>getComputedStyle(n).fontFamily)).toContain('Cormorant Garamond');
  const opener=page.locator('[data-expand-diagram]');
  await opener.click();await expect(page.locator('dialog')).toBeVisible();
  await page.locator('.blog-diagram-expanded').focus();
  await page.keyboard.press('+');await expect(page.locator('dialog output')).not.toHaveText('100%');
  await page.getByRole('button',{name:'Fit',exact:true}).click();
  await expect(page.locator('dialog output')).toHaveText('100%');
  await page.keyboard.press('Escape');await expect(opener).toBeFocused();
  await expect.poll(()=>page.locator('body').evaluate(n=>n.style.overflow)).toBe('');
  if(process.env.RB_JUDGMENT_CAPTURE && [1440,390].includes(width)) {
    const dir=path.join(root,process.env.RB_JUDGMENT_CAPTURE);fs.mkdirSync(dir,{recursive:true});
    await page.evaluate(()=>window.scrollTo(0,0));
    await page.screenshot({path:path.join(dir,`article-${width}.png`),fullPage:true});
    // Capture the below-fold diagram without moving it underneath the sticky header.
    const diagramBox = await figure.boundingBox();
    await page.screenshot({path:path.join(dir,`diagram-${width}.png`),clip:diagramBox,fullPage:true});
  }
  await page.goto(`${base}/blog/`);
  const card=page.locator('article').filter({has:page.locator('h2 a[href$="/blog/make-judgment-reusable/"]')});
  await expect(card).toHaveClass(/resource-card--compact/);
  await expect(card.getByRole('link',{name:'Read the article'})).toBeVisible();
  expect(errors).toEqual([]);
});

test('New judgment diagram supports trusted phone pinch, pan and context return',async({browser})=>{
  const context=await browser.newContext({viewport:{width:390,height:844},isMobile:true,hasTouch:true});
  try {
    const page=await context.newPage();await page.goto(`${base}/blog/make-judgment-reusable/`);
    const opener=page.locator('[data-expand-diagram]');await opener.tap();
    const dialog=page.locator('dialog');await expect(dialog).toBeVisible();
    const view=page.locator('.blog-diagram-expanded'), box=await view.boundingBox();
    const cx=box.x+box.width/2,cy=box.y+box.height/2;
    const cdp=await context.newCDPSession(page);
    const points=d=>[{x:cx-d,y:cy,id:1},{x:cx+d,y:cy,id:2}];
    await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:points(25)});
    await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:points(70)});
    await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});
    await expect.poll(async()=>parseInt(await dialog.locator('output').innerText(),10)).toBeGreaterThan(200);
    const art=view.locator('svg'), before=await art.evaluate(n=>n.style.transform);
    await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:cx,y:cy,id:3}]});
    await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:cx+35,y:cy+20,id:3}]});
    await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});
    expect(await art.evaluate(n=>n.style.transform)).not.toBe(before);
    await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:points(70)});
    await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:points(35)});
    await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});
    await expect.poll(async()=>parseInt(await dialog.locator('output').innerText(),10)).toBeLessThan(200);
    await page.getByRole('button',{name:'Zoom in',exact:true}).tap();
    await page.getByRole('button',{name:'Zoom out',exact:true}).tap();
    await page.getByRole('button',{name:'Fit',exact:true}).tap();await expect(dialog.locator('output')).toHaveText('100%');
    await page.getByRole('button',{name:'Close diagram',exact:true}).tap();await expect(dialog).toBeHidden();
    await expect(opener).toBeFocused();await expect.poll(()=>page.locator('body').evaluate(n=>n.style.overflow)).toBe('');
  } finally { await context.close(); }
});
