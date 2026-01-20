'use client';

import { useEffect, useState } from 'react';
import Lenis from 'lenis';

/**
 * Smooth scroll hook using Lenis
 * Only activates on desktop (>768px) to preserve native mobile scroll
 */
export function useLenis() {
  /* eslint-disable react-hooks/set-state-in-effect */

  const [isClient, setIsClient] = useState(false);

  // Asegurarse de que estamos en el cliente

  useEffect(() => {
    setIsClient(true);
  }, []);  

  useEffect(() => {
    if (!isClient) return;

    const isMobile = window.innerWidth <= 768;

    if (isMobile) {
      return;
    }

    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: 'vertical',
      gestureOrientation: 'vertical',
      smoothWheel: true,
      wheelMultiplier: 1,
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
  }, [isClient]);
}
