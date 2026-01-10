'use client';

import { useEffect } from 'react';
import Lenis from 'lenis';

/**
 * Smooth scroll hook using Lenis
 * Only activates on desktop (>768px) to preserve native mobile scroll
 */
export function useLenis() {
  useEffect(() => {
    // Only enable on desktop
    if (typeof window === 'undefined' || window.innerWidth <= 768) {
      return;
    }

    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: 'vertical',
      gestureOrientation: 'vertical',
      smoothWheel: true,
      wheelMultiplier: 1,
      smoothTouch: false, // Important: disable on touch devices
      touchMultiplier: 2,
      infinite: false,
    });

    function raf(time: number) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }

    requestAnimationFrame(raf);

    // Cleanup
    return () => {
      lenis.destroy();
    };
  }, []);
}
