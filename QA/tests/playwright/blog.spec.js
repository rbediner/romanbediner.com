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
// A second genuine article exercises the reusable builder, its chart and hub discovery.
for (const width of [1440,390]) test(`Attention-budget article and site-style chart at ${width}px`, async({page})=>{
  await page.setViewportSize({width,height:900});
  const errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto(`${base}/blog/ai-agent-attention-budget/`);await page.evaluate(()=>document.fonts.ready);
  await expect(page.locator('h1')).toHaveCount(1);
  await expect(page.locator('h1')).toHaveText('AI agents need an attention budget');
  await expect(page.locator('meta[name="ga4-measurement-id"]')).toHaveAttribute('content','G-DVHD0KL633');
  await expect(page.locator('script[src*="ga4-bootstrap"]')).toHaveCount(1);
  await expect(page.locator('#sources')).toHaveText('Sources and context');
  expect(await page.locator('.article-body a[href^="https:"]').count()).toBeGreaterThanOrEqual(6);
  const figure=page.locator('.blog-diagram');await expect(figure).toHaveCount(1);
  expect(await figure.locator('.blog-diagram-scroll').evaluate(n=>n.scrollWidth<=n.clientWidth)).toBe(true);
  const chart=await figure.locator('svg').evaluate(svg=>{
    const before=svg.querySelector('[data-time-row="before"] rect').getBBox();
    const parts=[...svg.querySelectorAll('.attention-segment')];const potential=svg.querySelector('[data-time-row="potential"] rect').getBBox();
    const badLabels=[...svg.querySelectorAll('text')].filter(n=>{const b=n.getBBox();return b.x<20||b.x+b.width>1060||b.y<10||b.y+b.height>750;}).map(n=>n.textContent);
    const badPanels=[...svg.querySelectorAll('[data-diagram-panel]')].flatMap(g=>{const p=g.querySelector('rect').getBBox();return [...g.querySelectorAll('text')].filter(n=>{const b=n.getBBox();return b.x<p.x+8||b.x+b.width>p.x+p.width-8||b.y<p.y+8||b.y+b.height>p.y+p.height-8;}).map(n=>n.textContent);});
    return {start:parts[0].getBBox().x,beforeX:before.x,beforeWidth:before.width,afterWidth:parts.reduce((n,p)=>n+p.getBBox().width,0),minutes:parts.reduce((n,p)=>n+Number(p.dataset.minutes),0),potentialWidth:potential.width,badLabels,badPanels};
  });
  expect(chart.start).toBe(chart.beforeX);expect(chart.minutes).toBe(300);
  expect(chart.afterWidth/chart.beforeWidth).toBeCloseTo(5/8);expect(chart.potentialWidth/chart.beforeWidth).toBeCloseTo(3/8);
  expect(chart.badLabels).toEqual([]);expect(chart.badPanels).toEqual([]);
  expect(await figure.locator('.diagram-serif').first().evaluate(n=>getComputedStyle(n).fontFamily)).toContain('Cormorant Garamond');
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
  if(process.env.RB_BLOG_CAPTURE){await page.screenshot({path:path.join(root,`QA/results/attention-article-hero-${width}.png`)});await figure.screenshot({path:path.join(root,`QA/results/attention-diagram-${width}.png`)});}
  await page.goto(`${base}/blog/`);await expect(page.locator('a[href="/blog/ai-agent-attention-budget/"]').first()).toBeVisible();
  expect(errors).toEqual([]);
});

