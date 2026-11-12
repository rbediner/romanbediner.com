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
 const full=page.getByRole('link',{name:'Expand Pulse to full window (opens a new tab)',exact:true});await expect(full).toHaveAttribute('href',/\/embeds\/pulse\.html$/);await expect(full).toBeVisible();
 const keys=['fontFamily','fontSize','fontWeight','padding','borderRadius','backgroundColor','color','letterSpacing','textTransform','textDecoration','lineHeight'];
 const actual=await full.evaluate((e,keys)=>Object.fromEntries(keys.map(k=>[k,getComputedStyle(e)[k]])),keys);
 const ref=await page.context().newPage();await ref.setViewportSize({width,height:900});await ref.goto(`${base}/resources/ai-enabled-operations-dashboard/`);
 const expected=await ref.locator('.resource-dashboard-expand-cta').evaluate((e,keys)=>Object.fromEntries(keys.map(k=>[k,getComputedStyle(e)[k]])),keys);expect(actual).toEqual(expected);await ref.close();
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
