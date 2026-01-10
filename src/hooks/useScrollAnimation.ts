'use client';

import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

// Register ScrollTrigger plugin
if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

interface ScrollAnimationOptions {
  from?: gsap.TweenVars;
  to?: gsap.TweenVars;
  start?: string;
  end?: string;
  scrub?: boolean;
  markers?: boolean;
}

/**
 * Hook for scroll-triggered animations
 * Animates element when it enters viewport
 */
export function useScrollAnimation(options: ScrollAnimationOptions = {}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ref.current) return;

    const {
      from = { opacity: 0, y: 50 },
      to = { opacity: 1, y: 0 },
      start = 'top 80%',
      end = 'top 20%',
      scrub = false,
      markers = false,
    } = options;

    const animation = gsap.fromTo(
      ref.current,
      from,
      {
        ...to,
        scrollTrigger: {
          trigger: ref.current,
          start,
          end,
          scrub,
          markers,
          toggleActions: 'play none none reverse',
        },
      }
    );

    return () => {
      animation.kill();
    };
  }, [options]);

  return ref;
}
