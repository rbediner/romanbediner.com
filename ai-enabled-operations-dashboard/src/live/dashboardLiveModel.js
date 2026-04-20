import {
  bottomStrip as baseBottomStrip,
  centerViews as baseCenterViews,
  leftRailMetrics as baseLeftRailMetrics,
  leftStackMetrics as baseLeftStackMetrics,
  rightRailMetrics as baseRightRailMetrics,
  rightStackMetrics as baseRightStackMetrics,
  statusCards as baseStatusCards,
} from '../data/dashboardData.js';

export const VISUAL_CADENCE_MS = 4_000;
export const SIMULATED_RECOMPUTE_MS = 24_000;
export const FRESHNESS_MINUTE_MS = 60_000;
export const FOCUS_NOW_ROTATE_MS = 30_000;
export const FLIP_DWELL_MS = 3_200;
export const OVERRIDE_HOLD_MS = 2_000;
export const OVERRIDE_WINDOW_MS = 10_000;
export const INITIAL_NOW = '2026-04-16T09:00:00-04:00';

export const VISUAL_REGION_ORDER = ['top', 'left', 'center', 'right', 'bottom'];
export const TOP_SIGNAL_SEQUENCE = ['T2', 'T3', 'T4', 'T5', 'T6'];
export const LEFT_SIGNAL_SEQUENCE = ['D2', 'C1', 'D3', 'D4', 'D1', 'C2', 'C3'];
export const RIGHT_SIGNAL_SEQUENCE = ['R1', 'O3', 'R4', 'R2', 'R3', 'O1', 'O2'];
export const BOTTOM_SIGNAL_SEQUENCE = ['B6', 'B4', 'B7', 'B8', 'B9', 'B5', 'B3'];

export const FLIP_ELIGIBLE_TILE_IDS = ['D1', 'D2', 'D4', 'R2', 'R3', 'R4', 'B7', 'B8', 'B9'];
export const THRESHOLD_COLOR_TILE_IDS = ['T3', 'T4', 'T5', 'T6', 'D3', 'C1', 'O1', 'O3', 'R1', 'R2', 'R3', 'R4', 'B4', 'B5', 'B7', 'B8', 'B9'];
export const LABEL_MUTABLE_TILE_IDS = ['T2', 'B6'];
export const PRIORITY_OVERRIDE_TILE_IDS = ['R1', 'T5', 'C1', 'B6'];
export const NON_ESSENTIAL_MOTION_DISABLED_IN_PRESENTATION = ['heroGlow', 'regionRefresh', 'tileFlip'];

const REGION_FLIP_TARGETS = {
  left: ['D1', 'D2', 'D4'],
  right: ['R2', 'R3', 'R4'],
  bottom: ['B7', 'B8', 'B9'],
};

const AUTO_FLIP_INTERVALS = {
  D1: 20_000,
  D2: 24_000,
  D4: 28_000,
  R2: 32_000,
  R3: 36_000,
  R4: 40_000,
  B7: 45_000,
  B8: 26_000,
  B9: 34_000,
};

const focusNowSequence = [
  { value: 'Margin + Capacity', subtext: '3 priority actions', emphasis: 'alert' },
  { value: 'Client Friction + SLA', subtext: '2 actions to recover', emphasis: 'alert' },
  { value: 'Forecast + Cash Conv', subtext: '3 actions to close gap', emphasis: 'alert' },
];

