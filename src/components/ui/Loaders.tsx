'use client';

import { useEffect, useRef } from 'react';
import gsap from 'gsap';

/**
 * Animated Kata logo loader
 * Shows kanji 型 drawing itself
 */
export function KataLoader() {
  const pathRef = useRef<SVGPathElement>(null);

  useEffect(() => {
    if (!pathRef.current) return;

    const path = pathRef.current;
    const length = path.getTotalLength();

    // Initial state
    gsap.set(path, {
      strokeDasharray: length,
      strokeDashoffset: length,
    });

    // Animation loop
    const tl = gsap.timeline({ repeat: -1 });
    
    tl.to(path, {
      strokeDashoffset: 0,
      duration: 2,
      ease: 'power2.inOut',
    })
    .to(path, {
      strokeDashoffset: -length,
      duration: 2,
      ease: 'power2.inOut',
      delay: 0.5,
    });

    return () => {
      tl.kill();
    };
  }, []);

  return (
    <div className="flex items-center justify-center">
      <svg
        width="80"
        height="80"
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          ref={pathRef}
          d="M 20 30 L 80 30 M 50 30 L 50 70 M 30 50 L 70 50 M 35 70 L 65 70"
          stroke="var(--accent-primary)"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
}

/**
 * Pulsing dots loader
 */
export function DotsLoader() {
  const dotsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!dotsRef.current) return;

    const dots = dotsRef.current.children;

    gsap.to(dots, {
      scale: 1.5,
      opacity: 0.5,
      duration: 0.6,
      stagger: {
        each: 0.2,
        repeat: -1,
        yoyo: true,
      },
      ease: 'power2.inOut',
    });
  }, []);

  return (
    <div ref={dotsRef} className="flex items-center justify-center gap-2">
      <div className="h-3 w-3 rounded-full bg-[var(--accent-primary)]" />
      <div className="h-3 w-3 rounded-full bg-[var(--accent-primary)]" />
      <div className="h-3 w-3 rounded-full bg-[var(--accent-primary)]" />
    </div>
  );
}

/**
 * Spinning ring loader
 */
export function RingLoader({ size = 40 }: { size?: number }) {
  const ringRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ringRef.current) return;

    gsap.to(ringRef.current, {
      rotation: 360,
      duration: 1,
      repeat: -1,
      ease: 'linear',
    });
  }, []);

  return (
    <div className="flex items-center justify-center">
      <div
        ref={ringRef}
        style={{ width: size, height: size }}
        className="rounded-full border-4 border-[var(--bg-tertiary)] border-t-[var(--accent-primary)]"
      />
    </div>
  );
}

/**
 * Full page loader
 */
export function FullPageLoader() {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[var(--bg-primary)]">
      <div className="text-center">
        <KataLoader />
        <p className="mt-6 text-sm text-[var(--text-tertiary)] animate-pulse">
          Cargando tu kata...
        </p>
      </div>
    </div>
  );
}
