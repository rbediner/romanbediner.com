function FocusNowTile({ item, liveSignalId }) {
  const liveCls = item.id === liveSignalId ? ' live-region-active' : '';

  return (
    <div
      className={`focus-now-tile${liveCls}`}
      data-box-id={item.id}
      data-live-region={item.id === liveSignalId ? 'bottom' : 'idle'}
    >
      <span className="focus-now-tile__label">{item.label}</span>
      <span className="focus-now-tile__value">{item.value}</span>
      <span className="focus-now-tile__sub">{item.subtext}</span>
    </div>
  );
}

export default FocusNowTile;
