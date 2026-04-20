/* O1 Utilization — Stable (healthy range)
   O2 AGI/FTE — Stable with AI leverage called out
   O3 Onboarding — Watch (friction) */

const stackStateMap = {
  green:  'st-stable  tile tile-stable tile-green',
  yellow: 'st-watch   tile tile-watch',
  red:    'st-pressure tile tile-pressure',
  slate:  'st-stable  tile tile-stable',
};

function RightStack({ metrics, liveSignalId }) {
  return (
    <div className="column-stack">
      {metrics.map((item) => {
        const sc = stackStateMap[item.state] ?? 'st-stable tile tile-stable';
        /* O3 Onboarding: customer friction is a first-class operating concern */
        const onboardingCls = item.id === 'O3' ? ' st-onboarding' : '';
        const liveCls = item.id === liveSignalId ? ' live-region-active' : '';
        return (
          <div
            key={item.id}
            className={`stack-tile ${sc}${onboardingCls}${liveCls}`}
            data-box-id={item.id}
            data-live-region={item.id === liveSignalId ? 'right' : 'idle'}
          >
            <span className="stack-tile__label">{item.label}</span>
            <span className="stack-tile__value">{item.value}</span>
            {item.context && (
              <span className="stack-tile__context">{item.context}</span>
            )}
            {item.status && (
              <span className="stack-tile__status">{item.status}</span>
            )}
          </div>
        );
      })}
    </div>
  );
}

export default RightStack;
