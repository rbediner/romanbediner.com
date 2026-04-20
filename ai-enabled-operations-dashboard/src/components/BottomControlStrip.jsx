import FocusNowTile from './FocusNowTile';
import LiveFlipTile from './LiveFlipTile';

function buildTileClass(item, liveSignalId) {
  const watchStates = ['yellow', 'red'];
  const cls = watchStates.includes(item.state) ? 'ctrl-tile ct-watch' : 'ctrl-tile';
  const stateCls =
    item.state === 'green' ? ' ct-green' :
    item.state === 'yellow' ? ' ct-yellow' :
    item.state === 'red' ? ' ct-red' :
    '';
  const centerAligned = new Set(['B3', 'B4', 'B5', 'B7', 'B8', 'B9']);
  const alignCls = centerAligned.has(item.id) ? ' ctrl-tile--center' : ' ctrl-tile--left';
  const liveCls = item.id === liveSignalId ? ' live-region-active' : '';

  return `${cls}${stateCls}${alignCls}${liveCls}`;
}

function renderMetricFace(item, face = 'front') {
  const backFace = item.flipBack ?? {};
  const isBack = face === 'back';
  const value = isBack ? (backFace.value ?? item.value) : item.value;
  const context = isBack ? undefined : item.context;
  const status = isBack ? null : item.status;

  return (
    <>
      <span className="ctrl-tile__label">{item.label}</span>
      <span className="ctrl-tile__value">{value}</span>
      {context && (
        <span className="ctrl-tile__context">{context}</span>
      )}
      {status && (
        <span className="ctrl-tile__status">{status}</span>
      )}
    </>
  );
}

function CtrlTile({
  item,
  liveSignalId,
  flipStates,
  onManualFlip,
  onFlipHover,
  presentationMode,
  onTogglePresentationMode,
}) {
  const className = buildTileClass(item, liveSignalId);

  if (item.icon) {
    const isPresentationToggle = item.id === 'B11';
    const activeClass = isPresentationToggle && presentationMode ? ' ctrl-tile--active' : '';

    return (
      <button
        type="button"
        className={`${className}${activeClass} ctrl-tile--icon`}
        aria-label={item.label}
        aria-pressed={isPresentationToggle ? presentationMode : undefined}
        data-box-id={item.id}
        data-live-region="idle"
        onClick={isPresentationToggle ? onTogglePresentationMode : undefined}
      >
        <span className={`ctrl-icon ctrl-icon--${item.icon}`} aria-hidden="true" />
      </button>
    );
  }

  if (item.flipBack) {
    return (
      <LiveFlipTile
        tileId={item.id}
        className={className}
        liveRegion={item.id === liveSignalId ? 'bottom' : 'idle'}
        isFlipped={Boolean(flipStates[item.id])}
        isInteractive={!presentationMode}
        presentationMode={presentationMode}
        onClick={() => onManualFlip(item.id)}
        onPointerEnter={() => onFlipHover(item.id, true)}
        onPointerLeave={() => onFlipHover(item.id, false)}
        renderFront={() => renderMetricFace(item, 'front')}
        renderBack={() => renderMetricFace(item, 'back')}
      />
    );
  }

  return (
    <div
      className={className}
      data-box-id={item.id}
      data-live-region={item.id === liveSignalId ? 'bottom' : 'idle'}
    >
      {renderMetricFace(item, 'front')}
    </div>
  );
}

function BottomControlStrip({
  bottomStrip,
  liveSignalId,
  flipStates,
  onManualFlip,
  onFlipHover,
  presentationMode,
  onTogglePresentationMode,
}) {
  return (
    <footer className="bottom-control-strip">
      <div className="bottom-group bottom-group--nav">
        {bottomStrip.nav.map((item) => (
          <CtrlTile
            key={item.id}
            item={item}
            liveSignalId={liveSignalId}
            flipStates={flipStates}
            onManualFlip={onManualFlip}
            onFlipHover={onFlipHover}
            presentationMode={presentationMode}
            onTogglePresentationMode={onTogglePresentationMode}
          />
        ))}
      </div>

      <div className="bottom-group bottom-group--left">
        {bottomStrip.left.map((item) => (
          <CtrlTile
            key={item.id}
            item={item}
            liveSignalId={liveSignalId}
            flipStates={flipStates}
            onManualFlip={onManualFlip}
            onFlipHover={onFlipHover}
            presentationMode={presentationMode}
            onTogglePresentationMode={onTogglePresentationMode}
          />
        ))}
      </div>

      <FocusNowTile item={bottomStrip.focus} liveSignalId={liveSignalId} />

      <div className="bottom-group bottom-group--right">
        {bottomStrip.right.map((item) => (
          <CtrlTile
            key={item.id}
            item={item}
            liveSignalId={liveSignalId}
            flipStates={flipStates}
            onManualFlip={onManualFlip}
            onFlipHover={onFlipHover}
            presentationMode={presentationMode}
            onTogglePresentationMode={onTogglePresentationMode}
          />
        ))}
      </div>

      <div className="bottom-group bottom-group--util">
        {bottomStrip.util.map((item) => (
          <CtrlTile
            key={item.id}
            item={item}
            liveSignalId={liveSignalId}
            flipStates={flipStates}
            onManualFlip={onManualFlip}
            onFlipHover={onFlipHover}
            presentationMode={presentationMode}
            onTogglePresentationMode={onTogglePresentationMode}
          />
        ))}
      </div>
    </footer>
  );
}

export default BottomControlStrip;
