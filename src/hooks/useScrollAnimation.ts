'use client';

import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

interface GSAPValue {
  opacity?: number;
  y?: number;
  x?: number;
  scale?: number;
}

interface UseScrollAnimationOptions {
  from: GSAPValue;
  to: GSAPValue;
  delay?: number;
  duration?: number;
  ease?: string;
}

export function useScrollAnimation<T extends HTMLElement>(
  options: UseScrollAnimationOptions
) {
  const elementRef = useRef<T>(null);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        element,
        options.from,
        {
          ...options.to,
          duration: options.duration || 0.8,
          delay: options.delay || 0,
          ease: options.ease || 'power2.out',
          scrollTrigger: {
            trigger: element,
            start: 'top 85%',
            toggleActions: 'play none none none',
          },
        }
      );
    }, element);

    return () => ctx.revert();
  }, [options]);

  return elementRef;
}