const scenarioFrames = [
  {
    statusCards: {
      T3: { value: '2.8x', state: 'green' },
      T4: { value: '-5.8 pts', state: 'yellow' },
      T5: { value: '18 pts', state: 'red' },
      T6: { value: '91%', state: 'yellow' },
    },
    leftRailMetrics: {
      D1: { value: '18', status: '+4 vs prior', state: 'green', flipBack: { value: '+4 vs prior', status: 'Fresh 0m ago' } },
      D2: { value: '$1.84M', state: 'green', flipBack: { value: 'Target $2.00M', status: '+$90K vs prior' } },
      D3: { value: '$420K', status: 'At risk', state: 'yellow' },
      D4: { value: '34%', status: '+2 pts', state: 'green', flipBack: { value: '+2 pts', status: 'Band 32% to 36%' } },
    },
    leftStackMetrics: {
      C1: { value: '$612K', context: 'Target $650K', status: '-$38K to plan', state: 'yellow' },
      C2: { value: '41%', status: '+3 pts QoQ' },
      C3: { value: '$28K', status: 'Premium mix' },
    },
    rightStackMetrics: {
      O1: { value: '78%', status: 'On target', state: 'green' },
      O2: { value: '$18.6K', status: 'AI lift +14%' },
      O3: { value: '9.5d', status: 'Client friction up', state: 'yellow' },
    },
    rightRailMetrics: {
      R1: { value: '-9%', status: 'Overload', state: 'red' },
      R2: { value: '4.8d', status: 'Slipping', state: 'yellow', flipBack: { value: '+0.3d vs prior', status: 'Band 4.5d to 5.0d' } },
      R3: { value: '+14%', status: 'AGI / FTE lift', state: 'green', flipBack: { value: 'Adoption 37%', status: 'Fresh 0m ago' } },
      R4: { value: '18 pts', status: 'Escalating', state: 'red', flipBack: { value: 'Driver: onboarding lag', status: '+2 pts vs prior' } },
    },
    bottomStrip: {
      left: {
        B3: { context: 'This month' },
        B4: { value: '91%', status: '-4 pts to target', state: 'yellow' },
        B5: { value: '7 / 9', status: '2 behind', state: 'yellow' },
      },
      focus: focusNowSequence[0],
      right: {
        B7: { value: '+14%', status: '-4 pts to target', state: 'green', flipBack: { value: 'Baseline +11%', status: '+3 pts vs baseline' } },
        B8: { value: '93%', status: '-2 pts to target', state: 'yellow', flipBack: { value: 'Target 95%', status: '-2 pts vs target' } },
        B9: { value: '4', status: '+2 over target', state: 'yellow', flipBack: { value: '+1 vs prior', status: 'Fresh 0m ago' } },
      },
    },
    centerViews: {
      M1: {
        hero: { support: 'AI gain +14% offsets some capacity drag', value: 18.2, targetDisplay: '24.0%', gapDisplay: '-5.8 pts', trendDisplay: '+1.4 pts MoM', driverDisplay: 'Capacity deficit -9%' },
        controls: { display: { value: '24.0%' } },
      },
      M2: {
        hero: { support: 'Pipeline cover 2.8x with $420K still stalled', value: 612, targetDisplay: '$650K', gapDisplay: '-$38K', trendDisplay: '+$24K MoM', driverDisplay: 'Conversion gap -6 pts' },
        controls: { display: { value: '$650K' } },
      },
      M3: {
        hero: { support: 'AGI / FTE +14% with cycle time still lagging 0.6d', value: 37, targetDisplay: '48%', gapDisplay: '-11 pts', trendDisplay: '+5 pts QoQ', driverDisplay: 'Adoption delta -11 pts' },
        controls: { display: { value: '48%' } },
      },
    },
  },
  {
    statusCards: {
      T3: { value: '2.9x', state: 'green' },
      T4: { value: '-5.6 pts', state: 'yellow' },
      T5: { value: '17 pts', state: 'yellow' },
      T6: { value: '92%', state: 'yellow' },
    },
    leftRailMetrics: {
      D1: { value: '18', status: '+4 vs prior', state: 'green', flipBack: { value: '+4 vs prior', status: 'Fresh 0m ago' } },
      D2: { value: '$1.84M', state: 'green', flipBack: { value: 'Target $2.00M', status: '+$90K vs prior' } },
      D3: { value: '$405K', status: 'At risk', state: 'yellow' },
      D4: { value: '34%', status: '+2 pts', state: 'green', flipBack: { value: '+2 pts', status: 'Band 32% to 36%' } },
    },
    leftStackMetrics: {
      C1: { value: '$618K', context: 'Target $650K', status: '-$32K to plan', state: 'yellow' },
      C2: { value: '42%', status: '+4 pts QoQ' },
      C3: { value: '$29K', status: 'Premium mix' },
    },
    rightStackMetrics: {
      O1: { value: '79%', status: 'On target', state: 'green' },
      O2: { value: '$18.8K', status: 'AI lift +15%' },
      O3: { value: '9.3d', status: 'Client friction up', state: 'yellow' },
    },
    rightRailMetrics: {
      R1: { value: '-8%', status: 'Overload', state: 'red' },
      R2: { value: '4.8d', status: 'Slipping', state: 'yellow', flipBack: { value: '+0.3d vs prior', status: 'Band 4.5d to 5.0d' } },
      R3: { value: '+14%', status: 'AGI / FTE lift', state: 'green', flipBack: { value: 'Adoption 37%', status: 'Fresh 0m ago' } },
      R4: { value: '18 pts', status: 'Escalating', state: 'red', flipBack: { value: 'Driver: onboarding lag', status: '+2 pts vs prior' } },
    },
    bottomStrip: {
      left: {
        B3: { context: 'This month' },
        B4: { value: '92%', status: '-3 pts to target', state: 'yellow' },
        B5: { value: '7 / 9', status: '2 behind', state: 'yellow' },
      },
      focus: focusNowSequence[1],
      right: {
        B7: { value: '+14%', status: '-4 pts to target', state: 'green', flipBack: { value: 'Baseline +11%', status: '+3 pts vs baseline' } },
        B8: { value: '93%', status: '-2 pts to target', state: 'yellow', flipBack: { value: 'Target 95%', status: '-2 pts vs target' } },
        B9: { value: '4', status: '+2 over target', state: 'yellow', flipBack: { value: '+1 vs prior', status: 'Fresh 0m ago' } },
      },
    },
    centerViews: {
      M1: {
        hero: { support: 'AI gain +15% offsets most capacity drag', value: 18.4, targetDisplay: '24.0%', gapDisplay: '-5.6 pts', trendDisplay: '+1.6 pts MoM', driverDisplay: 'Capacity deficit -8%' },
      },
      M2: {
        hero: { support: 'Pipeline cover 2.9x with $405K still stalled', value: 618, targetDisplay: '$650K', gapDisplay: '-$32K', trendDisplay: '+$29K MoM', driverDisplay: 'Conversion gap -5 pts' },
      },
      M3: {
        hero: { support: 'AGI / FTE +15% with cycle time lag down to 0.5d', value: 38, targetDisplay: '48%', gapDisplay: '-10 pts', trendDisplay: '+6 pts QoQ', driverDisplay: 'Adoption delta -10 pts' },
      },
    },
  },
  {
    statusCards: {
      T3: { value: '3.0x', state: 'green' },
      T4: { value: '-5.2 pts', state: 'yellow' },
      T5: { value: '16 pts', state: 'yellow' },
      T6: { value: '93%', state: 'yellow' },
    },
    leftRailMetrics: {
      D1: { value: '18', status: '+4 vs prior', state: 'green', flipBack: { value: '+4 vs prior', status: 'Fresh 0m ago' } },
      D2: { value: '$1.84M', state: 'green', flipBack: { value: 'Target $2.00M', status: '+$90K vs prior' } },
      D3: { value: '$380K', status: 'Contained', state: 'yellow' },
      D4: { value: '34%', status: '+2 pts', state: 'green', flipBack: { value: '+2 pts', status: 'Band 32% to 36%' } },
    },
    leftStackMetrics: {
      C1: { value: '$628K', context: 'Target $650K', status: '-$22K to plan', state: 'yellow' },
      C2: { value: '43%', status: '+5 pts QoQ' },
      C3: { value: '$29K', status: 'Premium mix' },
    },
    rightStackMetrics: {
      O1: { value: '80%', status: 'Watch threshold', state: 'yellow' },
      O2: { value: '$19.2K', status: 'AI lift +17%' },
      O3: { value: '8.9d', status: 'Client friction easing', state: 'yellow' },
    },
    rightRailMetrics: {
      R1: { value: '-7%', status: 'Overload', state: 'red' },
      R2: { value: '4.8d', status: 'Slipping', state: 'yellow', flipBack: { value: '+0.3d vs prior', status: 'Band 4.5d to 5.0d' } },
      R3: { value: '+14%', status: 'AGI / FTE lift', state: 'green', flipBack: { value: 'Adoption 37%', status: 'Fresh 0m ago' } },
      R4: { value: '18 pts', status: 'Escalating', state: 'red', flipBack: { value: 'Driver: onboarding lag', status: '+2 pts vs prior' } },
    },
    bottomStrip: {
      left: {
        B3: { context: 'This month' },
        B4: { value: '93%', status: '-2 pts to target', state: 'yellow' },
        B5: { value: '8 / 9', status: '1 behind', state: 'yellow' },
      },
      focus: focusNowSequence[2],
      right: {
        B7: { value: '+14%', status: '-4 pts to target', state: 'green', flipBack: { value: 'Baseline +11%', status: '+3 pts vs baseline' } },
        B8: { value: '93%', status: '-2 pts to target', state: 'yellow', flipBack: { value: 'Target 95%', status: '-2 pts vs target' } },
        B9: { value: '4', status: '+2 over target', state: 'yellow', flipBack: { value: '+1 vs prior', status: 'Fresh 0m ago' } },
      },
    },
    centerViews: {
      M1: {
        hero: { support: 'AI gain +17% trims more of the capacity drag', value: 18.8, targetDisplay: '24.0%', gapDisplay: '-5.2 pts', trendDisplay: '+2.0 pts MoM', driverDisplay: 'Capacity deficit -7%' },
      },
      M2: {
        hero: { support: 'Pipeline cover 3.0x with stalled work down to $380K', value: 628, targetDisplay: '$650K', gapDisplay: '-$22K', trendDisplay: '+$39K MoM', driverDisplay: 'Conversion gap -4 pts' },
      },
      M3: {
        hero: { support: 'AGI / FTE +17% with cycle time lag down to 0.3d', value: 40, targetDisplay: '48%', gapDisplay: '-8 pts', trendDisplay: '+8 pts QoQ', driverDisplay: 'Adoption delta -8 pts' },
      },
    },
  },
];

