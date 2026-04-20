import { useEffect, useRef, useState } from 'react';

/* The hero number should move smoothly when the value changes, but stay restrained.
   This hook keeps the format stable while interpolating over a fixed duration. */
function easeOutCubic(progress) {
  return 1 - ((1 - progress) ** 3);
}

export function useAnimatedNumber(targetValue, durationMs = 700) {
  const frameRef = useRef(0);
  const currentValueRef = useRef(targetValue);
  const [displayValue, setDisplayValue] = useState(targetValue);

  useEffect(() => {
    currentValueRef.current = displayValue;
  }, [displayValue]);

  useEffect(() => {
    const start = performance.now();
    const startValue = currentValueRef.current;
    const delta = targetValue - startValue;

    cancelAnimationFrame(frameRef.current);

    /* Skip the animation if the value is unchanged.
       This avoids subtle shimmer from unnecessary recomputes. */
    if (Math.abs(delta) < 0.001) {
      setDisplayValue(targetValue);
      currentValueRef.current = targetValue;
      return undefined;
    }

    const step = (timestamp) => {
      const progress = Math.min(1, (timestamp - start) / durationMs);
      const eased = easeOutCubic(progress);
      const nextValue = startValue + (delta * eased);
      setDisplayValue(nextValue);

      if (progress < 1) {
        frameRef.current = requestAnimationFrame(step);
      } else {
        currentValueRef.current = targetValue;
      }
    };

    frameRef.current = requestAnimationFrame(step);

    return () => cancelAnimationFrame(frameRef.current);
  }, [durationMs, targetValue]);

  return displayValue;
}
