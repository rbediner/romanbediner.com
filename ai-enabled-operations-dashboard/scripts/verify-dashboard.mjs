import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import puppeteer from 'puppeteer';

const URL = 'http://127.0.0.1:5173/';
const VIEWPORT = { width: 1920, height: 1080, deviceScaleFactor: 1 };
const CHROME_APP = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';

const flipEligible = ['D1', 'D2', 'D4', 'R2', 'R3', 'R4', 'B7', 'B8', 'B9'];
const ineligibleChecks = ['T2', 'D3', 'C1', 'H1', 'B6', 'B10', 'B11'];

async function settle(ms = 350) {
  await new Promise((resolve) => setTimeout(resolve, ms));
}

async function readState(page) {
  return page.evaluate(() => ({
    flipTiles: Array.from(document.querySelectorAll('[data-flip-eligible="true"]')).map((node) => node.getAttribute('data-box-id')),
    activeLiveRegions: Array.from(document.querySelectorAll('[data-live-region]'))
      .filter((node) => node.dataset.liveRegion && node.dataset.liveRegion !== 'idle')
      .map((node) => ({ id: node.getAttribute('data-box-id'), region: node.dataset.liveRegion })),
    labels: {
      D3: document.querySelector('[data-box-id="D3"] .rail-tile__label')?.textContent?.trim(),
      C1: document.querySelector('[data-box-id="C1"] .stack-tile__label')?.textContent?.trim(),
      B6: document.querySelector('[data-box-id="B6"] .focus-now-tile__label')?.textContent?.trim(),
      B6Value: document.querySelector('[data-box-id="B6"] .focus-now-tile__value')?.textContent?.trim(),
    },
  }));
}

const browser = await puppeteer.launch({
  headless: true,
  args: ['--no-sandbox', '--disable-dev-shm-usage'],
  executablePath: existsSync(CHROME_APP) ? CHROME_APP : undefined,
});

try {
  const page = await browser.newPage();
  await page.setViewport(VIEWPORT);
  await page.goto(URL, { waitUntil: 'networkidle0' });
  await settle(1_000);

  const initial = await readState(page);

  assert.deepEqual(initial.flipTiles, flipEligible);

  for (const tileId of flipEligible) {
    assert.equal(
      await page.$(`[data-box-id="${tileId}"] .flip-tile__cue`) !== null,
      true,
      `${tileId} is missing the flip cue`,
    );
  }

  for (const tileId of ineligibleChecks) {
    assert.equal(
      await page.$(`[data-box-id="${tileId}"] .flip-tile__cue`) !== null,
      false,
      `${tileId} should not show a flip cue`,
    );
  }

  await page.click('[data-box-id="D1"]');
  await settle(150);
  assert.equal(await page.$eval('[data-box-id="D1"]', (node) => node.getAttribute('data-flipped')), 'true');

  await page.mouse.move(10, 10);
  await settle(3_500);
  assert.equal(await page.$eval('[data-box-id="D1"]', (node) => node.getAttribute('data-flipped')), 'false');

  const labelsBefore = initial.labels;
  await settle(24_500);
  const labelsAfter = await readState(page);

  assert.equal(labelsAfter.labels.D3, labelsBefore.D3, 'D3 label changed unexpectedly');
  assert.equal(labelsAfter.labels.C1, labelsBefore.C1, 'C1 label changed unexpectedly');
  assert.equal(labelsAfter.labels.B6, labelsBefore.B6, 'B6 label changed unexpectedly');
  assert.notEqual(labelsAfter.labels.B6Value, '', 'B6 value should remain populated');

  const autoFlipSample = [];
  for (let index = 0; index < 14; index += 1) {
    await settle(1_000);
    autoFlipSample.push(await page.evaluate(() => ({
      flipped: Array.from(document.querySelectorAll('[data-flipped="true"]')).map((node) => node.getAttribute('data-box-id')),
      activeLive: Array.from(document.querySelectorAll('[data-live-region]'))
        .filter((node) => node.dataset.liveRegion && node.dataset.liveRegion !== 'idle')
        .map((node) => node.getAttribute('data-box-id')),
    })));
  }

  const observedAutoFlip = autoFlipSample.find((snapshot) => snapshot.flipped.length > 0);
  assert.ok(observedAutoFlip, 'expected one sparse auto-flip during the sample window');
  assert.ok(observedAutoFlip.flipped.every((tileId) => flipEligible.includes(tileId)), 'auto-flip hit an ineligible tile');
  assert.ok(observedAutoFlip.flipped.length <= 1, 'more than one tile auto-flipped at once');

  for (const snapshot of autoFlipSample) {
    assert.ok(snapshot.activeLive.length <= 1, 'more than one live region updated in a single slot');
  }

  await page.click('[data-box-id="B11"]');
  await settle(150);
  assert.equal(await page.$eval('[data-box-id="B11"]', (node) => node.getAttribute('aria-pressed')), 'true');
  assert.equal(await page.$eval('.app-shell', (node) => node.classList.contains('is-presentation-mode')), true);

  await page.click('[data-box-id="D2"]');
  await settle(150);
  assert.equal(await page.$eval('[data-box-id="D2"]', (node) => node.getAttribute('data-flipped')), 'false');

  console.log('Dashboard QA verification passed for flip affordance, cadence isolation, and presentation mode.');
} finally {
  await browser.close();
}