function cloneBaseDashboard() {
  return {
    statusCards: structuredClone(baseStatusCards),
    leftRailMetrics: structuredClone(baseLeftRailMetrics),
    leftStackMetrics: structuredClone(baseLeftStackMetrics),
    centerViews: structuredClone(baseCenterViews),
    rightStackMetrics: structuredClone(baseRightStackMetrics),
    rightRailMetrics: structuredClone(baseRightRailMetrics),
    bottomStrip: structuredClone(baseBottomStrip),
  };
}

function patchArrayById(items, patchMap) {
  if (!patchMap) {
    return;
  }

  items.forEach((item) => {
    const patch = patchMap[item.id];
    if (patch) {
      Object.assign(item, patch);
    }
  });
}

function getMetricItem(dashboard, tileId) {
  if (tileId.startsWith('T')) {
    return tileId === 'T2'
      ? { id: 'T2' }
      : dashboard.statusCards.find((item) => item.id === tileId);
  }

  if (tileId.startsWith('D')) {
    return dashboard.leftRailMetrics.find((item) => item.id === tileId);
  }

  if (tileId.startsWith('C')) {
    return dashboard.leftStackMetrics.find((item) => item.id === tileId);
  }

  if (tileId.startsWith('R')) {
    return dashboard.rightRailMetrics.find((item) => item.id === tileId);
  }

  if (tileId.startsWith('O')) {
    return dashboard.rightStackMetrics.find((item) => item.id === tileId);
  }

  if (tileId === 'B6') {
    return dashboard.bottomStrip.focus;
  }

  if (tileId.startsWith('B')) {
    return dashboard.bottomStrip.left.find((item) => item.id === tileId)
      ?? dashboard.bottomStrip.right.find((item) => item.id === tileId)
      ?? dashboard.bottomStrip.util.find((item) => item.id === tileId)
      ?? dashboard.bottomStrip.nav.find((item) => item.id === tileId);
  }

  return undefined;
}

