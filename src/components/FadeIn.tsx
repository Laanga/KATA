'use client';

import { useRef, useEffect } from 'react';
import gsap from 'gsap';
import { cn } from '@/lib/utils/cn';

interface FadeInProps {
  children: React.ReactNode;
  delay?: number;
  duration?: number;
  direction?: 'up' | 'down' | 'left' | 'right' | 'none';
  className?: string;
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
  className 
}: FadeInProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ref.current) return;

    const directionMap = {
      up: { y: 30 },
      down: { y: -30 },
      left: { x: 30 },
      right: { x: -30 },
      none: {},
    };

    gsap.fromTo(
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
      }
    );
  }, [delay, duration, direction]);

  return (
    <div ref={ref} className={cn('will-change-transform', className)}>
      {children}
    </div>
  );
}
