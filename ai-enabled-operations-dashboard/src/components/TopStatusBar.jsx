function TopStatusBar({ now, freshnessMinutes, activeLensLabel, statusCards, liveSignalId, isFullscreen, onToggleFullscreen }) {
  const day = now.toLocaleDateString('en-US', { weekday: 'long' }).toUpperCase();
  const time = now.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });

  const stateClass = { green: 's-green', yellow: 's-yellow', red: 's-red' };
  const freshnessClasses = liveSignalId === 'T2'
    ? 'freshness-panel live-region-active'
    : 'freshness-panel';

  return (
    <header className="top-status-bar">
      <div className="logo-panel" data-box-id="T1">
        <div className="logo-panel__copy">
          <span className="logo-panel__eyebrow">AI-Enabled</span>
          <span className="logo-panel__name">Operations Dashboard</span>
        </div>
      </div>

      <div className={freshnessClasses} data-box-id="T2" data-live-region={liveSignalId === 'T2' ? 'top' : 'idle'}>
        <div className="freshness-panel__primary">
          <span className="freshness-panel__day">{day}</span>
          <span className="freshness-panel__time">{time}</span>
        </div>

        <div className="freshness-panel__secondary freshness-panel__secondary--stacked">
          <span className="telemetry-token telemetry-token--mode">
            <span className="telemetry-key">Lens</span>
            <span className="telemetry-val freshness-panel__mode">{activeLensLabel}</span>
          </span>
          <span className="telemetry-token telemetry-token--live">
            <span className="signal-heartbeat" aria-hidden="true" />
            <span className="telemetry-key telemetry-key--live">LIVE</span>
            <span className="telemetry-val">{freshnessMinutes}m ago</span>
          </span>
        </div>
      </div>

      <div className="status-badge-grid">
        {statusCards.map((item) => (
          <div
            key={item.id}
            className={`status-badge ${stateClass[item.state] ?? ''}${item.id === liveSignalId ? ' live-region-active' : ''}`}
            data-box-id={item.id}
            data-live-region={item.id === liveSignalId ? 'top' : 'idle'}
          >
            <span className="status-badge__label">{item.label}</span>
            <span className="status-badge__value">{item.value}</span>
            <span className="status-badge__dot" />
          </div>
        ))}
      </div>

      <button
        type="button"
        className="fullscreen-toggle"
        aria-label={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
        onClick={onToggleFullscreen}
      >
        <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true">
          {isFullscreen ? (
            <path d="M6 2v2H4v2H2V2h4zm4 0h4v4h-2V4h-2V2zM6 14v-2H4v-2H2v4h4zm4 0h4v-4h-2v2h-2v2z" fill="currentColor" />
          ) : (
            <path d="M2 2h4v2H4v2H2V2zm8 0h4v4h-2V4h-2V2zM2 10h2v2h2v2H2v-4zm10 0h2v4h-4v-2h2v-2z" fill="currentColor" />
          )}
        </svg>
      </button>
    </header>
  );
}

export default TopStatusBar;
