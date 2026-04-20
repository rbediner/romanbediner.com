import test from 'node:test';
import assert from 'node:assert/strict';

import { centerViews, rightRailMetrics, statusCards } from '../src/data/dashboardData.js';
import {
  buildSimulatedDashboard,
  detectPriorityOverride,
  FLIP_ELIGIBLE_TILE_IDS,
  formatHeroValue,
  getAutoFlipInterval,
  getFreshnessMinutes,
  getScenarioFrameCount,
  getVisualCadenceSlot,
  INITIAL_NOW,
  LABEL_MUTABLE_TILE_IDS,
  THRESHOLD_COLOR_TILE_IDS,
} from '../src/live/dashboardLiveModel.js';

test('top status cards stay numeric-first', () => {
  assert.deepEqual(
    statusCards.map(({ label, value }) => ({ label, value })),
    [
      { label: 'Pipeline Cov', value: '2.8x' },
      { label: 'Margin Gap', value: '-5.8 pts' },
      { label: 'Client Friction', value: '18 pts' },
      { label: 'Cash Conv', value: '91%' },
    ],
  );
});

test('each center tab keeps the required controlled hero fields', () => {
  for (const [tabId, view] of Object.entries(centerViews)) {
    assert.ok(view.lensLabel, `${tabId} is missing the top-bar lens label`);
    assert.ok(view.hero.eyebrow, `${tabId} is missing the center eyebrow`);
    assert.ok(view.hero.title, `${tabId} is missing the center title`);
    assert.ok(view.hero.support, `${tabId} is missing the support sentence`);
    assert.ok(view.hero.valueFormat, `${tabId} is missing the numeric format`);
    assert.ok(view.hero.targetDisplay, `${tabId} is missing the hero target`);
    assert.ok(view.hero.gapDisplay, `${tabId} is missing the hero gap`);
    assert.ok(view.hero.trendDisplay, `${tabId} is missing the hero trend`);
    assert.match(view.hero.driverDisplay, /[-+0-9$%]/, `${tabId} driver must be quantified`);
  }
});

test('client friction still outranks generic cycle-time drift on the right rail', () => {
  const cycleTime = rightRailMetrics.find((item) => item.id === 'R2');
  const clientRisk = rightRailMetrics.find((item) => item.id === 'R4');

  assert.equal(cycleTime?.state, 'yellow');
  assert.equal(clientRisk?.state, 'red');
});

test('visual cadence keeps the required region rotation and top sequence', () => {
  assert.deepEqual(
    Array.from({ length: 5 }, (_, step) => getVisualCadenceSlot(step, 'M1').region),
    ['top', 'left', 'center', 'right', 'bottom'],
  );

  assert.equal(getVisualCadenceSlot(0, 'M1').targetId, 'T2');
  assert.equal(getVisualCadenceSlot(1, 'M1').targetId, 'D2');
  assert.equal(getVisualCadenceSlot(5, 'M1').targetId, 'T3');
  assert.equal(getVisualCadenceSlot(6, 'M2').targetId, 'C1');
  assert.equal(getVisualCadenceSlot(2, 'M2').targetId, 'M2-hero');
});

test('freshness advances only by whole minutes from the last data arrival', () => {
  const startMs = new Date(INITIAL_NOW).getTime();

  assert.equal(getFreshnessMinutes(startMs, startMs), 0);
  assert.equal(getFreshnessMinutes(startMs + 59_000, startMs), 0);
  assert.equal(getFreshnessMinutes(startMs + 60_000, startMs), 1);
});

test('simulated recompute frames stay deterministic', () => {
  assert.equal(getScenarioFrameCount(), 3);

  const frameZero = buildSimulatedDashboard(0, 0);
  const frameTwo = buildSimulatedDashboard(2, 2);

  assert.equal(frameZero.centerViews.M1.hero.value, 18.2);
  assert.equal(frameTwo.centerViews.M1.hero.value, 18.8);
  assert.equal(frameTwo.leftStackMetrics.find((item) => item.id === 'C1')?.value, '$628K');
  assert.equal(frameTwo.bottomStrip.focus.value, 'Forecast + Cash Conv');
});

test('flip eligibility and affordance scope match the approved tiles only', () => {
  assert.deepEqual(
    FLIP_ELIGIBLE_TILE_IDS,
    ['D1', 'D2', 'D4', 'R2', 'R3', 'R4', 'B7', 'B8', 'B9'],
  );

  for (const tileId of FLIP_ELIGIBLE_TILE_IDS) {
    const interval = getAutoFlipInterval(tileId);
    assert.ok(interval >= 20_000 && interval <= 45_000, `${tileId} interval out of approved range`);
  }
});

test('threshold color and mutable label scope stay constrained', () => {
  assert.equal(LABEL_MUTABLE_TILE_IDS.includes('B6'), true);
  assert.equal(LABEL_MUTABLE_TILE_IDS.includes('D1'), false);
  assert.equal(THRESHOLD_COLOR_TILE_IDS.includes('R1'), true);
  assert.equal(THRESHOLD_COLOR_TILE_IDS.includes('D2'), false);
});

test('priority overrides are limited to the approved tiles', () => {
  const currentDashboard = buildSimulatedDashboard(0, 0);
  const targetDashboard = buildSimulatedDashboard(1, 1);

  assert.equal(detectPriorityOverride(currentDashboard, targetDashboard), null);

  const forecastDropCurrent = buildSimulatedDashboard(0, 0);
  const forecastDropTarget = buildSimulatedDashboard(0, 0);
  forecastDropTarget.leftStackMetrics.find((item) => item.id === 'C1').value = '$598K';

  assert.equal(detectPriorityOverride(forecastDropCurrent, forecastDropTarget), 'C1');
});

test('hero formatter keeps decimal precision stable during animation', () => {
  assert.equal(formatHeroValue(18.2, { style: 'percent', decimals: 1 }), '18.2%');
  assert.equal(formatHeroValue(612, { style: 'currencyK', decimals: 0 }), '$612K');
});