function setMetricItem(dashboard, tileId, nextValue) {
  if (tileId === 'B6') {
    Object.assign(dashboard.bottomStrip.focus, nextValue);
    return;
  }

  const target = getMetricItem(dashboard, tileId);
  if (target) {
    Object.assign(target, structuredClone(nextValue));
  }
}

export function buildSimulatedDashboard(frameIndex = 0, focusIndex = 0) {
  const dashboard = cloneBaseDashboard();
  const frame = scenarioFrames[frameIndex % scenarioFrames.length];

  patchArrayById(dashboard.statusCards, frame.statusCards);
  patchArrayById(dashboard.leftRailMetrics, frame.leftRailMetrics);
  patchArrayById(dashboard.leftStackMetrics, frame.leftStackMetrics);
  patchArrayById(dashboard.rightStackMetrics, frame.rightStackMetrics);
  patchArrayById(dashboard.rightRailMetrics, frame.rightRailMetrics);
  patchArrayById(dashboard.bottomStrip.left, frame.bottomStrip?.left);
  patchArrayById(dashboard.bottomStrip.right, frame.bottomStrip?.right);
  Object.assign(dashboard.bottomStrip.focus, frame.bottomStrip?.focus ?? focusNowSequence[focusIndex % focusNowSequence.length]);

  Object.entries(frame.centerViews ?? {}).forEach(([viewId, patch]) => {
    const view = dashboard.centerViews[viewId];
    if (!view) {
      return;
    }

    if (patch.hero) {
      Object.assign(view.hero, patch.hero);
    }

    if (patch.controls?.display) {
      Object.assign(view.controls.display, patch.controls.display);
    }
  });

  return dashboard;
}

