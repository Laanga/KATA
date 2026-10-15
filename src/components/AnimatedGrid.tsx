'use client';

import { useRef, useEffect, useState } from 'react';
import gsap from 'gsap';
import { cn } from '@/lib/utils/cn';

const MAX_ANIMATED_ITEMS = 24;

interface AnimatedGridProps {
  children: React.ReactNode;
  className?: string;
  staggerDelay?: number;
  animateOnMount?: boolean;
}

/**
 * Grid with stagger animation
 * Children fade in with cascading effect
 */
export function AnimatedGrid({
  children,
  className,
  staggerDelay = 0.05,
  animateOnMount = true,
}: AnimatedGridProps) {
  const gridRef = useRef<HTMLDivElement>(null);
  const [isClient, setIsClient] = useState(false);

  /* eslint-disable react-hooks/set-state-in-effect */

  // Asegurarse de que estamos en el cliente

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (!animateOnMount || !gridRef.current || !isClient) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    // Solo las primeras filas, que son las visibles al entrar: con bibliotecas grandes el
    // escalonado dejaba cientos de tarjetas invisibles durante segundos.
    const items = Array.from(gridRef.current.children).slice(0, MAX_ANIMATED_ITEMS);

    // Initial state
    gsap.set(items, {
      opacity: 0,
      y: 30,
      scale: 0.95,
    });

    // Stagger animation
    gsap.to(items, {
      opacity: 1,
      y: 0,
      scale: 1,
      duration: 0.6,
      stagger: staggerDelay,
      ease: 'power2.out',
      delay: 0.1,
    });
  }, [animateOnMount, staggerDelay, isClient]);

  return (
    <div
      ref={gridRef}
      className={cn(
        'grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4 lg:gap-6',
        className,
      )}
    >
      {children}
    </div>
  );
}
