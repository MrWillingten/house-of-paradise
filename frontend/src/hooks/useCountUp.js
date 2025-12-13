import { useState, useEffect } from 'react';

export const useCountUp = (end, duration = 2000, start = 0, shouldAnimate = false) => {
  const [count, setCount] = useState(start);

  useEffect(() => {
    if (!shouldAnimate) return;

    let startTime;
    const step = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const progress = timestamp - startTime;
      const percentage = Math.min(progress / duration, 1);

      // Easing function for smooth animation
      const easeOutQuart = 1 - Math.pow(1 - percentage, 4);
      setCount(Math.floor(start + (end - start) * easeOutQuart));

      if (percentage < 1) {
        requestAnimationFrame(step);
      }
    };

    requestAnimationFrame(step);
  }, [shouldAnimate, end, duration, start]);

  return count;
};