export function getFreshnessMinutes(nowMs, lastRefreshMs) {
  return Math.max(0, Math.floor((nowMs - lastRefreshMs) / FRESHNESS_MINUTE_MS));
}

export function getVisualCadenceSlot(step, activeTab) {
  const region = VISUAL_REGION_ORDER[step % VISUAL_REGION_ORDER.length];
  const lap = Math.floor(step / VISUAL_REGION_ORDER.length);

  if (region === 'top') {
    return { region, targetId: TOP_SIGNAL_SEQUENCE[lap % TOP_SIGNAL_SEQUENCE.length] };
  }

  if (region === 'left') {
    return { region, targetId: LEFT_SIGNAL_SEQUENCE[lap % LEFT_SIGNAL_SEQUENCE.length] };
  }

  if (region === 'center') {
    return { region, targetId: `${activeTab}-hero` };
  }

  if (region === 'right') {
    return { region, targetId: RIGHT_SIGNAL_SEQUENCE[lap % RIGHT_SIGNAL_SEQUENCE.length] };
  }

  return { region, targetId: BOTTOM_SIGNAL_SEQUENCE[lap % BOTTOM_SIGNAL_SEQUENCE.length] };
}

export function formatHeroValue(value, format) {
  if (format?.style === 'percent') {
    return `${value.toFixed(format.decimals)}%`;
  }

  if (format?.style === 'currencyK') {
    return `$${value.toFixed(format.decimals)}K`;
  }

  return String(value);
}

export function getScenarioFrameCount() {
  return scenarioFrames.length;
}

