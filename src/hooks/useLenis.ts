'use client';

import { useEffect } from 'react';

/**
 * Smooth scroll hook using Lenis
 * Only activates on desktop (>768px) to preserve native mobile scroll.
 * Lenis is loaded on demand so mobile and reduced-motion visitors never download it.
 */
export function useLenis() {
  useEffect(() => {
    const isMobile = window.innerWidth <= 768;

    if (isMobile || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return;
    }

    let cancelled = false;
    let frame = 0;
    let lenis: import('lenis').default | null = null;

    void import('lenis').then(({ default: Lenis }) => {
      if (cancelled) return;
      lenis = new Lenis({
        duration: 1.2,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        orientation: 'vertical',
        gestureOrientation: 'vertical',
        smoothWheel: true,
        wheelMultiplier: 1,
        touchMultiplier: 2,
        infinite: false,
      });

      const raf = (time: number) => {
        lenis?.raf(time);
        frame = requestAnimationFrame(raf);
      };

      frame = requestAnimationFrame(raf);
    });

    // Cleanup
    return () => {
      cancelled = true;
      cancelAnimationFrame(frame);
      lenis?.destroy();
    };
  }, []);
}