test('Attention-budget diagram supports trusted phone pinch and restores review context',async({browser})=>{
  const context=await browser.newContext({viewport:{width:390,height:844},isMobile:true,hasTouch:true});
  try{const page=await context.newPage();await page.goto(`${base}/blog/ai-agent-attention-budget/`);const opener=page.locator('[data-expand-diagram]');await opener.tap();
    const dialog=page.locator('dialog');await expect(dialog).toBeVisible();expect(Math.round((await dialog.boundingBox()).width)).toBe(390);
    const viewport=page.locator('.blog-diagram-expanded'),box=await viewport.boundingBox(),cx=box.x+box.width/2,cy=box.y+box.height/2;
    const cdp=await context.newCDPSession(page);const points=d=>[{x:cx-d,y:cy,id:1},{x:cx+d,y:cy,id:2}];
    await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:points(30)});await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:points(80)});await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});
    await expect.poll(async()=>parseInt(await dialog.locator('output').innerText(),10)).toBeGreaterThan(200);
    await page.getByRole('button',{name:'Fit',exact:true}).tap();await expect(dialog.locator('output')).toHaveText('100%');
    await page.getByRole('button',{name:'Close diagram',exact:true}).tap();await expect(dialog).toBeHidden();await expect(opener).toBeFocused();
    await expect.poll(()=>page.locator('body').evaluate(n=>n.style.overflow)).toBe('');
  }finally{await context.close();}
});
for(const width of [1440,1280,1024,768,430,390,320])test(`Blog conversion and diagrams at ${width}px`,async({page})=>{
  const errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.setViewportSize({width,height:900});
  await page.goto(`${base}/blog/`);
  await expect(page.getByRole('heading',{level:1})).toHaveText('Blog');
  const originalCard=page.locator('article').filter({has:page.locator('h2 a[href="/blog/agentic-society/"]')});
  await expect(originalCard).toHaveCount(1);
  // Use the same compact component as Resources, with a linked article heading.
  await expect(originalCard).toHaveClass(/resource-card--compact/);
  await expect(originalCard.locator('h2 a')).toHaveAttribute('href','/blog/agentic-society/');
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
  if (process.env.RB_BLOG_CAPTURE && [1440,390].includes(width)) {
    await page.screenshot({path:path.join(root,`QA/results/blog-hub-${width}.png`)});
  }
  await originalCard.getByRole('link',{name:'Read the article'}).click();
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
    // Page-level overflow alone missed a scrolling diagram inside its own frame.
    const frame=button.locator('..').locator('..').locator('.blog-diagram-scroll');
    expect(await frame.evaluate(n=>n.scrollWidth<=n.clientWidth)).toBe(true);
    await expect(button).toContainText('Expand to full screen');
    await button.click();await expect(page.locator('dialog')).toBeVisible();
    await expect(page.locator('dialog svg')).toBeVisible();
    const size=await page.locator('dialog').boundingBox();
    expect(Math.round(size.width)).toBe(width);
    expect(Math.round(size.height)).toBe(900);
    expect(await page.locator('[id]').evaluateAll(nodes=>nodes.length===new Set(nodes.map(n=>n.id)).size)).toBe(true);
    await page.keyboard.press('Escape');await expect(button).toBeFocused();
  }
  await page.getByText('Can I join Agentic Society online outside Austin?',{exact:true}).click();
  await expect(page.locator('details[open]')).toContainText('virtual component');
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
  expect(errors).toEqual([]);
});

for (const width of [320,390,430]) test(`Phone fullscreen diagram supports real pinch, pan, Fit and close at ${width}px`,async({browser})=>{
  const context=await browser.newContext({viewport:{width,height:844},isMobile:true,hasTouch:true});
  try {
    const page=await context.newPage();
    await page.goto(`${base}/blog/agentic-society/`);
    const opener=page.locator('[data-expand-diagram]').nth(1);
    await opener.tap();
    const viewport=page.locator('.blog-diagram-expanded');
    const box=await viewport.boundingBox(), cx=box.x+box.width/2, cy=box.y+box.height/2;
    const client=await context.newCDPSession(page);
    // Chromium generates trusted touch/pointer events, exercising the actual gesture caller.
    const pinch=async(from,to)=>{
      const points=d=>[{x:cx-d,y:cy,id:1},{x:cx+d,y:cy,id:2}];
      await client.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:points(from)});
      await client.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:points(to)});
      await client.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});
    };
    await pinch(30,80);
    expect(parseInt(await page.locator('dialog output').innerText())).toBeGreaterThan(200);
    const before=await viewport.locator('svg').getAttribute('style');
    await client.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:cx,y:cy,id:1}]});
    await client.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:cx+35,y:cy+25,id:1}]});
    await client.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});
    expect(await viewport.locator('svg').getAttribute('style')).not.toBe(before);
    await pinch(80,30);
    await expect(page.locator('dialog output')).toHaveText('100%');
    await page.getByRole('button',{name:'Zoom in',exact:true}).tap();
    await expect(page.locator('dialog output')).toHaveText('150%');
    await page.getByRole('button',{name:'Zoom out',exact:true}).tap();
    await expect(page.locator('dialog output')).toHaveText('100%');
    await viewport.focus();await page.keyboard.press('+');
    await expect(page.locator('dialog output')).toHaveText('150%');
    await page.getByRole('button',{name:'Fit',exact:true}).tap();
    await expect(page.locator('dialog output')).toHaveText('100%');
    expect(await page.locator('dialog').evaluate(n=>n.scrollWidth<=n.clientWidth)).toBe(true);
    await page.screenshot({path:path.join(root,`QA/results/blog-mobile-fullscreen-${width}.png`)});
    await page.getByRole('button',{name:'Close diagram',exact:true}).tap();
    await expect(page.locator('dialog')).toBeHidden();await expect(opener).toBeFocused();
    // The native close event restores scroll asynchronously after dialog visibility changes.
    await expect.poll(()=>page.locator('body').evaluate(n=>n.style.overflow)).toBe('');
    expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
    await page.locator('.blog-diagram').nth(1).screenshot({path:path.join(root,`QA/results/blog-mobile-inline-${width}.png`)});
  } finally {await context.close();}
});

