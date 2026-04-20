/* Locked base data for the executive dashboard.
   The live engine layers cadence and small scenario shifts on top of this stable business story. */

export const statusCards = [
  { id: 'T3', label: 'Pipeline Cov', value: '2.8x', state: 'green' },
  { id: 'T4', label: 'Margin Gap', value: '-5.8 pts', state: 'yellow' },
  { id: 'T5', label: 'Client Friction', value: '18 pts', state: 'red' },
  { id: 'T6', label: 'Cash Conv', value: '91%', state: 'yellow' },
];

export const leftRailMetrics = [
  {
    id: 'D1',
    label: 'New Opps',
    value: '18',
    status: '+4 vs prior',
    state: 'green',
    flipBack: {
      value: '+4 vs prior',
    },
  },
  {
    id: 'D2',
    label: 'Pipeline',
    value: '$1.84M',
    status: 'Weighted',
    state: 'green',
    flipBack: {
      value: '+$90K vs prior',
    },
  },
  { id: 'D3', label: 'Stalled', value: '$420K', status: 'At risk', state: 'yellow' },
  {
    id: 'D4',
    label: 'Conv Rate',
    value: '34%',
    status: '+2 pts',
    state: 'green',
    flipBack: {
      value: 'Band 32–36%',
    },
  },
];

export const leftStackMetrics = [
  {
    id: 'C1',
    label: 'Forecast',
    value: '$612K',
    context: 'Target $650K',
    status: '-$38K to plan',
    state: 'yellow',
  },
  {
    id: 'C2',
    label: 'Close Rate',
    value: '41%',
    context: 'This quarter',
    status: '+3 pts QoQ',
    state: 'green',
  },
  {
    id: 'C3',
    label: 'Avg Deal',
    value: '$28K',
    context: 'Last 30 days',
    status: 'Premium mix',
    state: 'green',
  },
];

export const centerViews = {
  M1: {
    id: 'M1',
    lensLabel: 'Margin',
    eyebrow: 'Margin Lens',
    title: 'Operating Margin',
    hero: {
      id: 'H1',
      eyebrow: 'Margin Lens',
      title: 'Operating Margin',
      support: 'AI gain +14% offsets some capacity drag',
      value: 18.2,
      valueFormat: { style: 'percent', decimals: 1 },
      target: 24.0,
      targetDisplay: '24.0%',
      gapDisplay: '-5.8 pts',
      trendDisplay: '+1.4 pts MoM',
      driverLabel: 'Driver',
      driverDisplay: 'Capacity deficit -9%',
      state: 'yellow',
    },
    controls: {
      minus: { id: 'H2', label: 'Lower Target' },
      display: { id: 'H3', label: 'Margin Target', value: '24.0%' },
      plus: { id: 'H4', label: 'Raise Target' },
    },
  },
  M2: {
    id: 'M2',
    lensLabel: 'Revenue',
    eyebrow: 'Revenue Lens',
    title: 'Revenue Forecast',
    hero: {
      id: 'H1',
      eyebrow: 'Revenue Lens',
      title: 'Revenue Forecast',
      support: 'Pipeline cover 2.8x with $420K still stalled',
      value: 612,
      valueFormat: { style: 'currencyK', decimals: 0 },
      target: 650,
      targetDisplay: '$650K',
      gapDisplay: '-$38K',
      trendDisplay: '+$24K MoM',
      driverLabel: 'Driver',
      driverDisplay: 'Conversion gap -6 pts',
      state: 'yellow',
    },
    controls: {
      minus: { id: 'H2', label: 'Lower Target' },
      display: { id: 'H3', label: 'Revenue Target', value: '$650K' },
      plus: { id: 'H4', label: 'Raise Target' },
    },
  },
  M3: {
    id: 'M3',
    lensLabel: 'AI',
    eyebrow: 'AI Lens',
    title: 'AI Leverage',
    hero: {
      id: 'H1',
      eyebrow: 'AI Lens',
      title: 'AI Leverage',
      support: 'AGI / FTE +14% with cycle time still lagging 0.6d',
      value: 37,
      valueFormat: { style: 'percent', decimals: 0 },
      target: 48,
      targetDisplay: '48%',
      gapDisplay: '-11 pts',
      trendDisplay: '+5 pts QoQ',
      driverLabel: 'Driver',
      driverDisplay: 'Adoption delta -11 pts',
      state: 'green',
    },
    controls: {
      minus: { id: 'H2', label: 'Lower Target' },
      display: { id: 'H3', label: 'AI Target', value: '48%' },
      plus: { id: 'H4', label: 'Raise Target' },
    },
  },
};

