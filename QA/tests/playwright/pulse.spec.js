/**
 * Invariant:
 * - The PULSE article, metadata and interactive illustration work at the actual destination.
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
  if (process.env.RB_PULSE_BASE_URL) {
    base = process.env.RB_PULSE_BASE_URL.replace(/\/$/, '');
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

for (const width of [1440,1280,1024,768,430,390,320]) test(`Pulse reading and controls at ${width}px`,async({page})=>{
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.setViewportSize({width,height:900});
 await page.goto(`${base}/blog/sunset-grove-ai-creative-agency/`);
 await page.locator('iframe').scrollIntoViewIfNeeded();
 const f=page.frameLocator('iframe');await expect(f.locator('#board [role=button]').first()).toBeVisible();
 await expect(page.locator('iframe')).toHaveAttribute('sandbox','allow-scripts');
 await expect(f.locator('#viewerSel')).toHaveCount(0);
 await expect(f.locator('.note')).toContainText('not live business activity');
 for(const mode of ['idle','night','wed']){await f.locator(`[data-mode=${mode}]`).click();await expect(f.locator(`[data-mode=${mode}]`)).toHaveAttribute('aria-pressed','true');}
 for(const n of ['12','17','21','28']){await f.locator('#slots').selectOption(n);await expect(f.locator('[data-id^="p_"]')).toHaveCount(Number(n));}
 await f.locator('#pause').click();await expect(f.locator('#pause')).toHaveText('Resume');const board=await f.locator('#board').innerHTML();const clock=await f.locator('#clock').innerText();await page.waitForTimeout(1100);expect(await f.locator('#board').innerHTML()).toBe(board);expect(await f.locator('#clock').innerText()).toBe(clock);
 await f.locator('#pause').click();await expect(f.locator('#pause')).toHaveText('Pause');
 const node=f.locator('[data-id="e_ops"]').first();await node.focus();await node.press('Enter');await expect(f.locator('#panelLabel')).toHaveText('Scenario details');
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
 expect(await f.locator('html').evaluate(e=>e.scrollWidth<=window.innerWidth)).toBe(true);
 const boardFrame=f.locator('.boardwrap');expect(await boardFrame.evaluate(e=>e.scrollWidth<=e.clientWidth)).toBe(true);
 const aspect=await f.locator('#board').evaluate(e=>{const r=e.getBoundingClientRect();return r.width/r.height;});expect(aspect).toBeCloseTo(1600/1210,2);
 const full=page.locator('[data-pulse-expand]');await expect(full).toBeVisible();
 const keys=['fontFamily','fontSize','fontWeight','padding','borderRadius','backgroundColor','color','letterSpacing','textTransform','textDecoration','lineHeight'];
 const actual=await full.evaluate((e,keys)=>Object.fromEntries(keys.map(k=>[k,getComputedStyle(e)[k]])),keys);
 const expected=await page.locator('[data-expand-diagram]').evaluate((e,keys)=>Object.fromEntries(keys.map(k=>[k,getComputedStyle(e)[k]])),keys);expect(actual).toEqual(expected);
 await full.evaluate(e=>e.scrollIntoView({block:'center',behavior:'instant'}));const savedY=await page.evaluate(()=>scrollY);await full.click();await expect(page.locator('#pulse-dialog')).toHaveJSProperty('open',true);expect(await page.locator('#pulse-dialog').evaluate(e=>e.matches(':modal'))).toBe(true);
 await page.locator('[data-pulse-zoom=in]').click();await expect(page.locator('#pulse-dialog output')).toHaveText('150%');expect(await f.locator('.boardwrap').evaluate(e=>e.scrollWidth>e.clientWidth)).toBe(true);await page.locator('[data-pulse-zoom=out]').click();await expect(page.locator('#pulse-dialog output')).toHaveText('100%');await page.locator('[data-pulse-zoom=in]').click();await page.locator('[data-pulse-zoom=fit]').click();await expect(page.locator('#pulse-dialog output')).toHaveText('100%');
 await page.evaluate(()=>window.postMessage({type:'pulse:escape'},'*'));await page.waitForTimeout(50);expect(await page.locator('#pulse-dialog').evaluate(e=>e.matches(':modal'))).toBe(true);await f.locator('#slots').selectOption('21');await f.locator('#slots').press('Escape');await expect.poll(()=>page.locator('#pulse-dialog').evaluate(e=>e.matches(':modal'))).toBe(false);await expect(full).toBeFocused();await expect.poll(()=>page.evaluate(()=>scrollY)).toBe(savedY);await expect(f.locator('#slots')).toHaveValue('21');
 await full.click();await page.getByRole('button',{name:'Close expanded PULSE',exact:true}).click();await expect(full).toBeFocused();
 await expect(page.getByRole('link',{name:'Discuss your business workflow',exact:true})).toHaveAttribute('href',/\/connect\/$/);
 await expect(page.locator('.agency-role-table tbody tr')).toHaveCount(8);expect(await page.locator('.agency-role-table').evaluate(e=>e.scrollWidth<=e.clientWidth)).toBe(true);
 const chart=page.locator('.blog-diagram-scroll');expect(await chart.evaluate(e=>e.scrollWidth<=e.clientWidth)).toBe(true);
 await page.locator('[data-expand-diagram]').click();await expect(page.locator('.blog-diagram-dialog')).toBeVisible();await page.keyboard.press('Escape');await expect(page.locator('.blog-diagram-dialog')).not.toBeVisible();
 await expect(page.locator('meta[property="og:image"]')).toHaveAttribute('content',/sunset-grove-agency-cover\.png$/);
 expect(errors).toEqual([]);
 await page.goto(`${base}/blog/`);await expect(page.locator('a[href$="/blog/sunset-grove-ai-creative-agency/"]').first()).toBeVisible();
});
test('Pulse reduced motion starts paused',async({page})=>{
 await page.emulateMedia({reducedMotion:'reduce'});await page.goto(`${base}/blog/sunset-grove-ai-creative-agency/`);await page.locator('iframe').scrollIntoViewIfNeeded();const f=page.frameLocator('iframe');await expect(f.locator('#pause')).toHaveText('Resume');await expect(f.locator('#pause')).toHaveAttribute('aria-pressed','true');
});
test('Pulse artifact and privacy contracts',async()=>{
 const html=fs.readFileSync(path.join(root,'embeds/pulse.html'),'utf8'),js=fs.readFileSync(path.join(root,'embeds/pulse.js'),'utf8'),builder=fs.readFileSync(path.join(root,'scripts/build/create-artifact.js'),'utf8');
 expect(builder).toContain("'embeds'");expect(html).toContain("connect-src 'none'");expect(html).toContain('script src="pulse.js"');expect(js).not.toMatch(/fetch\(|XMLHttpRequest|WebSocket|sendBeacon/);expect(html).not.toContain('viewerSel');
});

test('Maya organization chart supports trusted phone pinch and restores review context',async({browser})=>{
  const context=await browser.newContext({viewport:{width:390,height:844},isMobile:true,hasTouch:true});
  try{const page=await context.newPage();await page.goto(`${base}/blog/sunset-grove-ai-creative-agency/`);const opener=page.locator('[data-expand-diagram]');await opener.tap();
    const dialog=page.locator('.blog-diagram-dialog');await expect(dialog).toBeVisible();expect(Math.round((await dialog.boundingBox()).width)).toBe(390);
    const viewport=page.locator('.blog-diagram-expanded'),box=await viewport.boundingBox(),cx=box.x+box.width/2,cy=box.y+box.height/2;
    const cdp=await context.newCDPSession(page);const points=d=>[{x:cx-d,y:cy,id:1},{x:cx+d,y:cy,id:2}];
    await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:points(30)});await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:points(80)});await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});
    await expect.poll(async()=>parseInt(await dialog.locator('output').innerText(),10)).toBeGreaterThan(200);
    await page.getByRole('button',{name:'Fit',exact:true}).tap();await expect(dialog.locator('output')).toHaveText('100%');
    await page.getByRole('button',{name:'Close diagram',exact:true}).tap();await expect(dialog).toBeHidden();await expect(opener).toBeFocused();
    await expect.poll(()=>page.locator('body').evaluate(n=>n.style.overflow)).toBe('');
  }finally{await context.close();}
});

test('PULSE viewer uses the diagram toolbar and trusted phone pinch',async({browser})=>{
 const context=await browser.newContext({viewport:{width:390,height:844},isMobile:true,hasTouch:true});
 try{const page=await context.newPage();await page.goto(`${base}/blog/sunset-grove-ai-creative-agency/`);await page.locator('[data-pulse-expand]').tap();const f=page.frameLocator('#pulse-dialog iframe');await expect(f.locator('#board [role=button]').first()).toBeVisible();
 const toolbar=page.locator('#pulse-dialog .diagram-zoom-controls');const properties=['fontFamily','fontSize','fontWeight','padding','borderRadius','backgroundColor','color','border','minHeight','lineHeight'];const pulseStyles=await toolbar.locator('button').first().evaluate((e,k)=>Object.fromEntries(k.map(x=>[x,getComputedStyle(e)[x]])),properties);
 await f.locator('.boardwrap').scrollIntoViewIfNeeded();const box=await f.locator('.boardwrap').boundingBox(),cx=box.x+box.width/2,cy=box.y+Math.min(box.height/2,120);const cdp=await context.newCDPSession(page);const points=d=>[{x:cx-d,y:cy,id:1},{x:cx+d,y:cy,id:2}];
 await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:points(30)});await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:points(80)});await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});await expect.poll(async()=>parseInt(await toolbar.locator('output').innerText())).toBeGreaterThan(200);
 await toolbar.getByRole('button',{name:'Fit',exact:true}).tap();await expect(toolbar.locator('output')).toHaveText('100%');await page.locator('[data-pulse-close]').tap();await page.locator('[data-expand-diagram]').tap();const reference=await page.locator('.blog-diagram-dialog .diagram-zoom-controls button').first().evaluate((e,k)=>Object.fromEntries(k.map(x=>[x,getComputedStyle(e)[x]])),properties);expect(pulseStyles).toEqual(reference);await page.getByRole('button',{name:'Close diagram',exact:true}).tap();
 }finally{await context.close();}
});
