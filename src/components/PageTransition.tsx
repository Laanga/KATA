'use client';

import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import gsap from 'gsap';

/**
 * Page transition component
 * Animates in/out when route changes
 */
export function PageTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Page enter animation
    gsap.fromTo(
      contentRef.current,
      {
        opacity: 0,
        y: 20,
      },
      {
        opacity: 1,
        y: 0,
        duration: 0.5,
        ease: 'power2.out',
      }
    );

    // Scroll to top on route change
    window.scrollTo(0, 0);
  }, [pathname]);

  return (
    <div ref={contentRef} className="will-change-transform">
      {children}
    </div>
  );
}
