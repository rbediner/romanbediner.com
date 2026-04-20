/**
 * Executive Dashboard — Screenshot SOP
 *
 * Captures every interactive state so the full UI can be reviewed by
 * ChatGPT, Codex, or stakeholders without needing a live browser.
 *
 * Run: node scripts/capture-dashboard-screenshots.mjs
 * Requires: npm install --save-dev puppeteer (already in package.json)
 * Requires: dev server running at http://localhost:5173/
 *
 * OUTPUT (screenshots/):
 *   dashboard-home.png           — M1 Margin tab (canonical)
 *   dashboard-state-revenue.png  — M2 Revenue tab
 *   dashboard-state-ai.png       — M3 AI tab
 *
 * ADDING NEW STATES:
 * When a new interactive element is added (button, toggle, modal, drawer),
 * add a block below following the same pattern:
 *   1. Trigger the interaction via page.evaluate() or page.click()
 *   2. await new Promise(r => setTimeout(r, 400)) — let animation settle
 *   3. await page.screenshot({ path: join(OUT, 'dashboard-state-NAME.png') })
 *   4. console.log the filename and what it represents
 *   5. Reset to default state before the next capture
 */

import puppeteer from 'puppeteer';
import { existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dir = dirname(fileURLToPath(import.meta.url));
const OUT  = join(__dir, '..', 'screenshots');
const URL  = 'http://localhost:5173/';
const VIEWPORT = { width: 1920, height: 1080, deviceScaleFactor: 1 };
const CHROME_APP = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';

// ── helpers ──────────────────────────────────────────────────────────────

async function clickTab(page, label) {
  await page.evaluate((text) => {
    document.querySelectorAll('.view-tabs__tab').forEach(t => {
      if (t.querySelector('.view-tabs__label')?.textContent?.trim() === text) t.click();
    });
  }, label);
  await settle(page);
}

async function settle(page, ms = 400) {
  await new Promise(r => setTimeout(r, ms));
}

async function shot(page, filename, label) {
  await page.screenshot({ path: join(OUT, filename) });
  console.log(`✓  ${filename.padEnd(46)} ${label}`);
}

async function shotBuffer(page) {
  return page.screenshot({ encoding: 'base64' });
}

async function buildVerificationStrip(page, captures) {
  await page.setViewport({ width: 1960, height: 1120, deviceScaleFactor: 1 });
  await page.setContent(`
    <html>
      <body style="margin:0;background:#0b1016;color:#eef1f6;font-family:DM Sans,sans-serif;">
        <div style="display:flex;flex-direction:column;gap:18px;padding:18px;">
          <div style="display:grid;grid-template-columns:repeat(3, 1fr);gap:18px;">
            ${captures.map((item) => `
              <section style="display:flex;flex-direction:column;gap:10px;">
                <div style="font-size:14px;letter-spacing:0.14em;text-transform:uppercase;color:rgba(238,241,246,0.7);">
                  ${item.title}
                </div>
                <img src="data:image/png;base64,${item.base64}" style="width:100%;height:auto;border-radius:16px;border:1px solid rgba(255,255,255,0.08);" />
              </section>
            `).join('')}
          </div>
        </div>
      </body>
    </html>
  `, { waitUntil: 'load' });
  await settle(page, 200);
  await shot(page, 'dashboard-verification-strip.png', 'Verification strip — Margin / Revenue / AI');
}

// ── main ─────────────────────────────────────────────────────────────────

const browser = await puppeteer.launch({
  headless: true,
  args: ['--no-sandbox', '--disable-dev-shm-usage'],
  executablePath: existsSync(CHROME_APP) ? CHROME_APP : undefined,
});

const page = await browser.newPage();
await page.setViewport(VIEWPORT);
await page.goto(URL, { waitUntil: 'networkidle0' });
await settle(page, 800); // fonts + initial animation settle
const captures = [];

// ─────────────────────────────────────────────────────────────────────────
// STATE 1: M1 Margin — default / canonical
// ─────────────────────────────────────────────────────────────────────────
await clickTab(page, 'Margin');
await shot(page, 'dashboard-home.png', 'M1 Margin (canonical)');
captures.push({ title: 'Margin', base64: await shotBuffer(page) });

// ─────────────────────────────────────────────────────────────────────────
// STATE 2: M2 Revenue tab active
// ─────────────────────────────────────────────────────────────────────────
await clickTab(page, 'Revenue');
await shot(page, 'dashboard-state-revenue.png', 'M2 Revenue tab');
captures.push({ title: 'Revenue', base64: await shotBuffer(page) });

// ─────────────────────────────────────────────────────────────────────────
// STATE 3: M3 AI tab active
// ─────────────────────────────────────────────────────────────────────────
await clickTab(page, 'AI');
await shot(page, 'dashboard-state-ai.png', 'M3 AI tab');
captures.push({ title: 'AI', base64: await shotBuffer(page) });

// ─────────────────────────────────────────────────────────────────────────
// V3.3 CLOSEUPS (required for review)
// ─────────────────────────────────────────────────────────────────────────
await clickTab(page, 'Margin');
const hero = await page.$('.hero-zone');
if (hero) {
  await hero.screenshot({ path: join(OUT, 'dashboard-v33-closeup-hero.png') });
  console.log('✓  dashboard-v33-closeup-hero.png             V3.3 closeup — hero zone');
}

const top = await page.$('.top-status-bar');
if (top) {
  await top.screenshot({ path: join(OUT, 'dashboard-v33-closeup-top-bar.png') });
  console.log('✓  dashboard-v33-closeup-top-bar.png          V3.3 closeup — top bar');
}

const bottom = await page.$('.bottom-control-strip');
if (bottom) {
  await bottom.screenshot({ path: join(OUT, 'dashboard-v33-closeup-bottom-row.png') });
  console.log('✓  dashboard-v33-closeup-bottom-row.png       V3.3 closeup — bottom row');
}

// ─────────────────────────────────────────────────────────────────────────
// VERIFICATION STRIP: side-by-side artifact for review
// ─────────────────────────────────────────────────────────────────────────
await buildVerificationStrip(page, captures);

// ─────────────────────────────────────────────────────────────────────────
// ADD NEW STATES HERE as interactions are built out in V3.
// Pattern:
//   await page.click('[data-box-id="B6"]');   // trigger
//   await settle(page);
//   await shot(page, 'dashboard-state-focus-expanded.png', 'B6 Focus Now expanded');
//   await page.keyboard.press('Escape');       // reset
// ─────────────────────────────────────────────────────────────────────────

await browser.close();
console.log(`\nAll screenshots saved to screenshots/`);
