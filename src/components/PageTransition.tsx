'use client';

import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';

/**
 * Page transition component
 * Animates in when the route changes. Uses the Web Animations API instead of GSAP so the
 * root layout does not ship GSAP to every page, and skips the first render so the
 * server-rendered content is visible immediately instead of fading in again.
 */
export function PageTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const contentRef = useRef<HTMLDivElement>(null);
  const previousPath = useRef<string | null>(null);

  useEffect(() => {
    const isFirstRender = previousPath.current === null;
    previousPath.current = pathname;
    if (isFirstRender) return;

    // Scroll to top on route change
    window.scrollTo(0, 0);

    const element = contentRef.current;
    if (!element || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    // Page enter animation with scale and fade (same curve as GSAP's power3.out)
    const animation = element.animate(
      [
        { opacity: 0, transform: 'translateY(30px) scale(0.95)' },
        { opacity: 1, transform: 'translateY(0) scale(1)' },
      ],
      { duration: 600, easing: 'cubic-bezier(0.215, 0.61, 0.355, 1)' },
    );
    return () => animation.cancel();
  }, [pathname]);

  return (
    <div ref={contentRef} className="will-change-transform">
      {children}
    </div>
  );
}
