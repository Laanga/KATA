'use client';

import { useRef, useEffect, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { cn } from '@/lib/utils/cn';

// Register ScrollTrigger
if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

interface FadeInProps {
  children: React.ReactNode;
  delay?: number;
  duration?: number;
  direction?: 'up' | 'down' | 'left' | 'right' | 'none';
  className?: string;
  scrollTrigger?: boolean;
}

/**
 * Fade in animation component
 * Animates children on mount
 */
export function FadeIn({
  children,
  delay = 0,
  duration = 0.6,
  direction = 'up',
  className,
  scrollTrigger = false
}: FadeInProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [isClient, setIsClient] = useState(false);

  // Asegurarse de que estamos en el cliente antes de animar
  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (!ref.current || !isClient) return;

    const directionMap = {
      up: { y: 30 },
      down: { y: -30 },
      left: { x: 30 },
      right: { x: -30 },
      none: {},
    };

    const animation = gsap.fromTo(
      ref.current,
      {
        opacity: 0,
        ...directionMap[direction],
      },
      {
        opacity: 1,
        x: 0,
        y: 0,
        duration,
        delay,
        ease: 'power2.out',
        ...(scrollTrigger && {
          scrollTrigger: {
            trigger: ref.current,
            start: 'top 85%',
            end: 'bottom 15%',
            toggleActions: 'play none none reverse',
          },
        }),
      }
    );

    return () => {
      if (scrollTrigger) {
        animation.scrollTrigger?.kill();
      }
      animation.kill();
    };
  }, [delay, duration, direction, scrollTrigger, isClient]);

  // En el servidor, renderizar sin estilos de animación
  if (!isClient) {
    return (
      <div className={className}>
        {children}
      </div>
    );
  }

  return (
    <div ref={ref} className={cn('will-change-transform', className)}>
      {children}
    </div>
  );
}
