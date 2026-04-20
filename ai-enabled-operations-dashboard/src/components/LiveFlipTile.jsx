function LiveFlipTile({
  tileId,
  className,
  liveRegion,
  isFlipped,
  isInteractive,
  presentationMode,
  onClick,
  onPointerEnter,
  onPointerLeave,
  renderFront,
  renderBack,
}) {
  const sharedProps = {
    className: `${className} flip-tile ${isFlipped ? 'is-flipped' : ''}`,
    'data-box-id': tileId,
    'data-live-region': liveRegion,
    'data-flip-eligible': 'true',
    'data-flipped': isFlipped ? 'true' : 'false',
    'data-presentation-mode': presentationMode ? 'true' : 'false',
    onPointerEnter,
    onPointerLeave,
    onClick,
  };

  const body = (
    <>
      <span className="flip-tile__cue" aria-hidden="true" />
      <span className="flip-tile__surface">
        <span className="flip-tile__face flip-tile__face--front">
          {renderFront()}
        </span>
        <span className="flip-tile__face flip-tile__face--back">
          {renderBack()}
        </span>
      </span>
    </>
  );

  if (isInteractive) {
    return (
      <button type="button" {...sharedProps}>
        {body}
      </button>
    );
  }

  return (
    <div {...sharedProps}>
      {body}
    </div>
  );
}

export default LiveFlipTile;