test('Community and full-fleet diagrams have readable, contained labels', async({page})=>{
  await page.goto(`${base}/blog/agentic-society/`);
  await page.evaluate(()=>document.fonts.ready);
  await expect(page.locator('.blog-diagram')).toHaveCount(2);
  for (const figure of await page.locator('.blog-diagram').all()) {
    const outside=await figure.locator('svg text').evaluateAll(nodes=>nodes.filter(n=>{
      const b=n.getBBox(), bounds=n.ownerSVGElement.viewBox.baseVal;
      return b.x<20 || b.x+b.width>bounds.width-20 || b.y<10 || b.y+b.height>bounds.height-10;
    }).map(n=>n.textContent));
    expect(outside).toEqual([]);
  }
  // Check each actual role panel, independent of its position in the hierarchy.
  const roles=await page.locator('.blog-diagram').nth(1).locator('svg [data-role]').evaluateAll(groups=>groups.map(g=>{
    const panel=g.querySelector('rect').getBBox();
    const outside=[...g.querySelectorAll('text')].filter(n=>{
      const b=n.getBBox();return b.x<panel.x+8 || b.x+b.width>panel.x+panel.width-8 || b.y<panel.y+8 || b.y+b.height>panel.y+panel.height-8;
    }).map(n=>n.textContent);
    return {role:g.dataset.role,outside};
  }));
  expect(roles.map(r=>r.role).sort()).toEqual(['director','staff-engineer','project-manager','chief-of-staff','revops-engineer','improvement-engineer','ai-correspondent','solution-architect'].sort());
  roles.forEach(r=>expect(r.outside,r.role).toEqual([]));
  // Shared memory contains every role; a single specialist must not own its only path.
  const brain=page.locator('.blog-diagram').nth(1).locator('[data-company-brain]');
  await expect(brain.locator('[data-role]')).toHaveCount(8);
  await expect(brain).toContainText('All eight agents read and write shared context.');
  const structure=await brain.evaluate(g=>{
    const boundary=g.querySelector('[data-brain-boundary]').getBBox();
    const panels=[...g.querySelectorAll('[data-role] > rect')].map(n=>n.getBBox());
    const titles=[...g.querySelector('[data-role="director"]').querySelectorAll('text')].slice(0,2).map(n=>n.getBBox());
    return {contained:panels.every(b=>b.x>boundary.x && b.y>boundary.y && b.x+b.width<boundary.x+boundary.width && b.y+b.height<boundary.y+boundary.height),titleGap:titles[1].y-(titles[0].y+titles[0].height)};
  });
  expect(structure.contained).toBe(true);
  expect(structure.titleGap).toBeGreaterThanOrEqual(8);

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
    const bad=await figure.locator('svg text').evaluateAll(nodes=>nodes.filter(n=>{const b=n.getBBox();return b.x<0 || b.x+b.width>n.ownerSVGElement.viewBox.baseVal.width;}).map(n=>n.textContent));
    expect(bad).toEqual([]);
  }
  if (process.env.RB_BLOG_CAPTURE && width===1440) {
    await page.locator('.blog-diagram').first().screenshot({path:path.join(root,'QA/results/blog-inline-community.png')});
    await page.locator('.blog-diagram').nth(1).screenshot({path:path.join(root,'QA/results/blog-inline-team.png')});
    await page.locator('.blog-reading').screenshot({path:path.join(root,'QA/results/blog-reading.png')});
  }
});
