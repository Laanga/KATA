'use client';

import { useEffect, useState } from 'react';
import Lenis from 'lenis';

/**
 * Smooth scroll hook using Lenis
 * Only activates on desktop (>768px) to preserve native mobile scroll
 */
export function useLenis() {
  const [isClient, setIsClient] = useState(false);

  // Asegurarse de que estamos en el cliente
  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (!isClient) return;

    const isMobile = window.innerWidth <= 768;

    const lenis = new Lenis({
      duration: isMobile ? 0.8 : 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: 'vertical',
      gestureOrientation: 'vertical',
      smoothWheel: !isMobile,
      wheelMultiplier: 1,
      touchMultiplier: isMobile ? 1.5 : 2,
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
  }, [isClient]);
}
