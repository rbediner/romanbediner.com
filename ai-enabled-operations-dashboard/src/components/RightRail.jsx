import LiveFlipTile from './LiveFlipTile';

const stateMap = {
  green: 'rt-green tile-stable tile-green',
  yellow: 'rt-pressure tile-pressure',
  red: 'rt-critical tile-critical',
  slate: 'rt-stable tile-stable',
};

function renderTileFace(item, face = 'front') {
  const backFace = item.flipBack ?? {};
  const isBack = face === 'back';
  const value = isBack ? (backFace.value ?? item.value) : item.value;
  const status = isBack ? null : item.status;

  return (
    <>
      <span className="rail-tile__value">{value}</span>
      <span className="rail-tile__label">{item.label}</span>
      {status && (
        <span className="rail-tile__status">{status}</span>
      )}
    </>
  );
}

function RightRail({ metrics, liveSignalId, flipStates, onManualFlip, onFlipHover, presentationMode }) {
  return (
    <div className="column-rail">
      {metrics.map((item) => {
        const sc = stateMap[item.state] ?? 'rt-stable tile-stable';
        const liveCls = item.id === liveSignalId ? ' live-region-active' : '';
        const riskCls = item.id === 'R4' ? ' rail-tile--client-risk' : '';
        const className = `rail-tile ${sc}${riskCls}${liveCls}`;

        if (item.flipBack) {
          return (
            <LiveFlipTile
              key={item.id}
              tileId={item.id}
              className={className}
              liveRegion={item.id === liveSignalId ? 'right' : 'idle'}
              isFlipped={Boolean(flipStates[item.id])}
              isInteractive={!presentationMode}
              presentationMode={presentationMode}
              onClick={() => onManualFlip(item.id)}
              onPointerEnter={() => onFlipHover(item.id, true)}
              onPointerLeave={() => onFlipHover(item.id, false)}
              renderFront={() => renderTileFace(item, 'front')}
              renderBack={() => renderTileFace(item, 'back')}
            />
          );
        }

        return (
          <div
            key={item.id}
            className={className}
            data-box-id={item.id}
            data-live-region={item.id === liveSignalId ? 'right' : 'idle'}
          >
            {renderTileFace(item, 'front')}
          </div>
        );
      })}
    </div>
  );
}

export default RightRail;