export const rightStackMetrics = [
  {
    id: 'O1',
    label: 'Utilization',
    value: '78%',
    context: 'Efficiency band',
    status: 'On target',
    state: 'green',
  },
  {
    id: 'O2',
    label: 'AGI / FTE',
    value: '$18.6K',
    context: 'Monthly AGI',
    status: 'AI lift +14%',
    state: 'green',
  },
  {
    id: 'O3',
    label: 'Onboarding',
    value: '9.5d',
    context: 'Days to milestone',
    status: 'Client friction up',
    state: 'yellow',
  },
];

export const rightRailMetrics = [
  { id: 'R1', label: 'Capacity', value: '-9%', status: 'Overload', state: 'red' },
  {
    id: 'R2',
    label: 'Cycle Time',
    value: '4.8d',
    status: 'Slipping',
    state: 'yellow',
    flipBack: {
      value: '+0.3d vs prior',
    },
  },
  {
    id: 'R3',
    label: 'AI Gain',
    value: '+14%',
    status: 'AGI / FTE lift',
    state: 'green',
    flipBack: {
      value: 'Adoption 37%',
    },
  },
  {
    id: 'R4',
    label: 'Client Friction',
    value: '18 pts',
    status: 'Escalating',
    state: 'red',
    flipBack: {
      value: '+2 pts vs prior',
    },
  },
];

export const bottomStrip = {
  nav: [
    { id: 'B1', label: 'Home', icon: 'home' },
    { id: 'B2', label: 'Back', icon: 'back' },
  ],
  left: [
    { id: 'B3', label: 'Rev Target', value: '$650K', context: 'This month', status: 'Forecast $612K', state: 'slate' },
    { id: 'B4', label: 'Cash Conv', value: '91%', context: 'Target 95%', status: '-4 pts to target', state: 'yellow' },
    { id: 'B5', label: 'Rocks On Track', value: '7 / 9', context: 'Target 9', status: '2 behind', state: 'yellow' },
  ],
  focus: {
    id: 'B6',
    label: 'Focus Now',
    value: 'Margin + Capacity',
    subtext: '3 priority actions',
    state: 'alert',
  },
  right: [
    {
      id: 'B7',
      label: 'AI Gain',
      value: '+14%',
      context: 'Target +18%',
      status: '-4 pts to target',
      state: 'green',
      flipBack: {
        value: '+3 pts vs baseline',
      },
    },
    {
      id: 'B8',
      label: 'SLA Met',
      value: '93%',
      context: 'Target 95%',
      status: '-2 pts to target',
      state: 'yellow',
      flipBack: {
        value: '-2 pts vs target',
      },
    },
    {
      id: 'B9',
      label: 'Escalations',
      value: '4',
      context: 'Target <=2',
      status: '+2 over target',
      state: 'yellow',
      flipBack: {
        value: '+1 vs prior',
      },
    },
  ],
  util: [
    { id: 'B10', label: 'Alerts', icon: 'alerts' },
    { id: 'B11', label: 'Present', icon: 'screen' },
  ],
};

export const lensTabs = [
  { id: 'M1', label: 'Margin', accent: 'yellow' },
  { id: 'M2', label: 'Revenue', accent: 'cyan' },
  { id: 'M3', label: 'AI', accent: 'green' },
];