export function getFocusSequenceCount() {
  return focusNowSequence.length;
}

export function getAutoFlipInterval(tileId) {
  return AUTO_FLIP_INTERVALS[tileId] ?? null;
}

export function isFlipEligible(tileId) {
  return FLIP_ELIGIBLE_TILE_IDS.includes(tileId);
}

export function isThresholdColorEligible(tileId) {
  return THRESHOLD_COLOR_TILE_IDS.includes(tileId);
}

export function isLabelMutable(tileId) {
  return LABEL_MUTABLE_TILE_IDS.includes(tileId);
}

export function isPriorityOverrideTile(tileId) {
  return PRIORITY_OVERRIDE_TILE_IDS.includes(tileId);
}

export function getMetricState(dashboard, tileId, activeTab) {
  if (tileId === `${activeTab}-hero`) {
    return dashboard.centerViews[activeTab];
  }

  return getMetricItem(dashboard, tileId);
}

export function hasTileChanged(currentDashboard, targetDashboard, tileId, activeTab) {
  const currentValue = getMetricState(currentDashboard, tileId, activeTab);
  const targetValue = getMetricState(targetDashboard, tileId, activeTab);

  return JSON.stringify(currentValue) !== JSON.stringify(targetValue);
}

export function applyScheduledTileUpdate(currentDashboard, targetDashboard, tileId, activeTab) {
  const nextDashboard = structuredClone(currentDashboard);

  if (tileId === `${activeTab}-hero`) {
    nextDashboard.centerViews[activeTab] = structuredClone(targetDashboard.centerViews[activeTab]);
    return nextDashboard;
  }

  const nextValue = getMetricState(targetDashboard, tileId, activeTab);
  if (nextValue) {
    setMetricItem(nextDashboard, tileId, nextValue);
  }

  return nextDashboard;
}

export function applyActiveTabSnapshot(currentDashboard, targetDashboard, activeTab) {
  const nextDashboard = structuredClone(currentDashboard);
  nextDashboard.centerViews[activeTab] = structuredClone(targetDashboard.centerViews[activeTab]);
  return nextDashboard;
}

function scoreState(state) {
  if (state === 'red') {
    return 3;
  }

  if (state === 'yellow') {
    return 2;
  }

  return 1;
}

function hasMajorForecastDrop(currentItem, nextItem) {
  const currentValue = Number.parseInt(String(currentItem?.value).replace(/[^0-9-]/g, ''), 10);
  const nextValue = Number.parseInt(String(nextItem?.value).replace(/[^0-9-]/g, ''), 10);
  return Number.isFinite(currentValue) && Number.isFinite(nextValue) && (currentValue - nextValue) >= 12;
}

export function detectPriorityOverride(currentDashboard, targetDashboard) {
  const candidates = PRIORITY_OVERRIDE_TILE_IDS.filter((tileId) => {
    const currentItem = getMetricItem(currentDashboard, tileId);
    const nextItem = getMetricItem(targetDashboard, tileId);

    if (!currentItem || !nextItem) {
      return false;
    }

    if (tileId === 'C1') {
      return hasMajorForecastDrop(currentItem, nextItem);
    }

    return scoreState(nextItem.state) > scoreState(currentItem.state);
  });

  return candidates[0] ?? null;
}

export function getAutoFlipTargetId(step, activeTab, currentDashboard, targetDashboard, nowMs, nextAutoFlipAt, presentationMode, hasActiveFlip) {
  if (presentationMode || hasActiveFlip) {
    return null;
  }

  const slot = getVisualCadenceSlot(step, activeTab);
  const eligibleIds = REGION_FLIP_TARGETS[slot.region] ?? [];

  return eligibleIds.find((tileId) => (
    !hasTileChanged(currentDashboard, targetDashboard, tileId, activeTab)
    && (nextAutoFlipAt[tileId] ?? Number.POSITIVE_INFINITY) <= nowMs
  )) ?? null;
}
