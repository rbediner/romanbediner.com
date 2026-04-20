import { useEffect, useMemo, useState } from 'react';
import { formatHeroValue } from '../live/dashboardLiveModel';
import { useAnimatedNumber } from '../live/useAnimatedNumber';

function buildHeroKey(hero, controls) {
  return [
    hero.eyebrow,
    hero.title,
    hero.support,
    hero.value,
    hero.targetDisplay,
    hero.gapDisplay,
    hero.trendDisplay,
    hero.driverDisplay,
    controls.display.label,
    controls.display.value,
  ].join('|');
}

function HeroMarginDial({ hero, controls, heroSignalId, liveSignalId }) {
  const [displayHero, setDisplayHero] = useState(hero);
  const [displayControls, setDisplayControls] = useState(controls);
  const [transitionState, setTransitionState] = useState('is-entered');
  const heroKey = useMemo(() => buildHeroKey(hero, controls), [controls, hero]);
  const animatedValue = useAnimatedNumber(displayHero.value, 700);

  useEffect(() => {
    setTransitionState('is-leaving');

    const swapTimer = window.setTimeout(() => {
      setDisplayHero(hero);
      setDisplayControls(controls);
      setTransitionState('is-entering');
    }, 120);

    const settleTimer = window.setTimeout(() => {
      setTransitionState('is-entered');
    }, 300);

    return () => {
      window.clearTimeout(swapTimer);
      window.clearTimeout(settleTimer);
    };
  }, [heroKey, hero, controls]);

  const circumference = 2 * Math.PI * 130;
  const progress = Math.min(hero.value / hero.target, 1);
  const dashOffset = circumference * (1 - progress);
  const isLiveRegion = heroSignalId === liveSignalId;

  return (
    <div className="hero-zone">
      <div
        className={`hero-dial ${isLiveRegion ? 'live-region-active' : ''}`}
        data-box-id={hero.id}
        data-live-region={isLiveRegion ? 'center' : 'idle'}
      >
        <svg viewBox="0 0 320 320" className="hero-dial__svg" aria-hidden="true">
          <defs>
            <linearGradient id="ringGradient" x1="0%" x2="100%" y1="0%" y2="100%">
              <stop offset="0%" stopColor="#f2d24b" />
              <stop offset="55%" stopColor="#e8a020" />
              <stop offset="100%" stopColor="#ff9520" />
            </linearGradient>
          </defs>
          <circle className="hero-dial__track" cx="160" cy="160" r="130" />
          <circle
            className="hero-dial__progress"
            cx="160"
            cy="160"
            r="130"
            strokeDasharray={circumference}
            strokeDashoffset={dashOffset}
          />
        </svg>

        <div className={`hero-dial__content ${transitionState}`}>
          <span className="hero-dial__eyebrow">{displayHero.eyebrow}</span>
          <span className="hero-dial__title">{displayHero.title}</span>
          <span className="hero-dial__support">{displayHero.support}</span>
          <strong className="hero-dial__value">
            {formatHeroValue(animatedValue, displayHero.valueFormat)}
          </strong>

          <div className="hero-dial__context-block">
            <div className="hero-dial__context-row">
              <span className="hero-dial__ctx-label">Target</span>
              <span className="hero-dial__ctx-value">{displayHero.targetDisplay}</span>
            </div>
            <div className="hero-dial__context-row">
              <span className="hero-dial__ctx-label">Gap</span>
              <span className="hero-dial__ctx-value hero-dial__ctx-value--gap">{displayHero.gapDisplay}</span>
            </div>
            <div className="hero-dial__context-row">
              <span className="hero-dial__ctx-label">Trend</span>
              <span className="hero-dial__ctx-value hero-dial__ctx-value--trend">{displayHero.trendDisplay}</span>
            </div>
            <div className="hero-dial__context-row hero-dial__context-row--driver">
              <span className="hero-dial__ctx-label">{displayHero.driverLabel}</span>
              <span className="hero-dial__ctx-value hero-dial__ctx-value--driver">{displayHero.driverDisplay}</span>
            </div>
          </div>
        </div>
      </div>

      <div className={`hero-controls ${transitionState}`}>
        <div
          className="hero-control hero-control--adj hero-control--disabled"
          aria-label={displayControls.minus.label}
          data-box-id={displayControls.minus.id}
        >
          <span className="hero-control__label">Adj</span>
          <strong className="hero-control__ghost">-</strong>
        </div>

        <div className="hero-control hero-control--display" data-box-id={displayControls.display.id}>
          <span className="hero-control__label">{displayControls.display.label}</span>
          <strong>{displayControls.display.value}</strong>
        </div>

        <div
          className="hero-control hero-control--adj hero-control--disabled"
          aria-label={displayControls.plus.label}
          data-box-id={displayControls.plus.id}
        >
          <span className="hero-control__label">Adj</span>
          <strong className="hero-control__ghost">-</strong>
        </div>
      </div>
    </div>
  );
}

export default HeroMarginDial;
