import { useEffect, useRef, useState } from 'react';

/**
 * useCountUp
 * Smoothly animates a numeric value from 0 (or a custom start) to targetValue.
 * - requestAnimationFrame based (60fps budget friendly)
 * - easeOutCubic easing
 * - cancels on unmount / target change
 */
export function useCountUp(targetValue: number, options?: { duration?: number; start?: number }) {
  const { duration = 1500, start = 0 } = options || {};
  const [currentValue, setCurrentValue] = useState(start);
  const rafRef = useRef<number | null>(null);
  const startTimeRef = useRef<number | null>(null);

  useEffect(() => {
    const animate = (timestamp: number) => {
      if (startTimeRef.current == null) startTimeRef.current = timestamp;
      const elapsed = timestamp - startTimeRef.current;
      const progress = Math.min(elapsed / duration, 1);
      const easeOutCubic = 1 - Math.pow(1 - progress, 3);
      const next = start + (targetValue - start) * easeOutCubic;
      setCurrentValue(Math.floor(next));
      if (progress < 1) rafRef.current = requestAnimationFrame(animate);
    };

    // reset
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    startTimeRef.current = null;
    setCurrentValue(start);
    rafRef.current = requestAnimationFrame(animate);

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [targetValue, duration, start]);

  return currentValue;
}

export default useCountUp;
